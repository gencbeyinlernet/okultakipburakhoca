# Burak TURGUT · Öğretmen Takip ve Bilgi Kaynak Sistemi

Öğretmenin dijital çantası: görevler, haftalık ders programı, hazırlık planları ve kontrol listeleri, kişisel evraklar, önemli tarihler, notlar ve eğitim bağlantıları. Öğrenci bilgisi ve öğrenci evrakı için alan içermez.

## Çalıştırma

Paket kurulumu veya derleme gerektirmez. Python 3 ile proje klasöründe:

```sh
python3 -m http.server 3001 --bind 127.0.0.1
```

Windows'ta `python3` yerine `python` kullanılabilir. HTTP üzerinden servis edin. Modern tarayıcı gerekir.

## Saklama ve yedekleme

Görevler ve planlar localStorage, dosyalar IndexedDB içinde saklanır. Kişisel kayıtlar GitHub'a gönderilmez ve cihazlar arasında otomatik eşitlenmez. Aynı web adresi ve tarayıcı profili kullanılmalıdır. Tarayıcı verileri temizlenince kayıtlar silinebilir; “Yedekleme & ayarlar” alanından dosyaları da içeren JSON yedeği indirin. Yedek içeri aktarmadan önce onay gerekir; mevcut kayıtların tamamının yerine geçer.

Dosya başına 20 MB, içe alınan yedek için 150 MB sınırı vardır. Depolama kapasitesi tarayıcıya bağlıdır. Hatırlatmalar site içinde gösterilir; e-posta ve arka plan bildirimi yoktur. Resmî tarihler otomatik gelmez; kullanıcı kendi kurumunun duyurularına göre ekler.

## Ücretsiz yayın

GitHub Free hesabında herkese açık bir depo ve GitHub Pages kullanılabilir. HTML/CSS/JavaScript dosyaları statik yayınlanır; sunucu veya ücretli hizmet gerekmez. Özel öğretmen belgelerini depoya koymayın; sitedeki evrak alanı dosyaları yalnızca tarayıcıya kaydeder.

Bağımsız bir depo açıldığında `index.html` kökte, `assets` klasörü yanında olmalıdır. Settings → Pages → Deploy from a branch → main → / (root) → Save. Ayrıntılı paylaşım rehberi: `YAYIN-REHBERI.md`.

Bu uygulama `gencbeyinlernet/okultakipburakhoca` deposunun ana klasöründen yayınlanır. GitHub Pages adresi: https://gencbeyinlernet.github.io/okultakipburakhoca/

Yayın ayarları: https://github.com/gencbeyinlernet/okultakipburakhoca/settings/pages

Source: Deploy from a branch; Branch: main; klasör: / (root). Site dosyaları bu depoda geliştirilir; Merak Bahçesi ayrı depoda kalır.

## Örnek içerikler

İlk açılışta 5 görev, 19 ders/çalışma saati, 3 hazırlık planı, 3 tarih, 3 not, 4 kaynak bağlantısı ve 3 indirilebilir metin şablonu eklenir. Başlıklar örnek olarak işaretlenir; tarihler resmî takvim değildir. Mevcut kayıtlar korunur, çakışan ders hücreleri değiştirilmez. Örnekler yalnızca bir kez eklenir ve silinen kayıtlar sayfa yenilenince geri gelmez.

Özet kartları ilk açılışta sunum için 2 görev, 3 ders, 178 evrak ve 78 yaklaşan tarih gösterir. Bunlar temsilî sayılardır. “Kayıtlarıma göre göster” düğmesi, mevcut tarayıcı kayıtlarından hesaplanan gerçek sayılara geçer; bu görünüm kayıtları değiştirmez.
