import {useEffect,useRef,useState} from 'react';
export function useTts(){
 const supported=typeof window!=='undefined'&&'speechSynthesis' in window;
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voice,setVoice]=useState(''),[rate,setRate]=useState(.85),[active,setActive]=useState(-1),[error,setError]=useState('');
 const sequence=useRef(0);const current=useRef<SpeechSynthesisUtterance|null>(null);const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 function stop(){sequence.current++;clearTimeout(timer.current);if(supported)window.speechSynthesis.cancel();current.current=null;setActive(-1);}
 useEffect(()=>{if(!supported)return;const update=()=>{const list=window.speechSynthesis.getVoices().filter(v=>/^ar(?:-|$)/i.test(v.lang));setVoices(list);setVoice(old=>list.some(v=>v.voiceURI===old)?old:list[0]?.voiceURI||'');};update();window.speechSynthesis.addEventListener('voiceschanged',update);return()=>{sequence.current++;clearTimeout(timer.current);window.speechSynthesis.removeEventListener('voiceschanged',update);window.speechSynthesis.cancel();};},[]);
 function speak(lines:string[],start=0){stop();setError('');if(!supported||!voices.length){setError('Suara Arab belum tersedia. Aktifkan suara bahasa Arab di pengaturan bahasa atau aksesibilitas perangkat, lalu muat ulang halaman.');return;}
 const id=sequence.current;
 function next(i:number){if(id!==sequence.current)return;if(i>=lines.length){setActive(-1);return;}
 const u=new SpeechSynthesisUtterance(lines[i]);current.current=u;u.voice=voices.find(v=>v.voiceURI===voice)||voices[0];u.lang=u.voice.lang;u.rate=rate;u.onstart=()=>{if(id===sequence.current)setActive(i);};u.onend=()=>{if(id===sequence.current)timer.current=setTimeout(()=>next(i+1),350);};u.onerror=e=>{if(id===sequence.current){setActive(-1);setError(`Audio tidak dapat diputar (${e.error}). Coba suara lain atau periksa koneksi.`);}};setActive(i);window.speechSynthesis.speak(u);}
 next(start);
 }
 return {supported,voices,voice,setVoice,rate,setRate,active,error,speak,stop};
}
