export async function downloadFile(data,name,type='application/octet-stream'){
 const blob=data instanceof Blob?data:new Blob([data],{type})
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
 return true
}
