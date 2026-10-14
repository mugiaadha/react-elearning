<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\User;
use App\Services\MailService;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    protected MailService $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

    /**
     * Send or resend verification email with OTP
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna dengan alamat email ini tidak ditemukan.',
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => true,
                'message' => 'Alamat email ini sudah terverifikasi sebelumnya.',
                'already_verified' => true,
            ]);
        }

        $result = $this->mailService->sendVerificationEmail($user);

        return response()->json([
            'success' => true,
            'message' => "Kode verifikasi email baru telah dikirimkan ke {$user->email}.",
            'code' => $result['code'], // For testing and evaluation
            'expires_at' => $result['expires_at'],
            'smtp_status' => $result['smtp_status'],
        ]);
    }

    /**
     * Verify email with 6-digit OTP
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|string',
        ]);

        $result = $this->mailService->verifyEmailCode($validated['email'], $validated['code']);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        $user = $result['user'];
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'payment_status' => $user->payment_status,
            ],
        ]);
    }

    /**
     * Master Email Templates: List all templates
     */
    public function listTemplates()
    {
        $templates = EmailTemplate::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar master template email sistem.',
            'data' => $templates,
        ]);
    }

    /**
     * Master Email Templates: Get single template detail
     */
    public function getTemplate($id)
    {
        $template = is_numeric($id)
            ? EmailTemplate::find($id)
            : EmailTemplate::where('slug', $id)->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template email tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }

    /**
     * Master Email Templates: Update template
     */
    public function updateTemplate(Request $request, $id)
    {
        $template = is_numeric($id)
            ? EmailTemplate::find($id)
            : EmailTemplate::where('slug', $id)->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template email tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'subject' => 'sometimes|string',
            'body_html' => 'sometimes|string',
            'body_text' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $template->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Template email master berhasil diperbarui.',
            'data' => $template,
        ]);
    }

    /**
     * Test sending email using SMTP and a master template
     */
    public function testSend(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'template_slug' => 'required|string',
            'variables' => 'nullable|array',
        ]);

        $variables = $validated['variables'] ?? [
            'name' => 'Pengguna Uji Coba',
            'verification_code' => '789123',
            'expiry_minutes' => 15,
            'verification_url' => url('/verify-email?code=789123'),
            'brevet_title' => 'Brevet Pajak A & B Terpadu',
            'invoice_id' => 'INV-TEST-2026',
            'amount' => '2.750.000',
            'certificate_id' => 'NAC-CERT-TEST-2026',
            'grade' => 'Sangat Memuaskan (A)',
            'score' => 95.0,
            'course_title' => 'Brevet Pajak A & B Terpadu',
        ];

        $res = $this->mailService->sendTemplateEmail(
            $validated['email'],
            $validated['template_slug'],
            $variables,
            'Tester'
        );

        return response()->json([
            'success' => $res['success'],
            'message' => $res['message'],
            'subject' => $res['subject'] ?? null,
            'smtp_mailer' => config('mail.default'),
            'smtp_host' => config('mail.mailers.smtp.host'),
            'smtp_port' => config('mail.mailers.smtp.port'),
        ]);
    }
}
