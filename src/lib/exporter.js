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
  c.numFmt = MONEY_FMT
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
  return String(value ?? '')
    .trim()
    .replace(/^(mr\.?|mrs\.?|ms\.?|miss\.?|dr\.?)\s+/i, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('vi-VN')
}
function samePerson(a, b) { return normalizePersonName(a) === normalizePersonName(b) }
function effectiveRate(rate, className, employee, mode='') {
  const name = String(className || '')
  if (employee?.salary?.special3 && /IELTS\s*-\s*56%\s*ONL/i.test(name)) return n(rate)
  if (mode === 'tutoring' && employee?.salary?.special2 && /ONL/i.test(name)) return n(rate) * 0.8
  if (employee?.salary?.special1 && /%/.test(name)) return n(rate) * 0.8
  return n(rate)
}

function rowsFor(payslip, employee, attendance) {
  if (Array.isArray(payslip.lineEdits)) return structuredClone(payslip.lineEdits)
  return attendance.filter(x => x.period === payslip.period && (samePerson(x.teacher, employee.name) || samePerson(x.ta, employee.name) || samePerson(x.employee, employee.name)))
}

function validTeacherRow(x) {
  return !!(x && x.date && x.className && (x.start || x.end || n(x.hours) > 0) && n(x.hours) > 0)
}
function validOfficeRow(x) {
  return !!(x && x.date && x.employee && n(x.hours) > 0)
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
  const rows = uniqueRows(rowsFor(payslip, employee, attendance)).filter(x => x.category === 'Văn phòng' ? validOfficeRow(x) : validTeacherRow(x))
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
  const placement = rows.filter(x => x.category === 'Placement test' && (samePerson(x.teacher, employee.name) || samePerson(x.employee, employee.name)))

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
  f = f.replace(/\b([A-Z]{1,3}\d+)\b/g, (_, addr) => String(refValue(addr)))
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
  const wb = await loadTemplate(signal)
  if(wb.getWorksheet('GV_BH')) {
    const source=wb.getWorksheet('GV'), target=wb.getWorksheet('GV_BH')
    source.eachRow(row=>row.eachCell(cell=>{if(cell.col<=8 && !cell.isMerged || cell.col<=8 && cell.master===cell) {
      const out=target.getCell(cell.address);out.value=cell.type===ExcelJS.ValueType.Formula?{formula:cell.formula}:structuredClone(cell.value);out.style=structuredClone(cell.style)
    }}))
  }
  const model = buildModel(employee, payslip, attendance)
  const types = onlyType ? [onlyType] : (payslip.types || [])
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
      if(model.officeFull) setMoney(gv,'D15',model.officeFull); else clearCell(gv,'D15'); if(insuranceBase) setMoney(gv,'D16',insuranceBase); else clearCell(gv,'D16')
      let shift=0
      const cf=fitDetailSection(gv,21,10,model.common.length,31); const ct=writeTeacherRows(gv,21,model.common,cf.totalRow); setValue(gv,`B${cf.totalRow}`,'TỔNG (1)'); setValue(gv,`F${cf.totalRow}`,ct.hours); setMoney(gv,`H${cf.totalRow}`,ct.amount); shift+=cf.delta
      const af=fitDetailSection(gv,34+shift,5,model.assist.length,39+shift); const at=writeTeacherRows(gv,34+shift,model.assist,af.totalRow); setValue(gv,`B${af.totalRow}`,'TỔNG (2)'); setValue(gv,`F${af.totalRow}`,at.hours); setMoney(gv,`H${af.totalRow}`,at.amount); shift+=af.delta
      const tf=fitDetailSection(gv,42+shift,2,model.tutoring.length,44+shift); const tt=writeTeacherRows(gv,42+shift,model.tutoring,tf.totalRow); setValue(gv,`A${tf.totalRow}`,'TỔNG (3)'); setValue(gv,`F${tf.totalRow}`,tt.hours); setMoney(gv,`H${tf.totalRow}`,tt.amount); shift+=tf.delta
      const atf=fitDetailSection(gv,47+shift,2,model.assistTutoring.length,49+shift); const att=writeTeacherRows(gv,47+shift,model.assistTutoring,atf.totalRow); setValue(gv,`A${atf.totalRow}`,'TỔNG (3)'); setValue(gv,`F${atf.totalRow}`,att.hours); setMoney(gv,`H${atf.totalRow}`,att.amount); shift+=atf.delta
      const placement=52+shift; setMoney(gv,`H${placement}`,0); const officeStart=53+shift; setMoney(gv,`F${officeStart+1}`,model.officeFull); setMoney(gv,`F${officeStart+2}`,model.officePart); setValue(gv,`F${officeStart+3}`,model.officeHours||0); setMoney(gv,`F${officeStart+4}`,model.officeTotal)
      const ins=money(insuranceBase*0.105); const take=money(model.officeTotal+att.amount+ct.amount+at.amount+tt.amount-ins); clearCell(gv,`D${59+shift}`); setMoney(gv,`D${60+shift}`,ins); gv.getCell(`H${61+shift}`).value={formula:`F${57+shift}+H${placement}+H${atf.totalRow}+H${cf.totalRow}+H${af.totalRow}+H${tf.totalRow}-D${60+shift}`}; setValue(gv,`F${57+shift}`,model.officeTotal)
    }
    if (type === 'office' || type === 'officeBH') {
      const vp=wb.getWorksheet(type==='office'?'VP':'VP_BH'); if(!vp) continue
      setCommonPeriod(vp,{title:'A6',month:'B7',year:'E7'},'PHIẾU THANH TOÁN TIỀN LƯƠNG_')
      setValue(vp,'E10',employee.name); setValue(vp,'E11',employee.position||''); setValue(vp,'E17',payslip.overrides?.bank??employee.bank??''); setValue(vp,'E18',payslip.overrides?.account??employee.account??''); setValue(vp,'E13',model.officeHours||0); setMoney(vp,'E20',model.officeFull); setMoney(vp,'E21',model.officePart); setMoney(vp,'E22',support); const ins=money(insuranceBase*0.105); setMoney(vp,'E25',ins)
    }
    if (type === 'transfer') {
      const ck=wb.getWorksheet('CK'); if(!ck) continue
      setCommonPeriod(ck,{title:'A5',month:'B6',year:'E6'},'PHIẾU THANH TOÁN TIỀN LƯƠNG_')
      setValue(ck,'E9',employee.name); setValue(ck,'E10',employee.position||''); setValue(ck,'E11',payslip.overrides?.bank??employee.bank??''); setValue(ck,'E12',payslip.overrides?.account??employee.account??''); setMoney(ck,'E14',transfer); setMoney(ck,'E15',food); setMoney(ck,'E16',bonus)
      setMoney(ck,'E21',0)
    }
    if (type === 'teacherBH') fillInsuranceSheet(wb.getWorksheet('GV_BH'), employee, payslip, model, display, true)
    if (type === 'officeBH') fillInsuranceSheet(wb.getWorksheet('VP_BH'), employee, payslip, model, display, false)
  }

  // Fill mọi placeholder thời gian còn lại trong template trước khi tính công thức.
  for (const ws of wb.worksheets) fillAllPeriodText(ws, display)
  // File export phải là dữ liệu tĩnh: tính toàn bộ công thức rồi loại bỏ công thức khỏi workbook.
  calculateAndStripFormulas(wb)
  for(const ws of wb.worksheets){const row=ws.name==='CK'?6:7;for(const column of ['B','E']){const cell=ws.getCell(column+row);cell.numFmt='0';cell.alignment={...cell.alignment,horizontal:'left',indent:0}}}
  return wb
}

