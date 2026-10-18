import {build} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
await build({configFile:path.resolve('migration/pages/vite.config.mjs')});
const out='migration/dist';fs.copyFileSync('migration/pages/sw.js',out+'/sw.js');
const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));manifest.id='./';manifest.start_url='./';manifest.scope='./';for(const i of manifest.icons)i.src=i.src.replace(/^\//,'./');fs.writeFileSync(out+'/manifest.webmanifest',JSON.stringify(manifest));
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(p+'/'+d.name):[p+'/'+d.name]);
const assets=walk(out).map(p=>p.slice(out.length+1)).filter(p=>p.startsWith('assets/')||p.startsWith('icons/')||p==='favicon.svg');fs.writeFileSync(out+'/offline-assets.json',JSON.stringify(assets));fs.writeFileSync(out+'/.nojekyll','');console.log('GitHub Pages build ready:',assets.length,'offline assets');
