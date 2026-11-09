import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

export const FALLBACK_BLOGS = [
  {
    id: 1,
    slug: 'panduan-praktis-pph-21-skema-ter-pp-58-2023-pmk-168-2023',
    title: 'Panduan Praktis Perhitungan PPh 21 Skema TER PP 58/2023 & PMK 168/2023',
    excerpt:
      'Pahami cara menghitung PPh Pasal 21 pegawai tetap masa pajak Januari s.d. November menggunakan Tabel Tarif Efektif Rata-rata (TER) dan rekonsiliasi masa Desember.',
    category: 'PPh 21 & Pemotongan',
    date: '22 Okt 2026',
    readTime: '7 Menit Baca',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Kertas Kerja Excel Simulator PPh 21 TER (PP 58/2023).xlsx',
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['PPh 21', 'Skema TER', 'PP 58/2023', 'PMK 168/2023', 'Payroll Tax'],
    status: 'PUBLISHED',
    is_featured: true,
    views_count: 842,
    content:
      "Pemerintah resmi menyederhanakan mekanisme pemotongan Pajak Penghasilan Pasal 21 (PPh 21) melalui penerbitan Peraturan Pemerintah Nomor 58 Tahun 2023 (PP 58/2023) dan aturan pelaksanaannya dalam PMK Nomor 168 Tahun 2023.\n\n### 1. Apa Itu Tarif Efektif Rata-Rata (TER)?\nSkema TER dirancang untuk mempermudah pemberi kerja dalam melakukan pemotongan PPh 21 pada masa pajak Januari hingga November. Sebelumnya, praktisi payroll harus menyetahunkan penghasilan bruto dan mengurangkan biaya jabatan serta PTKP setiap bulan. Kini, cukup mengalikan **Penghasilan Bruto Bulanan** dengan tarif tunggal pada lapisan **TER Kategori A, B, atau C** sesuai status PTKP pegawai.\n\n> Catatan Penting: Penerapan Tarif Efektif Rata-rata (TER) hanya mengubah cara pemotongan bulanan masa Januari s.d. November, namun total beban pajak setahun penuh tetap dihitung menggunakan tarif Pasal 17 UU HPP pada masa Desember.\n\n### 2. Pengelompokan Kategori TER Bulanan\n- **Kategori TER A**: Berlaku untuk status PTKP TK/0 (Rp54 juta), TK/1, dan K/0 (Rp58,5 juta).\n- **Kategori TER B**: Berlaku untuk status PTKP TK/2, TK/3, K/1, dan K/2 (Rp63 juta s.d. Rp67,5 juta).\n- **Kategori TER C**: Berlaku untuk status PTKP K/3 (Rp72 juta).\n\n### 3. Mekanisme Perhitungan Masa Pajak Terakhir (Desember)\nPada masa pajak Desember (atau masa pajak terakhir bagi pegawai yang berhenti bekerja di tengah tahun), pemberi kerja tetap wajib menghitung kembali PPh 21 terutang setahun penuh menggunakan **Tarif Pasal 17 ayat (1) huruf a UU HPP**.\n\n### 4. Rekomendasi Praktis bagi Tim HR & Tax\n1. Pastikan pemutakhiran data status tanggungan keluarga (PTKP) seluruh karyawan dilakukan pada awal tahun takwim.\n2. Perhatikan komponen natura dan/atau kenikmatan (PMK 66/2023) yang melampaui batasan tertentu karena wajib digabungkan ke dalam penghasilan bruto objek TER bulan berjalan.\n3. Siapkan simulasi proyeksi bonus/THR agar karyawan memahami dampak lonjakan lapisan TER pada bulan diterimanya penghasilan tidak teratur.",
  },
  {
    id: 2,
    slug: 'kesiapan-wajib-pajak-badan-menghadapi-implementasi-coretax-system-djp',
    title: 'Kesiapan Wajib Pajak Badan Menghadapi Implementasi Coretax System DJP',
    excerpt:
      'Perubahan mekanisme Faktur Pajak Baru, integrasi Buku Besar Wajib Pajak (Taxpayer Ledger), manajemen Role Access (Impersonating), dan automasi SPT Unifikasi.',
    category: 'Coretax DJP',
    date: '25 Okt 2026',
    readTime: '8 Menit Baca',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Checklist Migrasi & Role Access Coretax Wajib Pajak Badan.pdf',
    author_name: 'dr. Hendra Wijaya, M.Si., BKP',
    author_role: 'Senior Tax Specialist & Instruktur Coretax',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    tags: ['Coretax DJP', 'PSIA', 'Taxpayer Ledger', 'e-Faktur', 'Wajib Pajak Badan'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 689,
    content:
      "Pembaruan Sistem Inti Administrasi Perpajakan (PSIAP) atau **Coretax Administration System** membawa transformasi digital terbesar dalam sejarah Direktorat Jenderal Pajak. Seluruh layanan yang sebelumnya terpisah kini disatukan dalam satu portal terintegrasi.\n\n### 1. Konsep Representasi & Impersonating (Wakil/Kuasa)\nDalam arsitektur Coretax, akun **Wajib Pajak Badan** tidak lagi diakses menggunakan satu kata sandi bersama. Setiap Pengurus (Direksi), Staf Pajak Internal, maupun Konsultan Pajak Terdaftar wajib login menggunakan **NIK / NPWP 16 Digit pribadi** masing-masing, lalu menggunakan fitur **Impersonating** sesuai *Role Access* yang didelegasikan.\n\n> Prinsip Keamanan Coretax: Setiap tanda tangan elektronik pada Faktur Pajak maupun Bukti Potong dilakukan oleh orang pribadi yang diberi wewenang sah melalui mekanisme Role Access dan Sertifikat Elektronik Pribadi.\n\n### 2. Buku Besar Wajib Pajak (Taxpayer Ledger) & Deposit Pajak\nCoretax memperkenalkan fitur **Taxpayer Ledger** yang mencatat seluruh hak dan kewajiban perpajakan secara *real-time* layaknya rekening koran perbankan.\n\n### 3. Otomasi Prepopulated e-Faktur & Bukti Potong\nSeluruh Faktur Pajak Masukan dan Bukti Pemotongan PPh yang diterbitkan oleh lawan transaksi akan langsung masuk secara *prepopulated* ke draf SPT Masa PPN dan SPT Tahunan perusahaan.",
  },
  {
    id: 3,
    slug: 'bedah-regulasi-pmk-172-2023-dokumentasi-transfer-pricing-tp-doc',
    title: 'Bedah Regulasi PMK 172/2023: Dokumentasi Transfer Pricing (Local File & Master File)',
    excerpt:
      "Penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU / Arm's Length Principle) bagi grup usaha, transaksi afiliasi, dan tahapan analisis pendahuluan jasa intragrup.",
    category: 'Pajak Internasional',
    date: '28 Okt 2026',
    readTime: '10 Menit Baca',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Template Ikhtisar Dokumen Induk & Dokumen Lokal PMK 172/2023.docx',
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['Transfer Pricing', 'PMK 172/2023', 'TP Doc', 'ALP', 'Brevet C'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 512,
    content:
      "Terbitnya **PMK Nomor 172 Tahun 2023** mencabut dan menyatukan tiga regulasi penting sekaligus (PMK 213/2016 tentang TP Doc, PMK 49/2019 tentang MAP, dan PMK 22/2020 tentang APA).\n\n### 1. Perluasan Definisi Hubungan Istimewa\nSelain kepemilikan penyertaan modal langsung atau tidak langsung paling rendah **25%** dan penguasaan manajemen, PMK 172/2023 juga mengatur bahwa transaksi antara pihak independen pun wajib menerapkan PKKU apabila terdapat pihak afiliasi yang menetapkan lawan transaksi dan harga transaksi.\n\n### 2. Kriteria Wajib Menyusun TP Doc (Master File & Local File)\n- Nilai peredaran bruto lebih dari **Rp50 Miliar**;\n- Nilai transaksi afiliasi barang berwujud lebih dari **Rp20 Miliar**;\n- Nilai transaksi afiliasi jasa, bunga, royalti, atau transaksi lainnya lebih dari **Rp5 Miliar**.\n\n### 3. Batas Waktu Ketersediaan & Permintaan DJP\nDokumen Induk (*Master File*) dan Dokumen Lokal (*Local File*) wajib tersedia paling lama **4 (empat) bulan** setelah akhir Tahun Pajak dan wajib disampaikan paling lama **1 (satu) bulan** sejak diminta oleh Direktur Jenderal Pajak.",
  },
  {
    id: 4,
    slug: 'pajak-natura-dan-kenikmatan-pmk-66-2023-daftar-pengecualian-dan-teknis-pemotongan',
    title: 'Pajak Natura dan Kenikmatan PMK 66/2023: Daftar Pengecualian & Teknis Pemotongan',
    excerpt:
      'Kupas tuntas perubahan prinsip deductible-taxable atas pemberian fasilitas kantor, batasan nilai bingkisan hari raya, kupon makan, serta fasilitas kendaraan dinas.',
    category: 'PPh 21 & Pemotongan',
    date: '30 Okt 2026',
    readTime: '9 Menit Baca',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Matriks Batasan Pengecualian Objek Pajak Natura PMK 66/2023.xlsx',
    author_name: 'dr. Hendra Wijaya, M.Si., BKP',
    author_role: 'Senior Tax Specialist & Instruktur Coretax',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    tags: ['Pajak Natura', 'PMK 66/2023', 'Fasilitas Kantor', 'Biaya Fiskal', 'UU HPP'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 618,
    content:
      "Melalui UU HPP, PP 55/2022, dan **PMK Nomor 66 Tahun 2023**, pemerintah menerapkan prinsip simetri fiskal (*deductible bagi pemberi kerja, taxable bagi penerima*) atas penggantian atau imbalan dalam bentuk **natura dan/atau kenikmatan**.\n\n### 1. Biaya Natura yang Dapat Dikurangkan secara Fiskal (Deductible Expense)\nSepanjang biaya berkaitan dengan kegiatan **Mendapatkan, Menagih, dan Memelihara (3M) penghasilan**, maka biaya tersebut kini dapat dibebankan sebagai pengurang penghasilan bruto PPh Badan.\n\n### 2. Lima Kelompok Natura yang Dikecualikan dari Objek PPh\n- **Makanan dan Minuman bagi Seluruh Pegawai**: Kupon makan bagi pegawai dinas luar dengan batasan maksimal **Rp2.000.000 per bulan**.\n- **Bingkisan Hari Raya Keagamaan**: Bebas pajak sepenuhnya untuk Idulfitri, Natal, Nyepi, Waisak, dan Tahun Baru Imlek; bingkisan selain hari raya bebas pajak hingga akumulasi **Rp3.000.000 per tahun**.\n- **Fasilitas Kendaraan Dinas**: Bebas pajak apabila pegawai tidak memiliki penyertaan modal dan rata-rata penghasilan bruto **tidak melebihi Rp100.000.000 per bulan**.",
  },
  {
    id: 5,
    slug: 'strategi-menghadapi-sp2dk-dan-pemeriksaan-pajak-pasca-integrasi-data-nik-npwp',
    title: 'Strategi Menghadapi SP2DK & Pemeriksaan Pajak Pasca Integrasi Data NIK-NPWP',
    excerpt:
      'Langkah mitigasi risiko kepatuhan atas Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) berdasarkan SE-05/PJ/2022 serta teknik ekualisasi SPT.',
    category: 'KUP & Sengketa Pajak',
    date: '02 Nov 2026',
    readTime: '9 Menit Baca',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Format Standar Surat Tanggapan & Kertas Kerja Ekualisasi SP2DK.docx',
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['SP2DK', 'Pemeriksaan Pajak', 'SE-05/PJ/2022', 'Ekualisasi Pajak', 'KUP'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 740,
    content:
      "Dengan berlakunya pemadanan **NIK sebagai NPWP** serta pertukaran informasi keuangan otomatis, algoritma *Compliance Risk Management* (CRM) DJP mampu mendeteksi ketidaksesuaian antara profil harta, mutasi rekening, dan pelaporan SPT secara jauh lebih presisi.\n\n### 1. Memahami Karakteristik SP2DK (SE-05/PJ/2022)\n**SP2DK** bukanlah Surat Perintah Pemeriksaan, melainkan instrumen pengawasan kepatuhan material oleh Account Representative (AR) di KPP. Wajib Pajak diberikan waktu **paling lama 14 hari kalender** untuk menyampaikan penjelasan tertulis.\n\n> Kunci Utama Merespons SP2DK: Jangan pernah mengabaikan SP2DK. Tanggapan yang terstruktur, didukung bukti kontrak, rekening koran yang telah direkonsiliasi, serta kertas kerja ekualisasi dapat menghentikan eskalasi SP2DK ke tahap Pemeriksaan Khusus.\n\n### 2. Tiga Titik Rawan Pemicu SP2DK Korporasi\n- Selisih Ekualisasi Peredaran Usaha PPh Badan vs DPP PPN Keluaran;\n- Selisih Beban Gaji/Jasa pada Laporan Laba Rugi vs Objek PPh Pasal 21/23/26/4(2);\n- Mutasi Kredit Rekening Bank Lebih Besar dari Omzet.",
  },
  {
    id: 6,
    slug: 'teknik-rekonsiliasi-fiskal-pph-badan-dan-penyusunan-kertas-kerja-spt-1771',
    title: 'Teknik Rekonsiliasi Fiskal PPh Badan & Penyusunan Kertas Kerja SPT Tahunan 1771',
    excerpt:
      'Panduan sistematis mengidentifikasi koreksi fiskal positif dan negatif, aturan penyusutan bangunan permanen UU HPP, serta batasan biaya promosi dan entertainment.',
    category: 'PPh Badan & Rekonsiliasi',
    date: '04 Nov 2026',
    readTime: '11 Menit Baca',
    image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Kertas Kerja Rekonsiliasi Fiskal & Lampiran SPT 1771.xlsx',
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['PPh Badan', 'Rekonsiliasi Fiskal', 'SPT 1771', 'Koreksi Fiskal'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 605,
    content:
      "Penyusunan SPT Tahunan PPh Wajib Pajak Badan dimulai dari penyusunan **Kertas Kerja Rekonsiliasi Fiskal** yang menyesuaikan Laba/Rugi Komersial (SAK) menjadi Penghasilan Neto Fiskal sesuai ketentuan UU PPh dan UU HPP.\n\n### 1. Membedakan Koreksi Fiskal Beda Tetap dan Beda Waktu\n- **Beda Tetap (Permanent Difference)**: Penghasilan atau biaya yang diakui secara komersial namun secara permanen tidak diakui secara fiskal (atau dikenakan PPh Final).\n- **Beda Waktu (Temporary Difference)**: Perbedaan periode pengakuan antara akuntansi dan pajak yang melahirkan pajak tangguhan (*deferred tax*).\n\n### 2. Syarat Mutlak Biaya Promosi & Entertainment agar Deductible\n- **Biaya Entertainment (SE-27/PJ.22/1986)**: Wajib dilampiri **Daftar Nominatif Entertainment**.\n- **Biaya Promosi (PMK 02/PMK.03/2010)**: Wajib dibuatkan **Daftar Nominatif Biaya Promosi** dan dilampirkan saat pelaporan SPT Tahunan PPh Badan.",
  },
  {
    id: 7,
    slug: 'kupas-tuntas-ppn-12-persen-dan-manajemen-kredit-pajak-masukan-di-era-coretax',
    title: 'Kupas Tuntas PPN & Manajemen Kredit Pajak Masukan di Era Coretax DJP',
    excerpt:
      'Strategi mengamankan hak pengkreditan Pajak Masukan, ketentuan Faktur Pajak tidak lengkap, fasilitas PPN Dibebaskan vs Tidak Dipungut, dan mitigasi sanksi Pasal 14 ayat (4) KUP.',
    category: 'PPN & e-Faktur',
    date: '06 Nov 2026',
    readTime: '8 Menit Baca',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    attachment_url: null,
    attachment_name: null,
    author_name: 'dr. Hendra Wijaya, M.Si., BKP',
    author_role: 'Senior Tax Specialist & Instruktur Coretax',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    tags: ['PPN', 'Faktur Pajak', 'Pajak Masukan', 'PKP', 'UU HPP'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 480,
    content:
      "Pajak Pertambahan Nilai (PPN) merupakan jenis pajak tidak langsung yang sangat menitikberatkan pada ketertiban administrasi **Faktur Pajak**.\n\n### 1. Tiga Saat Pembuatan Faktur Pajak yang Wajib Dipatuhi\n1. Saat penyerahan Barang Kena Pajak (BKP) dan/atau Jasa Kena Pajak (JKP);\n2. Saat penerimaan pembayaran dalam hal penerimaan pembayaran terjadi **sebelum** penyerahan BKP/JKP;\n3. Saat penerimaan pembayaran termin dalam hal penyerahan sebagian tahap pekerjaan.\n\n### 2. Perbedaan Fundamental Kode Faktur 07 (Tidak Dipungut) vs 08 (Dibebaskan)\n- **Kode 07 (PPN Tidak Dipungut)**: Pajak Masukan terkait penyerahan ini **tetap dapat dikreditkan**.\n- **Kode 08 (PPN Dibebaskan)**: Pajak Masukan terkait penyerahan ini **tidak dapat dikreditkan** dan harus dibebankan sebagai biaya.",
  },
  {
    id: 8,
    slug: 'panduan-rasio-utang-terhadap-modal-der-4-banding-1-dan-koreksi-biaya-bunga-pmk-169',
    title: 'Panduan Rasio Utang terhadap Modal (DER 4:1) & Koreksi Biaya Bunga PMK 169/2015',
    excerpt:
      'Cara menghitung rata-rata saldo utang dan modal bulanan, pengecualian sektor usaha tertentu, serta kewajiban pelaporan lampiran DER dan utang swasta luar negeri.',
    category: 'PPh Badan & Rekonsiliasi',
    date: '07 Nov 2026',
    readTime: '7 Menit Baca',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Template Perhitungan Rata-Rata DER 4:1 (PMK 169/2015).xlsx',
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['DER 4:1', 'PMK 169/2015', 'Biaya Bunga', 'Thin Capitalization'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 390,
    content:
      "Pasal 18 ayat (1) UU PPh serta **PMK Nomor 169/PMK.010/2015** mengatur batasan perbandingan antara utang dan modal (*Debt to Equity Ratio* / DER) paling tinggi sebesar **4 : 1**.\n\n### 1. Komponen Utang dan Modal dalam Perhitungan DER\n- **Saldo Utang**: Meliputi saldo rata-rata pada tiap akhir bulan dari utang jangka panjang maupun pendek termasuk utang dagang yang dibebani bunga.\n- **Saldo Modal**: Meliputi rata-rata saldo tiap akhir bulan dari ekuitas ditambah pinjaman tanpa bunga dari pihak afiliasi.\n\n### 2. Konsekuensi Apabila DER Melampaui 4:1\nBiaya pinjaman yang dapat dikurangkan secara fiskal hanyalah sebesar bagian biaya pinjaman yang sebanding dengan rasio 4:1 tersebut.",
  },
  {
    id: 9,
    slug: 'penerapan-pph-final-umkm-0-5-persen-pp-55-2022-dan-batas-omzet-bebas-pajak-500-juta',
    title: 'Penerapan PPh Final UMKM 0,5% PP 55/2022 & Batas Omzet Bebas Pajak Rp500 Juta',
    excerpt:
      'Ketentuan jangka waktu penggunaan tarif final 0,5% bagi PT, CV, dan Orang Pribadi, mekanisme Surat Keterangan PP 55, serta simulasi bagian peredaran bruto tidak kena pajak.',
    category: 'Regulasi UU HPP',
    date: '08 Nov 2026',
    readTime: '6 Menit Baca',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80',
    attachment_url: null,
    attachment_name: null,
    author_name: 'dr. Hendra Wijaya, M.Si., BKP',
    author_role: 'Senior Tax Specialist & Instruktur Coretax',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    tags: ['PPh Final UMKM', 'PP 55/2022', 'Omzet 500 Juta', 'UU HPP'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 525,
    content:
      "Melalui **Peraturan Pemerintah Nomor 55 Tahun 2022**, pemerintah memberikan insentif bagi Wajib Pajak yang memiliki peredaran bruto tidak melebihi **Rp4,8 Miliar** dalam satu Tahun Pajak.\n\n### 1. Fasilitas Bebas PPh atas Omzet Rp500 Juta Pertama bagi Orang Pribadi\nKhusus bagi **Wajib Pajak Orang Pribadi** pengusaha UMKM yang menggunakan skema PPh Final 0,5%, bagian peredaran bruto dari usaha sampai dengan **Rp500.000.000 dalam 1 tahun pajak tidak dikenai Pajak Penghasilan**.\n\n> Perhatian: Fasilitas bebas pajak atas omzet Rp500 juta pertama ini hanya berlaku bagi Wajib Pajak Orang Pribadi dan tidak berlaku bagi Wajib Pajak Badan (PT, CV, Firma, Koperasi, atau BUMDes).\n\n### 2. Batas Jangka Waktu Penggunaan Tarif PPh Final 0,5%\n- **7 Tahun Pajak** bagi Wajib Pajak Orang Pribadi;\n- **4 Tahun Pajak** bagi CV, Firma, Koperasi, atau BUMDes;\n- **3 Tahun Pajak** bagi Perseroan Terbatas (PT).",
  },
];

const blogService = {
  /**
   * Public: Get published blog articles
   */
  async getBlogs(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.BLOGS, { params });
      return response.data && response.data.length > 0 ? response.data : FALLBACK_BLOGS;
    } catch {
      return FALLBACK_BLOGS;
    }
  },

  /**
   * Public: Get single blog post detail by slug or id
   */
  async getBlogDetail(slugOrId) {
    try {
      const response = await apiClient.get(ENDPOINTS.BLOG_DETAIL(slugOrId));
      return response.data;
    } catch {
      const found =
        FALLBACK_BLOGS.find((b) => b.slug === slugOrId || String(b.id) === String(slugOrId)) ||
        FALLBACK_BLOGS[0];
      return {
        ...found,
        related_posts: FALLBACK_BLOGS.filter((b) => b.id !== found.id).slice(0, 3),
      };
    }
  },

  /**
   * Public: Fetch a fresh math CAPTCHA challenge for the blog question form
   */
  async getCaptchaChallenge() {
    try {
      const response = await apiClient.get(ENDPOINTS.BLOG_CAPTCHA);
      return response.data;
    } catch {
      const a = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 7) + 2;
      return {
        captcha_token: `local-${a + b}`,
        captcha_question: `Berapa hasil dari ${a} + ${b} ?`,
        _expected: String(a + b),
      };
    }
  },

  /**
   * Public: Submit question on blog article to company_profile email via Queue
   */
  async askBlogQuestion(slugOrId, payload) {
    const response = await apiClient.post(ENDPOINTS.BLOG_ASK(slugOrId), payload);
    return response;
  },

  /**
   * Admin Backoffice: Get all blog posts (including drafts)
   */
  async getAdminBlogs() {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN_BLOGS);
      return response.data || FALLBACK_BLOGS;
    } catch {
      return FALLBACK_BLOGS;
    }
  },

  /**
   * Admin Backoffice: Create / Upload new blog post (supports FormData for file uploads)
   */
  async createBlog(payload) {
    const isFormData = payload instanceof FormData;
    const response = await apiClient.post(
      ENDPOINTS.ADMIN_BLOGS,
      payload,
      isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    );
    return response.data;
  },

  /**
   * Admin Backoffice: Update existing blog post
   */
  async updateBlog(id, payload) {
    const isFormData = payload instanceof FormData;
    if (isFormData) {
      payload.append('_method', 'PUT');
      const response = await apiClient.post(ENDPOINTS.ADMIN_BLOG_DETAIL(id), payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(ENDPOINTS.ADMIN_BLOG_DETAIL(id), payload);
    return response.data;
  },

  /**
   * Admin Backoffice: Delete blog post
   */
  async deleteBlog(id) {
    const response = await apiClient.delete(ENDPOINTS.ADMIN_BLOG_DETAIL(id));
    return response.data;
  },
};

export default blogService;
