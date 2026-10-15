import {getStore} from '@netlify/blobs';
import {createApi} from '../../server/api';
export default async function(request:Request){
 const store=()=>getStore({name:'hiwar-progress-v1',consistency:'strong'});
 return createApi({get:key=>store().get(key,{type:'json'}),set:async(key,value)=>{await store().setJSON(key,value);},delete:key=>store().delete(key)})(request);
}
