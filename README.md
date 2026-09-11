# Ceren Dik Uçal

https://cerendikucal.com — HTML, CSS ve JavaScript ile hazırlanmış statik klinik sitesi.

## Geliştirme

`npm ci` ile build bağımlılıklarını kurun, `npm run build` ile yayın klasörünü üretin.
`python3 -m http.server 8000 --directory dist` ile yalnızca yayın çıktısını önizleyin.

## Yayın

`node scripts/build.mjs` yalnızca site dosyalarını `dist/` klasörüne kopyalar.
Netlify yapılandırması `netlify.toml` dosyasındadır. Alan adı ve HTTPS Netlify üzerinden yönetilir.

## Dosya sınırları

- `dist/`: Netlify'ın yayınladığı tek klasör; Git'e eklenmez.
- `reports/`, `private/`, `scripts/local/`: yerel rapor, not ve özel yardımcılar; Git'e ve yayına girmez.
- `.env*`: yerel ortam bilgileri; `.env.example` dışında Git'e eklenmez, yayına girmez.
- `scripts/build.mjs`, `package.json`, `package-lock.json`, `netlify.toml`: build için Git'te tutulur; site ziyaretçilerine sunulmaz.
- `index.html`, `css/`, `js/`, `img/`, `fonts/`: tarayıcıya gönderilen site kaynaklarıdır. Bunlara gizli bilgi konmaz. CSS HTML içine alınır; gereken JS, görsel ve fontlar seçilerek yayınlanır.

Build yalnızca izin verilen site dosyalarını kopyalar. Asset klasörlerindeki Markdown, yapılandırma, gizli dosyalar ve sembolik bağlantılar kopyalanmaz. `fonts/OFL.txt`, font lisansı gereği yayın çıktısında tutulur.

`.gitignore` Git takibini kontrol eder; web erişimini kontrol etmez. Web erişim sınırı Netlify'ın `publish = "dist"` ayarı ve build dosya listesidir. Git'te takip edilen bir dosyayı sonradan ignore etmek geçmişini silmez.
