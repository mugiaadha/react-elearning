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
  AlertCircle
} from 'lucide-react';

export const TeacherDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradedItems, setGradedItems] = useState([]);
  const [feedbackNotice, setFeedbackNotice] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.TEACHER_DASHBOARD);
      setDashboardData(res.data);
      const subs = res.data?.pending_submissions || [];
      setSubmissions(subs);
      // track already graded
      const alreadyGraded = subs.filter((s) => s.status === 'GRADED').map((s) => s.id);
      setGradedItems(alreadyGraded);
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

  const handleGrade = async (sub) => {
    const studentName = sub.student_name || sub.studentName;
    const score = prompt(`Masukkan nilai akhir untuk ${studentName} (0 - 100):`, '95');
    if (score) {
      try {
        await apiClient.post(ENDPOINTS.TEACHER_GRADE(sub.id), { score: Number(score) });
        setGradedItems((prev) => [...prev, sub.id]);
        setFeedbackNotice(`Tugas dari ${studentName} berhasil dinilai: ${score}/100.`);
        setTimeout(() => setFeedbackNotice(''), 4000);
      } catch (err) {
        console.error('Failed to submit grade', err);
        alert('Gagal menyimpan nilai ke server: ' + (err.message || 'Error'));
      }
    }
  };

  const pendingCount = submissions.filter((s) => !gradedItems.includes(s.id)).length;


  return (
    <div className="space-y-8">
      {/* Welcome Banner - Exact design match with Student Dashboard */}
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
            Kelola kurikulum pembelajaran terapan, berikan penilaian studi kasus mahasiswa, dan pantau kesiapan peserta menghadapi era Coretax DJP.
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
              Monitoring Mahasiswa (142 Siswa)
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
            <span className="text-xs text-slate-500 font-medium">Kelas Aktif Diampu</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-nac-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">2 Program</div>
          <span className="text-[11px] text-teal-700 font-semibold block truncate">Brevet AB & Brevet C</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Mahasiswa Aktif</span>
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
            <span className="text-xs text-slate-500 font-medium">Tugas Perlu Dinilai</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {pendingCount} Pengumpulan
          </div>
          <span className="text-[11px] text-slate-400 block">Studi Kasus Fiskal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Rata-rata Skor</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono">
            {dashboardData?.average_score || '94.2'} / 100
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold block">Standar BKP Sangat Baik</span>
        </div>
      </div>

      {/* Main Grid: Kelas yang Diampu (lg:col-span-8) & Sidebar (lg:col-span-4) - Matches Student Grid Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Classes */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-nac-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Kelas & Program yang Anda Bina
                </h3>
                <p className="text-xs text-slate-500">Angkatan Berjalan 2026 • Kurikulum Terintegrasi Coretax</p>
              </div>
            </div>
            <Link
              to="/dashboard/teacher/courses"
              className="text-xs text-nac-primary font-semibold hover:underline"
            >
              Silabus Lengkap &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {/* Class 1: Brevet AB */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Angkatan 42 • Reguler
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Brevet Pajak A & B Terpadu
                </h4>
                <p className="text-xs text-slate-500">
                  Jadwal: Selasa & Kamis 19:00 - 21:30 WIB • 92 Mahasiswa Aktif
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/dashboard/student/course/brevet-ab-terpadu"
                  className="btn-secondary text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  Preview Kelas
                </Link>
                <Link
                  to="/dashboard/teacher/courses"
                  className="btn-primary text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Kelola Bahan
                </Link>
              </div>
            </div>

            {/* Class 2: Brevet C */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    Angkatan 18 • Eksekutif
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Brevet Pajak C Eksekutif (Pajak Internasional)
                </h4>
                <p className="text-xs text-slate-500">
                  Jadwal: Sabtu 09:00 - 13:00 WIB • 50 Mahasiswa Aktif
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/dashboard/student/course/brevet-c-eksekutif"
                  className="btn-secondary text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  Preview Kelas
                </Link>
                <Link
                  to="/dashboard/teacher/courses"
                  className="btn-primary text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Kelola Bahan
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Jadwal Mengajar & Antrean Penilaian */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Zoom Session Schedule - Matches Student Schedule Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-nac-primary" />
              <h4 className="font-bold text-slate-900 text-sm">
                Jadwal Sesi Live Mengajar
              </h4>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Webinar Q&A Kasus PPh 21 TER</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                    Host Live
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Sabtu, 18 Okt 2026 • 09.00 - 12.00 WIB
                </p>
                <button
                  type="button"
                  onClick={() => alert('Membuka tautan Zoom Pengajar resmi NAC Tax Center...')}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition text-xs shadow-sm"
                >
                  <Video className="w-3.5 h-3.5" />
                  Buka Tautan Zoom Mengajar
                </button>
              </div>
            </div>
          </div>

          {/* Pending Submissions Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-nac-primary" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Pengumpulan Tugas Siswa
                </h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {pendingCount} Menunggu
              </span>
            </div>

            <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Tidak ada tugas yang menunggu penilaian.</p>
              ) : (
                submissions.map((sub) => {
                  const isGraded = gradedItems.includes(sub.id) || sub.status === 'GRADED';
                  const studentName = sub.student_name || sub.studentName;
                  const taskName = sub.task;
                  const courseName = sub.course;
                  const submittedAt = sub.submitted_at || sub.submittedAt;
                  const fileSize = sub.file_size || sub.fileSize;

                  return (
                    <div
                      key={sub.id}
                      className={`p-3 rounded-xl border transition text-xs space-y-2 ${
                        isGraded
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {studentName}
                          </span>
                          <span className="text-[10px] text-nac-primary font-semibold">
                            {courseName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {submittedAt}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {taskName}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400">{fileSize}</span>
                        {isGraded ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Dinilai {sub.score ? `(${sub.score}/100)` : ''}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGrade(sub)}
                            className="btn-primary text-[11px] py-1 px-3"
                          >
                            Beri Nilai &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Support & Curriculum Guide Banner - Matches Student's Multi-Brevet banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-emerald-800/40">
        <div className="space-y-2 max-w-2xl">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            Standarisasi Modul Terapan
          </span>
          <h3 className="text-xl sm:text-2xl font-bold">
            Pedoman Pengajaran Era Coretax DJP & Studi Kasus Rekonsiliasi Fiskal 2026
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Gunakan silabus kurikulum resmi dan rubrik penilaian terstandarisasi untuk memastikan seluruh mahasiswa memenuhi kualifikasi sertifikasi BKP dan kompetensi pajak terapan.
          </p>
        </div>

        <Link
          to="/dashboard/teacher/courses"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition text-xs sm:text-sm"
        >
          <BookOpen className="w-4 h-4" />
          Akses Silabus & Bahan Ajar
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
