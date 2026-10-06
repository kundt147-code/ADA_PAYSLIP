import {hasData} from './payroll-policy.js'
import {headerNote} from './excel-notes.js'
import { writeExcelBuffer } from './xlsx-output.js'
import * as XLSX from 'xlsx/xlsx.mjs'
import ExcelJS from 'exceljs'

export const ATT_COLUMNS = ['Ngày', 'Thứ', 'Tên lớp', 'Giờ bắt đầu', 'Giờ kết thúc', 'Tổng giờ', 'Tên GV', 'Tên TG']
export const OFFICE_COLUMNS = ['Ngày', 'Thứ', 'Tên nhân viên', 'Giờ in', 'Giờ out', 'Tổng số giờ']

const CATEGORY_SHEETS = {
  'Lớp chung': 'Lớp chung',
  'Phụ đạo': 'Lớp phụ đạo',
  'Lớp kèm': 'Lớp kèm',
  'Văn phòng': 'Văn phòng',
}

function excelDateToISO(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value)
    if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
  }
  const s = String(value ?? '').trim()
  if (!s) return ''
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (m) return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`
  return s.slice(0,10)
}
function timeToHHMM(value) {
  if (value instanceof Date) return `${String(value.getHours()).padStart(2,'0')}:${String(value.getMinutes()).padStart(2,'0')}`
  if (typeof value === 'number') {
    const total = Math.round(value * 24 * 60)
    return `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`
  }
  const s = String(value ?? '').trim()
  if (!s) return ''
  const m = s.match(/(\d{1,2})[:h](\d{1,2})/i)
  return m ? `${String(+m[1]).padStart(2,'0')}:${String(+m[2]).padStart(2,'0')}` : s
}
function calcHours(start, end) {
  const a = String(start || '').split(':').map(Number), b = String(end || '').split(':').map(Number)
  if (a.length < 2 || b.length < 2 || Number.isNaN(a[0]) || Number.isNaN(b[0])) return 0
  let x = a[0] * 60 + a[1], y = b[0] * 60 + b[1]
  if (y < x) y += 24 * 60
  return Math.round(((y - x) / 60) * 100) / 100
}
function normalizeHeader(v) { return String(v ?? '').trim().toLowerCase().replace(/\s+/g,' ') }
function idx(headers, names) { return names.map(normalizeHeader).map(n => headers.indexOf(n)).find(i => i >= 0) }

export async function getWorkbookSheetNames(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', bookSheets: true })
  return wb.SheetNames
}


export async function parseAllAttendanceSheets(file) {
  const wbBuf = await file.arrayBuffer()
  const wb = XLSX.read(wbBuf, { type: 'array', cellDates: false, cellNF: true })
  const expected = [
    ['Lớp chung', ['Lớp chung','Lớp chung GV','Lop chung','Class Common']],
    ['Phụ đạo', ['Lớp phụ đạo','Phụ đạo','Lớp phụ đạo GV','Lop phu dao','Class Assist']],
    ['Lớp kèm', ['Lớp kèm','Lớp kèm GV','Lop kem','Class Tutoring']],
    ['Phụ đạo kèm', ['Lớp phụ đạo kèm','Phụ đạo kèm','Lop phu dao kem','Class Assist Tutoring']],
    ['Placement Test',['Placement Test','Placement test']],
    ['Văn phòng', ['Văn phòng','Van phong','Office']],
  ]
  const normalizeSheet = value => String(value || '').trim().toLocaleLowerCase('vi-VN').replace(/\s+/g,' ')
  const sheetMap = new Map(wb.SheetNames.map(name => [normalizeSheet(name), name]))
  const result = []
  const errors = [],skipped=[];let blankRows=0
  for (const [category, aliases] of expected) {
    let sheetName = aliases.map(normalizeSheet).map(name => sheetMap.get(name)).find(Boolean)

    if (!sheetName && category==='Placement Test') continue
    if (!sheetName) { errors.push(`${category}: không tìm thấy sheet`); continue }
    try {
      const rows = await parseAttendanceFile(file, category, sheetName)
      result.push(...rows);skipped.push(...(rows.importAudit?.skipped||[]));blankRows+=rows.importAudit?.blankRows||0
    } catch (e) {
      // Một sheet lỗi/không có dòng hợp lệ không được làm hỏng các sheet còn lại.
      errors.push(`${category}: ${e.message}`)
    }
  }
  if (!result.length&&!skipped.length) throw new Error(`Không đọc được dữ liệu từ các sheet. ${errors.join(' | ')}`)
  Object.defineProperty(result,'importAudit',{value:{skipped,blankRows,warnings:errors},enumerable:false})
  Object.defineProperty(result,'importWarnings',{value:errors,enumerable:false})
  return result
}

function findHeaderRow(rows, category) {
  const required = category === 'Placement Test' ? [['ngày'],['tên hv','tên học viên'],['placement test'],['tên gv']] : category === 'Văn phòng'
    ? [['ngày'], ['tên nhân viên','họ và tên','tên nv','nhân viên']]
    : [['ngày'], ['tên lớp','lớp'], ['tên gv','giáo viên','teacher','tên tg','trợ giảng','ta']]
  const max = Math.min(rows.length, 12)
  for (let r = 0; r < max; r++) {
    const headers = rows[r].map(normalizeHeader)
    const ok = required.every(group => group.some(x => headers.includes(normalizeHeader(x))))
    if (ok) return r
  }
  if (category === 'Văn phòng') {
    for(let r=0;r<max-1;r++) if(rows[r].some(v=>normalizeHeader(v)==='giờ vào') && rows[r+1].some(v=>normalizeHeader(v)==='nhân viên')) return r
  }
  throw new Error('Không nhận diện được header của sheet.')
}

function durationHours(value, start, end, format='') {
  const duration=calcHours(start,end), raw=Number(String(value ?? '').replace(',','.'))
  if(value === '' || value == null || !Number.isFinite(raw)) return start&&end?duration:''
  if(typeof value==='string' && /\d+:\d+/.test(value)) return calcHours('00:00',value)
  if(raw>0 && raw<1 && (/h|s/i.test(format) || (duration>0 && Math.abs(raw*24-duration)<0.02))) return raw*24
  return raw
}

export async function parseAttendanceFile(file, category = 'Lớp chung', sheetName = '') {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: false })
  const selectedSheet = sheetName || wb.SheetNames[0]
  const ws = wb.Sheets[selectedSheet]
  if (!ws) throw new Error('Không tìm thấy sheet đã chọn.')
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
  if (!rows.length) throw new Error('Sheet được chọn không có dữ liệu.')
  const headerRow = findHeaderRow(rows, category)
  const headers = rows[headerRow].map(normalizeHeader)
  let dataStart=headerRow+1
  if(category==='Văn phòng' && !headers.some(x=>['tên nhân viên','họ và tên','tên nv','nhân viên'].includes(x))) {
    rows[headerRow+1].forEach((v,i)=>{if(normalizeHeader(v)==='nhân viên') headers[i]='tên nhân viên'})
    headers[0]='ngày'; dataStart++
  }
  const excelRowOffset=ws['!ref']?XLSX.utils.decode_range(ws['!ref']).s.r:0;const out = [],skipped=[];let blankRows=0;const skip=(row,r,reasons)=>{if(row.every(v=>!hasData(v))){blankRows++;return}skipped.push({sheet:selectedSheet,row:r+1+excelRowOffset,reason:reasons.filter(Boolean).join('; ')})}
  if (category === 'Placement Test') {
    const dateI=idx(headers,['Ngày']),dayI=idx(headers,['Thứ']),studentI=idx(headers,['Tên HV','Tên học viên']),amountI=idx(headers,['Placement Test']),teacherI=idx(headers,['Tên GV'])
    for(let r=dataStart;r<rows.length;r++){const row=rows[r],date=excelDateToISO(row[dateI]),teacher=String(row[teacherI]??'').trim(),student=String(row[studentI]??'').trim();if(!date||!teacher||!student){skip(row,r,[!date?'Ngày trống hoặc không hợp lệ':'',!teacher?'Thiếu tên GV':'',!student?'Thiếu tên học viên':'']);continue;}const raw=row[amountI],numeric=raw!==''&&raw!=null&&Number.isFinite(Number(String(raw).replace(',','.'))),testName=numeric?'':String(raw??'').trim();const amount=numeric?numberValue(raw):20000;if(amount<0)throw Error('Tiền Placement Test không được âm.');out.push({id:crypto.randomUUID(),category:'Placement Test',period:date.slice(0,7),date,day:String(row[dayI]??'').trim(),student,testName,amount,teacher,ta:'',hours:0,className:'',sourceSheet:selectedSheet})}
  } else if (category === 'Văn phòng') {
    const dateI = idx(headers, ['Ngày']), dayI = idx(headers, ['Thứ','Buổi']), nameI = idx(headers, ['Tên nhân viên','Họ và tên','Tên NV','Nhân viên'])
    const startI = idx(headers, ['Giờ in','Giờ vào','Giờ bắt đầu']), endI = idx(headers, ['Giờ out','Giờ ra','Giờ kết thúc']), hoursI = idx(headers, ['Tổng số giờ','Tổng giờ','Số giờ'])
    if (dateI === undefined || nameI === undefined) throw new Error('Sheet Văn phòng phải có Ngày và Tên nhân viên.')
    for (let r=dataStart;r<rows.length;r++) {
      const row=rows[r], name=String(row[nameI]??'').trim(), date=excelDateToISO(row[dateI])
      if (!date || !name){skip(row,r,[!date?'Ngày trống hoặc không hợp lệ':'',!name?'Thiếu tên nhân viên':'']);continue}
      const start=startI===undefined?'':timeToHHMM(row[startI]), end=endI===undefined?'':timeToHHMM(row[endI])
      let hours=durationHours(row[hoursI],start,end,ws[XLSX.utils.encode_cell({r,c:hoursI??0})]?.z)
      out.push({id:crypto.randomUUID(),period:date.slice(0,7),date,day:String(row[dayI]??'').trim(),className:'',start,end,hours:hasData(hours)?Math.round(hours*100)/100:'',teacher:'',ta:'',employee:name,category:'Văn phòng',sourceSheet:selectedSheet})
    }
  } else {
    const dateI=idx(headers,['Ngày']), dayI=idx(headers,['Thứ','Buổi']), classI=idx(headers,['Tên lớp','Lớp'])
    const startI=idx(headers,['Giờ bắt đầu','Giờ vào']), endI=idx(headers,['Giờ kết thúc','Giờ ra']), hoursI=idx(headers,['Tổng giờ','Số giờ'])
    const teacherI=idx(headers,['Tên GV','Giáo viên','Teacher']), taI=idx(headers,['Tên TG','Trợ giảng','TA'])
    if(dateI===undefined || classI===undefined || (teacherI===undefined && taI===undefined)) throw new Error('Sheet lớp phải có Ngày, Tên lớp và Tên GV/Tên TG.')
    for(let r=dataStart;r<rows.length;r++){
      const row=rows[r], teacher=teacherI===undefined?'':String(row[teacherI]??'').trim(), ta=taI===undefined?'':String(row[taI]??'').trim(), className=String(row[classI]??'').trim(), date=excelDateToISO(row[dateI])
      if(!date || (!teacher&&!ta) || !className){skip(row,r,[!date?'Ngày trống hoặc không hợp lệ':'',(!teacher&&!ta)?'Thiếu cả tên GV và TG':'',!className?'Thiếu tên lớp':'']);continue}
      const start=startI===undefined?'':timeToHHMM(row[startI]), end=endI===undefined?'':timeToHHMM(row[endI]); let hours=durationHours(row[hoursI],start,end,ws[XLSX.utils.encode_cell({r,c:hoursI??0})]?.z)
      out.push({id:crypto.randomUUID(),period:date.slice(0,7),date,day:String(row[dayI]??'').trim(),className,start,end,hours:hasData(hours)?Math.round(hours*100)/100:'',teacher,ta,category,sourceSheet:selectedSheet})
    }
  }
  Object.defineProperty(out,'importAudit',{value:{skipped,blankRows,warnings:[]},enumerable:false})
  if(!out.length&&!skipped.length) throw new Error('Không tìm thấy dữ liệu phù hợp trong sheet đã chọn.')
  return out
}

function styleSheet(ws, headers, rows, widths) {
  ws['!cols'] = widths.map(wch=>({wch}))
  const range = XLSX.utils.decode_range(ws['!ref'])
  for(let c=range.s.c;c<=range.e.c;c++){
    const cell=ws[XLSX.utils.encode_cell({r:0,c})]
    if(cell) { cell.s={font:{name:'Times New Roman',sz:10,bold:true},fill:{fgColor:{rgb:'D9EAF7'}},alignment:{horizontal:'center',vertical:'center'}} }
  }
  for(let r=1;r<=range.e.r;r++) for(let c=range.s.c;c<=range.e.c;c++){
    const cell=ws[XLSX.utils.encode_cell({r,c})]
    if(cell) cell.s={...(cell.s||{}),font:{name:'Times New Roman',sz:10},alignment:{vertical:'center'}}
  }
  if(range.e.r>=1){
    ws['!autofilter']={ref:`A1:${XLSX.utils.encode_col(range.e.c)}${range.e.r+1}`}
    ws['!freeze']={xSplit:0,ySplit:1}
  }
}
function addTableLike(ws, ref, name){ ws['!tables']=[{name,ref,displayName:name}].filter(Boolean) }

export async function buildLegacySampleWorkbookBuffer() {
  const wb = new ExcelJS.Workbook()
  const classRows = [['Ngày','Thứ','Tên lớp','Giờ bắt đầu','Giờ kết thúc','Tổng giờ','Tên GV','Tên TG'], ['2026-10-01','THU 5','KET 1-6','18:00','19:30',1.5,'Nguyễn Văn A','']]
  const officeRows = [['Ngày','Thứ','Tên nhân viên','Giờ in','Giờ out','Tổng số giờ'], ['2026-10-01','THU 5','Nguyễn Văn A','08:00','17:00',8]]
  const classNotes=['Ngày làm việc. Có thể nhập ngày Excel hoặc dd/mm/yyyy.','Thứ tương ứng với ngày.','Tên lớp; giữ nguyên ký hiệu %/ONL nếu có vì dùng để tính lương.','Giờ bắt đầu.','Giờ kết thúc.','Tổng giờ; nếu để trống web có thể tự tính từ giờ bắt đầu/kết thúc.','Tên giáo viên.','Tên trợ giảng.']
  const officeNotes=['Ngày làm việc.','Thứ tương ứng với ngày.','Tên nhân viên.','Giờ vào.','Giờ ra.','Tổng số giờ làm việc.']
  const addSheet=(name,rows,tableName,notes)=>{const ws=wb.addWorksheet(name);rows.forEach(r=>ws.addRow(r));ws.addTable({name:tableName,ref:'A1',rows:rows.slice(1),headerRow:true,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:rows[0].map(name=>({name}))});ws.getRow(1).font={name:'Times New Roman',size:10,bold:true};ws.getRow(1).eachCell(c=>c.note=headerNote(c.value,notes[c.col-1]));for(let r=2;r<=rows.length;r++)ws.getRow(r).font={name:'Times New Roman',size:10};ws.columns.forEach(c=>{c.width=18});ws.views=[{state:'frozen',ySplit:1}]}
  addSheet('Lớp chung',classRows,'ClassCommon',classNotes);addSheet('Lớp phụ đạo',classRows,'ClassAssist',classNotes);addSheet('Lớp kèm',classRows,'ClassTutoring',classNotes);addSheet('Lớp phụ đạo kèm',classRows,'ClassAssistTutoring',classNotes);addSheet('Văn phòng',officeRows,'Office',officeNotes)
  return await writeExcelBuffer(wb)
}
export async function makeSampleWorkbook(){const out=await buildSampleWorkbookBuffer();downloadBuffer(out,'MAU_IMPORT_CHAM_CONG.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
function downloadBuffer(buf,name,type){const blob=new Blob([buf],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

const LEGACY_EMPLOYEE_COLUMNS=['Họ và tên','Ngân hàng','STK','Lương lớp chung','Lương phụ đạo','Lương kèm','Lương phụ đạo kèm','Lương Văn phòng (full)','Lương văn phòng (Part)','Lương chuyển khoản','Mức đóng BH','Thưởng','Hỗ trợ','Phụ cấp cơm','Chi nhánh','Chức vụ','Không cần chấm công','Cơ chế lương đặc biệt','Email','Ngày vào làm','Ngày nghỉ làm','Đã nghỉ việc']
function numberValue(value){if(typeof value==='number')return Number.isFinite(value)?value:0;const s=String(value??'').trim().replace(/\s/g,'').replace(/\./g,'').replace(/,/g,'.');const n=Number(s);return Number.isFinite(n)?n:0}
function boolValue(v){return ['1','true','x','yes','có'].includes(String(v??'').trim().toLowerCase())}
export async function parseEmployeeFile(file){const buf=await file.arrayBuffer(),wb=XLSX.read(buf,{type:'array',cellDates:true}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});if(!rows.length)throw new Error('File nhân viên không có dữ liệu.');const headers=rows[0].map(normalizeHeader);const aliases={name:['Họ và tên','Họ tên','Tên nhân viên'],bank:['Ngân hàng','Ngân hàng chuyển lương'],account:['STK','Số tài khoản','Số TK'],class:['Lương lớp chung'],assist:['Lương phụ đạo'],tutoring:['Lương kèm'],assistTutoring:['Lương phụ đạo kèm'],full:['Lương Văn phòng (full)','Lương văn phòng (full)','Lương Văn phòng Full','Lương VP Full'],part:['Lương văn phòng (Part)','Lương Văn phòng (Part)','Lương VP Part'],transfer:['Lương chuyển khoản','Lương CK','Lương chuyển khoản cố định'],insuranceBase:['Mức đóng BH','Mức đóng BHXH'],bonus:['Thưởng'],support:['Hỗ trợ'],mealAllowance:['Phụ cấp cơm'],branch:['Chi nhánh'],position:['Chức vụ'],noAttendance:['Không cần chấm công'],special:['Cơ chế lương đặc biệt'],special1:['Cơ chế 1'],special2:['Cơ chế 2'],special3:['Cơ chế 3'],special4:['Cơ chế 4'],companyTransfer:['Chuyển khoản từ tài khoản công ty'],specialInsurance:['Cơ chế tính bảo hiểm đặc biệt'],insuranceAmount:['Số tiền bảo hiểm đặc biệt'],email:['Email'],startDate:['Ngày vào làm'],endDate:['Ngày nghỉ làm'],resigned:['Đã nghỉ việc']};const idx2=names=>names.map(normalizeHeader).map(n=>headers.indexOf(n)).find(i=>i>=0);const I=Object.fromEntries(Object.entries(aliases).map(([k,v])=>[k,idx2(v)]));if(I.name===undefined)throw new Error('File nhân viên thiếu cột “Họ và tên”.');const out=[],skipped=[];let blankRows=0;for(let r=1;r<rows.length;r++){const row=rows[r],name=String(row[I.name]??'').trim();if(!name){if(row.every(v=>!hasData(v)))blankRows++;else skipped.push({sheet:wb.SheetNames[0],row:r+1+(ws['!ref']?XLSX.utils.decode_range(ws['!ref']).s.r:0),reason:'Thiếu họ và tên'});continue;}const specials=I.special!==undefined?String(row[I.special]??'').split(';').map(x=>x.trim()).filter(Boolean):[];const special1=I.special1!==undefined?boolValue(row[I.special1]):specials.includes('1');const special2=I.special2!==undefined?boolValue(row[I.special2]):specials.includes('2');const special3=I.special3!==undefined?boolValue(row[I.special3]):specials.includes('3');const special4=I.special4!==undefined?boolValue(row[I.special4]):specials.includes('4');if(special3&&special4)throw Error('Nhân viên '+name+': chỉ được chọn một trong cơ chế 3 hoặc 4.');out.push({id:crypto.randomUUID(),name,email:I.email===undefined?'':String(row[I.email]??'').trim(),startDate:I.startDate===undefined?'':excelDateToISO(row[I.startDate]),endDate:I.endDate===undefined?'':excelDateToISO(row[I.endDate]),resigned:I.resigned===undefined?false:boolValue(row[I.resigned]),documents:[],bank:I.bank===undefined?'':String(row[I.bank]??'').trim(),account:I.account===undefined?'':String(row[I.account]??'').trim(),branch:I.branch===undefined?'':String(row[I.branch]??'').trim(),position:I.position===undefined?'':String(row[I.position]??'').trim(),noAttendance:I.noAttendance===undefined?false:boolValue(row[I.noAttendance]),salary:{teacher:{class:I.class===undefined||!hasData(row[I.class])?'':numberValue(row[I.class]),assist:I.assist===undefined||!hasData(row[I.assist])?'':numberValue(row[I.assist]),tutoring:I.tutoring===undefined||!hasData(row[I.tutoring])?'':numberValue(row[I.tutoring]),assistTutoring:I.assistTutoring===undefined||!hasData(row[I.assistTutoring])?'':numberValue(row[I.assistTutoring])},office:{full:I.full===undefined||!hasData(row[I.full])?'':numberValue(row[I.full]),part:I.part===undefined||!hasData(row[I.part])?'':numberValue(row[I.part])},insuranceBase:I.insuranceBase===undefined||!hasData(row[I.insuranceBase])?'':numberValue(row[I.insuranceBase]),transfer:I.transfer===undefined||!hasData(row[I.transfer])?'':numberValue(row[I.transfer]),bonus:I.bonus===undefined||!hasData(row[I.bonus])?'':numberValue(row[I.bonus]),support:I.support===undefined||!hasData(row[I.support])?'':numberValue(row[I.support]),mealAllowance:I.mealAllowance===undefined||!hasData(row[I.mealAllowance])?'':numberValue(row[I.mealAllowance]),special1,special2,special3,special4,companyTransfer:I.companyTransfer===undefined?false:boolValue(row[I.companyTransfer]),specialInsurance:I.specialInsurance===undefined?false:boolValue(row[I.specialInsurance]),insuranceAmount:I.insuranceAmount===undefined||!hasData(row[I.insuranceAmount])?'':numberValue(row[I.insuranceAmount])}})}Object.defineProperty(out,'importAudit',{value:{skipped,blankRows,warnings:[]},enumerable:false});if(!out.length&&!skipped.length)throw new Error('Không tìm thấy nhân viên hợp lệ trong file.');return out}
export async function buildLegacyEmployeeSampleWorkbookBuffer(){const rows=[LEGACY_EMPLOYEE_COLUMNS,['Nguyễn Văn A','Vietcombank','0123456789',350000,300000,400000,0,7000000,45000,5000000,5000000,0,0,0,'CN1','Giáo viên',0,'1; 2','a@example.com','2026-01-01','',0],['Trần Thị B','ACB','0987654321',0,300000,0,0,0,50000,3000000,0,0,0,0,'CN1','Trợ giảng',1,'3','b@example.com','2025-01-01','2026-09-30',1]];const notes=['Tên đầy đủ, bắt buộc.','Tên ngân hàng nhận lương, dạng văn bản. Ví dụ: Vietcombank. Có thể để trống.','Nhập dạng Text để giữ số 0 đầu. Ví dụ: 0123456789. Không nhập dạng số khoa học.','Đơn giá lớp chung.','Đơn giá phụ đạo.','Đơn giá lớp kèm.','Đơn giá phụ đạo kèm.','Lương văn phòng Full.','Lương văn phòng Part theo giờ.','Nếu > 0, MS3 được tạo kèm mẫu GV/VP.','Nếu > 0, mẫu BH tương ứng được tạo khi có GV/VP.','Khoản thưởng.','Khoản hỗ trợ.','Phụ cấp cơm.','Nhập TP → tích TP.\n• Nhập PN → tích PN.\n• Tên khác (ví dụ Bình Thạnh) → tích Chi nhánh khác và điền textbox.\n• Nhiều lựa chọn tách bằng ;. Dùng khi gom file xuất theo chi nhánh.','Nhập GV → tích GV.\n• Nhập VP → tích VP.\n• Tên khác (ví dụ Điều phối) → tích Chức vụ khác và điền textbox.\n• Nhiều lựa chọn tách bằng ;. Dùng trong thông tin phiếu và tên file.','1 = Không cần chấm công; 0/trống = không bật.','Nhập 1; 2; 3; 4 (tách bằng dấu ;), hoặc để trống. Ví dụ: 1; 3.\n1: lớp có % áp dụng 80%.\n2: chỉ Lớp kèm ONL áp dụng 80%.\n3: IELTS - 56% ONL áp dụng 100%. 4: Lớp chung có % dùng 170.000đ/giờ. Ưu tiên 4/3 → 2/1. Chỉ chọn một trong 3 hoặc 4. Không giảm thêm 20%.'];const wb=new ExcelJS.Workbook();notes.push('Email của nhân viên. Có thể để trống.','Ngày vào làm: yyyy-mm-dd hoặc dd/mm/yyyy.','Ngày nghỉ làm: yyyy-mm-dd hoặc dd/mm/yyyy. Không trước ngày vào làm.','1 = Đã nghỉ việc, chuyển vào mục Đã nghỉ việc. 0/trống = đang làm việc.');const ws=wb.addWorksheet('Nhân viên');rows.forEach(r=>ws.addRow(r));ws.addTable({name:'Employees',ref:'A1',rows:rows.slice(1),headerRow:true,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:LEGACY_EMPLOYEE_COLUMNS.map(name=>({name}))});ws.getRow(1).font={name:'Times New Roman',size:10,bold:true};ws.getRow(1).eachCell(c=>c.note=headerNote(c.value,notes[c.col-1]));for(let r=2;r<=rows.length;r++)ws.getRow(r).font={name:'Times New Roman',size:10};ws.getColumn(3).numFmt='@';ws.columns.forEach((c,i)=>{c.width=i===0?28:22});ws.views=[{state:'frozen',ySplit:1}];
for(let c=1;c<=LEGACY_EMPLOYEE_COLUMNS.length;c++){
 const title=LEGACY_EMPLOYEE_COLUMNS[c-1], text=notes[c-1]
 for(let r=2;r<=rows.length;r++)ws.getCell(r,c).note=headerNote(title,text)
 ws.dataValidations.add(ws.getColumn(c).letter+'2:'+ws.getColumn(c).letter+'1000',{type:'custom',formulae:['TRUE'],allowBlank:true,showInputMessage:true,promptTitle:title.slice(0,32),prompt:text.replace(/• /g,'').slice(0,255),showErrorMessage:false})
}
return await writeExcelBuffer(wb)}
export async function makeEmployeeSampleWorkbook(){const out=await buildEmployeeSampleWorkbookBuffer();downloadBuffer(out,'MAU_IMPORT_NHAN_VIEN.xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}


async function suppliedSample(name){const response=await fetch('/'+name);if(!response.ok)throw Error('Không tải được file mẫu.');return response.arrayBuffer()}
export async function buildSampleWorkbookBuffer(){return suppliedSample('MAU_IMPORT_CHAM_CONG.xlsx')}
export async function buildEmployeeSampleWorkbookBuffer(){return suppliedSample('MAU_IMPORT_NHAN_VIEN.xlsx')}

export const EMPLOYEE_COLUMNS=['Họ và tên','Chi nhánh','Chức vụ','Email','Ngân hàng','STK','Lương lớp chung','Lương phụ đạo','Lương kèm','Lương phụ đạo kèm','Lương Văn phòng (full)','Lương văn phòng (Part)','Lương chuyển khoản','Mức đóng BH','Thưởng','Hỗ trợ','Phụ cấp cơm','Không cần chấm công','Cơ chế lương đặc biệt','Ngày vào làm','Ngày nghỉ làm','Đã nghỉ việc','Chuyển khoản từ tài khoản công ty','Cơ chế tính bảo hiểm đặc biệt','Số tiền bảo hiểm đặc biệt']
