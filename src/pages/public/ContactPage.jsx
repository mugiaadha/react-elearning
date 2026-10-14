import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';

export const ContactPage = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) {
      showToast('Mohon lengkapi seluruh kolom formulir.', 'warning');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      showToast('Sedang mengirim pesan Anda...', 'loading', 1500);

      const res = await apiClient.post(ENDPOINTS.CONTACT, {
        name: name.trim(),
        contact: contact.trim(),
        message: message.trim(),
      });

      const successMsg = res.message || 'Pesan Anda telah berhasil dikirim! Tim admisi kami akan segera menghubungi Anda.';
      setSuccess(successMsg);
      showToast(successMsg, 'success', 4500);
      setName('');
      setContact('');
      setMessage('');
    } catch (err) {
      console.error('Contact error', err);
      const errMsg = err.message || 'Gagal mengirim pesan. Silakan coba lagi.';
      setError(errMsg);
      showToast(errMsg, 'error', 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Layanan Mahasiswa & Korporasi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hubungi Sekretariat NAC Tax Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Konsultasi pendaftaran, permohonan in-house training perusahaan, dan informasi jadwal pelatihan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 bg-slate-950 text-white p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold text-white">Informasi Kontak Pusat</h2>
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <div>
                <strong className="block text-white">Alamat Kantor:</strong>
                <p className="text-slate-400">NAC Tax Tower Lt. 8, Jl. HR Rasuna Said Kav. C-22, Kuningan, Jakarta Selatan 12920</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-white">Telepon / WhatsApp:</strong>
                <p className="text-slate-400">+62 812-8890-4123 (Hotline Mahasiswa)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-white">Email Resmi:</strong>
                <p className="text-slate-400">info@nactaxcenter.id / admisi@nactaxcenter.id</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Kirim Pesan atau Pertanyaan</h3>

          {success && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Dimas Pratama"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email / WhatsApp</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="dimas@gmail.com / 081288904123"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pesan Anda</label>
              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tanyakan jadwal kelas, biaya cicilan, atau materi silabus..."
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs w-full py-3 flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Pesan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pertanyaan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
