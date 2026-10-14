import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import isDevMode from '../../config/devMode';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { login, switchRole, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState(''); // text description for smooth loader
  const [activePreset, setActivePreset] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard/student';
  const hasProcessedGoogleRef = React.useRef(false);

  // Handle Google OAuth callback token from URL if redirected from backend
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleToken = params.get('google_token');
    const authError = params.get('error');
    const emailParam = params.get('email');

    if (emailParam && !email) {
      setEmail(emailParam);
    }

    if (hasProcessedGoogleRef.current) return;

    if (authError) {
      hasProcessedGoogleRef.current = true;
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast(authError, 'error', 4500);
      setLoginError(authError);
    } else if (googleToken) {
      hasProcessedGoogleRef.current = true;
      localStorage.setItem('nac_auth_token', googleToken);
      window.history.replaceState({}, document.title, window.location.pathname);

      refreshProfile().then((userData) => {
        showToast(`Selamat datang kembali, ${userData?.name || 'Mahasiswa'}!`, 'success', 3500);
        if (userData?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userData?.role === 'teacher') {
          navigate('/dashboard/teacher', { replace: true });
        } else if (userData?.payment_status !== 'APPROVED') {
          navigate('/onboarding/payment-pending', { replace: true });
        } else {
          navigate('/dashboard/student', { replace: true });
        }
      });
    }
  }, [location.search, navigate, refreshProfile, showToast]);

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setSubmitting(true);
      setLoginError('');
      setIsSuccess(false);
      setLoadingStep('Menghubungkan ke server otentikasi...');

      // Micro-step for visual fluidity
      await new Promise((r) => setTimeout(r, 250));
      setLoadingStep('Memverifikasi data kredensial...');

      const user = await login(email, password, 'student');

      setLoadingStep('Menyiapkan sesi belajar...');
      setIsSuccess(true);
      showToast(`Selamat datang kembali, ${user.name}!`, 'success', 3500);

      // Smooth transition before redirect
      await new Promise((r) => setTimeout(r, 450));

      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (user.role === 'student') {
        if (!user.email_verified_at) {
          showToast('Silakan selesaikan verifikasi email Anda terlebih dahulu.', 'info', 4000);
          navigate(`/verify-email?email=${encodeURIComponent(user.email)}`, { replace: true });
        } else if (user.payment_status !== 'APPROVED') {
          showToast('Melanjutkan ke tagihan & pembayaran pendaftaran...', 'info', 3000);
          navigate('/onboarding/payment-pending', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.message || 'Email atau kata sandi tidak sesuai.';
      setLoginError(msg);
      showToast(msg, 'error', 4500);
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
      setLoadingStep('');
    }
  };

  const handleQuickLogin = async (presetId, role, paymentStatus = 'APPROVED') => {
    try {
      setActivePreset(presetId);
      setSubmitting(true);
      setLoginError('');
      setIsSuccess(false);
      setLoadingStep(`Menyiapkan sesi akun ${role.toUpperCase()}...`);

      await new Promise((r) => setTimeout(r, 250));
      const updatedUser = await switchRole(role, paymentStatus);

      setLoadingStep('Mengonfigurasi hak akses portal...');
      setIsSuccess(true);
      showToast(`Berhasil masuk sebagai ${updatedUser.name} (${role})!`, 'info', 3500);

      await new Promise((r) => setTimeout(r, 400));

      if (role === 'student') {
        if (paymentStatus !== 'APPROVED') {
          navigate('/onboarding/payment-pending');
        } else {
          navigate('/dashboard/student');
        }
      } else if (role === 'teacher') {
        navigate('/dashboard/teacher');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      const msg = err.message || 'Gagal beralih akun simulasi.';
      setLoginError(msg);
      showToast(msg, 'error', 4000);
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
      setActivePreset(null);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="relative max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Smooth Interactive Loading Overlay */}
        {submitting && (
          <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-nac-navy to-nac-primary flex items-center justify-center text-white shadow-xl shadow-sky-900/20">
                <span className="font-black text-2xl text-amber-400">NAC</span>
              </div>
              {!isSuccess ? (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-nac-primary">
                  <Loader2 className="w-4 h-4 animate-spin text-nac-primary" />
                </div>
              ) : (
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 shadow-md flex items-center justify-center text-white">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              {isSuccess ? 'Autentikasi Berhasil!' : 'Memproses Masuk...'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs animate-pulse">
              {loadingStep || 'Mohon tunggu sejenak sementara sistem memvalidasi...'}
            </p>

            {/* Micro Progress Bar */}
            <div className="w-44 bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isSuccess ? 'w-full bg-emerald-500' : 'w-2/3 bg-nac-primary animate-pulse'
                  }`}
              ></div>
            </div>
          </div>
        )}

        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nac-navy to-nac-primary flex items-center justify-center text-white mx-auto shadow-md">
            <span className="font-black text-xl text-amber-400">NAC</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Masuk Akun Pembelajaran
          </h2>
          <p className="text-xs text-slate-500">
            Akses LMS, video perkuliahan, kuis, dan sertifikat resmi
          </p>
        </div>

        {/* Error Alert Box */}
        {loginError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">{loginError}</div>
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                disabled={submitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-nac-primary/30 focus:border-nac-primary focus:outline-none transition disabled:bg-slate-50 disabled:opacity-75"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">Kata Sandi</label>
              <button
                type="button"
                onClick={() => showToast('Gunakan kredensial akun bawaan: password123', 'info')}
                className="text-[11px] text-nac-primary hover:underline font-medium"
              >
                Lupa sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-nac-primary/30 focus:border-nac-primary focus:outline-none transition disabled:bg-slate-50 disabled:opacity-75"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                aria-label="Tampilkan atau sembunyikan kata sandi"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary text-xs py-3 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-bold transition disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            atau lanjutkan dengan
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Google Authentication Button */}
        <GoogleAuthButton
          text="Masuk dengan Akun Google"
          mode="login"
        />

        {/* Quick Testing Presets (Only visible when DEV_MODE=true) */}
        {isDevMode && (
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Preset Login Cepat (Pengujian RBAC):
              </span>
              <span className="text-[10px] text-slate-400 font-normal">1-Klik Otomatis</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Preset 1 */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin('p1', 'student', 'PENDING_APPROVAL')}
                className={`p-2.5 rounded-xl text-left transition flex items-center justify-between border ${activePreset === 'p1'
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-amber-50/80 hover:bg-amber-100/90 border-amber-200'
                  } disabled:opacity-60`}
              >
                <div>
                  <span className="font-bold text-amber-900 block text-xs flex items-center gap-1.5">
                    1. Mahasiswa (Status: Pending Approval)
                    {activePreset === 'p1' && <Loader2 className="w-3 h-3 animate-spin text-amber-700" />}
                  </span>
                  <span className="text-[10px] text-amber-700">
                    Uji Route Guard Pre-Approval (Mengarahkan ke Onboarding)
                  </span>
                </div>
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              </button>

              {/* Preset 2 */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin('p2', 'student', 'APPROVED')}
                className={`p-2.5 rounded-xl text-left transition flex items-center justify-between border ${activePreset === 'p2'
                  ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200'
                  } disabled:opacity-60`}
              >
                <div>
                  <span className="font-bold text-emerald-900 block text-xs flex items-center gap-1.5">
                    2. Mahasiswa (Status: Aktif / Approved)
                    {activePreset === 'p2' && <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />}
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Akses penuh ke Dashboard Belajar & Ruang Kelas
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>

              {/* Preset 3 */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin('p3', 'teacher', 'APPROVED')}
                className={`p-2.5 rounded-xl text-left transition flex items-center justify-between border ${activePreset === 'p3'
                  ? 'bg-teal-100 border-teal-400 ring-2 ring-teal-300'
                  : 'bg-teal-50/80 hover:bg-teal-100/90 border-teal-200'
                  } disabled:opacity-60`}
              >
                <div>
                  <span className="font-bold text-teal-900 block text-xs flex items-center gap-1.5">
                    3. Instruktur / Dosen Pajak (Teacher)
                    {activePreset === 'p3' && <Loader2 className="w-3 h-3 animate-spin text-teal-700" />}
                  </span>
                  <span className="text-[10px] text-teal-700">
                    Monitoring siswa, materi ajar & bank soal
                  </span>
                </div>
                <GraduationCap className="w-4 h-4 text-teal-700 shrink-0" />
              </button>

              {/* Preset 4 */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleQuickLogin('p4', 'admin', 'APPROVED')}
                className={`p-2.5 rounded-xl text-left transition flex items-center justify-between border ${activePreset === 'p4'
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700'
                  } text-white disabled:opacity-60`}
              >
                <div>
                  <span className="font-bold text-white block text-xs flex items-center gap-1.5">
                    4. Administrator (Backoffice CMS)
                    {activePreset === 'p4' && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
                  </span>
                  <span className="text-[10px] text-amber-400">
                    Verifikasi pembayaran & audit sertifikat
                  </span>
                </div>
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            </div>
          </div>
        )}


        <p className="text-center text-[11px] text-slate-500 pt-2">
          Belum terdaftar?{' '}
          <Link to="/brevet" className="text-nac-primary font-bold hover:underline">
            Daftar Brevet di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
