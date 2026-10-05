import {fetchWithTimeout} from './network.js'
import {decodeEmployee,encodeEmployee} from './employee-profile.js'
import { createClient } from '@supabase/supabase-js'
import { readEmployeesLocal, writeEmployeesLocal } from './storage'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url,key,{global:{fetch:fetchWithTimeout}}) : null

export async function listEmployees() {
  if (!supabase) return readEmployeesLocal().map(decodeEmployee)
  const rows=[]
  for(let from=0;;from+=500){const {data,error}=await supabase.from('employees').select('*').order('name').order('id').range(from,from+499);if(error)throw error;rows.push(...(data||[]));if((data||[]).length<500)break}
  return rows.map(decodeEmployee)
}
export async function upsertEmployee(emp) {
  if (!supabase) {
    const all = readEmployeesLocal(); const i=all.findIndex(x=>x.id===emp.id); if(i>=0) all[i]=encodeEmployee(emp); else all.push(encodeEmployee(emp)); writeEmployeesLocal(all); return decodeEmployee(encodeEmployee(emp))
  }
  const { data, error } = await supabase.from('employees').upsert(encodeEmployee(emp)).select().single(); if(error) throw error; return decodeEmployee(data)
}
export async function deleteEmployee(id) {
  if (!supabase) { writeEmployeesLocal(readEmployeesLocal().filter(x=>x.id!==id)); return }
  const { error } = await supabase.from('employees').delete().eq('id',id); if(error) throw error
}

