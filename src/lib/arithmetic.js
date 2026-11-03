// Arithmetic only: no code generation, so Excel calculations work with a strict CSP.
export function arithmetic(expression){
 const text=String(expression);let i=0
 const space=()=>{while(/\s/.test(text[i]||'')&&i<text.length)i++}
 function primary(){space();const sign=text[i];if(sign==='+'||sign==='-'){i++;return (sign==='-'?-1:1)*primary()}if(text[i]==='('){i++;const value=sum();space();if(text[i++]!==')')throw Error('Missing closing parenthesis');return value}const match=text.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!match)throw Error('Unsupported numeric expression');i+=match[0].length;return Number(match[0])}
 function product(){let value=primary();for(;;){space();const op=text[i];if(!['*','/','%'].includes(op))return value;i++;const right=primary();value=op==='*'?value*right:op==='/'?value/right:value%right}}
 function sum(){let value=product();for(;;){space();const op=text[i];if(op!=='+'&&op!=='-')return value;i++;const right=product();value=op==='+'?value+right:value-right}}
 const value=sum();space();if(i!==text.length)throw Error('Unsupported numeric expression');return value
}