function sheetTypeFor(name){return ({GV:'teacher',VP:'office',CK:'transfer',GV_BH:'teacherBH',VP_BH:'officeBH'})[name]}

function fillInsuranceSheet(ws, employee, payslip, model, display, teacher){
  if(!ws)return
  const transfer=n(employee.salary?.transfer), base=n(employee.salary?.insuranceBase)
  const meal=n(employee.salary?.mealAllowance), support=n(employee.salary?.support)
  const account=payslip.overrides?.account??employee.account??''
  if(teacher){
    ws.getCell('Q7').value={formula:'AJ5'}
    // MS4's summary is blank in the supplied workbook. Complete the corresponding
    // MS5 formulas at the MS4 columns, without duplicating computed values in JS.
    const input={L5:Number(display.month),M5:employee.name,N5:account,O5:new Date(Number(display.year),Number(display.month),0).getDate(),P5:transfer,Q5:meal,T5:support,U5:base,AI5:0,AH5:0}
    Object.entries(input).forEach(([c,v])=>setValue(ws,c,v))
    const formulas={R5:'P5+Q5',S5:'P5',V5:'U5*V3',W5:'U5*W3',X5:'U5*X3',Z5:'SUM(V5:X5)',AC5:'U5*AC3',AD5:'U5*AD3',AE5:'U5*AE3',AF5:'SUM(AC5:AE5)',AJ5:'R5+T5-AF5-AH5-AI5'}
    Object.entries(formulas).forEach(([c,f])=>{ws.getCell(c).value={formula:f};ws.getCell(c).numFmt=MONEY_FMT})
    const totalRow=ws.findRow(ws.rowCount)
    // Locate the actual take-home row after detail row resizing.
    let takeAddress='H61';ws.eachRow(row=>{if(String(row.getCell(2).value||'').includes('CÒN LẠI THỰC NHẬN'))takeAddress='H'+row.number})
    ws.getCell('Q8').value={formula:takeAddress+'-Q7'}
  }else{
    setValue(ws,'M5',transfer);ws.getCell('N7').value={formula:'AG5'};setValue(ws,'I5',Number(display.month));setValue(ws,'J5',employee.name);setValue(ws,'K5',account)
    setMoney(ws,'N5',meal);setMoney(ws,'Q5',support)
    // R5 is the insurance-base input; preserve the remaining native MS5 formulas.
    setMoney(ws,'R5',base)
  }
}

