import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
import path from 'node:path';
export default defineConfig({root:path.resolve('migration/pages'),base:'./',plugins:[react(),{name:'standard4-pages',transform(code,id){if(!id.endsWith('/app/app-root.tsx'))return;return code.replace("navigator.serviceWorker.register('/sw.js',{scope:'/'})","navigator.serviceWorker.register('./sw.js',{scope:'./'})").replace("u.pathname.startsWith('/assets/')","u.pathname.includes('/assets/')").replace(/<p className="login-owner-note">[\s\S]*?<\/p>/,'').replaceAll("href=\"/signin-with-chatgpt?return_to=/\"","href=\"#\"");}}],css:{postcss:{plugins:[tailwind()]}},build:{outDir:path.resolve('migration/dist'),emptyOutDir:true},publicDir:path.resolve('public')});
