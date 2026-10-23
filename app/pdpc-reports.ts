import {calculate,observationOfficer,grade,rubric,stages,stageNames,type Teacher,type Assessment,type Stage} from './scoring';
import type {AppData,AppSession} from './app-types';
import {styleSheet} from './teacher-workbook';
export const reportStatus=(a?:Assessment)=>a?({draft:'Draf',submitted:'Dihantar',verified:'Disahkan'}[a.status]??'Tidak sah'):'Belum diisi';
export const categoryName=(t:Teacher)=>t.type==='khas'?'Pendidikan Khas':'Perdana';
export function reportRecord(data:AppData,t:Teacher,year:number,s:Stage){return data.assessments.filter(a=>a.teacherId===t.id&&a.year===year&&a.stage===s).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];}
export function reportCalculation(t:Teacher,a?:Assessment){return calculate(a?.scores??Array(38).fill(null),t.type);}
export function reportPeople(data:AppData,t:Teacher,year:number){const assignment=data.pdpc?.assignments[String(year)]?.find(r=>r.teacherId===t.id);const person=(id:string|null|undefined)=>data.pdpc?.people.find(p=>p.id===id)?.name??'Belum ditetapkan';return {observer:assignment?person(assignment.observerId):t.pp1||'Belum ditetapkan',observer2:assignment?person(observationOfficer(assignment,'kedua')):t.pp1||'Belum ditetapkan',reviewer:assignment?person(assignment.reviewerId):t.pp2||'Belum ditetapkan'};}
export async function pdpcReportWorkbook(data:AppData,teachers:Teacher[],session:AppSession,year:number){
 const {Workbook}=await import('exceljs'),wb=new Workbook();wb.creator='SK@S';
 const summary=wb.addWorksheet(teachers.length===1?'Ringkasan Individu':'Semua Guru');
 summary.addRow(['BIL','NAMA','KATEGORI GURU','JAWATAN','GRED','PENCERAP 1','PENCERAP 2','PENYEMAK',...stages.flatMap(s=>[stageNames[s]+' (%)','STATUS '+stageNames[s]]),'SEKOLAH','KOD SEKOLAH','TAHUN']);
 teachers.forEach((t,i)=>{const people=reportPeople(data,t,year);summary.addRow([i+1,t.name,categoryName(t),t.position,t.grade,people.observer,people.observer2,people.reviewer,...stages.flatMap(s=>{const a=reportRecord(data,t,year,s);return [reportCalculation(t,a).total,reportStatus(a)];}),session.schoolName,session.schoolCode,year]);});
 styleSheet(summary,[8,40,23,24,13,38,38,38,22,24,22,24,22,24,38,18,12]);for(const n of [9,11,13])summary.getColumn(n).numFmt='0.00';
 const combined=wb.addWorksheet('GABUNG');
 combined.addRow(['KOD SEKOLAH','NAMA SEKOLAH','NAMA','SESI PENGISIAN','TARIKH','TAHAP/KELAS','MATA PELAJARAN DICERAP',...rubric.perdana.groups.flatMap(g=>[g.code,'% '+g.code]),'JUMLAH SKOR','TARAF','KATEGORI GURU','STATUS','TAHUN','PENGISI','PENYEMAK']);
 const items=wb.addWorksheet('Skor Item'),notes=wb.addWorksheet('Ulasan dan Evidens');
 items.addRow(['NAMA','KATEGORI GURU','SESI PENGISIAN','KOD','TINDAKAN','SKOR','STATUS','TAHUN']);notes.addRow(['NAMA','SESI PENGISIAN','ULASAN','PAUTAN EVIDENS','STATUS','PENYEMAK','TARIKH PENGESAHAN']);
 for(const t of teachers)for(const s of stages){const a=reportRecord(data,t,year,s),c=reportCalculation(t,a),people=reportPeople(data,t,year);combined.addRow([session.schoolCode,session.schoolName,t.name,stageNames[s],a?.date?new Date(a.date+'T00:00:00Z'):null,a?.classroom??'',a?.subject??'',...c.aspects.flatMap(g=>[g.score,g.percentage]),c.total,c.total===null?'':grade(c.total),categoryName(t),reportStatus(a),year,a?.evaluator??'',people.reviewer]);let index=0;for(const g of rubric[t.type].groups)for(const item of g.items){items.addRow([t.name,categoryName(t),stageNames[s],g.code,item.label,a?.scores[index]??null,reportStatus(a),year]);index++;}const verifier=data.pdpc?.people.find(p=>p.id===a?.verifiedBy)?.name??(a?.verifiedBy?people.reviewer:'');for(const [i,url] of (a?.evidence?.length?a.evidence:['']).entries())notes.addRow([t.name,stageNames[s],i===0?a?.notes??'':'',url,reportStatus(a),verifier,a?.verifiedAt??'']);}
 styleSheet(combined,[18,38,40,24,18,20,30,...Array(16).fill(16),18,30,23,20,12,38,38]);combined.getColumn(5).numFmt='dd/mm/yyyy';for(let c=8;c<=24;c++)combined.getColumn(c).numFmt='0.00';
 styleSheet(items,[40,23,24,14,90,12,20,12]);for(let r=2;r<=items.rowCount;r++)items.getRow(r).height=55;
 styleSheet(notes,[40,24,85,75,20,38,28]);for(let r=2;r<=notes.rowCount;r++)notes.getRow(r).height=55;
 return wb;
}
