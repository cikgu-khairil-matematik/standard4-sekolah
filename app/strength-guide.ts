// Paraphrased from the user-supplied Instrumen SKPM Kualiti@Sekolah Edisi 2026, printed pp.2–6.
export const STRENGTH_GUIDE:Record<string,{quality:string;description:string;items:string[]}>= {
 A1:{quality:'Perjawatan guru mencukupi serta sepadan dengan opsyen dan kepakaran untuk memenuhi keperluan pengurusan dan pendidikan sekolah.',description:'Masukkan bilangan guru sebenar, perjawatan ABM dan pecahan yang diminta. Peratus dikira daripada bilangan rujukan yang berkenaan.',items:['Kecukupan guru mengikut perjawatan ABM.','Guru memenuhi keperluan opsyen, termasuk PITO dan penandaan opsyen.','Guru mempunyai kepakaran yang diiktiraf.','Guru berkhidmat melebihi 17 tahun yang memegang jawatan strategik.']},
 A2:{quality:'Guru melaksanakan PdP sebagai pemudah cara yang berkesan untuk mengembangkan potensi dan meningkatkan pencapaian murid secara berterusan.',description:'Isi skor rumusan Standard 4 yang telah disahkan bagi tahun sebelumnya, dalam peratus 0–100. Ini bukan markah satu sesi pencerapan tahun semasa.',items:['Skor rumusan Standard 4 tahun sebelum.','Lampirkan rumusan yang disahkan sebagai evidens.']},
 A3:{quality:'Bilangan AKP dan pekerja swasta mencukupi untuk melaksanakan pengurusan, kebersihan, keselamatan dan keperluan asrama sekolah.',description:'Gunakan jumlah perjawatan ABM bagi AKP dan kelayakan sebenar bagi pekerja swasta. AKP berpengalaman merujuk perkhidmatan tiga tahun dan ke atas.',items:['Kecukupan AKP berbanding ABM.','Bilangan AKP berpengalaman.','Kecukupan pekerja kontrak kebersihan, keselamatan dan bekalan makanan asrama yang berkenaan.']},
 A4:{quality:'Prasarana akademik mencukupi dan berfungsi untuk menyokong pelaksanaan kurikulum serta kecemerlangan akademik.',description:'Senaraikan setiap jenis prasarana, jumlah sedia ada dan jumlah yang berfungsi sepenuhnya. Bilangan berfungsi tidak boleh melebihi sedia ada.',items:['Kemudahan yang menyokong perancangan kurikulum dan pendidikan murid.','Peratus berfungsi = jumlah berfungsi ÷ jumlah sedia ada × 100.']},
 A5:{quality:'Prasarana sukan dan kokurikulum mencukupi serta berfungsi bagi memenuhi keperluan pelaksanaan kokurikulum sekolah.',description:'Pilih jenis kemudahan sukan/kokurikulum dan masukkan bilangan sedia ada serta yang berfungsi sepenuhnya.',items:['Prasarana menyokong perancangan kokurikulum dan pendidikan murid.','Gunakan bilangan kemudahan, bukan bilangan murid atau program.']},
 A6:{quality:'Prasarana HEM mencukupi dan berfungsi bagi memenuhi pengurusan hal ehwal murid serta kesejahteraan murid.',description:'Masukkan bilangan prasarana HEM sedia ada dan yang berfungsi mengikut jenis kemudahan.',items:['Kemudahan menyokong perancangan HEM dan pendidikan murid.','Nyatakan tiada prasarana jika berkenaan dan sertakan evidens.']},
 A7:{quality:'Internet dan peranti berfungsi dimanfaatkan untuk menyokong ekosistem pendidikan digital sekolah.',description:'Peratus pengguna aktif DELIMa merujuk tahun sebelumnya. Bilangan peranti sedia ada dan berfungsi merujuk tahun pelaporan.',items:['Penggunaan DELIMa menyokong proses pembelajaran dan Dasar Pendidikan Digital.','Peranti berfungsi menyokong pembelajaran dan perkongsian maklumat mengikut keperluan sekolah.']},
 A8:{quality:'Prasarana serta sumber manusia asrama mencukupi dan berfungsi untuk memenuhi pengurusan asrama dan kesejahteraan murid.',description:'Jika sekolah mempunyai asrama, isi prasarana serta kecukupan sumber manusia berbanding kelayakan. Jika tiada asrama, tandakan tidak berkenaan dan sertakan penjelasan/evidens.',items:['Prasarana memenuhi keperluan penginapan dan pendidikan murid.','Sumber manusia termasuk warden, penyelia asrama dan pembantu pengurusan murid yang berkenaan.']},
 A9:{quality:'Sokongan ibu bapa, penjaga, komuniti dan swasta membantu memajukan sekolah serta meningkatkan kualiti pendidikan murid.',description:'Isi pelibatan program, khidmat kepakaran dan sumbangan berdasarkan program yang dilaksanakan. Gunakan bilangan yang boleh disokong oleh rekod.',items:['Pelibatan ibu bapa/penjaga dalam program atau aktiviti sekolah.','Khidmat kepakaran/sumbangan ibu bapa menyokong aktiviti yang dirancang.','Sumbangan komuniti dan swasta menyokong keperluan sekolah dan pendidikan murid.']}
};

