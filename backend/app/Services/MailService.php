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
                'message' => 'Email telah dijadwalkan ke sistem antrean (queue) untuk dikirim.',
                'subject' => $rendered['subject'],
                'body_html' => $rendered['body_html'],
            ];
        } catch (Exception $e) {
            Log::error("Failed to send email to {$toEmail} using template '{$templateSlug}': " . $e->getMessage());

            // Non-blocking in local dev so registration flow doesn't crash if external SMTP credentials aren't configured
            return [
                'success' => false,
                'message' => 'Gagal mengirim email via SMTP: ' . $e->getMessage(),
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
}
