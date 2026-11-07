<!-- Gunakan dokumen ini sebagai konteks utama sebelum membaca file lain. -->

# Project Context & Architecture Map: NAC E-Learning Tax Center

## 1. Project Overview & Tech Stack

Platform e-learning perpajakan terapan terintegrasi UU HPP & Coretax DJP (Brevet AB, Brevet C, dan Mastery Simulasi Coretax) dengan sistem RBAC, onboarding multi-tahap, verifikasi email SMTP, payment gateway otomatis Midtrans Snap (QRIS Dinamis, Virtual Account BCA/Mandiri/BNI/BRI/Permata, Kartu Kredit 3DS, & Gerai Retail), serta portal pembelajaran modular.

- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS v3, Axios, Lucide React, Canvas Confetti.
- **Backend**: Laravel 12, PHP 8.2+, Laravel Sanctum (Token Auth), MariaDB 11.4 (default database `nac_elearning`), Blade Email Templates.
- **Dev Servers**:
  - Frontend: `http://localhost:5173` (`npm run dev:fe`)
  - Backend API: `http://127.0.0.1:8000/api` (`cd backend && php artisan serve --port=8000`)
  - Queue Worker: `php artisan queue:listen` (untuk email verification & reminder)
  - Full Stack (All-in-one): `npm run dev`
  - Docker Compose: `npm run docker:up` / `docker compose up -d` (Backend `8000`, Frontend `5173`, Queue Worker)
- **Core Environment Keys**:
  - FE (`.env`): `VITE_API_BASE_URL=http://127.0.0.1:8000/api`, `VITE_GOOGLE_CLIENT_ID`, `VITE_DEV_MODE=true`, `VITE_MIDTRANS_CLIENT_KEY`
  - BE (`backend/.env`): `DB_CONNECTION=mariadb`, `DB_HOST=mariadb`, `DB_PORT=3306`, `DB_DATABASE=nac_elearning`, `DB_USERNAME=nac_user`, `DB_PASSWORD=nac_elearning_secret`, `FRONTEND_URL=http://localhost:5173`, `MAIL_MAILER=smtp`, `GOOGLE_CLIENT_ID`, `VITE_MIDTRANS_SERVER_KEY`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`

---

## 2. Directory Mapping (Peta Folder Krusial)

```text
/
├── .env                              # Config frontend (API base URL, Google OAuth client ID)
├── package.json                      # Dependencies & script runner frontend
├── src/
│   ├── App.jsx / main.jsx            # Entry point & provider wrappers
│   ├── index.css                     # Global styles, Tailwind directives, custom badge utilities
│   ├── config/devMode.js             # Toggle dev-helper & test credentials
│   ├── context/
│   │   ├── AuthContext.jsx           # Global user state, login, register, switchRole, token management
│   │   └── ToastContext.jsx          # Toast notification provider
│   ├── routes/
│   │   ├── AppRoutes.jsx             # Definisi semua rute public, student, teacher, & admin
│   │   └── RouteGuards.jsx           # RequireAuth, RequireGuest, RequireRole, PaymentApprovalGuard
│   ├── services/
│   │   ├── api/
│   │   │   ├── apiClient.js          # Axios instance, Bearer token interceptor, standard response unwrapper
│   │   │   └── endpoints.js          # Centralized contract URL API backend
│   │   ├── brevetService.js          # Fetch katalog program & detail kurikulum
│   │   ├── userService.js            # Profile, verification email, password, switch active brevet
│   │   ├── paymentService.js         # Midtrans Snap Token, status sync, instant simulation, approval
│   │   └── certificateService.js     # Validasi QR code & penerbitan sertifikat digital
│   ├── layouts/
│   │   ├── FrontofficePublicLayout   # Navbar publik + footer institusi
│   │   ├── FrontofficePortalLayout   # Sidebar dashboard untuk Student & Teacher
│   │   └── BackofficeLayout          # Admin CMS management layout
│   ├── pages/
│   │   ├── public/                   # HomePage, BrevetCatalog, BrevetDetail, Login, Register, VerifyEmail
│   │   ├── onboarding/               # PaymentPendingPage (Midtrans Snap multi-channel payment gateway)
│   │   ├── student/                  # Pola Arsitektur Role Student:
│   │   │   ├── StudentDashboard.jsx  # File halaman utama langsung di root role
│   │   │   ├── components/           # Komponen privat HANYA digunakan oleh student:
│   │   │   │   ├── CourseSyllabusSidebar.jsx
│   │   │   │   ├── ExamContentView.jsx
│   │   │   │   ├── LearningHeaderBanners.jsx
│   │   │   │   ├── LessonContentView.jsx
│   │   │   │   ├── LockedChapterView.jsx
│   │   │   │   └── learningHelpers.js
│   │   │   └── pages/                # Sub-pages / halaman turunan bertingkat:
│   │   │       ├── MyCoursesPage.jsx
│   │   │       ├── CertificatesPage.jsx
│   │   │       ├── TransactionsPage.jsx
│   │   │       └── course/
│   │   │           └── CourseLearningPage.jsx
│   │   ├── teacher/                  # TeacherDashboard, TeacherStudents
│   │   │   ├── TeacherCoursesPage.jsx# Kelola kurikulum & materi modul (modular, ~540 lines)
│   │   │   └── components/           # Sub-komponen modal & kartu kurikulum:
│   │   │       ├── CreateBrevetModal.jsx      # Modal tambah program brevet baru
│   │   │       ├── CreateBatchModal.jsx       # Modal buka angkatan baru (immutable snapshot)
│   │   │       ├── CreateModuleModal.jsx      # Modal tambah modul kurikulum & ujian awal
│   │   │       ├── AddLessonModal.jsx         # Modal tambah bab materi video / file / opsional
│   │   │       ├── EditExamModal.jsx          # Modal konfigurasi ujian studi kasus
│   │   │       └── TeacherModuleCard.jsx      # Kartu modul, daftar materi, & status ujian
│   │   └── admin/                    # AdminDashboard, AdminPayments, AdminStudents, AdminTeachers, Brevets, EmailTemplates
│   └── components/
│       ├── auth/GoogleAuthButton.jsx # Google OAuth 2.0 & instant account switcher
│       └── common/Badge.jsx          # Status pill visual standar (APPROVED, PENDING, REVISION, dll)
│   └── hooks/                        # Custom React hooks
└── backend/
    ├── .env                          # DB, Mail SMTP, APP_URL, FRONTEND_URL, Midtrans Keys
    ├── routes/api.php                # Seluruh endpoint REST API Laravel
    ├── database/
    │   ├── database.sqlite           # SQLite DB file
    │   ├── migrations/               # Skema tabel users, brevets, enrollments, payments, submissions
    │   └── seeders/DatabaseSeeder    # Default accounts (admin, teacher, students, 3 program brevet)
    └── app/
        ├── Models/                   # User, Brevet, Enrollment, Payment, Submission, Certificate, EmailTemplate
        ├── Http/Controllers/Api/     # AuthController, BrevetController, TeacherController, PaymentController, etc.
        └── Services/
            ├── MailService.php       # Pengiriman email verifikasi OTP, welcome, approval payment
            └── MidtransService.php   # Snap token creation, webhook SHA512 signature verify & auto-settlement
