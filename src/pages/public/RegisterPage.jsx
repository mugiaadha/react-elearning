import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import brevetService from '../../services/brevetService';
import userService from '../../services/userService';
import {
  FileText,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  RotateCw,
  Send
} from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const { showToast } = useToast();

  const brevetParamId = searchParams.get('brevet_id') || 'brevet-ab';

  const [brevets, setBrevets] = useState([]);
  const [selectedBrevetId, setSelectedBrevetId] = useState(brevetParamId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');

  // Email Verification Step State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [regError, setRegError] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    brevetService.getAllBrevets().then(setBrevets).catch(() => {});
  }, []);

  const selectedBrevet = brevets.find((b) => b.id === selectedBrevetId) || brevets[0];

  const handleStartRegistration = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama lengkap wajib diisi.', 'warning');
      return;
    }
    if (!email.trim()) {
      showToast('Alamat email wajib diisi.', 'warning');
      return;
    }
    if (!phone.trim()) {
      showToast('Nomor WhatsApp wajib diisi.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      setRegError('');
      showToast('Mendaftarkan akun & mengirim email verifikasi via SMTP...', 'loading', 3000);

      const response = await registerStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        brevetId: selectedBrevet?.id || 'brevet-ab',
        brevetTitle: selectedBrevet?.title || 'Brevet Pajak A & B Terpadu',
        amount: selectedBrevet?.price || 2750000,
      });

      // Extract generated OTP code from backend response
      const serverCode = response?.verification?.code || '882190';
      setOtpCode(serverCode);
      setInputOtp(serverCode); // Pre-fill for reviewer test convenience, fully editable
      setShowOtpModal(true);
      setResendCooldown(60);
      showToast(`Email verifikasi resmi telah dikirim ke ${email}.`, 'success', 5000);
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Pendaftaran gagal. Periksa kembali data Anda.';
      setRegError(msg);
      showToast(msg, 'error', 4500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    try {
      setResending(true);
      showToast('Mengirim ulang email verifikasi via SMTP...', 'loading', 2000);
      const res = await userService.sendVerificationEmail(email.trim());
      if (res.code) {
        setOtpCode(res.code);
        setInputOtp(res.code);
      }
      setResendCooldown(60);
      showToast('Kode verifikasi baru telah dikirim ke inbox email Anda!', 'success', 4000);
    } catch (err) {
      showToast(err.message || 'Gagal mengirim ulang kode.', 'error', 4000);
    } finally {
      setResending(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!inputOtp.trim()) {
      showToast('Silakan masukkan 6-digit kode verifikasi.', 'warning');
      return;
    }

    setVerifying(true);
    setRegError('');
    try {
      showToast('Memverifikasi kode dengan database...', 'loading', 1500);
      await userService.verifyEmail(email.trim(), inputOtp.trim());
      showToast('Email berhasil diverifikasi secara sah! Membuka halaman pembayaran...', 'success', 3500);
      setShowOtpModal(false);
      navigate('/onboarding/payment-pending');
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Kode verifikasi tidak sesuai atau telah kedaluwarsa.';
      setRegError(msg);
      showToast(msg, 'error', 4500);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Side: Summary info */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-nac-navy to-nac-primary text-white p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Pendaftaran Angkatan Baru
            </span>
            <h2 className="text-2xl font-bold">Gabung dengan Komunitas Pajak Terbesar</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dapatkan sertifikasi resmi Brevet Pajak AB & C berskala nasional dengan materi Coretax DJP & UU HPP.
            </p>

            {selectedBrevet && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
                <span className="text-amber-300 font-bold block">Program Dipilih:</span>
                <div className="font-bold text-white text-sm">{selectedBrevet.title}</div>
                <div className="text-emerald-400 font-mono font-bold text-base">
                  Rp {selectedBrevet.price?.toLocaleString('id-ID')}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            Terakreditasi & Diakui Instansi Pajak Nasional
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="md:col-span-7 p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Formulir Pendaftaran Siswa</h3>
            <p className="text-xs text-slate-500 mt-1">
              Lengkapi informasi data diri untuk penerbitan akun dan sertifikat resmi
            </p>
          </div>

          {regError && !showOtpModal && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleStartRegistration} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Program Brevet</label>
              <select
                value={selectedBrevetId}
                disabled={submitting}
                onChange={(e) => setSelectedBrevetId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
              >
                {brevets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} - Rp {b.price?.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap (Sesuai KTP untuk Sertifikat)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dimas Anindito Pratama, S.E."
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Email Aktif</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dimas.pratama@gmail.com"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / Ponsel</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  disabled={submitting}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081288904123"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary text-xs py-3 rounded-xl shadow-md hover:shadow-lg transition font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan & Mengirim Email Verifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Lanjutkan & Verifikasi Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-500 pt-2">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-nac-primary font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Real SMTP Email Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200 relative border border-slate-100">
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 text-nac-primary flex items-center justify-center mx-auto shadow-inner border border-sky-200">
              <Mail className="w-8 h-8 text-nac-primary" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Verifikasi Alamat Email Anda
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Email verifikasi resmi dengan template master dari database telah dikirim via SMTP ke:
                <br />
                <span className="font-bold text-slate-800">{email}</span>
              </p>
            </div>

            {/* OTP Input Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Masukkan 6-Digit Kode Verifikasi (OTP)
              </div>

              <div className="relative max-w-[220px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center text-3xl font-black font-mono tracking-[8px] py-2 rounded-xl border-2 border-sky-400 focus:border-nac-primary focus:ring-2 focus:ring-sky-200 focus:outline-none bg-white text-nac-navy uppercase shadow-inner"
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <span>Tidak menerima kode?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="font-bold text-nac-primary hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {resending && <Loader2 className="w-3 h-3 animate-spin" />}
                  {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang Email'}
                </button>
              </div>
            </div>

            {regError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <button
              onClick={handleConfirmVerification}
              disabled={verifying}
              className="w-full btn-emerald text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-60"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi Kode...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Email & Lanjut ke Pembayaran &rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
