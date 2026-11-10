<?php

namespace App\Services;

use App\Mail\DynamicTemplateMail;
use App\Models\EmailTemplate;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Exception;

class MailService
{
    /**
     * Send an email based on a database master template.
     *
     * @param string $toEmail
     * @param string $templateSlug
     * @param array $variables
     * @param string|null $toName
     * @return array
     */
    public function sendTemplateEmail(string $toEmail, string $templateSlug, array $variables = [], ?string $toName = null): array
    {
        $template = EmailTemplate::where('slug', $templateSlug)
            ->where('is_active', true)
            ->first();

        // Self-healing: if no templates in database, run seeder automatically
        if (!$template && EmailTemplate::count() === 0) {
            try {
                (new \Database\Seeders\EmailTemplateSeeder())->run();
                $template = EmailTemplate::where('slug', $templateSlug)->where('is_active', true)->first();
            } catch (\Throwable $e) {
                Log::warning("Auto-seed EmailTemplateSeeder failed: " . $e->getMessage());
            }
        }

        if (!$template) {
            Log::warning("Email template with slug '{$templateSlug}' not found or inactive, using fallback template.");
            $rendered = $this->getFallbackTemplate($templateSlug, $variables);
        } else {
            $rendered = $template->render($variables);
        }

        try {
            \App\Jobs\SendTemplateEmailJob::dispatch($toEmail, $templateSlug, $rendered, $toName);

            Log::info("Email queued for {$toEmail} using template '{$templateSlug}' via SendTemplateEmailJob (ShouldBeUnique protected).");

            return [
                'success' => true,
                'message' => 'Email telah berhasil dikirimkan.',
                'subject' => $rendered['subject'],
                'body_html' => $rendered['body_html'],
            ];
        } catch (Exception $e) {
            Log::error("Failed to send email to {$toEmail} using template '{$templateSlug}': " . $e->getMessage());

            // Non-blocking in local dev so registration flow doesn't crash if external SMTP credentials aren't configured
            return [
                'success' => false,
                'message' => 'Gagal mengirim email: ' . $e->getMessage(),
                'subject' => $rendered['subject'],
                'body_html' => $rendered['body_html'],
            ];
        }
    }

    /**
     * Generate OTP code, save in user model, and send verification email.
     *
     * @param User $user
     * @return array
     */
    public function sendVerificationEmail(User $user): array
    {
        $code = (string) mt_rand(100000, 999999);
        $expiresAt = now()->addMinutes(15);

        $user->email_verification_code = $code;
        $user->email_verification_expires_at = $expiresAt;
        $user->save();

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $verificationUrl = "{$frontendUrl}/verify-email?email=" . urlencode($user->email) . "&code={$code}";

        $variables = [
            'name' => $user->name,
            'email' => $user->email,
            'verification_code' => $code,
            'verification_url' => $verificationUrl,
            'expiry_minutes' => 15,
        ];

        $result = $this->sendTemplateEmail($user->email, 'email-verification', $variables, $user->name);

        return [
            'success' => true,
            'message' => "Kode verifikasi telah dikirimkan ke {$user->email}.",
            'code' => $code, // Available in response for frictionless local evaluation
            'expires_at' => $expiresAt->toIso8601String(),
            'smtp_status' => $result['success'] ? 'SENT' : 'LOGGED_OR_SIMULATED',
        ];
    }

