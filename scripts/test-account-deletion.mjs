import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';

const compile=s=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const scoring=compile(fs.readFileSync('migration/backend/scoring.ts','utf8').replace("import source from './rubric.json' with {type:'json'};",'const source='+fs.readFileSync('migration/backend/rubric.json','utf8')+';'));
const D=await import(compile(fs.readFileSync('migration/backend/domain.ts','utf8').replace("'./scoring.ts'",JSON.stringify(scoring))));
const owner={id:'owner',schoolId:'school-a',username:'owner',authUserId:'uid-owner',teacherId:null,displayName:'Owner',role:'admin',active:1};
const account=(id,patch={})=>({...owner,id,username:id,authUserId:'uid-'+id,teacherId:'teacher-'+id,displayName:id,role:'member',...patch});
const fixture=()=>({school:{id:'school-a',code:'TESTA',name:'Test school'},members:[structuredClone(owner),account('teacher'),account('inactive',{active:0}),account('admin2',{role:'admin'}),account('pending',{authUserId:null})],teachers:[{id:'teacher-teacher',name:'Teacher',pp1:'Admin 2',pp2:'Other'}],assessments:[{id:'assessment',teacherId:'teacher-teacher',scores:[4,3,null],evaluator:'Teacher',revision:7}],sessions:[{hash:'owner-session',memberId:'owner',expiresAt:'2100-01-01'},{hash:'teacher-session',memberId:'teacher',expiresAt:'2100-01-01'},{hash:'admin2-session',memberId:'admin2',expiresAt:'2100-01-01'}],invitations:[{hash:'teacher-invite',memberId:'teacher',expiresAt:'2100-01-01'},{hash:'pending-invite',memberId:'pending',expiresAt:'2100-01-01'}],imports:[],audit:[]});
const command=(ids,extra={})=>({action:'delete-accounts',memberIds:ids,confirmation:'PADAM AKAUN',...extra});
async function denied(body,status,asMember=false,change){const d=fixture();change?.(d);const before=structuredClone(d);await assert.rejects(D.schoolCommand(d,asMember?d.members[1]:d.members[0],body),e=>e.status===status);assert.deepEqual(d,before,'A rejected bulk deletion must change nothing');}
await denied(command(['teacher']),403,true);
await denied(command(['teacher'],{confirmation:''}),400);
await denied(command([]),400);
await denied(command([null]),400);
await denied(command(Array(501).fill('teacher')),400);
await denied(command(['foreign-school-member']),404);
await denied(command(['teacher','foreign-school-member']),404);
await denied(command(['teacher','owner']),403);
await denied(command(['teacher']),409,false,d=>{d.members[0].authUserId=null;d.members[3].active=0;});

const d=fixture(),teachers=structuredClone(d.teachers),marks=structuredClone(d.assessments);
const result=await D.schoolCommand(d,d.members[0],command(['teacher','inactive','pending','teacher']));
assert.equal(result.deleted,3);
assert.deepEqual(d.members.map(x=>x.id),['owner','admin2']);
assert.deepEqual(d.teachers,teachers);assert.deepEqual(d.assessments,marks);
assert.equal(d.invitations.length,0);
assert.deepEqual(d.sessions.map(x=>x.memberId),['owner','admin2']);
assert.throws(()=>D.actor(d,'uid-teacher','teacher-session'),e=>e.status===401);
assert.equal(D.actor(d,'uid-owner','owner-session').id,'owner');
await assert.rejects(D.schoolCommand(d,d.members[0],{action:'reset-account',memberId:'teacher'}),e=>e.status===404);
assert.ok(!D.getSchool(d,d.members[0]).members.some(x=>x.id==='teacher'));
assert.equal(d.audit.filter(e=>e.action==='account_deleted').length,3);
assert.ok(!JSON.stringify(d.audit).includes('uid-teacher'),'Audit must not copy authentication identifiers');

await D.schoolCommand(d,d.members[0],command(['admin2']));
assert.equal(d.members.length,1);assert.equal(d.members[0].id,'owner');
assert.throws(()=>D.actor(d,'uid-admin2','admin2-session'),e=>e.status===401);
await D.schoolCommand(d,d.members[0],{action:'invite',username:'teacher',teacherId:'teacher-teacher',role:'member'});
const replacement=d.members.find(x=>x.username==='teacher');
assert.notEqual(replacement.id,'teacher');assert.equal(replacement.authUserId,null);
assert.throws(()=>D.actor(d,'uid-teacher','teacher-session'),e=>e.status===401);
console.log('PASS account selection and bulk deletion: admin-only, self/last-admin protection, cross-school rejection, atomic validation, immediate session/invitation revocation, unchanged teachers/marks, audit and safe account recreation.');
