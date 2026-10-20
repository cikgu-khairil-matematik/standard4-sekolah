# SK@S — SKPM Kualiti@Sekolah

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

## Pengurusan Kami — Standard 1, 2 dan 3

Modul Pengurusan Kami menyediakan 42 standard kualiti dan 178 tindakan daripada Instrumen SKPM Kualiti@Sekolah Edisi 2026 yang dibekalkan pengguna (halaman bercetak 11–61). Label tindakan diringkaskan; pautan instrumen dan nombor halaman disediakan supaya pengisi merujuk syarat penskoran sebenar bagi setiap tindakan. Setiap skor ialah nombor bulat 0–4. Kosong berbeza daripada sifar. Jumlah mentah hanya dipaparkan setelah semua tindakan dalam borang lengkap; tiada wajaran atau skor keseluruhan rasmi SKPM diandaikan. Standard 4 arus perdana / pendidikan khas kekal dalam modul PdPc sedia ada.

Buka **Pengurusan Kami → Tugas & pengesahan**, pilih Standard dan tetapkan pengisi serta penyemak aktif yang berbeza bagi setiap standard kualiti. Pengisi/pentadbir menyimpan draf dan menghantar borang lengkap dengan catatan/rujukan atau pautan evidens. Penyemak/pentadbir yang bukan pengisi atau penyunting terakhir boleh mengesahkan. Borang dihantar/disahkan dikunci; pemulangan/pembukaan semula memerlukan sebab dan membatalkan pengesahan terdahulu. Penugasan, penghantaran dan pengesahan memerlukan internet. Pengguna lain hanya melihat status dan penugasan, bukan skor/catatan/evidens.

Buka tahun berkenaan semasa online dan aktifkan mod offline dahulu. Cache dan draf Pengurusan Kami disimpan dalam vault terenkripsi yang sama dan dipulihkan melalui sandaran sedia ada. Penyelarasan menyemak semula akses dan revision. Konflik dikekalkan untuk dimuat turun atau dibuang secara nyata sebelum mengambil rekod pelayan. Laporan mengikut Standard, semua status/disahkan sahaja, CSV untuk Excel dan cetak/PDF melalui pelayar. Pautan evidens menyimpan URL sahaja; tiada muat naik dokumen.

Backend menambah laluan `/api/management` dengan JWT, sesi aplikasi dan keahlian sekolah sedia ada. Data `management[year][standard]` disimpan bersama audit melalui CAS dokumen sekolah. Tiada perubahan skema, polisi RLS, akaun, senarai guru, skor Standard 4 atau Kekuatan Kami diperlukan. Deploy fungsi dengan sembilan fail: `index.ts`, `domain.ts`, `scoring.ts`, `rubric.json`, `deno.json`, `strength-api.ts`, `strength-model.ts`, `management-api.ts`, `management-model.ts`.

Ujian tambahan: `node scripts/test-management.mjs` dan `node scripts/test-management-offline.mjs`. Ujian menggunakan sekolah/akaun rekaan setempat tanpa menulis data percubaan ke pangkalan data sebenar.

## Pemurnian daripada TAPAK SKOR SK@S 2026.xlsx

Fail ini digunakan sebagai rujukan struktur, formula dan pilihan dokumen sahaja. Tiada nama, markah, nombor pengenalan, senarai unit sekolah atau pautan evidens yang diisi dalam fail diimport. Rujukan kriteria dalam borang ialah teks panduan; syarat memilih skor kekal mengikut instrumen asal 2026.

Peratus standard kualiti = jumlah skor tindakan / (bilangan tindakan × 4) × 100. Bilangan tindakan datang daripada katalog instrumen, bukan rujukan sel Excel yang tetap. Standard 1.1.6 dan 1.1.7 mengekalkan empat/lima tindakan instrumen 2026; rujukan salah 3.3.1.1 dan kod psikometrik dalam tapak tidak disalin. Purata dikira tanpa membundarkan nilai perantaraan; paparan dua perpuluhan. Sifar dikira, kosong tidak menjadi sifar.

