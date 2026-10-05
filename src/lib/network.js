export async function fetchWithTimeout(input,options={},timeout=15000){
 const controller=new AbortController();const abort=()=>controller.abort(options.signal?.reason);options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted)abort();const timer=setTimeout(()=>controller.abort(new DOMException('Kết nối quá thời gian chờ. Vui lòng thử lại.','TimeoutError')),timeout)
 try{return await fetch(input,{...options,signal:controller.signal})}finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort)}
}