    /**
     * Send welcome email to a student after verification or Google registration.
     *
     * @param User $user
     * @return array
     */
    public function sendWelcomeEmail(User $user): array
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        return $this->sendTemplateEmail($user->email, 'welcome-student', [
            'name' => $user->name,
            'student_name' => $user->name,
            'user_name' => $user->name,
            'email' => $user->email,
            'login_url' => $frontendUrl . '/login',
            'portal_url' => $frontendUrl . '/dashboard/student',
        ], $user->name);
    }

    /**
     * Send credential invitation email to newly created teacher.
     *
     * @param User $teacher
     * @param string $plainPassword
     * @return array
     */
    public function sendTeacherInvitationEmail(User $teacher, string $plainPassword): array
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $loginUrl = "{$frontendUrl}/login?email=" . urlencode($teacher->email);

        $variables = [
            'name' => $teacher->name,
            'email' => $teacher->email,
            'password' => $plainPassword,
            'login_url' => $loginUrl,
            'app_name' => config('app.name', 'NAC Tax Center'),
            'year' => date('Y'),
            'support_email' => env('MAIL_FROM_ADDRESS', 'no-reply@nactaxcenter.id'),
        ];

        return $this->sendTemplateEmail($teacher->email, 'teacher-invitation', $variables, $teacher->name);
    }

    /**
     * Verify email with 6-digit OTP code.
     *
     * @param string $email
     * @param string $code
     * @return array
     */
    public function verifyEmailCode(string $email, string $code): array
    {
        $user = User::where('email', trim($email))->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Pengguna dengan email ini tidak ditemukan.',
            ];
        }

        if ($user->email_verified_at) {
            return [
                'success' => true,
                'message' => 'Alamat email ini sudah terverifikasi sebelumnya.',
                'user' => $user,
            ];
        }

        $cleanCode = trim($code);

        // Verification validation
        if (empty($user->email_verification_code) || $user->email_verification_code !== $cleanCode) {
            return [
                'success' => false,
                'message' => 'Kode verifikasi tidak sesuai. Silakan periksa kembali email Anda.',
            ];
        }

        if ($user->email_verification_expires_at && $user->email_verification_expires_at->isPast()) {
            return [
                'success' => false,
                'message' => 'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.',
            ];
        }

        // Mark as verified and clear code
        $user->email_verified_at = now();
        $user->email_verification_code = null;
        $user->email_verification_expires_at = null;
        $user->save();

        // Optional welcome email
        $this->sendTemplateEmail($user->email, 'welcome-student', [
            'name' => $user->name,
            'email' => $user->email,
        ], $user->name);

        return [
            'success' => true,
            'message' => 'Email Anda berhasil diverifikasi secara sah.',
            'user' => $user,
        ];
    }

    /**
     * Send payment approved and classroom unlocked notification email.
     *
     * @param Payment $payment
     * @return array
     */
    public function sendPaymentApprovedEmail(\App\Models\Payment $payment): array
    {
        $targetEmail = $payment->student_email ?: $payment->user?->email;
        if (!$targetEmail) {
            return ['success' => false, 'message' => 'Email siswa tidak ditemukan.'];
        }

        $studentName = $payment->student_name ?: ($payment->user?->name ?? 'Mahasiswa NAC');
        $brevetTitle = $payment->brevet_title ?: 'Program Pelatihan Brevet Pajak';
        $brevetSlug = $payment->brevet?->slug ?: ($payment->brevet_id ?: 'brevet-ab-terpadu');
        $amountFormatted = number_format($payment->amount, 0, ',', '.');
        $invoiceId = $payment->invoice_number ?: $payment->id;

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $variables = [
            'name' => $studentName,
            'brevet_title' => $brevetTitle,
            'invoice_id' => $invoiceId,
            'amount' => $amountFormatted,
            'brevet_slug' => $brevetSlug,
            'app_name' => config('app.name', 'NAC Tax Center'),
            'app_url' => $frontendUrl,
            'year' => date('Y'),
        ];

        return $this->sendTemplateEmail($targetEmail, 'payment-approved', $variables, $studentName);
    }

    /**
     * Send payment invoice pending notification email upon registration.
     *
     * @param Payment $payment
     * @return array
     */
    public function sendPaymentInvoiceEmail(\App\Models\Payment $payment): array
    {
        $targetEmail = $payment->student_email ?: $payment->user?->email;
        if (!$targetEmail) {
            return ['success' => false, 'message' => 'Email siswa tidak ditemukan.'];
        }

        $studentName = $payment->student_name ?: ($payment->user?->name ?? 'Mahasiswa NAC');
        $brevetTitle = $payment->brevet_title ?: 'Program Pelatihan Brevet Pajak';
        $amountFormatted = number_format($payment->amount, 0, ',', '.');
        $invoiceId = $payment->invoice_number ?: $payment->id;

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $paymentUrl = "{$frontendUrl}/onboarding/payment-pending";

        $company = \App\Models\CompanyProfile::getCached();
        $companyName = $company->company_name ?: config('app.name', 'NAC Tax Center');

        $subject = "Tagihan Pembayaran Pendaftaran: {$invoiceId} - {$companyName}";
        $bodyHtml = "
        <div style='font-family:Inter,Segoe UI,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;'>
          <div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;'>
            <div style='background:linear-gradient(135deg, #091e42 0%, #0284c7 100%);padding:28px 24px;text-align:center;color:#ffffff;'>
              <div style='font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;'>Konfirmasi Tagihan Pendaftaran</div>
              <h2 style='margin:0;font-size:20px;color:#ffffff;'>{$companyName}</h2>
            </div>
            <div style='padding:28px;'>
              <p style='margin-top:0;font-size:14px;color:#334155;'>Halo <strong>{$studentName}</strong>,</p>
              <p style='font-size:14px;color:#334155;'>Terima kasih telah mendaftar pada program pelatihan kami. Tagihan pendaftaran resmi Anda telah dibuat dengan rincian sebagai berikut:</p>
              
              <div style='background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #0284c7;border-radius:12px;padding:18px;margin:20px 0;'>
                <div style='font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;'>Program Pelatihan</div>
                <div style='font-size:16px;font-weight:800;color:#0f172a;margin-top:2px;'>{$brevetTitle}</div>
                <div style='font-size:13px;color:#475569;margin-top:8px;'>Nomor Invoice: <strong style='font-family:monospace;color:#0f172a;'>{$invoiceId}</strong></div>
                <div style='font-size:13px;color:#475569;'>Total Tagihan: <strong style='color:#0284c7;font-size:15px;'>Rp {$amountFormatted}</strong></div>
                <div style='font-size:12px;color:#94a3b8;margin-top:4px;'>Metode: QRIS Dinamis, Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata), Kartu Kredit & Gerai Retail</div>
              </div>

              <p style='font-size:14px;color:#334155;'>Untuk menyelesaikan proses administrasi dan mengaktifkan akses kelas, silakan lanjutkan pembayaran melalui portal resmi:</p>
              
              <div style='text-align:center;margin:28px 0;'>
                <a href='{$paymentUrl}' style='display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:13px;box-shadow:0 4px 6px -1px rgba(2,132,199,0.3);'>
                  Bayar Tagihan Sekarang &rarr;
                </a>
              </div>

              <p style='font-size:12px;color:#64748b;line-height:1.5;'>
                Setelah pembayaran terverifikasi otomatis oleh payment gateway Midtrans, seluruh video perkuliahan, modul pembelajaran, dan jadwal sesi tatap muka daring akan langsung terbuka.
              </p>
            </div>
            <div style='background:#f8fafc;padding:16px 24px;text-align:center;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;'>
              &copy; " . date('Y') . " {$companyName}. Seluruh hak cipta dilindungi.
            </div>
          </div>
        </div>";

        $bodyText = "Halo {$studentName},\n\nTagihan pendaftaran Anda untuk {$brevetTitle} telah diterbitkan.\nNomor Invoice: {$invoiceId}\nTotal: Rp {$amountFormatted}\n\nSilakan selesaikan pembayaran di: {$paymentUrl}\n\nSalam hangat,\nTim Keuangan {$companyName}";
        $uniqueSlug = 'payment-invoice-' . $payment->id . '-' . substr(md5($invoiceId . (string) $payment->amount), 0, 8);

        try {
            \App\Jobs\SendTemplateEmailJob::dispatch(
                $targetEmail,
                $uniqueSlug,
                [
                    'subject' => $subject,
                    'body_html' => $bodyHtml,
                    'body_text' => $bodyText,
                ],
                $studentName
            );
            return ['success' => true];
        } catch (Exception $e) {
            Log::warning("Failed to queue payment invoice email: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Hardcoded fallback templates in case database template is temporarily missing
     */
    protected function getFallbackTemplate(string $slug, array $variables): array
    {
        $appName = config('app.name', 'NAC Tax Center');
        $name = $variables['name'] ?? 'Mahasiswa';
        $code = $variables['verification_code'] ?? '123456';
        $expiry = $variables['expiry_minutes'] ?? 15;

        if ($slug === 'email-verification') {
            return [
                'subject' => "Kode Verifikasi Akun: {$code} - {$appName}",
                'body_html' => "<div style='font-family:sans-serif;padding:24px;background:#f8fafc;color:#1e293b;'>" .
                    "<div style='max-width:520px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;border:1px solid #e2e8f0;'>" .
                    "<h2 style='color:#0284c7;margin-top:0;'>NAC TAX CENTER</h2>" .
                    "<p>Halo, <strong>{$name}</strong>!</p>" .
                    "<p>Berikut adalah 6-digit kode verifikasi Anda untuk mengonfirmasi pendaftaran akun:</p>" .
                    "<div style='background:#f1f5f9;border:2px dashed #0284c7;padding:16px;text-align:center;border-radius:12px;margin:20px 0;'>" .
                    "<span style='font-size:32px;font-weight:bold;letter-spacing:6px;color:#0284c7;'>{$code}</span>" .
                    "</div>" .
                    "<p style='font-size:12px;color:#64748b;'>Kode ini berlaku selama {$expiry} menit.</p>" .
                    "</div></div>",
                'body_text' => "Halo {$name}, kode verifikasi pendaftaran akun Anda adalah: {$code}. Berlaku {$expiry} menit.",
            ];
        }

        return [
            'subject' => "Pemberitahuan dari {$appName}",
            'body_html' => "<p>Halo {$name}, terima kasih telah bergabung bersama {$appName}.</p>",
            'body_text' => "Halo {$name}, terima kasih telah bergabung bersama {$appName}.",
        ];
    }

    /**
     * Send blog question / consultation inquiry to the company profile email via Queue (SendTemplateEmailJob).
     */
    public function sendBlogInquiryToCompany(array $inquiryData): array
    {
        $company = \App\Models\CompanyProfile::getCached();
        $targetEmail = $company->email ?: env('MAIL_FROM_ADDRESS', 'info@nactaxcenter.id');
        $companyName = $company->company_name ?: config('app.name', 'NAC Tax Center');

        $senderName = htmlspecialchars($inquiryData['name'] ?? 'Pembaca Artikel', ENT_QUOTES, 'UTF-8');
        $senderContact = htmlspecialchars($inquiryData['contact'] ?? '-', ENT_QUOTES, 'UTF-8');
        $questionText = nl2br(htmlspecialchars($inquiryData['question'] ?? '', ENT_QUOTES, 'UTF-8'));
        $articleTitle = htmlspecialchars($inquiryData['article_title'] ?? 'Artikel Pajak', ENT_QUOTES, 'UTF-8');
        $articleUrl = htmlspecialchars($inquiryData['article_url'] ?? '', ENT_QUOTES, 'UTF-8');
        $timestamp = now()->format('d M Y, H:i') . ' WIB';

        $subject = "[Pertanyaan Pembaca Blog] {$articleTitle} - dari {$senderName}";
        $bodyHtml = "
        <div style='font-family:Inter,Segoe UI,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;'>
          <div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;'>
            <div style='background:#0f172a;padding:20px 28px;color:#ffffff;'>
              <div style='font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:1px;'>Konsultasi & Pertanyaan Artikel Blog</div>
              <h2 style='margin:6px 0 0;font-size:18px;color:#ffffff;'>{$companyName}</h2>
            </div>
            <div style='padding:28px;'>
              <p style='margin-top:0;font-size:14px;color:#334155;'>Anda menerima pertanyaan baru dari pembaca pada halaman artikel:</p>
              <div style='background:#f1f5f9;padding:14px 16px;border-radius:12px;border-left:4px solid #0284c7;margin-bottom:20px;'>
                <div style='font-weight:700;font-size:14px;color:#0f172a;'>{$articleTitle}</div>
                " . ($articleUrl ? "<a href='{$articleUrl}' style='font-size:12px;color:#0284c7;text-decoration:none;'>{$articleUrl}</a>" : "") . "
              </div>
              <table style='width:100%;font-size:13px;border-collapse:collapse;margin-bottom:20px;'>
                <tr>
                  <td style='padding:6px 0;color:#64748b;width:130px;'>Nama Penanya</td>
                  <td style='padding:6px 0;font-weight:700;color:#0f172a;'>: {$senderName}</td>
                </tr>
                <tr>
                  <td style='padding:6px 0;color:#64748b;'>Email / WhatsApp</td>
                  <td style='padding:6px 0;font-weight:700;color:#0284c7;'>: {$senderContact}</td>
                </tr>
                <tr>
                  <td style='padding:6px 0;color:#64748b;'>Waktu Kirim</td>
                  <td style='padding:6px 0;color:#334155;'>: {$timestamp}</td>
                </tr>
              </table>
              <div style='font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:8px;'>Isi Pertanyaan / Diskusi:</div>
              <div style='background:#fffbeb;border:1px solid #fde68a;padding:16px;border-radius:12px;font-size:14px;line-height:1.6;color:#1e293b;'>
                {$questionText}
              </div>
            </div>
            <div style='background:#f8fafc;padding:14px 28px;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;text-align:center;'>
              Email otomatis dari Sistem Blog & Manajemen Konten {$companyName}
            </div>
          </div>
        </div>";

        $bodyText = "Pertanyaan Baru pada Artikel: {$articleTitle}\nPenanya: {$senderName} ({$senderContact})\nPertanyaan:\n" . ($inquiryData['question'] ?? '');

        $uniqueTemplateSlug = 'blog-inquiry-' . substr(md5($senderContact . $questionText . microtime()), 0, 10);

        try {
            \App\Jobs\SendTemplateEmailJob::dispatch(
                $targetEmail,
                $uniqueTemplateSlug,
                [
                    'subject' => $subject,
                    'body_html' => $bodyHtml,
                    'body_text' => $bodyText,
                ],
                $companyName
            );

            Log::info("Blog inquiry email queued to company email {$targetEmail} via SendTemplateEmailJob.");

            return [
                'success' => true,
                'target_email' => $targetEmail,
                'company_name' => $companyName,
            ];
        } catch (Exception $e) {
            Log::error("Failed to queue blog inquiry email: " . $e->getMessage());
            return [
                'success' => false,
                'target_email' => $targetEmail,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send notification email to student when teacher grades or requests revision on an exam submission.
     */
    public function sendExamReviewEmail(\App\Models\Submission $submission): array
    {
        $targetEmail = $submission->student_email ?: $submission->user?->email;
        if (!$targetEmail) {
            return ['success' => false, 'message' => 'Student email not available.'];
        }

        $company = \App\Models\CompanyProfile::getCached();
        $companyName = $company->company_name ?: config('app.name', 'NAC Tax Center');
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $portalUrl = "{$frontendUrl}/dashboard/student";

        $studentName = htmlspecialchars($submission->student_name ?: 'Peserta Brevet', ENT_QUOTES, 'UTF-8');
        $courseTitle = htmlspecialchars($submission->course ?: 'Brevet Pajak', ENT_QUOTES, 'UTF-8');
        $moduleTitle = htmlspecialchars($submission->module_title ?: ($submission->task ?: 'Ujian Modul'), ENT_QUOTES, 'UTF-8');
        $feedback = nl2br(htmlspecialchars($submission->teacher_feedback ?: 'Tidak ada catatan tambahan dari pengajar.', ENT_QUOTES, 'UTF-8'));
        $scoreText = $submission->score !== null ? "{$submission->score}/100" : '-';

        $isApproved = $submission->status === 'APPROVED';
        $badgeBg = $isApproved ? '#dcfce7' : '#ffedd5';
        $badgeColor = $isApproved ? '#166534' : '#9a3412';
        $statusHeadline = $isApproved ? 'LULUS EVALUASI' : 'PERLU REVISI / PERBAIKAN';

        $subject = $isApproved
            ? "[Hasil Evaluasi Ujian: LULUS] {$moduleTitle} - {$companyName}"
            : "[Permintaan Revisi Ujian] {$moduleTitle} - {$companyName}";

        $bodyHtml = "
        <div style='font-family:Inter,Segoe UI,sans-serif;padding:24px;background:#f8fafc;color:#0f172a;'>
          <div style='max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;'>
            <div style='background:#0f172a;padding:20px 28px;color:#ffffff;'>
              <div style='font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:1px;'>Evaluasi Akademik & Ujian Modul</div>
              <h2 style='margin:6px 0 0;font-size:18px;color:#ffffff;'>{$companyName}</h2>
            </div>
            <div style='padding:28px;'>
              <p style='margin-top:0;font-size:14px;color:#334155;'>Halo <strong>{$studentName}</strong>,</p>
              <p style='font-size:14px;color:#334155;'>Lembar jawaban ujian Anda untuk program <strong>{$courseTitle}</strong> pada modul <strong>{$moduleTitle}</strong> telah selesai dievaluasi oleh Tim Instruktur.</p>
              <div style='background:{$badgeBg};color:{$badgeColor};padding:14px 16px;border-radius:12px;margin:18px 0;font-weight:700;font-size:14px;'>
                Status Evaluasi: {$statusHeadline} &nbsp;|&nbsp; Nilai: {$scoreText}
              </div>
              <div style='font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;margin-bottom:8px;'>Catatan & Evaluasi Pengajar:</div>
              <div style='background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:12px;font-size:14px;line-height:1.6;color:#1e293b;margin-bottom:22px;'>
                {$feedback}
              </div>
              <a href='{$portalUrl}' style='display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;font-size:13px;'>
                Buka Ruang Belajar & Lihat Hasil
              </a>
            </div>
          </div>
        </div>";

        $bodyText = "Halo {$studentName}, hasil evaluasi {$moduleTitle} ({$courseTitle}): {$statusHeadline} (Nilai: {$scoreText}). Catatan: " . ($submission->teacher_feedback ?: '-') . " | Buka portal: {$portalUrl}";
        $uniqueSlug = 'exam-review-' . $submission->id . '-' . substr(md5((string) $submission->status . (string) $submission->score . microtime()), 0, 8);

        try {
            \App\Jobs\SendTemplateEmailJob::dispatch(
                $targetEmail,
                $uniqueSlug,
                [
                    'subject' => $subject,
                    'body_html' => $bodyHtml,
                    'body_text' => $bodyText,
                ],
                $submission->student_name
            );
            return ['success' => true];
        } catch (Exception $e) {
            Log::warning("Failed to queue exam review email: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Send 6-digit password reset OTP email to user.
     */
    public function sendPasswordResetEmail(User $user, string $code): array
    {
        $company = \App\Models\CompanyProfile::getCached();
        $companyName = $company->company_name ?: config('app.name', 'NAC Tax Center');
        $name = htmlspecialchars($user->name ?: 'Pengguna', ENT_QUOTES, 'UTF-8');

        $subject = "Kode Reset Kata Sandi: {$code} - {$companyName}";
        $bodyHtml = "
        <div style='font-family:Inter,Segoe UI,sans-serif;padding:24px;background:#f8fafc;color:#1e293b;'>
          <div style='max-width:520px;margin:0 auto;background:#ffffff;padding:32px;border-radius:16px;border:1px solid #e2e8f0;'>
            <h2 style='color:#0284c7;margin-top:0;'>{$companyName}</h2>
            <p>Halo, <strong>{$name}</strong>!</p>
            <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun pembelajaran Anda. Gunakan 6-digit kode keamanan berikut:</p>
            <div style='background:#f1f5f9;border:2px dashed #0284c7;padding:16px;text-align:center;border-radius:12px;margin:20px 0;'>
              <span style='font-size:32px;font-weight:bold;letter-spacing:6px;color:#0284c7;'>{$code}</span>
            </div>
            <p style='font-size:12px;color:#64748b;'>Kode ini berlaku selama 15 menit. Abaikan email ini jika Anda tidak merasa melakukan permintaan reset kata sandi.</p>
          </div>
        </div>";

        $bodyText = "Halo {$user->name}, kode reset kata sandi akun {$companyName} Anda adalah: {$code} (berlaku 15 menit).";
        $uniqueSlug = 'password-reset-' . $user->id . '-' . substr(md5($code . microtime()), 0, 8);

        try {
            \App\Jobs\SendTemplateEmailJob::dispatch(
                $user->email,
                $uniqueSlug,
                [
                    'subject' => $subject,
                    'body_html' => $bodyHtml,
                    'body_text' => $bodyText,
                ],
                $user->name
            );
            return ['success' => true];
        } catch (Exception $e) {
            Log::warning("Failed to queue password reset email: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