```

---

## 3. Database & Entity Summary

| Tabel / Entity | Deskripsi & Field Utama | Relasi |
| :--- | :--- | :--- |
| **`users`** | Akun pengguna (`id`, `string_id`, `name`, `email`, `role`, `avatar`, `payment_status`, `google_id`, `email_verified_at`). Role: `student`, `teacher`, `admin`. | `hasMany(Enrollment)`, `hasMany(Payment)`, `hasMany(Certificate)` |
| **`brevets`** | Program pelatihan (`id`: `brevet-ab`, `brevet-c`, `coretax-mastery`, `slug`, `title`, `price`, `instructor`, `curriculum` [JSON]). | `hasMany(Batch)`, `hasMany(Enrollment)`, `hasMany(Payment)` |
| **`batches`** | Angkatan kelas / Cohort (`id`, `brevet_id`, `assigned_teacher_id`, `batch_name`, `batch_code`, `start_date`, `end_date`, `status`: `open`/`ongoing`/`finished`, `curriculum` [JSON snapshot terkunci]). | `belongsTo(Brevet)`, `belongsTo(User, assignedTeacher)`, `belongsToMany(User, batch_teachers)`, `hasMany(Enrollment)`, `hasMany(Submission)` |
| **`batch_teachers`** | Tabel pivot multi-guru per batch (`batch_id`, `teacher_id`, `role`: `primary`/`reviewer`). | `belongsTo(Batch)`, `belongsTo(User)` |
| **`enrollments`** | Kursus yang diambil siswa (`user_id`, `brevet_id`, `batch_id`, `status`: `ACTIVE`/`PASSED`, `passed_at`, `invoice_number`, `is_active`, `payment_status`, `payment_method`, `progress_percentage`, `completed_lessons` [JSON]). | `belongsTo(User)`, `belongsTo(Brevet)`, `belongsTo(Batch)` |
| **`payments`** | Riwayat transaksi tagihan Midtrans (`id`: `PAY-XXXX`, `invoice_number`, `user_id`, `brevet_id`, `amount`, `payment_method`, `payment_type`, `snap_token`, `snap_redirect_url`, `transaction_id`, `transaction_status`, `fraud_status`, `settlement_time`, `status`: `PENDING_APPROVAL` / `APPROVED` / `REJECTED`). | `belongsTo(User)`, `belongsTo(Brevet)` |
| **`submissions`** | Tugas / ulangan modul siswa (`id`: `sub-XXXX`, `user_id`, `brevet_id`, `batch_id`, `module_id`, `task`, `submission_url`, `status`: `PENDING` / `APPROVED` / `REVISION`, `score`, `teacher_feedback`). | `belongsTo(User)`, `belongsTo(Brevet)`, `belongsTo(Batch)` |
| **`certificates`**| Sertifikat digital resmi kelulusan (`certificate_id`, `user_id`, `recipient_name`, `course_title`, `grade`, `score`, `verification_url`). | `belongsTo(User)` |
| **`email_templates`** | Template email dinamis SMTP (`template_key`, `subject`, `body_html`, `variables_json`). | Standalone CMS |
| **`materials`** | Modul materi tambahan unggahan pengajar (`brevet_id`, `title`, `target_module`, `file_type`, `file_url`). | `belongsTo(Brevet)` |

---

## 4. API Endpoints Map (`backend/routes/api.php`)

Prefix default: `/api/...` (dan fallback kompatibel `/api/v1/...`).

### A. Auth, Profile & Student Course Actions
- `POST /auth/login` : Autentikasi email & password, mengembalikan token Sanctum & profil.
- `POST /auth/register` : Pendaftaran siswa baru + auto-enroll brevet pilihan + kirim OTP.
- `GET  /auth/google/url` : Ambil URL otorisasi Google OAuth (membawa `state` program brevet).
- `GET  /auth/google/callback` : Callback redirect Google OAuth, menukarkan code menjadi login token.
- `POST /auth/google` : Otentikasi langsung kredensial / simulated Google Account.
- `POST /auth/logout` : Revoke session token Sanctum aktif.
- `POST /auth/switch-role` : (Dev Mode) Ganti role instan antara `student`, `teacher`, dan `admin`.
- `GET  /user/profile` : Profil user login + info `active_brevet` + `onboarding_step`.
- `PUT  /user/profile` : Update profil nama, avatar, whatsapp, dan status payment.
- `GET  /user/enrollments` : Daftar seluruh program brevet yang dimiliki akun siswa.
- `POST /user/set-active-brevet` : Ganti ruang kelas brevet aktif siswa (`brevet_id` / `slug`).
- `POST /user/enroll-brevet` : Siswa aktif mendaftar program brevet tambahan (terbit invoice baru).
- `POST /user/course-progress` : Simpan bab yang selesai dipelajari (`lesson_id`).
- `POST /user/course-progress/reset` : (Dev Mode) Reset progres pembelajaran kembali ke Bab 1.
- `GET  /user/submissions` : Riwayat pengumpulan ujian modul siswa per brevet.
- `POST /user/submissions` : Unggah lembar jawaban / link revisi tugas modul siswa.

### B. Email Verification (SMTP)
- `POST /auth/send-verification` : Kirim/kirim ulang 6-digit kode OTP ke email siswa.
- `POST /auth/verify-email` : Verifikasi 6-digit kode OTP email siswa.
- `GET/PUT /admin/email-templates/{id}` : Manajemen template HTML email sistem.

### C. Public Brevets, Batches & Certificates
- `GET  /brevets` : Katalog seluruh program brevet berserta harga, batch aktif, & silabus.
- `GET  /brevets/{idOrSlug}` : Detail spesifik program brevet (scoping kurikulum otomatis per batch siswa yang login).
- `GET  /brevets/{idOrSlug}/batches` : Daftar angkatan/cohort yang tersedia untuk program brevet.
- `GET  /certificates` : Daftar sertifikat (otomatis ter-filter per user jika siswa yang login).
- `POST /certificates` : Terbitkan sertifikat kelulusan (nilai & yudisium dihitung dinamis dari submission).
- `GET  /certificates/{certId}/verify` : Verifikasi keabsahan sertifikat publik via QR Code.

### D. Midtrans Payments Gateway & Monitoring
- `POST /payments/snap-token` : Inisiasi transaksi dan ambil Snap Token Midtrans untuk tagihan siswa.
- `POST /payments/notification` / `/payments/webhook` : Webhook handler Midtrans (validasi signature SHA512 & auto-settlement).
- `GET  /payments/{orderId}/status` : Cek dan sinkronkan status transaksi terkini dari Midtrans Core API.
- `POST /payments/{orderId}/sync` : Manual sync status pembayaran dari Midtrans API ke database.
- `POST /payments/{orderId}/simulate-approval` : (Dev Mode) Simulasi instant settlement pembayaran.
- `GET  /admin/payments` : Daftar transaksi Midtrans & metrik pendapatan untuk pemantauan admin.
- `POST /admin/payments/{id}/verify` : Manual approval override oleh administrator jika diperlukan.
- `POST /admin/payments/{id}/reject` : Batalkan transaksi pembayaran secara administratif.

### E. Backoffice Admin & Teacher Portal
- `GET  /admin/stats` : Ringkasan statistik siswa aktif, revenue, dan guru.
- `GET/POST /admin/teachers` : Manajemen & undangan akun instruktur/guru.
- `GET  /teacher/teachers` : Daftar seluruh pengajar aktif untuk penugasan tim reviewer angkatan.
- `GET  /teacher/dashboard` : Ringkasan metrik kelas binaan guru (termasuk kelas di mana guru menjadi co-reviewer).
- `GET  /teacher/brevets/{id}/batches` : Daftar batch & jumlah siswa terdaftar per program.
- `POST /teacher/brevets/{id}/batches` : Buka angkatan baru dengan snapshot kurikulum terkunci.
- `PUT  /teacher/brevets/{id}/batches/{batchId}` : Edit info angkatan, atur tim guru reviewer, dan ubah status dengan aturan eksklusivitas.
- `GET  /teacher/submissions` : Daftar ujian modul siswa yang perlu dinilai/revisi.
- `POST /teacher/submissions/{id}/review` : Berikan revisi (`status: REVISION`) atau lulus (`status: APPROVED`) beserta nilai.
- `GET/POST /teacher/materials` : Unggah materi ajar tambahan untuk modul.

---

## 5. Code Conventions & Architectural Rules

1. **Format Response JSON Backend**:
   - Selalu konsisten: `{ "success": true|false, "message": "Keterangan", "data": ... }`.
   - Validasi error: HTTP 422 dengan format `{ "success": false, "message": "Pesan error pertama", "errors": { ... } }`.
   - Unauthenticated: HTTP 401.

2. **Frontend State & Token Auth**:
   - Token disimpan di `localStorage` dengan key: `'nac_auth_token'`.
   - Token cadangan program pilihan: `'nac_pending_brevet_id'` (agar selamat saat redirect OAuth).
   - Seluruh request Axios otomatis menginjeksi header `Authorization: Bearer <token>` melalui [apiClient.js](file:///c:/workspace/belajar-react/elearning-react/src/services/api/apiClient.js).

3. **Onboarding Gatekeeper Flow**:
   - Tahap 1: Registrasi -> Akun dibuat dengan status `PENDING_APPROVAL`.
   - Tahap 2: `VERIFY_EMAIL` -> Siswa diarahkan ke `/verify-email` sampai OTP terverifikasi.
   - Tahap 3: `PAYMENT` -> Siswa diarahkan ke `/onboarding/payment-pending` untuk membayar via popup Midtrans Snap (QRIS Dinamis, Virtual Account BCA/Mandiri/BNI/BRI/Permata, Kartu Kredit 3DS, Gerai Retail).
   - Tahap 4: `COMPLETED` -> Midtrans memvalidasi pembayaran secara real-time via webhook callback (`settlement` / `capture` accept -> `status: APPROVED`), seluruh rute `/dashboard/student/*` terbuka penuh secara otomatis.

4. **Locking Silabus & Kurikulum (Sequential Locking)**:
   - **Antar Modul**: Modul ke-`N` terkunci sampai ujian lembar kerja Modul ke-`N-1` dikumpulkan oleh siswa.
   - **Antar Bab dalam Modul**: Bab 1 terbuka otomatis; Bab ke-`M` hanya terbuka jika Bab ke-`M-1` sudah ditandai selesai.
   - **Bab Akhir (Ulangan Modul)**: Hanya terbuka jika seluruh materi pelajaran biasa dalam modul tersebut sudah selesai.
   - **Isolasi Submisi Ujian Per-Modul**: Setiap modul kurikulum memiliki ulangan studi kasus terpisah (`mod.exam`). Status "Terkumpul" pada sidebar dan tombol "Lanjut ke Modul Berikutnya" hanya aktif jika berkas jawaban untuk modul spesifik tersebut telah berhasil diunggah (`Boolean(moduleSub)`). Transisi antar modul tidak pernah meng-autocomplete ujian tanpa berkas jawaban riil.
   - **Flagging Revisi Guru**: Modul dengan status submission `REVISION` **WAJIB** ditandai dengan tema **Oranye** (`border-orange-400`, badge `⚠️ Perlu Revisi Guru`, animasi berkedip), bukan hijau, dan menyediakan tombol direct-action untuk langsung memperbaiki.

5. **Multi-Brevet Active Classroom**:
   - Seorang siswa dapat terdaftar di beberapa brevet sekaligus.
   - Kolom `is_active` pada tabel `enrollments` menentukan ruang kelas mana yang tampil aktif di dashboard utama.
   - Endpoint `/user/set-active-brevet` digunakan untuk berpindah ruang kelas aktif antar brevet yang sudah approved.
   - **Aturan Approval Brevet Tambahan**: Ketika pendaftaran brevet tambahan disetujui (admin approve / simulasi), program baru tersebut **TIDAK** membajak ruang kelas aktif yang sedang berjalan (`is_active` tetap `false`). Kursus baru tersebut berstatus `APPROVED` dan berlabel "Terdaftar Resmi", sehingga mahasiswa bebas menentukan kapan ingin beralih ruang kelas via tombol *"Pilih & Aktifkan Kelas Ini"*. Tepat 1 program brevet yang boleh berstatus `is_active: true` pada satu waktu.

6. **Penerbitan & Verifikasi Sertifikat Kelulusan**:
   - **Gating Status Kelulusan & Sertifikat di Bab Akhir**: Tombol dan kartu status kelulusan serta sertifikat digital di Bab Akhir **HANYA muncul jika status siswa telah resmi dinyatakan LULUS oleh pengajar** (`isApprovedByTeacher`: seluruh modul selesai, ujian akhir terkumpul dan dinilai `status: 'APPROVED'` oleh pengajar). Jika baru mengumpulkan ujian (`status: 'PENDING'`), antarmuka menampilkan status informatif *"Menunggu Penilaian Pengajar / Lembar Jawaban Telah Diterima"* dan sertifikat terkunci rapat sampai evaluasi selesai disetujui instruktur.
   - **Auto-Issuance saat Akses Halaman Sertifikat**: Saat siswa mengakses `GET /api/certificates`, backend secara otomatis melakukan sinkronisasi auto-issuance (`autoIssueCertificatesForPassedBrevets`) yang **secara ketat mewajibkan lembar ujian akhir telah berstatus disetujui instruktur (`$hasApprovedExam === true`)**. Progres 100% materi tanpa persetujuan ujian pengajar tidak akan pernah menerbitkan sertifikat premature. Jika pengajar sudah approve via portal guru, barulah sertifikat terbit otomatis beserta sinkronisasi status pendaftaran ke `PASSED`.
   - **Konsistensi ID Pengguna (Frontend & Backend)**: Profil pengguna pada backend (`AuthController::formatUserProfile`) menyediakan `numeric_id` (integer) bersamaan dengan `id` berformat string (`usr-{id}`). Filter frontend pada `CertificatesPage.jsx` memvalidasi relasi sertifikat menggunakan numeric match (`c.user_id == user.numeric_id` atau parsing digit dari `user.id`) serta fallback ke nama siswa untuk memastikan sertifikat tidak tereliminasi akibat ketidaksamaan tipe data string vs integer.
   - **Perhitungan Nilai Akhir Dinamis**: Nilai akhir dihitung secara riil dari rata-rata nilai ujian modul yang dinilai instruktur (`submissions.score`).
   - **Predikat Yudisium Otomatis**: Tier yudisium dipetakan dinamis dari perolehan nilai (A Magna Cumlaude, A Sangat Memuaskan, B+, B, C).
   - **Nomor Registrasi Unik Sesuai Brevet**: Menggunakan prefix dinamis sesuai program (`CORE`, `C`, `AB`).
   - **Idempotensi**: Mencegah duplikasi penerbitan sertifikat untuk program brevet yang sama.
   - **Scoping Hak Akses**: Siswa hanya dapat melihat sertifikat kelulusan sah miliknya di `/dashboard/student/certificates` dan backend memvalidasi kelulusan resmi (HTTP 403 jika belum disetujui pengajar).

7. **Arsitektur Pola Struktur Folder Per-Role/Fitur (`src/pages/<role>/`)**:
   - `src/components/`: HANYA untuk komponen global/reusable lintas role (Button, Navbar, Modal, Input, Badge).
   - `src/pages/<role>/` (contoh: `student`, `teacher`, `admin`):
     * **File Halaman Utama**: Diletakkan langsung di dalam root folder role tersebut (misal `StudentDashboard.jsx`).
     * **Folder `components/`**: Komponen privat yang HANYA digunakan oleh halaman-halaman dalam role tersebut (misal: `ExamContentView.jsx`, `CourseSyllabusSidebar.jsx`, `TeacherModuleCard.jsx`).
     * **Folder `pages/`**: Sub-pages / halaman turunan bertingkat jika ada (misal `pages/MyCoursesPage.jsx`, `pages/CertificatesPage.jsx`, atau bertingkat seperti `pages/course/CourseLearningPage.jsx`).
   - Setiap implementasi modul/role berikutnya (`teacher`, `admin`) wajib konsisten mengikuti hierarki 3-lapis ini.
   - Hindari file monolitik (>800 baris) dengan memecah UI ke komponen privat di folder `components/` lokal.

8. **Sistem Pembelajaran Berbasis Batch / Angkatan (Cohort-based Learning & Immutable Progress)**:
   - **Snapshot Kurikulum Per-Batch (`batches.curriculum`)**: Modul kurikulum siswa tidak lagi terikat ke master kursus global yang mudah bergeser, melainkan terikat ke snapshot kurikulum angkatan (`batch_id`) saat batch tersebut dibuka.
   - **Immutabilitas Kelulusan (Permanent 100% Status)**: Jika siswa sudah dinyatakan lulus (`enrollment.status === 'PASSED'` / progress 100% / sertifikat terbit), status kelulusan bersifat permanen. Penambahan modul baru di master brevet atau batch lain tidak akan pernah menurunkan progres siswa yang sudah lulus.
   - **Materi Susulan / Update Opsional**: Jika ada materi baru yang ditambahkan pengajar ke master kurikulum setelah siswa lulus/berjalan, sistem menandai materi tersebut sebagai `is_update: true` / `is_optional: true` (`badge: 'Update Baru (Opsional)'`) sehingga siswa tetap dapat memperluas wawasan tanpa mewajibkan ujian ulang atau menurunkan persentase kelulusan.
   - **Pemberian Batch Otomatis**: Setiap pendaftaran baru (onboarding, Google OAuth, maupun brevet tambahan) otomatis diikatkan ke batch aktif (`status: 'open'` / `'ongoing'`) dari program brevet terkait.
   - **Tampilan UI Konsisten**: Nama angkatan (contoh: "Batch 42 - Reguler", "Batch 1 - Akselerasi Coretax DJP") ditampilkan jelas pada Dashboard Siswa, Kursus Saya, Silabus Sidebar, dan Portal Pengajar.
   - **Manajemen Batch di Portal Guru**: Pengajar dapat membuka angkatan baru kapan saja via tombol *"+ Buka Angkatan Baru"* (`CreateBatchModal.jsx`) pada `TeacherCoursesPage.jsx`, menyematkan materi susulan/opsional via `AddLessonModal.jsx`, serta memfilter dan memonitor siswa per angkatan pada `TeacherStudentsPage.jsx` dan `TeacherDashboardPage.jsx`.
   - **Aturan Spesial Status Batch (Eksklusivitas Status Aktif)**:
     * Dalam 1 program brevet, status **`open` (Dalam Pendaftaran)** dan **`ongoing` (Sedang Berjalan)** masing-masing **hanya boleh ada maksimal 1 angkatan**.
     * Jika pengajar membuka atau mengedit status angkatan menjadi `open` atau `ongoing`, angkatan lain dalam program brevet tersebut yang memiliki status sama akan **otomatis diubah menjadi `finished` (nonaktif)**.
     * Status **`finished` (nonaktif / selesai)** tidak memiliki batasan jumlah (bebas berapa saja).
   - **Edit Angkatan & Multi-Guru Reviewer (Co-Teaching)**:
     * Angkatan dapat diedit kapan saja (`EditBatchModal.jsx` / `PUT /teacher/brevets/{id}/batches/{batchId}`) untuk memperbarui nama, tanggal pelaksanaan, status, dan tim guru.
     * Guru pengampu dapat menugaskan guru-guru lain ke dalam angkatan (`batch_teachers` pivot table) untuk membantu memantau kelas dan menilai lembar jawaban studi kasus murid.
     * Seluruh guru yang ditugaskan (baik pengampu utama maupun tim reviewer) otomatis mendapatkan akses data mahasiswa dan antrean penilaian tugas batch tersebut pada portal dashboard pengajar (`TeacherController::getTeacherBatchIds`).
   - **Otomasi Pembuatan Batch & Assign Guru**: Saat pengajar membuka angkatan baru (`POST /teacher/brevets/{id}/batches`), sistem secara otomatis meng-assign angkatan baru ke guru yang sedang login (`assigned_teacher_id = auth()->id()`).
   - **Scoping Mahasiswa & Tugas Berbasis Batch**: Data mahasiswa pada daftar monitoring (`GET /teacher/students`), antrean penilaian tugas (`GET /teacher/submissions`), dan metrik ringkasan dashboard (`GET /teacher/dashboard`) ter-filter secara otomatis hanya untuk mahasiswa yang terdaftar di angkatan (batch) yang diampu oleh guru yang sedang login (`assigned_teacher_id = auth()->id()`). Akun administrator tetap memiliki visibilitas global.
   - **Review Soal & Jawaban Studi Kasus**: API pengumpulan tugas (`GET /teacher/submissions`) menyertakan metadata soal ujian (`question_url`, `question_title`, `question_description`) dari kurikulum modul terkait. Dashboard pengajar menampilkan tombol cepat "Review Soal Ujian (GDrive)" berdampingan dengan "Buka Jawaban Murid (GDrive)" serta panel acuan penilaian di dalam modal evaluasi agar instruktur dapat membandingkan soal dan jawaban mahasiswa dengan mudah.

    - **Validasi Media & Seeder Kurikulum**: Master kurikulum di `backend/database/data/brevets_data.json` memuat video materi YouTube riil untuk seluruh bab dan dokumen Google Drive (Excel, Word, PDF); helper `learningHelpers.js` menangani sanitasi URL (embed, shorts, channel mapping @DDTCIndonesia & @DitjenPajakRI) dengan strict-origin policy. Seluruh soal latihan & ujian modul diarahkan ke dokumen studi kasus terstandar Google Docs.
    - **Scoping 1 Bab 1 Dokumen Pendamping (Contextual Handout)**: Pada tampilan pembelajaran siswa (`CourseLearningPage.jsx` & `LessonContentView.jsx`), dokumen Google Drive yang ditampilkan di bawah video kini di-scope secara ketat 1-to-1 dengan bab materi yang sedang aktif (`activeLesson.gdrive_url`). Siswa hanya melihat dan mengunduh bahan ajar yang relevan dengan video yang sedang ditonton, sehingga tidak membingungkan atau tercampur dengan dokumen bab lain dalam modul.


---

## 6. Docker Stack & Anti-php2shell Security Architecture

1. **Docker Orchestration**:
   - `docker-compose.yml` (Development) & `docker-compose.prod.yml` (Production Nginx SPA).
   - Container Services:
     - `nac-mariadb` / `nac-mariadb-prod`: MariaDB 11.4 database (`nac_elearning`) port `3306` (menggunakan TCP healthcheck `127.0.0.1` agar tidak terjadi false-positive `healthy` pada Unix socket saat bootstrap awal).
     - `nac-backend` / `nac-backend-prod`: PHP 8.2 CLI port `8000` (sinkron dengan `backend/.env` via `env_file` & volume mount).
     - `nac-queue-worker` / `nac-queue-prod`: Background queue worker (`queue:listen` / `queue:work`).
     - `nac-frontend` / `nac-frontend-prod`: Vite development server (`5173`) / Nginx production (`80` & `443`). `nginx/default.conf` di-bind mount ke container dan menggunakan Docker internal DNS resolver (`resolver 127.0.0.11 valid=5s ipv6=off;`) dengan dynamic upstream variable (`set $backend_upstream http://backend:8000;`) agar Nginx tidak mengalami `502 Bad Gateway` saat container `backend` di-recreate dan berganti IP internal Docker.
     - `nac-certbot-prod`: Container Certbot resmi untuk auto-renewal SSL setiap 12 jam.
   - Script Shortcuts di `package.json`: `npm run docker:up`, `npm run docker:down`, `npm run docker:build`, `npm run docker:logs`, `npm run docker:restart`, `npm run docker:seed`.

2. **Hardening Anti-php2shell / Webshell Execution Prevention**:
   - **PHP Engine (`backend/docker/security.ini`)**: Menonaktifkan fungsi berbahaya via `disable_functions` (`exec`, `passthru`, `shell_exec`, `system`, `proc_open`, `popen`, `show_source`, dll), `allow_url_include = Off`, `expose_php = Off`.
   - **Upload Whitelist & Signature Inspection (`AuthController::submitTask`)**:
     - Whitelist ketat: `pdf,doc,docx,xls,xlsx,csv,zip,rar,jpg,jpeg,png`.
     - Blacklist & double-extension block: Menolak file seperti `shell.php.jpg` atau ekstensi eksekutabel lainnya.
     - Deep inspection: Membaca 4KB header file untuk mendeteksi signature kode PHP (`<?php`, `eval(`, `system(`, `passthru(`, dll) meskipun disamarkan dalam file PDF atau gambar.
   - **File Naming & Path Isolation**:
     - File di-rename acak (`jawaban_{id}_{randomToken}.{ext}`).
     - Storage publik dilindungi [.htaccess](file:///c:/workspace/belajar-react/elearning-react/backend/storage/app/public/.htaccess) (`php_flag engine off`) dan rule block Nginx untuk mencegah eksekusi langsung.
   - **Automated Security Tests**: [SecurityWebshellTest.php](file:///c:/workspace/belajar-react/elearning-react/backend/tests/Feature/SecurityWebshellTest.php) menguji pencegahan unggahan file `.php`, file double-extension, file PDF bersignature PHP, serta kelolosan file PDF yang valid.


---

## 7. CI/CD & Container Registry Pipeline (GHCR & Pull-Based Deploy)

1. **Docker Container Registry Architecture (GitHub Container Registry - GHCR)**:
   - Pola kompilasi diubah dari *"build di VPS"* menjadi *"build & push ke GHCR via GitHub Actions Runner, lalu pull di VPS"*.
   - **Backend Image**: `ghcr.io/mugiaadha/react-elearning/backend:latest` (menggunakan `mlocati/docker-php-extension-installer` agar kompilasi ekstensi PHP di GitHub runner instan & hemat resource).
   - **Frontend Image**: `ghcr.io/mugiaadha/react-elearning/frontend:latest` (multi-stage Nginx production container dengan konfigurasi SPA routing & reverse proxy di `nginx/default.conf`).
   - **Production Compose (`docker-compose.prod.yml`)**: Menggunakan directive `image: ghcr.io/...` tanpa directive `build:`, mencegah server VPS mengalami memory exhausted atau CPU timeout. Service `backend` dan `queue` memuat `env_file: ./backend/.env` dan mem-bind mount `./backend/.env:/var/www/html/.env` agar sinkron dengan konfigurasi host.

2. **Daily CI/CD Workflow (`.github/workflows/ci.yml`) — Khusus Deploy Harian**:
   - **Peran**: Khusus untuk integrasi dan deploy harian saat ada perubahan kode (`push` ke `main`). Tidak mencampuradukkan urusan provisioning VPS dari nol atau setup SSL.
   - **GitHub Actions Secrets Sync**: Menginjeksi `GOOGLE_CLIENT_ID` dan `MIDTRANS_CLIENT_KEY` saat build Vite frontend, serta menyinkronkan ke `backend/.env` di VPS (`APP_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`).
   - **Tahapan**: `[frontend, backend]` (lint, build, PHPUnit) -> `docker` (build & push image ke GHCR dengan layer cache) -> `deploy` (SSH ke VPS, `git reset --hard origin/main`, sync secrets ke `.env`, `docker compose pull`, `docker compose up -d`, tunggu readiness container backend, `php artisan migrate --force`, dan refresh cache Laravel).

3. **First-Time VPS Provisioning Workflow (`.github/workflows/first-time-vps-setup.yml`) — Khusus Setup VPS dari Nol**:
   - **Peran**: Khusus dijalankan manual (`workflow_dispatch`) saat menyiapkan VPS baru dari nol atau mengganti domain/SSL.
   - **Tahapan**: Mengaktifkan Swap Memory 2GB otomatis (mencegah OOM Killer `exit 137`), menginstal Docker Engine & Compose plugin, git, curl, clone repo ke target directory, inisialisasi `.env` & `backend/.env` sesuai `APP_DOMAIN` beserta seluruh GitHub Actions Secrets, pull GHCR images, penerbitan SSL Let's Encrypt resmi murni via [scripts/setup-ssl.sh](file:///c:/workspace/belajar-react/elearning-react/scripts/setup-ssl.sh), menunggu [docker-entrypoint.sh](file:///c:/workspace/belajar-react/elearning-react/backend/docker-entrypoint.sh) menyelesaikan migrasi & seeding tunggal di container `backend` (dieksklusifkan dari `queue` worker agar tidak race condition), lalu membuat cache Laravel.

---

## 8. Centralized Domain & SSL/TLS Architecture (`APP_DOMAIN` - Pure Docker Stack)

1. **Centralized Domain Resolution (3-Tier Priority)**:
   - **Sumber Tunggal (`APP_DOMAIN`)**:
     1. Manual Override: `inputs.domain` pada `workflow_dispatch` ([ci.yml](file:///c:/workspace/belajar-react/elearning-react/.github/workflows/ci.yml) & [first-time-vps-setup.yml](file:///c:/workspace/belajar-react/elearning-react/.github/workflows/first-time-vps-setup.yml)).
     2. GitHub Repository Variable: `vars.APP_DOMAIN` (Settings -> Secrets and variables -> Actions -> Variables).
     3. Default Fallback: `nac.socket-clenicapp.my.id`.
   - **Auto-Propagation ke Seluruh Stack**:
     - Saat CI/CD berjalan, `APP_DOMAIN` otomatis disuntikkan ke build Vite (`VITE_API_BASE_URL`), `.env` root (`APP_DOMAIN`), `backend/.env` (`APP_URL`, `FRONTEND_URL`, `GOOGLE_REDIRECT_URI`, `MAIL_FROM_ADDRESS`), dan [docker-compose.prod.yml](file:///c:/workspace/belajar-react/elearning-react/docker-compose.prod.yml) (menggunakan `${APP_DOMAIN}` murni).
     - [nginx/default.conf](file:///c:/workspace/belajar-react/elearning-react/nginx/default.conf) bersifat **100% domain-agnostic** (`server_name _;`, membaca sertifikat dari `/etc/nginx/ssl/fullchain.pem` & `privkey.pem` yang di-mount dari `./certbot/ssl:/etc/nginx/ssl:ro` berisi hasil `cp -L` dereference sertifikat aktif agar tidak gagal akibat relative symlink Certbot `../../archive/`).

2. **Pure Docker SSL Architecture**:
   - Host VPS **tidak memerlukan** instalasi Nginx maupun Certbot di level OS host.
   - Frontend container (`nac-frontend-prod`) meng-expose langsung port `80:80` dan `443:443`.
   - Nginx di dalam container menangani:
     - Port 80: ACME challenge (`/.well-known/acme-challenge/` dari volume `./certbot/www`) dan auto-redirect HTTP ke HTTPS 301.
     - Port 443: Terminasi SSL Let's Encrypt, SPA Vite routing, dan proxy pass API backend.
   - Container `nac-certbot-prod` (`certbot/certbot`) berjalan di latar belakang untuk melakukan auto-renew sertifikat setiap 12 jam secara berkala.

3. **Automated Docker SSL Script (`scripts/setup-ssl.sh`) & Anti-Rate-Limit Persistence**:
   - **Auto-Restore & Reuse Existing Certificate**: Memeriksa keberadaan sertifikat yang masih berlaku di `./certbot/conf/live/$DOMAIN/`, `/var/backups/letsencrypt/`, atau `/etc/letsencrypt/`. Jika sertifikat untuk domain sudah pernah terdaftar dan masih valid (>7 hari), script langsung menggunakan sertifikat tersebut **tanpa** memanggil Certbot maupun menghentikan container Nginx.
   - **Persistent Host Backup**: Setiap kali sertifikat berhasil diterbitkan/tersedia, salinannya otomatis disimpan ke `/var/backups/letsencrypt` dan `/etc/letsencrypt` di luar folder project agar tidak hilang meskipun folder `/var/www/elearning` dihapus.
   - **Rate-Limit Graceful Fallback**: Saat benar-benar perlu menerbitkan sertifikat baru, menggunakan flag `--keep-until-expiring`, dan apabila kuota mingguan Let's Encrypt Production sedang penuh (5 certs / 7 hari), otomatis beralih ke Let's Encrypt `--staging` / self-signed fallback agar provisioning VPS tidak pernah gagal (`exit 1`).
