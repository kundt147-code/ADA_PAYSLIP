export const hasData=value=>value!==null&&value!==undefined&&String(value).trim()!=='';
export const branchCode=value=>({ 'PHÚ NHUẬN':'PN','TÂN PHÚ':'TP' }[String(value||'').trim().toLocaleUpperCase('vi-VN')]||String(value||'').trim());
export const employeeBranches=e=>[...new Set(String(e.branch||'').split(';').map(branchCode).filter(Boolean))];
export function availableBranches(employees,attendance){return [...new Set([...employees.flatMap(employeeBranches),...attendance.map(r=>branchCode(r.branch)).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,'vi'))}
export function insuranceAmount(e){return e.salary?.specialInsurance&&hasData(e.salary.insuranceAmount)?Number(e.salary.insuranceAmount):Number(e.salary?.insuranceBase||0)*.105}
export function activeTypes(p){const all=[...new Set(p.types||[])];let salary;
 if(all.includes('teacherBH'))salary='teacherBH';
 else if(all.includes('teacher'))salary='teacher';
 else if(all.includes('officeBH'))salary='officeBH';
 else if(all.includes('office'))salary='office';
 return [...(all.includes('transfer')?['transfer']:[]),...(salary?[salary]:[])];
}
export function selectInsuranceBranch(candidates,amount){
 const ordered=[...candidates].sort((a,b)=>b.gross-a.gross||(a.branch==='PN'?-1:b.branch==='PN'?1:a.branch.localeCompare(b.branch,'vi')));
 if(!ordered.length)return null;
 if(amount<=0)return ordered[0].branch;
 return ordered.find(c=>c.gross>=amount)?.branch??null;
}
export function branchEmployee(employee,branch){
 return {...employee,branch};
}
