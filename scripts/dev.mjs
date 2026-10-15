import {spawn} from 'node:child_process';
const jobs=[spawn(process.execPath,['--import','tsx','server/local.ts'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','0.0.0.0'],{stdio:'inherit'})];
let closing=false;function close(code=0){if(closing)return;closing=true;for(const p of jobs)p.kill();process.exitCode=code;}
for(const p of jobs){p.on('error',e=>{console.error(e.message);close(1)});p.on('exit',code=>close(code||0));}
process.on('SIGINT',()=>close());process.on('SIGTERM',()=>close());
