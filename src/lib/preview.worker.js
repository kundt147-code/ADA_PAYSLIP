import {payslipBuffer} from './exporter.js'
import {previewGrid} from './preview.js'
self.onmessage=async ({data})=>{try{const buffer=await payslipBuffer(data.payslip,data.employee,data.attendance,data.type);const grid=await previewGrid(buffer,data.sheet);self.postMessage({grid})}catch(error){self.postMessage({error:error.message})}}
