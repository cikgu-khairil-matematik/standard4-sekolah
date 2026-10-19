# SK@S — Sistem Kualiti @ Sekolah

Aplikasi pengisian kendiri, penilaian pertama (PP1) dan penilaian kedua (PP2).

**Aplikasi:** https://skas-sekolah.github.io/standard4-sekolah/

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


## Modul Kekuatan Kami A1–A9

Dashboard SK@S menggunakan akaun dan sekolah sedia ada. Buka **Tugas & pengesahan** untuk menetapkan pengisi dan penyemak aktif yang berbeza bagi setiap aspek dan tahun. Pengisi/pentadbir menyimpan draf, kemudian menghantar untuk semakan. Pengesahan hanya oleh penyemak/pentadbir yang bukan pengisi atau penyunting terakhir. Borang yang dihantar/disahkan dikunci. Pulangkan atau buka semula dengan sebab untuk membolehkan pembetulan; pengesahan terdahulu dibatalkan.

A1 meliputi guru; A2 rumusan Standard 4 tahun sebelumnya; A3 AKP/pekerja swasta; A4–A6 prasarana akademik, kokurikulum dan HEM; A7 DELIMa tahun sebelumnya serta peranti; A8 asrama/prasarana/sumber manusia; A9 program dan sokongan PIBKS. Senarai pilihan prasarana diambil daripada tapak Excel 2026 pengguna, dengan entri pendua yang sama digabungkan. Tiada data sekolah sebenar disertakan dalam kod.

A9 mengikut formula tapak: purata kehadiran mengambil peratus positif sahaja dan setiap program dihadkan 100%. Bilangan ibu bapa penyumbang dipetakan kepada 0/25/50/75/100% pada ambang 0, 1–3, 4–6, 7–9, 10+. Komuniti menggunakan ambang 0, 1, 2–3, 4–5, 6+. Nilai sifar, belum diisi dan tidak berkenaan dibezakan. Nisbah penyebut sifar tidak dianggap 0%. Tiada wajaran atau skor keseluruhan sekolah direka. Data A2 dimasukkan daripada rumusan tahun sebelumnya yang telah disahkan; aplikasi tidak memilih atau menggabungkan tiga sesi Standard 4 secara automatik.

Laporan menyediakan semua status atau rekod disahkan sahaja, cetakan/simpanan PDF melalui pelayar, dan CSV yang boleh dibuka dalam Excel. CSV melindungi nilai teks daripada formula injection. Pengguna hanya menerima butiran aspek yang ditugaskan kepadanya; pentadbir sekolah mempunyai akses semua aspek. Pautan evidens menyimpan URL sahaja, bukan memuat naik dokumen.

Untuk offline, buka tahun berkenaan semasa online dan aktifkan salinan peranti dahulu. Cache dan draf A1–A9 disimpan dalam vault disulitkan yang sama. Penyelarasan menyemak semula penugasan dan versi rekod; konflik dikekalkan untuk dimuat turun atau dibuang secara nyata sebelum menggunakan rekod pelayan. Tindakan hantar, sahkan dan penugasan memerlukan internet. Status draf pada peranti dinyatakan dan tidak termasuk laporan disahkan sahaja. Pemulihan sandaran turut memulihkan cache dan draf modul ini.

Endpoint `/api/strength` menggunakan JWT, keahlian sekolah dan sesi yang disemak semula oleh Edge Function. Data ialah sambungan `strength[year][aspect]` dalam dokumen `s4_schools`, menggunakan CAS dan audit atomik yang sama. Tiada perubahan polisi RLS atau kebenaran terus jadual diperlukan. Deploy fungsi dengan `index.ts`, `domain.ts`, `strength-api.ts`, `strength-model.ts`, `scoring.ts`, `rubric.json` dan `deno.json`. Semua fail berada dalam `migration/backend/`. CORS turut membenarkan `https://skas-sekolah.github.io`.

Semakan tempatan:

```sh
npx tsc --noEmit
node scripts/test-strength.mjs
node scripts/test-strength-offline.mjs
node scripts/test-account-deletion.mjs
npm run build
```
