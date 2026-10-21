import {useState} from 'react';
const preferenceKey='skas-text-size-v1';
export function initializeTextSize(){let value='normal';try{value=localStorage.getItem(preferenceKey)==='large'?'large':'normal';}catch{}if(typeof document!=='undefined')document.documentElement.dataset.skasText=value;return value;}
export default function TextSizeControl(){const [size,setSize]=useState(initializeTextSize),[saved,setSaved]=useState(true);function change(value:string){const next=value==='large'?'large':'normal';document.documentElement.dataset.skasText=next;setSize(next);try{localStorage.setItem(preferenceKey,next);setSaved(true);}catch{setSaved(false);}}
 return <div className="text-size-control no-print"><label htmlFor="skas-text-size">Saiz tulisan<select id="skas-text-size" value={size} onChange={e=>change(e.target.value)}><option value="normal">Biasa</option><option value="large">Besar</option></select></label>{!saved&&<small role="status">Pilihan ini tidak dapat disimpan pada peranti.</small>}</div>;
}
