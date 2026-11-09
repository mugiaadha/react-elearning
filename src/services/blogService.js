import apiClient from './api/apiClient';
import ENDPOINTS from './api/endpoints';

const FALLBACK_BLOGS = [
  {
    id: 1,
    slug: 'panduan-praktis-pph-21-skema-ter-pp-58-2023-pmk-168-2023',
    title: 'Panduan Praktis Perhitungan PPh 21 Skema TER PP 58/2023 & PMK 168/2023',
    excerpt:
      'Pahami cara menghitung PPh Pasal 21 pegawai tetap masa pajak Januari s.d. November menggunakan Tabel Tarif Efektif Rata-rata (TER) dan rekonsiliasi masa Desember.',
    category: 'PPh 21 & Pemotongan',
    date: '10 Okt 2026',
    readTime: '6 Menit Baca',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Kertas Kerja Excel Simulator PPh 21 TER (PP 58/2023).xlsx',
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['PPh 21', 'Skema TER', 'PP 58/2023', 'PMK 168/2023'],
    status: 'PUBLISHED',
    is_featured: true,
    views_count: 342,
    content:
      "Pemerintah resmi menyederhanakan mekanisme pemotongan Pajak Penghasilan Pasal 21 (PPh 21) melalui penerbitan Peraturan Pemerintah Nomor 58 Tahun 2023 (PP 58/2023) dan aturan pelaksanaannya dalam PMK Nomor 168 Tahun 2023.\n\n### 1. Apa Itu Tarif Efektif Rata-Rata (TER)?\nSkema TER dirancang untuk mempermudah pemberi kerja dalam melakukan pemotongan PPh 21 pada masa pajak Januari hingga November. Kini cukup mengalikan Penghasilan Bruto Bulanan dengan tarif tunggal pada lapisan TER Kategori A, B, atau C sesuai status PTKP pegawai.\n\n### 2. Mekanisme Perhitungan Masa Pajak Terakhir (Desember)\nPada masa pajak Desember, pemberi kerja tetap wajib menghitung kembali PPh 21 terutang setahun penuh menggunakan Tarif Pasal 17 ayat (1) huruf a UU HPP dikurangi akumulasi PPh 21 masa Januari s.d. November.",
  },
  {
    id: 2,
    slug: 'kesiapan-wajib-pajak-badan-menghadapi-implementasi-coretax-system-djp',
    title: 'Kesiapan Wajib Pajak Badan Menghadapi Implementasi Coretax System DJP',
    excerpt:
      'Perubahan mekanisme Faktur Pajak Baru, integrasi Buku Besar Wajib Pajak (Taxpayer Ledger), manajemen Role Access (Impersonating), dan automasi SPT Unifikasi.',
    category: 'Coretax DJP',
    date: '05 Okt 2026',
    readTime: '8 Menit Baca',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    attachment_url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    attachment_name: 'Checklist Migrasi & Role Access Coretax Wajib Pajak Badan.pdf',
    author_name: 'dr. Hendra Wijaya, M.Si., BKP',
    author_role: 'Senior Tax Specialist & Instruktur Coretax',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    tags: ['Coretax DJP', 'Taxpayer Ledger', 'e-Faktur'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 289,
    content:
      "Pembaruan Sistem Inti Administrasi Perpajakan (PSIAP) atau Coretax Administration System menyatukan seluruh layanan DJP Online, e-Faktur, dan e-Bupot ke dalam satu portal terintegrasi.\n\n### 1. Konsep Representasi & Impersonating\nSetiap Pengurus maupun Staf Pajak wajib login menggunakan NIK/NPWP 16 digit pribadi masing-masing lalu menggunakan fitur Impersonating sesuai Role Access perusahaan.\n\n### 2. Buku Besar Wajib Pajak (Taxpayer Ledger)\nMencatat seluruh hak dan kewajiban perpajakan secara real-time layaknya rekening koran serta memfasilitasi fitur Deposit Pajak.",
  },
  {
    id: 3,
    slug: 'bedah-regulasi-pmk-172-2023-dokumentasi-transfer-pricing-tp-doc',
    title: 'Bedah Regulasi PMK 172/2023: Dokumentasi Transfer Pricing (Local File & Master File)',
    excerpt:
      "Penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU / Arm's Length Principle) bagi grup usaha, transaksi afiliasi, dan tahapan analisis pendahuluan jasa intragrup.",
    category: 'Pajak Internasional',
    date: '28 Sep 2026',
    readTime: '10 Menit Baca',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    attachment_url: null,
    attachment_name: null,
    author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
    author_role: 'Managing Partner & Konsultan Pajak BKP',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    tags: ['Transfer Pricing', 'PMK 172/2023', 'TP Doc'],
    status: 'PUBLISHED',
    is_featured: false,
    views_count: 195,
    content:
      "PMK Nomor 172 Tahun 2023 mempertegas penerapan Prinsip Kewajaran dan Kelaziman Usaha (PKKU) atas transaksi yang dipengaruhi hubungan istimewa.\n\n### Kriteria Wajib Menyusun TP Doc\n1. Nilai peredaran bruto lebih dari Rp50 Miliar;\n2. Transaksi afiliasi barang berwujud lebih dari Rp20 Miliar;\n3. Transaksi afiliasi jasa, bunga, royalti, atau lainnya lebih dari Rp5 Miliar.",
  },
];

const blogService = {
  /**
   * Public: Get published blog articles
   */
  async getBlogs(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.BLOGS, { params });
      return response.data || [];
    } catch {
      return FALLBACK_BLOGS;
    }
  },

  /**
   * Public: Get single blog post detail by slug or id
   */
  async getBlogDetail(slugOrId) {
    try {
      const response = await apiClient.get(ENDPOINTS.BLOG_DETAIL(slugOrId));
      return response.data;
    } catch {
      const found =
        FALLBACK_BLOGS.find((b) => b.slug === slugOrId || String(b.id) === String(slugOrId)) ||
        FALLBACK_BLOGS[0];
      return {
        ...found,
        related_posts: FALLBACK_BLOGS.filter((b) => b.id !== found.id),
      };
    }
  },

  /**
   * Admin Backoffice: Get all blog posts (including drafts)
   */
  async getAdminBlogs() {
    const response = await apiClient.get(ENDPOINTS.ADMIN_BLOGS);
    return response.data || [];
  },

  /**
   * Admin Backoffice: Create / Upload new blog post (supports FormData for file uploads)
   */
  async createBlog(payload) {
    const isFormData = payload instanceof FormData;
    const response = await apiClient.post(
      ENDPOINTS.ADMIN_BLOGS,
      payload,
      isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined
    );
    return response.data;
  },

  /**
   * Admin Backoffice: Update existing blog post
   */
  async updateBlog(id, payload) {
    const isFormData = payload instanceof FormData;
    if (isFormData) {
      payload.append('_method', 'PUT');
      const response = await apiClient.post(ENDPOINTS.ADMIN_BLOG_DETAIL(id), payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(ENDPOINTS.ADMIN_BLOG_DETAIL(id), payload);
    return response.data;
  },

  /**
   * Admin Backoffice: Delete blog post
   */
  async deleteBlog(id) {
    const response = await apiClient.delete(ENDPOINTS.ADMIN_BLOG_DETAIL(id));
    return response.data;
  },
};

export default blogService;

