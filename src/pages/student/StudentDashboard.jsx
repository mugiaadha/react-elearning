import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import brevetService from '../../services/brevetService';
import userService from '../../services/userService';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import Badge from '../../components/common/Badge';
import {
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  Compass,
  FileCheck2,
  Video,
  CheckCircle2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, refreshProfile } = useAuth();
  const [brevet, setBrevet] = useState(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState(null);
  const [revisions, setRevisions] = useState([]);

  const activeBrevet = user?.active_brevet || {
    title: 'Brevet Pajak A & B Terpadu',
    slug: 'brevet-ab-terpadu',
    progress_percentage: 0,
  };

  const courseSlug = activeBrevet.slug || 'brevet-ab-terpadu';

  useEffect(() => {
    apiClient.get(ENDPOINTS.USER_SUBMISSIONS)
      .then((res) => {
        const subs = res.data || [];
        const revs = subs.filter((s) => s.status === 'REVISION');
        setRevisions(revs);
      })
      .catch(() => {});
  }, [courseSlug]);

  useEffect(() => {
    userService.getEnrollments()
      .then((enrollments) => {
        if (enrollments && enrollments.length > 0) {
          const active = enrollments.find((e) => e.slug === courseSlug) || enrollments[0];
          if (active && typeof active.progress_percentage === 'number') {
            setEnrollmentProgress(active.progress_percentage);
          }
        }
      })
      .catch(() => {});
  }, [courseSlug]);

  useEffect(() => {
    brevetService.getBrevetBySlug(courseSlug)
      .then(setBrevet)
      .catch(() => {});
  }, [courseSlug]);

  // Local user-scoped progress calculation to prevent UI lag
  const localProg = user?.id ? (() => {
    try {
      const saved = localStorage.getItem(`nac_completed_lessons_${user.id}_${activeBrevet.slug || 'brevet-ab-terpadu'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 12 regular lessons + 5 exams = 17 items total in brevet-ab
          return Math.min(100, Math.round((parsed.length / 17) * 100));
        }
      }
    } catch (e) {}
    return null;
  })() : null;

  const serverProgress = Number(
    enrollmentProgress !== null
      ? enrollmentProgress
      : (activeBrevet.progress_percentage ?? 0)
  );

  const progress = localProg !== null ? Math.max(serverProgress, localProg) : serverProgress;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-nac-navy to-nac-primary rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            Portal Pembelajaran Terakreditasi
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user?.name || 'Mahasiswa'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pembayaran Anda telah diverifikasi oleh tim keuangan NAC. Silakan lanjutkan pembelajaran kurikulum perpajakan terapan Anda.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to={`/dashboard/student/course/${activeBrevet.slug || 'brevet-ab-terpadu'}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition text-xs sm:text-sm"
            >
              <GraduationCap className="w-4 h-4" />
              Lanjutkan Belajar Sekarang
            </Link>
            <Link
              to="/dashboard/student/certificates"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 transition"
            >
              <Award className="w-4 h-4 text-amber-300" />
              Status Sertifikat Kelulusan
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Alert Banner: Perlu Tindakan Revisi Ulangan dari Pengajar */}
      {revisions.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-orange-400 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 text-white shadow-inner">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-full bg-white text-orange-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Tindakan Siswa
                </span>
                <span className="text-xs font-bold text-orange-100">
                  {revisions.length} Modul Meminta Revisi Lembar Jawaban
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white">
                Instruktur meminta perbaikan lembar jawaban pada: {revisions.map((r) => r.module_title || r.module_id).join(', ')}
              </h4>
              <p className="text-xs text-orange-100 leading-relaxed max-w-xl">
                Catatan Guru: "{revisions[0]?.teacher_feedback || 'Perbaiki format perhitungan dan lampiran kertas kerja Anda.'}"
              </p>
            </div>
          </div>
          <Link
            to={`/dashboard/student/course/${activeBrevet.slug || 'brevet-ab-terpadu'}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-white hover:bg-orange-50 text-orange-950 shadow-md transition shrink-0 self-stretch sm:self-auto text-center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            <span>Buka & Perbaiki Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Grid: Active Course Card + Next Live Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Brevet Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-nac-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Program Brevet Aktif Anda
                </h3>
                <p className="text-xs text-slate-500">Angkatan Berjalan 2026</p>
              </div>
            </div>
            <Badge status="ACTIVE" size="sm" />
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                {activeBrevet.title}
              </h4>
              <p className="text-xs text-slate-500">
                Instruktur: {activeBrevet.instructor_name || (activeBrevet.id === 'coretax-mastery' ? 'Ratna Paramitha, S.E., M.Si., BKP' : 'Bambang Sudarmono, BKP')} • Total {activeBrevet.modules_count || (activeBrevet.id === 'coretax-mastery' ? 1 : 5)} Modul Terpadu
              </p>
            </div>
            <Link
              to={`/dashboard/student/course/${activeBrevet.slug || 'brevet-ab-terpadu'}`}
              className="btn-primary text-xs shrink-0"
            >
              Masuk Ruang Kelas &rarr;
            </Link>
          </div>

          {/* Progress overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Progres Pembelajaran Keseluruhan</span>
              <span className={`font-bold ${progress === 100 ? 'text-emerald-600' : progress > 0 ? 'text-nac-primary' : 'text-slate-400'}`}>
                {progress === 100 ? '100% Selesai (Lulus)' : progress > 0 ? `${progress}% Selesai` : '0% (Belum Dimulai)'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Live Session Schedule */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-nac-primary" />
            <h4 className="font-bold text-slate-900 text-sm">Jadwal Sesi Mendatang</h4>
          </div>

          <div className="space-y-3">
            {(() => {
              const bId = activeBrevet?.id || activeBrevet?.slug || 'brevet-ab';
              const schedules = bId.includes('coretax')
                ? [
                    { title: 'Praktik e-Bupot 21/26 Coretax DJP', type: 'Live Zoom', time: 'Sabtu, 18 Okt 2026 • 09.00 - 12.00 WIB', bg: 'amber' },
                    { title: 'Simulasi Deposit Pajak & Buku Besar WP Coretax', type: 'Praktik', time: 'Rabu, 22 Okt 2026 • 19.00 - 21.00 WIB', bg: 'slate' }
                  ]
                : bId.includes('brevet-c') || bId.includes('c-eksekutif')
                ? [
                    { title: 'Klinik Tax Treaty & TP PMK 172/2023', type: 'Live Zoom', time: 'Sabtu, 18 Okt 2026 • 09.00 - 12.00 WIB', bg: 'amber' },
                    { title: 'Penyusunan Local File & Master File TP Doc', type: 'Praktik', time: 'Kamis, 23 Okt 2026 • 19.00 - 21.00 WIB', bg: 'slate' }
                  ]
                : [
                    { title: 'Webinar Q&A Kasus PPh 21 TER Terpadu', type: 'Live Zoom', time: 'Sabtu, 18 Okt 2026 • 09.00 - 12.00 WIB', bg: 'amber' },
                    { title: 'Simulasi e-Faktur 4.0 Desktop & PPN 1111', type: 'Praktik', time: 'Rabu, 22 Okt 2026 • 19.00 - 21.00 WIB', bg: 'slate' }
                  ];

              return schedules.map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    s.bg === 'amber'
                      ? 'bg-amber-50/70 border-amber-200/60'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`flex items-center justify-between font-bold ${s.bg === 'amber' ? 'text-amber-900' : 'text-slate-800'}`}>
                    <span>{s.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.bg === 'amber' ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'}`}>
                      {s.type}
                    </span>
                  </div>
                  <p className={s.bg === 'amber' ? 'text-slate-600' : 'text-slate-500'}>{s.time}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Multi-Brevet Enrollment Banner (Requirement) */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-emerald-800/40">
        <div className="space-y-2 max-w-2xl">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            Multi-Brevet Enrollment
          </span>
          <h3 className="text-xl sm:text-2xl font-bold">
            Tingkatkan Kualifikasi Anda: Ambil Brevet C Eksekutif atau Simulasi Coretax DJP
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sebagai mahasiswa aktif NAC Tax Center, Anda berhak mendapatkan diskon alumni khusus 20% untuk pendaftaran program brevet spesialisasi berikutnya.
          </p>
        </div>

        <Link
          to="/brevet"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md transition text-xs sm:text-sm"
        >
          <Compass className="w-4 h-4" />
          Jelajahi Katalog Brevet
        </Link>
      </div>
    </div>
  );
};

export const StudentDashboardPage = StudentDashboard;
export default StudentDashboard;
