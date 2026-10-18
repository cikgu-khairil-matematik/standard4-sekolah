import {calculate,normalized,stages,type Assessment,type TeacherType} from './scoring.ts';
export type Row=Record<string,any>;
export type SchoolDoc={school:Row;teachers:Row[];assessments:Row[];members:Row[];invitations:Row[];imports:Row[];audit:Row[];sessions:Row[]};
export class ApiError extends Error {constructor(message:string,public status=400,public details:Row={}){super(message);}}
export function fail(s:string,status=400,details:Row={}):never{throw new ApiError(s,status,details);}
export const now=()=>new Date().toISOString();
export function text(s:unknown,min=3,max=180){if(typeof s!=='string'||s.trim().length<min||s.trim().length>max)fail('Semak maklumat yang dimasukkan.');return (s as string).trim().replace(/\s+/g,' ');}
export function code(s:unknown){const c=text(s,3,16).toUpperCase();if(!/^[A-Z0-9][A-Z0-9-]{2,15}$/.test(c))fail('Kod sekolah tidak sah.');return c;}
export function username(s:unknown){const u=text(s,3,32).toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(u))fail('ID pengguna tidak sah.');return u;}
export function password(s:unknown){if(typeof s!=='string'||s.length<10||s.length>128)fail('Kata laluan mestilah 10–128 aksara.');return s as string;}
export const secret=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export async function hash(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');}
export function actor(d:SchoolDoc,uid:string,sidHash:string){const m=d.members.find(m=>m.authUserId===uid&&m.active===1),s=d.sessions.find(s=>s.hash===sidHash&&s.expiresAt>now());if(!m||s?.memberId!==m.id)fail('Sesi telah tamat atau akses telah dinyahaktifkan. Log masuk semula.',401);return m;}
export function session(d:SchoolDoc,m:Row){return {memberId:m.id,schoolId:d.school.id,schoolCode:d.school.code,schoolName:d.school.name,username:m.username,displayName:m.displayName,isAdmin:m.role==='admin',teacherId:m.teacherId,legacyOwner:false};}
export const admin=(m:Row)=>{if(m.role!=='admin')fail('Tindakan ini hanya untuk pentadbir sekolah.',403);};
export const own=(d:SchoolDoc,m:Row)=>d.teachers.find(t=>t.id===m.teacherId);
export function mayView(d:SchoolDoc,m:Row,t:Row){const o=own(d,m);return m.role==='admin'||t.id===m.teacherId||!!o&&(normalized(t.pp1)===normalized(o.name)||normalized(t.pp2)===normalized(o.name));}
export function mayWrite(d:SchoolDoc,m:Row,t:Row,stage:string){if(m.role==='admin')return true;if(stage==='kendiri')return t.id===m.teacherId;const o=own(d,m);return !!o&&normalized(stage==='pertama'?t.pp1:t.pp2)===normalized(o.name);}
export function audit(d:SchoolDoc,m:Row,action:string,id:string,before:unknown,after:unknown){d.audit.push({id:crypto.randomUUID(),schoolId:d.school.id,actorId:m.id,action,entityId:id,before:before==null?null:JSON.stringify(before),after:after==null?null:JSON.stringify(after),createdAt:now()});}
export function getData(d:SchoolDoc,m:Row){const teachers=d.teachers.filter(t=>mayView(d,m,t)),ids=new Set(teachers.map(t=>t.id));return {teachers,assessments:d.assessments.filter(a=>ids.has(a.teacherId)),rosterInfo:[...d.imports].sort((a,b)=>b.importedAt.localeCompare(a.importedAt))[0]??null,session:session(d,m)};}
function roster(v:Row){if(!v||!['perdana','khas'].includes(v.type))fail('Kategori guru tidak sah.');const r:Row={name:text(v.name),type:v.type};for(const f of ['pp1','pp2','position','grade','session'])if(v[f]!==undefined){if(typeof v[f]!=='string'||v[f].length>180)fail('Maklumat guru tidak sah.');r[f]=v[f].trim();}if(v.sourceNumber!==undefined){if(!Number.isInteger(v.sourceNumber)||v.sourceNumber<0||v.sourceNumber>10000)fail('Nombor rujukan tidak sah.');r.sourceNumber=v.sourceNumber;}return r;}
function revoke(d:SchoolDoc,ids:string[]){d.sessions=d.sessions.filter(s=>!ids.includes(s.memberId));}
export function dataCommand(d:SchoolDoc,m:Row,b:Row){
 if(['reset-marks','reset-all','delete-teacher','import','teacher','reopen'].includes(b.action))admin(m);
 if(b.action==='import'){
  if(!Array.isArray(b.teachers)||!b.teachers.length||b.teachers.length>500)fail('Import antara 1 hingga 500 guru.');const rows=b.teachers.map(roster);let added=0,updated=0;
  for(const v of rows){let t=d.teachers.find(t=>t.normalized===normalized(v.name));if(t){const {type,...metadata}=v;Object.assign(t,metadata);updated++;}else{t={id:crypto.randomUUID(),schoolId:d.school.id,normalized:normalized(v.name),createdAt:now(),pp1:'',pp2:'',position:'',grade:'',session:'',sourceNumber:0,...v};d.teachers.push(t);added++;}}
  const result={added,updated,skipped:0};d.imports.push({id:crypto.randomUUID(),schoolId:d.school.id,importedAt:now(),filename:'Import senarai guru (CSV / tampalan)',rowCount:rows.length});audit(d,m,'roster_imported',d.school.id,null,result);return result;
 }
 if(b.action==='teacher'){
  const t=d.teachers.find(t=>t.id===b.id);if(!t)fail('Guru tidak ditemui.',404);const v=roster(b);if(t.type!==v.type&&d.assessments.some(a=>a.teacherId===t.id))fail('Kategori tidak boleh diubah selepas penilaian disimpan.');const key=normalized(v.name);if(d.teachers.some(x=>x.id!==t.id&&x.normalized===key))fail('Nama guru telah digunakan.',409);const before=structuredClone(t),oldName=t.name;Object.assign(t,v,{normalized:key});if(oldName!==v.name){for(const x of d.teachers){if(x.pp1===oldName)x.pp1=v.name;if(x.pp2===oldName)x.pp2=v.name;}for(const x of d.members)if(x.teacherId===t.id)x.displayName=v.name;}audit(d,m,'teacher_updated',t.id,before,t);return {ok:true};
 }
 if(['reset-marks','reset-all','delete-teacher'].includes(b.action)){
  const phrase=b.action==='reset-marks'?'RESET MARKAH':b.action==='reset-all'?'RESET SEMUA':'PADAM GURU';if(b.confirmation!==phrase)fail('Taip frasa pengesahan yang ditetapkan.');
  if(b.action==='reset-marks'){if(!Number.isInteger(b.year)||b.year<2020||b.year>2100)fail('Tahun tidak sah.');const old=structuredClone(d.assessments.filter(a=>a.year===b.year));for(const a of d.assessments.filter(a=>a.year===b.year))Object.assign(a,{scores:Array(38).fill(null),total:null,status:'draft',mutationId:'',revision:a.revision+1,updatedAt:now()});audit(d,m,'assessment_year_reset',String(b.year),old,null);return {assessments:d.assessments.filter(a=>a.year===b.year)};}
  const targets=b.action==='delete-teacher'?d.teachers.filter(t=>t.id===b.teacherId):d.teachers;if(b.action==='delete-teacher'&&!targets.length)fail('Guru tidak ditemui.',404);const ids=new Set(targets.map(t=>t.id)),before={teachers:structuredClone(targets),assessments:d.assessments.filter(a=>ids.has(a.teacherId))};
  d.assessments=d.assessments.filter(a=>!ids.has(a.teacherId));d.teachers=d.teachers.filter(t=>!ids.has(t.id));const changed:string[]=[];for(const x of d.members)if(ids.has(x.teacherId)){x.teacherId=null;if(x.role!=='admin')x.active=0;if(b.action==='delete-teacher'||x.role!=='admin')changed.push(x.id);}revoke(d,changed);audit(d,m,b.action==='delete-teacher'?'teacher_deleted':'school_data_reset',b.teacherId||d.school.id,before,null);return {ok:true};
 }
 if(b.action==='reopen'){const a=d.assessments.find(a=>a.id===b.id);if(!a)fail('Penilaian tidak ditemui.',404);const before=structuredClone(a);Object.assign(a,{status:'draft',mutationId:'',revision:a.revision+1,updatedAt:now()});audit(d,m,'assessment_reopened',a.id,before,a);return {assessment:a};}
 if(b.action!=='save')fail('Tindakan tidak sah.');const v=b.assessment as Assessment;
 if(!v||!stages.includes(v.stage)||!Number.isInteger(v.year)||v.year<2020||v.year>2100||!['draft','submitted'].includes(v.status)||!Number.isInteger(v.revision)||v.revision<0)fail('Maklumat penilaian tidak sah.');
 const t=d.teachers.find(t=>t.id===v.teacherId);if(!t)fail('Guru tidak ditemui.',404);if(!mayWrite(d,m,t,v.stage))fail('Cikgu tidak ditugaskan untuk mengisi sesi penilaian guru ini.',403);
 if(typeof v.mutationId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(v.mutationId))fail('Rujukan simpanan tidak sah.');
 const previous=d.assessments.find(a=>a.teacherId===t.id&&a.year===v.year&&a.stage===v.stage);
 if(previous?.mutationId===v.mutationId)return {assessment:previous};
 if(previous?.status==='submitted')fail('Penilaian telah dihantar dan dikunci.',409,{assessment:previous,locked:true});
 if((previous?.revision??0)!==v.revision)fail('Rekod telah berubah. Semak versi pelayan.',409,{assessment:previous??null});
 if(!Array.isArray(v.scores)||v.scores.length!==38||v.scores.some(n=>n!==null&&(!Number.isInteger(n)||n<0||n>4)))fail('Skor mestilah nombor bulat 0 hingga 4 bagi 38 item.');
 for(const f of ['evaluator','date','subject','classroom','notes'] as const)if(typeof v[f]!=='string'||v[f].length>(f==='notes'?5000:200))fail('Maklumat borang tidak sah.');
 const evaluator=m.role==='admin'?v.evaluator.trim():(own(d,m)?.name||m.displayName),result=calculate(v.scores,t.type as TeacherType);
 if(v.status==='submitted'&&(result.total===null||!evaluator||!v.subject.trim()||!v.classroom.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||Number(v.date.slice(0,4))!==v.year||Number.isNaN(Date.parse(v.date))||new Date(v.date).toISOString().slice(0,10)!==v.date))fail('Lengkapkan semua skor, penilai, mata pelajaran, kelas dan tarikh.');
 const id=previous?.id||[t.id,v.year,v.stage].join(':'),record={id,schoolId:d.school.id,teacherId:t.id,year:v.year,stage:v.stage,status:v.status,scores:v.scores,evaluator,date:v.date,subject:v.subject.trim(),classroom:v.classroom.trim(),notes:v.notes.trim(),total:result.total===null?null:result.total.toFixed(2),revision:v.revision+1,mutationId:v.mutationId,updatedAt:now()};
 audit(d,m,v.status==='submitted'?'assessment_submitted':'assessment_draft_saved',id,previous??null,record);d.assessments=d.assessments.filter(a=>a.id!==id);d.assessments.push(record);return {assessment:record};
}
export async function schoolCommand(d:SchoolDoc,m:Row,b:Row){admin(m);
 if(b.action==='school-name'){const name=text(b.name,5,160),old=d.school.name;d.school.name=name;audit(d,m,'school_name_updated',d.school.id,{name:old},{name});return {ok:true};}
 if(b.action==='invite'){
  const u=username(b.username),role=b.role==='admin'?'admin':'member';const t=b.teacherId?d.teachers.find(t=>t.id===b.teacherId):null;if(b.teacherId&&!t)fail('Guru tidak ditemui.',404);if(!t&&role!=='admin')fail('Pilih guru untuk akaun.');if(d.members.some(x=>x.username===u||t&&x.teacherId===t.id))fail('ID pengguna atau guru sudah mempunyai akaun.',409);
  const member={id:crypto.randomUUID(),schoolId:d.school.id,username:u,authUserId:null,teacherId:t?.id??null,displayName:t?.name||text(b.displayName),role,active:1,mustChangePassword:0,createdAt:now()};d.members.push(member);return invite(d,m,member,'account_invited');
 }
 const member=d.members.find(x=>x.id===b.memberId);if(!member)fail('Akaun tidak ditemui.',404);if(member.id===m.id)fail('Gunakan tetapan kata laluan untuk akaun sendiri.');
 if(b.action==='reset-account'){revoke(d,[member.id]);return invite(d,m,member,'account_reset_requested');}
 if(b.action==='toggle-active'){if(member.role==='admin'&&member.active&&d.members.filter(x=>x.role==='admin'&&x.active).length<2)fail('Sekolah mesti mempunyai pentadbir aktif.');const old=member.active;member.active=old?0:1;revoke(d,[member.id]);audit(d,m,'account_active_updated',member.id,{active:old},{active:member.active});return {ok:true};}
 fail('Tindakan tidak sah.');
}
async function invite(d:SchoolDoc,m:Row,member:Row,action:string){const token=secret();d.invitations=d.invitations.filter(i=>i.memberId!==member.id);d.invitations.push({hash:await hash(token),memberId:member.id,expiresAt:new Date(Date.now()+604800000).toISOString(),consumedAt:null});audit(d,m,action,member.id,null,{username:member.username,teacherId:member.teacherId,role:member.role});return {username:member.username,schoolCode:d.school.code,invitation:token,expiresDays:7};}
export function getSchool(d:SchoolDoc,m:Row){admin(m);return {members:d.members.map(m=>({id:m.id,username:m.username,teacherId:m.teacherId,displayName:m.displayName,role:m.role,active:m.active,hasAccount:!!m.authUserId})),events:[...d.audit].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,100)};}
