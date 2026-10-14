import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import brevetService from '../../services/brevetService';
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
  CheckCircle2
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [brevet, setBrevet] = useState(null);

  useEffect(() => {
    brevetService.getBrevetBySlug(user?.active_brevet?.slug || 'brevet-ab-terpadu')
      .then(setBrevet)
      .catch(() => {});
  }, [user]);

  const activeBrevet = user?.active_brevet || {
    title: 'Brevet Pajak A & B Terpadu',
    slug: 'brevet-ab-terpadu',
    progress_percentage: 20,
  };

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
                Instruktur: Bambang Sudarmono, BKP • Total 5 Modul Terpadu
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
              <span className="font-bold text-emerald-600">Terbuka Penuh</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-2/5"></div>
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
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span>Webinar Q&A Kasus PPh 21 TER</span>
                <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">Live Zoom</span>
              </div>
              <p className="text-slate-600">Sabtu, 18 Okt 2026 • 09.00 - 12.00 WIB</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Simulasi e-Faktur 4.0 Desktop</span>
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">Praktik</span>
              </div>
              <p className="text-slate-500">Rabu, 22 Okt 2026 • 19.00 - 21.00 WIB</p>
            </div>
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

export default StudentDashboardPage;
