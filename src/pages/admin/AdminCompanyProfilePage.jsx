import React, { useState, useEffect } from 'react';
import { useCompanyProfile } from '../../context/CompanyProfileContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Mail,
  Award,
  Save,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export const AdminCompanyProfilePage = () => {
  const { company, refreshCompanyProfile, updateCompanyProfile, loading } = useCompanyProfile();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    company_name: '',
    short_name: '',
    tagline: '',
    description: '',
    email: '',
    admission_email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    website_url: '',
    director_name: '',
    director_title: '',
    accreditation_badge: '',
    copyright_text: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setForm({
        company_name: company.company_name || '',
        short_name: company.short_name || '',
        tagline: company.tagline || '',
        description: company.description || '',
        email: company.email || '',
        admission_email: company.admission_email || '',
        phone: company.phone || '',
        whatsapp: company.whatsapp || '',
        address: company.address || '',
        city: company.city || '',
        website_url: company.website_url || '',
        director_name: company.director_name || '',
        director_title: company.director_title || '',
        accreditation_badge: company.accreditation_badge || '',
        copyright_text: company.copyright_text || '',
      });
    }
  }, [company]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim() || !form.email.trim()) {
      showToast('Nama perusahaan dan email utama wajib diisi.', 'warning');
      return;
    }

    try {
      setSaving(true);
      await updateCompanyProfile(form);
      showToast(
        'Profil dan informasi kontak lembaga berhasil diperbarui!',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui profil perusahaan.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Pengaturan Identitas & Kontak Lembaga
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola nama lembaga, alamat email penerima konsultasi artikel, nomor kontak layanan, dan informasi sekretariat yang tampil di seluruh halaman publik.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tersinkronisasi ke Website Publik</span>
          </span>

          <button
            type="button"
            onClick={() =>
              refreshCompanyProfile(true).then(() =>
                showToast('Informasi profil lembaga berhasil diperbarui.', 'info')
              )
            }
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Muat ulang informasi"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSave}
        className="bg-slate-950/70 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 text-xs"
      >
        {/* Section 1: Brand & Identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Building2 className="w-4 h-4" />
            <span>1. Identitas Utama Lembaga / Perusahaan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1.5">
                Nama Resmi Perusahaan / Lembaga *
              </label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Contoh: NAC Tax Center"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Inisial / Singkatan Brand *
              </label>
              <input
                type="text"
                value={form.short_name}
                onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                placeholder="Contoh: NAC"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Tagline / Subjudul Lembaga
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Badge Akreditasi Hero Beranda
              </label>
              <input
                type="text"
                value={form.accreditation_badge}
                onChange={(e) => setForm({ ...form, accreditation_badge: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Deskripsi Singkat Lembaga (Tampil di Footer & Tentang Kami)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white leading-relaxed focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 2: Email & Contact (Used by Blog Question Queue) */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Mail className="w-4 h-4" />
            <span>2. Email Tujuan Konsultasi Blog & Kontak Resmi</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Email Resmi Layanan & Konsultasi Pembaca *
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@perusahaan.id"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Seluruh pertanyaan pembaca dari halaman artikel pajak akan diteruskan ke alamat email ini.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Email Admisi & Pendaftaran
              </label>
              <input
                type="email"
                value={form.admission_email}
                onChange={(e) => setForm({ ...form, admission_email: e.target.value })}
                placeholder="admisi@perusahaan.id"
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Telepon Kantor
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Hotline WhatsApp
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Kota Kedudukan
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Alamat Lengkap Sekretariat / Kantor Pusat
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Section 3: Director & Legal Footer */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Award className="w-4 h-4" />
            <span>3. Pejabat Penandatangan & Hak Cipta</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Nama Direktur / Pimpinan Lembaga
              </label>
              <input
                type="text"
                value={form.director_name}
                onChange={(e) => setForm({ ...form, director_name: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Jabatan Pimpinan
              </label>
              <input
                type="text"
                value={form.director_title}
                onChange={(e) => setForm({ ...form, director_title: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Teks Copyright Footer
              </label>
              <input
                type="text"
                value={form.copyright_text}
                onChange={(e) => setForm({ ...form, copyright_text: e.target.value })}
                className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-lg transition disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Profil Lembaga</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCompanyProfilePage;