Tujuh standard agregat menyediakan kaedah **Purata peratus panitia / unit**: 3.1.2.1–3.1.2.4, 3.2.2.1, 3.2.3.1 dan 3.2.4.1. Pengguna menambah nama unit sendiri, skor peratus 0–100 serta rujukan/pautan. Draf boleh belum lengkap; semua baris perlu lengkap dan nama tidak berulang sebelum dihantar. Rekod lama terus menggunakan skor tindakan 0–4. Penukaran kaedah menyimpan data kedua-dua kaedah tetapi hanya kaedah aktif menyumbang kepada pengiraan. Evidens setiap tindakan menambah kategori dokumen, catatan dan URL http(s); catatan/pautan umum sedia ada dikekalkan.

**Rumusan tapak** hanya untuk pentadbir sekolah. Akademik/Kokurikulum/Sahsiah ialah purata tujuh standard kualiti dalam 3.1/3.2/3.3; Sekolah ialah purata setiap satu daripada 21 standard kualiti Standard 1 dan 2. Guru ialah purata jumlah berwajaran penilaian Standard 4 yang lengkap. Lajur aspek Standard 4 menunjukkan sumbangan skor berwajaran, bukan peratus aspek. Tapis tahun, semua peringkat/kendiri/PP1/PP2 dan pengurusan disahkan/PdPc dihantar (lalai) atau termasuk draf. Rekod guru yang tidak lagi dalam senarai tidak dikira. Bilangan liputan ditunjukkan; nilai belum lengkap dilabel sementara. Draf pengurusan pada peranti dikecualikan daripada pilihan disahkan. Rumusan menggunakan salinan pelayan terakhir; draf Standard 4 pada peranti perlu diselaraskan dan rumusan dimuat semula dahulu.

Catatan PGB (jenis sekolah, nama, tarikh, kekuatan, isu/penambahbaikan) kosong pada permulaan, disimpan per tahun dengan semakan revision, audit dan akses pentadbir. Tarikh mesti dalam tahun laporan. Simpan catatan memerlukan internet; salinan rumusan boleh dibaca offline selepas dibuka online dan vault diaktifkan. CSV dan cetak/PDF disediakan. Rumusan mengikut tapak ini bukan instrumen lengkap Standard 5 atau pengiraan skor keseluruhan rasmi SKPM; tiada wajaran tersebut direka. Kod A1–A9 Kekuatan Kami kekal mengikut instrumen 2026, dipadankan berdasarkan makna kerana kod dalam tapak Excel berbeza.

Ujian pengurusan meliputi peratus/max dinamik, purata unit, sifar/kosong, liputan dan draf, keselamatan evidens, rumusan tahun/peringkat/status, redaksi pengguna biasa, catatan PGB/revision/audit dan pemulihan/penyelarasan unit melalui vault terenkripsi.

## Home, PSS, tugasan serentak dan evidens

Butang Home kekal kelihatan pada semua halaman portal dan Standard 4, termasuk ketika borang PdPc dibuka. Perubahan skor Standard 4 turut memaklumkan keadaan belum disimpan kepada portal sebelum keluar. Lampu dan label per input membezakan belum diisi (merah), draf/belum dihantar (kuning), dan dihantar/disahkan (hijau). Angka sifar ialah pengisian yang sah.

Pentadbir menggunakan **Tugas & pengesahan** untuk mengubah banyak tugasan dan menekan **Sahkan semua tugasan** sekali. Pelayan mengesahkan semua revision, akaun sekolah aktif, status borang dan pemisahan penyemak dalam satu salinan dahulu; sebarang ralat membatalkan seluruh kelompok. Pengurusan Kami menyokong beberapa ahli PSS (Pasukan Standard Sekolah) bagi satu standard. Semua PSS aktif yang ditugaskan boleh mengisi draf; penyemak mesti berbeza daripada semua PSS dan penyunting terakhir. Rekod lama dengan seorang pengisi terus berfungsi. PSS Pencapaian Kami boleh didaftarkan mengikut kod/tajuk Standard 5 dan tahun melalui **Tetapan evidens & PSS**; ini tidak menggantikan borang skor penuh Standard 5 yang masih belum tersedia. Pautan rujukan PSS baharu memerlukan akses Google, maka tiada nama atau struktur daripada rujukan itu diandaikan atau diimport.

Borang Kekuatan Kami memaparkan pernyataan kualiti dan deskripsi ringkas daripada salinan instrumen 2026 yang telah dibekalkan. Pengurusan Kami memaparkan rubrik 0–4 bagi 178 tindakan secara terus tanpa pautan buku. Keterangan skor 1–3 diteliti daripada lajur instrumen PDF 2026, termasuk perbezaannya daripada tapak Excel. Butang 0–4 memilih satu skor bagi setiap tindakan. Jenis dokumen boleh dipilih lebih daripada satu; pilihan lain-lain memerlukan catatan. Fail dan pautan boleh berbilang, maksimum 20 bagi setiap ruang.

