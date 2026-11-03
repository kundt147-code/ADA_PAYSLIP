import {headerNote} from './excel-notes.js'
import ExcelJS from 'exceljs'
import {writeExcelBuffer} from './xlsx-output.js'
import {EMPLOYEE_FIELDS} from './employee-columns.js'
function fieldValue(employee,field){if(field.path==='mechanisms')return [1,2,3,4].filter(i=>employee.salary?.['special'+i]).join('; ');const value=field.path.split('.').reduce((obj,k)=>obj?.[k],employee);return typeof value==='boolean'?(value?1:0):value??''}
export async function employeeExportBuffer(employees){
 const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Thông tin nhân viên');const rows=employees.map(employee=>EMPLOYEE_FIELDS.map(field=>fieldValue(employee,field)));
 ws.addTable({name:'EmployeeExport',ref:'A1',rows,headerRow:true,style:{theme:'TableStyleMedium2',showRowStripes:true},columns:EMPLOYEE_FIELDS.map(field=>({name:field.header}))});
 EMPLOYEE_FIELDS.forEach((field,index)=>{const col=ws.getColumn(index+1);col.width=field.width;col.numFmt=field.format;const header=ws.getCell(1,index+1);header.note=headerNote(field.header,field.note);for(let r=2;r<=employees.length+1;r++){const c=ws.getCell(r,index+1);c.font={name:'Times New Roman',size:10};c.numFmt=field.format}});
 ws.getRow(1).font={name:'Times New Roman',size:10,bold:true};ws.getRow(1).height=30;ws.getRow(1).alignment={vertical:'middle',wrapText:true};ws.views=[{state:'frozen',ySplit:1}];return writeExcelBuffer(wb)
}
