'use strict';
window.TeacherAdmin=(()=>{
 const config={...(window.TEACHER_CONFIG||{})},key='teacher-admin-session-v1';
 config.supabaseUrl=String(config.supabaseUrl||'').replace(/\/+$/,'');
 let session=null,verified=false,revision=null;
 const configured=()=>typeof config.supabaseUrl==='string'&&/^https:\/\/[a-z0-9.-]+$/i.test(config.supabaseUrl)&&Boolean(config.supabaseAnonKey);
 const changed=()=>window.dispatchEvent(new Event('teacher-auth-change'));
 function clearSession(){session=null;verified=false;try{sessionStorage.removeItem(key);}catch{}changed();}
 function remember(){try{sessionStorage.setItem(key,JSON.stringify(session));}catch{}}
 const isAdmin=()=>verified&&session&&session.expiresAt>Date.now();
 async function request(path,{method='GET',body,auth=false,raw=false,headers={}}={}){
  if(!configured())throw Error('Yönetici servisi henüz bağlanmadı.');
  if(auth){await refreshIfNeeded();if(!isAdmin())throw Error('Bu işlem için yönetici girişi gerekiyor.');}
  const response=await fetch(config.supabaseUrl+path,{method,headers:{apikey:config.supabaseAnonKey,...(session?.accessToken?{Authorization:'Bearer '+session.accessToken}:{}),...(body&&!raw?{'Content-Type':'application/json'}:{}),...headers},body:body?(raw?body:JSON.stringify(body)):undefined,cache:'no-store'});
  if(!response.ok){if(auth&&(response.status===401||response.status===403))clearSession();let error={};try{error=await response.json();}catch{}
   if(error.code==='40001')throw Error('Kayıt başka bir oturumda güncellendi. Sayfayı yenileyip tekrar dene.');
   if(error.code==='23514')throw Error('Kayıt biçimi sunucu tarafından kabul edilmedi.');
   if(response.status===401||response.status===403)throw Error('Giriş veya yönetici yetkisi doğrulanamadı.');
   throw Error('Sunucu işlemi tamamlayamadı. Bağlantıyı ve kurulum ayarlarını kontrol et.');
  }
  if(raw)return response.blob();if(response.status===204||response.headers.get('content-length')==='0')return null;
  const text=await response.text();return text?JSON.parse(text):null;
 }
 function acceptSession(payload){if(!payload?.access_token||!payload?.user?.id)throw Error('Giriş doğrulanamadı.');session={accessToken:payload.access_token,refreshToken:payload.refresh_token,userId:payload.user.id,expiresAt:Date.now()+(payload.expires_in||3600)*1000};verified=false;remember();}
 async function verifyRole(){if(!session)return false;const rows=await request('/rest/v1/teacher_admins?select=user_id&user_id=eq.'+encodeURIComponent(session.userId));verified=Array.isArray(rows)&&rows.some(row=>row.user_id===session.userId);if(!verified){clearSession();throw Error('Bu hesabın yönetici yetkisi yok.');}remember();return true;}
 async function refreshIfNeeded(){if(!session)return;if(session.expiresAt>Date.now()+30000)return;try{const response=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refreshToken}});acceptSession(response);await verifyRole();changed();}catch{clearSession();throw Error('Oturumun süresi doldu. Yeniden giriş yap.');}}
 async function initialize(){if(!configured())return;try{const stored=JSON.parse(sessionStorage.getItem(key));if(stored?.accessToken&&stored?.refreshToken&&stored?.userId){session=stored;await refreshIfNeeded();await verifyRole();changed();}}catch{clearSession();}}
 async function login(username,password){if(String(username).trim()!==config.adminUsername)throw Error('Kullanıcı adı veya şifre doğrulanamadı.');const payload=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:config.adminEmail,password}});acceptSession(payload);try{await verifyRole();changed();return true;}catch(error){clearSession();throw error;}}
 async function logout(){try{if(session)await request('/auth/v1/logout',{method:'POST'});}finally{clearSession();}}
 async function loadPublic(){if(!configured())return null;const rows=await request('/rest/v1/teacher_content?id=eq.1&select=content,revision');if(!Array.isArray(rows)||rows.length!==1)throw Error('Ortak içerik kaydı bulunamadı.');revision=rows[0].revision;return rows[0].content;}
 async function saveState(content){const response=await request('/rest/v1/rpc/teacher_save_content',{method:'POST',auth:true,body:{p_document:content,p_revision:revision}});revision=response.revision;return response.content;}
 async function listDocuments(){if(!isAdmin())return [];return request('/rest/v1/teacher_documents?select=id,title,name,category,storage_path,type&order=created_at.desc',{auth:true});}
 const objectPath=path=>path.split('/').map(encodeURIComponent).join('/');
 const storage=path=>'/storage/v1/object/'+config.storageBucket+'/'+objectPath(path);
 async function getDocument(document){return request('/storage/v1/object/authenticated/'+config.storageBucket+'/'+objectPath(document.storage_path),{auth:true,raw:true});}
 async function deleteObjects(paths){if(paths.length)await request('/storage/v1/object/'+config.storageBucket,{method:'DELETE',auth:true,body:{prefixes:paths}});}
 async function uploadObject(row){if(!isAdmin())throw Error('Yönetici girişi gerekiyor.');const fileId=crypto.randomUUID(),storagePath=session.userId+'/'+fileId;await request(storage(storagePath),{method:'POST',auth:true,body:row.blob,raw:true,headers:{'Content-Type':row.blob.type||'application/octet-stream','x-upsert':'false'}});return {id:fileId,title:row.title,name:row.name,category:row.category,storage_path:storagePath,type:row.blob.type||'application/octet-stream'};}
 async function putDocument(row,previous=null){const metadata=await uploadObject(row);try{await request('/rest/v1/rpc/teacher_put_document',{method:'POST',auth:true,body:{p_file:metadata,p_previous_id:previous?.storage_path?previous.id:null}});}catch(error){try{await deleteObjects([metadata.storage_path]);}catch{}throw error;}
  if(previous?.storage_path){try{await deleteObjects([previous.storage_path]);}catch{window.dispatchEvent(new CustomEvent('teacher-admin-notice',{detail:'Dosya güncellendi; eski dosyanın depolama temizliği daha sonra yapılmalı.'}));}}
 }
 async function removeDocument(row){await request('/rest/v1/rpc/teacher_delete_document',{method:'POST',auth:true,body:{p_id:row.id}});try{await deleteObjects([row.storage_path]);}catch{window.dispatchEvent(new CustomEvent('teacher-admin-notice',{detail:'Kayıt silindi; dosyanın depolama temizliği daha sonra yapılmalı.'}));}}
 async function restoreBackup(content,files){const previous=await listDocuments(),uploads=[];try{for(const row of files)uploads.push(await uploadObject(row));const result=await request('/rest/v1/rpc/teacher_restore_content',{method:'POST',auth:true,body:{p_document:content,p_revision:revision,p_files:uploads}});revision=result.revision;}catch(error){try{await deleteObjects(uploads.map(row=>row.storage_path));}catch{}throw error;}
  try{await deleteObjects(previous.map(row=>row.storage_path));}catch{window.dispatchEvent(new CustomEvent('teacher-admin-notice',{detail:'Yedek yüklendi; önceki dosyaların depolama temizliği daha sonra yapılmalı.'}));}
 }
 async function analysis(){return request('/rest/v1/rpc/teacher_analysis',{method:'POST',auth:true,body:{}});}
 setInterval(()=>{if(session&&session.expiresAt<=Date.now())clearSession();},30000);
 if(!config.supabaseUrl&&!config.supabaseAnonKey&&config.temporaryLogin)return window.TeacherTemporaryAdmin;
 return {mode:'server',configured,isAdmin,initialize,login,logout,loadPublic,saveState,listDocuments,getDocument,putDocument,removeDocument,restoreBackup,analysis};
})();
