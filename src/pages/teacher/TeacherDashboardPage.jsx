import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Video,
  FileText,
  Calendar,
  CheckCircle2,
  Sparkles,
  Plus,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Check,
  XCircle,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';

export const TeacherDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackNotice, setFeedbackNotice] = useState('');

  // Review Modal State
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [reviewModalType, setReviewModalType] = useState(null); // 'APPROVE' | 'REVISION'
  const [reviewScore, setReviewScore] = useState(90);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, subsRes] = await Promise.all([
        apiClient.get(ENDPOINTS.TEACHER_DASHBOARD),
        apiClient.get(ENDPOINTS.TEACHER_SUBMISSIONS),
      ]);
      setDashboardData(dashRes.data);
      setSubmissions(subsRes.data || dashRes.data?.pending_submissions || []);
    } catch (err) {
      console.error('Failed to fetch teacher dashboard', err);
      setError(err.message || 'Gagal memuat data dashboard pengajar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
  const revisionCount = submissions.filter((s) => s.status === 'REVISION').length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;

  // Open Review Modal
  const openReviewModal = (submission, type) => {
    setActiveSubmission(submission);
    setReviewModalType(type);
    if (type === 'APPROVE') {
      setReviewScore(submission.score || 90);
      setReviewFeedback(submission.teacher_feedback || 'Studi kasus telah diselesaikan dengan sangat baik sesuai regulasi perpajakan yang berlaku.');
    } else {
      setReviewScore(null);
      setReviewFeedback(submission.teacher_feedback || 'Mohon perbaiki bagian rekonsiliasi dan lengkapi kertas kerja, lalu unggah ulang link lembar jawaban Anda.');
    }
  };

  // Submit Review to Backend
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;

    try {
      setSubmittingReview(true);
      const payload = {
        decision: reviewModalType, // 'APPROVE' or 'REVISION'
        score: reviewModalType === 'APPROVE' ? Number(reviewScore) : null,
        feedback: reviewFeedback,
      };

      const res = await apiClient.post(
        ENDPOINTS.TEACHER_REVIEW_SUBMISSION(activeSubmission.id),
        payload
      );

      setFeedbackNotice(
        reviewModalType === 'APPROVE'
          ? `Mahasiswa ${activeSubmission.student_name} dinyatakan LULUS dengan nilai ${reviewScore}/100!`
          : `Permintaan revisi telah dikirimkan ke mahasiswa ${activeSubmission.student_name}.`
      );

      setActiveSubmission(null);
      setReviewModalType(null);
      await fetchDashboard();
      setTimeout(() => setFeedbackNotice(''), 5000);
    } catch (err) {
      console.error('Failed to submit review', err);
      alert('Gagal menyimpan evaluasi: ' + (err.message || 'Error'));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-nac-navy to-nac-primary rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Pengajar & Konsultan Pajak BKP
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Selamat Datang, {user?.name || 'Bambang Sudarmono, BKP'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Kelola kurikulum pembelajaran terapan, berikan evaluasi kelulusan atau permintaan revisi ujian modul mahasiswa, dan pantau kesiapan peserta di era Coretax DJP.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/dashboard/teacher/courses"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              Kelola & Unggah Bahan Ajar
            </Link>
            <Link
              to="/dashboard/teacher/students"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition text-white"
            >
              <Users className="w-4 h-4 text-amber-300" />
              Monitoring Mahasiswa ({dashboardData?.total_students_count || 142} Siswa)
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {feedbackNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* 4 Instructor KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Program Brevet Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-nac-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {dashboardData?.active_classes_count || 2} Program
          </div>
          <span className="text-[11px] text-teal-700 font-semibold block truncate">Brevet AB & Brevet C</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Mahasiswa Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {dashboardData?.total_students_count || 142} Siswa
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">92 aktif minggu ini</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Menunggu Evaluasi Ujian</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {pendingCount} Pengumpulan
          </div>
          <span className="text-[11px] text-slate-500 font-semibold block">
            {revisionCount} butuh revisi mahasiswa
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Sudah Lulus / Dinilai</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">
            {approvedCount} Ujian
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold block">Standar BKP Sangat Baik</span>
        </div>
      </div>

      {/* Primary Section: Student Exam Submissions & Evaluations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-nac-primary" />
              Evaluasi Ujian & Studi Kasus Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Periksa lembar jawaban Google Drive mahasiswa, putuskan kelulusan, atau minta revisi perbaikan sebelum membuka modul berikutnya.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="btn-secondary text-xs self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan Data
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { key: 'ALL', label: `Semua (${submissions.length})` },
            { key: 'PENDING', label: `Menunggu Evaluasi (${pendingCount})`, color: 'bg-amber-100 text-amber-800' },
            { key: 'REVISION', label: `Perlu Revisi (${revisionCount})`, color: 'bg-orange-100 text-orange-800' },
            { key: 'APPROVED', label: `Lulus (${approvedCount})`, color: 'bg-emerald-100 text-emerald-800' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === f.key
                  ? 'bg-nac-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-nac-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Memuat daftar tugas & ujian mahasiswa...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Tugas dalam Antrean</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua lembar jawaban mahasiswa dengan filter ini telah selesai dievaluasi atau belum ada pengumpulan baru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const isPending = sub.status === 'PENDING';
              const isApproved = sub.status === 'APPROVED';
              const isRevision = sub.status === 'REVISION';

              return (
                <div
                  key={sub.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center border border-slate-200 shrink-0">
                        {sub.student_name ? sub.student_name.charAt(0).toUpperCase() : 'M'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {sub.student_name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({sub.student_email})
                          </span>
                        </div>
                        <p className="text-xs text-nac-primary font-semibold mt-0.5">
                          {sub.course} • <span className="text-slate-700">{sub.module_title || sub.task}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {sub.submitted_at}
                      </span>
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                          Menunggu Evaluasi
                        </span>
                      )}
                      {isRevision && (
                        <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px] border border-orange-200 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" />
                          Diminta Revisi
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Lulus ({sub.score}/100)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission Details: Notes & External Link */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-8 space-y-1.5 text-xs">
                      {sub.submission_notes ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-slate-700">
                          <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                            Catatan Mahasiswa:
                          </span>
                          "{sub.submission_notes}"
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Mahasiswa tidak melampirkan catatan tambahan.
                        </span>
                      )}

                      {/* Display Existing Teacher Feedback */}
                      {sub.teacher_feedback && (
                        <div className={`p-2.5 rounded-xl border text-xs ${
                          isRevision
                            ? 'bg-orange-50/80 border-orange-200 text-orange-900'
                            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        }`}>
                          <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                            {isRevision ? 'Catatan Revisi Terakhir dari Pengajar:' : 'Catatan Apresiasi Pengajar:'}
                          </span>
                          "{sub.teacher_feedback}"
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
                      {/* Open Google Drive Submission Link */}
                      {sub.submission_url ? (
                        <a
                          href={sub.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                          Buka Lembar Jawaban (Google Drive)
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic text-center">
                          (Link Google Drive tidak terdeteksi)
                        </span>
                      )}

                      {/* Evaluation Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openReviewModal(sub, 'APPROVE')}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {isApproved ? 'Ubah Nilai' : 'Luluskan & Nilai'}
                        </button>
                        <button
                          onClick={() => openReviewModal(sub, 'REVISION')}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Minta Revisi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeSubmission && reviewModalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  {reviewModalType === 'APPROVE' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Luluskan & Berikan Skor Ujian
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5 text-amber-600" />
                      Minta Revisi Lembar Jawaban
                    </>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mahasiswa: <span className="font-bold text-slate-800">{activeSubmission.student_name}</span> ({activeSubmission.module_title || activeSubmission.task})
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSubmission(null);
                  setReviewModalType(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {reviewModalType === 'APPROVE' ? (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nilai Akhir Ujian (0 - 100) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={reviewScore}
                      onChange={(e) => setReviewScore(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Nilai di atas 70 akan membuka sertifikasi kelulusan resmi.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Catatan Apresiasi & Umpan Balik Pengajar
                    </label>
                    <textarea
                      rows={3}
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Tuliskan evaluasi atau hal positif dari pengerjaan mahasiswa..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    ></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <span className="font-bold block">Perhatian Instruksi Revisi:</span>
                    <p className="text-[11px] leading-relaxed">
                      Status tugas akan diubah menjadi <span className="font-bold">PERLU REVISI</span>. Mahasiswa akan menerima instruksi Anda di ruang kelas mereka dan dapat memperbarui link Google Drive jawaban mereka.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Instruksi Perbaikan / Bagian yang Harus Direvisi *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Contoh: Perhitungan kredit pajak PPh 22 impor belum dimasukkan ke lampiran III, mohon revisi sheet 2 dan kirimkan kembali link pengerjaannya."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                    ></textarea>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubmission(null);
                    setReviewModalType(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`btn-primary text-xs ${
                    reviewModalType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                  }`}
                >
                  {submittingReview
                    ? 'Menyimpan...'
                    : reviewModalType === 'APPROVE'
                    ? 'Simpan Kelulusan & Nilai'
                    : 'Kirimkan Permintaan Revisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructor Support & Standards Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-emerald-800/40">
        <div className="space-y-2 max-w-2xl">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            Standarisasi Penilaian Ujian BKP
          </span>
          <h3 className="text-xl sm:text-2xl font-bold">
            Pedoman Rubrik Evaluasi & Ujian Era Coretax 2026
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pastikan setiap mahasiswa mempraktikkan kertas kerja rekonsiliasi fiskal dan pengisian formulir SPT terbaru sebelum memberikan penilaian kelulusan modul.
          </p>
        </div>

        <Link
          to="/dashboard/teacher/courses"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition text-xs sm:text-sm"
        >
          <BookOpen className="w-4 h-4" />
          Kelola Silabus & Bahan Ajar
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
