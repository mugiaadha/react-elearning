import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import paymentService from '../../services/paymentService';
import userService from '../../services/userService';
import isDevMode from '../../config/devMode';
import Badge from '../../components/common/Badge';
import {
  FileText,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Wallet,
  Building2,
  Receipt
} from 'lucide-react';

const MIDTRANS_CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-iYmlaWrW2PDwihZw';
const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

export const PaymentPendingPage = () => {
  const { user, refreshProfile, logout, setPaymentStatus } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceIdParam = searchParams.get('invoice_id');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(Boolean(invoiceIdParam));
  const [paying, setPaying] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Dynamically inject Midtrans Snap JS SDK
  useEffect(() => {
    if (window.snap) {
      setSnapLoaded(true);
      return;
    }

    const scriptId = 'midtrans-snap-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = MIDTRANS_SNAP_URL;
      script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
      script.async = true;
      script.onload = () => {
        setSnapLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Midtrans Snap SDK script');
      };
      document.body.appendChild(script);
    } else {
      setSnapLoaded(true);
    }
  }, []);

  // Load specific invoice if query parameter invoice_id is present
  useEffect(() => {
    if (invoiceIdParam) {
      setLoadingInvoice(true);
      userService
        .getEnrollments()
        .then((list) => {
          const found = list.find(
            (e) => e.invoice_id === invoiceIdParam || e.brevet_id === invoiceIdParam || e.slug === invoiceIdParam
          );
          if (found) {
            setSelectedInvoice(found);
          }
        })
        .catch((err) => console.warn('Failed to load invoice param enrollment', err))
        .finally(() => setLoadingInvoice(false));
    }
  }, [invoiceIdParam]);

  // If already approved, automatically redirect to student dashboard
  useEffect(() => {
    if (user?.role === 'student' && user?.payment_status === 'APPROVED') {
      if (!invoiceIdParam) {
        navigate('/dashboard/student');
      } else if (!loadingInvoice && selectedInvoice && selectedInvoice.payment_status === 'APPROVED') {
        navigate('/dashboard/student/my-courses');
      }
    }
  }, [user, navigate, invoiceIdParam, selectedInvoice, loadingInvoice]);

  const invoice = selectedInvoice || user?.active_brevet || {
    id: 'brevet-ab',
    title: 'Brevet Pajak A & B Terpadu',
    invoice_id: 'INV-NAC-2026-0892',
    amount: 2750000,
    registered_date: '2026-10-12',
    payment_method: 'Midtrans Payment Gateway',
  };

  const invoiceNumber = invoice.invoice_id || invoice.invoice_number || 'INV-NAC-2026-0892';
  const brevetId = invoice.brevet_id || invoice.id || 'brevet-ab';
  const amount = Number(invoice.amount) || 2750000;

  // Trigger celebratory confetti upon successful payment
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Check live status directly from Backend & Midtrans API
  const handleCheckStatus = useCallback(async (silent = false) => {
    try {
      setCheckingStatus(true);
      if (!silent) {
        showToast('Memeriksa status pembayaran ke Midtrans...', 'loading', 1500);
      }
      const res = await paymentService.checkPaymentStatus(invoiceNumber);
      const paymentData = res.data;
      setPaymentDetails(paymentData);

      if (paymentData?.status === 'APPROVED') {
        triggerConfetti();
        showToast('Pembayaran Anda telah Lunas & Terverifikasi! Membuka akses kelas...', 'success', 3500);
        await refreshProfile();
        if (invoiceIdParam) {
          navigate('/dashboard/student/my-courses');
        } else {
          navigate('/dashboard/student');
        }
      } else if (!silent) {
        if (paymentData?.status === 'PENDING_APPROVAL' || paymentData?.transaction_status === 'pending') {
          showToast('Menunggu pembayaran diselesaikan melalui Midtrans.', 'info', 3000);
        } else if (paymentData?.status === 'REJECTED') {
          showToast('Transaksi dibatalkan atau kedaluwarsa.', 'warning', 3000);
        } else {
          showToast('Status saat ini: ' + (paymentData?.status || 'PENDING'), 'info', 2500);
        }
      }
    } catch (err) {
      if (!silent) {
        showToast(err.message || 'Gagal memeriksa status pembayaran.', 'error');
      }
    } finally {
      setCheckingStatus(false);
    }
  }, [invoiceNumber, refreshProfile, navigate, invoiceIdParam, showToast]);

  // Main Action: Trigger Midtrans Snap Popup
  const handlePayWithMidtrans = async () => {
    if (!window.snap && !snapLoaded) {
      showToast('Sedang memuat sistem pembayaran Midtrans, silakan tunggu sebentar...', 'info', 2500);
      return;
    }

    try {
      setPaying(true);
      showToast('Menghubungkan ke Midtrans Payment Gateway...', 'loading', 2000);

      const response = await paymentService.createSnapToken({
        invoiceId: invoiceNumber,
        brevetId: brevetId,
      });

      const snapToken = response.data?.token;

      if (!snapToken) {
        throw new Error('Token transaksi Midtrans tidak valid.');
      }

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: async (result) => {
            console.log('Midtrans Snap Success:', result);
            triggerConfetti();
            showToast('Pembayaran berhasil! Mengaktifkan ruang kelas...', 'success', 4000);
            await handleCheckStatus(true);
            await refreshProfile();
            if (invoiceIdParam) {
              navigate('/dashboard/student/my-courses');
            } else {
              navigate('/dashboard/student');
            }
          },
          onPending: async (result) => {
            console.log('Midtrans Snap Pending:', result);
            showToast('Menunggu Anda menyelesaikan pembayaran.', 'info', 4000);
            await handleCheckStatus(true);
          },
          onError: (result) => {
            console.error('Midtrans Snap Error:', result);
            showToast('Pembayaran gagal diproses oleh bank/gerbang pembayaran.', 'error', 4000);
          },
          onClose: async () => {
            showToast('Jendela pembayaran ditutup. Anda dapat melanjutkan pembayaran kapan saja.', 'info', 2500);
            await handleCheckStatus(true);
          },
        });
      } else {
        // Fallback to redirection URL if Snap popup script blocked by browser
        if (response.data?.redirect_url) {
          window.location.href = response.data.redirect_url;
        } else {
          showToast('Gagal memuat pop-up Midtrans Snap. Silakan muat ulang halaman.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memulai transaksi Midtrans.', 'error', 4000);
    } finally {
      setPaying(false);
    }
  };

  // Instant simulation helper for evaluators/devs
  const handleSimulateApproval = async () => {
    try {
      setSimulating(true);
      showToast('Menjalankan simulasi persetujuan instan (Dev Mode)...', 'loading', 1500);
      await paymentService.simulateApproval(invoiceNumber);
      if (setPaymentStatus) {
        await setPaymentStatus('APPROVED');
      }
      triggerConfetti();
      await refreshProfile();
      showToast('Simulasi sukses! Pembayaran disetujui (Settlement).', 'success', 3000);
      if (invoiceIdParam) {
        navigate('/dashboard/student/my-courses');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal memproses simulasi.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* 3-Step Visual Progress Breadcrumb */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-xs font-semibold text-emerald-700">1. Pendaftaran</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-200 max-w-[60px]"></div>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-xs font-semibold text-emerald-700">2. Email Terverifikasi</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-200 max-w-[60px]"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-nac-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
              3
            </div>
            <span className="text-xs font-bold text-slate-900">3. Pembayaran</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs text-slate-500 shrink-0">
            {user.role === 'student' && user.email_verified_at && (
              invoiceIdParam ? (
                <Link
                  to="/dashboard/student/my-courses"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali ke Kursus Saya
                </Link>
              ) : (
                <Link
                  to="/dashboard/student"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Dashboard Mahasiswa
                </Link>
              )
            )}
            <span>Akun: <strong>{user.email}</strong></span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="text-slate-500 hover:text-rose-600 font-medium ml-1 transition"
            >
              (Ganti Akun)
            </button>
          </div>
        )}
      </div>

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border-l-4 border-sky-500 p-5 rounded-r-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
            <h2 className="text-base font-bold text-slate-900">
              Gerbang Pembayaran Midtranss (Otomatis & Real-time)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pembayaran Anda diverifikasi secara otomatis dalam hitungan detik. Ruang kelas dan materi brevet akan langsung terbuka setelah transaksi berhasil.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Badge status="PENDING_APPROVAL" size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Invoice Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-nac-primary flex items-center justify-center text-white">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Rincian Tagihan Resmi</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {invoiceNumber}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                MENUNGGU PEMBAYARAN
              </span>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Program Terpilih</span>
                <span className="font-bold text-slate-900">{invoice.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Midtrans Snap (Multi-Channel)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Waktu Kedaluwarsa</span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> 24 Jam sejak sesi dibuka
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 text-base">
                <span className="font-bold text-slate-800">Total Tagihan (Nett)</span>
                <span className="text-2xl font-black text-nac-primary">
                  Rp {amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Supported Payment Channels Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-nac-primary" />
              Metode Pembayaran yang Didukung Midtrans
            </h4>
            <p className="text-xs text-slate-500">
              Pilih metode yang paling nyaman bagi Anda saat jendela pembayaran terbuka:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <QrCode className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                <span className="font-bold text-xs text-slate-800 block">QRIS</span>
                <span className="text-[10px] text-slate-500">GoPay, ShopeePay, Semua Bank</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Building2 className="w-6 h-6 mx-auto text-sky-600 mb-1" />
                <span className="font-bold text-xs text-slate-800 block">Virtual Account</span>
                <span className="text-[10px] text-slate-500">BCA, Mandiri, BNI, BRI, Permata</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <CreditCard className="w-6 h-6 mx-auto text-indigo-600 mb-1" />
                <span className="font-bold text-xs text-slate-800 block">Kartu Kredit</span>
                <span className="text-[10px] text-slate-500">Visa, Mastercard, JCB (3D Secure)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <Receipt className="w-6 h-6 mx-auto text-amber-600 mb-1" />
                <span className="font-bold text-xs text-slate-800 block">Gerai Tunai</span>
                <span className="text-[10px] text-slate-500">Indomaret & Alfamart</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Transaksi dienkripsi penuh dengan standar keamanan Bank Indonesia & PCI-DSS Level 1.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Midtrans Pay Trigger & Status Checker */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-nac-primary flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Pembayaran Instan</h4>
                <p className="text-xs text-slate-500">Midtrans Payment Gateway</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Nomor Tagihan:</span>
                  <span className="font-mono font-bold text-slate-900">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Tagihan:</span>
                  <span className="font-bold text-nac-primary text-sm">
                    Rp {amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Penerima:</span>
                  <span className="font-semibold text-slate-800">NAC Tax Center Indonesia</span>
                </div>
              </div>

              {/* Main Pay Button */}
              <button
                type="button"
                onClick={handlePayWithMidtrans}
                disabled={paying}
                className="w-full btn-primary text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membuka Gerbang Midtrans...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Bayar Sekarang dengan Midtrans</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Status Sync Button */}
              <button
                type="button"
                onClick={() => handleCheckStatus(false)}
                disabled={checkingStatus}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin text-nac-primary' : ''}`} />
                <span>Sudah bayar? Cek Status Pembayaran</span>
              </button>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Setelah pembayaran selesai di aplikasi perbankan atau dompet digital Anda, status tagihan akan otomatis terverifikasi tanpa perlu kirim struk manual.
              </p>
            </div>

            {/* Dev Mode Simulation Card */}
            {isDevMode && (
              <div className="mt-6 pt-5 border-t border-slate-100 bg-amber-50/60 -mx-6 -mb-6 p-5 rounded-b-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Simulasi Evaluator / Dev Mode
                </div>
                <p className="text-[11px] text-amber-800 mb-3">
                  Untuk menguji alur verifikasi otomatis tanpa kartu uji Midtrans:
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={simulating}
                    onClick={handleSimulateApproval}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-60"
                  >
                    {simulating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses Simulasi...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulasikan Pembayaran Lunas (Settlement)</span>
                      </>
                    )}
                  </button>
                  <Link
                    to="/admin/payments"
                    className="text-center text-[11px] text-slate-700 hover:text-slate-900 font-semibold underline"
                  >
                    Atau buka Panel Admin Transaksi (/admin/payments) &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
