export function toggleVisibleSelection(selected,visible){return visible.length&&visible.every(id=>selected.includes(id))?selected.filter(id=>!visible.includes(id)):[...new Set([...selected,...visible])]}
export function choiceParts(value,options){const tokens=String(value||'').split(';').map(s=>s.trim()).filter(Boolean);return {selected:tokens.filter(s=>options.includes(s)),other:tokens.filter(s=>!options.includes(s)).join('; ')}}
export function choiceValue(selected,other){return [...selected,...(other.trim()?[other.trim()]:[])].join('; ')}
