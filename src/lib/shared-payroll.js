import {useEffect,useRef,useState} from 'react'

// Save only changed IDs, so one browser cannot erase rows added by another.
export class SharedCollection {
 constructor(client,table,key=null){this.key=key;this.client=client;this.table=table;this.shown=new Map();this.pending=new Map(key?JSON.parse(localStorage.getItem(key)||'[]'):[]);this.chain=Promise.resolve()}
 persist(){if(this.key)localStorage.setItem(this.key,JSON.stringify([...this.pending]))}
 accept(rows){this.shown=new Map(rows.map(row=>[row.id,JSON.stringify(row)]));return rows}
 edit(rows){const next=new Map(rows.map(row=>[row.id,JSON.stringify(row)]));for(const [id,json] of next)if(this.shown.get(id)!==json)this.pending.set(id,JSON.parse(json));for(const id of this.shown.keys())if(!next.has(id))this.pending.set(id,null);this.shown=next;this.persist()}
 flush(){const operation=async()=>{for(const [id,row] of [...this.pending]){const {error}=row?await this.client.from(this.table).upsert({id,data:row}):await this.client.from(this.table).delete().eq('id',id);if(error)throw error;if(this.pending.get(id)===row)this.pending.delete(id);this.persist()}};this.chain=this.chain.then(operation,operation);return this.chain}
 async load(){const rows=[];for(let from=0;;from+=500){const {data,error}=await this.client.from(this.table).select('id,data').order('id').range(from,from+499);if(error)throw error;rows.push(...data.map(row=>({...row.data,id:row.id})));if(data.length<500)break}const merged=new Map(rows.map(row=>[row.id,row]));for(const [id,row] of this.pending){if(row)merged.set(id,row);else merged.delete(id)}return this.accept([...merged.values()])}
 async importMissing(rows){const remote=await this.load(),known=new Set(remote.map(row=>row.id));for(const row of rows)if(!known.has(row.id))this.pending.set(row.id,row);this.persist();await this.flush();return this.load()}
}
export function useSharedPayroll(client,user,attendance,payslips,setAttendance,setPayslips,setError){
 const refreshRef=useRef(null),[connectionError,setConnectionError]=useState(''),stores=useRef(null),[ready,setReady]=useState(false),[saving,setSaving]=useState(false)
 useEffect(()=>{if(!client||!user){stores.current=null;setReady(false);if(client){setAttendance([]);setPayslips([])}return}let disposed=false,running=false;const a=new SharedCollection(client,'payroll_attendance','payroll_pending_att_'+user.id),p=new SharedCollection(client,'payroll_payslips','payroll_pending_ps_'+user.id);stores.current={a,p};setReady(false);setConnectionError('')
 const refresh=async()=>{if(running||disposed)return;running=true;try{await a.flush();await p.flush();const [ar,pr]=await Promise.all([a.load(),p.load()]);if(!disposed){setAttendance(ar);setPayslips(pr);setReady(true);setConnectionError('')}}catch(error){if(!disposed){setConnectionError(error.message);setError('Chưa đồng bộ dữ liệu dùng chung: '+error.message)}}finally{running=false}}
 refreshRef.current=refresh;refresh();const timer=setInterval(refresh,15000);window.addEventListener('focus',refresh);return()=>{disposed=true;clearInterval(timer);window.removeEventListener('focus',refresh);if(stores.current?.a===a)stores.current=null}
 },[client,user?.id])
 useEffect(()=>{if(!ready||!stores.current)return;const {a,p}=stores.current;a.edit(attendance);p.edit(payslips);let active=true;setSaving(true);Promise.all([a.flush(),p.flush()]).catch(error=>{if(active)setError('Chưa lưu lên dữ liệu dùng chung: '+error.message)}).finally(()=>{if(active)setSaving(false)});return()=>{active=false}},[attendance,payslips,ready])
 return {ready,saving,connectionError,retry:()=>refreshRef.current?.(),importLocal:async(a,p)=>{if(!ready||!stores.current)throw Error('Hãy chờ tải dữ liệu dùng chung.');const rows=await stores.current.a.importMissing(a),slips=await stores.current.p.importMissing(p);setAttendance(rows);setPayslips(slips)}}
}
