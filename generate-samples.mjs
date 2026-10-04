import fs from 'node:fs/promises';import {buildEmployeeSampleWorkbookBuffer,buildSampleWorkbookBuffer} from './src/lib/attendance.js';
await fs.writeFile('public/MAU_IMPORT_NHAN_VIEN.xlsx',Buffer.from(await buildEmployeeSampleWorkbookBuffer()));await fs.writeFile('public/MAU_IMPORT_CHAM_CONG.xlsx',Buffer.from(await buildSampleWorkbookBuffer()));
