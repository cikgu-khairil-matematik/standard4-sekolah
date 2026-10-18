declare const Deno:{env:{get(key:string):string|undefined};serve(handler:(req:Request)=>Promise<Response>):void};
declare module 'npm:@supabase/supabase-js@2.102.0' {export function createClient(...args:any[]):any;}
