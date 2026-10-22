import {cleanTeacherRosterRow,normalized,type TeacherRosterRow} from './scoring';
export const rosterHeaders=['BIL','NAMA','JANTINA','NO IC','JAWATAN','GRED','SESI','STATUS','KEBERADAAN','KATEGORI GURU','ID GURU'];
const key=(v:unknown)=>normalized(String(v??'')).replace(/^\uFEFF/,'').replace(/[._#]/g,'').replace(/\s+/g,' ').trim();
export function parseTeacherTable(table:unknown[][],rowNumbers?:number[]):{rows:TeacherRosterRow[];errors:string[]}{
 const hi=table.findIndex(r=>r.some(v=>['NAMA','NAMA GURU','NAMA PYD'].includes(key(v))));
 if(hi<0)return {rows:[],errors:['Lajur NAMA tidak ditemui. Gunakan tapak Excel yang disediakan.']};
 const headers=table[hi].map(key),col=(...names:string[])=>headers.findIndex(h=>names.includes(h)),name=col('NAMA','NAMA GURU','NAMA PYD'),kind=col('KATEGORI GURU','KATEGORI','JENIS','ALIRAN');
 if(kind<0)return {rows:[],errors:['Lajur KATEGORI GURU diperlukan.']};
 const rows:TeacherRosterRow[]=[],errors:string[]=[];
 for(let i=hi+1;i<table.length;i++){
  const row=table[i];if(!row.some(v=>String(v??'').trim()))continue;
  if(rows.length>=500){errors.push('Had 500 guru bagi setiap import.');break;}
  const v:Record<string,unknown>={name:String(row[name]??''),type:/^(PERDANA|ARUS PERDANA)$/i.test(String(row[kind]??'').trim())?'perdana':/^(PENDIDIKAN KHAS|KHAS|PPKI)$/i.test(String(row[kind]??'').trim())?'khas':''};
  for(const [field,names] of Object.entries({gender:['JANTINA'],ic:['NO IC','NO KAD PENGENALAN','NOKP'],position:['JAWATAN'],grade:['GRED'],session:['SESI','SESI SEKOLAH'],status:['STATUS'],whereabouts:['KEBERADAAN'],id:['ID GURU']})){
   const c=col(...names);if(c>=0){const raw=row[c];v[field]=field==='ic'&&typeof raw==='number'&&Number.isSafeInteger(raw)&&raw>=0?String(raw).padStart(12,'0'):String(raw??'');if(field==='id'&&!v[field])delete v[field];}
  }
  const n=col('BIL','BILANGAN');if(n>=0&&String(row[n]??'').trim())v.sourceNumber=Number(row[n]);
  try{rows.push(cleanTeacherRosterRow(v));}catch(e){errors.push('Baris '+(rowNumbers?.[i]??i+1)+': '+(e as Error).message);}
 }
 const names=new Set<string>(),ics=new Set<string>();
 for(const row of rows){const n=normalized(row.name);if(names.has(n))errors.push('Nama berulang: '+row.name);names.add(n);if(row.ic){if(ics.has(row.ic))errors.push('No. IC berulang dalam fail.');ics.add(row.ic);}}
 if(!rows.length&&!errors.length)errors.push('Tiada guru dalam helaian ini.');
 return {rows,errors};
}
export async function readTeacherWorkbook(file:File){
 if(!/\.xlsx$/i.test(file.name))throw new Error('Gunakan fail Excel .xlsx. Simpan fail asal sebagai .xlsx terlebih dahulu.');
 if(file.size>3_000_000)throw new Error('Had saiz fail ialah 3 MB.');
 const {Workbook}=await import('exceljs'),wb=new Workbook();
 await wb.xlsx.load(await file.arrayBuffer(),{ignoreNodes:['dataValidations','drawing','extLst','conditionalFormatting']} as never);
 const sheet=wb.getWorksheet('Senarai Guru')??wb.worksheets.find(s=>s.state==='visible');if(!sheet)throw new Error('Helaian senarai guru tidak ditemui.');
 // Excel/Google Sheets can retain formatting far beyond the actual table.
 // Inspect populated cells only, rather than the worksheet's used-range dimensions.
 const table:unknown[][]=[],rowNumbers:number[]=[];
 sheet.eachRow(source=>{const row:unknown[]=[];source.eachCell(cell=>{
  const v=cell.value;if(v===null||v===undefined)return;
  if(typeof v==='object'&&('formula' in v||'sharedFormula' in v))throw new Error('Baris '+source.number+': tukar formula kepada nilai biasa sebelum import.');
  const value=typeof v==='object'&&'richText' in v?v.richText.map(x=>x.text).join(''):v;
  if(!String(value??'').trim())return;
  if(Number(cell.col)>30)throw new Error('Baris '+source.number+': terdapat data selepas lajur AD. Had 30 lajur; kosongkan data tambahan sebelum import.');
  row[Number(cell.col)-1]=value;
 });if(row.length){table.push(row);rowNumbers.push(source.number);}});
 return parseTeacherTable(table,rowNumbers);
}
export async function saveWorkbook(wb:import('exceljs').Workbook,name:string){
 const buffer=await wb.xlsx.writeBuffer();const bytes=new Uint8Array(buffer);const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},10000);
}
export async function teacherListWorkbook(rows:TeacherRosterRow[]){
 const {Workbook}=await import('exceljs'),wb=new Workbook(),s=wb.addWorksheet('Senarai Guru');
 s.addRow(rosterHeaders);for(const [i,t] of rows.entries())s.addRow([t.sourceNumber||i+1,t.name,t.gender??'',t.ic??'',t.position??'',t.grade??'',t.session??'',t.status??'',t.whereabouts??'',t.type==='khas'?'Pendidikan Khas':'Perdana',t.id??'']);
 s.getColumn(4).numFmt='@';styleSheet(s,[8,42,14,20,25,13,14,18,24,24,40]);return wb;
}
export function styleSheet(s:import('exceljs').Worksheet,widths:number[]){
 s.views=[{state:'frozen',ySplit:1,xSplit:0,showGridLines:false}];s.columns.forEach((c,i)=>{c.width=widths[i]??18;});
 s.getRow(1).height=34;s.getRow(1).eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'24533E'}};c.font={name:'Arial',size:11,bold:true,color:{argb:'FFFFFF'}};c.alignment={vertical:'middle',horizontal:'center',wrapText:true};});
 for(let i=2;i<=s.rowCount;i++){s.getRow(i).height=28;s.getRow(i).eachCell(c=>{c.font={name:'Arial',size:11,color:{argb:'203B2D'}};c.alignment={vertical:'middle',wrapText:true};});}
 s.autoFilter={from:{row:1,column:1},to:{row:Math.max(1,s.rowCount),column:s.columnCount}};
 s.pageSetup={paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0};s.pageSetup.printTitlesRow='1:1';
}
