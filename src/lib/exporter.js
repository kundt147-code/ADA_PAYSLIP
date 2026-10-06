import {hasData,activeTypes,insuranceAmount,branchCode,employeeBranches,selectInsuranceBranch} from './payroll-policy.js'
import {addPayrollSummaries} from './payroll-summaries.js'
import { writeExcelBuffer } from './xlsx-output.js'
import ExcelJS from 'exceljs'
import JSZip from 'jszip'

const TEMPLATE = '/payslip-template.xlsx'
const TEMPLATE_SHEETS = { teacher: 'GV', office: 'VP', transfer: 'CK', teacherBH: 'GV_BH', officeBH: 'VP_BH' }
const MONEY_FMT = '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)'

const n = v => Number.isFinite(Number(v)) ? Number(v) : 0
const money = v => Math.round(n(v))
const setValue = (ws, cell, value) => { ws.getCell(cell).value = value ?? '' }
const setMoney = (ws, cell, value) => {
  const c = ws.getCell(cell)
  c.value = value === '' || value == null ? '' : money(value)
  if(!c.numFmt||c.numFmt==='General')c.numFmt=MONEY_FMT
}
const clearCell = (ws, cell) => { ws.getCell(cell).value = ''; }

function periodParts(period) {
  const [year, month] = String(period || '').split('-')
  return {year:/^\d{4}-\d{2}$/.test(String(period))?year:'',month:/^\d{4}-\d{2}$/.test(String(period))?month:''}
}
function dayName(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  return ['CN', 'THU 2', 'THU 3', 'THU 4', 'THU 5', 'THU 6', 'THU 7'][d.getDay()]
}
function displayDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = String(dateStr).split('-')
  return y && m && d ? `${Number(d)}/${Number(m)}/${y}` : String(dateStr)
}
function hasPct(className) { return /%/.test(String(className || '')) }
function normalizePersonName(value) {
  return String(value ?? '').normalize('NFC')
    .trim()
    .replace(/^(mr\.?|mrs\.?|ms\.?|miss\.?|dr\.?)\s+/i, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('vi-VN')
}
function samePerson(a, b) { return normalizePersonName(a) === normalizePersonName(b) }
function effectiveRate(rate, className, employee, mode='') {
  const name = String(className || '')
  if (mode === 'teacher' && employee?.salary?.special4 && hasPct(name)) return 170000
  if (employee?.salary?.special3 && /IELTS\s*-\s*56%\s*ONL/i.test(name)) return n(rate)
  if (mode === 'tutoring' && employee?.salary?.special2 && /ONL/i.test(name)) return n(rate) * 0.8
  if (employee?.salary?.special1 && /%/.test(name)) return n(rate) * 0.8
  return n(rate)
}

function rowsFor(payslip, employee, attendance) {
  if (Array.isArray(payslip.lineEdits)) return structuredClone(payslip.lineEdits)
  return attendance.filter(x => x.period === payslip.period && (samePerson(x.teacher, employee.name) || samePerson(x.ta, employee.name) || samePerson(x.employee, employee.name)))
}

function validPlacementRow(x){return !!(x&&x.date&&x.student&&(x.teacher||x.employee)&&n(x.amount??20000)>=0)}
function validTeacherRow(x) {
  return !!(x && x.date && x.className && hasData(x.hours) && n(x.hours) >= 0)
}
function validOfficeRow(x) {
  return !!(x && x.date && x.employee && hasData(x.hours) && n(x.hours) >= 0)
}
function uniqueRows(rows) {
  const seen = new Set()
  return rows.filter(x => {
    const key = x.id || `${x.category}|${x.date}|${x.start}|${x.end}|${x.className}|${x.teacher}|${x.ta}|${x.employee}|${x.hours}`
    if (seen.has(key)) return false
    seen.add(key); return true
  })
}

function buildModel(employee, payslip, attendance) {
  const rows = uniqueRows(rowsFor(payslip, employee, attendance)).filter(x => x.category === 'Văn phòng' ? validOfficeRow(x) : /placement test/i.test(x.category||'') ? validPlacementRow(x) : validTeacherRow(x))
  const overrides = payslip.overrides || {}
  const rates = overrides.rates || {}
  const classRate = n(rates.class ?? employee.salary?.teacher?.class)
  const assistRate = n(rates.assist ?? employee.salary?.teacher?.assist)
  const tutoringRate = n(rates.tutoring ?? employee.salary?.teacher?.tutoring)
  const assistTutoringRate = n(rates.assistTutoring ?? employee.salary?.teacher?.assistTutoring)
  const officeFull = n(rates.full ?? employee.salary?.office?.full)
  const officePart = n(rates.part ?? employee.salary?.office?.part)

  const common = rows.filter(x => x.category === 'Lớp chung' && samePerson(x.teacher, employee.name)).map(x => ({
    ...x, rate: effectiveRate(classRate, x.className, employee, 'teacher'), amount: n(x.hours) * effectiveRate(classRate, x.className, employee, 'teacher')
  }))

  // A teacher acting as TA on a common class is recorded as one line in Phụ đạo.
  // Explicitly imported Phụ đạo rows are also included when the person is GV/TG.
  const assist = rows.filter(x =>
    (x.category === 'Phụ đạo' && (samePerson(x.teacher, employee.name) || samePerson(x.ta, employee.name))) ||
    (x.category === 'Lớp chung' && samePerson(x.ta, employee.name))
  ).map(x => ({ ...x, rate: effectiveRate(assistRate, x.className, employee, 'assist'), amount: n(x.hours) * effectiveRate(assistRate, x.className, employee, 'assist') }))

  const tutoring = rows.filter(x => x.category === 'Lớp kèm' && samePerson(x.teacher, employee.name))
    .map(x => ({ ...x, rate: effectiveRate(tutoringRate, x.className, employee, 'tutoring'), amount: n(x.hours) * effectiveRate(tutoringRate, x.className, employee, 'tutoring') }))

  const assistTutoring = rows.filter(x => x.category === 'Phụ đạo kèm' && (samePerson(x.teacher, employee.name) || samePerson(x.ta, employee.name)))
    .map(x => ({ ...x, rate: effectiveRate(assistTutoringRate, x.className, employee, 'assist'), amount: n(x.hours) * effectiveRate(assistTutoringRate, x.className, employee, 'assist') }))

  const officeRows = rows.filter(x => x.category === 'Văn phòng' && samePerson(x.employee, employee.name))
  const officeHours = overrides.officeHours !== undefined
    ? n(overrides.officeHours)
    : officeRows.reduce((s, x) => s + n(x.hours), 0)
  const officeTotal = officeFull + officePart * officeHours
  const placement = rows.filter(x => /^Placement Test$/i.test(x.category||'') && (samePerson(x.teacher, employee.name) || samePerson(x.employee, employee.name)))

  return { common, assist, tutoring, assistTutoring, officeFull, officePart, officeHours, officeTotal, placement }
}

function copyRowStyle(ws, sourceRow, targetRow) {
  const src = ws.getRow(sourceRow)
  const dst = ws.getRow(targetRow)
  dst.height = src.height
  dst.hidden = false
  for (let c = 1; c <= ws.columnCount; c++) {
    const a = src.getCell(c), b = dst.getCell(c)
    b.style = { ...a.style }
    b.font = { ...a.font }
    b.fill = { ...a.fill }
    b.border = { ...a.border }
    b.alignment = { ...a.alignment }
    b.protection = { ...a.protection }
    b.numFmt = a.numFmt
  }
}

function colLetter(n) {
  let s = ''
  let x = n
  while (x > 0) {
    const r = (x - 1) % 26
    s = String.fromCharCode(65 + r) + s
    x = Math.floor((x - 1) / 26)
  }
  return s
}

// ExcelJS does not reliably move merged ranges when rows are inserted.
// Payslip sections contain merged total/header rows, so capture the merges,
// insert the rows, then restore every merge at its new coordinate.
function insertRowsPreserveMerges(ws, atRow, count) {
  if (!count) return

  const merges = Object.values(ws._merges || {}).map(m => {
    const r = m.model || m
    return { top: r.top, left: r.left, bottom: r.bottom, right: r.right }
  })

  for (const m of merges) {
    ws.unMergeCells(`${colLetter(m.left)}${m.top}:${colLetter(m.right)}${m.bottom}`)
  }

  ws.insertRows(atRow, Array.from({ length: count }, () => []))

  for (const m of merges) {
    const shifted = { ...m }
    if (m.top >= atRow) {
      shifted.top += count
      shifted.bottom += count
    } else if (m.bottom >= atRow) {
      shifted.bottom += count
    }
    ws.mergeCells(`${colLetter(shifted.left)}${shifted.top}:${colLetter(shifted.right)}${shifted.bottom}`)
  }
}

function deleteRowsPreserveMerges(ws, atRow, count) {
  if (!count) return
  const merges = Object.values(ws._merges || {}).map(m => {
    const r = m.model || m
    return { top: r.top, left: r.left, bottom: r.bottom, right: r.right }
  })
  for (const m of merges) ws.unMergeCells(`${colLetter(m.left)}${m.top}:${colLetter(m.right)}${m.bottom}`)
  ws.spliceRows(atRow, count)
  for (const m of merges) {
    if (m.bottom < atRow) {
      ws.mergeCells(`${colLetter(m.left)}${m.top}:${colLetter(m.right)}${m.bottom}`)
      continue
    }
    if (m.top >= atRow + count) {
      const shifted = { ...m, top: m.top - count, bottom: m.bottom - count }
      ws.mergeCells(`${colLetter(shifted.left)}${shifted.top}:${colLetter(shifted.right)}${shifted.bottom}`)
      continue
    }
    if (m.top >= atRow && m.bottom < atRow + count) continue
    const shifted = { ...m, bottom: m.bottom - count }
    if (m.top >= atRow) shifted.top = atRow
    if (shifted.bottom >= shifted.top) ws.mergeCells(`${colLetter(shifted.left)}${shifted.top}:${colLetter(shifted.right)}${shifted.bottom}`)
  }
}

function fitDetailSection(ws, firstRow, capacity, rowCount, totalRow) {
  if (rowCount > capacity) {
    const extra = rowCount - capacity
    insertRowsPreserveMerges(ws, totalRow, extra)
    for (let r = totalRow; r < totalRow + extra; r++) copyRowStyle(ws, firstRow + capacity - 1, r)
    return { firstRow, totalRow: totalRow + extra, delta: extra }
  }
  if (rowCount < capacity) {
    const remove = capacity - rowCount
    deleteRowsPreserveMerges(ws, firstRow + rowCount, remove)
    return { firstRow, totalRow: totalRow - remove, delta: -remove }
  }
  return { firstRow, totalRow, delta: 0 }
}

function ensureDetailCapacity(ws, firstRow, capacity, rowCount, totalRow) {
  const extra = Math.max(0, rowCount - capacity)
  if (!extra) return extra
  insertRowsPreserveMerges(ws, totalRow, extra)
  for (let r = totalRow; r < totalRow + extra; r++) copyRowStyle(ws, firstRow + capacity - 1, r)
  return extra
}

function clearDetailRows(ws, firstRow, lastRow) {
  for (let r = firstRow; r <= lastRow; r++) {
    ws.getRow(r).hidden = false
    for (const c of ['A','B','C','D','E','F','G','H']) clearCell(ws, `${c}${r}`)
  }
}

function writeTeacherRows(ws, firstRow, rows, totalRow) {
  const end = totalRow - 1
  clearDetailRows(ws, firstRow, end)
  rows.forEach((x, i) => {
    const r = firstRow + i
    ws.getRow(r).hidden = false
    setValue(ws, `A${r}`, displayDate(x.date))
    setValue(ws, `B${r}`, x.day || dayName(x.date))
    setValue(ws, `C${r}`, x.className || '')
    setValue(ws, `D${r}`, x.start || '')
    setValue(ws, `E${r}`, x.end || '')
    setValue(ws, `F${r}`, n(x.hours))
    setMoney(ws, `G${r}`, x.rate)
    setMoney(ws, `H${r}`, x.amount)
  })
  return {
    hours: rows.reduce((s, x) => s + n(x.hours), 0),
    amount: rows.reduce((s, x) => s + n(x.amount), 0),
  }
}

function setPeriod(ws, year, month, prefix) {
  if(!year || !month){ setValue(ws,'A6',''); setValue(ws,'B7',''); setValue(ws,'E7',''); return }
  setValue(ws, 'A6', `${prefix} THÁNG ${Number(month)}/${year}`)
  setValue(ws, 'B7', Number(month))
  setValue(ws, 'E7', Number(year))
}

function setMoneySectionFormats(ws, cells) {
  cells.forEach(cell => { ws.getCell(cell).numFmt = MONEY_FMT })
}

function replaceFormulaCellsWithValues(ws, values) {
  Object.entries(values).forEach(([cell, value]) => setValue(ws, cell, value))
}

async function loadTemplate(signal) {
  signal?.throwIfAborted()
  const res = await fetch(TEMPLATE, {signal})
  if (!res.ok) throw new Error('Không tải được file mẫu phiếu lương.')
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(await res.arrayBuffer())
  signal?.throwIfAborted()
  return wb
}

function columnNumberFromLetters(letters) { let n = 0; for (const ch of String(letters).toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64; return n }

function formulaCellResult(ws, address, stack = new Set()) {
  const cell = ws.getCell(address)
  const v = cell.value
  if (!(v && typeof v === 'object' && v.formula !== undefined)) return Number.isFinite(Number(v)) ? Number(v) : (v == null || v === '' ? 0 : 0)
  if (stack.has(address)) return 0
  stack.add(address)
  let f = String(v.formula).trim().replace(/^=/, '')
  const refValue = (addr) => formulaCellResult(ws, String(addr).toUpperCase(), new Set(stack))
  f = f.replace(/SUM\(([A-Z]+\d+):([A-Z]+\d+)\)/gi, (_, a, b) => {
    const ma = String(a).match(/^([A-Z]+)(\d+)$/i), mb = String(b).match(/^([A-Z]+)(\d+)$/i)
    if (!ma || !mb) return '0'
    const c1 = columnNumberFromLetters(ma[1]), c2 = columnNumberFromLetters(mb[1]), r1 = Number(ma[2]), r2 = Number(mb[2])
    let total = 0
    for (let r = Math.min(r1,r2); r <= Math.max(r1,r2); r++) for (let c = Math.min(c1,c2); c <= Math.max(c1,c2); c++) total += formulaCellResult(ws, ws.getCell(r,c).address, new Set(stack))
    return String(total)
  })
  f = f.replace(/DAY\(EOMONTH\(DATE\(([A-Z]+\d+|\d+),\s*([A-Z]+\d+|\d+),\s*\d+\),\s*0\)\)/gi, (_, yref, mref) => {
    const y = /^\d+$/.test(yref) ? Number(yref) : refValue(yref)
    const m = /^\d+$/.test(mref) ? Number(mref) : refValue(mref)
    return String(new Date(Number(y), Number(m), 0).getDate())
  })
  f = f.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)')
  f = f.replace(/\b([A-Z]{1,3}\d+)\b/g, (_, addr) => ' '+String(refValue(addr))+' ')
  // Reduce innermost MIN/MAX calls before evaluating the arithmetic expression.
  const numericExpression=expression=>{if(!/^[\d\s.+*/()%\-]+$/.test(expression))throw new Error('Unsupported numeric expression');const value=Function(`"use strict"; return (${expression})`)();if(!Number.isFinite(value))throw new Error('Invalid numeric result');return value}
  for(let i=0;i<32&&/\b(?:MIN|MAX)\(/i.test(f);i++){const previous=f;f=f.replace(/\b(MIN|MAX)\(([^()]*)\)/gi,(_,name,args)=>String((name.toUpperCase()==='MIN'?Math.min:Math.max)(...args.split(',').map(numericExpression))));if(previous===f)break}
  try {
    if (!/^[\d\s.+*/()%\-]+$/.test(f)) throw new Error('Unsupported formula: '+f)
    const result = Function(`"use strict"; return (${f})`)()
    return Number.isFinite(Number(result)) ? Number(result) : 0
  } catch (error) { throw new Error(`Công thức ${ws.name}!${address}: ${error.message}`) }
}

function calculateAndStripFormulas(wb) {
  for(const ws of wb.worksheets) {
    const formulas=[]
    ws.eachRow(row=>row.eachCell(cell=>{if(cell.type===ExcelJS.ValueType.Formula) formulas.push([cell,cell.formula])}))
    for(const [cell,formula] of formulas) cell.value={formula}
    const results=formulas.map(([cell])=>[cell,formulaCellResult(ws,cell.address)])
    results.forEach(([cell,value])=>{cell.value=value})
  }
}

function fillAllPeriodText(ws, display) {
  if (!display?.year || !display?.month) return
  const month = Number(display.month), year = Number(display.year)
  for (const row of ws._rows || []) for (const cell of row?.cells || []) {
    if (typeof cell?.value !== 'string') continue
    cell.value = cell.value
      .replace(/THÁNG\s+\.\.\.\/\d{4}/gi, `THÁNG ${month}/${year}`)
      .replace(/THÁNG\s+\.\.\.\/\d{2,4}/gi, `THÁNG ${month}/${year}`)
  }
}

async function workbookFor(payslip, employee, attendance, onlyType = null, signal) {
  employee={...employee,branch:payslip.branch??employee.branch};
  const wb = await loadTemplate(signal)
  if(wb.getWorksheet('GV_BH')) {
    const source=wb.getWorksheet('GV'), target=wb.getWorksheet('GV_BH')
    source.eachRow(row=>row.eachCell(cell=>{if(cell.col<=8 && !cell.isMerged || cell.col<=8 && cell.master===cell) {
      const out=target.getCell(cell.address);out.value=cell.type===ExcelJS.ValueType.Formula?{formula:cell.formula}:structuredClone(cell.value);out.style=structuredClone(cell.style)
    }}))
  }
  const model = buildModel(employee, payslip, attendance)
  const types = onlyType ? [onlyType] : activePayslipTypes(payslip)
  const display = periodParts(payslip.displayPeriod || (!payslip.allPeriods?payslip.period:'') || '')
  const rates = payslip.overrides?.rates || {}
  const transfer = n(employee.salary?.transfer)
  const insuranceBase = n(employee.salary?.insuranceBase)
  const food = n(employee.salary?.mealAllowance)
  const bonus = n(employee.salary?.bonus)
  const support = n(employee.salary?.support)

  for (const ws of [...wb.worksheets]) {
    if (!types.includes(sheetTypeFor(ws.name))) wb.removeWorksheet(ws.id)
  }

  const setCommonPeriod = (ws, cells, titlePrefix) => {
    const {year, month} = display
    if (display.year && display.month) {
      setValue(ws, cells.title, `${titlePrefix} THÁNG ${Number(month)}/${year}`)
      if (cells.month) setValue(ws, cells.month, Number(month))
      if (cells.year) setValue(ws, cells.year, Number(year))
    } else {
      if (cells.title) clearCell(ws,cells.title)
      if (cells.month) clearCell(ws,cells.month)
      if (cells.year) clearCell(ws,cells.year)
    }
  }

  for (const type of types) {
    await new Promise(resolve=>setTimeout(resolve,0)); signal?.throwIfAborted()
    if (type === 'teacher' || type === 'teacherBH') {
      const gv=wb.getWorksheet(type==='teacher'?'GV':'GV_BH'); if(!gv) continue
      setCommonPeriod(gv,{title:'A6',month:'B7',year:'E7'},'PHIẾU THANH TOÁN TIỀN LƯƠNG_')
      setValue(gv,'B8',employee.name); setValue(gv,'B9',employee.position||'Giáo viên'); setValue(gv,'B10',payslip.overrides?.bank??employee.bank??''); setValue(gv,'E10',payslip.overrides?.account??employee.account??'')
      setMoney(gv,'D12',n(rates.class??employee.salary?.teacher?.class)); setMoney(gv,'D13',n(rates.tutoring??employee.salary?.teacher?.tutoring)); setMoney(gv,'D14',n(rates.assist??employee.salary?.teacher?.assist))
      setMoney(gv,'D15',n(rates.assistTutoring??employee.salary?.teacher?.assistTutoring));setMoney(gv,'D16',20000)
      if(hasData(rates.full??employee.salary?.office?.full))setMoney(gv,'D17',model.officeFull);else clearCell(gv,'D17');if(hasData(employee.salary?.insuranceBase))setMoney(gv,'D18',insuranceBase);else clearCell(gv,'D18')
      let shift=0
      const cf=fitDetailSection(gv,23,10,model.common.length,33);const ct=writeTeacherRows(gv,23,model.common,cf.totalRow);setValue(gv,`B${cf.totalRow}`,'TỔNG (1)');setValue(gv,`F${cf.totalRow}`,ct.hours);setMoney(gv,`H${cf.totalRow}`,ct.amount);shift+=cf.delta
      const af=fitDetailSection(gv,36+shift,5,model.assist.length,41+shift);const at=writeTeacherRows(gv,36+shift,model.assist,af.totalRow);setValue(gv,`B${af.totalRow}`,'TỔNG (2)');setValue(gv,`F${af.totalRow}`,at.hours);setMoney(gv,`H${af.totalRow}`,at.amount);shift+=af.delta
      const tf=fitDetailSection(gv,44+shift,2,model.tutoring.length,46+shift);const tt=writeTeacherRows(gv,44+shift,model.tutoring,tf.totalRow);setValue(gv,`A${tf.totalRow}`,'TỔNG (3)');setValue(gv,`F${tf.totalRow}`,tt.hours);setMoney(gv,`H${tf.totalRow}`,tt.amount);shift+=tf.delta
      const atf=fitDetailSection(gv,49+shift,2,model.assistTutoring.length,51+shift);const att=writeTeacherRows(gv,49+shift,model.assistTutoring,atf.totalRow);setValue(gv,`A${atf.totalRow}`,'TỔNG (3)');setValue(gv,`F${atf.totalRow}`,att.hours);setMoney(gv,`H${atf.totalRow}`,att.amount);shift+=atf.delta
      const pf=fitDetailSection(gv,54+shift,1,model.placement.length,55+shift);clearDetailRows(gv,pf.firstRow,pf.totalRow-1)
      model.placement.forEach((x,i)=>{const r=pf.firstRow+i;setValue(gv,`A${r}`,displayDate(x.date));setValue(gv,`B${r}`,x.day||dayName(x.date));setValue(gv,`C${r}`,x.student);setValue(gv,`D${r}`,x.testName||'');setMoney(gv,`H${r}`,x.amount??20000)})
      setMoney(gv,`H${pf.totalRow}`,model.placement.reduce((sum,x)=>sum+n(x.amount??20000),0));shift+=pf.delta
      const officeStart=56+shift;setMoney(gv,`F${officeStart+1}`,model.officeFull);setMoney(gv,`F${officeStart+2}`,model.officePart);setValue(gv,`F${officeStart+3}`,model.officeHours||0);setMoney(gv,`F${officeStart+4}`,model.officeTotal-model.officeFull/(display.year&&display.month?new Date(Number(display.year),Number(display.month),0).getDate():30)*n(payslip.overrides?.leaveDays?.unpaid))
      const ins=money(payslip.overrides?.insuranceAmount??insuranceAmount(employee));clearCell(gv,`D${62+shift}`);setMoney(gv,`D${63+shift}`,ins)
      gv.getCell(`H${64+shift}`).value={formula:`F${60+shift}+H${pf.totalRow}+H${atf.totalRow}+H${cf.totalRow}+H${af.totalRow}+H${tf.totalRow}-D${63+shift}`}

    }
    if (type === 'office' || type === 'officeBH') {
      const vp=wb.getWorksheet(type==='office'?'VP':'VP_BH'); if(!vp) continue
      setCommonPeriod(vp,{title:'A6',month:'B7',year:'E7'},'PHIẾU THANH TOÁN TIỀN LƯƠNG_')
      setValue(vp,'E10',employee.name); setValue(vp,'E11','VP'); setValue(vp,'E17',payslip.overrides?.bank??employee.bank??''); setValue(vp,'E18',payslip.overrides?.account??employee.account??''); setValue(vp,'E14',n(payslip.overrides?.leaveDays?.compensatory));setValue(vp,'E15',n(payslip.overrides?.leaveDays?.unpaid));setValue(vp,'E16',n(payslip.overrides?.leaveDays?.paid));setValue(vp,'E13',model.officeHours||0); setMoney(vp,'E20',model.officeFull); setMoney(vp,'E21',model.officePart); setMoney(vp,'E22',support); const ins=money(payslip.overrides?.insuranceAmount??insuranceAmount(employee)); setMoney(vp,'E25',ins)
    }
    if (type === 'transfer') {
      const ck=wb.getWorksheet('CK'); if(!ck) continue
      setCommonPeriod(ck,{title:'A5',month:'B6',year:'E6'},'PHIẾU THANH TOÁN TIỀN LƯƠNG_')
      setValue(ck,'E9',employee.name); setValue(ck,'E10',employee.position||''); setValue(ck,'E11',payslip.overrides?.bank??employee.bank??''); setValue(ck,'E12',payslip.overrides?.account??employee.account??''); setMoney(ck,'E14',transfer); setMoney(ck,'E15',food); setMoney(ck,'E16',bonus)
      setMoney(ck,'E21',0)
      const special=employee.salary?.specialInsurance&&hasData(employee.salary?.insuranceAmount)
      if(special){
        // Only an explicitly entered zero bypasses MS3 insurance formulas.
        // A nonzero special amount belongs to MS4/MS5; MS3 keeps its template.
        if(Number(employee.salary.insuranceAmount)===0){for(const cell of ['E18','E19','E20'])setMoney(ck,cell,0)}
      }else if(payslip.overrides?.insuranceAmount!==undefined){
        const deduction=money(payslip.overrides?.insuranceAmount??insuranceAmount(employee));
        setMoney(ck,'E18',deduction*8/10.5);setMoney(ck,'E19',deduction*1.5/10.5);setMoney(ck,'E20',deduction-money(deduction*8/10.5)-money(deduction*1.5/10.5))
      }
    }
    if (type === 'teacherBH') fillInsuranceSheet(wb.getWorksheet('GV_BH'), employee, payslip, model, display, true)
    if (type === 'officeBH') fillInsuranceSheet(wb.getWorksheet('VP_BH'), employee, payslip, model, display, false)
  }

  // Fill mọi placeholder thời gian còn lại trong template trước khi tính công thức.
  for (const ws of wb.worksheets) fillAllPeriodText(ws, display)
  // File export phải là dữ liệu tĩnh: tính toàn bộ công thức rồi loại bỏ công thức khỏi workbook.
  calculateAndStripFormulas(wb)
  for(const ws of wb.worksheets){const row=ws.name==='CK'?6:7;for(const column of ['B','E']){const cell=ws.getCell(column+row);cell.numFmt='0';cell.alignment={...cell.alignment,horizontal:'left',indent:0}}}
  const leaveDetails=(payslip.overrides?.leaveDetails||[]).filter(r=>[r.detail,r.time,r.days,r.note].some(hasData))
  if(leaveDetails.length)for(const ws of wb.worksheets){
    if(ws.name==='CK')continue
    const left=ws.name.startsWith('GV')?12:9,right=left+7;let occupied=8;ws.eachRow(row=>row.eachCell(cell=>{if(cell.col>=left&&cell.value!==null&&cell.value!==undefined)occupied=Math.max(occupied,row.number)}));for(const merge of Object.values(ws._merges||{})){const m=merge.model||merge;if(m.right>=left)occupied=Math.max(occupied,m.bottom)}const start=occupied+3,groups=[[left,left+1],[left+2,left+3],[left+4,left+4],[left+5,right]]
    ws.mergeCells(start,left,start,right);ws.getCell(start,left).value='CHI TIẾT NGÀY NGHỈ'
    const content=[['Chi tiết','Thời gian','Số ngày','Ghi chú'],...leaveDetails.map(r=>[r.detail||'',r.time||'',hasData(r.days)?n(r.days):'',r.note||''])]
    for(let i=0;i<content.length;i++){const row=start+1+i;groups.forEach(([left,right],j)=>{if(right>left)ws.mergeCells(row,left,row,right);const c=ws.getCell(row,left);c.value=content[i][j];if(j===2&&i)c.numFmt='0.##'})}
    for(let row=start;row<=start+content.length;row++){const header=row<=start+1;ws.getRow(row).height=header?28:Math.max(32,24*Math.ceil(Math.max(...content[row-start-1].map(v=>String(v).length))/35));for(let col=left;col<=right;col++){const c=ws.getCell(row,col);c.font={name:'Times New Roman',size:12,bold:header,color:{argb:'FF234D3E'}};c.alignment={vertical:'middle',wrapText:true,horizontal:header?'center':'left'};c.border={top:{style:'thin',color:{argb:'FFB8CEC2'}},bottom:{style:'thin',color:{argb:'FFB8CEC2'}},left:{style:'thin',color:{argb:'FFB8CEC2'}},right:{style:'thin',color:{argb:'FFB8CEC2'}}};if(header)c.fill={type:'pattern',pattern:'solid',fgColor:{argb:row===start?'FFDDECE3':'FFF0F6F2'}}}}
    const last=Math.max(ws.rowCount,start+content.length);ws.pageSetup.printArea='A1:'+ws.getColumn(Math.max(8,ws.columnCount)).letter+last
  }
  return wb
}

function sheetTypeFor(name){return ({GV:'teacher',VP:'office',CK:'transfer',GV_BH:'teacherBH',VP_BH:'officeBH'})[name]}

function fillInsuranceSheet(ws, employee, payslip, model, display, teacher){
  if(!ws)return
  const transfer=n(employee.salary?.transfer),meal=n(employee.salary?.mealAllowance),support=n(employee.salary?.support)
  const account=payslip.overrides?.account??employee.account??''
  const days=display.year&&display.month?new Date(Number(display.year),Number(display.month),0).getDate():30
  if(teacher){
    const inputs={L5:Number(display.month)||0,M5:employee.name,N5:account,O5:days,P5:transfer,Q5:meal,R5:0,U5:support,V5:n(employee.salary?.insuranceBase),AJ5:0}
    Object.entries(inputs).forEach(([cell,value])=>setValue(ws,cell,value))
    // Use the employee insurance base with the revised gross and progressive-tax formulas.
    ws.getCell('Q7').value={formula:'AK5'}
    let takeAddress='H64';ws.eachRow(row=>{if(String(row.getCell(2).value||'').includes('CÒN LẠI THỰC NHẬN'))takeAddress='H'+row.number})
    ws.getCell('Q8').value={formula:takeAddress+'-Q7'}
  }else{
    const inputs={I5:Number(display.month)||0,J5:employee.name,K5:account,L5:days,M5:transfer,N5:meal,O5:0,R5:support,S5:n(employee.salary?.insuranceBase),AG5:0}
    Object.entries(inputs).forEach(([cell,value])=>setValue(ws,cell,value))
    ws.getCell('N7').value={formula:'AH5'}
    ws.getCell('N8').value={formula:'E26-N7'}
  }
  const assigned=payslip.overrides?.insuranceAmount??insuranceAmount(employee)
  const custom=employee.salary?.specialInsurance&&hasData(employee.salary?.insuranceAmount)
  if(!custom&&payslip.overrides?.insuranceAmount!==undefined){
    const cols=teacher?['W5','X5','Y5','Z5','AA5','AD5','AE5','AF5']:['T5','U5','V5','W5','X5','AA5','AB5','AC5']
    if(custom||assigned===0)for(const cell of cols)setValue(ws,cell,0)
    setValue(ws,teacher?'AG5':'AD5',money(assigned))
  }
}

export async function payslipBuffer(payslip, employee, attendance, type=null, {signal}={}) { signal?.throwIfAborted(); const wb=await workbookFor(payslip,employee,attendance,type,signal); signal?.throwIfAborted(); const out=await writeExcelBuffer(wb); signal?.throwIfAborted(); return out }
function safeFile(s){return String(s||'').replace(/[<>:"/\\|?*\x00-\x1F]/g,'_').trim().replace(/[. ]+$/g,'')||'UNKNOWN'}
const typeCode={teacher:'MS1',office:'MS2',transfer:'MS3',teacherBH:'MS4',officeBH:'MS5'}
export const activePayslipTypes=activeTypes;
export function payslipGross(p,e,attendance){const m=buildModel(e,p,attendance);const days=p.displayPeriod||p.period;const [y,mo]=days.split('-');const monthDays=Number(y)&&Number(mo)?new Date(Number(y),Number(mo),0).getDate():30;return [...m.common,...m.assist,...m.tutoring,...m.assistTutoring].reduce((s,r)=>s+r.amount,0)+m.placement.reduce((s,r)=>s+n(r.amount??20000),0)+m.officeTotal-m.officeFull/monthDays*n(p.overrides?.leaveDays?.unpaid)+n(e.salary?.support)}

export async function buildPayslipZip(payslips,employees,attendance,{summaries=false}={}){
 payslips=payslips.map(p=>({...p,types:activePayslipTypes(p)}))
 const zip=new JSZip(),folders=new Map(),usedFolders=new Set(),bufferCache=new Map();const getBuffer=async(p,e,type)=>{if(!bufferCache.has(p))bufferCache.set(p,new Map());const cached=bufferCache.get(p);if(!cached.has(type))cached.set(type,await payslipBuffer(p,e,attendance,type));return cached.get(type)}
 zip.folder('CHUYỂN KHOẢN TỪ TK CÔNG TY');zip.folder('THANH TOÁN TIỀN MẶT');for(const b of ['PHÚ NHUẬN','TÂN PHÚ'])for(const role of ['GIÁO VIÊN','VĂN PHÒNG'])zip.folder('THANH TOÁN TIỀN MẶT/PAYSLIP_'+b+'_'+role);
 for(const p of payslips){
  const e=employees.find(e=>e.id===p.employeeId);if(!e)continue
  if(employeeBranches(e).length>1&&p.branch===undefined)throw Error(e.name+': phiếu cũ chưa phân chi nhánh. Hãy Khởi tạo lại trước khi xuất.');
  const period=safeFile(p.displayPeriod||p.period||'KY'),rawBranch=String(p.branch??e.branch??'').trim(),branch=safeFile(({TP:'TÂN PHÚ',PN:'PHÚ NHUẬN'})[rawBranch.toUpperCase()]||rawBranch.toLocaleUpperCase('vi-VN')||'CHƯA CÓ CHI NHÁNH')
  const types=[...new Set(p.types||[])],groups=[]
  const hasOffice=types.some(t=>t==='office'||t==='officeBH')
  if(types.some(t=>t==='teacher'||t==='teacherBH'))groups.push(['GIÁO VIÊN',types.filter(t=>['teacher','teacherBH'].includes(t)||(t==='transfer'&&!hasOffice))])
  if(types.some(t=>t==='office'||t==='officeBH'))groups.push(['VĂN PHÒNG',types.filter(t=>['office','officeBH','transfer'].includes(t))])
  if(!groups.length&&types.includes('transfer'))groups.push([/(?:^|;)\s*(GV|TG)\s*(?:;|$)/i.test(e.position||'')?'GIÁO VIÊN':'VĂN PHÒNG',['transfer']])
  const buffers=new Map()
  for(const [group,groupTypes] of groups){
   const root='THANH TOÁN TIỀN MẶT/PAYSLIP_'+branch+'_'+group+'/'
   let parent=root
   if(groupTypes.length>1){const key=root+'|'+e.id;if(!folders.has(key)){let name=safeFile(e.name),i=2;while(usedFolders.has(root+name))name=safeFile(e.name)+'_'+i++;usedFolders.add(root+name);folders.set(key,root+name+'/')}parent=folders.get(key)}
   for(const type of groupTypes){
    const role=({teacher:'GV',teacherBH:'GV',office:'VP',officeBH:'VP'})[type]
    const name=['PAYSLIP',safeFile(e.name),role,rawBranch?safeFile(rawBranch):null,typeCode[type],period].filter(Boolean).join('_')+'.xlsx'
    const fileParent=type==='transfer'&&e.salary?.companyTransfer?'CHUYỂN KHOẢN TỪ TK CÔNG TY/':parent;
    let path=fileParent+name,i=2;while(zip.file(path))path=fileParent+name.replace(/\.xlsx$/,'_'+i+++'.xlsx')
    if(!buffers.has(type))buffers.set(type,await getBuffer(p,e,type))
    zip.file(path,buffers.get(type))
   }
  }
 }
 if(summaries&&payslips.length)await addPayrollSummaries(zip,payslips,employees,attendance,getBuffer)
 return zip
}
async function downloadPayslipZip(zip,name){const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function exportPayslip(payslip,employee,attendance){const zip=await buildPayslipZip([payslip],[employee],attendance,{summaries:true});await downloadPayslipZip(zip,'PAYSLIP_'+safeFile(employee.branch||'Chưa có chi nhánh')+'_'+safeFile(payslip.displayPeriod||payslip.period||'KY'))}
export async function exportMany(payslips,employees,attendance,folderName){await downloadPayslipZip(await buildPayslipZip(payslips,employees,attendance,{summaries:true}),safeFile(folderName||'PAYSLIP'))}

export function makePayslip(employee, period, attendance, sourceRows = null) {
  const lineEdits = sourceRows ? structuredClone(sourceRows) : attendance.filter(x => x.period === period && (samePerson(x.teacher, employee.name) || samePerson(x.ta, employee.name) || samePerson(x.employee, employee.name)))
  const hasTeacher = lineEdits.some(x => (['Lớp chung','Phụ đạo','Lớp kèm','Phụ đạo kèm'].includes(x.category) && validTeacherRow(x)) || (/^Placement Test$/i.test(x.category||'') && validPlacementRow(x)))
  const hasOffice = lineEdits.some(x => x.category === 'Văn phòng'&&validOfficeRow(x)) || (hasData(employee.salary?.office?.full)||hasData(employee.salary?.office?.part))
  const types = [...(hasTeacher ? ['teacher'] : []), ...(hasOffice ? ['office'] : [])]
  if (hasData(employee.salary?.transfer)) types.push('transfer')
  if (employee.salary?.companyTransfer || hasData(employee.salary?.insuranceBase) || (employee.salary?.specialInsurance&&hasData(employee.salary.insuranceAmount))) { if (hasTeacher) types.push('teacherBH'); if (hasOffice) types.push('officeBH') }
  return { id:crypto.randomUUID(), employeeId:employee.id, employeeName:employee.name, period, types:activePayslipTypes({types}), createdAt:new Date().toISOString(), lineEdits:structuredClone(lineEdits), overrides:{bank:employee.bank||'',account:employee.account||'',rates:{class:employee.salary?.teacher?.class??'',assist:employee.salary?.teacher?.assist??'',tutoring:employee.salary?.teacher?.tutoring??'',assistTutoring:employee.salary?.teacher?.assistTutoring??'',full:employee.salary?.office?.full??'',part:employee.salary?.office?.part??''},officeHours:lineEdits.filter(x=>x.category==='Văn phòng').reduce((s,x)=>s+n(x.hours),0)}}
}

export function buildBranchPayslips(employee,period,attendance,options={}){
 const rows=attendance.filter(r=>(!period||r.period===period)&&(samePerson(r.teacher,employee.name)||samePerson(r.ta,employee.name)||samePerson(r.employee,employee.name)));
 if(rows.some(r=>!branchCode(r.branch)))return {payslips:[],unassigned:true};
 const branches=[...new Set([...employeeBranches(employee),...rows.map(r=>branchCode(r.branch))])];
 if(!branches.length)branches.push('');
 const list=branches.map(branch=>{
   const p=makePayslip({...employee,branch},period,attendance,rows.filter(r=>branchCode(r.branch)===branch));
   return {...p,branch,displayPeriod:options.displayPeriod||period,allPeriods:!period,sourcePeriods:[...new Set(p.lineEdits.map(r=>r.period))].sort(),overrides:{...p.overrides,leaveDays:options.leaveDays||{},leaveDetails:options.leaveDetails||[]}};
 }).filter(p=>p.types.length);
 const amount=Math.round(insuranceAmount(employee));
 const candidates=list.map(p=>({branch:p.branch,gross:payslipGross(p,employee,attendance)}));
 const chosen=options.insuranceBranch??selectInsuranceBranch(candidates,amount);
 if(amount>0&&chosen===null&&list.length>0&&candidates.some(c=>c.branch))return {payslips:list,needsChoice:true,candidates,amount};
 if(chosen!==null&&!list.some(p=>p.branch===chosen))throw Error('Chi nhánh trừ BH không thuộc các phiếu đang tạo.');
 for(const p of list){p.overrides.insuranceAmount=p.branch===(chosen??list[0]?.branch)?amount:0;p.insuranceBranch=chosen??list[0]?.branch}
 return {payslips:list};
}


