import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import brevetService from '../../services/brevetService';
import certificateService from '../../services/certificateService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import CertificateModal from '../../components/common/CertificateModal';
import {
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  Download,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CourseLearningPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  
  // Track completed lessons IDs in state & localStorage
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    const saved = localStorage.getItem(`nac_completed_lessons_${slug}`);
    return saved ? JSON.parse(saved) : ['les-01-01'];
  });

  const [certificateData, setCertificateData] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await brevetService.getBrevetBySlug(slug || 'brevet-ab-terpadu');
        setCourse(data);
        if (data.curriculum && data.curriculum[0]?.lessons[0]) {
          setActiveLesson(data.curriculum[0].lessons[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  // Calculate overall completion percentage
  const totalLessons =
    course?.curriculum?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 1;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true;
    // Sequential unlock: previous module must have all lessons completed
    const prevModule = course?.curriculum[moduleIndex - 1];
    if (!prevModule) return true;
    return prevModule.lessons.every((les) => completedLessonIds.includes(les.id));
  };

  const handleToggleComplete = async (lessonId) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    let updated;
    if (isCompleted) {
      updated = completedLessonIds.filter((id) => id !== lessonId);
    } else {
      updated = [...completedLessonIds, lessonId];
    }
    setCompletedLessonIds(updated);
    localStorage.setItem(`nac_completed_lessons_${slug}`, JSON.stringify(updated));

    // Persist to real backend SQLite database
    try {
      await userService.updateCourseProgress({
        slug: slug || 'brevet-ab-terpadu',
        lessonId,
        completed: !isCompleted,
      });
      showToast(
        !isCompleted ? 'Materi berhasil ditandai selesai! Progres tersimpan.' : 'Materi ditandai belum selesai.',
        'success'
      );
    } catch (err) {
      console.warn('Backend progress sync notice:', err);
    }

    // If hits 100%, trigger digital certificate engine
    if (updated.length >= totalLessons) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      try {
        const newCert = await certificateService.issueCertificate({
          studentName: user?.name || 'Mahasiswa NAC Tax Center',
          courseTitle: course?.title || 'Brevet Pajak A & B Terpadu',
          score: 95.0,
        });
        setCertificateData(newCert);
        showToast('Selamat! Anda telah menuntaskan seluruh materi. Sertifikat kelulusan telah diterbitkan!', 'success');
      } catch (e) {
        console.warn('Certificate issuance notice:', e);
      }
    }
  };

  const handleClaimCertificate = async () => {
    if (!certificateData) {
      try {
        const newCert = await certificateService.issueCertificate({
          studentName: user?.name || 'Mahasiswa NAC Tax Center',
          courseTitle: course?.title || 'Brevet Pajak A & B Terpadu',
          score: 95.0,
        });
        setCertificateData(newCert);
      } catch (e) {
        console.warn('Claim certificate notice:', e);
      }
    }
    setIsCertModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-nac-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Memuat ruang kelas & silabus interaktif...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-800">Kursus tidak ditemukan.</h2>
        <Link to="/dashboard/student" className="text-sm text-nac-primary underline mt-2 block">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              Kelas Aktif
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Kurikulum Standar UU HPP & Coretax 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{course.title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{course.tagline}</p>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="w-full md:w-64 bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progres Kelulusan</span>
            <span className="font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            {completedCount} dari {totalLessons} materi selesai
          </div>
        </div>
      </div>

      {/* 100% Certificate Unlocked Banner */}
      {progressPercent === 100 && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-5 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Selamat! Anda Telah Menyelesaikan 100% Modul</h3>
              <p className="text-xs font-medium text-slate-900">
                Sertifikat kelulusan digital resmi Anda telah diterbitkan dengan Nomor Seri Registrasi unik.
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimCertificate}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-slate-950 hover:bg-slate-900 shadow-md transition"
          >
            <Award className="w-4 h-4 text-amber-400" />
            Buka & Cetak Sertifikat Digital
          </button>
        </div>
      )}

      {/* Main Grid: Player on Left, Modules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video / Lesson Classroom */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Player Container */}
            <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
              {activeLesson?.video_url ? (
                <iframe
                  className="w-full h-full"
                  src={`${activeLesson.video_url}?autoplay=0&rel=0`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center text-slate-400 p-8 space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    Materi Latihan Mandiri / Modul Studi Kasus
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Unduh file materi dan template spreadsheet di bawah untuk mempraktikkan perhitungan pajak.
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Info & Actions */}
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Durasi: {activeLesson?.duration || '45 Menit'}</span>
                    <span>•</span>
                    <span className="capitalize">{activeLesson?.type || 'Video Kuliah'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{activeLesson?.title}</h3>
                </div>

                {/* Mark as Complete Toggle */}
                {activeLesson && (
                  <button
                    onClick={() => handleToggleComplete(activeLesson.id)}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      completedLessonIds.includes(activeLesson.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'btn-emerald text-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {completedLessonIds.includes(activeLesson.id)
                      ? 'Selesai Dipelajari'
                      : 'Tandai Selesai & Lanjut'}
                  </button>
                )}
              </div>

              {/* Handouts & Downloads */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bahan Ajar & File Praktik Pendukung:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Mengunduh handout materi perkuliahan resmi NAC Tax Center (PDF)...');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <div>
                        <span className="font-semibold text-slate-800 block">Slide Materi Handout.pdf</span>
                        <span className="text-[10px] text-slate-400">PDF • 4.2 MB</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                  </a>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Mengunduh template kertas kerja perhitungan PPh 21 TER / Formulir 1771...');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-slate-800 block">Template Kertas Kerja.xlsx</span>
                        <span className="text-[10px] text-slate-400">Excel • 1.8 MB</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                  </a>
                </div>
              </div>

              {/* Q&A Help Box */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-900">
                <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Ada pertanyaan seputar studi kasus materi ini?</span>
                  <p className="text-[11px] text-sky-700 mt-0.5">
                    Konsultasikan langsung dengan instruktur BKP melalui forum diskusi angkatan Anda di grup Telegram eksklusif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sequential Module Syllabus Accordion */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Daftar Modul & Materi</h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {course.curriculum?.length} Modul
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {course.curriculum?.map((module, mIdx) => {
                const unlocked = isModuleUnlocked(mIdx);
                const isCurrentActive = activeModuleIndex === mIdx;

                return (
                  <div
                    key={module.id}
                    className={`rounded-xl border transition-all ${
                      unlocked
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-200/60 bg-slate-50/80 opacity-75'
                    }`}
                  >
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => unlocked && setActiveModuleIndex(mIdx)}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {unlocked ? (
                            <span className="w-5 h-5 rounded-full bg-nac-primary/10 text-nac-primary text-[11px] font-bold flex items-center justify-center">
                              {mIdx + 1}
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {module.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {module.duration} • {module.lessons?.length} Materi
                          </div>
                        </div>
                      </div>

                      {unlocked && (
                        <div>
                          {isCurrentActive ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Module Lessons (Shown if active module & unlocked) */}
                    {unlocked && isCurrentActive && (
                      <div className="px-3 pb-3 space-y-1.5 border-t border-slate-100 pt-2">
                        {module.lessons?.map((les) => {
                          const isCompleted = completedLessonIds.includes(les.id);
                          const isSelected = activeLesson?.id === les.id;

                          return (
                            <button
                              key={les.id}
                              onClick={() => setActiveLesson(les)}
                              className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 transition ${
                                isSelected
                                  ? 'bg-sky-50 text-nac-primary font-bold border border-sky-200'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                                <span className="truncate">{les.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {les.duration}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={
          certificateData || {
            certificate_id: 'NAC-CERT-2026-AB-88219',
            recipient_name: user?.name || 'Dimas Anindito Pratama',
            course_title: course?.title || 'Brevet Pajak A & B Terpadu',
            issue_date: new Date().toISOString().split('T')[0],
            grade: 'Sangat Memuaskan (A)',
            score: 94.5,
            director_name: 'Dr. Hendrawan Kartiko, S.E., S.H., LL.M., BKP C',
          }
        }
      />
    </div>
  );
};

export default CourseLearningPage;
