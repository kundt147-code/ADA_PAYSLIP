import JSZip from 'jszip'

// ExcelJS 4.4 writes legacyDrawing after tableParts/extLst. SpreadsheetML
// requires legacyDrawing before picture/oleObjects/controls/tableParts/extLst.
// Keep the notes, tables and relationships; correct only their element order.
export async function writeExcelBuffer(workbook,{visibleRows=false}={}) {
  const zip=await JSZip.loadAsync(await workbook.xlsx.writeBuffer())
  for(const name of Object.keys(zip.files).filter(n=>/^xl\/worksheets\/sheet\d+\.xml$/.test(n))) {
    let xml=await zip.file(name).async('string')
    if(visibleRows){
      xml=xml.replace(/<sheetFormatPr\b[^>]*>/g,tag=>tag.replace(/\s+zeroHeight="[^"]*"/g,''))
      const defaultHeight=Number(xml.match(/<sheetFormatPr\b[^>]*defaultRowHeight="([^"]+)"/)?.[1])||15
      xml=xml.replace(/<row\b[^>]*>/g,tag=>tag.replace(/\s+(?:hidden|collapsed)="[^"]*"/g,'').replace(/\bht="([^"]+)"/g,(attr,height)=>Number(height)>0?attr:'ht="'+defaultHeight+'"'))
      zip.file(name,xml)
    }
    const drawings=xml.match(/<legacyDrawing\b[^>]*\/>/g)
    if(!drawings)continue
    xml=xml.replace(/<legacyDrawing\b[^>]*\/>/g,'')
    const insertion=xml.search(/<(?:legacyDrawingHF|drawingHF|picture|oleObjects|controls|webPublishItems|tableParts|extLst)\b|<\/worksheet>/)
    if(insertion<0)throw new Error('Không tìm thấy worksheet hợp lệ: '+name)
    xml=xml.slice(0,insertion)+drawings.join('')+xml.slice(insertion)
    zip.file(name,xml)
  }
  // Size note boxes for readable multiline descriptions while retaining hover behavior.
  for(const name of Object.keys(zip.files).filter(n=>/\.vml$/.test(n))){let xml=await zip.file(name).async('string');xml=xml.replace(/width:97\.8pt;height:59\.1pt/g,'width:270pt;height:160pt');xml=xml.replace(/<x:Anchor>[^<]+<\/x:Anchor>([\s\S]*?<x:Row>)(\d+)(<\/x:Row>[\s\S]*?<x:Column>)(\d+)/g,(_,prefix,row,middle,col)=>'<x:Anchor>'+[Number(col)+1,6,Number(row),2,Number(col)+5,10,Number(row)+9,10].join(', ')+'</x:Anchor>'+prefix+row+middle+col);zip.file(name,xml)}
  return zip.generateAsync({type:'arraybuffer',compression:'DEFLATE'})
}
