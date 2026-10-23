import {inspectSchoolChoices,schoolChoiceKey} from '../migration/backend/resources-model';
export type SchoolListImport={classes:string[];subjects:string[];duplicates:string[];errors:string[]};
const heading=(value:unknown)=>typeof value==='string'?schoolChoiceKey(value).replace(/\./g,''):'';
export function parseSchoolListTable(table:unknown[][],kind:'classes'|'subjects',rowNumbers?:number[]){
 const label=kind==='classes'?'Kelas':'Mata pelajaran',aliases=kind==='classes'?['NAMA KELAS','KELAS']:['MATA PELAJARAN','NAMA MATA PELAJARAN','MATAPELAJARAN'];
 const hi=table.findIndex(row=>row.some(v=>aliases.includes(heading(v))));
 if(hi<0)return {names:[],duplicates:[],errors:[label+': lajur '+aliases[0]+' tidak ditemui. Gunakan tapak Excel yang disediakan.']};
 const col=table[hi].findIndex(v=>aliases.includes(heading(v))),values:unknown[]=[],errors:string[]=[];
 for(let i=hi+1;i<table.length;i++){
  const value=table[i][col];if(value===null||value===undefined||value==='')continue;
  if(typeof value!=='string'){errors.push(label+' baris '+(rowNumbers?.[i]??i+1)+': gunakan teks biasa, tanpa formula atau objek.');continue;}
  values.push(value);
 }
 const result=inspectSchoolChoices(values,label);return {...result,errors:[...errors,...result.errors]};
}
export function mergeSchoolLists(current:{classes:string[];subjects:string[]},incoming:{classes:string[];subjects:string[]}){
 const classes=inspectSchoolChoices([...current.classes,...incoming.classes],'Kelas'),subjects=inspectSchoolChoices([...current.subjects,...incoming.subjects],'Mata pelajaran');
 return {classes:classes.names,subjects:subjects.names,addedClasses:classes.names.length-inspectSchoolChoices(current.classes,'Kelas').names.length,addedSubjects:subjects.names.length-inspectSchoolChoices(current.subjects,'Mata pelajaran').names.length,errors:[...classes.errors,...subjects.errors]};
}
export async function readSchoolListsWorkbook(file:File):Promise<SchoolListImport>{
 if(!/\.xlsx$/i.test(file.name))throw Error('Gunakan fail Excel .xlsx.');
 if(file.size>3_000_000)throw Error('Had saiz fail ialah 3 MB.');
 const {Workbook}=await import('exceljs'),wb=new Workbook();
 try{await wb.xlsx.load(await file.arrayBuffer(),{ignoreNodes:['dataValidations','drawing','extLst','conditionalFormatting']} as never);}catch{throw Error('Fail Excel tidak dapat dibaca. Simpan semula sebagai .xlsx dan cuba lagi.');}
 const result:SchoolListImport={classes:[],subjects:[],duplicates:[],errors:[]};
 for(const kind of ['classes','subjects'] as const){
  const names=kind==='classes'?['SENARAI KELAS','KELAS']:['MATA PELAJARAN','SENARAI MATA PELAJARAN','MATAPELAJARAN'];
  const sheet=wb.worksheets.find(s=>s.state==='visible'&&names.includes(heading(s.name)));
  if(!sheet){result.errors.push('Helaian '+names[0]+' tidak ditemui. Gunakan tapak Excel yang disediakan.');continue;}
  const table:unknown[][]=[],rowNumbers:number[]=[];
  sheet.eachRow(source=>{
   const row:unknown[]=[];
   // Guidance and live totals to the right are not imported as school choices.
   for(let c=1;c<=2;c++){const v=source.getCell(c).value;row.push(typeof v==='object'&&v&&'richText' in v?v.richText.map(x=>x.text).join(''):v);}
   if(row.some(v=>v!==null&&v!==undefined&&v!=='')){if(table.length>=1001)throw Error('Maksimum 1,000 baris bagi setiap helaian.');table.push(row);rowNumbers.push(source.number);}
  });
  const parsed=parseSchoolListTable(table,kind,rowNumbers);result[kind]=parsed.names;result.errors.push(...parsed.errors);result.duplicates.push(...parsed.duplicates.map(name=>(kind==='classes'?'Kelas: ':'Mata pelajaran: ')+name));
 }
 if(!result.classes.length&&!result.subjects.length&&!result.errors.length)result.errors.push('Tiada nama diisi. Isi lajur B dalam tapak Excel terlebih dahulu.');
 return result;
}
