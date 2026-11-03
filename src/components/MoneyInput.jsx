import {useEffect,useRef,useState} from 'react'
import {formatMoneyInput,parseMoneyInput} from '../lib/money-input.js'
export default function MoneyInput({value,onChange,onBlur,type,min,max,step,...props}){
 const input=useRef(null),[draft,setDraft]=useState(()=>formatMoneyInput(value));
 useEffect(()=>setDraft(formatMoneyInput(value)),[value]);
 function change(event){const text=event.target.value,position=event.target.selectionStart??text.length,digits=text.slice(0,position).replace(/\D/g,'').length,parsed=parseMoneyInput(text);if(parsed===null){if(text==='-')setDraft(text);return}const formatted=formatMoneyInput(parsed);setDraft(formatted);onChange?.({target:{value:parsed}});requestAnimationFrame(()=>{const node=input.current;if(!node||document.activeElement!==node)return;let seen=0,caret=0;while(caret<formatted.length&&seen<digits){if(/\d/.test(formatted[caret]))seen++;caret++}node.setSelectionRange(caret,caret)})}
 return <input {...props} ref={input} type="text" inputMode="decimal" autoComplete="off" value={draft} onChange={change} onBlur={event=>{setDraft(formatMoneyInput(value));onBlur?.(event)}}/>
}
