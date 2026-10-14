<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds for master email templates.
     */
    public function run(): void
    {
        $templates = [
            [
                'slug' => 'email-verification',
                'name' => 'Verifikasi Alamat Email Siswa Baru',
                'subject' => 'Kode Verifikasi Akun Anda: {{verification_code}} - {{app_name}}',
                'body_html' => <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Alamat Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #091e42 0%, #0284c7 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .brand-badge { display: inline-block; background: #f59e0b; color: #091e42; font-weight: 900; font-size: 16px; padding: 4px 12px; border-radius: 8px; margin-bottom: 8px; }
    .header h1 { margin: 8px 0 4px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 12px; opacity: 0.85; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .otp-card { background: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; margin-bottom: 6px; }
    .otp-code { font-size: 36px; font-weight: 900; font-family: monospace; color: #0284c7; letter-spacing: 8px; }
    .expiry-note { font-size: 12px; color: #e11d48; margin-top: 8px; font-weight: 600; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; margin: 16px 0; text-align: center; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .security-note { font-size: 11px; color: #94a3b8; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="brand-badge">NAC</span>
      <h1>NAC TAX CENTER</h1>
      <p>Lembaga Pendidikan & Pelatihan Sertifikasi Brevet Pajak Nasional</p>
    </div>
    <div class="content">
      <div class="greeting">Halo, {{name}}!</div>
      <p>Terima kasih telah mendaftar di <strong>{{app_name}}</strong>. Untuk memastikan validitas data pendaftaran dan mengamankan akun pembelajaran Anda, silakan gunakan kode verifikasi di bawah ini:</p>
      
      <div class="otp-card">
        <div class="otp-label">Kode Verifikasi (OTP) Anda</div>
        <div class="otp-code">{{verification_code}}</div>
        <div class="expiry-note">Berlaku selama {{expiry_minutes}} menit ke depan</div>
      </div>

      <p style="text-align: center; margin: 20px 0;">
        <a href="{{verification_url}}" class="btn">Konfirmasi Verifikasi Email Sekarang &rarr;</a>
      </p>

      <div class="security-note">
        <strong>Pemberitahuan Keamanan:</strong> Jangan berikan kode ini kepada pihak mana pun, termasuk staf {{app_name}}. Jika Anda tidak merasa mendaftar di sistem kami, silakan abaikan pesan ini.
      </div>
    </div>
    <div class="footer">
      <div>Butuh bantuan? Hubungi Sekretariat Admisi di <a href="mailto:{{support_email}}" style="color: #0284c7;">{{support_email}}</a> atau WhatsApp {{support_phone}}</div>
      <div style="margin-top: 8px;">&copy; {{year}} {{app_name}}. Seluruh hak cipta dilindungi undang-undang.</div>
    </div>
  </div>
</body>
</html>
HTML,
                'body_text' => "Halo {{name}},\n\nTerima kasih telah mendaftar di {{app_name}}.\nKode verifikasi Anda adalah: {{verification_code}}\n\nKode ini berlaku selama {{expiry_minutes}} menit.\nAtau konfirmasi via tautan berikut: {{verification_url}}\n\n© {{year}} {{app_name}}",
                'placeholders' => ['name', 'email', 'verification_code', 'verification_url', 'expiry_minutes', 'app_name', 'year', 'support_email', 'support_phone'],
                'is_active' => true,
            ],
            [
                'slug' => 'welcome-student',
                'name' => 'Selamat Datang Mahasiswa Baru',
                'subject' => 'Selamat Datang di {{app_name}} - Akun Anda Telah Aktif!',
                'body_html' => <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Selamat Datang di NAC Tax Center</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden; }
    .header { background: #091e42; padding: 28px; text-align: center; color: #ffffff; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #f59e0b;">NAC TAX CENTER</h2>
      <p style="margin: 4px 0 0; font-size: 12px;">Selamat Datang di Platform E-Learning Pajak</p>
    </div>
    <div class="content">
      <p>Halo <strong>{{name}}</strong>,</p>
      <p>Selamat! Alamat email Anda telah berhasil diverifikasi secara resmi. Akun pembelajaran Anda di {{app_name}} kini telah siap digunakan.</p>
      <p>Melalui portal ini, Anda dapat mengakses materi video, silabus studi kasus SPT Tahunan, latihan simulasi Coretax DJP, dan konsultasi interaktif bersama instruktur BKP berpengalaman.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="{{app_url}}/login" class="btn">Masuk ke Portal Pembelajaran</a>
      </div>
      <p>Salam hangat,<br><strong>Tim Admisi {{app_name}}</strong></p>
    </div>
    <div class="footer">
      &copy; {{year}} {{app_name}}. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>
HTML,
                'body_text' => "Halo {{name}},\n\nSelamat! Alamat email Anda telah berhasil diverifikasi di {{app_name}}.\nSilakan masuk ke portal: {{app_url}}/login\n\nSalam hangat,\nTim Admisi {{app_name}}",
                'placeholders' => ['name', 'email', 'app_name', 'app_url', 'year'],
                'is_active' => true,
            ],
            [
                'slug' => 'payment-approved',
                'name' => 'Pemberitahuan Pembayaran Terverifikasi & Kelas Dibuka',
                'subject' => 'Pembayaran Terverifikasi: Kelas {{brevet_title}} Telah Terbuka! - {{app_name}}',
                'body_html' => <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pembayaran Terverifikasi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #047857; padding: 28px; text-align: center; color: #ffffff; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; }
    .invoice-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background: #047857; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #ffffff;">PEMBAYARAN DIVERIFIKASI</h2>
      <p style="margin: 4px 0 0; font-size: 12px;">NAC Tax Center Indonesia</p>
    </div>
    <div class="content">
      <p>Halo <strong>{{name}}</strong>,</p>
      <p>Kabar gembira! Pembayaran pendaftaran pelatihan Anda telah berhasil diverifikasi oleh tim keuangan kami.</p>
      
      <div class="invoice-card">
        <div style="font-size: 11px; color: #15803d; font-weight: bold;">RINCIAN PENDAFTARAN:</div>
        <div style="font-size: 16px; font-weight: 800; color: #14532d; margin-top: 4px;">{{brevet_title}}</div>
        <div style="font-size: 13px; color: #166534; margin-top: 4px;">No. Invoice: <strong>{{invoice_id}}</strong></div>
        <div style="font-size: 13px; color: #166534;">Nominal: <strong>Rp {{amount}}</strong> (LUNAS)</div>
      </div>

      <p>Akses ke seluruh materi perkuliahan, bank soal, dan simulasi Coretax kini telah aktif sepenuhnya.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="{{app_url}}/dashboard/student/course/{{brevet_slug}}" class="btn">Mulai Belajar Sekarang &rarr;</a>
      </div>
    </div>
    <div class="footer">
      &copy; {{year}} {{app_name}}. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>
HTML,
                'body_text' => "Halo {{name}},\n\nPembayaran pendaftaran Anda untuk {{brevet_title}} (Invoice: {{invoice_id}}, Rp {{amount}}) telah disetujui.\nAkses ruang kelas Anda kini telah aktif di {{app_url}}/dashboard/student\n\nSalam hangat,\nTim Keuangan {{app_name}}",
                'placeholders' => ['name', 'brevet_title', 'invoice_id', 'amount', 'brevet_slug', 'app_name', 'app_url', 'year'],
                'is_active' => true,
            ],
            [
                'slug' => 'certificate-issued',
                'name' => 'Penerbitan Sertifikat Kelulusan Resmi',
                'subject' => 'Selamat! Sertifikat Kelulusan Resmi Anda Telah Terbit - {{certificate_id}}',
                'body_html' => <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Sertifikat Kelulusan Diterbitkan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #1e1b4b; padding: 28px; text-align: center; color: #ffffff; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; }
    .cert-card { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 18px; margin: 20px 0; text-align: center; }
    .btn { display: inline-block; background: #7c3aed; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #c084fc;">SELAMAT ATAS KELULUSAN ANDA!</h2>
      <p style="margin: 4px 0 0; font-size: 12px;">NAC Tax Center Indonesia</p>
    </div>
    <div class="content">
      <p>Halo <strong>{{name}}</strong>,</p>
      <p>Selamat atas pencapaian luar biasa Anda dalam menyelesaikan seluruh kurikulum <strong>{{course_title}}</strong>.</p>
      
      <div class="cert-card">
        <div style="font-size: 11px; color: #7e22ce; font-weight: bold;">NOMOR SERI SERTIFIKAT DIGITAL:</div>
        <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #581c87; margin: 6px 0;">{{certificate_id}}</div>
        <div style="font-size: 12px; color: #6b21a8;">Predikat: <strong>{{grade}}</strong> • Nilai: <strong>{{score}}</strong></div>
      </div>

      <p>Sertifikat ini telah tercatat secara permanen di basis data nasional NAC Tax Center dan dapat diverifikasi oleh publik atau calon pemberi kerja.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="{{app_url}}/verify-certificate/{{certificate_id}}" class="btn">Lihat & Verifikasi Sertifikat &rarr;</a>
      </div>
    </div>
    <div class="footer">
      &copy; {{year}} {{app_name}}. Seluruh hak cipta dilindungi.
    </div>
  </div>
</body>
</html>
HTML,
                'body_text' => "Halo {{name}},\n\nSelamat atas kelulusan Anda di {{course_title}}!\nNomor Seri Sertifikat: {{certificate_id}}\nPredikat: {{grade}}\n\nVerifikasi sertifikat di: {{app_url}}/verify-certificate/{{certificate_id}}\n\n© {{year}} {{app_name}}",
                'placeholders' => ['name', 'course_title', 'certificate_id', 'grade', 'score', 'app_name', 'app_url', 'year'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $t) {
            EmailTemplate::updateOrCreate(
                ['slug' => $t['slug']],
                $t
            );
        }
    }
}
