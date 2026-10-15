import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import userService from '../../../services/userService';
import brevetService from '../../../services/brevetService';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  Sparkles,
  CheckCircle2,
  Check,
  Plus,
  AlertCircle,
  ArrowRight,
  X,
  CreditCard,
  Layers,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const MyCoursesPage = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchingBrevetId, setSwitchingBrevetId] = useState(null);

  // Modal for "Ambil Program Brevet Tambahan"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogBrevets, setCatalogBrevets] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [enrollingBrevetId, setEnrollingBrevetId] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await userService.getEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.warn('Failed to load enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Filter approved enrollments (ready for learning) and pending payments
  const approvedCourses = enrollments.filter((e) => e.payment_status === 'APPROVED');
  const pendingCourses = enrollments.filter((e) => e.payment_status === 'PENDING_APPROVAL');

  // Fallback to user.active_brevet if enrollments API hasn't loaded yet
  const coursesToDisplay = approvedCourses.length > 0
    ? approvedCourses
    : user?.payment_status === 'APPROVED' && user?.active_brevet
      ? [{
        id: user.active_brevet.id || 'brevet-ab',
        brevet_id: user.active_brevet.id || 'brevet-ab',
        title: user.active_brevet.title || 'Brevet Pajak A & B Terpadu',
        slug: user.active_brevet.slug || 'brevet-ab-terpadu',
        description: user.active_brevet.description || 'Kurikulum terpadu KUP, PPh 21 TER, PPh Badan, PPN 11/12%, dan Simulasi Coretax DJP.',
        invoice_id: user.active_brevet.invoice_id || 'Batch 2026',
        amount: user.active_brevet.amount || 2750000,
        payment_status: 'APPROVED',
        is_active: true,
        progress_percentage: user.active_brevet.progress_percentage || 0,
      }]
      : [];

  // Resolve which course is strictly the current active classroom (ensures only ONE course is active)
  const activeCourseItem = coursesToDisplay.find((c) => c.is_active)
    || (user?.active_brevet && coursesToDisplay.find((c) =>
      c.brevet_id === user.active_brevet.id ||
      c.id === user.active_brevet.id ||
      c.slug === user.active_brevet.slug
    ))
    || coursesToDisplay[0];

  const activeCourseKey = activeCourseItem
    ? (activeCourseItem.brevet_id || activeCourseItem.id || activeCourseItem.slug)
    : null;

  const getUserLocalProgress = (courseSlug) => {
    if (!user?.id) return null;
    try {
      const saved = localStorage.getItem(`nac_completed_lessons_${user.id}_${courseSlug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 12 regular lessons + 5 exams = 17 items total in standard brevet
          return Math.min(100, Math.round((parsed.length / 17) * 100));
        }
      }
    } catch (e) { }
    return null;
  };

  // Handle switching active classroom
  const handleSetActiveClass = async (courseItem) => {
    const targetId = courseItem.brevet_id || courseItem.slug || courseItem.id;
    try {
      setSwitchingBrevetId(courseItem.id || targetId);
      const res = await userService.setActiveBrevet(targetId);
      await refreshProfile?.();
      await fetchEnrollments();
      showToast(
        res?.message || `Ruang kelas aktif dialihkan ke ${courseItem.title}.`,
        'success',
        3500
      );
    } catch (err) {
      console.error(err);
      showToast(
        err?.response?.data?.message || err.message || 'Gagal mengubah ruang kelas aktif.',
        'error',
        4000
      );
    } finally {
      setSwitchingBrevetId(null);
    }
  };

  // Open modal and load catalog
  const handleOpenAddBrevetModal = async () => {
    setIsModalOpen(true);
    if (catalogBrevets.length === 0) {
      try {
        setLoadingCatalog(true);
        const data = await brevetService.getAllBrevets();
        setCatalogBrevets(data || []);
      } catch (e) {
        console.warn('Failed to load catalog', e);
      } finally {
        setLoadingCatalog(false);
      }
    }
  };

  // Handle enrolling into additional brevet
  const handleEnrollNewBrevet = async (brevet) => {
    try {
      setEnrollingBrevetId(brevet.id);
      showToast(`Mendaftarkan program ${brevet.title}...`, 'loading', 2000);
      const res = await userService.enrollBrevet(brevet.id);

      const invoiceId = res?.data?.invoice_id || res?.data?.payment?.invoice_number;
      await refreshProfile?.();
      setIsModalOpen(false);

      showToast(
        `Pendaftaran ${brevet.title} berhasil! Mengalihkan ke pembayaran...`,
        'success',
        3000
      );

      // Redirect student to payment page with invoice parameter
      navigate(`/onboarding/payment-pending?invoice_id=${invoiceId || ''}`);
    } catch (err) {
      console.error(err);
      showToast(
        err?.response?.data?.message || err.message || 'Gagal mendaftar program brevet tambahan.',
        'error',
        4000
      );
    } finally {
      setEnrollingBrevetId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-nac-primary" />
            Kursus & Brevet Saya
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar program pelatihan Brevet resmi Anda. Pilih kelas mana yang sedang aktif untuk dipelajari hari ini.
          </p>
        </div>

        <button
          onClick={handleOpenAddBrevetModal}
          className="btn-primary text-xs inline-flex items-center gap-2 self-start sm:self-auto py-2.5 px-4 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Ambil Program Brevet Tambahan</span>
        </button>
      </div>

      {/* Pending Approval Payments Alert Banner */}
      {pendingCourses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 text-amber-950 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tagihan Program Brevet Tambahan Menunggu Pembayaran ({pendingCourses.length})</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Anda memiliki pendaftaran program yang belum diselesaikan pembayarannya. Setelah bukti transfer diunggah dan disetujui admin, program akan otomatis muncul di bawah dan siap Anda pelajari.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingCourses.map((pendingItem) => (
              <div
                key={pendingItem.id || pendingItem.invoice_id}
                className="bg-white/90 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block truncate">
                    {pendingItem.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {pendingItem.invoice_id} • Rp {Number(pendingItem.amount || 2750000).toLocaleString('id-ID')}
                  </span>
                </div>
                <Link
                  to={`/onboarding/payment-pending?invoice_id=${pendingItem.invoice_id}`}
                  className="btn-primary text-xs shrink-0 py-1.5 px-3 whitespace-nowrap"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Bayar Tagihan
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content: Enrolled Approved Courses */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          <RefreshCw className="w-6 h-6 text-nac-primary animate-spin mx-auto mb-2" />
          Memuat daftar kursus Anda...
        </div>
      ) : coursesToDisplay.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Belum Ada Program Brevet yang Aktif</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {pendingCourses.length > 0
              ? 'Pendaftaran Anda sedang dalam proses verifikasi pembayaran. Silakan selesaikan pembayaran tagihan di atas.'
              : 'Silakan pilih dan daftar program pelatihan Brevet Pajak unggulan kami untuk memulai belajar.'}
          </p>
          <button
            onClick={handleOpenAddBrevetModal}
            className="btn-primary text-xs inline-flex items-center gap-2 mt-2 py-2 px-4"
          >
            <Plus className="w-4 h-4" />
            Pilih Program Brevet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coursesToDisplay.map((courseItem) => {
            const courseSlug = courseItem.slug || 'brevet-ab-terpadu';
            const serverProg = Number(courseItem.progress_percentage ?? 0);
            const localProg = getUserLocalProgress(courseSlug);
            const progress = localProg !== null ? Math.max(serverProg, localProg) : serverProg;

            // Check if this course is the current active classroom (strictly 1 active classroom)
            const currentItemKey = courseItem.brevet_id || courseItem.id || courseItem.slug;
            const isActiveClass = Boolean(currentItemKey && currentItemKey === activeCourseKey);

            const isSwitching = switchingBrevetId === (courseItem.id || courseItem.brevet_id);

            return (
              <div
                key={courseItem.id || courseSlug}
                className={`bg-white rounded-2xl border transition-all p-6 shadow-sm space-y-5 relative overflow-hidden ${isActiveClass
                  ? 'border-emerald-400 ring-2 ring-emerald-500/20 shadow-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                {/* Active Indicator Top Stripe */}
                {isActiveClass && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                )}

                <div className="flex justify-between items-start gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {isActiveClass ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        Ruang Kelas Sedang Aktif
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        Terdaftar Resmi
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${progress === 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : progress > 0
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                    >
                      {progress === 100
                        ? '100% Lulus'
                        : progress > 0
                          ? `${progress}% Berjalan`
                          : 'Materi Baru'}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {courseItem.invoice_id || 'Batch 2026'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {courseItem.title || 'Brevet Pajak Terpadu'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {courseItem.description ||
                      courseItem.tagline ||
                      'Program pelatihan Brevet Pajak terapan resmi standar UU HPP & Coretax DJP.'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Progres Pembelajaran</span>
                    <span
                      className={`font-bold ${progress === 100
                        ? 'text-emerald-600'
                        : progress > 0
                          ? 'text-nac-primary'
                          : 'text-slate-400'
                        }`}
                    >
                      {progress === 100
                        ? '100% Selesai (Lulus)'
                        : progress > 0
                          ? `${progress}% Selesai`
                          : '0% (Belum Dimulai)'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2.5">
                  {isActiveClass ? (
                    <Link
                      to={`/dashboard/student/course/${courseSlug}`}
                      className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Masuk ke Ruang Kelas Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSetActiveClass(courseItem)}
                        disabled={isSwitching}
                        className="flex-1 btn-emerald text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        title="Jadikan kelas ini sebagai kelas yang tampil di Dashboard Anda"
                      >
                        {isSwitching ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>{isSwitching ? 'Mengalihkan...' : 'Jadikan Ruang Kelas Aktif'}</span>
                      </button>

                      <Link
                        to={`/dashboard/student/course/${courseSlug}`}
                        className="btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Buka Kelas</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AMBIL PROGRAM BREVET TAMBAHAN                         */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-nac-primary/10 text-nac-primary text-xs font-bold uppercase tracking-wider inline-block mb-1.5">
                  Katalog Brevet Lanjutan
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Ambil Program Brevet Tambahan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Pilih program sertifikasi perpajakan resmi berikutnya untuk memperluas kompetensi Anda.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Catalog Grid */}
            {loadingCatalog ? (
              <div className="py-16 text-center text-xs text-slate-400">
                <RefreshCw className="w-7 h-7 text-nac-primary animate-spin mx-auto mb-2" />
                Memuat katalog program brevet...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {catalogBrevets.map((b) => {
                  // Check if student already enrolled in this brevet
                  const existingApproved = approvedCourses.find(
                    (e) => e.brevet_id === b.id || e.slug === b.slug
                  );
                  const existingPending = pendingCourses.find(
                    (e) => e.brevet_id === b.id || e.slug === b.slug
                  );
                  const isEnrolling = enrollingBrevetId === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition ${existingApproved
                        ? 'bg-slate-50 border-slate-200 opacity-90'
                        : existingPending
                          ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300'
                          : 'bg-white border-slate-200 hover:border-nac-primary hover:shadow-md'
                        }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
                            {b.badge || 'Brevet Terapan'}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            {b.duration || '2 Bulan'}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-snug">
                            {b.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-3">
                            {b.description || b.tagline}
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">Investasi Program:</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-extrabold text-slate-900 font-mono">
                              Rp {Number(b.price || 2750000).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 mt-3 border-t border-slate-100">
                        {existingApproved ? (
                          <div className="w-full py-2 px-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Sudah Terdaftar (Aktif)</span>
                          </div>
                        ) : existingPending ? (
                          <button
                            onClick={() => {
                              setIsModalOpen(false);
                              navigate(`/onboarding/payment-pending?invoice_id=${existingPending.invoice_id}`);
                            }}
                            className="w-full btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Lanjut Pembayaran</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnrollNewBrevet(b)}
                            disabled={isEnrolling}
                            className="w-full btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                          >
                            {isEnrolling ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                            <span>{isEnrolling ? 'Mendaftarkan...' : 'Daftar & Bayar'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Footer Note */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-nac-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Alur Pendaftaran Brevet Tambahan:</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Setelah memilih program dan mengklik Daftar, invoice tagihan baru akan langsung tercatat di Riwayat Tagihan Anda. Anda akan diarahkan ke halaman pembayaran untuk mentransfer dan mengunggah bukti pembayaran. Setelah diapprove admin, kelas baru akan langsung terbuka di daftar Kursus Saya dan dapat Anda aktifkan kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
