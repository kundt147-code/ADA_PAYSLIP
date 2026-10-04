const EMP_KEY = 'payslip_employees_v1'
const ATT_KEY = 'payslip_attendance_v1'
const PS_KEY = 'payslip_payslips_v1'

export function readSession(key, fallback = []) {
  try {
    const persistent = localStorage.getItem(key)
    if (persistent !== null) return JSON.parse(persistent)
    const legacy = sessionStorage.getItem(key)
    if (legacy !== null) { const value=JSON.parse(legacy); localStorage.setItem(key, JSON.stringify(value)); return value }
    return fallback
  } catch { return fallback }
}
export function writeSession(key, value) { localStorage.setItem(key, JSON.stringify(value)) }
export const readAttendance = () => readSession(ATT_KEY)
export const writeAttendance = (v) => writeSession(ATT_KEY, v)
export const readPayslips = () => readSession(PS_KEY)
export const writePayslips = (v) => writeSession(PS_KEY, v)

export function readEmployeesLocal() {
  try { return JSON.parse(localStorage.getItem(EMP_KEY) || '[]') } catch { return [] }
}
export function writeEmployeesLocal(v) { localStorage.setItem(EMP_KEY, JSON.stringify(v)) }
