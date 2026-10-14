import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, GraduationCap, Clock, Award } from 'lucide-react';

export const MyCoursesPage = () => {
  const { user } = useAuth();
  const activeBrevet = user?.active_brevet || {
    id: 'brevet-ab',
    slug: 'brevet-ab-terpadu',
    title: 'Brevet Pajak A & B Terpadu',
    progress_percentage: 25,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-nac-primary" />
            Kursus & Brevet Saya
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Program pelatihan Brevet yang Anda ikuti secara resmi di NAC Tax Center.
          </p>
        </div>

        <Link to="/brevet" className="btn-secondary text-xs">
          + Ambil Program Brevet Tambahan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Sedang Berjalan (Active)
            </span>
            <span className="text-xs text-slate-400 font-mono">Batch 42</span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-lg">{activeBrevet.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Kurikulum terpadu KUP, PPh 21 TER, PPh Badan, PPN 11/12%, dan Simulasi Coretax DJP.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Progres Belajar</span>
              <span className="font-bold text-emerald-600">40% Selesai</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-2/5"></div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={`/dashboard/student/course/${activeBrevet.slug || 'brevet-ab-terpadu'}`}
              className="w-full btn-primary text-xs py-2.5"
            >
              <GraduationCap className="w-4 h-4" />
              Lanjutkan Belajar di Ruang Kelas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
