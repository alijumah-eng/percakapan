import {createServer} from 'node:http';
import {mkdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createApi} from './api';
const dir=resolve('.local-data');await mkdir(dir,{recursive:true});
const file=(key:string)=>resolve(dir,key.replaceAll('/','_')+'.json');
const api=createApi({get:async key=>{try{return JSON.parse(await readFile(file(key),'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}},set:async(key,value)=>{const temp=file(key)+'.'+crypto.randomUUID();await writeFile(temp,JSON.stringify(value));await rename(temp,file(key));},delete:async key=>{try{await unlink(file(key));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}});
createServer(async(req,res)=>{
 try{let size=0;const chunks:Buffer[]=[];for await(const chunk of req){size+=chunk.length;if(size>4096){res.writeHead(413);res.end();return;}chunks.push(chunk);}
 const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers as Record<string,string>,...(!['GET','HEAD'].includes(req.method||'GET')?{body:Buffer.concat(chunks)}:{})});
 // Vite forwards the browser origin; requests are same-origin at the frontend proxy.
 request.headers.delete('origin');const reply=await api(request);res.writeHead(reply.status,Object.fromEntries(reply.headers));res.end(await reply.text());
 }catch{res.writeHead(500);res.end('{"error":"Server lokal gagal"}');}
}).listen(3001,'127.0.0.1',()=>console.log('Hiwar API: http://127.0.0.1:3001'));
