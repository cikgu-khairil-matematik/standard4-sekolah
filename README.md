# Standard 4 Sekolah

Aplikasi pengisian kendiri, penilaian pertama (PP1) dan penilaian kedua (PP2).

**Aplikasi:** https://cikgu-khairil-matematik.github.io/standard4-sekolah/

## Log masuk

Gunakan kod sekolah, ID pengguna dan kata laluan aplikasi yang sedia ada. Akaun ChatGPT tidak diperlukan. Kod SK Taman Desaminium ialah **BBA8284**. Ruang percubaan pemilik yang dahulu menggunakan kod itu kini menggunakan **UJI-ROZIANA**. Sekolah lain boleh mendaftar ruang dan pentadbir mereka sendiri dalam aplikasi; guru tidak perlu membuka akaun GitHub atau Supabase.

Pentadbir menyediakan akaun guru dan kod pengaktifan. Akaun guru mesti dipautkan kepada guru yang betul supaya penugasan PP1/PP2 boleh dikuatkuasakan. PYD mengisi kendiri; PP1 dan PP2 mengisi peringkat yang ditugaskan bagi guru di bawah mereka. Pentadbir mengurus sekolah dan boleh membuka semula rekod yang dihantar. Kebenaran disemak oleh pelayan pada setiap operasi.

## Online dan offline

Buka aplikasi dengan internet, log masuk, kemudian sediakan mod offline pada peranti sebelum digunakan tanpa internet. Draf disimpan secara terenkripsi menggunakan kata laluan offline dan tamat selepas tujuh hari tanpa pembaharuan. Penghantaran rasmi serta perubahan pentadbiran memerlukan internet. Semak dan selesaikan konflik apabila menyegerakkan draf.

Storan pelayar pautan lama tidak berpindah secara automatik ke github.io. Halaman lama masih membenarkan eksport sandaran offline terenkripsi. Pulihkan sandaran itu pada pautan baharu menggunakan kata laluan offline asal. Jangan padam data pelayar lama sebelum draf dipulihkan.

Pemasangan sebagai aplikasi menggunakan ciri PWA pelayar (contohnya Install app / Add to Home Screen). Pemasangan sebenar pada telefon dan ujian offline pada peranti pengguna masih perlu disahkan.

## Hosting dan binaan

Frontend dihoskan pada GitHub Pages. Workflow `.github/workflows/pages.yml` membina daripada kod dalam repositori ini dan menerbitkan output; ia tidak bergantung pada chatgpt.site. Tetapan Pages menggunakan **GitHub Actions**.

```sh
npm ci --ignore-scripts
npm run build
```

Output binaan ialah `docs/`. Salinan `docs/` yang dikomit semasa import ialah snapshot awal; gunakan binaan semasa untuk penerbitan. Semua laluan aset, manifest dan service worker diskop kepada folder aplikasi supaya tidak mengganggu aplikasi GitHub Pages yang lain. Versi pakej langsung dan lockfile dipinkan.

Backend berada dalam `migration/backend/` dan diterbitkan secara berasingan sebagai Supabase Edge Function `standard4-api` pada projek Standard 4 Sekolah. Workflow frontend tidak menerbitkan fungsi atau menukar skema pangkalan data. CORS membenarkan origin GitHub pemilik dan pautan asal sahaja; kemas kini allowlist jika domain berubah.

## Data dan keselamatan

Setiap sekolah mempunyai dokumen peribadi dalam `s4_schools`. Penulisan menggunakan revision compare-and-swap supaya rekod dan audit disimpan bersama secara atomik. Reka bentuk ini untuk saiz data sekolah, bukan beban pangkalan data umum yang sangat tinggi.

RLS diaktifkan dan akses terus jadual untuk `anon` serta `authenticated` dibatalkan. Edge Function menggunakan kunci pelayan sahaja, mengesahkan JWT dengan `getUser`, sesi aplikasi yang dihash serta keahlian dan penugasan semasa. `verify_jwt=false` pada gateway membolehkan login/aktivasi awam; semua operasi data tetap memerlukan pengesahan di dalam fungsi. Jangan masukkan service-role key, kata laluan, token, sandaran atau senarai guru sebenar ke repositori awam.

Token pelayar disimpan dalam sessionStorage dan tidak dimasukkan dalam sandaran offline. Notis advisor tanpa polisi jadual adalah disengajakan kerana akses terus ditutup. Perlindungan kata laluan bocor masih belum diaktifkan pada tetapan projek; semak ketersediaan pelan dan [panduan Supabase](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Status pemindahan

Pemindahan diselesaikan pada **19 Oktober 2026 (waktu Malaysia)**. Semua API data lama telah dikunci sebelum eksport akhir. Dokumen akhir dibandingkan sepenuhnya dan diimport secara atomik ke Supabase; ruang milik pengguna diaktifkan dan ruang ujian automatik kekal dinyahaktifkan. ID sekolah dan ID Supabase Auth dikekalkan tanpa menukar kata laluan. Sandaran akhir disimpan secara peribadi dan tidak berada dalam repositori ini.

Ujian domain, penyulitan dan penyegerakan offline, pengasingan sekolah, peringkat PYD/PP1/PP2, revision/idempotency, penguncian rekod, aktivasi, pembatalan sesi serta API Supabase telah lulus. Aset awam, manifest, CORS dan binaan pada subfolder GitHub Pages disahkan. Halaman log masuk disemak melalui pelayar. Log masuk dengan kata laluan sebenar pengguna dan pemasangan telefon belum diuji oleh pembangun.
