import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import {
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Key,
  ExternalLink,
  Info,
  Sparkles,
  Copy
} from 'lucide-react';

export const GoogleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const GoogleAuthButton = ({
  text = 'Masuk dengan Google',
  mode = 'login', // 'login' | 'register'
  brevetId = 'brevet-ab',
  className = '',
  onSuccess,
}) => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthConfig, setOauthConfig] = useState(null);
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check backend Google OAuth config on mount
  useEffect(() => {
    apiClient
      .get(ENDPOINTS.AUTH_GOOGLE_URL)
      .then((res) => {
        setOauthConfig(res);
      })
      .catch(() => {});
  }, []);

  const handleGoogleClick = () => {
    // 1. If backend has valid Google Client ID, immediately redirect to accounts.google.com!
    if (oauthConfig?.is_configured && oauthConfig?.auth_url) {
      showToast('Membuka halaman pemilihan akun Google...', 'loading', 2500);
      window.location.href = oauthConfig.auth_url;
      return;
    }

    // 2. If client ID is present in frontend env
    const viteClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (viteClientId) {
      const redirectUri = encodeURIComponent(oauthConfig?.redirect_uri || 'http://localhost:8000/api/auth/google/callback');
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${viteClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&prompt=select_account`;
      showToast('Membuka halaman pemilihan akun Google...', 'loading', 2500);
      window.location.href = googleUrl;
      return;
    }

    // 3. Otherwise, open configuration modal to input Google Client ID or run instant simulation
    setShowConfigModal(true);
  };

  const handleSaveAndRedirect = async (e) => {
    e.preventDefault();
    if (!clientIdInput.trim()) {
      showToast('Silakan masukkan Google Client ID.', 'warning');
      return;
    }

    try {
      setSavingConfig(true);
      showToast('Menyimpan konfigurasi Google & menyiapkan redirect...', 'loading', 2000);

      const res = await apiClient.post('/auth/google/config', {
        client_id: clientIdInput.trim(),
        client_secret: clientSecretInput.trim(),
      });

      showToast('Konfigurasi tersimpan! Mengarahkan ke Google...', 'success', 2500);
      setOauthConfig({
        is_configured: true,
        client_id: clientIdInput.trim(),
        auth_url: res.auth_url,
      });

      setTimeout(() => {
        window.location.href = res.auth_url;
      }, 600);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal menyimpan Google Client ID.', 'error', 4000);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSimulateAccount = async (account) => {
    try {
      setLoading(true);

      const response = await loginWithGoogle({
        name: account.name,
        email: account.email,
        avatar: account.avatar,
        google_id: 'google_' + btoa(account.email).replace(/=/g, ''),
        brevetId,
      });

      showToast(response.message || `Berhasil masuk dengan akun Google: ${account.email}`, 'success', 3500);
      setShowConfigModal(false);

      if (onSuccess) {
        onSuccess(response.data);
        return;
      }

      const user = response.data;
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/dashboard/teacher', { replace: true });
      } else if (user.payment_status !== 'APPROVED') {
        navigate('/onboarding/payment-pending', { replace: true });
      } else {
        navigate('/dashboard/student', { replace: true });
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal login Google.', 'error', 4500);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUri = () => {
    navigator.clipboard.writeText(oauthConfig?.redirect_uri || 'http://localhost:8000/api/auth/google/callback');
    setCopied(true);
    showToast('Redirect URI berhasil disalin!', 'info', 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Official Google-Style Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm hover:shadow transition duration-200 active:scale-[0.99] group ${className}`}
      >
        <GoogleIcon className="w-4 h-4 transition group-hover:scale-110 duration-200" />
        <span>{text}</span>
      </button>

      {/* Google OAuth Setup / Account Selector Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-left relative overflow-hidden animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 pb-3 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-2">
                <GoogleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Buka Halaman Akun Google
              </h3>
              <p className="text-xs text-slate-500">
                Pilih akun Gmail Anda langsung dari server resmi Google (<span className="font-mono text-slate-700">accounts.google.com</span>)
              </p>
            </div>

            {/* Google OAuth Form */}
            <form onSubmit={handleSaveAndRedirect} className="space-y-3.5 text-xs">
              <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 text-[11px] text-sky-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Agar Google dapat menampilkan daftar Gmail di browser Anda, masukkan <strong>Google Client ID</strong> dari Google Cloud Console Anda di bawah ini:
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Client ID (OAuth 2.0)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="xxxxxxxxx.apps.googleusercontent.com"
                    className="w-full font-mono text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Client Secret <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="password"
                  value={clientSecretInput}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  placeholder="GOCSPX-xxxxxxxxxxxxxx"
                  className="w-full font-mono text-xs rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                />
              </div>

              {/* Redirect URI hint */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] space-y-1">
                <span className="text-slate-500 block font-medium">Authorized Redirect URI (di Google Cloud):</span>
                <div className="flex items-center justify-between font-mono bg-white p-1.5 rounded-lg border border-slate-200">
                  <span className="text-slate-800 truncate">http://127.0.0.1:8000/auth/google/callback</span>
                  <button
                    type="button"
                    onClick={handleCopyUri}
                    className="text-nac-primary hover:underline font-bold shrink-0 ml-2 inline-flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                className="w-full btn-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {savingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengarahkan ke accounts.google.com...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4" />
                    <span>Buka Pemilihan Akun Google Sekarang &rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Preview Simulation Fallback */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Belum punya Google Client ID?
                </span>
                <span className="text-[10px] text-slate-400">Pilih Akun Gmail Cepat</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleSimulateAccount({
                      name: 'Mugi Aadha',
                      email: 'mugiaadha@gmail.com',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    })
                  }
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-200 hover:border-nac-primary hover:bg-sky-50/50 transition text-left text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Mugi Aadha"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <span className="font-bold text-slate-800 text-[11px] block truncate">Mugi Aadha</span>
                      <span className="text-[10px] text-slate-500 block truncate">mugiaadha@gmail.com</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
                    Masuk Langsung
                  </span>
                </button>
              </div>

              <div className="text-center pt-1">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buat Client ID di Google Cloud Console (Gratis)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
