<!-- Gunakan dokumen ini sebagai konteks utama sebelum membaca file lain. -->

# Project Context & Architecture Map: NAC E-Learning Tax Center

## 1. Project Overview & Tech Stack

Platform e-learning perpajakan terapan terintegrasi UU HPP & Coretax DJP (Brevet AB, Brevet C, dan Mastery Simulasi Coretax) dengan sistem RBAC, onboarding multi-tahap, verifikasi email SMTP, payment gateway manual/QRIS, serta portal pembelajaran modular.

- **Frontend**: React 19, Vite 8, React Router v7, Tailwind CSS v3, Axios, Lucide React, Canvas Confetti.
- **Backend**: Laravel 12, PHP 8.2+, Laravel Sanctum (Token Auth), SQLite (default `database.sqlite`), Blade Email Templates.
- **Dev Servers**:
  - Frontend: `http://localhost:5173` (`npm run dev:fe`)
  - Backend API: `http://127.0.0.1:8000/api` (`cd backend && php artisan serve --port=8000`)
  - Queue Worker: `php artisan queue:listen` (untuk email verification & reminder)
  - Full Stack (All-in-one): `npm run dev`
- **Core Environment Keys**:
  - FE (`.env`): `VITE_API_BASE_URL=http://127.0.0.1:8000/api`, `VITE_USE_MOCK_API=false`, `VITE_GOOGLE_CLIENT_ID`, `VITE_DEV_MODE=true`
  - BE (`backend/.env`): `DB_CONNECTION=sqlite`, `FRONTEND_URL=http://localhost:5173`, `MAIL_MAILER=smtp`, `GOOGLE_CLIENT_ID`

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
│   │   ├── paymentService.js         # Upload bukti transfer, approval admin
│   │   └── certificateService.js     # Validasi QR code & penerbitan sertifikat digital
│   ├── layouts/
│   │   ├── FrontofficePublicLayout   # Navbar publik + footer institusi
│   │   ├── FrontofficePortalLayout   # Sidebar dashboard untuk Student & Teacher
│   │   └── BackofficeLayout          # Admin CMS management layout
│   ├── pages/
│   │   ├── public/                   # HomePage, BrevetCatalog, BrevetDetail, Login, Register, VerifyEmail
│   │   ├── onboarding/               # PaymentPendingPage (tunggu approval bayar / upload struk)
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
│   │   │       ├── CreateModuleModal.jsx      # Modal tambah modul kurikulum & ujian awal
│   │   │       ├── AddLessonModal.jsx         # Modal tambah bab materi video / file
│   │   │       ├── EditExamModal.jsx          # Modal konfigurasi ujian studi kasus
│   │   │       └── TeacherModuleCard.jsx      # Kartu modul, daftar materi, & status ujian
│   │   └── admin/                    # AdminDashboard, AdminPayments, AdminStudents, AdminTeachers, Brevets, EmailTemplates
│   └── components/
│       ├── auth/GoogleAuthButton.jsx # Google OAuth 2.0 & instant account switcher
│       └── common/Badge.jsx          # Status pill visual standar (APPROVED, PENDING, REVISION, dll)
└── backend/
    ├── .env                          # DB, Mail SMTP, APP_URL, FRONTEND_URL
    ├── routes/api.php                # Seluruh endpoint REST API Laravel
    ├── database/
    │   ├── database.sqlite           # SQLite DB file
    │   ├── migrations/               # Skema tabel users, brevets, enrollments, payments, submissions
    │   └── seeders/DatabaseSeeder    # Default accounts (admin, teacher, students, 3 program brevet)
    └── app/
        ├── Models/                   # User, Brevet, Enrollment, Payment, Submission, Certificate, EmailTemplate
        ├── Http/Controllers/Api/     # AuthController, BrevetController, TeacherController, AdminController, etc.
        └── Services/MailService.php  # Pengiriman email verifikasi OTP, welcome, approval payment
```

---

## 3. Database & Entity Summary

| Tabel / Entity | Deskripsi & Field Utama | Relasi |
| :--- | :--- | :--- |
| **`users`** | Akun pengguna (`id`, `string_id`, `name`, `email`, `role`, `avatar`, `payment_status`, `google_id`, `email_verified_at`). Role: `student`, `teacher`, `admin`. | `hasMany(Enrollment)`, `hasMany(Payment)`, `hasMany(Certificate)` |
| **`brevets`** | Program pelatihan (`id`: `brevet-ab`, `brevet-c`, `coretax-mastery`, `slug`, `title`, `price`, `instructor`, `curriculum` [JSON]). | `hasMany(Batch)`, `hasMany(Enrollment)`, `hasMany(Payment)` |
| **`batches`** | Angkatan kelas / Cohort (`id`, `brevet_id`, `batch_name`, `batch_code`, `start_date`, `end_date`, `status`: `open`/`ongoing`/`finished`, `curriculum` [JSON snapshot terkunci]). | `belongsTo(Brevet)`, `hasMany(Enrollment)`, `hasMany(Submission)` |
| **`enrollments`** | Kursus yang diambil siswa (`user_id`, `brevet_id`, `batch_id`, `status`: `ACTIVE`/`PASSED`, `passed_at`, `invoice_number`, `is_active`, `payment_status`, `progress_percentage`, `completed_lessons` [JSON]). | `belongsTo(User)`, `belongsTo(Brevet)`, `belongsTo(Batch)` |
| **`payments`** | Riwayat transaksi tagihan (`id`: `PAY-XXXX`, `invoice_number`, `user_id`, `brevet_id`, `amount`, `status`: `PENDING_APPROVAL` / `APPROVED` / `REJECTED`, `proof_image_url`). | `belongsTo(User)`, `belongsTo(Brevet)` |
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

### D. Payments & Billing
- `POST /payments/proof` : Unggah bukti transfer / struk pembayaran siswa.
- `GET  /admin/payments/pending` : Daftar pembayaran menunggu approval admin.
- `POST /admin/payments/{id}/verify` : Approve pembayaran siswa -> Ruang kelas terbuka otomatis.
- `POST /admin/payments/{id}/reject` : Tolak bukti bayar dengan catatan alasan.

### E. Backoffice Admin & Teacher Portal
- `GET  /admin/stats` : Ringkasan statistik siswa aktif, revenue, dan guru.
- `GET/POST /admin/teachers` : Manajemen & undangan akun instruktur/guru.
- `GET  /teacher/dashboard` : Ringkasan metrik kelas binaan guru.
- `GET  /teacher/brevets/{id}/batches` : Daftar batch & jumlah siswa terdaftar per program.
- `POST /teacher/brevets/{id}/batches` : Buka angkatan baru dengan snapshot kurikulum terkunci.
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
   - Tahap 3: `PAYMENT` -> Siswa diarahkan ke `/onboarding/payment-pending` untuk upload struk / bayar.
   - Tahap 4: `COMPLETED` -> Admin menyetujui pembayaran (`status: APPROVED`), seluruh rute `/dashboard/student/*` terbuka penuh.

4. **Locking Silabus & Kurikulum (Sequential Locking)**:
   - **Antar Modul**: Modul ke-`N` terkunci sampai ujian lembar kerja Modul ke-`N-1` dikumpulkan oleh siswa.
   - **Antar Bab dalam Modul**: Bab 1 terbuka otomatis; Bab ke-`M` hanya terbuka jika Bab ke-`M-1` sudah ditandai selesai.
   - **Bab Akhir (Ulangan Modul)**: Hanya terbuka jika seluruh materi pelajaran biasa dalam modul tersebut sudah selesai.
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

