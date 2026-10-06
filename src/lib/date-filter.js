export function inDateRange(date,from='',to=''){if(!from&&!to)return true;return /^\d{4}-\d{2}-\d{2}$/.test(date||'')&&(!from||date>=from)&&(!to||date<=to)}
