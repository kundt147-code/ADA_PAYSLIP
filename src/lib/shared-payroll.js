import {useEffect,useLayoutEffect,useRef,useState} from 'react'

// Save only changed IDs, so one browser cannot erase rows added by another.
export class SharedCollection {
 constructor(client,table,key=null){this.key=key;this.client=client;this.table=table;this.shown=new Map();this.pending=new Map(key?JSON.parse(localStorage.getItem(key)||'[]'):[]);this.chain=Promise.resolve();this.retryAfter=0;this.failures=0;this.revision=0}
 persist(){if(this.key)localStorage.setItem(this.key,JSON.stringify([...this.pending]))}
 accept(rows){this.shown=new Map(rows.map(row=>[row.id,JSON.stringify(row)]));return rows}
 edit(rows){this.revision++;const next=new Map(rows.map(row=>[row.id,JSON.stringify(row)]));for(const [id,json] of next)if(this.shown.get(id)!==json)this.pending.set(id,JSON.parse(json));for(const id of this.shown.keys())if(!next.has(id))this.pending.set(id,null);this.shown=next;this.persist()}
 flush(force=false){if(this.inFlight)return this.inFlight;if(!force&&Date.now()<this.retryAfter)return Promise.reject(this.lastError);const operation=async()=>{while(this.pending.size){const entries=boundedEntries(this.pending),writes=entries.filter(([,row])=>row!==null),deletes=entries.filter(([,row])=>row===null);if(writes.length){const {error}=await this.client.from(this.table).upsert(writes.map(([id,row])=>({id,data:row})));if(error)throw error;for(const [id,row] of writes)if(this.pending.get(id)===row)this.pending.delete(id);this.persist()}if(deletes.length){const {error}=await this.client.from(this.table).delete().in('id',deletes.map(([id])=>id));if(error)throw error;for(const [id,row] of deletes)if(this.pending.has(id)&&this.pending.get(id)===row)this.pending.delete(id);this.persist()}}};this.inFlight=operation().then(()=>{this.failures=0;this.retryAfter=0;this.lastError=null}).catch(error=>{this.lastError=error;this.failures++;this.retryAfter=Date.now()+Math.min(300000,15000*2**Math.min(this.failures,5));throw error}).finally(()=>{this.inFlight=null});return this.inFlight}
 async load(){if(this.readInFlight)return this.readInFlight;this.readInFlight=this.loadRows().finally(()=>{this.readInFlight=null});return this.readInFlight}
 async loadRows(){const revision=this.revision;const rows=[],pageSize=this.table==='payroll_payslips'?50:250;for(let from=0;;from+=pageSize){const {data,error}=await this.client.from(this.table).select('id,data').order('id').range(from,from+pageSize-1);if(error)throw error;rows.push(...data.map(row=>({...row.data,id:row.id})));if(data.length<pageSize)break}const merged=new Map(rows.map(row=>[row.id,row]));for(const [id,row] of this.pending){if(row)merged.set(id,row);else merged.delete(id)}const result=[...merged.values()];return this.revision===revision?this.accept(result):result}
 async importMissing(rows){const remote=await this.load(),known=new Set(remote.map(row=>row.id));for(const row of rows)if(!known.has(row.id))this.pending.set(row.id,row);this.persist();await this.flush(true);return this.load()}
}
export function boundedEntries(pending,maxBytes=128*1024){const entries=[];let bytes=2;const encoder=new TextEncoder();for(const entry of pending){const size=encoder.encode(JSON.stringify({id:entry[0],data:entry[1]})).length+1;if(entries.length&&(bytes+size>maxBytes||entries.length>=50))break;entries.push(entry);bytes+=size}return entries}

export function useSharedPayroll(client,user,attendance,payslips,setAttendance,setPayslips,setError){
 const refreshRef=useRef(null),saveRef=useRef(null),stores=useRef(null),[connectionError,setConnectionError]=useState(''),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[refreshing,setRefreshing]=useState(false),[pendingCount,setPendingCount]=useState(0)
 useEffect(()=>{if(!client||!user){stores.current=null;setReady(false);return}let disposed=false,running=false,sending=false,retryAt=0,failures=0;const a=new SharedCollection(client,'payroll_attendance','payroll_pending_att_'+user.id),p=new SharedCollection(client,'payroll_payslips','payroll_pending_ps_'+user.id);stores.current={a,p};setReady(false);setConnectionError('');const loaded=new Set(),errors={read:'',save:''};
 const status=()=>{if(!disposed){setConnectionError([errors.read,errors.save].filter(Boolean).join(' · '));setPendingCount(a.pending.size+p.pending.size)}};
 const save=async(force=false)=>{if(sending||disposed)return;sending=true;setSaving(true);try{const result=await Promise.allSettled([a.flush(force),p.flush(force)]);errors.save=result.filter(r=>r.status==='rejected').map(r=>r.reason.message||String(r.reason)).join(' · ')}finally{sending=false;if(!disposed){setSaving(false);status()}}};saveRef.current=save;
 const refresh=async(force=false)=>{if(running||disposed||(force!==true&&(document.hidden||Date.now()<retryAt)))return;running=true;setRefreshing(true);try{
   const av=a.revision,pv=p.revision;
   // Reads are independent of pending uploads and of failures in the other table.
   const results=await Promise.allSettled([a.load(),p.load()]);if(disposed)return;
   results.forEach((result,index)=>{if(result.status!=='fulfilled')return;loaded.add(index);const collection=index?p:a,revision=index?pv:av,setRows=index?setPayslips:setAttendance;if(collection.revision===revision)setRows(prev=>JSON.stringify(prev)===JSON.stringify(result.value)?prev:result.value)});
   const failed=results.filter(r=>r.status==='rejected');errors.read=failed.map(r=>r.reason.message||String(r.reason)).join(' · ');setReady(loaded.size===2);
   if(failed.length){failures++;retryAt=Date.now()+Math.min(300000,15000*2**failures)}else{failures=0;retryAt=0}
   status();void save(force===true);
 }finally{running=false;if(!disposed)setRefreshing(false)}};
 refreshRef.current=refresh;refresh();const timer=setInterval(refresh,30000);const focus=()=>refresh();window.addEventListener('focus',focus);return()=>{disposed=true;clearInterval(timer);window.removeEventListener('focus',focus);if(stores.current?.a===a)stores.current=null;refreshRef.current=null;saveRef.current=null}
 },[client,user?.id])
 useLayoutEffect(()=>{if(!ready||!stores.current)return;const {a,p}=stores.current;a.edit(attendance);p.edit(payslips);setPendingCount(a.pending.size+p.pending.size);const timer=setTimeout(()=>saveRef.current?.(),300);return()=>clearTimeout(timer)},[attendance,payslips,ready])
 return {ready,saving,refreshing,pendingCount,connectionError,retry:()=>{void saveRef.current?.(true);return refreshRef.current?.(true)},importLocal:async(a,p)=>{if(!ready||!stores.current)throw Error('Hãy chờ tải dữ liệu dùng chung.');const rows=await stores.current.a.importMissing(a),slips=await stores.current.p.importMissing(p);setAttendance(rows);setPayslips(slips)}}
}