Penghantaran Kekuatan Kami memerlukan sekurang-kurangnya satu URL evidens yang sah. Pengurusan Kami memerlukan URL evidens setiap tindakan/unit atau evidens umum yang meliputi semua tindakan. Catatan dan kategori dokumen sahaja tidak mencukupi. Skor tanpa evidens masih boleh disimpan sebagai draf. Semakan ini dilaksanakan dalam pelayan untuk penghantaran serta pengesahan; rekod lama tidak diubah secara automatik. Penyemak boleh meminta pembetulan jika rekod lama yang dihantar belum memenuhi syarat baharu.

### Sambungan Google Drive

Kod integrasi telah disediakan; sambungan sebenar **tidak aktif sehingga pentadbir melengkapkan konfigurasi Google**. Pautan folder sahaja tidak memberikan hak muat naik. Pemilik aplikasi perlu menyediakan OAuth Client ID web, Google Picker API key yang dihadkan kepada origin `https://skas-sekolah.github.io` dan Google Picker/Drive APIs, serta nombor projek Google Cloud. Aktifkan kedua-dua API dan konfigurasi consent yang sesuai dengan pengguna sekolah. Jangan masukkan client secret, kata laluan atau service-account private key ke borang, repositori atau chat. OAuth Client ID, project number dan API key pelayar yang dihadkan ialah konfigurasi klien, bukannya client secret.

Pengguna memilih akaun Google dan folder sekolah melalui Google Picker menggunakan skop sempit `drive.file`. Token Google hanya berada dalam memori operasi semasa, tidak dimasukkan ke storan pelayar, dokumen sekolah, audit atau vault. Pengguna perlu mempunyai hak menambah fail dalam folder sekolah. Fail dihantar terus dari pelayar ke Google Drive, bukan sebagai base64 dalam dokumen sekolah. Aplikasi tidak menukar perkongsian fail kepada awam. Kod API tidak menerima token Google atau kandungan fail.

Susunan folder: folder induk sekolah → Evidens Kekuatan Kami / Evidens Pengurusan Kami / Evidens Pencapaian Kami → tahun → aspek/standard. Pelayan memperuntukkan nombor fail melalui CAS: `A2-001.pdf`, `1.1.1.A(1).jpg`, dan seterusnya mengikut sambungan fail asal. Kaunter tidak digunakan semula selepas kegagalan, maka nombor mungkin melangkau. Pemetaan ID folder disimpan secara atomik menggunakan ID yang dijana Google supaya dua muat naik serentak menggunakan folder yang sama. Struktur dan induk folder diperiksa sebelum muat naik. Fail maksimum 20 MB; PDF, imej lazim, dokumen pejabat, CSV dan teks disokong. Membuang pautan dalam draf tidak memadam fail Drive. Simpan draf selepas menambah fail; kegagalan fail berikutnya tidak membuang pautan fail terdahulu yang berjaya.

Endpoint `/api/resources` menggunakan JWT, sesi aplikasi, keahlian sekolah, tahun dan penugasan semasa. Tetapan/pendaftaran PSS dan penugasan kelompok hanya pentadbir; muat naik hanya pengisi/PSS yang masih dibenarkan mengedit. Tiada perubahan skema atau polisi RLS. Deploy dengan tambahan `resources-api.ts` dan `resources-model.ts` bersama sembilan fail backend sedia ada. Operasi tetapan, penugasan dan muat naik memerlukan internet. Pautan evidens dalam draf kekal menggunakan penyulitan offline sedia ada; kandungan fail dan token OAuth tidak dimasukkan dalam sandaran.

Ujian tambahan: `node scripts/test-resources.mjs` dan `node scripts/test-drive-evidence.mjs`. Ujian Drive menggunakan pengangkutan simulasi, bukannya akaun Google atau fail sebenar. Konfigurasi OAuth/Picker serta muat naik sebenar perlu disahkan selepas pemilik menyediakan konfigurasi Google dan folder sekolah. Dua pautan rujukan baharu yang meminta sign-in tidak dibaca sebagai sumber baharu.
