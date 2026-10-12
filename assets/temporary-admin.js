'use strict';
// Temporary browser-only editing gate, not server authorization.
// Supabase configuration automatically replaces this mode with server authorization.
window.TeacherTemporaryAdmin=(()=>{
 const config=window.TEACHER_CONFIG||{},sessionKey='teacher-preview-session-v1',contentKey='teacher-preview-content-v1';
 let session=null;
 const mode='temporary';
 const configured=()=>config.temporaryLogin===true&&Boolean(config.temporaryPasswordHash)&&Boolean(crypto.subtle);
 const isAdmin=()=>Boolean(session&&session.expiresAt>Date.now());
 const changed=()=>window.dispatchEvent(new Event('teacher-auth-change'));
 function clear(){session=null;try{sessionStorage.removeItem(sessionKey);}catch{}changed();}
 function ensure(){if(!isAdmin())throw Error('Bu işlem için yönetici girişi gerekiyor.');}
 async function initialize(){try{const stored=JSON.parse(sessionStorage.getItem(sessionKey));if(stored?.expiresAt>Date.now()){session=stored;changed();}}catch{clear();}}
 async function login(username,password){
  if(!configured())throw Error('Geçici giriş bu tarayıcıda kullanılamıyor. HTTPS üzerinden aç.');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password));
  const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  if(String(username).trim()!==config.adminUsername||hash!==config.temporaryPasswordHash)throw Error('Kullanıcı adı veya şifre doğrulanamadı.');
  const next={expiresAt:Date.now()+8*60*60*1000};
  try{sessionStorage.setItem(sessionKey,JSON.stringify(next));}catch{throw Error('Tarayıcı oturum depolaması kullanılamıyor.');}
  session=next;changed();return true;
 }
 async function logout(){clear();}
 async function loadPublic(){try{const raw=localStorage.getItem(contentKey);return raw?JSON.parse(raw):null;}catch{throw Error('Bu tarayıcıdaki ortak kayıtlar okunamadı.');}}
 async function saveState(content){ensure();try{localStorage.setItem(contentKey,JSON.stringify(content));}catch{throw Error('Kayıt saklanamadı. Tarayıcının depolama alanını kontrol et.');}return structuredClone(content);}
 function openDB(){return new Promise((resolve,reject)=>{const request=indexedDB.open('teacher-preview-private-files-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('files',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
 async function files(mode,action){ensure();const db=await openDB();try{ensure();return await new Promise((resolve,reject)=>{const tx=db.transaction('files',mode),request=action(tx.objectStore('files'));let result;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Dosya işlemi iptal edildi.'));});}finally{db.close();}}
 async function listDocuments(){if(!isAdmin())return [];return (await files('readonly',store=>store.getAll())).map(({blob,...row})=>row);}
 async function getDocument(document){const row=await files('readonly',store=>store.get(document.id));if(!row?.blob)throw Error('Dosya bu tarayıcıda bulunamadı.');ensure();return row.blob;}
 async function putDocument(row,previous){ensure();const document={...row,id:previous?.id||crypto.randomUUID(),storage_path:'temporary',type:row.blob.type};await files('readwrite',store=>store.put(document));}
 async function removeDocument(row){await files('readwrite',store=>store.delete(row.id));}
 async function restoreBackup(content,documents){
  ensure();const before=await loadPublic();
  // No asynchronous work inside the IndexedDB transaction. On storage failure,
  // abort it so previous files remain intact.
  const db=await openDB();try{ensure();await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite'),store=tx.objectStore('files');let storageSaved=false;
   tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>{if(storageSaved){try{if(before)localStorage.setItem(contentKey,JSON.stringify(before));else localStorage.removeItem(contentKey);}catch{}}reject(tx.error||Error('Yedek yüklenemedi.'));};
   store.clear();for(const row of documents)store.put({...row,id:crypto.randomUUID(),storage_path:'temporary',type:row.blob.type});
   try{localStorage.setItem(contentKey,JSON.stringify(content));storageSaved=true;}catch{tx.abort();}
  });}finally{db.close();}
 }
 async function analysis(){ensure();const content=await loadPublic();if(!content)throw Error('Henüz bu tarayıcıda kaydedilmiş içerik yok.');const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return {pending:content.tasks.filter(t=>!t.done).length,completed:content.tasks.filter(t=>t.done).length,plans:content.plans.length,documents:(await listDocuments()).length,events:content.events.filter(e=>e.date>=date).length};}
 setInterval(()=>{if(session&&session.expiresAt<=Date.now())clear();},30000);
 return {mode,configured,isAdmin,initialize,login,logout,loadPublic,saveState,listDocuments,getDocument,putDocument,removeDocument,restoreBackup,analysis};
})();
