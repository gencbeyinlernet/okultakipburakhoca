# Burak TURGUT · Öğretmen Takip ve Bilgi Kaynak Sistemi

Öğretmenin dijital çantası: görevler, haftalık program, hazırlık planları, kişisel evraklar, tarihler, notlar ve eğitim bağlantıları. Öğrenci kaydı içermez.

**Site:** https://gencbeyinlernet.github.io/okultakipburakhoca/

## Şimdiki giriş ve kayıt biçimi

Ziyaretçiler içerikleri görüntüler. Ekleme, düzenleme, silme, görev tamamlama, kontrol listeleri, analiz ve yedekleme için **Yönetici girişi** gerekir. Kullanıcı adı `burakturgut`; girişte belirlenen şifre kullanılır. Çıkış yapınca düzenleme alanları kapanır.

Kullanıcının tercihiyle şimdilik **geçici, tarayıcıda çalışan şifre kilidi** aktiftir. Şifre açık metin olarak dosyalara yazılmaz; tarayıcı SHA-256 özetiyle karşılaştırır. Bu bir sunucu güvenlik sınırı değildir: istemci koduna veya tarayıcı verilerine erişebilen kişi kilidi aşabilir. Özellikle kişisel dosyalar bu modda şifrelenmez.

Görev ve plan değişiklikleri bu tarayıcının localStorage alanında; yüklenen dosyalar ayrı IndexedDB alanında saklanır. Değişiklikler GitHub'a veya başka cihazlara gönderilmez. Diğer ziyaretçiler yayınlanan örnek içerikleri görür. Aynı tarayıcıdaki ziyaretçi yeni ortak kayıtları okuyabilir; dosya listesi uygulamada yönetici girişine bağlıdır. Sekme oturumu 8 saat geçerlidir.

Eski tarayıcı kayıtları silinmez ve otomatik yayınlanmaz. Giriş sonrası **Yedekleme & ayarlar → Eski kayıtları yedekle** üzerinden alınabilir.

## Gerçek yönetici güvenliği, daha sonra

Supabase Auth, Postgres satır güvenliği ve özel Storage kovası için altyapı hazırdır. [Kurulum adımları](backend/SETUP.md) bağlantıyı anlatır. `assets/config.js` içinde geçerli Project URL ve public publishable/anon anahtarı doldurulduğunda geçici mod otomatik bırakılır; şifre ve yetki sunucuda doğrulanır. Supabase hesabı oluşturulmadan eski şifre kendiliğinden sunucuya aktarılmaz.

Sunucu modunda herkes ortak görev, program, plan, tarih, not ve kaynak metinlerini okur; yalnızca yetkili yönetici değiştirir. Yüklenen belgeler ve analiz/yedekleme yöneticiye özeldir. Şifre veya `service_role` anahtarı ön yüz dosyalarına yazılmaz.

## Yerelde çalıştırma

Derleme veya paket kurulumu gerekmez. Proje klasöründe:

```sh
python3 -m http.server 3001 --bind 127.0.0.1
```

Windows'ta `python3` yerine `python` kullanılabilir. Tarayıcıda http://localhost:3001 aç. Şifre özeti için HTTPS veya localhost gerekir.

Dosya başına 20 MB, içe aktarılan JSON yedeği için 150 MB sınırı vardır. Tarayıcı verileri temizlenince geçici kayıtlar silinebilir; dosyaları da içeren yedeğini indir. Tarihler manuel eklenir; e-posta veya arka plan bildirimi yoktur. Yedekten geri yükleme onay gerektirir.

## Örnek içerikler ve yayın

Örnek görevler, program, planlar, tarihler, notlar, bağlantılar ve 6 indirilebilir metin şablonu bulunur. Özet kartlarındaki 2 görev, 3 ders, 178 evrak ve 78 tarih sunum sayılarıdır. Yönetici gerçek sayılara geçebilir. Analiz mevcut kayıtları sayar.

GitHub **Settings → Pages → Deploy from a branch → main → / (root) → Save** ile yayınlanır. `index.html` kökte, `assets` yanında olmalıdır. Pages arayüzü barındırır; özel belgeleri GitHub deposuna koyma. Genel rehber: [YAYIN-REHBERI.md](YAYIN-REHBERI.md).
