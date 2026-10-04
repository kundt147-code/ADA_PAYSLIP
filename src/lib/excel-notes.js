export function headerNote(title,text){
 const body=String(text).replace(/\. (?=[A-ZĐNVC])/g,'.\n• ')
 return {texts:[{text:title+'\n',font:{name:'Times New Roman',size:11,bold:true,color:{argb:'FF064E3B'}}},{text:'• '+body,font:{name:'Times New Roman',size:10}}],margins:{insetmode:'custom',inset:[0.2,0.2,0.2,0.2]},protection:{locked:'False',lockText:'False'},editAs:'absolute'}
}
