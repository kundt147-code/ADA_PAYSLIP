export function attendanceRoleHours(rows,name=''){
 const normalize=value=>String(value||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi-VN')
 const selected=normalize(name);let main=0,assist=0
 for(const row of rows){const teacher=normalize(row.teacher),ta=normalize(row.ta),hours=Number(row.hours)||0
  const isMain=!!teacher&&(!selected||teacher===selected)
  const isAssist=!!ta&&(!selected||ta===selected)&&ta!==teacher
  if(isMain)main+=hours
  if(isAssist)assist+=hours
 }
 return {main,assist}
}
