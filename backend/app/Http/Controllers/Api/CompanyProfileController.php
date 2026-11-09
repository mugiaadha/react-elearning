<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;

class CompanyProfileController extends Controller
{
    /**
     * Public: Get cached company profile data
     */
    public function show()
    {
        $profile = CompanyProfile::getCached();

        return response()->json([
            'success' => true,
            'message' => 'Profil perusahaan berhasil diambil.',
            'data' => $this->formatProfile($profile),
        ]);
    }

    /**
     * Backoffice Admin: Update company profile and flush cache immediately
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:30',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'email' => 'required|email|max:255',
            'admission_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:80',
            'whatsapp' => 'nullable|string|max:80',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:120',
            'website_url' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:500',
            'director_name' => 'nullable|string|max:255',
            'director_title' => 'nullable|string|max:255',
            'accreditation_badge' => 'nullable|string|max:255',
            'copyright_text' => 'nullable|string|max:255',
            'social_links' => 'nullable|array',
        ]);

        $profile = CompanyProfile::first();
        if (!$profile) {
            $profile = new CompanyProfile(CompanyProfile::defaultAttributes());
        }

        $profile->fill($validated);
        if (empty($validated['copyright_text'])) {
            $profile->copyright_text = '© ' . date('Y') . ' ' . $profile->company_name . '. Hak Cipta Dilindungi Undang-Undang.';
        }
        $profile->save();

        // Invalidate cache so subsequent calls return fresh data
        CompanyProfile::flushCache();
        $freshProfile = CompanyProfile::getCached();

        return response()->json([
            'success' => true,
            'message' => 'Profil & informasi kontak lembaga berhasil diperbarui!',
            'data' => $this->formatProfile($freshProfile),
        ]);
    }

    private function formatProfile(CompanyProfile $profile): array
    {
        return [
            'id' => $profile->id ?? 1,
            'company_name' => $profile->company_name ?: 'NAC Tax Center',
            'short_name' => $profile->short_name ?: 'NAC',
            'tagline' => $profile->tagline ?: 'Pusat Pelatihan & Sertifikasi Brevet Pajak Terakreditasi',
            'description' => $profile->description,
            'email' => $profile->email ?: 'info@nactaxcenter.id',
            'admission_email' => $profile->admission_email ?: $profile->email,
            'phone' => $profile->phone ?: '+62 (021) 5290-8800',
            'whatsapp' => $profile->whatsapp ?: '+62 812-8890-4123',
            'address' => $profile->address ?: 'NAC Tax Tower Lt. 8, Jl. HR Rasuna Said Kav. C-22, Kuningan, Jakarta Selatan 12920',
            'city' => $profile->city ?: 'Jakarta Selatan',
            'website_url' => $profile->website_url,
            'logo_url' => $profile->logo_url,
            'director_name' => $profile->director_name ?: 'Dr. H. Hendra Kusuma, S.E., Ak., M.Ak., CA., BKP.',
            'director_title' => $profile->director_title ?: 'Direktur Eksekutif Pendidikan',
            'accreditation_badge' => $profile->accreditation_badge ?: 'Pusat Pelatihan Brevet Pajak Terakreditasi 2026',
            'copyright_text' => $profile->copyright_text ?: ('© ' . date('Y') . ' ' . ($profile->company_name ?: 'NAC Tax Center') . '. Hak Cipta Dilindungi Undang-Undang.'),
            'social_links' => $profile->social_links ?: [],
        ];
    }
}
