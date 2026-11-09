import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCompanyProfile } from '../../context/CompanyProfileContext';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import blogService from '../../services/blogService';

export const ContactPage = () => {
  const { showToast } = useToast();
  const { company } = useCompanyProfile();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [websiteTrap, setWebsiteTrap] = useState('');
  const [captcha, setCaptcha] = useState({
    captcha_token: '',
    captcha_question: 'Memuat pertanyaan...',
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const data = await blogService.getCaptchaChallenge();
      if (data) {
        setCaptcha(data);
        setCaptchaAnswer('');
      }
    } catch (err) {
      console.error('Captcha load error:', err);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) {
      showToast('Mohon lengkapi seluruh kolom formulir.', 'warning');
      return;
    }

    if (!captchaAnswer.trim()) {
      showToast('Silakan isi jawaban pertanyaan keamanan terlebih dahulu.', 'warning');
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
        captcha_token: captcha.captcha_token,
        captcha_answer: captchaAnswer.trim(),
        website_trap: websiteTrap,
      });

      const successMsg =
        res.message ||
        `Pesan Anda telah berhasil dikirim ke sekretariat ${company.company_name} (${company.email})! Tim kami akan segera menghubungi Anda.`;
      setSuccess(successMsg);
      showToast(successMsg, 'success', 4500);
      setName('');
      setContact('');
      setMessage('');
      setCaptchaAnswer('');
      loadCaptcha();
    } catch (err) {
      console.error('Contact error', err);
      const errMsg =
        err.message || 'Gagal mengirim pesan. Periksa kembali jawaban pertanyaan keamanan Anda.';
      setError(errMsg);
      showToast(errMsg, 'error', 4000);
      loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 sm:space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Layanan Mahasiswa & Korporasi
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hubungi Sekretariat {company.company_name}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Konsultasi pendaftaran, permohonan in-house training perusahaan, dan informasi jadwal pelatihan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        <div className="md:col-span-5 bg-slate-950 text-white p-6 sm:p-8 rounded-3xl space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Informasi Kontak Pusat</h2>
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-400 mt-1 shrink-0" />
              <div>
                <strong className="block text-white">Alamat Kantor:</strong>
                <p className="text-slate-400">{company.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-white">Telepon / WhatsApp:</strong>
                <p className="text-slate-400">
                  {company.whatsapp || company.phone} (Hotline Mahasiswa)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-white">Email Resmi:</strong>
                <p className="text-slate-400">
                  {company.email}
                  {company.admission_email && company.admission_email !== company.email
                    ? ` / ${company.admission_email}`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
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
            {/* Honeypot anti-bot field */}
            <input
              type="text"
              name="website_trap"
              value={websiteTrap}
              onChange={(e) => setWebsiteTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Email / WhatsApp *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Pesan Anda *</label>
              <textarea
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tanyakan jadwal kelas, permohonan in-house training, atau materi silabus..."
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none leading-relaxed"
              ></textarea>
            </div>

            {/* Security Question (CAPTCHA) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-nac-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                    Pertanyaan Keamanan
                  </div>
                  <div className="text-xs font-bold text-nac-primary mt-0.5 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-sky-200 font-mono text-slate-900 shadow-sm">
                      {captcha.captcha_question}
                    </span>
                    <button
                      type="button"
                      onClick={loadCaptcha}
                      disabled={loadingCaptcha}
                      title="Ganti pertanyaan hitung"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-nac-primary hover:bg-white transition"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${loadingCaptcha ? 'animate-spin' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-40">
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Ketik hasil angka..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                />
              </div>
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
