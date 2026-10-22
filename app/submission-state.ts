export function validatedSubmissionIssues<T>(data:T,clean:(data:T)=>T,validate:(data:T)=>string[]):string[]{
 try{return validate(clean(data));}catch(e){return [(e as Error).message||'Semak maklumat borang dan pautan evidens.'];}
}
export function submissionBlocker({issues,saved,dirty,pending,online,uploading}:{issues:string[];saved:boolean;dirty:boolean;pending:boolean;online:boolean;uploading:boolean}):string{
 if(uploading)return 'Tunggu semua muat naik evidens selesai.';
 if(dirty)return 'Simpan draf bersama semua evidens sebelum menghantar.';
 if(pending)return 'Selaraskan draf dan evidens dengan pelayan sebelum menghantar.';
 if(!online)return 'Penghantaran memerlukan sambungan internet.';
 if(!saved)return 'Simpan draf bersama semua evidens sebelum menghantar.';
 return issues[0]??'';
}
