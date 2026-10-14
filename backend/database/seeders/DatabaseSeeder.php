<?php

namespace Database\Seeders;

use App\Models\Brevet;
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

        // 2. Seed Brevets from brevets.json if exists
        $brevetsJsonPath = base_path('../public/api/brevets.json');
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

        // 3. Seed Enrollments
        Enrollment::updateOrCreate(
            ['invoice_number' => 'INV-NAC-2026-0892'],
            [
                'user_id' => $student1->id,
                'brevet_id' => 'brevet-ab',
                'amount' => 2750000,
                'payment_method' => 'QRIS Dinamis',
                'payment_status' => 'APPROVED',
                'payment_proof_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
                'payment_notes' => 'Konfirmasi transfer QRIS untuk batch November 2026',
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
                'amount' => 3850000,
                'payment_method' => 'Transfer Bank Mandiri VA',
                'payment_status' => 'APPROVED',
                'payment_proof_url' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
                'payment_notes' => 'Pembayaran sponsorship korporasi untuk karyawan',
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
                'amount' => 1250000,
                'payment_method' => 'BCA Virtual Account',
                'payment_status' => 'APPROVED',
                'payment_proof_url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
                'payment_notes' => 'Daftar kelas intensif malam Coretax DJP',
                'progress_percentage' => 0,
                'completed_lessons' => [],
                'is_active' => true,
                'registered_date' => now()->subDays(6),
            ]
        );

        // 4. Seed Payments
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
                'payment_method' => 'QRIS Dinamis (GoPay / ShopeePay / BCA)',
                'transaction_time' => now()->subDays(2),
                'proof_image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
                'status' => 'APPROVED',
                'sender_account_name' => 'Dimas Anindito Pratama',
                'notes' => 'Konfirmasi transfer QRIS untuk batch November 2026',
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
                'payment_method' => 'Transfer Bank Mandiri VA',
                'transaction_time' => now()->subDays(2)->addHours(2),
                'proof_image_url' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
                'status' => 'APPROVED',
                'sender_account_name' => 'PT Sinergi Mandiri Corp',
                'notes' => 'Pembayaran sponsorship korporasi untuk karyawan',
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
                'transaction_time' => now()->subDay(),
                'proof_image_url' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
                'status' => 'APPROVED',
                'sender_account_name' => 'M Faisal Reza',
                'notes' => 'Daftar kelas intensif malam Coretax DJP',
            ],
        ];

        foreach ($payments as $p) {
            Payment::updateOrCreate(['id' => $p['id']], $p);
        }

        // 5. Seed Certificates
        $certsJsonPath = base_path('../public/api/certificates.json');
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
    }
}
