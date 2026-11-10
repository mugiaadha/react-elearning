# Comprehensive End-to-End Architecture Audit & Product Roadmap — NAC Tax Center LMS

> **Role Perspektif:** Senior Full-Stack Engineer, System Architect, & Product Manager  
> **Lingkup Audit:** End-to-End Codebase (`Frontend React 19 + Vite`, `Backend Laravel 12 API`, `Database Schema`, `DevOps & Docker CI/CD`)  
> **Tanggal Audit:** 10 November 2026  
> **Status Pelaksanaan:** Diperbarui secara berkala dengan tanda `[DONE]` (Selesai) dan `[TODO]` (Dalam Antrean)

---

## 1. Ringkasan Pemahaman Project

### A. Deskripsi Produk & Target Pengguna
**NAC Tax Center E-Learning & Certification Platform** adalah sistem manajemen pembelajaran (*Learning Management System* / LMS), portal pendaftaran *batch* Brevet Pajak (A/B, C, dan *Corporate In-House*), sekaligus portal publikasi artikel regulasi perpajakan (*Tax & Fiscal Brief*) dan sistem verifikasi sertifikat kompetensi digital.

Berdasarkan struktur kode dan alur bisnis yang terimplementasi, aplikasi ini melayani **4 segmen pengguna utama**:
1. **Calon Peserta / Pengunjung Publik (*Prospective Students & Tax Practitioners*):**
   - Membaca katalog program Brevet & jadwal gelombang (*batch*), memfilter kalender kelas, membaca artikel regulasi pajak terbaru, melakukan *pre-registration* sekaligus *checkout* pembayaran di satu alur (*Unified Onboarding*), mengajukan pertanyaan/konsultasi, serta memverifikasi keaslian sertifikat lulusan melalui *Public Certificate Registry* (`/verify`).
2. **Peserta Pelatihan (*Student*):**
   - Mengakses *Student Dashboard*, memantau jadwal sesi kelas & *link* Zoom interaktif, menonton video rekaman (*VOD*) dan mengunduh modul PDF di *Learning Room*, mengunduh soal dan mengunggah lembar jawaban ujian (*Exam Submission*), memantau riwayat tagihan/invoice, serta mengunduh sertifikat digital ber-QR Code setelah seluruh syarat akademik & finansial terpenuhi.
3. **Instruktur / Pengajar (*Teacher*):**
   - Mengelola kelas yang diampu, menyusun kurikulum (*syllabus* & modul belajar), mengunggah soal ujian, memeriksa lembar jawaban peserta, memberikan nilai (*score* 0–100) dan catatan evaluasi, atau meminta peserta melakukan perbaikan (*Request Revision*).
4. **Administrator Akademik & Keuangan (*Admin Backoffice*):**
   - Memantau metrik pendapatan dan konversi pembayaran pada *Executive Dashboard*, mengelola kalender akademik & kuota gelombang (*Batch Management*), memverifikasi pembayaran transfer manual atau memantau *settlement* Midtrans, menerbitkan dan mencabut sertifikat kelulusan, mengelola artikel *Blog/Tax Brief* melalui CMS, serta mengatur identitas resmi institusi (*Company Profile*).

---

### B. Arsitektur & Tech Stack Utama

