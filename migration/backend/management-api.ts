import {calculate,stages,type TeacherType} from './scoring.ts';
import {admin,audit,fail,now,type Row,type SchoolDoc} from './domain.ts';
import {MANAGEMENT_UNITS,emptyManagementRecord,cleanManagementData,managementIssues,validManagementUnit,validYear,defaultReportNotes,cleanReportNotes,mean,type ReportNotes,type SchoolReport,type PdpcSummary,type ManagementRecord,type ManagementBundle,type ManagementUnitId} from './management-model.ts';
type Store=SchoolDoc&{management?:Record<string,Partial<Record<ManagementUnitId,ManagementRecord>>>;managementReports?:Record<string,ReportNotes>};
function permissions(d:SchoolDoc,m:Row,r:ManagementRecord){const active=(id:string|null)=>!!id&&d.members.some(x=>x.id===id&&x.active===1);const isAdmin=m.role==='admin',canRead=isAdmin||active(r.assigneeId)&&r.assigneeId===m.id||active(r.reviewerId)&&r.reviewerId===m.id;return {canAdmin:isAdmin,canRead,canEdit:(isAdmin||active(r.assigneeId)&&r.assigneeId===m.id)&&['draft','returned'].includes(r.status),canReview:(isAdmin||active(r.reviewerId)&&r.reviewerId===m.id)&&r.status==='submitted'&&r.assigneeId!==m.id&&(r as unknown as Row).lastEditorId!==m.id};}
function record(d:Store,aspect:ManagementUnitId,year:number):ManagementRecord{return structuredClone(d.management?.[String(year)]?.[aspect]??emptyManagementRecord(aspect,year));}
export function scoringReport(d:SchoolDoc,year:number):SchoolReport{
 const teachers=new Map(d.teachers.map(t=>[t.id,t]));
 const pdpc={} as SchoolReport['pdpc'];
 for(const scope of ['submitted','all'] as const){
  pdpc[scope]={} as SchoolReport['pdpc']['all'];
  for(const stage of ['all',...stages] as const){
   const selected=d.assessments.filter(a=>a.year===year&&teachers.has(a.teacherId)&&stages.includes(a.stage)&&(stage==='all'||a.stage===stage)&&(scope==='all'||a.status==='submitted'));
   // A school document normally has one assessment per teacher/year/stage. Keep the latest if a legacy import duplicated one.
   const latest=new Map<string,Row>();for(const a of selected){const key=a.teacherId+':'+a.stage,old=latest.get(key);if(!old||String(a.updatedAt??'')>String(old.updatedAt??''))latest.set(key,a);}
   const results=[...latest.values()].flatMap(a=>{const teacher=teachers.get(a.teacherId)!;if(!['perdana','khas'].includes(teacher.type)||!Array.isArray(a.scores)||a.scores.length!==38)return [];const result=calculate(a.scores,teacher.type as TeacherType);return result.total===null?[]:[result];});
   const codes=['4.1.1','4.2.1','4.2.2','4.3.1','4.4.1','4.4.2','4.5.1','4.6.1'];
   pdpc[scope][stage]={count:results.length,expectedCount:teachers.size*(stage==='all'?3:1),overall:mean(results.map(r=>r.total!)),aspects:codes.map(code=>{const values=results.flatMap(r=>{const a=r.aspects.find(a=>a.code===code);return a?.score===null||a?.score===undefined?[]:[a.score];});return {code,value:mean(values),count:values.length};})} satisfies PdpcSummary;
  }
 }
 return {notes:structuredClone((d as Store).managementReports?.[String(year)]??defaultReportNotes()),pdpc};
}
export function managementView(d:SchoolDoc,m:Row,year:number):ManagementBundle{
 if(!d.members.some(x=>x.id===m.id&&x.active===1))fail('Akses akaun tidak aktif.',403);
 if(!validYear(year))fail('Pilih tahun antara 2020–2100.');
 return {year,records:MANAGEMENT_UNITS.map(a=>{const r=record(d,a.id,year),p=permissions(d,m,r);if(!p.canRead){r.data=emptyManagementRecord(a.id,year).data;r.feedback='';}delete r.lastMutationId;delete r.lastMutationActor;return {...r,...p};}),people:d.members.filter(x=>x.active===1).map(x=>({id:x.id,name:x.displayName||x.username})),school:{code:d.school.code,name:d.school.name},sessionId:m.id,...(m.role==='admin'?{report:scoringReport(d,year)}:{})};
}
export function managementCommand(d:SchoolDoc,m:Row,b:Row):ManagementBundle{
 if(!d.members.some(x=>x.id===m.id&&x.active===1))fail('Akses akaun tidak aktif.',403);
 if(!validYear(b.year))fail('Pilih tahun antara 2020–2100.');
 if(b.action==='report-notes'){
  admin(m);const store=d as Store,old=store.managementReports?.[String(b.year)]??defaultReportNotes();
  if(!Number.isInteger(b.revision)||b.revision!==old.revision)fail('Catatan laporan telah berubah. Muat semula sebelum menyimpan.',409);
  let clean:ReturnType<typeof cleanReportNotes>;try{clean=cleanReportNotes(b.notes);}catch(e){fail((e as Error).message);}
  if(clean!.date&&Number(clean!.date.slice(0,4))!==b.year)fail('Tarikh laporan mesti dalam tahun pelaporan.');
  const next={...clean!,revision:old.revision+1,updatedAt:now()};store.managementReports??={};store.managementReports[String(b.year)]=next;
  audit(d,m,'management_report_notes',String(b.year),old,next);return managementView(d,m,b.year);
 }
 if(!validManagementUnit(b.aspect))fail('Aspek tidak sah.');
 const store=d as Store,year=b.year,aspect=b.aspect as ManagementUnitId,r=record(store,aspect,year),before=structuredClone(r),p=permissions(d,m,r);
 if(b.action==='assign')admin(m);else if(b.action==='save'||b.action==='submit'){if(!(m.role==='admin'||r.assigneeId===m.id&&d.members.some(x=>x.id===m.id&&x.active===1)))fail('Hanya pengisi yang ditugaskan atau pentadbir boleh mengisi standard ini.',403);}else if(['verify','return','reopen'].includes(b.action)){if(!(m.role==='admin'||r.reviewerId===m.id&&d.members.some(x=>x.id===m.id&&x.active===1)))fail('Hanya penyemak yang ditugaskan atau pentadbir boleh menyemak.',403);}else fail('Tindakan modul tidak sah.');
 if(b.action==='save'&&typeof b.mutationId==='string'&&r.lastMutationId===b.mutationId&&r.lastMutationActor===m.id)return managementView(d,m,year);
 if(!Number.isInteger(b.revision)||b.revision!==r.revision)fail('Rekod telah berubah. Muat semula dan semak perubahan sebelum menyimpan.',409,{record:{...r,...p}});
 if(b.action==='assign'){
  if(['submitted','verified'].includes(r.status))fail('Buka semula borang sebelum menukar penugasan.',409);
  const eligible=(id:unknown)=>id===null||typeof id==='string'&&d.members.some(x=>x.id===id&&x.active===1);
  if(!eligible(b.assigneeId)||!eligible(b.reviewerId))fail('Pilih akaun aktif dalam sekolah ini.',400);
  if(b.assigneeId&&b.assigneeId===b.reviewerId)fail('Pengisi dan penyemak mesti orang yang berbeza.');
  r.assigneeId=b.assigneeId;r.reviewerId=b.reviewerId;
 }else if(b.action==='save'){
  if(!p.canEdit)fail('Borang telah dihantar atau disahkan. Minta penyemak membuka semula.',409);
  if(typeof b.mutationId!=='string'||!/^[a-f0-9-]{16,80}$/i.test(b.mutationId))fail('Pengecam simpanan tidak sah.');
  try{r.data=cleanManagementData(aspect,b.data);}catch(e){fail((e as Error).message);}
  r.status='draft';r.feedback='';r.lastMutationId=b.mutationId;r.lastMutationActor=m.id;(r as unknown as Row).lastEditorId=m.id;
 }else if(b.action==='submit'){
  if(!p.canEdit)fail('Borang tidak berada dalam status draf.',409);
  if(!r.assigneeId||!r.reviewerId||!d.members.some(x=>x.id===r.assigneeId&&x.active===1)||!d.members.some(x=>x.id===r.reviewerId&&x.active===1))fail('Pentadbir perlu menetapkan pengisi dan penyemak aktif dahulu.');
  const issues=managementIssues(aspect,r.data);if(issues.length)fail(issues[0],400,{issues});
  r.status='submitted';r.submittedAt=now();r.feedback='';r.verifiedAt=null;r.verifiedBy=null;r.verifiedName=null;
 }else if(b.action==='verify'){
  if(!p.canReview)fail('Borang mesti dihantar dan disahkan oleh orang lain daripada pengisi serta penyunting terakhir.',403);
  const issues=managementIssues(aspect,r.data);if(issues.length)fail(issues[0]);r.status='verified';r.verifiedAt=now();r.verifiedBy=m.id;r.verifiedName=m.displayName||m.username;r.feedback='';
 }else{
  if(b.action==='return'&&r.status!=='submitted'||b.action==='reopen'&&!['submitted','verified'].includes(r.status))fail('Status borang tidak membenarkan tindakan ini.',409);
  if(typeof b.feedback!=='string'||b.feedback.trim().length<5||b.feedback.length>1500)fail('Nyatakan sebab atau pembetulan sekurang-kurangnya 5 aksara.');
  r.status='returned';r.feedback=b.feedback.trim();r.verifiedAt=null;r.verifiedBy=null;r.verifiedName=null;
 }
 r.revision++;r.updatedAt=now();r.updatedBy=m.id;
 store.management??={};store.management[String(year)]??={};store.management[String(year)][aspect]=r;
 audit(d,m,'management_'+b.action,aspect+':'+year,{status:before.status,revision:before.revision,assigneeId:before.assigneeId,reviewerId:before.reviewerId,...(b.action==='save'?{data:before.data}:{})},{status:r.status,revision:r.revision,assigneeId:r.assigneeId,reviewerId:r.reviewerId,...(b.action==='save'?{data:r.data}:{}),...(r.feedback?{feedback:r.feedback}:{})});
 return managementView(d,m,year);
}