// Item guidance follows the same supplied instrument and the existing input rules.
// These are entry instructions, not a new scoring rubric or weighting.
const FIELD_GUIDE:Record<string,string>={
 teachers:'Masukkan jumlah guru sedia ada di sekolah. Nilai ini menjadi rujukan bagi pecahan guru mengikut opsyen, kepakaran dan pengalaman.',
 teacherABM:'Masukkan jumlah perjawatan guru yang diperuntukkan dalam waran perjawatan Anggaran Belanja Mengurus (ABM), bukan jumlah guru yang sedang bertugas.',
 optionTeachers:'Masukkan bilangan guru yang memenuhi keperluan opsyen, termasuk opsyen konvensional, PITO dan Penandaan Opsyen Mata Pelajaran Guru. Bilangan ini tidak boleh melebihi jumlah guru sedia ada.',
 expertTeachers:'Masukkan bilangan guru yang mempunyai bidang kepakaran yang diiktiraf. Sediakan rekod pengiktirafan sebagai evidens. Bilangan ini tidak boleh melebihi jumlah guru sedia ada.',
 experiencedTeachers:'Masukkan bilangan guru yang telah berkhidmat melebihi 17 tahun. Nilai ini menjadi rujukan bagi bilangan guru berpengalaman yang memegang jawatan strategik.',
 strategicTeachers:'Daripada kumpulan guru yang berkhidmat melebihi 17 tahun, masukkan bilangan yang memegang jawatan strategik. Bilangan ini tidak boleh melebihi jumlah guru dalam kumpulan tersebut.',
 previousStandard4:'Masukkan skor rumusan Standard 4 yang telah disahkan bagi tahun {tahun_sebelum}, dalam peratus 0–100. Gunakan rumusan tahun tersebut, bukan markah satu sesi pencerapan tahun semasa. Nyatakan sumber dalam catatan dan lampirkan rumusan sebagai evidens.',
 akp:'Masukkan jumlah Anggota Kumpulan Pelaksana (AKP) sedia ada. Pekerja swasta diisi dalam medan berasingan.',
 akpABM:'Masukkan jumlah perjawatan AKP mengikut waran perjawatan ABM. Nilai ini digunakan sebagai rujukan kecukupan AKP.',
 experiencedAKP:'Masukkan bilangan AKP yang mempunyai pengalaman perkhidmatan tiga tahun dan ke atas. Bilangan ini tidak boleh melebihi jumlah AKP sedia ada.',
 privateWorkers:'Masukkan jumlah pekerja swasta sedia ada bagi perkhidmatan yang berkenaan: kontrak kebersihan, kontrak keselamatan dan kontrak bekalan makanan asrama.',
 eligibleWorkers:'Masukkan jumlah pekerja swasta mengikut kelayakan sebenar sekolah bagi perkhidmatan yang berkenaan. Nilai ini menjadi rujukan untuk dibandingkan dengan jumlah pekerja sedia ada.',
 delima:'Masukkan peratus pengguna aktif DELIMa bagi tahun {tahun_sebelum}, berdasarkan laporan penggunaan tahun tersebut. Isi nilai peratus antara 0 hingga 100, bukan bilangan pengguna.',
 hostelStaff:'Masukkan jumlah sumber manusia asrama sedia ada, termasuk warden asrama, penyelia asrama dan pembantu pengurusan murid yang berkenaan.',
 eligibleHostelStaff:'Masukkan jumlah sumber manusia asrama mengikut kelayakan sebenar sekolah. Nilai ini digunakan sebagai rujukan kecukupan sumber manusia asrama.',
 parentSupport:'Masukkan bilangan ibu bapa atau penjaga yang terlibat dalam khidmat kepakaran atau sumbangan berdasarkan rekod program. Isi bilangan, bukan peratus; indikator dikira oleh aplikasi mengikut tapak pengisian.',
 communitySupport:'Masukkan bilangan komuniti atau pihak swasta yang terlibat dalam sumbangan untuk memenuhi keperluan sekolah, berdasarkan rekod program. Isi bilangan, bukan nilai wang atau peratus.',
};
export function strengthFieldGuide(key:string,year:number){return (FIELD_GUIDE[key]??'').replaceAll('{tahun_sebelum}',String(year-1));}
export const INVENTORY_GUIDE={
 existing:'Masukkan bilangan sedia ada bagi jenis prasarana atau peranti yang dipilih. Gunakan bilangan kemudahan/peranti, bukan bilangan pengguna.',
 working:'Masukkan bilangan yang berfungsi sepenuhnya daripada jumlah sedia ada. Bilangan berfungsi tidak boleh melebihi bilangan sedia ada.',
};
export const PROGRAM_GUIDE={
 attendance:'Masukkan bilangan kehadiran ibu bapa atau penjaga bagi program yang dilaksanakan, berdasarkan rekod kehadiran program.',
 parents:'Masukkan bilangan ibu bapa atau penjaga yang menjadi asas pengiraan kehadiran program. Nilai mestilah lebih daripada 0 bagi program yang dilaksanakan.',
};
