import {achievementCommand,achievementView,type AchievementStore} from './achievement-api.ts';
import {effectiveAchievementPSS,emptyAchievementRecord} from './achievement-model.ts';
import {isPGB,admin,audit,fail,now,assignmentIdentity,assignedTo,eligibleScoreAssignee,type Row,type SchoolDoc} from './domain.ts';
import {ASPECTS,validYear} from './strength-model.ts';
import {MANAGEMENT_UNITS} from './management-model.ts';
import {strengthCommand,strengthView} from './strength-api.ts';
import {managementCommand,managementView} from './management-api.ts';
import type {DriveSettings,AchievementPSS} from './resources-model.ts';
type Resources={pdpcConfirmations?:Record<string,{signature:string;by:string;at:string}>;lists?:Record<string,{revision:number;classes:string[];subjects:string[]}>;settings?:DriveSettings;folders?:Record<string,string>;counters?:Record<string,number>;reservations?:Row[];pss?:Record<string,{revision:number;rows:AchievementPSS[]}>};
type Store=SchoolDoc&{resources?:Resources};
const defaults=():DriveSettings=>({revision:0,folderUrl:'',clientId:'',apiKey:'',projectNumber:'',updatedAt:null});
const str=(v:unknown,max=200)=>{if(typeof v!=='string'||v.length>max)fail('Teks tidak sah atau terlalu panjang.');return (v as string).trim();};
export function folderId(value:string){if(!value)return '';let u:URL;try{u=new URL(value);}catch{fail('Gunakan pautan folder Google Drive yang lengkap.');}if(u!.protocol!=='https:'||u!.hostname!=='drive.google.com'||u!.username||u!.password)fail('Gunakan pautan folder Google Drive yang sah.');const id=u!.pathname.match(/\/folders\/([a-zA-Z0-9_-]{10,})/)?.[1];if(!id)fail('Pautan mesti menuju ke folder Google Drive.');return id!;}
function active(d:SchoolDoc,m:Row){if(!d.members.some(p=>p.id===m.id&&p.active===1))fail('Akses akaun tidak aktif.',403);}
function pdpcStatus(d:SchoolDoc,year:number){const rows=d.assessments.filter(a=>a.year===year&&d.teachers.some(t=>t.id===a.teacherId)),expected=d.teachers.length*3,signature=JSON.stringify(rows.map(a=>[a.id,a.revision,a.status]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])))),complete=expected>0&&rows.length===expected&&rows.every(a=>a.status==='submitted'),confirmation=(d as Store).resources?.pdpcConfirmations?.[String(year)];return {status:complete&&confirmation?.signature===signature?'verified':complete?'submitted':rows.length?'draft':'empty',count:rows.filter(a=>a.status==='submitted').length,expected,signature};}
export function resourcesView(d:SchoolDoc,m:Row,year:number){active(d,m);if(!validYear(year))fail('Tahun tidak sah.');const r=(d as Store).resources;return {isPGB:isPGB(d,m),standard4:pdpcStatus(d,year),lists:structuredClone(r?.lists?.[String(year)]??{revision:0,classes:[],subjects:[]}),settings:structuredClone(r?.settings??defaults()),pss: m.role==='admin'?structuredClone(r?.pss?.[String(year)]??{revision:0,rows:[]}):undefined,year};}
export function resourcesCommand(d:SchoolDoc,m:Row,b:Row){
 active(d,m);if(!validYear(b.year))fail('Tahun tidak sah.');const store=d as Store;
 if(b.action==='verify-standard4'){
  if(!isPGB(d,m))fail('Hanya PGB boleh mengesahkan Standard 4.',403);const state=pdpcStatus(d,b.year);if(state.status!=='submitted')fail('Lengkapkan dan hantar semua penilaian sebelum pengesahan Standard 4.',409);if(b.signature!==state.signature)fail('Penilaian berubah. Muat semula dahulu.',409);
  store.resources??={};store.resources.pdpcConfirmations??={};store.resources.pdpcConfirmations[String(b.year)]={signature:state.signature,by:m.id,at:now()};audit(d,m,'pdpc_verify_standard',String(b.year),null,{count:state.count});return resourcesView(d,m,b.year);
 }
 if(b.action==='lists'){
  admin(m);const old=store.resources?.lists?.[String(b.year)]??{revision:0,classes:[],subjects:[]};if(b.revision!==old.revision)fail('Senarai telah berubah. Muat semula dahulu.',409);
  const clean=(v:unknown)=>{if(!Array.isArray(v)||v.length>200)fail('Maksimum 200 pilihan.');const rows=(v as unknown[]).map(x=>str(x,200));if(rows.some(x=>!x)||new Set(rows).size!==rows.length)fail('Nama kosong atau berulang.');return rows;};
  const next={revision:old.revision+1,classes:clean(b.classes),subjects:clean(b.subjects)};store.resources??={};store.resources.lists??={};store.resources.lists[String(b.year)]=next;audit(d,m,'school_lists',String(b.year),old,next);return resourcesView(d,m,b.year);
 }
 if(b.action==='settings'){
  admin(m);const old=store.resources?.settings??defaults();if(b.revision!==old.revision)fail('Tetapan telah berubah. Muat semula dahulu.',409);
  const folderUrl=str(b.settings?.folderUrl??'',500),clientId=str(b.settings?.clientId??''),apiKey=str(b.settings?.apiKey??''),projectNumber=str(b.settings?.projectNumber??'',30);folderId(folderUrl);
  if(clientId&&!/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId))fail('Google OAuth Client ID tidak sah.');if(apiKey&&!/^[a-zA-Z0-9_-]{20,100}$/.test(apiKey))fail('Google Picker API key tidak sah.');if(projectNumber&&!/^\d{6,25}$/.test(projectNumber))fail('Nombor projek Google tidak sah.');
  const next={folderUrl,clientId,apiKey,projectNumber,revision:old.revision+1,updatedAt:now()};store.resources??={};store.resources.settings=next;audit(d,m,'evidence_settings',d.school.id,{revision:old.revision,folderUrl:old.folderUrl},{revision:next.revision,folderUrl});return resourcesView(d,m,b.year);
 }
 if(b.action==='assign-all'){
  admin(m);if(!['strength','management','achievement'].includes(b.module)||!Array.isArray(b.rows)||b.rows.length<1||b.rows.length>42)fail('Senarai tugasan tidak sah.');
  const ids=new Set();for(const row of b.rows){if(ids.has(row.aspect))fail('Aspek berulang.');ids.add(row.aspect);}
  // Validate against a private copy first: a single invalid or stale row leaves every assignment unchanged.
  const copy=structuredClone(d);for(const row of b.rows){const cmd={...row,action:'assign',year:b.year};if(b.module==='strength')strengthCommand(copy,m,cmd);else if(b.module==='management')managementCommand(copy,m,cmd);else achievementCommand(copy,m,cmd);}
  if(b.module==='strength')(d as Row).strength=(copy as Row).strength;else if(b.module==='management')(d as Row).management=(copy as Row).management;else{(d as Row).achievement=(copy as Row).achievement;store.resources??={};store.resources.pss=(copy as Store).resources?.pss;}d.audit=copy.audit;
  audit(d,m,'assignments_confirmed',b.module+':'+b.year,null,{aspects:[...ids]});return {ok:true,count:b.rows.length};
 }
 if(b.action==='pss'){
  admin(m);const old=store.resources?.pss?.[String(b.year)]??{revision:0,rows:[]};if(b.revision!==old.revision)fail('Senarai PSS telah berubah. Muat semula dahulu.',409);if(!Array.isArray(b.rows)||b.rows.length>100)fail('Maksimum 100 penugasan PSS.');const ids=new Set(),codes=new Set();
  const rows=b.rows.map((r:Row)=>{const id=str(r.id,80),standard=str(r.standard,40),title=str(r.title,200);if(!id||ids.has(id)||codes.has(standard)||!/^5(?:\.\d{1,2}){0,3}$/.test(standard)||!title)fail('Lengkapkan kod Standard 5, tajuk dan elakkan pendua.');ids.add(id);codes.add(standard);if(!Array.isArray(r.memberIds)||r.memberIds.length>50||new Set(r.memberIds.map((id:string)=>typeof id==='string'?assignmentIdentity(d,id):id)).size!==r.memberIds.length||r.memberIds.some((id:unknown)=>!eligibleScoreAssignee(d,id)))fail('Pilih PSS daripada senarai guru sekolah.');return {id,standard,title,memberIds:r.memberIds};});
  const changed=achievementView(d,m,b.year).records.filter(r=>JSON.stringify([...r.pssIds].sort())!==JSON.stringify(effectiveAchievementPSS(rows,r.aspect).sort()));
  for(const r of changed){if(['submitted','verified'].includes(r.status))fail('Buka semula borang '+r.aspect+' sebelum menukar PSS.',409);if(effectiveAchievementPSS(rows,r.aspect).some(id=>assignedTo(d,id,r.reviewerId)))fail('PSS dan penyemak '+r.aspect+' mesti berbeza.');}
  for(const r of changed){const a=d as AchievementStore;a.achievement??={};a.achievement[String(b.year)]??={};const oldRecord=a.achievement[String(b.year)][r.aspect]??emptyAchievementRecord(r.aspect,b.year);a.achievement[String(b.year)][r.aspect]={...oldRecord,revision:oldRecord.revision+1,updatedAt:now(),updatedBy:m.id};}
  store.resources??={};store.resources.pss??={};store.resources.pss[String(b.year)]={revision:old.revision+1,rows};audit(d,m,'pss_achievement',String(b.year),old,{revision:old.revision+1,rows});return resourcesView(d,m,b.year);
 }
 if(b.action==='folder-id'){
  const reservation=store.resources?.reservations?.find(r=>r.id===b.uploadId&&r.actorId===m.id&&r.year===b.year);if(!reservation)fail('Sesi muat naik tidak ditemui. Cuba semula.',403);
  if(reservation.root!==folderId(store.resources?.settings?.folderUrl??''))fail('Folder sekolah telah berubah. Cuba muat naik semula.',409);
  const candidate=str(b.candidate,160),level=b.level;if(!/^[a-zA-Z0-9_-]{10,160}$/.test(candidate)||!['module','year','aspect'].includes(level))fail('Folder muat naik tidak sah.');
  const base=reservation.root+':'+reservation.module,key=base+(level==='module'?'':':'+reservation.year)+(level==='aspect'?':'+reservation.aspect:'');store.resources!.folders??={};const folders=store.resources!.folders;
  const parent=level==='module'?reservation.root:level==='year'?folders[base]:folders[base+':'+reservation.year];if(!parent)fail('Sediakan folder induk dahulu.',409);
  folders[key]??=candidate;const names:Record<string,string>={strength:'Evidens Kekuatan Kami',management:'Evidens Pengurusan Kami',achievement:'Evidens Pencapaian Kami'};return {id:folders[key],parent,name:level==='module'?names[reservation.module]:level==='year'?String(reservation.year):reservation.aspect};
 }
 if(b.action==='reserve-upload'){
  const module=b.module,aspect=str(b.aspect,40),action=str(b.actionId??'',10).toLowerCase();if(!['strength','management','achievement'].includes(module))fail('Modul evidens tidak sah.');
  if(module==='strength'){if(!ASPECTS.some(a=>a.id===aspect)||action)fail('Aspek tidak sah.');const r=strengthView(d,m,b.year).records.find(r=>r.aspect===aspect);if(!r?.canEdit)fail('Anda tidak boleh memuat naik evidens aspek ini.',403);}
  if(module==='management'){const unit=MANAGEMENT_UNITS.find(u=>u.id===aspect),r=managementView(d,m,b.year).records.find(r=>r.aspect===aspect);if(!unit||action&&!unit.actions.some(a=>a.id===action))fail('Tindakan tidak sah.');if(!r?.canEdit)fail('Anda tidak boleh memuat naik evidens standard ini.',403);}
  if(module==='achievement'){const r=achievementView(d,m,b.year).records.find(r=>r.aspect===aspect);if(action)fail('Medan tindakan tidak digunakan bagi Standard 5.');if(!r?.canEdit)fail('Anda tidak boleh memuat naik evidens Standard 5 ini.',403);}
  const settings=store.resources?.settings??defaults();if(!folderId(settings.folderUrl)||!settings.clientId||!settings.apiKey||!settings.projectNumber)fail('Pentadbir perlu melengkapkan tetapan Google Drive dahulu.',409);
  const ext=str(b.extension,10).toLowerCase();if(!['pdf','jpg','jpeg','png','webp','doc','docx','xls','xlsx','ppt','pptx','txt','csv','odt','ods','odp'].includes(ext))fail('Jenis fail tidak disokong.');if(!Number.isInteger(b.size)||b.size<1||b.size>20*1024*1024)fail('Saiz fail mestilah 1 bait hingga 20 MB.');
  store.resources??={};store.resources.counters??={};const code=aspect+(action?'.'+action.toUpperCase():''),key=[b.year,module,code].join(':'),n=(store.resources.counters[key]??0)+1;store.resources.counters[key]=n;
  const name=module==='strength'?aspect+'-'+String(n).padStart(3,'0')+'.'+ext:code+'('+n+').'+ext;
  const upload={id:crypto.randomUUID(),actorId:m.id,year:b.year,module,aspect,action,name,size:b.size,root:folderId(settings.folderUrl),createdAt:now()};
  store.resources.reservations=[...(store.resources.reservations??[]).filter(r=>Date.parse(r.createdAt)>Date.now()-86400000),upload].slice(-500);
  audit(d,m,'evidence_upload_reserved',upload.id,null,{module,aspect,action,name,size:b.size});return {upload,settings};
 }
 fail('Tindakan tetapan tidak sah.');
}
