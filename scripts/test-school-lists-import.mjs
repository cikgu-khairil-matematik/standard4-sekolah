import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {compile,read,R,fixture} from './achievement-fixtures.mjs';
const require=createRequire(import.meta.url),excelURL=pathToFileURL(require.resolve('exceljs')).href;
const model=compile(read('migration/backend/resources-model.ts'));
const W=await import(compile(read('app/school-lists-workbook.ts').replace("'../migration/backend/resources-model'",JSON.stringify(model)).replace("await import('exceljs')",'await import('+JSON.stringify(excelURL)+').then(m=>m.default)')));
const M=await import(model),classes=[['BIL','NAMA KELAS'],[1,' 1 NILAM '],[2,'1 nilam'],[3,'1\u00a0\u00a0NILAM'],[4,'2 NILAM'],[5,'PRA DESA IDAMAN']];
const c=W.parseSchoolListTable(classes,'classes');assert.deepEqual(c.names,['1 NILAM','2 NILAM','PRA DESA IDAMAN']);assert.equal(c.duplicates.length,1);assert.deepEqual(c.errors,[]);
assert.deepEqual(W.parseSchoolListTable([['MATA PELAJARAN'],['BAHASA MELAYU'],['Bahasa  Melayu'],['SAINS']],'subjects').names,['BAHASA MELAYU','SAINS']);
assert.ok(W.parseSchoolListTable([['NAMA SALAH'],['1 A']],'classes').errors.length);
assert.match(W.parseSchoolListTable([['NAMA KELAS'],[{formula:'1+1',result:2}]],'classes',[1,23]).errors[0],/baris 23/);
assert.ok(W.parseSchoolListTable([['NAMA KELAS'],[123]],'classes').errors.length);
assert.equal(M.inspectSchoolChoices(['K'.repeat(201)],'Kelas').errors.length,1);
const existing={classes:['1 NILAM','1 DEDIKASI'],subjects:['MATEMATIK']},incoming={classes:['1 nilam','2 NILAM'],subjects:['Matematik','SAINS']};
const merged=W.mergeSchoolLists(existing,incoming);assert.deepEqual(merged.classes,['1 NILAM','1 DEDIKASI','2 NILAM']);assert.equal(merged.addedClasses,1);assert.equal(merged.addedSubjects,1);assert.equal(W.mergeSchoolLists(merged,incoming).addedClasses,0);assert.deepEqual(W.mergeSchoolLists(existing,{classes:['3 NILAM'],subjects:[]}).subjects,existing.subjects);
assert.ok(W.mergeSchoolLists({classes:Array.from({length:200},(_,i)=>'KELAS '+i),subjects:[]},{classes:['BAHARU'],subjects:[]}).errors.length);
const path='public/templates/Tapak_Senarai_Kelas_Mata_Pelajaran_SKAS.xlsx',bytes=fs.readFileSync(path),{Workbook}=(await import(excelURL)).default,wb=new Workbook();await wb.xlsx.load(bytes);
assert.deepEqual(wb.worksheets.map(s=>s.name),['Senarai Kelas','Mata Pelajaran']);
for(const s of wb.worksheets){assert.equal(s.getCell('A1').value,'BIL');assert.equal(s.getCell('B201').value,null);assert.equal(s.getCell('E11').value.formula,'COUNTA(B2:B201)');assert.equal(s.views[0].ySplit,1);assert.ok(s.conditionalFormattings.length);}
const archive=await require('jszip').loadAsync(bytes);assert.match(await archive.file('xl/worksheets/sheet1.xml').async('string'),/<c[^>]*r="E11"[^>]*><f>COUNTA\(B2:B201\)<\/f><v>0<\/v>/);
const blank=await W.readSchoolListsWorkbook(new File([bytes],'tapak.xlsx'));assert.equal(blank.classes.length,0);assert.equal(blank.subjects.length,0);assert.ok(blank.errors.some(e=>e.includes('Tiada nama')));
await assert.rejects(()=>W.readSchoolListsWorkbook(new File([bytes],'tapak.xlsm')),/xlsx/);await assert.rejects(()=>W.readSchoolListsWorkbook(new File([new Uint8Array(3_000_001)],'besar.xlsx')),/3 MB/);await assert.rejects(()=>W.readSchoolListsWorkbook(new File(['bad zip'],'rosak.xlsx')),/tidak dapat dibaca/);
if(process.argv[2]){const x=await W.readSchoolListsWorkbook(new File([fs.readFileSync(process.argv[2])],'contoh.xlsx'));assert.deepEqual(x.classes,['1 NILAM','2 NILAM']);assert.deepEqual(x.subjects,['MATEMATIK','SAINS']);assert.equal(x.duplicates.length,2);assert.deepEqual(x.errors,[]);console.log('PASS actual populated XLSX: named sheets, guidance excluded, normalized duplicates and unique counts.');}
const d=fixture(),admin=d.members[0],call=(body,actor=admin)=>R.resourcesCommand(d,actor,{year:2026,...body});
call({action:'lists',revision:0,classes:[' 1   NILAM '],subjects:['MATEMATIK']});assert.deepEqual(R.resourcesView(d,admin,2026).lists.classes,['1 NILAM']);
for(const body of [{classes:['1 NILAM','1 nilam'],subjects:['SAINS']},{classes:['1 A'],subjects:['Sains',' SAINS ']},{classes:[''],subjects:[]},{classes:[5],subjects:[]},{classes:['K'.repeat(201)],subjects:[]}]){const snapshot=structuredClone(d);assert.throws(()=>call({action:'lists',revision:1,...body}),e=>e.status===400);assert.deepEqual(d,snapshot);}
const snapshot=structuredClone(d);assert.throws(()=>call({action:'lists',revision:0,classes:['1 B'],subjects:[]}),e=>e.status===409);assert.throws(()=>call({action:'lists',revision:1,classes:['1 B'],subjects:[]},d.members[1]),e=>e.status===403);assert.deepEqual(d,snapshot);assert.deepEqual(R.resourcesView(d,admin,2025).lists.classes,[]);
call({action:'lists',revision:1,classes:merged.classes,subjects:merged.subjects});assert.equal(R.resourcesView(d,admin,2026).lists.classes.length,3);assert.deepEqual(R.resourcesView(d,admin,2025).lists.classes,[]);
console.log('PASS school lists import: unique counts, case/space/NFKC duplicates, full year-prefixed names, repeat imports, existing names preserved, invalid and oversized files, blank template, headers/formula rejection, limits, Admin-only writes, stale revisions and atomic/year isolation. Fictional data only.');
