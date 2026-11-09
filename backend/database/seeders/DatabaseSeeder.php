<?php

namespace Database\Seeders;

use App\Models\Brevet;
use App\Models\BlogPost;
use App\Models\Certificate;
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

        // 9. Seed Initial Blog & Tax Insights Articles
        $initialBlogs = [
            [
                'slug' => 'panduan-praktis-pph-21-skema-ter-pp-58-2023-pmk-168-2023',
                'title' => 'Panduan Praktis Perhitungan PPh 21 Skema TER PP 58/2023 & PMK 168/2023',
                'excerpt' => 'Pahami cara menghitung PPh Pasal 21 pegawai tetap masa pajak Januari s.d. November menggunakan Tabel Tarif Efektif Rata-rata (TER) dan rekonsiliasi masa Desember.',
                'category' => 'PPh 21 & Pemotongan',
                'image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
                'attachment_name' => 'Kertas Kerja Excel Simulator PPh 21 TER (PP 58/2023).xlsx',
                'read_time' => '6 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['PPh 21', 'Skema TER', 'PP 58/2023', 'PMK 168/2023', 'Payroll Tax'],
                'status' => 'PUBLISHED',
                'is_featured' => true,
                'views_count' => 342,
                'published_at' => now()->subDays(12),
                'content' => "Pemerintah resmi menyederhanakan mekanisme pemotongan Pajak Penghasilan Pasal 21 (PPh 21) melalui penerbitan Peraturan Pemerintah Nomor 58 Tahun 2023 (PP 58/2023) dan aturan pelaksanaannya dalam PMK Nomor 168 Tahun 2023.\n\n### 1. Apa Itu Tarif Efektif Rata-Rata (TER)?\nSkema TER dirancang untuk mempermudah pemberi kerja dalam melakukan pemotongan PPh 21 pada masa pajak Januari hingga November. Sebelumnya, praktisi payroll harus menyetahunkan penghasilan bruto dan mengurangkan biaya jabatan serta PTKP setiap bulan. Kini, cukup mengalikan **Penghasilan Bruto Bulanan** dengan tarif tunggal pada lapisan **TER Kategori A, B, atau C** sesuai status PTKP pegawai.\n\n### 2. Pengelompokan Kategori TER Bulanan\n- **Kategori TER A**: Berlaku untuk status PTKP TK/0 (Rp54 juta), TK/1, dan K/0 (Rp58,5 juta).\n- **Kategori TER B**: Berlaku untuk status PTKP TK/2, TK/3, K/1, dan K/2 (Rp63 juta s.d. Rp67,5 juta).\n- **Kategori TER C**: Berlaku untuk status PTKP K/3 (Rp72 juta).\n\n### 3. Mekanisme Perhitungan Masa Pajak Terakhir (Desember)\nPenting untuk dipahami bahwa penerapan TER **tidak menambah beban pajak tahunan** bagi Wajib Pajak Orang Pribadi. Pada masa pajak Desember (atau masa pajak terakhir bagi pegawai yang berhenti bekerja di tengah tahun), pemberi kerja tetap wajib menghitung kembali PPh 21 terutang setahun penuh menggunakan **Tarif Pasal 17 ayat (1) huruf a UU HPP**.\n\nSelisih antara PPh 21 setahun penuh (Pasal 17) dikurangi akumulasi PPh 21 yang telah dipotong pada masa Januari s.d. November (TER) merupakan PPh 21 yang wajib dipotong atau dikembalikan (jika lebih potong) pada masa Desember.\n\n### 4. Rekomendasi Praktis bagi Tim HR & Tax\n1. Pastikan pemutakhiran data status tanggungan keluarga (PTKP) seluruh karyawan dilakukan pada awal tahun takwim.\n2. Perhatikan komponen natura dan/atau kenikmatan (PMK 66/2023) yang melampaui batasan tertentu karena wajib digabungkan ke dalam penghasilan bruto objek TER bulan berjalan.\n3. Siapkan simulasi proyeksi bonus/THR agar karyawan memahami dampak lonjakan lapisan TER pada bulan diterimanya penghasilan tidak teratur.",
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
                'views_count' => 289,
                'published_at' => now()->subDays(8),
                'content' => "Pembaruan Sistem Inti Administrasi Perpajakan (PSIAP) atau **Coretax Administration System** membawa transformasi digital terbesar dalam sejarah Direktorat Jenderal Pajak. Seluruh layanan yang sebelumnya terpisah—seperti DJP Online, e-Faktur Desktop, e-Bupot Unifikasi, hingga e-PBK—kini disatukan dalam satu portal terintegrasi.\n\n### 1. Konsep Representasi & Impersonating (Wakil/Kuasa)\nDalam arsitektur Coretax, akun **Wajib Pajak Badan** tidak lagi diakses menggunakan satu kata sandi bersama yang dibagi-bagikan ke banyak staf pajak. Setiap Pengurus (Direksi), Staf Pajak Internal, maupun Konsultan Pajak Terdaftar wajib login menggunakan **NIK / NPWP 16 Digit pribadi** masing-masing, lalu menggunakan fitur **Impersonating** sesuai *Role Access* yang didelegasikan oleh PIC Utama perusahaan (misalnya: *Drafter* Faktur, *Signer* Bupot, atau *Approver* SPT).\n\n### 2. Buku Besar Wajib Pajak (Taxpayer Ledger) & Deposit Pajak\nCoretax memperkenalkan fitur **Taxpayer Ledger** yang mencatat seluruh hak dan kewajiban perpajakan secara *real-time* layaknya rekening koran perbankan (sisi Debit untuk kewajiban/tagihan pajak, dan sisi Kredit untuk pembayaran, lebih bayar, atau kompensasi).\n\nMelalui instrumen **Deposit Pajak** (Kode Akun Pajak 411618), perusahaan dapat menyetorkan dana terlebih dahulu untuk kemudian dialokasikan ke berbagai jenis pajak saat SPT dilaporkan, sehingga memitigasi risiko sanksi keterlambatan setor maupun proses pemindahbukuan (Pbk) manual yang memakan waktu.\n\n### 3. Otomasi Prepopulated e-Faktur & Bukti Potong\nSeluruh Faktur Pajak Masukan dan Bukti Pemotongan PPh yang diterbitkan oleh lawan transaksi akan langsung masuk secara *prepopulated* ke draf SPT Masa PPN dan SPT Tahunan perusahaan. Oleh karena itu, rekonsiliasi ekualisasi peredaran usaha dengan PPN serta biaya dengan objek PPh Potput harus dilakukan secara disiplin setiap bulan sebelum tanggal jatuh tempo.",
            ],
            [
                'slug' => 'bedah-regulasi-pmk-172-2023-dokumentasi-transfer-pricing-tp-doc',
                'title' => 'Bedah Regulasi PMK 172/2023: Dokumentasi Transfer Pricing (Local File & Master File)',
                'excerpt' => 'Penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU / Arm\'s Length Principle) bagi grup usaha, transaksi afiliasi, dan tahapan analisis pendahuluan jasa intragrup.',
                'category' => 'Pajak Internasional',
                'image_url' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
                'attachment_url' => null,
                'attachment_name' => null,
                'read_time' => '10 Menit Baca',
                'author_name' => 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
                'author_role' => 'Managing Partner & Konsultan Pajak BKP',
                'author_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                'tags' => ['Transfer Pricing', 'PMK 172/2023', 'TP Doc', 'ALP', 'Brevet C'],
                'status' => 'PUBLISHED',
                'is_featured' => false,
                'views_count' => 195,
                'published_at' => now()->subDays(3),
                'content' => "Terbitnya **PMK Nomor 172 Tahun 2023** mencabut dan menyatukan tiga regulasi penting sekaligus (PMK 213/2016 tentang TP Doc, PMK 49/2019 tentang MAP, dan PMK 22/2020 tentang APA). Regulasi ini mempertegas penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU) atas transaksi yang dipengaruhi hubungan istimewa.\n\n### 1. Perluasan Definisi Hubungan Istimewa\nSelain kepemilikan penyertaan modal langsung atau tidak langsung paling rendah **25%** dan penguasaan manajemen, PMK 172/2023 juga mengatur bahwa transaksi antara pihak independen pun wajib menerapkan PKKU apabila terdapat pihak afiliasi yang menetapkan lawan transaksi dan harga transaksi (*non-arm's length arrangement*).\n\n### 2. Kriteria Wajib Menyusun TP Doc (Master File & Local File)\nWajib Pajak yang melakukan transaksi afiliasi wajib menyelenggarakan dan menyimpan Dokumen Penentuan Harga Transfer (Dokumen Induk & Dokumen Lokal) apabila memenuhi salah satu ambang batas berikut pada tahun pajak sebelumnya:\n- Nilai peredaran bruto lebih dari **Rp50 Miliar**;\n- Nilai transaksi afiliasi barang berwujud lebih dari **Rp20 Miliar**;\n- Nilai transaksi afiliasi jasa, bunga, royalti, atau transaksi lainnya lebih dari **Rp5 Miliar**; atau\n- Transaksi dilakukan dengan pihak afiliasi yang berada di negara/yurisdiksi dengan tarif PPh Badan lebih rendah dari tarif Pasal 17 UU PPh (22%).\n\n### 3. Batas Waktu Ketersediaan & Permintaan DJP\nDokumen Induk (*Master File*) dan Dokumen Lokal (*Local File*) wajib tersedia paling lama **4 (empat) bulan** setelah akhir Tahun Pajak dan wajib disampaikan paling lama **1 (satu) bulan** sejak diminta oleh Direktur Jenderal Pajak dalam rangka pengawasan kepatuhan maupun pemeriksaan. Ketidakpatuhan terhadap batas waktu 1 bulan tersebut mengakibatkan dokumen tidak dipertimbangkan sebagai TP Doc dan DJP berwenang menghitung kembali harga transfer secara jabatan.",
            ],
        ];

        foreach ($initialBlogs as $blog) {
            BlogPost::updateOrCreate(['slug' => $blog['slug']], $blog);
        }
    }
}
