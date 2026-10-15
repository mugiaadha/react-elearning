import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import brevetService from '../../services/brevetService';
import userService from '../../services/userService';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import isDevMode from '../../config/devMode';
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
  Eye,
  EyeOff
} from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerStudent, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const brevetParamId = searchParams.get('brevet_id') || searchParams.get('brevet') || searchParams.get('slug') || 'brevet-ab';

  const [brevets, setBrevets] = useState([]);
  const [selectedBrevetId, setSelectedBrevetId] = useState(brevetParamId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    brevetService
      .getAllBrevets()
      .then((data) => {
        setBrevets(data || []);
        const param = searchParams.get('brevet_id') || searchParams.get('brevet') || searchParams.get('slug');
        if (param && Array.isArray(data)) {
          const found = data.find((b) => b.id === param || b.slug === param);
          if (found) {
            setSelectedBrevetId(found.id);
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const selectedBrevet =
    brevets.find((b) => b.id === selectedBrevetId || b.slug === selectedBrevetId) ||
    brevets.find((b) => b.id === brevetParamId || b.slug === brevetParamId) ||
    brevets[0] ||
    null;

  const targetBrevetId = selectedBrevet?.id || selectedBrevetId || 'coretax-mastery';
  const targetBrevetTitle = selectedBrevet?.title || 'Program Brevet Pajak';
  const targetBrevetPrice = selectedBrevet?.price || 1250000;

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
    if (!password) {
      showToast('Kata sandi wajib diisi.', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Kata sandi minimal 6 karakter demi keamanan akun Anda.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      setRegError('');
      showToast('Mendaftarkan akun & mengirim email verifikasi via SMTP...', 'loading', 3000);

      try {
        localStorage.setItem('nac_pending_brevet_id', targetBrevetId);
      } catch (e) {}

      const response = await registerStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        brevetId: targetBrevetId,
        brevet_id: targetBrevetId,
        brevetTitle: targetBrevetTitle,
        amount: targetBrevetPrice,
      });

      showToast(`Pendaftaran berhasil! Mengarahkan ke halaman verifikasi email...`, 'success', 3500);

      // Navigate to dedicated verification page where user can input OTP or click email link
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }, 800);
    } catch (err) {
      console.warn('[Registration failed]', err);
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
      const verifyRes = await userService.verifyEmail(email.trim(), inputOtp.trim());
      try {
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('nac_completed_lessons_')) {
            localStorage.removeItem(k);
          }
        });
      } catch (e) {}
      if (verifyRes?.token) {
        localStorage.setItem('nac_auth_token', verifyRes.token);
      }
      await refreshProfile();
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
        <div className="md:col-span-7 p-8 space-y-5">
          {/* 3-Step Visual Progress Breadcrumb */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-nac-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                1
              </div>
              <span className="text-[11px] font-bold text-slate-900">1. Pendaftaran</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                2
              </div>
              <span className="text-[11px] font-medium text-slate-500">2. Verifikasi OTP</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-1.5 opacity-50">
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                3
              </div>
              <span className="text-[11px] font-medium text-slate-500">3. Pembayaran</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Formulir Pendaftaran Siswa</h3>
            <p className="text-xs text-slate-500 mt-1">
              Lengkapi informasi data diri dan buat kata sandi akun portal Anda
            </p>
          </div>

          {regError && !showOtpModal && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{regError}</span>
            </div>
          )}

          <form onSubmit={handleStartRegistration} className="space-y-3.5 text-xs">
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

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={submitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-9 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Konfirmasi Sandi</label>
                  {confirmPassword && (
                    <span
                      className={`text-[10px] font-bold ${
                        password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {password === confirmPassword ? '✓ Cocok' : '✕ Tidak cocok'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    disabled={submitting}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-9 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Resume tip banner */}
            <div className="bg-sky-50/70 border border-sky-200/70 rounded-xl p-2.5 text-[11px] text-sky-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Simpan sandi ini baik-baik!</strong> Jika browser tertutup di tengah proses, Anda dapat masuk kembali kapan saja dengan email & sandi ini untuk melanjutkan verifikasi atau pembayaran.
              </p>
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
                    <span>Lanjutkan ke Langkah 2: Verifikasi OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                atau daftar instan dengan
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google Quick Registration */}
            <GoogleAuthButton
              text="Daftar Cepat dengan Akun Google"
              mode="register"
              brevetId={targetBrevetId}
            />

            <p className="text-center text-[11px] text-slate-500 pt-1">
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

            {isDevMode && otpCode && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Kode OTP Terkirim (Dev Helper):
                </span>
                <span className="font-mono font-bold tracking-wider text-xs bg-amber-100/90 px-2 py-0.5 rounded text-amber-950">
                  {otpCode}
                </span>
              </div>
            )}


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
