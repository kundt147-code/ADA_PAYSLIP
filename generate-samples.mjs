// The supplied sample workbooks are versioned assets. Do not regenerate their formatting.
import fs from 'node:fs/promises';import ExcelJS from 'exceljs';
for(const name of ['MAU_IMPORT_NHAN_VIEN.xlsx','MAU_IMPORT_CHAM_CONG.xlsx']){const wb=new ExcelJS.Workbook();await wb.xlsx.load(await fs.readFile('public/'+name));console.log(name+': verified '+wb.worksheets.length+' sheets')}
