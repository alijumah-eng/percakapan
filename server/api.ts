import lessons from './lessons.json';
import {createHash} from 'node:crypto';
export interface Store {get(key:string):Promise<unknown>;set(key:string,value:unknown):Promise<void>;delete(key:string):Promise<void>}
export function createApi(store:Store){return async function(request:Request):Promise<Response>{
 const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
 const path=new URL(request.url).pathname.replace(/^\/.netlify\/functions\/api/,'/api');
 const method=request.method;
 if(!['GET','POST','DELETE'].includes(method)) return json({error:'Metode tidak diizinkan'},405);
 if(request.headers.get('origin') && request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origin tidak diizinkan'},403);
 const publicLesson=(l:typeof lessons[number])=>({...l,quiz:l.quiz.map(({answer,explanation,...q})=>q)});
 if(path==='/api/lessons'&&method==='GET')return json(lessons.map(publicLesson));
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'');
 if(!token|| !/^[a-f0-9]{64}$/.test(token))return json({error:'Kode progres tidak valid'},401);
 const user=createHash('sha256').update(token).digest('hex');
 try{
 if(path==='/api/progress'&&method==='GET'){
 const records=await Promise.all(lessons.map(l=>store.get(`${user}/${l.id}`)));
 return json(Object.fromEntries(records.map((r,i)=>[lessons[i].id,r]).filter(([,v])=>v)));
 }
 if(path==='/api/progress'&&method==='DELETE'){await Promise.all(lessons.map(l=>store.delete(`${user}/${l.id}`)));return json({ok:true});}
 if(method!=='POST')return json({error:'Endpoint tidak ditemukan'},404);
 const raw=await request.text(); if(raw.length>4096)return json({error:'Permintaan terlalu besar'},413);
 let body:Record<string,unknown>;try{body=JSON.parse(raw);}catch{return json({error:'JSON tidak valid'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Data tidak valid'},400);
 const lesson=lessons.find(l=>l.id===body.lessonId);if(!lesson)return json({error:'Materi tidak ditemukan'},404);
 const key=`${user}/${lesson.id}`;
 if(path==='/api/complete'){const prior=await store.get(key) as Record<string,unknown>|null; await store.set(key,{...prior,completed:true,updatedAt:new Date().toISOString()});return json({ok:true});}
 if(path==='/api/quiz'){
 const answers=body.answers;if(!Array.isArray(answers)||answers.length!==lesson.quiz.length||answers.some(a=>!Number.isInteger(a)||a<0||a>3))return json({error:'Lengkapi semua jawaban'},400);
 const results=lesson.quiz.map((q,i)=>({id:q.id,correct:answers[i]===q.answer,answer:q.answer,explanation:q.explanation}));
 const score=Math.round(results.filter(q=>q.correct).length/results.length*100);
 const prior=await store.get(key) as Record<string,unknown>|null;
 await store.set(key,{...prior,score,completed:true,updatedAt:new Date().toISOString()});return json({score,results});
 }
 return json({error:'Endpoint tidak ditemukan'},404);
 }catch{return json({error:'Penyimpanan belum tersedia. Coba lagi nanti.'},503);}
};}
