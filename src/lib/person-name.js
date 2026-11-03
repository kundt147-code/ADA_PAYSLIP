// Compare alternate Vietnamese tone placement without removing tones or vowel marks.
export function normalizePersonName(value){
 let text=String(value??'').trim().replace(/^(mr\.?|mrs\.?|ms\.?|miss\.?|dr\.?)\s+/i,'').replace(/\s+/g,' ').toLocaleLowerCase('vi-VN').normalize('NFD');
 const tones='[\u0300\u0301\u0303\u0309\u0323]';
 for(const pair of ['oa','oe','uy'])text=text.replace(new RegExp('('+pair[0]+')('+tones+'?)('+pair[1]+')('+tones+'?)','g'),(all,a,t1,b,t2)=>t1&&t2?all:a+b+(t1||t2));
 return text.normalize('NFC');
}
