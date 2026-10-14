import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile, logout } = useAuth();
  const { showToast } = useToast();

  const emailParam = searchParams.get('email') || '';
  const codeParam = searchParams.get('code') || '';

  const [email, setEmail] = useState(emailParam || user?.email || '');
  const [otpCode, setOtpCode] = useState(codeParam);
  const [verifying, setVerifying] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRef = useRef(null);
  const hasAutoTriggeredRef = useRef(false);

  // If user is already authenticated and verified, proceed to next step
  useEffect(() => {
    if (user?.role === 'student' && user?.email_verified_at) {
      if (user.payment_status === 'APPROVED') {
        navigate('/dashboard/student', { replace: true });
      } else {
        navigate('/onboarding/payment-pending', { replace: true });
      }
    }
  }, [user, navigate]);

  // Sync state if URL query params or user state change
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email && !email) {
      setEmail(user.email);
    }
    if (codeParam) setOtpCode(codeParam);
  }, [emailParam, codeParam, user?.email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Automatic verification if user clicks direct link in email (?email=...&code=...)
  useEffect(() => {
    if (emailParam && codeParam && codeParam.trim().length >= 4 && !hasAutoTriggeredRef.current) {
      hasAutoTriggeredRef.current = true;
      executeAutoVerification(emailParam.trim(), codeParam.trim());
    }
  }, [emailParam, codeParam]);

  const executeAutoVerification = async (targetEmail, targetCode) => {
    setAutoVerifying(true);
    setErrorMessage('');
    try {
      showToast('Memverifikasi tautan konfirmasi email Anda...', 'loading', 2000);
      const res = await userService.verifyEmail(targetEmail, targetCode);

      if (res?.token) {
        localStorage.setItem('nac_auth_token', res.token);
      }
      await refreshProfile();

      setVerifiedSuccess(true);
      showToast('Email berhasil diverifikasi secara sah! Membuka halaman pembayaran...', 'success', 3500);

      setTimeout(() => {
        navigate('/onboarding/payment-pending', { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Tautan verifikasi tidak valid atau kode telah kedaluwarsa.';
      setErrorMessage(msg);
      showToast(msg, 'error', 4500);
    } finally {
      setAutoVerifying(false);
    }
  };

  const handleManualVerify = async (e) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      showToast('Silakan masukkan alamat email Anda.', 'warning');
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      showToast('Silakan masukkan 6-digit kode OTP verifikasi.', 'warning');
      return;
    }

    setVerifying(true);
    setErrorMessage('');
    try {
      showToast('Memverifikasi kode OTP...', 'loading', 1500);
      const res = await userService.verifyEmail(email.trim(), otpCode.trim());

      if (res?.token) {
        localStorage.setItem('nac_auth_token', res.token);
      }
      await refreshProfile();

      setVerifiedSuccess(true);
      showToast('Email berhasil diverifikasi! Membuka halaman pembayaran...', 'success', 3500);

      setTimeout(() => {
        navigate('/onboarding/payment-pending', { replace: true });
      }, 1200);
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Kode verifikasi tidak sesuai atau telah kedaluwarsa.';
      setErrorMessage(msg);
      showToast(msg, 'error', 4500);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;

    if (!email.trim()) {
      showToast('Masukkan alamat email untuk meminta kode baru.', 'warning');
      return;
    }

    try {
      setResending(true);
      showToast('Mengirimkan kode verifikasi baru via SMTP...', 'loading', 2000);
      const res = await userService.sendVerificationEmail(email.trim());

      if (res?.code) {
        setOtpCode(res.code);
      }

      setResendCooldown(60);
      setErrorMessage('');
      showToast('Kode OTP baru berhasil dikirim ke kotak masuk email Anda!', 'success', 4000);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal mengirim ulang kode verifikasi.', 'error', 4000);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center relative overflow-hidden">
        {/* Top Decorative Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-nac-navy via-nac-primary to-amber-400"></div>

        {/* 3-Step Visual Progress Breadcrumb */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">1. Terdaftar</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-200 mx-2"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-nac-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              2
            </div>
            <span className="text-[11px] font-bold text-slate-900">2. Verifikasi OTP</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
          <div className="flex items-center gap-1.5 opacity-50">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
              3
            </div>
            <span className="text-[11px] font-medium text-slate-500">3. Pembayaran</span>
          </div>
        </div>

        {/* Main State Card */}
        {autoVerifying ? (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-nac-primary flex items-center justify-center mx-auto shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin text-nac-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Memverifikasi Tautan Email...</h2>
              <p className="text-xs text-slate-500 mt-1">
                Sedang memvalidasi kode verifikasi dari tautan email yang Anda klik.
              </p>
            </div>
          </div>
        ) : verifiedSuccess ? (
          <div className="py-8 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Alamat Email Terverifikasi!</h2>
              <p className="text-xs text-slate-600 mt-1">
                Data pendaftaran Anda telah aktif. Mengarahkan Anda ke portal pembayaran & penerbitan invoice...
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/onboarding/payment-pending"
                className="btn-emerald text-xs py-2.5 px-6 rounded-xl font-bold inline-flex items-center gap-1.5 shadow"
              >
                <span>Lanjut ke Pembayaran Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Mail Icon & Instructions */}
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 text-nac-primary flex items-center justify-center mx-auto shadow-inner border border-sky-200">
                <Mail className="w-8 h-8 text-nac-primary" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Periksa Kotak Masuk Email Anda
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Kami telah mengirimkan 6-digit kode OTP resmi via email ke:
                </p>
                {email ? (
                  <div className="mt-1 inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-800 font-mono">
                    {email}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1 italic">
                    (Alamat email pendaftaran Anda)
                  </p>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleManualVerify} className="space-y-4 pt-1">
              {!email && (
                <div className="text-left space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Alamat Email Pendaftaran:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                  />
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Masukkan 6-Digit Kode Verifikasi (OTP)
                </div>

                <div className="relative max-w-[220px] mx-auto">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center text-3xl font-black font-mono tracking-[8px] py-2.5 rounded-xl border-2 border-sky-400 focus:border-nac-primary focus:ring-2 focus:ring-sky-200 focus:outline-none bg-white text-nac-navy uppercase shadow-inner"
                  />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                  <span>Tidak menemukan email?</span>
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

              <button
                type="submit"
                disabled={verifying}
                className="w-full btn-emerald text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Kode OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Email & Lanjut ke Pembayaran &rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Informative Tip Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Cara Praktis (Tanpa Ketik Kode):
              </div>
              <p className="text-amber-800 leading-relaxed">
                Anda juga dapat membuka pesan email dari kami dan langsung mengklik tombol <strong>"Konfirmasi Verifikasi Email Sekarang"</strong>. Halaman ini akan otomatis memverifikasi akun Anda seketika.
              </p>
            </div>

            {/* Back link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link
                to="/register"
                onClick={() => { if (user) logout(); }}
                className="hover:text-slate-800 font-semibold inline-flex items-center gap-1 text-[11px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Ganti Email / Daftar Ulang
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="text-slate-500 hover:text-rose-600 font-medium text-[11px] transition"
                >
                  Keluar / Masuk Akun Lain
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-nac-primary hover:underline font-bold text-[11px]"
                >
                  Sudah punya akun? Masuk
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
