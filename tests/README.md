# Doğrulama

Uygulamanın kendisi paket kurulumu gerektirmez. Bu testler Node.js, Playwright/Chromium ve isteğe bağlı SQL testi için `@electric-sql/pglite` kullanır. Test araçlarını ayrı bir klasöre kurup `NODE_PATH` ile o klasörün `node_modules` dizinini gösterebilirsin.

## Geçici mod

Siteyi HTTP ile çalıştır. `TEACHER_TEST_ORIGIN` varsayılan olarak `http://127.0.0.1:3001` adresidir. `TEACHER_TEST_PASSWORD` değerini test terminalinin ortamında belirle; dosyaya veya depoya yazma. Sistem Chromium kullanılıyorsa `CHROMIUM_PATH` ile yolunu belirt.

```sh
node tests/temporary-mode.cjs
```

Ziyaretçi görünümleri, yanlış/doğru şifre, giriş/çıkış, yeniden yükleme, görev işlemleri, dosya yükleme/indirme, analiz, tam yedek/geri yükleme ve ekran taşması kontrol edilir. Yeni tarayıcı profiliyle çalışır; gerçek kullanıcı kayıtlarını değiştirmez.

## Gelecekteki sunucu modu

```sh
node tests/database-permissions.cjs
```

SQL şemasını gerçek bir yerel Postgres motorunda (PGlite) çalıştırır. Supabase Auth ve Storage tabloları için test şemaları kullanılır. Anonim/normal kullanıcı yazmalarının reddini, yönetici yazmalarını, özel dosya erişim sınırlarını, sürüm çakışmasını ve başarısız geri yüklemenin atomik kalmasını doğrular. Bu test canlı Supabase bağlantı testi değildir.