| Layer | Teknologi & Konfigurasi | Detail Implementasi di Codebase |
| :--- | :--- | :--- |
| **Frontend SPA** | React 19, Vite 8, React Router v7, Tailwind CSS v3.4, Lucide React | Arsitektur modular dengan *code-splitting* (`React.lazy` + `Suspense`), *centralized HTTP wrapper* di [`src/services/api/apiClient.js`](file:///c:/workspace/belajar-react/elearning-react/src/services/api/apiClient.js). Mendukung tema *Dark/Light* (`slate`/`amber`) dan generasi PDF sertifikat langsung di browser via `jspdf` + `html2canvas` + `qrcode`. |
| **Backend API** | PHP 8.4, Laravel 12, Laravel Sanctum | RESTful API stateless di [`backend/routes/api.php`](file:///c:/workspace/belajar-react/elearning-react/backend/routes/api.php) dengan middleware RBAC server-side `EnsureUserHasRole` (`role:admin`, `role:teacher`, `role`). |
| **Database & Storage** | MariaDB 11.4 (Prod) / SQLite (Local Dev), Local Public Disk Symlink | 18+ tabel relasional mencakup `users`, `brevets`, `batches`, `enrollments`, `payments`, `exams`, `exam_submissions`, `certificates`, `blogs`, `contacts`, `company_profiles`, dan `jobs`. |
| **Integrasi Pihak Ketiga & Background Jobs** | Midtrans Snap API, Database Queue Worker, Laravel Mail (SMTP) | Pembuatan *Snap Token* otomatis & *Webhook Handler* (`POST /api/payments/webhook`), serta pengiriman email asinkron melalui [`MailService.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Services/MailService.php) via `SendTemplateEmailJob`. |
| **Infrastruktur & CI/CD** | Docker Compose (4 Kontainer), Nginx Reverse Proxy, GitHub Actions | Orkestrasi `frontend` (Nginx SPA + Reverse Proxy `/api` & `/storage`), `backend` (PHP-FPM 8.4), `queue` (`php artisan queue:work`), dan `db` (MariaDB 11.4). Deployment otomatis via [`.github/workflows/deploy.yml`](file:///c:/workspace/belajar-react/elearning-react/.github/workflows/deploy.yml). |

---

## 2. Audit Kesenjangan & Status Penyelesaian Saat Ini

| Item Kesenjangan / Fitur | Tingkat Urgensi | Status | Detail Implementasi di Codebase |
| :--- | :--- | :---: | :--- |
| **Proteksi RBAC & Sanctum Middleware di API Backend** | CRITICAL | **[DONE]** | Dibuat `EnsureUserHasRole.php`, didaftarkan alias `'role'` di [`backend/bootstrap/app.php`](file:///c:/workspace/belajar-react/elearning-react/backend/bootstrap/app.php), dan diterapkan di seluruh grup route admin, teacher, dan user pada [`backend/routes/api.php`](file:///c:/workspace/belajar-react/elearning-react/backend/routes/api.php). |
| **Kompatibilitas Dialek SQL MariaDB vs SQLite** | HIGH | **[DONE]** | Pada [`AdminController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/AdminController.php), query tren bulanan kini menggunakan pemeriksaan driver DB otomatis (`DATE_FORMAT` untuk MariaDB/MySQL dan `strftime` untuk SQLite). |
| **Optimasi Query N+1 di Popularitas Kursus** | MEDIUM | **[DONE]** | Pada [`AdminController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/AdminController.php), query loop diubah menjadi `Brevet::withCount(['enrollments', 'enrollments as active_enrollments_count'])`. |
| **Nama Penandatangan Sertifikat Dinamis** | MEDIUM | **[DONE]** | Pada [`CertificateController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/CertificateController.php), nama direktur ditarik langsung dari `CompanyProfile::getCached()->director_name`. |
| **Notifikasi Email Hasil Ujian & Revisi Guru** | MEDIUM | **[DONE]** | Dibuat fungsi `sendExamReviewEmail()` di [`MailService.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Services/MailService.php) dan dipanggil otomatis di `TeacherController::reviewSubmission` serta `gradeSubmission`. |
| **Alur Mandiri Reset Password via OTP** | HIGH | **[DONE]** | Dibuat endpoint `/auth/forgot-password` dan `/auth/reset-password` di [`AuthController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/AuthController.php), email OTP di [`MailService.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Services/MailService.php), serta modal interaktif 2-step OTP di [`LoginPage.jsx`](file:///c:/workspace/belajar-react/elearning-react/src/pages/public/LoginPage.jsx). |
| **Admin Inbox Konsultasi (`/admin/contacts`)** | MEDIUM | **[DONE]** | Migrasi database `status`, `source`, `replied_at` pada tabel `contacts`, controller `ContactController.php` (index, updateStatus, destroy), halaman baru `AdminContactsPage.jsx`, serta link sidebar di `BackofficeSidebar.jsx`. |
| **Frontend Code-Splitting & Optimasi Bundle** | MEDIUM | **[DONE]** | Seluruh 25+ halaman di [`AppRoutes.jsx`](file:///c:/workspace/belajar-react/elearning-react/src/routes/AppRoutes.jsx) telah dipecah menggunakan `React.lazy()` + `<Suspense>`, memangkas bundle utama dari 891 kB menjadi 333 kB. |
| **Automated Feature Tests untuk Webhook & Batch** | MEDIUM | **[TODO]** | Perluasan unit/feature test suite di luar `SecurityWebshellTest.php`. |
| **Server-Side Pagination di Seluruh List Endpoints** | MEDIUM | **[TODO]** | Mengubah `->get()` menjadi `->paginate(20)` pada data besar di masa depan. |

---

## 3. Rekomendasi Fitur Baru (*Product & Feature Ideas*)

### Kategori 1: Quick Wins (*Low Effort, High Impact*)
1. **[DONE] Backoffice Inbox & Lead Management (`/admin/contacts`)**  
   Panel admin untuk memantau konsultasi masuk dari Contact Page dan Blog, filter status (`UNREAD`, `REPLIED`, `ARCHIVED`), serta tautan langsung ke WhatsApp & Mailto.
2. **[DONE] Email Otomatis Hasil Evaluasi Ujian & Permintaan Revisi**  
   Pengiriman email otomatis kepada peserta saat instruktur memberikan nilai atau meminta perbaikan lembar jawaban.
3. **[DONE] Pemulihan Kata Sandi Mandiri (OTP Email)**  
   Mekanisme reset sandi 6-digit OTP tanpa memerlukan campur tangan manual tim helpdesk.
4. **[DONE] Code-Splitting Bundle Frontend**  
   Penerapan lazy loading rute yang mempercepat waktu pembukaan situs awal hingga >60%.
5. **[TODO] Export Laporan Transaksi & Nilai ke CSV/Excel**  
   Penambahan tombol unduh rekapitulasi data keuangan dan kelulusan mahasiswa ke format `.xlsx`/`.csv`.

---

### Kategori 2: Core Value Multiplier (*Medium Effort*)
1. **[TODO] Interactive CBT Quiz Engine & Simulasi Pajak Otomatis (TER PPh 21 / PPN)**  
   Melengkapi ujian berkas manual dengan kuis interaktif berwaktu yang dinilai secara otomatis oleh sistem.
2. **[TODO] Pendaftaran Kolektif B2B & Portal HR Perusahaan**  
   Fitur bagi institusi korporasi untuk mendaftarkan beberapa peserta pelatihan sekaligus dengan faktur perusahaan resmi.
3. **[TODO] Pengingat Sesi Kelas Interaktif (H-1 & H-1 Jam via Email/WhatsApp)**  
   Pengingat terjadwal otomatis menjelang sesi tatap muka daring (Zoom) dimulai.
4. **[TODO] Private Encrypted Storage untuk Arsip Tugas & Modul**  
   Peningkatan penyimpanan berkas sensitif menggunakan signed URL dengan batas waktu akses.

---

### Kategori 3: Moonshot / AI-Powered Enhancement (*High Effort*)
1. **[TODO] AI Tax Regulation Copilot (RAG Assistant di Learning Room)**  
   Asisten tanya-jawab pintar yang terlatih pada undang-undang perpajakan Indonesia terbaru (UU HPP, PMK 168/2023, modul Coretax DJP).
2. **[TODO] AI Co-Grader untuk Kertas Kerja Pajak Excel**  
   Alat bantu instruktur untuk menganalisis selisih perhitungan kertas kerja perpajakan mahasiswa secara otomatis.
3. **[TODO] Pelacak Satuan Kredit Profesi (SKP) & Pembaruan Sertifikasi Berkala**  
   Sistem pemantauan masa berlaku kompetensi dan rekomendasi kelas lanjutan bagi para alumni.

---

## 4. Status Roadmap Eksekusi (Prioritas 1–3)

### [DONE] Prioritas 1: Hardening Keamanan API (Sanctum + Role Middleware) & Perbaikan SQL MariaDB
- **Status:** **SELESAI (100%)**
- **Ringkasan Pekerjaan:**
  - `backend/app/Http/Middleware/EnsureUserHasRole.php`: Dibuat dan memverifikasi token Sanctum serta peran pengguna (`admin`, `teacher`, `student`).
  - [`backend/bootstrap/app.php`](file:///c:/workspace/belajar-react/elearning-react/backend/bootstrap/app.php): Didaftarkan alias middleware `'role'`.
  - [`backend/routes/api.php`](file:///c:/workspace/belajar-react/elearning-react/backend/routes/api.php): Seluruh endpoint privat dikelompokkan ke dalam proteksi `role:admin`, `role:teacher,admin`, dan `role`.
  - [`backend/app/Http/Controllers/Api/AdminController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/AdminController.php): Query pendapatan bulanan disesuaikan lintas driver database (kompatibel MariaDB & SQLite) dan query popularitas kursus dioptimalkan dengan `withCount()`.

### [DONE] Prioritas 2: Penyempurnaan Siklus Akademik (Notifikasi Ujian, Reset Sandi & Sinkronisasi Sertifikat)
- **Status:** **SELESAI (100%)**
- **Ringkasan Pekerjaan:**
  - [`backend/app/Services/MailService.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Services/MailService.php) & [`backend/app/Http/Controllers/Api/TeacherController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/TeacherController.php): Dibuat fungsi `sendExamReviewEmail()` dan dipanggil saat guru menilai tugas atau meminta revisi.
  - [`backend/app/Http/Controllers/Api/CertificateController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/CertificateController.php): Nama penandatangan sertifikat terhubung dinamis dengan profil institusi (`director_name`).
  - [`backend/app/Http/Controllers/Api/AuthController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/AuthController.php) & [`src/pages/public/LoginPage.jsx`](file:///c:/workspace/belajar-react/elearning-react/src/pages/public/LoginPage.jsx): Alur mandiri Lupa Sandi berbasis OTP 6-digit telah berfungsi penuh.

### [DONE] Prioritas 3: Admin Inbox Konsultasi (`/admin/contacts`) & Optimasi Frontend (`React.lazy`)
- **Status:** **SELESAI (100%)**
- **Ringkasan Pekerjaan:**
  - Migrasi `2026_11_10_100000_add_status_to_contacts_table.php` dieksekusi di database.
  - Endpoint manajemen kontak `GET`, `PATCH`, dan `DELETE` di [`backend/app/Http/Controllers/Api/ContactController.php`](file:///c:/workspace/belajar-react/elearning-react/backend/app/Http/Controllers/Api/ContactController.php).
  - Halaman antarmuka [`src/pages/admin/AdminContactsPage.jsx`](file:///c:/workspace/belajar-react/elearning-react/src/pages/admin/AdminContactsPage.jsx) dan navigasi [`src/components/backoffice/BackofficeSidebar.jsx`](file:///c:/workspace/belajar-react/elearning-react/src/components/backoffice/BackofficeSidebar.jsx).
  - Code-splitting modular berbasis `React.lazy()` dan `Suspense` pada [`src/routes/AppRoutes.jsx`](file:///c:/workspace/belajar-react/elearning-react/src/routes/AppRoutes.jsx) telah berhasil dibuild tanpa peringatan ukuran berkas bundle berlebih.
