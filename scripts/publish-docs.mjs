import fs from 'node:fs';fs.rmSync('docs',{recursive:true,force:true});fs.cpSync('migration/dist','docs',{recursive:true});
