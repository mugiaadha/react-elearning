<?php

namespace Database\Seeders;

use App\Models\Brevet;
use App\Models\BlogPost;
use App\Models\Certificate;
use App\Models\CompanyProfile;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Payment;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with initial demo data.
     */
    public function run(): void
    {
        // 1. Seed Users (idempotent)
        $student1 = User::updateOrCreate(
            ['email' => 'dimas.pratama@gmail.com'],
            [
                'name' => 'Dimas Anindito Pratama',
                'password' => Hash::make('password123'),
                'string_id' => 'usr-student-01',
                'phone' => '+62 812-8890-4123',
                'role' => 'student',
                'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'APPROVED',
                'email_verified_at' => now(),
            ]
        );

        $student2 = User::updateOrCreate(
            ['email' => 'sarah.nurhaliza@taxcorp.id'],
            [
                'name' => 'Siti Sarah Nurhaliza',
                'password' => Hash::make('password123'),
                'string_id' => 'usr-student-02',
                'phone' => '+62 813-1122-3344',
                'role' => 'student',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'APPROVED',
                'email_verified_at' => now(),
            ]
        );

        $student3 = User::updateOrCreate(
            ['email' => 'faisal.reza@gmail.com'],
            [
                'name' => 'Muhammad Faisal Reza',
                'password' => Hash::make('password123'),
                'string_id' => 'usr-student-03',
                'phone' => '+62 856-7788-9900',
                'role' => 'student',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'APPROVED',
                'email_verified_at' => now(),
            ]
        );

        $teacher = User::updateOrCreate(
            ['email' => 'bambang.sudarmono@nactaxcenter.id'],
            [
                'name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'password' => Hash::make('password123'),
                'string_id' => 'usr-teacher-01',
                'phone' => '+62 811-9988-7766',
                'role' => 'teacher',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'APPROVED',
                'email_verified_at' => now(),
            ]
        );

        $teacher2 = User::updateOrCreate(
            ['email' => 'hendra.wijaya@nactaxcenter.id'],
            [
                'name' => 'dr. Hendra Wijaya, M.Si., BKP',
                'password' => Hash::make('password123'),
                'string_id' => 'usr-teacher-02',
                'phone' => '+62 813-4455-6677',
                'role' => 'teacher',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'APPROVED',
                'email_verified_at' => now(),
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@nactaxcenter.id'],
            [
                'name' => 'Administrator NAC Tax Center',
                'password' => Hash::make('password123'),
                'string_id' => 'usr-admin-01',
                'phone' => '+62 812-8890-4123',
                'role' => 'admin',
                'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
                'payment_status' => 'APPROVED',
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Brevets from database/data/brevets_data.json
        $brevetsJsonPath = database_path('data/brevets_data.json');
        if (file_exists($brevetsJsonPath)) {
            $json = json_decode(file_get_contents($brevetsJsonPath), true);
            $brevets = $json['data'] ?? [];
            foreach ($brevets as $b) {
                Brevet::updateOrCreate(
                    ['id' => $b['id']],
                    [
                        'slug' => $b['slug'],
                        'title' => $b['title'],
                        'badge' => $b['badge'] ?? null,
                        'tagline' => $b['tagline'] ?? null,
                        'description' => $b['description'],
                        'level' => $b['level'],
                        'duration' => $b['duration'],
                        'total_hours' => $b['total_hours'] ?? 0,
                        'price' => $b['price'],
                        'original_price' => $b['original_price'] ?? null,
                        'discount_percentage' => $b['discount_percentage'] ?? null,
                        'rating' => $b['rating'] ?? 5.0,
                        'total_reviews' => $b['total_reviews'] ?? 0,
                        'total_enrolled' => $b['total_enrolled'] ?? 0,
                        'thumbnail' => $b['thumbnail'] ?? null,
                        'instructor' => $b['instructor'] ?? null,
                        'features' => $b['features'] ?? null,
                        'curriculum' => $b['curriculum'] ?? null,
                    ]
                );
            }
        }

        // 2.5 Seed Cohort Batches
        $batchAB = \App\Models\Batch::updateOrCreate(
            ['batch_code' => 'BAT-AB-42'],
            [
                'brevet_id' => 'brevet-ab',
                'assigned_teacher_id' => $teacher->id,
                'batch_name' => 'Batch 42 - Reguler',
                'status' => 'ongoing',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->addMonths(2)->endOfMonth(),
                'curriculum' => Brevet::find('brevet-ab')?->curriculum ?? [],
            ]
        );
        $batchAB->teachers()->syncWithoutDetaching([$teacher->id, $teacher2->id]);

        $batchC = \App\Models\Batch::updateOrCreate(
            ['batch_code' => 'BAT-C-18'],
            [
                'brevet_id' => 'brevet-c',
                'assigned_teacher_id' => $teacher->id,
                'batch_name' => 'Batch 18 - Eksekutif',
                'status' => 'ongoing',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->addMonths(2)->endOfMonth(),
                'curriculum' => Brevet::find('brevet-c')?->curriculum ?? [],
            ]
        );
        $batchC->teachers()->syncWithoutDetaching([$teacher->id]);

        $batchCore = \App\Models\Batch::updateOrCreate(
            ['batch_code' => 'BAT-CORE-01'],
            [
                'brevet_id' => 'coretax-mastery',
                'assigned_teacher_id' => $teacher->id,
                'batch_name' => 'Batch 1 - Akselerasi Coretax DJP',
                'status' => 'ongoing',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->addMonths(1)->endOfMonth(),
                'curriculum' => Brevet::find('coretax-mastery')?->curriculum ?? [],
            ]
        );
        $batchCore->teachers()->syncWithoutDetaching([$teacher->id]);

        // 3. Seed Enrollments
        Enrollment::updateOrCreate(
            ['invoice_number' => 'INV-NAC-2026-0892'],
            [
                'user_id' => $student1->id,
                'brevet_id' => 'brevet-ab',
                'batch_id' => $batchAB->id,
                'amount' => 2750000,
                'payment_method' => 'QRIS (GoPay / ShopeePay / Bank Apps)',
                'payment_status' => 'APPROVED',
                'progress_percentage' => 0,
                'completed_lessons' => [],
                'is_active' => true,
                'registered_date' => now()->subDays(2),
            ]
        );

        Enrollment::updateOrCreate(
            ['invoice_number' => 'INV-NAC-2026-0893'],
            [
                'user_id' => $student2->id,
                'brevet_id' => 'brevet-c',
                'batch_id' => $batchC->id,
                'amount' => 3850000,
                'payment_method' => 'MANDIRI Virtual Account',
                'payment_status' => 'APPROVED',
                'progress_percentage' => 0,
                'completed_lessons' => [],
                'is_active' => true,
                'registered_date' => now()->subDays(4),
            ]
        );

        Enrollment::updateOrCreate(
            ['invoice_number' => 'INV-NAC-2026-0894'],
            [
                'user_id' => $student3->id,
                'brevet_id' => 'coretax-mastery',
                'batch_id' => $batchCore->id,
                'amount' => 1250000,
                'payment_method' => 'BCA Virtual Account',
                'payment_status' => 'APPROVED',
                'progress_percentage' => 0,
                'completed_lessons' => [],
                'is_active' => true,
                'registered_date' => now()->subDays(6),
            ]
        );

        // 4. Seed Payments (Midtrans transactions)
        $payments = [
            [
                'id' => 'PAY-2026-0892',
                'invoice_number' => 'INV-NAC-2026-0892',
                'user_id' => $student1->id,
                'student_name' => 'Dimas Anindito Pratama',
                'student_email' => 'dimas.pratama@gmail.com',
                'student_phone' => '+62 812-8890-4123',
                'brevet_id' => 'brevet-ab',
                'brevet_title' => 'Brevet Pajak A & B Terpadu',
                'amount' => 2750000,
                'payment_method' => 'QRIS (GoPay / ShopeePay / Bank Apps)',
                'payment_type' => 'qris',
                'transaction_id' => 'tr-midtrans-88921',
                'transaction_status' => 'settlement',
                'fraud_status' => 'accept',
                'transaction_time' => now()->subDays(2),
                'settlement_time' => now()->subDays(2),
                'approved_at' => now()->subDays(2),
                'status' => 'APPROVED',
                'notes' => 'Pembayaran via Midtrans QRIS Dinamis',
            ],
            [
                'id' => 'PAY-2026-0893',
                'invoice_number' => 'INV-NAC-2026-0893',
                'user_id' => $student2->id,
                'student_name' => 'Siti Sarah Nurhaliza',
                'student_email' => 'sarah.nurhaliza@taxcorp.id',
                'student_phone' => '+62 813-1122-3344',
                'brevet_id' => 'brevet-c',
                'brevet_title' => 'Brevet Pajak C Eksekutif',
                'amount' => 3850000,
                'payment_method' => 'MANDIRI Virtual Account',
                'payment_type' => 'echannel',
                'transaction_id' => 'tr-midtrans-88932',
                'transaction_status' => 'settlement',
                'fraud_status' => 'accept',
                'transaction_time' => now()->subDays(2)->addHours(2),
                'settlement_time' => now()->subDays(2)->addHours(2),
                'approved_at' => now()->subDays(2)->addHours(2),
                'status' => 'APPROVED',
                'notes' => 'Pembayaran via Mandiri Bill Payment',
            ],
            [
                'id' => 'PAY-2026-0894',
                'invoice_number' => 'INV-NAC-2026-0894',
                'user_id' => $student3->id,
                'student_name' => 'Muhammad Faisal Reza',
                'student_email' => 'faisal.reza@gmail.com',
                'student_phone' => '+62 856-7788-9900',
                'brevet_id' => 'coretax-mastery',
                'brevet_title' => 'Mastery & Simulasi Coretax DJP',
                'amount' => 1250000,
                'payment_method' => 'BCA Virtual Account',
                'payment_type' => 'bank_transfer',
                'transaction_id' => 'tr-midtrans-88943',
                'transaction_status' => 'settlement',
                'fraud_status' => 'accept',
                'transaction_time' => now()->subDay(),
                'settlement_time' => now()->subDay(),
                'approved_at' => now()->subDay(),
                'status' => 'APPROVED',
                'notes' => 'Pembayaran via Midtrans BCA VA',
            ],
        ];

        foreach ($payments as $p) {
            Payment::updateOrCreate(['id' => $p['id']], $p);
        }

        // 5. Seed Certificates from database/data/certificates_data.json
        $certsJsonPath = database_path('data/certificates_data.json');
        if (file_exists($certsJsonPath)) {
            $json = json_decode(file_get_contents($certsJsonPath), true);
            $certs = $json['data'] ?? [];
            foreach ($certs as $c) {
                Certificate::updateOrCreate(
                    ['certificate_id' => $c['certificate_id']],
                    [
                        'user_id' => $student1->id,
                        'recipient_name' => $c['recipient_name'],
                        'course_title' => $c['course_title'],
                        'issue_date' => $c['issue_date'],
                        'expiry_date' => $c['expiry_date'] ?? 'Seumur Hidup',
                        'grade' => $c['grade'],
                        'score' => $c['score'],
                        'director_name' => $c['director_name'],
                        'status' => $c['status'] ?? 'VALID',
                        'verification_url' => $c['verification_url'] ?? null,
                    ]
                );
            }
        }

        // 6. Seed Materials for Teacher
        Material::updateOrCreate(
            ['title' => 'Modul 1: Ketentuan Umum Perpajakan & Coretax'],
            [
                'brevet_id' => 'brevet-ab',
                'target_module' => 'Modul 1: Ketentuan Umum Perpajakan (KUP)',
                'file_type' => 'PDF',
                'created_date_text' => 'Diunggah 10 Okt 2026',
                'status' => 'Tersedia untuk Mahasiswa',
            ]
        );

        Material::updateOrCreate(
            ['title' => 'Modul 2: Spreadsheet Hitung PPh 21 Skema TER'],
            [
                'brevet_id' => 'brevet-ab',
                'target_module' => 'Modul 2: PPh 21/26 Skema TER PP 58/2023',
                'file_type' => 'Excel',
                'created_date_text' => 'Diunggah 12 Okt 2026',
                'status' => 'Tersedia untuk Mahasiswa',
            ]
        );

        // 7. Seed Submissions for Teacher Dashboard
        Submission::updateOrCreate(
            ['id' => 'sub-01'],
            [
                'student_name' => 'Dimas Anindito Pratama',
                'course' => 'Brevet AB Terpadu',
                'task' => 'Kertas Kerja Rekonsiliasi Fiskal Positif & Negatif (Modul 5)',
                'submitted_at' => 'Hari ini, 09:40 WIB',
                'file_size' => 'Excel • 1.4 MB',
                'status' => 'PENDING',
            ]
        );

        Submission::updateOrCreate(
            ['id' => 'sub-02'],
            [
                'student_name' => 'Siti Sarah Nurhaliza',
                'course' => 'Brevet C Eksekutif',
                'task' => 'Analisis Kesebandingan TP Documentation PMK 172/2023',
                'submitted_at' => 'Kemarin, 16:15 WIB',
                'file_size' => 'PDF • 2.8 MB',
                'status' => 'PENDING',
            ]
        );

        Submission::updateOrCreate(
            ['id' => 'sub-03'],
            [
                'student_name' => 'Muhammad Faisal Reza',
                'course' => 'Simulasi Coretax DJP',
                'task' => 'Laporan SPT Masa PPN 1111 Terintegrasi e-Faktur',
                'submitted_at' => '12 Okt 2026',
                'file_size' => 'PDF • 1.1 MB',
                'status' => 'PENDING',
            ]
        );

        // 8. Seed Master Email Templates
        $this->call(EmailTemplateSeeder::class);

        // 8.5 Seed Company Profile Singleton (Cached)
        CompanyProfile::updateOrCreate(
            ['id' => 1],
            CompanyProfile::defaultAttributes()
        );
        CompanyProfile::flushCache();

        // 9. Seed Initial Blog & Tax Insights Articles (9 Comprehensive Tax Articles)
        $initialBlogs = [
            [
                'slug' => 'panduan-praktis-pph-21-skema-ter-pp-58-2023-pmk-168-2023',
                'title' => 'Panduan Praktis Perhitungan PPh 21 Skema TER PP 58/2023 & PMK 168/2023',
                'excerpt' => 'Pahami cara menghitung PPh Pasal 21 pegawai tetap masa pajak Januari s.d. November menggunakan Tabel Tarif Efektif Rata-rata (TER) dan rekonsiliasi masa Desember.',
                'category' => 'PPh 21 & Pemotongan',
                'image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Kertas Kerja Excel Simulator PPh 21 TER (PP 58/2023).xlsx',
                'read_time' => '7 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['PPh 21', 'Skema TER', 'PP 58/2023', 'PMK 168/2023', 'Payroll Tax'],
                'status' => 'PUBLISHED',
                'is_featured' => true,
                'views_count' => 842,
                'published_at' => now()->subDays(18),
                'content' => "Pemerintah resmi menyederhanakan mekanisme pemotongan Pajak Penghasilan Pasal 21 (PPh 21) melalui penerbitan Peraturan Pemerintah Nomor 58 Tahun 2023 (PP 58/2023) dan aturan pelaksanaannya dalam PMK Nomor 168 Tahun 2023.\n\n### 1. Apa Itu Tarif Efektif Rata-Rata (TER)?\nSkema TER dirancang untuk mempermudah pemberi kerja dalam melakukan pemotongan PPh 21 pada masa pajak Januari hingga November. Sebelumnya, praktisi payroll harus menyetahunkan penghasilan bruto dan mengurangkan biaya jabatan serta PTKP setiap bulan. Kini, cukup mengalikan **Penghasilan Bruto Bulanan** dengan tarif tunggal pada lapisan **TER Kategori A, B, atau C** sesuai status PTKP pegawai.\n\n> Catatan Penting: Penerapan Tarif Efektif Rata-rata (TER) hanya mengubah cara pemotongan bulanan masa Januari s.d. November, namun total beban pajak setahun penuh tetap dihitung menggunakan tarif Pasal 17 UU HPP pada masa Desember.\n\n### 2. Pengelompokan Kategori TER Bulanan\n- **Kategori TER A**: Berlaku untuk status PTKP TK/0 (Rp54 juta), TK/1, dan K/0 (Rp58,5 juta).\n- **Kategori TER B**: Berlaku untuk status PTKP TK/2, TK/3, K/1, dan K/2 (Rp63 juta s.d. Rp67,5 juta).\n- **Kategori TER C**: Berlaku untuk status PTKP K/3 (Rp72 juta).\n\n### 3. Mekanisme Perhitungan Masa Pajak Terakhir (Desember)\nPenting untuk dipahami bahwa penerapan TER **tidak menambah beban pajak tahunan** bagi Wajib Pajak Orang Pribadi. Pada masa pajak Desember (atau masa pajak terakhir bagi pegawai yang berhenti bekerja di tengah tahun), pemberi kerja tetap wajib menghitung kembali PPh 21 terutang setahun penuh menggunakan **Tarif Pasal 17 ayat (1) huruf a UU HPP**.\n\nSelisih antara PPh 21 setahun penuh (Pasal 17) dikurangi akumulasi PPh 21 yang telah dipotong pada masa Januari s.d. November (TER) merupakan PPh 21 yang wajib dipotong atau dikembalikan (jika lebih potong) pada masa Desember.\n\n### 4. Rekomendasi Praktis bagi Tim HR & Tax\n1. Pastikan pemutakhiran data status tanggungan keluarga (PTKP) seluruh karyawan dilakukan pada awal tahun takwim.\n2. Perhatikan komponen natura dan/atau kenikmatan (PMK 66/2023) yang melampaui batasan tertentu karena wajib digabungkan ke dalam penghasilan bruto objek TER bulan berjalan.\n3. Siapkan simulasi proyeksi bonus/THR agar karyawan memahami dampak lonjakan lapisan TER pada bulan diterimanya penghasilan tidak teratur.",
            ],
            [
                'slug' => 'kesiapan-wajib-pajak-badan-menghadapi-implementasi-coretax-system-djp',
                'title' => 'Kesiapan Wajib Pajak Badan Menghadapi Implementasi Coretax System DJP',
                'excerpt' => 'Perubahan mekanisme Faktur Pajak Baru, integrasi Buku Besar Wajib Pajak (Taxpayer Ledger), manajemen Role Access (Impersonating), dan automasi SPT Unifikasi.',
                'category' => 'Coretax DJP',
                'image_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Checklist Migrasi & Role Access Coretax Wajib Pajak Badan.pdf',
                'read_time' => '8 Menit Baca',
                'author_name' => 'dr. Hendra Wijaya, M.Si., BKP',
                'author_role' => 'Senior Tax Specialist & Instruktur Coretax',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                'tags' => ['Coretax DJP', 'PSIA', 'Taxpayer Ledger', 'e-Faktur', 'Wajib Pajak Badan'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 689,
                'published_at' => now()->subDays(15),
                'content' => "Pembaruan Sistem Inti Administrasi Perpajakan (PSIAP) atau **Coretax Administration System** membawa transformasi digital terbesar dalam sejarah Direktorat Jenderal Pajak. Seluruh layanan yang sebelumnya terpisah—seperti DJP Online, e-Faktur Desktop, e-Bupot Unifikasi, hingga e-PBK—kini disatukan dalam satu portal terintegrasi.\n\n### 1. Konsep Representasi & Impersonating (Wakil/Kuasa)\nDalam arsitektur Coretax, akun **Wajib Pajak Badan** tidak lagi diakses menggunakan satu kata sandi bersama yang dibagi-bagikan ke banyak staf pajak. Setiap Pengurus (Direksi), Staf Pajak Internal, maupun Konsultan Pajak Terdaftar wajib login menggunakan **NIK / NPWP 16 Digit pribadi** masing-masing, lalu menggunakan fitur **Impersonating** sesuai *Role Access* yang didelegasikan oleh PIC Utama perusahaan (misalnya: *Drafter* Faktur, *Signer* Bupot, atau *Approver* SPT).\n\n> Prinsip Keamanan Coretax: Setiap tanda tangan elektronik pada Faktur Pajak maupun Bukti Potong dilakukan oleh orang pribadi yang diberi wewenang sah melalui mekanisme Role Access dan Sertifikat Elektronik Pribadi.\n\n### 2. Buku Besar Wajib Pajak (Taxpayer Ledger) & Deposit Pajak\nCoretax memperkenalkan fitur **Taxpayer Ledger** yang mencatat seluruh hak dan kewajiban perpajakan secara *real-time* layaknya rekening koran perbankan (sisi Debit untuk kewajiban/tagihan pajak, dan sisi Kredit untuk pembayaran, lebih bayar, atau kompensasi).\n\nMelalui instrumen **Deposit Pajak** (Kode Akun Pajak 411618), perusahaan dapat menyetorkan dana terlebih dahulu untuk kemudian dialokasikan ke berbagai jenis pajak saat SPT dilaporkan, sehingga memitigasi risiko sanksi keterlambatan setor maupun proses pemindahbukuan (Pbk) manual yang memakan waktu.\n\n### 3. Otomasi Prepopulated e-Faktur & Bukti Potong\nSeluruh Faktur Pajak Masukan dan Bukti Pemotongan PPh yang diterbitkan oleh lawan transaksi akan langsung masuk secara *prepopulated* ke draf SPT Masa PPN dan SPT Tahunan perusahaan. Oleh karena itu, rekonsiliasi ekualisasi peredaran usaha dengan PPN serta biaya dengan objek PPh Potput harus dilakukan secara disiplin setiap bulan sebelum tanggal jatuh tempo.",
            ],
            [
                'slug' => 'bedah-regulasi-pmk-172-2023-dokumentasi-transfer-pricing-tp-doc',
                'title' => 'Bedah Regulasi PMK 172/2023: Dokumentasi Transfer Pricing (Local File & Master File)',
                'excerpt' => 'Penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU / Arm\'s Length Principle) bagi grup usaha, transaksi afiliasi, dan tahapan analisis pendahuluan jasa intragrup.',
                'category' => 'Pajak Internasional',
                'image_url' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Template Ikhtisar Dokumen Induk & Dokumen Lokal PMK 172/2023.docx',
                'read_time' => '10 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['Transfer Pricing', 'PMK 172/2023', 'TP Doc', 'ALP', 'Brevet C'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 512,
                'published_at' => now()->subDays(12),
                'content' => "Terbitnya **PMK Nomor 172 Tahun 2023** mencabut dan menyatukan tiga regulasi penting sekaligus (PMK 213/2016 tentang TP Doc, PMK 49/2019 tentang MAP, dan PMK 22/2020 tentang APA). Regulasi ini mempertegas penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU) atas transaksi yang dipengaruhi hubungan istimewa.\n\n### 1. Perluasan Definisi Hubungan Istimewa\nSelain kepemilikan penyertaan modal langsung atau tidak langsung paling rendah **25%** dan penguasaan manajemen, PMK 172/2023 juga mengatur bahwa transaksi antara pihak independen pun wajib menerapkan PKKU apabila terdapat pihak afiliasi yang menetapkan lawan transaksi dan harga transaksi (*non-arm's length arrangement*).\n\n### 2. Kriteria Wajib Menyusun TP Doc (Master File & Local File)\nWajib Pajak yang melakukan transaksi afiliasi wajib menyelenggarakan dan menyimpan Dokumen Penentuan Harga Transfer (Dokumen Induk & Dokumen Lokal) apabila memenuhi salah satu ambang batas berikut pada tahun pajak sebelumnya:\n- Nilai peredaran bruto lebih dari **Rp50 Miliar**;\n- Nilai transaksi afiliasi barang berwujud lebih dari **Rp20 Miliar**;\n- Nilai transaksi afiliasi jasa, bunga, royalti, atau transaksi lainnya lebih dari **Rp5 Miliar**; atau\n- Transaksi dilakukan dengan pihak afiliasi yang berada di negara/yurisdiksi dengan tarif PPh Badan lebih rendah dari tarif Pasal 17 UU PPh (22%).\n\n### 3. Batas Waktu Ketersediaan & Permintaan DJP\nDokumen Induk (*Master File*) dan Dokumen Lokal (*Local File*) wajib tersedia paling lama **4 (empat) bulan** setelah akhir Tahun Pajak dan wajib disampaikan paling lama **1 (satu) bulan** sejak diminta oleh Direktur Jenderal Pajak dalam rangka pengawasan kepatuhan maupun pemeriksaan.",
            ],
            [
                'slug' => 'pajak-natura-dan-kenikmatan-pmk-66-2023-daftar-pengecualian-dan-teknis-pemotongan',
                'title' => 'Pajak Natura dan Kenikmatan PMK 66/2023: Daftar Pengecualian & Teknis Pemotongan',
                'excerpt' => 'Kupas tuntas perubahan prinsip deductible-taxable atas pemberian fasilitas kantor, batasan nilai bingkisan hari raya, kupon makan, serta fasilitas kendaraan dinas.',
                'category' => 'PPh 21 & Pemotongan',
                'image_url' => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Matriks Batasan Pengecualian Objek Pajak Natura PMK 66/2023.xlsx',
                'read_time' => '9 Menit Baca',
                'author_name' => 'dr. Hendra Wijaya, M.Si., BKP',
                'author_role' => 'Senior Tax Specialist & Instruktur Coretax',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                'tags' => ['Pajak Natura', 'PMK 66/2023', 'Fasilitas Kantor', 'Biaya Fiskal', 'UU HPP'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 618,
                'published_at' => now()->subDays(10),
                'content' => "Melalui UU HPP, PP 55/2022, dan **PMK Nomor 66 Tahun 2023**, pemerintah menerapkan prinsip simetri fiskal (*deductible bagi pemberi kerja, taxable bagi penerima*) atas penggantian atau imbalan sehubungan dengan pekerjaan atau jasa yang diberikan dalam bentuk **natura dan/atau kenikmatan**.\n\n### 1. Biaya Natura yang Dapat Dikurangkan secara Fiskal (Deductible Expense)\nSepanjang biaya penggantian atau imbalan dalam bentuk natura dan kenikmatan berkaitan dengan kegiatan **Mendapatkan, Menagih, dan Memelihara (3M) penghasilan**, maka biaya tersebut kini dapat dibebankan sebagai pengurang penghasilan bruto PPh Badan oleh pemberi kerja.\n\n### 2. Lima Kelompok Natura yang Dikecualikan dari Objek PPh\nTidak semua fasilitas kantor dipajaki. PMK 66/2023 mengecualikan lima kelompok utama berikut:\n- **Makanan dan Minuman bagi Seluruh Pegawai**: Disediakan di tempat kerja, atau kupon makan bagi pegawai dinas luar dengan batasan maksimal **Rp2.000.000 per bulan** (atau senilai yang disediakan di kantor mana yang lebih tinggi).\n- **Natura karena Keharusan Pelaksanaan Pekerjaan**: Seragam keamanan, alat pelindung diri (APD), antar-jemput kru kapal/pesawat.\n- **Natura di Daerah Tertentu**: Tempat tinggal, layanan kesehatan, dan pendidikan di lokasi penugasan yang ditetapkan berstatus daerah terpencil.\n- **Bingkisan Hari Raya Keagamaan**: Bebas pajak sepenuhnya untuk Idulfitri, Natal, Nyepi, Waisak, dan Tahun Baru Imlek tanpa batasan nilai; sedangkan bingkisan selain hari raya keagamaan bebas pajak hingga akumulasi **Rp3.000.000 per tahun**.\n- **Fasilitas Kerja & Kendaraan Dinas**: Laptop, ponsel, dan internet penunjang kerja bebas pajak; fasilitas kendaraan dari pemberi kerja bebas pajak apabila pegawai **tidak memiliki penyertaan modal** dan rata-rata penghasilan bruto **tidak melebihi Rp100.000.000 per bulan**.\n\n### 3. Tata Cara Penilaian & Saat Pemotongan\nUntuk **natura** (barang selain uang), nilai objek dihitung berdasarkan **nilai pasar**, sedangkan untuk **kenikmatan** (fasilitas layanan), dinilai berdasarkan **jumlah biaya yang dikeluarkan atau seharusnya dikeluarkan** oleh pemberi kerja setelah dikurangi porsi penyusutan atau amortisasi yang relevan.",
            ],
            [
                'slug' => 'strategi-menghadapi-sp2dk-dan-pemeriksaan-pajak-pasca-integrasi-data-nik-npwp',
                'title' => 'Strategi Menghadapi SP2DK & Pemeriksaan Pajak Pasca Integrasi Data NIK-NPWP',
                'excerpt' => 'Langkah mitigasi risiko kepatuhan atas Surat Permintaan Penjelasan atas Data dan/atau Keterangan (SP2DK) berdasarkan SE-05/PJ/2022 serta teknik ekualisasi SPT.',
                'category' => 'KUP & Sengketa Pajak',
                'image_url' => 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Format Standar Surat Tanggapan & Kertas Kerja Ekualisasi SP2DK.docx',
                'read_time' => '9 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['SP2DK', 'Pemeriksaan Pajak', 'SE-05/PJ/2022', 'Ekualisasi Pajak', 'KUP'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 740,
                'published_at' => now()->subDays(7),
                'content' => "Dengan berlakunya pemadanan **NIK sebagai NPWP** serta pertukaran informasi keuangan otomatis (*Automatic Exchange of Information* / AEoI), algoritma *Compliance Risk Management* (CRM) Direktorat Jenderal Pajak mampu mendeteksi ketidaksesuaian antara profil harta, mutasi rekening, dan pelaporan SPT secara jauh lebih presisi.\n\n### 1. Memahami Karakteristik SP2DK (SE-05/PJ/2022)\n**SP2DK** (Surat Permintaan Penjelasan atas Data dan/atau Keterangan) bukanlah Surat Perintah Pemeriksaan (SP2), melainkan instrumen pengawasan kepatuhan material oleh Account Representative (AR) di KPP. Wajib Pajak diberikan waktu **paling lama 14 (empat belas) hari kalender** sejak tanggal kirim/terima SP2DK untuk menyampaikan penjelasan tertulis maupun menghadiri pembahasan langsung.\n\n> Kunci Utama Merespons SP2DK: Jangan pernah mengabaikan SP2DK. Tanggapan yang terstruktur, didukung bukti kontrak, rekening koran yang telah direkonsiliasi, serta kertas kerja ekualisasi dapat menghentikan eskalasi SP2DK ke tahap Pemeriksaan Khusus.\n\n### 2. Tiga Titik Rawan Pemicu SP2DK Korporasi\n- **Selisih Ekualisasi Peredaran Usaha PPh Badan vs DPP PPN Keluaran**: Sering terjadi akibat uang muka pelanggan (*down payment*), beda waktu pengakuan pendapatan akuntansi vs penerbitan Faktur Pajak, atau selisih kurs BI vs kurs KMK.\n- **Selisih Beban Gaji/Jasa pada Laporan Laba Rugi vs Objek PPh Pasal 21/23/26/4(2)**: Disebabkan adanya biaya yang belum jatuh tempo pemotongannya atau komponen non-objek pajak yang belum dirinci dalam kertas kerja.\n- **Mutasi Kredit Rekening Bank Lebih Besar dari Omzet**: Banyak mutasi masuk yang sebenarnya merupakan pencairan pinjaman bank, transfer antar-rekening sendiri (*overbooking*), atau setoran modal yang wajib dibuktikan dengan dokumen pendukung.\n\n### 3. Tahapan Menyusun Tanggapan SP2DK yang Kuat\n1. Petakan setiap tabel data pemicu yang tercantum dalam lampiran SP2DK.\n2. Susun **Kertas Kerja Rekonsiliasi** yang menjembatani angka menurut fiskus dengan angka menurut pembukuan Wajib Pajak.\n3. Apabila terdapat kekhilafan pelaporan yang nyata, lakukan pembetulan SPT secara sukarela disertai pembayaran sanksi bunga Pasal 8 ayat (2) UU KUP yang jauh lebih ringan dibandingkan sanksi pemeriksaan.",
            ],
            [
                'slug' => 'teknik-rekonsiliasi-fiskal-pph-badan-dan-penyusunan-kertas-kerja-spt-1771',
                'title' => 'Teknik Rekonsiliasi Fiskal PPh Badan & Penyusunan Kertas Kerja SPT Tahunan 1771',
                'excerpt' => 'Panduan sistematis mengidentifikasi koreksi fiskal positif dan negatif, aturan penyusutan bangunan permanen UU HPP, serta batasan biaya promosi dan entertainment.',
                'category' => 'PPh Badan & Rekonsiliasi',
                'image_url' => 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Kertas Kerja Rekonsiliasi Fiskal & Lampiran SPT 1771.xlsx',
                'read_time' => '11 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['PPh Badan', 'Rekonsiliasi Fiskal', 'SPT 1771', 'Koreksi Fiskal', 'Penyusutan Fiskal'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 605,
                'published_at' => now()->subDays(6),
                'content' => "Penyusunan SPT Tahunan PPh Wajib Pajak Badan tidak dimulai dari pengisian formulir, melainkan dari penyusunan **Kertas Kerja Rekonsiliasi Fiskal** yang menyesuaikan Laba/Rugi Komersial (SAK) menjadi Penghasilan Neto Fiskal sesuai ketentuan UU PPh dan UU HPP.\n\n### 1. Membedakan Koreksi Fiskal Beda Tetap dan Beda Waktu\n- **Beda Tetap (Permanent Difference)**: Penghasilan atau biaya yang diakui secara komersial namun secara permanen tidak diakui secara fiskal (atau dikenakan PPh Final). Contoh: penghasilan bunga deposito (Pasal 4 ayat 2), sumbangan yang tidak memenuhi syarat PP 93/2010, dan sanksi administrasi perpajakan (Pasal 9 ayat 1 huruf k).\n- **Beda Waktu (Temporary Difference)**: Perbedaan periode pengakuan antara akuntansi dan pajak yang melahirkan pajak tangguhan (*deferred tax*). Contoh: perbedaan masa manfaat penyusutan aset tetap serta pembebanan pencadangan piutang tak tertagih di luar industri perbankan/asuransi.\n\n### 2. Syarat Mutlak Biaya Promosi & Entertainment agar Deductible\nBanyak Wajib Pajak mengalami koreksi positif saat pemeriksaan hanya karena kelengkapan administrasi:\n- **Biaya Entertainment / Jamuan Tamu (SE-27/PJ.22/1986)**: Wajib dilampiri **Daftar Nominatif Entertainment** yang memuat nomor urut, tanggal, nama & tempat entertainment, alamat, jumlah, serta relasi usaha (nama, posisi, nama perusahaan, jenis usaha).\n- **Biaya Promosi (PMK 02/PMK.03/2010)**: Wajib dibuatkan **Daftar Nominatif Biaya Promosi** dan dilampirkan saat pelaporan SPT Tahunan PPh Badan, serta dipastikan telah dilakukan pemotongan PPh 21/23 apabila berbentuk hadiah atau jasa event organizer.\n\n### 3. Ketentuan Baru Penyusutan Bangunan Permanen (PMK 72/2023)\nPasca UU HPP, apabila bangunan permanen memiliki masa manfaat sebenarnya lebih dari 20 tahun, Wajib Pajak kini diberikan opsi untuk menyusutkan sesuai masa manfaat sebenarnya berdasarkan pembukuan Wajib Pajak, dengan syarat menyampaikan pemberitahuan kepada DJP.",
            ],
            [
                'slug' => 'kupas-tuntas-ppn-12-persen-dan-manajemen-kredit-pajak-masukan-di-era-coretax',
                'title' => 'Kupas Tuntas PPN & Manajemen Kredit Pajak Masukan di Era Coretax DJP',
                'excerpt' => 'Strategi mengamankan hak pengkreditan Pajak Masukan, ketentuan Faktur Pajak tidak lengkap, fasilitas PPN Dibebaskan vs Tidak Dipungut, dan mitigasi sanksi Pasal 14 ayat (4) KUP.',
                'category' => 'PPN & e-Faktur',
                'image_url' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => null,
                'attachment_name' => null,
                'read_time' => '8 Menit Baca',
                'author_name' => 'dr. Hendra Wijaya, M.Si., BKP',
                'author_role' => 'Senior Tax Specialist & Instruktur Coretax',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                'tags' => ['PPN', 'Faktur Pajak', 'Pajak Masukan', 'PKP', 'UU HPP'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 480,
                'published_at' => now()->subDays(4),
                'content' => "Pajak Pertambahan Nilai (PPN) merupakan jenis pajak tidak langsung yang sangat menitikberatkan pada ketertiban administrasi **Faktur Pajak**. Kesalahan penentuan saat pembuatan Faktur Pajak maupun ketidaklengkapan identitas pembeli dapat berujung pada sanksi denda maupun koreksi Pajak Masukan.\n\n### 1. Tiga Saat Pembuatan Faktur Pajak yang Wajib Dipatuhi\nPengusaha Kena Pajak (PKP) wajib membuat Faktur Pajak pada:\n1. Saat penyerahan Barang Kena Pajak (BKP) dan/atau Jasa Kena Pajak (JKP);\n2. Saat penerimaan pembayaran dalam hal penerimaan pembayaran terjadi **sebelum** penyerahan BKP/JKP (uang muka / termin); atau\n3. Saat penerimaan pembayaran termin dalam hal penyerahan sebagian tahap pekerjaan.\n\n### 2. Perbedaan Fundamental Kode Faktur 07 (Tidak Dipungut) vs 08 (Dibebaskan)\n Pemahaman atas kode transaksi ini sangat krusial bagi arus kas perusahaan:\n- **Kode 07 (PPN Tidak Dipungut)**: Pajak Masukan yang dibayar untuk perolehan BKP/JKP terkait penyerahan ini **tetap dapat dikreditkan** (contoh: penyerahan ke Kawasan Berikat atau proyek pemerintah yang didanai hibah luar negeri).\n- **Kode 08 (PPN Dibebaskan)**: Pajak Masukan yang terkait dengan penyerahan BKP/JKP yang dibebaskan dari pengenaan PPN **tidak dapat dikreditkan** dan harus dibebankan sebagai biaya (*cost*) sesuai Pasal 16B ayat (3) UU PPN.\n\n### 3. Validasi Otomatis Faktur Pajak di Sistem Coretax\nDalam sistem Coretax DJP, pembuatan Faktur Pajak dilakukan langsung secara *web-based* atau melalui saluran *Host-to-Host* (PJAP/API) tanpa perlu lagi meminta jatah Nomor Seri Faktur Pajak (NSFP) secara manual. Nomor seri akan digenerate secara otomatis dan terpusat oleh sistem DJP begitu draf Faktur Pajak di-*approve* oleh *Signer* yang berwenang.",
            ],
            [
                'slug' => 'panduan-rasio-utang-terhadap-modal-der-4-banding-1-dan-koreksi-biaya-bunga-pmk-169',
                'title' => 'Panduan Rasio Utang terhadap Modal (DER 4:1) & Koreksi Biaya Bunga PMK 169/2015',
                'excerpt' => 'Cara menghitung rata-rata saldo utang dan modal bulanan, pengecualian sektor usaha tertentu, serta kewajiban pelaporan lampiran DER dan utang swasta luar negeri.',
                'category' => 'PPh Badan & Rekonsiliasi',
                'image_url' => 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Template Perhitungan Rata-Rata DER 4:1 (PMK 169/2015).xlsx',
                'read_time' => '7 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['DER 4:1', 'PMK 169/2015', 'Biaya Bunga', 'Thin Capitalization', 'PPh Badan'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 390,
                'published_at' => now()->subDays(2),
                'content' => "Untuk mencegah praktik penghindaran pajak melalui pembiayaan utang yang berlebihan (*thin capitalization*), Pasal 18 ayat (1) UU PPh yang diperbarui dalam UU HPP serta **PMK Nomor 169/PMK.010/2015** mengatur batasan perbandingan antara utang dan modal (*Debt to Equity Ratio* / DER) paling tinggi sebesar **4 : 1**.\n\n### 1. Komponen Utang dan Modal dalam Perhitungan DER\n- **Saldo Utang**: Meliputi saldo rata-rata pada tiap akhir bulan dari utang jangka panjang maupun utang jangka pendek, termasuk **utang dagang yang dibebani bunga**.\n- **Saldo Modal**: Meliputi rata-rata saldo tiap akhir bulan dari ekuitas sesuai standar akuntansi keuangan ditambah dengan **pinjaman tanpa bunga dari pihak yang memiliki hubungan istimewa**.\n\n### 2. Konsekuensi Apabila DER Melampaui 4:1 atau Ekuitas Negatif\nApabila rasio utang terhadap modal Wajib Pajak melampaui 4:1, maka biaya pinjaman yang dapat dikurangkan secara fiskal (*deductible*) hanyalah sebesar bagian biaya pinjaman yang sebanding dengan rasio 4:1 tersebut. Lebih lanjut, jika saldo ekuitas Wajib Pajak bernilai **nol atau negatif (defisiensi modal)**, maka **seluruh biaya pinjaman** pada tahun pajak bersangkutan tidak dapat dibebankan sebagai biaya fiskal.\n\n### 3. Kewajiban Melampirkan Laporan DER pada SPT Tahunan\nBagi Wajib Pajak Badan yang membebankan biaya bunga (terutama yang memiliki transaksi afiliasi atau utang swasta luar negeri), wajib melampirkan Kertas Kerja Perhitungan DER serta tanda terima laporan utang swasta luar negeri agar biaya bunga tidak dikoreksi seluruhnya secara formal saat pemeriksaan.",
            ],
            [
                'slug' => 'penerapan-pph-final-umkm-0-5-persen-pp-55-2022-dan-batas-omzet-bebas-pajak-500-juta',
                'title' => 'Penerapan PPh Final UMKM 0,5% PP 55/2022 & Batas Omzet Bebas Pajak Rp500 Juta',
                'excerpt' => 'Ketentuan jangka waktu penggunaan tarif final 0,5% bagi PT, CV, dan Orang Pribadi, mekanisme Surat Keterangan PP 55, serta simulasi bagian peredaran bruto tidak kena pajak.',
                'category' => 'Regulasi UU HPP',
                'image_url' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => null,
                'attachment_name' => null,
                'read_time' => '6 Menit Baca',
                'author_name' => 'dr. Hendra Wijaya, M.Si., BKP',
                'author_role' => 'Senior Tax Specialist & Instruktur Coretax',
                'author_avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                'tags' => ['PPh Final UMKM', 'PP 55/2022', 'Omzet 500 Juta', 'UU HPP', 'Wajib Pajak OP'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 525,
                'published_at' => now()->subDay(),
                'content' => "Melalui **Peraturan Pemerintah Nomor 55 Tahun 2022** sebagai aturan turunan UU HPP, pemerintah memberikan insentif signifikan bagi Wajib Pajak yang memiliki peredaran bruto tertentu (tidak melebihi **Rp4,8 Miliar** dalam satu Tahun Pajak).\n\n### 1. Fasilitas Bebas PPh atas Omzet Rp500 Juta Pertama bagi Orang Pribadi\nKhusus bagi **Wajib Pajak Orang Pribadi** pengusaha UMKM yang menggunakan skema PPh Final 0,5%, bagian peredaran bruto dari usaha sampai dengan **Rp500.000.000 (lima ratus juta rupiah) dalam 1 tahun pajak tidak dikenai Pajak Penghasilan**.\n\nArtinya, PPh Final 0,5% baru mulai disetorkan pada bulan di mana akumulasi peredaran bruto sejak Januari telah melampaui angka Rp500 juta, dan hanya dihitung dari selisih omzet di atas Rp500 juta tersebut.\n\n> Perhatian: Fasilitas bebas pajak atas omzet Rp500 juta pertama ini hanya berlaku bagi Wajib Pajak Orang Pribadi dan tidak berlaku bagi Wajib Pajak Badan (PT, CV, Firma, Koperasi, atau BUMDes).\n\n### 2. Batas Jangka Waktu Penggunaan Tarif PPh Final 0,5%\nSkema PPh Final 0,5% bersifat sementara untuk mendampingi Wajib Pajak belajar menyelenggarakan pembukuan:\n- **7 Tahun Pajak** bagi Wajib Pajak Orang Pribadi;\n- **4 Tahun Pajak** bagi Wajib Pajak Badan berbentuk CV, Firma, Koperasi, atau BUMDes; dan\n- **3 Tahun Pajak** bagi Wajib Pajak Badan berbentuk Perseroan Terbatas (PT).\n\nSetelah jangka waktu tersebut berakhir, Wajib Pajak wajib menghitung PPh terutang menggunakan tarif umum Pasal 17 (atau memanfaatkan fasilitas pengurangan tarif 50% Pasal 31E bagi Wajib Pajak Badan).",
            ],
        ];

        foreach ($initialBlogs as $blog) {
            BlogPost::updateOrCreate(['slug' => $blog['slug']], $blog);
        }
    }
}
