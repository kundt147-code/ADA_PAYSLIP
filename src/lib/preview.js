import ExcelJS from 'exceljs'
export async function previewGrid(buf,sheet){
    const wb=new ExcelJS.Workbook();await wb.xlsx.load(buf);const result={}
    const wanted=[sheet]
    for(const name of wanted){
     const ws=wb.getWorksheet(name);if(!ws)continue
     const maxRows=Math.min(ws.rowCount,120);let meaningfulCols=1
     ws.eachRow((row,r)=>{if(r<=maxRows)row.eachCell(cell=>{if(cell.value!==null&&cell.value!==undefined)meaningfulCols=Math.max(meaningfulCols,cell.col)})})
     const maxCols=Math.min(meaningfulCols,80)
     const merges=Object.values(ws._merges||{}).map(m=>m.model||m).filter(m=>m.top<=maxRows&&m.left<=maxCols)
     // Excel lets unmerged heading text flow into adjacent blank cells.
     for(let r=1;r<=Math.min(4,maxRows);r++)for(let c=1;c<=maxCols;c++){
      const cell=ws.getCell(r,c);if(!cell.value||cell.alignment?.wrapText||merges.some(m=>r>=m.top&&r<=m.bottom&&c>=m.left&&c<=m.right))continue
      let right=c;while(right<maxCols&&!ws.getCell(r,right+1).value&&!merges.some(m=>r>=m.top&&r<=m.bottom&&right+1>=m.left&&right+1<=m.right))right++
      if(right>c)merges.push({top:r,bottom:r,left:c,right})
     }
     const cells=[];let lastMeaningfulRow=1
     for(let r=1;r<=maxRows;r++){
      const row=[]
      for(let c=1;c<=maxCols;c++){
       let covered=false
       for(const m of merges){if(r>=m.top&&r<=Math.min(m.bottom,maxRows)&&c>=m.left&&c<=Math.min(m.right,maxCols)&&!(r===m.top&&c===m.left)){covered=true;break}}
       if(covered)continue
       const cell=ws.getCell(r,c);let rowspan=1,colspan=1
       for(const m of merges){if(r===m.top&&c===m.left){rowspan=Math.min(m.bottom,maxRows)-m.top+1;colspan=Math.min(m.right,maxCols)-m.left+1;break}}
       const value=displayCell(cell.value,cell)
       if(value!=='')lastMeaningfulRow=Math.max(lastMeaningfulRow,r)
       row.push({r,c,value,rowspan,colspan,font:cell.font,fill:cell.fill,alignment:cell.alignment,border:cell.border,numFmt:cell.numFmt})
      }
      cells.push(row)
     }
     result[name]={cells:cells.slice(0,lastMeaningfulRow),rowCount:lastMeaningfulRow,columnCount:maxCols,columnWidths:Array.from({length:maxCols},(_,i)=>ws.getColumn(i+1).width||12)}
    }

return result
}
function displayCell(v,cell){if(v===null||v===undefined)return '';if(v instanceof Date)return `${String(v.getHours()).padStart(2,'0')}:${String(v.getMinutes()).padStart(2,'0')}`;if(typeof v==='object'&&v.richText)return v.richText.map(x=>x.text).join('');if(typeof v==='object'&&v.formula!==undefined)return v.result??'';if(typeof v==='number'&&cell?.numFmt&&/#,##0/.test(cell.numFmt)){if(v===0&&/\"-\"/.test(cell.numFmt))return '-';return v.toLocaleString('vi-VN')}return String(v)}
