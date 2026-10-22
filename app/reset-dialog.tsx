'use client';
import {useEffect,useRef,useState} from 'react';
import {RefreshCw,RotateCcw,Trash2,X} from 'lucide-react';
import type {Assessment,Teacher} from './scoring';
export type ResetTarget = {action:'reset-marks';year:number}|{action:'reset-all'}|{action:'delete-teacher';teacher:Teacher};
export type ResetResult = {assessments?:Assessment[]};
export default function ResetDialog({target,teachers,records,onClose,onDone}:{target:ResetTarget;teachers:Teacher[];records:Assessment[];onClose:()=>void;onDone:(result:ResetResult)=>void}){
 const [confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const ref=useRef<HTMLElement>(null);
 const marks=target.action==='reset-marks',single=target.action==='delete-teacher';
 const phrase=marks?'RESET MARKAH':single?'PADAM GURU':'RESET SEMUA';
 const title=marks?`Reset markah tahun ${target.year}`:single?'Padam guru tertentu':'Reset semua data';
 const count=marks?records.filter(a=>a.year===target.year).length:single?records.filter(a=>a.teacherId===target.teacher.id).length:records.length;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
  const handler=(event:KeyboardEvent)=>{
   if(event.key==='Escape'&&!busy){event.preventDefault();onClose();}
   if(event.key==='Tab'){
    const focusable=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')??[]);
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',handler);
  return()=>{document.removeEventListener('keydown',handler);if(previous?.isConnected)previous.focus();};
 },[busy,onClose]);
 async function run(){
  if(busy||confirmation!==phrase)return;
  setBusy(true);setError('');
  try{
   const res=await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:target.action,confirmation,...(marks?{year:target.year}:single?{teacherId:target.teacher.id}:{})})});
   const result=await res.json() as ResetResult&{error?:string};
   if(!res.ok)throw Error(result.error||'Tindakan gagal. Muat semula data untuk menyemak status sebelum mencuba lagi.');
   onDone(result);
  }catch(e){setError((e as Error).message);setBusy(false);}
 }
 return <div className="modal-backdrop"><section ref={ref} className="modal reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" aria-busy={busy}>
  <div className="modal-heading"><div className="reset-title-group"><span className="reset-icon">{marks?<RotateCcw size={22}/>:<Trash2 size={22}/>}</span><h2 id="reset-title">{title}</h2></div><button className="icon-btn" aria-label="Tutup pengesahan" disabled={busy} onClick={onClose}><X size={20}/></button></div>
  <div id="reset-description" className="reset-description">
   {marks?<><p>Semua skor <strong>Penilaian Kendiri, Pencerapan 1 dan Pencerapan 2</strong> bagi <strong>semua guru dalam tahun {target.year}</strong> akan dikosongkan.</p><p>Nama guru dan penilaian tahun lain dikekalkan. Rekod yang direset menjadi draf; maklumat penilaian dan ulasan dikekalkan.</p></>:single?<><p>Nama <strong>{target.teacher.name}</strong> dan semua rekod penilaiannya bagi <strong>semua tahun</strong> akan dipadam.</p><p>Rekod guru lain dikekalkan.</p></>:<><p>Semua <strong>{teachers.length} nama guru</strong> bersama semua rekod penilaian bagi <strong>semua tahun</strong> akan dipadam.</p><p>Cikgu perlu mengimport semula senarai nama untuk bermula semula.</p></>}
  </div>
  <div className="reset-scope"><strong>{count} rekod penilaian terlibat</strong><span>{single?'Guru yang dipilih sahaja':'Melibatkan semua guru, tanpa mengikut penapis carian.'}</span></div>
  <p className="reset-warning">Tindakan ini tidak boleh dibatalkan. Cikgu boleh membatalkan sekarang dan mengeksport data terlebih dahulu.</p>
  <label htmlFor="reset-confirmation">Taip <strong>{phrase}</strong> untuk mengesahkan</label>
  <input id="reset-confirmation" className="confirmation-input" autoComplete="off" spellCheck={false} value={confirmation} disabled={busy} onChange={e=>setConfirmation(e.target.value)} placeholder={phrase}/>
  {error&&<div className="inline-error" role="alert">{error}</div>}
  <div className="modal-actions"><button className="secondary" disabled={busy} onClick={onClose}>Batal</button><button className="destructive-primary" disabled={busy||confirmation!==phrase} onClick={run}>{busy?<RefreshCw className="spin" size={16}/>:marks?<RotateCcw size={16}/>:<Trash2 size={16}/>} {busy?'Sedang memproses…':marks?'Ya, reset markah':single?'Ya, padam guru':'Ya, reset semua'}</button></div>
 </section></div>;
}
