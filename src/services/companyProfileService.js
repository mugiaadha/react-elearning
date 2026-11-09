import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

export const DEFAULT_COMPANY_PROFILE = {
  id: 1,
  company_name: 'NAC Tax Center',
  short_name: 'NAC',
  tagline: 'Pusat Pelatihan & Sertifikasi Brevet Pajak Terakreditasi',
  description:
    'Lembaga pelatihan brevet perpajakan profesional terkemuka di Indonesia. Menyiapkan praktisi akuntansi dan perpajakan siap kerja dengan kurikulum terpadu berbasis UU Harmonisasi Peraturan Perpajakan (UU HPP) dan simulasi Coretax DJP terbaru.',
  email: 'info@nactaxcenter.id',
  admission_email: 'admisi@nactaxcenter.id',
  phone: '+62 (021) 5290-8800',
  whatsapp: '+62 812-8890-4123',
  address: 'NAC Tax Tower Lt. 8, Jl. HR Rasuna Said Kav. C-22, Kuningan, Jakarta Selatan 12920',
  city: 'Jakarta Selatan',
  website_url: 'https://nac.socket-clenicapp.my.id',
  logo_url: null,
  director_name: 'Dr. H. Hendra Kusuma, S.E., Ak., M.Ak., CA., BKP.',
  director_title: 'Direktur Eksekutif Pendidikan',
  accreditation_badge: 'Pusat Pelatihan Brevet Pajak Terakreditasi 2026',
  copyright_text: '© 2026 NAC Tax Center. Hak Cipta Dilindungi Undang-Undang.',
  social_links: {
    instagram: 'https://instagram.com/nactaxcenter',
    linkedin: 'https://linkedin.com/company/nactaxcenter',
    youtube: 'https://youtube.com/@DitjenPajakRI',
  },
};

const STORAGE_CACHE_KEY = 'nac_company_profile_cache_v1';
const STORAGE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes client-side cache

const companyProfileService = {
  /**
   * Fetch company profile from backend (with fast localStorage cache fallback)
   */
  async getProfile(forceRefresh = false) {
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(STORAGE_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.data && Date.now() - parsed.timestamp < STORAGE_CACHE_TTL_MS) {
            return parsed.data;
          }
        }
      } catch {
        // Ignore storage read error
      }
    }

    try {
      const response = await apiClient.get(ENDPOINTS.COMPANY_PROFILE);
      const profile = response.data || DEFAULT_COMPANY_PROFILE;
      try {
        localStorage.setItem(
          STORAGE_CACHE_KEY,
          JSON.stringify({ data: profile, timestamp: Date.now() })
        );
      } catch {
        // Ignore storage write error
      }
      return profile;
    } catch {
      return DEFAULT_COMPANY_PROFILE;
    }
  },

  /**
   * Admin Backoffice: Update company profile and refresh local cache
   */
  async updateProfile(payload) {
    const response = await apiClient.put(ENDPOINTS.ADMIN_COMPANY_PROFILE, payload);
    const updated = response.data || DEFAULT_COMPANY_PROFILE;
    try {
      localStorage.setItem(
        STORAGE_CACHE_KEY,
        JSON.stringify({ data: updated, timestamp: Date.now() })
      );
    } catch {
      // Ignore storage error
    }
    return updated;
  },
};

export default companyProfileService;