export async function payslipBuffer(payslip, employee, attendance, type=null, {signal}={}) { signal?.throwIfAborted(); const wb=await workbookFor(payslip,employee,attendance,type,signal); signal?.throwIfAborted(); const out=await writeExcelBuffer(wb); signal?.throwIfAborted(); return out }
function safeFile(s){return String(s||'').replace(/[<>:"/\\|?*\x00-\x1F]/g,'_').trim().replace(/[. ]+$/g,'')||'UNKNOWN'}
const typeCode={teacher:'MS1',office:'MS2',transfer:'MS3',teacherBH:'MS4',officeBH:'MS5'}
export async function buildPayslipZip(payslips,employees,attendance){
 const zip=new JSZip(),folders=new Map(),usedFolders=new Set()
 for(const p of payslips){
  const e=employees.find(e=>e.id===p.employeeId);if(!e)continue
  const period=safeFile(p.displayPeriod||p.period||'KY'), branch=safeFile(e.branch||'Chưa có chi nhánh')
  const root='PAYSLIP_'+branch+'_'+period+'/'
  const types=[...new Set(p.types||[])]
  let parent=root
  if(types.length>1){
   const key=root+'|'+e.id
   if(!folders.has(key)){let name=safeFile(e.name),i=2;while(usedFolders.has(root+name))name=safeFile(e.name)+'_'+i++;usedFolders.add(root+name);folders.set(key,root+name+'/')}
   parent=folders.get(key)
  }
  for(const type of types){
   const name='PAYSLIP_'+safeFile(e.name)+'_'+safeFile(e.position)+'_'+branch+'_'+typeCode[type]+'_'+period+'.xlsx'
   let path=parent+name,i=2;while(zip.file(path))path=parent+name.replace(/\.xlsx$/,'_'+i+++'.xlsx')
   zip.file(path,await payslipBuffer(p,e,attendance,type))
  }
 }
 return zip
}
async function downloadPayslipZip(zip,name){const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function exportPayslip(payslip,employee,attendance){const zip=await buildPayslipZip([payslip],[employee],attendance);await downloadPayslipZip(zip,'PAYSLIP_'+safeFile(employee.branch||'Chưa có chi nhánh')+'_'+safeFile(payslip.displayPeriod||payslip.period||'KY'))}
export async function exportMany(payslips,employees,attendance,folderName){await downloadPayslipZip(await buildPayslipZip(payslips,employees,attendance),safeFile(folderName||'PAYSLIP'))}

export function makePayslip(employee, period, attendance, sourceRows = null) {
  const lineEdits = sourceRows ? structuredClone(sourceRows) : attendance.filter(x => x.period === period && (samePerson(x.teacher, employee.name) || samePerson(x.ta, employee.name) || samePerson(x.employee, employee.name)))
  const hasTeacher = lineEdits.some(x => x.category !== 'Văn phòng') || !!(employee.salary?.teacher?.class || employee.salary?.teacher?.assist || employee.salary?.teacher?.tutoring || employee.salary?.teacher?.assistTutoring)
  const hasOffice = lineEdits.some(x => x.category === 'Văn phòng') || !!(employee.salary?.office?.full || employee.salary?.office?.part)
  const types = [...(hasTeacher ? ['teacher'] : []), ...(hasOffice ? ['office'] : [])]
  if (n(employee.salary?.transfer) > 0) types.push('transfer')
  if (n(employee.salary?.insuranceBase) > 0) { if (hasTeacher) types.push('teacherBH'); if (hasOffice) types.push('officeBH') }
  return { id:crypto.randomUUID(), employeeId:employee.id, employeeName:employee.name, period, types, createdAt:new Date().toISOString(), lineEdits:structuredClone(lineEdits), overrides:{bank:employee.bank||'',account:employee.account||'',rates:{class:employee.salary?.teacher?.class||0,assist:employee.salary?.teacher?.assist||0,tutoring:employee.salary?.teacher?.tutoring||0,assistTutoring:employee.salary?.teacher?.assistTutoring||0,full:employee.salary?.office?.full||0,part:employee.salary?.office?.part||0},officeHours:lineEdits.filter(x=>x.category==='Văn phòng').reduce((s,x)=>s+n(x.hours),0)}}
}
