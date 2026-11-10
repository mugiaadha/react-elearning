<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\Contact;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ContactController extends Controller
{
    /**
     * Public: Submit consultation or contact message (protected by CAPTCHA + Honeypot)
     */
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

        // Verify CAPTCHA (token, distorted image code, and anti-bot timing)
        $captchaCheck = BlogController::verifyCaptchaChallenge($validated['captcha_token'], $validated['captcha_answer']);
        if (!$captchaCheck['valid']) {
            return response()->json([
                'success' => false,
                'message' => $captchaCheck['message'],
            ], 422);
        }

        $payload = [
            'name' => $validated['name'],
            'contact' => $validated['contact'],
            'message' => $validated['message'],
        ];
        if (Schema::hasColumn('contacts', 'status')) {
            $payload['status'] = 'UNREAD';
        }
        if (Schema::hasColumn('contacts', 'source')) {
            $payload['source'] = 'contact';
        }

        $contact = Contact::create($payload);

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

    /**
     * Admin Backoffice: List all contact & blog consultation inquiries
     */
    public function index(Request $request)
    {
        $query = Contact::orderBy('created_at', 'desc');

        $statusFilter = strtoupper(trim((string) $request->query('status', '')));
        if ($statusFilter && $statusFilter !== 'ALL' && Schema::hasColumn('contacts', 'status')) {
            $query->where('status', $statusFilter);
        }

        $search = trim((string) $request->query('q', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $items = $query->get()->map(function (Contact $item) {
            $isBlogSource = str_starts_with((string) $item->message, '[Tanya Artikel:');
            return [
                'id' => $item->id,
                'name' => $item->name,
                'contact' => $item->contact,
                'message' => $item->message,
                'status' => $item->status ?: 'UNREAD',
                'source' => $item->source ?: ($isBlogSource ? 'blog' : 'contact'),
                'replied_at' => $item->replied_at ? $item->replied_at->format('d M Y, H:i') : null,
                'created_at' => $item->created_at ? $item->created_at->format('d M Y, H:i') : '-',
                'created_iso' => $item->created_at?->toIso8601String(),
            ];
        });

        $unreadCount = Schema::hasColumn('contacts', 'status')
            ? Contact::where('status', 'UNREAD')->count()
            : Contact::count();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesan & konsultasi masuk berhasil dimuat.',
            'unread_count' => $unreadCount,
            'data' => $items,
        ]);
    }

    /**
     * Admin Backoffice: Update inquiry status (UNREAD, REPLIED, ARCHIVED)
     */
    public function updateStatus(Request $request, $id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json(['success' => false, 'message' => 'Pesan konsultasi tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:UNREAD,REPLIED,ARCHIVED',
        ]);

        if (Schema::hasColumn('contacts', 'status')) {
            $contact->status = $validated['status'];
        }
        if (Schema::hasColumn('contacts', 'replied_at')) {
            $contact->replied_at = $validated['status'] === 'REPLIED' ? now() : null;
        }
        $contact->save();

        return response()->json([
            'success' => true,
            'message' => 'Status tindak lanjut pesan berhasil diperbarui.',
            'data' => $contact,
        ]);
    }

    /**
     * Admin Backoffice: Delete contact inquiry
     */
    public function destroy($id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json(['success' => false, 'message' => 'Pesan konsultasi tidak ditemukan.'], 404);
        }

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesan konsultasi berhasil dihapus dari kotak masuk.',
        ]);
    }
}
