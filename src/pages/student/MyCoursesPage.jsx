import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { BookOpen, GraduationCap, Clock, Award } from 'lucide-react';

export const MyCoursesPage = () => {
  const { user, refreshProfile } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProfile?.();
    userService.getEnrollments()
      .then((data) => {
        setEnrollments(data || []);
      })
      .catch((err) => console.warn('Failed to load enrollments', err))
      .finally(() => setLoading(false));
  }, []);

  const coursesToDisplay =
    enrollments.length > 0
      ? enrollments
      : user?.active_brevet
      ? [user.active_brevet]
      : [];

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

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Memuat daftar kursus Anda...
        </div>
      ) : coursesToDisplay.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Program Brevet yang Diikuti</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Silakan pilih dan daftar program pelatihan Brevet Pajak unggulan kami untuk memulai belajar.
          </p>
          <Link to="/brevet" className="btn-primary text-xs inline-flex items-center gap-2 mt-2">
            Lihat Katalog Brevet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coursesToDisplay.map((courseItem) => {
            const progress = Number(courseItem.progress_percentage ?? 0);
            const courseSlug = courseItem.slug || 'brevet-ab-terpadu';

            return (
              <div
                key={courseItem.id || courseSlug}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      progress === 100
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : progress > 0
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {progress === 100
                      ? 'Selesai (Lulus)'
                      : progress > 0
                      ? 'Sedang Berjalan (Active)'
                      : 'Terdaftar (Baru)'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {courseItem.invoice_id || 'Batch 2026'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    {courseItem.title || 'Brevet Pajak A & B Terpadu'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Kurikulum terpadu KUP, PPh 21 TER, PPh Badan, PPN 11/12%, dan Simulasi Coretax DJP.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progres Belajar</span>
                    <span
                      className={`font-bold ${
                        progress === 100
                          ? 'text-emerald-600'
                          : progress > 0
                          ? 'text-nac-primary'
                          : 'text-slate-400'
                      }`}
                    >
                      {progress === 100
                        ? '100% Selesai'
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

                <div className="pt-2">
                  <Link
                    to={`/dashboard/student/course/${courseSlug}`}
                    className="w-full btn-primary text-xs py-2.5"
                  >
                    <GraduationCap className="w-4 h-4" />
                    {progress === 100
                      ? 'Buka Ruang Kelas & Materi'
                      : progress > 0
                      ? 'Lanjutkan Belajar di Ruang Kelas'
                      : 'Mulai Belajar di Ruang Kelas'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
