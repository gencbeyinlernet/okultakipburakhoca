# ChatGPT ile hazırla, GitHub Pages ile ücretsiz yayınla

HTML tabanlı bir içeriği beş adımda paylaşılabilir bir web sitesine dönüştürelim. Gerekenler: ChatGPT, GitHub hesabı ve tarayıcı. GitHub Free hesabındaki herkese açık depolar GitHub Pages ile ücretsiz yayınlanabilir. Ücretli alan adı şart değildir. Bu yöntem statik HTML, CSS ve JavaScript içindir; veritabanı veya sunucu uygulaması sağlamaz.

## 1. Fikrini ChatGPT’ye anlat

Kimin kullanacağını, hangi amaçla hazırlanacağını ve hangi alanları istediğini yaz.

Örnek:

> “Burak TURGUT Öğretmen Takip ve Bilgi Kaynak Sistemi adında, öğretmenin dijital çantası gibi bir site hazırla. Görevler, ders programı, hazırlık planları, kişisel evraklar, önemli tarihler ve notlar olsun. Öğrenci bilgileri veya öğrenci evrakları olmasın. Mobil uyumlu olsun ve GitHub Pages üzerinde ücretsiz çalışacak HTML, CSS ve JavaScript kullan.”

Görsel önerisi: Bu isteğin ChatGPT’ye yazıldığı ekran ve yanında sitenin bölüm kartları.

## 2. HTML dosyalarını hazırla

ChatGPT’nin hazırladığı proje dosyalarını indir, ZIP içindeyse klasöre çıkart. `index.html` ana sayfadır. `assets` klasörü tasarım ve uygulama dosyalarını içerir. Birlikte kullanılmaları gerekir.

Sadece metin olarak kod aldıysan dosyaları belirtilen adlarla UTF-8 biçiminde kaydet. Ana dosyanın adını `index.html.txt` yapma.

Görsel önerisi: `index.html` ve `assets` klasörünü gösteren basit bir dosya ağacı.

## 3. GitHub’da ücretsiz bir depo oluştur ve dosyaları yükle

1. GitHub hesabına giriş yap.
2. Sağ üstte **＋ → New repository** seç.
3. **Repository name** alanına `ogretmen-takip-sistemi` yaz.
4. **Public** seç ve **Create repository** düğmesine bas.
5. Boş depoda **uploading an existing file** bağlantısını kullan. Depoda dosyalar varsa **Add file → Upload files** seç.
6. `index.html` dosyasını ve `assets` klasörünü birlikte yükle. ZIP dosyasını yüklemek siteyi çalıştırmaz; çıkarılmış dosyaları yükle.
7. **Commit changes** düğmesine bas. Ana sayfada `index.html` görünmeli; gereksiz bir üst klasörün içinde kalmamalı.

Görsel önerisi: Public seçimi ve dosya yükleme ekranı; yalnızca ilgili alanları vurgula.

## 4. GitHub Pages’i aç

1. Depodaki üst menüden **Settings** sekmesine tıkla.
2. Soldaki menüden **Pages** seç. Kişisel hesap ayarlarını değil, deponun Settings bölümünü kullan.
3. **Build and deployment → Source** alanında **Deploy from a branch** seç.
4. Orta alandaki **Branch** başlığının altında **None ▾** düğmesine tıkla. Soldaki **Branches** menüsüne tıklama.
5. Listeden **main** seç. Dalın adı farklıysa dosyalarını yüklediğin dalı seç.
6. Yanındaki klasör seçimini **/ (root)** olarak bırak.
7. **Save** düğmesine bas.

Görsel önerisi: `None → main → / (root) → Save` adımlarını numaralı oklarla gösteren bir ekran.

## 5. Adresini aç, test et ve paylaş

Yayın birkaç dakika sürebilir. Depodaki **Actions** sekmesinde **pages build and deployment** işlemini kontrol et: sarı sürüyor, yeşil tamamlandı, kırmızı hata var demektir. Yayın başarılıysa Settings → Pages içinde **Visit site** bağlantısı görünür.

Adres genellikle şöyledir:

`https://KULLANICI-ADIN.github.io/ogretmen-takip-sistemi/`

Siteyi bilgisayarda ve telefonda aç. Menüleri, kayıt düğmelerini ve mobil görünümü kontrol et. Eski sürüm görünüyorsa Ctrl+F5 ile yenile; telefon veya Mac'te yeniden yükle. Güncellenen dosyaları depoya yükleyip commit yaptığında aynı adres yeniden yayınlanır.

Görsel önerisi: Mobil ve masaüstü görünümü, yeşil yayın durumu ve paylaşılabilir adres.

---

**Paylaşım için kısa anlatım:** “Fikrimizi ChatGPT’ye anlattık. HTML dosyalarını hazırladık. GitHub’da herkese açık bir depo oluşturup dosyaları yükledik. Pages ayarlarında main ve / (root) seçip Save’e bastık. Yayın tamamlanınca ücretsiz web adresimizi açıp test ettik ve paylaştık.”

Bu rehberin görselleri sonraki aşamada üretilecek; buradaki görsel açıklamaları çekim/çizim planıdır.


Bu projenin gerçek depo adresi: https://github.com/gencbeyinlernet/okultakipburakhoca

Bu projenin Pages adresi: https://gencbeyinlernet.github.io/okultakipburakhoca/
