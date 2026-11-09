<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\Contact;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        // Honeypot check (reject if hidden website_trap field is filled by automated bot)
        if (!empty($request->input('website_trap'))) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan tidak dapat diproses.',
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
            'message' => 'required|string|min:5|max:5000',
            'captcha_token' => 'required|string',
            'captcha_answer' => 'required|string|max:20',
        ]);

        // Verify CAPTCHA from backend cache
        $cacheKey = 'blog_captcha_' . $validated['captcha_token'];
        $expectedAnswer = Cache::pull($cacheKey);

        if ($expectedAnswer === null || trim($validated['captcha_answer']) !== trim((string) $expectedAnswer)) {
            return response()->json([
                'success' => false,
                'message' => 'Jawaban pertanyaan keamanan belum tepat atau sudah kedaluwarsa. Silakan hitung ulang.',
            ], 422);
        }

        $contact = Contact::create([
            'name' => $validated['name'],
            'contact' => $validated['contact'],
            'message' => $validated['message'],
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        // Dispatch email to CompanyProfile email via Queue (SendTemplateEmailJob)
        $mailService = new MailService();
        $mailService->sendBlogInquiryToCompany([
            'name' => $validated['name'],
            'contact' => $validated['contact'],
            'question' => $validated['message'],
            'article_title' => 'Formulir Hubungi Kami (Sekretariat & Layanan Korporasi)',
            'article_url' => "{$frontendUrl}/contact",
        ]);

        $company = CompanyProfile::getCached();

        return response()->json([
            'success' => true,
            'message' => "Pesan Anda telah berhasil dikirim ke sekretariat {$company->company_name} ({$company->email})! Tim kami akan segera menghubungi Anda.",
            'data' => $contact,
        ], 201);
    }
}

