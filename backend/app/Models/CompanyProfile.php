<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class CompanyProfile extends Model
{
    protected $table = 'company_profile';

    public const CACHE_KEY = 'company_profile_singleton_cache';
    public const CACHE_TTL_SECONDS = 86400; // 24 hours

    protected $fillable = [
        'company_name',
        'short_name',
        'tagline',
        'description',
        'email',
        'admission_email',
        'phone',
        'whatsapp',
        'address',
        'city',
        'website_url',
        'logo_url',
        'director_name',
        'director_title',
        'accreditation_badge',
        'copyright_text',
        'social_links',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    /**
     * Get the cached company profile singleton (creates default if table is empty).
     */
    public static function getCached(): self
    {
        try {
            return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
                if (!Schema::hasTable('company_profile')) {
                    return new self(self::defaultAttributes());
                }

                $profile = self::first();
                if (!$profile) {
                    $profile = self::create(self::defaultAttributes());
                }

                return $profile;
            });
        } catch (\Throwable $e) {
            return new self(self::defaultAttributes());
        }
    }

    /**
     * Flush the cached company profile and warm it up again.
     */
    public static function flushCache(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
        } catch (\Throwable $e) {
            // Ignore cache driver issues
        }
    }

    public static function defaultAttributes(): array
    {
        return [
            'company_name' => 'NAC Tax Center',
            'short_name' => 'NAC',
            'tagline' => 'Pusat Pelatihan & Sertifikasi Brevet Pajak Terakreditasi',
            'description' => 'Lembaga pelatihan brevet perpajakan profesional terkemuka di Indonesia. Menyiapkan praktisi akuntansi dan perpajakan siap kerja dengan kurikulum terpadu berbasis UU Harmonisasi Peraturan Perpajakan (UU HPP) dan simulasi Coretax DJP terbaru.',
            'email' => 'info@nactaxcenter.id',
            'admission_email' => 'admisi@nactaxcenter.id',
            'phone' => '+62 (021) 5290-8800',
            'whatsapp' => '+62 812-8890-4123',
            'address' => 'NAC Tax Tower Lt. 8, Jl. HR Rasuna Said Kav. C-22, Kuningan, Jakarta Selatan 12920',
            'city' => 'Jakarta Selatan',
            'website_url' => 'https://nac.socket-clenicapp.my.id',
            'logo_url' => null,
            'director_name' => 'Dr. H. Hendra Kusuma, S.E., Ak., M.Ak., CA., BKP.',
            'director_title' => 'Direktur Eksekutif Pendidikan',
            'accreditation_badge' => 'Pusat Pelatihan Brevet Pajak Terakreditasi 2026',
            'copyright_text' => '© 2026 NAC Tax Center. Hak Cipta Dilindungi Undang-Undang.',
            'social_links' => [
                'instagram' => 'https://instagram.com/nactaxcenter',
                'linkedin' => 'https://linkedin.com/company/nactaxcenter',
                'youtube' => 'https://youtube.com/@DitjenPajakRI',
            ],
        ];
    }
}

