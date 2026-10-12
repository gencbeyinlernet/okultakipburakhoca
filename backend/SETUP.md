# Daha sonra güvenli sunucu girişini etkinleştirme

Şimdilik tarayıcı şifre kilidi kullanılıyor. Aşağıdaki kurulumdan sonra giriş doğrulaması ve yazma yetkisi sunucuda uygulanır; ortak içerikler cihazlar arasında paylaşılır, yüklenen dosyalar özel depolamada saklanır.

## 1. Supabase projesi oluştur

[Supabase Dashboard](https://supabase.com/dashboard) üzerinde ücretsiz bir proje aç. Ücretsiz planın kullanım ve depolama kotaları geçerlidir. Bu uygulama için ayrı bir proje kullan.

## 2. SQL dosyalarını çalıştır

**SQL Editor → New query** alanında önce [schema.sql](schema.sql), ardından [seed.sql](seed.sql) içeriğini çalıştır. Seed yalnızca tanıtım metinlerini ekler; eski yerel kayıtlarını yayınlamaz.

`teacher_content` ortak içeriktir. Doğrudan yazma erişimi kapalıdır; yönetici kontrolü yapan fonksiyonlar üzerinden değiştirilir. `teacher-private-files` kovası özel oluşturulur. Dosya listesi ve dosyalar yalnızca ilgili yetkili yöneticiye açılır.

## 3. Yönetici hesabını oluştur

**Authentication → Users → Add user → Create new user** alanında e-posta olarak `burakturgut@ogretmen.local`, şifre olarak belirlediğin yönetici şifresini gir. **Auto Confirm User** seçeneğini etkinleştir. Adres hesap kimliğidir; e-posta kutusu değildir. Sitede kullanıcı adı `burakturgut` ile giriş yapılır.

Hesabın **User UID** değerini kopyala. SQL Editor'da aşağıdaki yer tutucuyu gerçek UID ile değiştirip çalıştır:

```sql
insert into public.teacher_admins(user_id)
values ('BURAYA-GERCEK-USER-UID')
on conflict(user_id) do nothing;
```

**Authentication → Settings / Sign In and Sign Up** bölümünde yeni kullanıcı kaydını kapat. Giriş yapmak tek başına yönetici yetkisi vermez; hesap `teacher_admins` içinde olmalıdır.

## 4. Bağlantıyı kaydet ve yayınla

Projenin **Connect / API Keys** alanından Project URL ve public publishable veya eski public anon anahtarını al. [assets/config.js](../assets/config.js) dosyasında aşağıdaki iki alanı doldur:

```js
supabaseUrl: 'https://PROJE-KIMLIGI.supabase.co',
supabaseAnonKey: 'PUBLIC-PUBLISHABLE-VEYA-ANON-ANAHTAR',
```

Bu dosyaya şifre, `service_role`, secret key veya erişim tokenı yazma. Public anahtar görünür; asıl erişim sınırını veritabanı yetkileri uygular. Kullanıcı adı/e-posta eşlemesi ve kova adı aynı kalmalıdır. İstersen `temporaryLogin` değerini de `false` yapıp `temporaryPasswordHash` alanını kaldır.

GitHub'a kaydet ve Pages yayını bitince siteyi yenile. İki bağlantı alanı doldurulduğunda geçici mod otomatik bırakılır. Supabase'de hesabı oluştururken girdiğin şifreyle giriş yap.

## Son kontrol ve kayıt taşıma

- Yönetici olarak görev ekle; ayrı gizli sekmede ziyaretçi olarak sayfayı yenile ve yeni görevi gör.
- Ziyaretçide ekleme/düzenleme, analiz ve yedekleme alanları kapalı kalmalıdır.
- Yönetici bir dosya yükleyip indirebilir; ziyaretçi özel dosya listesine ve depolamaya erişemez.
- Önceki yerel kayıtlarını geçici modda yedekle. Sunucu moduna geçtikten sonra bu yedeği yönetici olarak içe aktar. Görev, plan ve not metinleri herkese görünür; kişisel dosyalar yöneticiye özel kalır. Aktarma mevcut ortak kayıtların yerine geçer ve onay ister.
- Yönetici yetkisini kaldırmak için ilgili UID'yi `teacher_admins` tablosundan sil; sonraki sunucu işleminde yetki reddedilir. Şifreyi Authentication üzerinden değiştir.
- İki oturum aynı kaydı değiştirdiğinde eski sürümün diğer kaydı ezmesi engellenir; çakışma mesajında sayfayı yenile.

Yerel SQL ve arayüz testleri gerçek Supabase bağlantısının son kontrolü yerine geçmez.
