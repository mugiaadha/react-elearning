import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import brevetService from '../../services/brevetService';
import certificateService from '../../services/certificateService';
import userService from '../../services/userService';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
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
  HelpCircle,
  ExternalLink,
  UploadCloud,
  RotateCcw,
  AlertCircle,
  Check,
  Video,
  FileCheck,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper to convert any YouTube URL into an embeddable format
const formatYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

// Helper for material file badges
const getMaterialTypeMeta = (type) => {
  switch (type) {
    case 'video':
      return { label: 'Video YouTube', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Video };
    case 'excel':
      return { label: 'Spreadsheet Excel (GDrive)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileText };
    case 'word':
      return { label: 'Dokumen Word (GDrive)', bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: FileText };
    case 'ppt':
      return { label: 'Slide Presentasi PPT (GDrive)', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: FileText };
    case 'pdf':
    default:
      return { label: 'Dokumen PDF (GDrive)', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileText };
  }
};

export const CourseLearningPage = () => {
  const { slug } = useParams();
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // Active chapter in the module: lesson.id (for Bab 1, 2, ...) OR 'EXAM' (strictly for Bab Akhir)
  const [activeLessonId, setActiveLessonId] = useState(null);

  // Student submissions for this course/brevet
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submissionUrlInput, setSubmissionUrlInput] = useState('');
  const [submissionNotesInput, setSubmissionNotesInput] = useState('');
  const fileInputRef = useRef(null);

  // User-scoped storage key helper
  const getUserLessonKey = (targetSlug) => {
    return user?.id ? `nac_completed_lessons_${user.id}_${targetSlug || slug}` : null;
  };

  // Track completed lessons IDs in state & localStorage (strictly scoped per user ID and slug)
  const [completedLessonIds, setCompletedLessonIds] = useState(() => {
    // Purge any legacy un-scoped key
    try {
      localStorage.removeItem(`nac_completed_lessons_${slug}`);
    } catch (e) {}

    // Priority 1: User's real backend enrollment data
    if (user?.active_brevet && (user.active_brevet.slug === slug || user.active_brevet.id === slug)) {
      return user.active_brevet.completed_lessons || [];
    }

    // Priority 2: User-scoped localStorage
    if (user?.id) {
      const saved = localStorage.getItem(`nac_completed_lessons_${user.id}_${slug}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });

  const [certificateData, setCertificateData] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Sync completed lessons when course slug or user changes
  useEffect(() => {
    if (!slug) return;
    try {
      localStorage.removeItem(`nac_completed_lessons_${slug}`);
    } catch (e) {}

    if (user?.active_brevet && (user.active_brevet.slug === slug || user.active_brevet.id === slug)) {
      setCompletedLessonIds(user.active_brevet.completed_lessons || []);
      return;
    }

    if (user?.id) {
      const saved = localStorage.getItem(`nac_completed_lessons_${user.id}_${slug}`);
      if (saved) {
        try {
          setCompletedLessonIds(JSON.parse(saved));
          return;
        } catch (e) {}
      }
    }

    setCompletedLessonIds([]);
  }, [slug, user?.id, user?.active_brevet]);

  // Fetch course & submissions
  const fetchCourseAndSubmissions = async () => {
    try {
      setLoading(true);
      const data = await brevetService.getBrevetBySlug(slug || 'brevet-ab-terpadu');
      setCourse(data);

      if (data.curriculum && data.curriculum[0]?.lessons?.[0]) {
        setActiveLessonId(data.curriculum[0].lessons[0].id);
      }

      // Fetch fresh user profile from backend to sync real enrollment progress
      let freshCompleted = [];
      try {
        const profile = await userService.getProfile();
        if (
          profile?.active_brevet &&
          (profile.active_brevet.slug === slug ||
            profile.active_brevet.id === slug ||
            profile.active_brevet.id === data.id)
        ) {
          freshCompleted = profile.active_brevet.completed_lessons || [];
        }
      } catch (profErr) {
        console.warn('Profile fetch notice:', profErr);
      }

      // Check user-scoped localStorage
      if (user?.id) {
        const userKey = `nac_completed_lessons_${user.id}_${slug}`;
        const saved = localStorage.getItem(userKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            freshCompleted = Array.from(new Set([...freshCompleted, ...parsed]));
          } catch (e) {}
        }
      }

      setCompletedLessonIds(freshCompleted);

      // Fetch user's exam submissions
      try {
        const subRes = await apiClient.get(`${ENDPOINTS.USER_SUBMISSIONS}?brevet_id=${data.id || slug}`);
        setUserSubmissions(subRes.data || []);
      } catch (subErr) {
        console.warn('Submissions fetch notice:', subErr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndSubmissions();
  }, [slug]);

  const activeModule = course?.curriculum?.[activeModuleIndex] || course?.curriculum?.[0];
  const regularLessons = activeModule?.lessons || [];

  // Standardized exam definition for the active module
  const activeModuleExam = activeModule?.exam || {
    id: `exam-${activeModule?.id || 'mod-1'}`,
    title: `Latihan & Ulangan Akhir Modul ${activeModuleIndex + 1}: ${activeModule?.title || 'Studi Kasus'}`,
    description: 'Unduh lembar soal studi kasus dari guru di atas. Selesaikan penghitungannya, lalu unggah file lembar jawaban Anda di bawah. Modul berikutnya akan terbuka setelah Anda mengunggah jawaban.',
    question_url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
  };

  // TRUE ONLY when student is explicitly on the Final Exam Chapter
  const isExamSelected = activeLessonId === 'EXAM';
  const activeLesson = isExamSelected
    ? null
    : regularLessons.find((l) => l.id === activeLessonId) || regularLessons[0];

  // Active lesson index among regular lessons
  const activeLessonIndex = regularLessons.findIndex((l) => l.id === activeLesson?.id);

  // Submission record for this module's exam
  const activeModuleSubmission = userSubmissions.find(
    (s) => s.module_id === activeModule?.id || s.module_id === activeModuleExam.id || s.module_id === `exam-${activeModule?.id}`
  );

  // Module Unlock Logic: Module N unlocks only when Module N-1 has its final exam submitted!
  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true;
    const prevModule = course?.curriculum?.[moduleIndex - 1];
    if (!prevModule) return false;

    // Check if student submitted previous module exam
    const prevExamKey = `exam-${prevModule.id}`;
    const hasSubmittedPrevExam =
      userSubmissions.some(
        (s) => s.module_id === prevModule.id || s.module_id === prevModule.exam?.id || s.module_id === prevExamKey
      ) || completedLessonIds.includes(prevExamKey);

    return Boolean(hasSubmittedPrevExam);
  };

  // Chapter Unlock Logic (STRICT SEQUENTIAL LOCKING):
  // - Bab 1: Always unlocked in an unlocked module
  // - Bab N (N > 1): Unlocked ONLY if Bab N-1 is completed
  // - Bab Akhir (Exam): Unlocked ONLY if ALL regular lessons in this module are completed!
  const isChapterUnlocked = (moduleIdx, chapterIdx, isExamChapter) => {
    if (!isModuleUnlocked(moduleIdx)) return false;
    const targetMod = course?.curriculum?.[moduleIdx];
    if (!targetMod) return false;

    const lessons = targetMod.lessons || [];

    // Bab 1 is always unlocked in an unlocked module
    if (chapterIdx === 0 && !isExamChapter) return true;

    // Regular chapter: PREVIOUS chapter must be completed
    if (!isExamChapter) {
      const prevLesson = lessons[chapterIdx - 1];
      return prevLesson ? completedLessonIds.includes(prevLesson.id) : false;
    }

    // Final Exam Chapter: all previous lessons in this module must be completed
    return lessons.length > 0 && lessons.every((l) => completedLessonIds.includes(l.id));
  };

  // Calculate overall course progress percentage (accurately scoped to THIS course)
  const allCourseLessons = course?.curriculum?.flatMap((m) => m.lessons || []) || [];
  const completedCourseLessons = allCourseLessons.filter((l) => completedLessonIds.includes(l.id));

  const totalModules = course?.curriculum?.length || 1;
  const completedModulesList = course?.curriculum?.filter((m) => {
    const examKey = `exam-${m.id}`;
    return (
      userSubmissions.some(
        (s) => s.module_id === m.id || s.module_id === m.exam?.id || s.module_id === examKey
      ) || completedLessonIds.includes(examKey)
    );
  }) || [];

  const completedExamsCount = completedModulesList.length;
  const totalCourseItems = allCourseLessons.length + totalModules;
  const completedCourseItems = completedCourseLessons.length + completedExamsCount;
  const progressPercent = totalCourseItems > 0
    ? Math.min(100, Math.round((completedCourseItems / totalCourseItems) * 100))
    : 0;

  // Completion & Teacher Review Graduation States:
  const allModulesFinished =
    totalModules > 0 &&
    completedExamsCount === totalModules &&
    completedCourseLessons.length === allCourseLessons.length;

  // Has teacher requested revision on any submitted assignment?
  const revisionSubmission = userSubmissions.find((s) => s.status === 'REVISION');

  // Has teacher approved the student's final exam / course?
  // Teacher approves on teacher dashboard with status === 'APPROVED'
  const isApprovedByTeacher =
    allModulesFinished &&
    userSubmissions.some((s) => s.status === 'APPROVED');

  // Waiting for evaluation?
  const isPendingEvaluation =
    allModulesFinished && !isApprovedByTeacher && !revisionSubmission;

  // Selected Chapter Lock Status:
  const isExamUnlocked = isChapterUnlocked(activeModuleIndex, 0, true);
  const isActiveLessonUnlocked =
    !isExamSelected && isChapterUnlocked(activeModuleIndex, activeLessonIndex >= 0 ? activeLessonIndex : 0, false);
  const isCurrentSelectionUnlocked = isExamSelected ? isExamUnlocked : isActiveLessonUnlocked;

  // Reset Progress Handler (for developer and testing convenience)
  const handleResetCourseProgress = async () => {
    if (!window.confirm('Reset progres pembelajaran kursus ini kembali ke Bab 1? Semua bab setelah Bab 1 akan terkunci kembali.')) {
      return;
    }
    localStorage.removeItem(`nac_completed_lessons_${slug}`);
    setCompletedLessonIds([]);
    try {
      await apiClient.post(ENDPOINTS.USER_COURSE_PROGRESS_RESET, {
        slug: course?.slug || slug || 'brevet-ab-terpadu',
      });
      const subRes = await apiClient.get(`${ENDPOINTS.USER_SUBMISSIONS}?brevet_id=${course?.id || slug}`);
      setUserSubmissions(subRes.data || []);
    } catch (e) {
      console.warn('Backend reset notice:', e);
    }
    setActiveModuleIndex(0);
    if (course?.curriculum?.[0]?.lessons?.[0]) {
      setActiveLessonId(course.curriculum[0].lessons[0].id);
    }
    showToast('Progres berhasil direset! Anda kembali di Bab 1 dengan seluruh bab berikutnya terkunci.', 'info');
  };

  // Handle Mark Chapter as Completed & Advance to Next Chapter
  const handleCompleteAndNext = async (currentLessonId, nextId) => {
    if (!completedLessonIds.includes(currentLessonId)) {
      const updated = [...completedLessonIds, currentLessonId];
      setCompletedLessonIds(updated);
      localStorage.setItem(`nac_completed_lessons_${slug}`, JSON.stringify(updated));

      try {
        await userService.updateCourseProgress({
          slug: slug || 'brevet-ab-terpadu',
          lessonId: currentLessonId,
          completed: true,
        });
        showToast('Bab berhasil diselesaikan! Bab berikutnya telah terbuka.', 'success');
      } catch (err) {
        console.warn('Backend sync notice:', err);
      }
    } else {
      showToast('Melanjutkan ke bab berikutnya...', 'info');
    }

    // Automatically navigate to next chapter or final exam
    if (nextId) {
      setActiveLessonId(nextId);
    }
  };

  // Student Submits Exam Answer (Direct File Upload OR Google Drive Link) - ONLY AT BAB AKHIR!
  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (!selectedFile && !submissionUrlInput.trim()) {
      showToast('Silakan pilih file dokumen jawaban Anda atau masukkan tautan Google Drive.', 'error');
      return;
    }

    try {
      setSubmittingExam(true);
      const formData = new FormData();
      formData.append('brevet_id', course?.id || slug);
      formData.append('module_id', activeModule?.id);
      formData.append('module_title', activeModule?.title);
      if (submissionNotesInput.trim()) {
        formData.append('notes', submissionNotesInput.trim());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (submissionUrlInput.trim()) {
        formData.append('submission_url', submissionUrlInput.trim());
      }

      const res = await apiClient.post(ENDPOINTS.USER_SUBMIT_EXAM, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Mark this module's exam in completed lessons so next module unlocks immediately!
      const examKey = `exam-${activeModule?.id}`;
      if (!completedLessonIds.includes(examKey)) {
        const nextCompleted = [...completedLessonIds, examKey];
        setCompletedLessonIds(nextCompleted);
        localStorage.setItem(`nac_completed_lessons_${slug}`, JSON.stringify(nextCompleted));
      }

      showToast(
        res.message || 'Lembar jawaban ujian berhasil diunggah! Modul berikutnya kini telah terbuka.',
        'success'
      );

      setSelectedFile(null);
      setSubmissionUrlInput('');
      setSubmissionNotesInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh submissions list
      const subRes = await apiClient.get(`${ENDPOINTS.USER_SUBMISSIONS}?brevet_id=${course?.id || slug}`);
      setUserSubmissions(subRes.data || []);

      // If last module exam, celebrate!
      if (activeModuleIndex === (course?.curriculum?.length || 1) - 1) {
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to submit exam', err);
      showToast(err.message || 'Gagal mengirimkan lembar jawaban ke server.', 'error');
    } finally {
      setSubmittingExam(false);
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

  // Find all Google Drive documents in this active module for students to download
  const gdriveDocuments = regularLessons.filter((l) => l.type !== 'video' && l.url);

  // Next chapter destination when clicking "Lanjut"
  const nextChapterId =
    activeLessonIndex < regularLessons.length - 1
      ? regularLessons[activeLessonIndex + 1].id
      : 'EXAM';

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
            {import.meta.env.VITE_DEV_MODE === 'true' && (
              <button
                onClick={handleResetCourseProgress}
                className="px-2.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[11px] font-semibold border border-rose-500/30 transition inline-flex items-center gap-1 ml-2"
                title="Mode Pengujian: Reset kembali ke Bab 1 (semua bab berikutnya terkunci)"
              >
                <RotateCcw className="w-3 h-3" />
                Reset ke Bab 1 (Dev)
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{course.title}</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{course.tagline}</p>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="w-full md:w-64 bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progres Pembelajaran & Ujian</span>
            <span className="font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-400 text-right">
            {completedExamsCount} dari {totalModules} Ulangan Modul Selesai
          </div>
        </div>
      </div>

      {/* 1. LULUS OLEH GURU (GRADUATED & APPROVED) - SERTIFIKAT DIGITAL TERBIT */}
      {isApprovedByTeacher && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-5 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Selamat! Anda Telah Dinyatakan LULUS oleh Pengajar</h3>
              <p className="text-xs font-medium text-slate-900">
                Seluruh modul & ujian telah selesai dievaluasi oleh Pengajar. Sertifikat kelulusan resmi Anda telah diterbitkan dengan Nomor Registrasi BKP unik.
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

      {/* 2. MENUNGGU EVALUASI PENGAJAR (SELURUH MODUL SELESAI, SEDANG DIPERIKSA GURU) */}
      {isPendingEvaluation && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-emerald-200 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Seluruh Modul & Ujian Telah Selesai Dikumpulkan!</h3>
              <p className="text-xs text-emerald-100">
                Lembar jawaban Anda sedang dalam proses peninjauan dan penilaian oleh Pengajar. Sertifikat resmi akan diterbitkan setelah Pengajar meluluskan evaluasi akhir Anda.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30 text-emerald-100">
            Status: Menunggu Penilaian Pengajar
          </span>
        </div>
      )}

      {/* 3. PERMINTAAN REVISI DARI GURU */}
      {revisionSubmission && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Pengajar Meminta Revisi pada Jawaban Ulangan</h3>
              <p className="text-xs text-amber-100">
                Terdapat catatan dari pengajar: "{revisionSubmission.teacher_feedback || 'Mohon perbaiki lembar jawaban sesuai petunjuk'}". Silakan periksa modul terkait dan kirimkan kembali jawaban revisi Anda.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-4 py-2 rounded-xl bg-slate-950 text-amber-400 text-xs font-bold">
            Perlu Revisi
          </span>
        </div>
      )}

      {/* Main Grid: Learning Area (lg:col-span-8) & Modules Syllabus (lg:col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Layar Besar Pembelajaran */}
        <div className="lg:col-span-8 space-y-6">
          {!isCurrentSelectionUnlocked ? (
            /* ============================================================== */
            /* KONDISI AKSES TERKUNCI: BAB SEBELUMNYA BELUM SELESAI           */
            /* ============================================================== */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                  Akses Terkunci Secara Berurutan
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {isExamSelected ? 'Ulangan Akhir Modul Ini Masih Terkunci' : `Bab ${activeLessonIndex + 1} Masih Terkunci`}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isExamSelected
                    ? `Anda harus menyelesaikan dan mempelajari seluruh ${regularLessons.length} bab materi kuliah pada modul ini terlebih dahulu sebelum dapat mengakses lembar soal dan form uploader ulangan akhir modul.`
                    : `Anda harus menyelesaikan Bab ${activeLessonIndex} terlebih dahulu sebelum dapat mengakses dan mempelajari materi pada Bab ${activeLessonIndex + 1}.`}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const firstIncomplete = regularLessons.find((l) => !completedLessonIds.includes(l.id)) || regularLessons[0];
                    if (firstIncomplete) {
                      setActiveLessonId(firstIncomplete.id);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-nac-primary hover:bg-nac-primary/90 text-xs shadow-md transition"
                >
                  <PlayCircle className="w-4 h-4" />
                  Buka Bab yang Sedang Berjalan
                </button>
              </div>
            </div>
          ) : !isExamSelected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* 1. LAYAR BESAR DI ATAS: VIDEO YOUTUBE DARI GURU */}
              {activeLesson?.type === 'video' && (activeLesson.video_url || activeLesson.url) ? (
                <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
                  <iframe
                    className="w-full h-full"
                    src={formatYouTubeEmbedUrl(activeLesson.video_url || activeLesson.url)}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-300">
                    <FileText className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    Materi Bacaan & Dokumen Kuliah
                  </span>
                  <h3 className="text-lg font-bold text-white max-w-lg mx-auto">
                    {activeLesson?.title || 'Materi Modul Ajar'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Pelajari materi di bawah ini dan unduh dokumen lampiran yang disediakan pengajar.
                  </p>
                </div>
              )}

              {/* 2. DI BAWAH LAYAR BESAR: INFO MATERI & DOKUMEN GOOGLE DRIVE */}
              <div className="p-5 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Durasi: {activeLesson?.duration || '45 Menit'}</span>
                      <span>•</span>
                      <span className="capitalize">{activeLesson?.type || 'Video Kuliah'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Bab {activeLessonIndex + 1}: {activeLesson?.title}
                    </h3>
                  </div>

                  {/* TOMBOL: TANDAI SELESAI & BUKA BAB BERIKUTNYA */}
                  {activeLesson && (
                    <button
                      onClick={() => handleCompleteAndNext(activeLesson.id, nextChapterId)}
                      className="shrink-0 btn-emerald text-xs inline-flex items-center gap-2 py-2 px-4 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {completedLessonIds.includes(activeLesson.id)
                        ? activeLessonIndex === regularLessons.length - 1
                          ? 'Sudah Selesai (Lanjut ke Bab Akhir / Ulangan)'
                          : 'Sudah Selesai (Lanjut ke Bab Berikutnya)'
                        : activeLessonIndex === regularLessons.length - 1
                        ? 'Tandai Selesai & Buka Bab Akhir (Ulangan)'
                        : 'Tandai Selesai & Buka Bab Berikutnya'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* DOKUMEN-DOKUMEN DARI GOOGLE DRIVE YANG DIKASIH GURU (MURID BISA DOWNLOAD) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-nac-primary" />
                      Dokumen Bahan Ajar Google Drive (Download Materi dari Guru):
                    </h4>
                    <span className="text-[11px] text-slate-400">Unduh & Pelajari</span>
                  </div>

                  {gdriveDocuments.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      Materi bab ini disajikan melalui video kuliah interaktif. Silakan tonton sampai selesai, lalu klik tombol di atas untuk membuka bab berikutnya.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gdriveDocuments.map((doc) => {
                        const meta = getMaterialTypeMeta(doc.type);
                        const IconComp = meta.icon;
                        return (
                          <div
                            key={doc.id}
                            className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 text-xs transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                                <IconComp className="w-4 h-4 text-nac-primary" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 block truncate">
                                  {doc.title}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {meta.label} • {doc.duration || 'Bahan Ajar'}
                                </span>
                              </div>
                            </div>

                            {/* Tombol Download Materi dari Guru */}
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nac-primary/10 hover:bg-nac-primary text-nac-primary hover:text-white font-bold text-xs transition"
                              title="Download Materi dari Guru"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Info Card: Menjelaskan bahwa Uploader HANYA ada di Bab Akhir */}
                <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-900">
                  <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Informasi Alur Belajar Modul:</span>
                    <p className="text-[11px] text-sky-800 mt-0.5 leading-relaxed">
                      Selesaikan setiap bab materi secara berurutan. Bab selanjutnya akan otomatis terbuka setelah Anda menyelesaikan bab ini. Form uploader lembar jawaban <span className="font-bold">hanya tersedia pada Bab Akhir (Ulangan Modul)</span> sebagai syarat kelulusan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* KONDISI 2: HANYA PADA BAB AKHIR MODUL (LATIHAN & ULANGAN)       */
            /* HANYA DI SINILAH UPLOADER JAWABAN SISWA MUNCUL!                */
            /* ============================================================== */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-7">
              {/* Header Bab Akhir: Latihan & Ulangan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                        Bab Akhir • Ulangan Modul {activeModuleIndex + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• Syarat Buka Modul Berikutnya</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {activeModuleExam.title}
                    </h3>
                  </div>
                </div>

                {/* Tombol Download Soal Latihan dari Guru */}
                {activeModuleExam.question_url && (
                  <a
                    href={activeModuleExam.question_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow transition self-start sm:self-auto"
                  >
                    <Download className="w-4 h-4" />
                    Download Lembar Soal (Google Drive)
                  </a>
                )}
              </div>

              {/* Petunjuk Soal dari Pengajar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-500">
                  Petunjuk Pengerjaan Ulangan:
                </span>
                <p className="leading-relaxed">
                  {activeModuleExam.description}
                </p>
              </div>

              {/* Status Evaluasi / Kelulusan dari Guru */}
              {activeModuleSubmission && (
                <div className="space-y-3">
                  {/* Status: REVISION (Guru Meminta Revisi) */}
                  {activeModuleSubmission.status === 'REVISION' && (
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 font-bold text-xs text-orange-800">
                        <RotateCcw className="w-4 h-4 text-orange-600 shrink-0" />
                        <span>Guru Meminta Revisi Lembar Jawaban Ulangan Ini!</span>
                      </div>

                      {activeModuleSubmission.teacher_feedback && (
                        <div className="bg-white/90 p-3 rounded-xl border border-orange-200 text-xs space-y-1">
                          <span className="font-bold text-orange-900 text-[11px] block">
                            Catatan Revisi dari Guru:
                          </span>
                          <p className="text-slate-800 italic">
                            "{activeModuleSubmission.teacher_feedback}"
                          </p>
                        </div>
                      )}

                      <p className="text-[11px] text-orange-900 leading-relaxed">
                        Perbaiki file lembar jawaban Anda sesuai catatan guru di atas, lalu unggah file jawaban revisi yang baru di form bawah ini.
                      </p>
                    </div>
                  )}

                  {/* Status: APPROVED (Lulus) */}
                  {activeModuleSubmission.status === 'APPROVED' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>LULUS! Ulangan Modul Ini Telah Diterima oleh Guru</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-xs font-mono">
                          Nilai: {activeModuleSubmission.score || 95} / 100
                        </span>
                      </div>

                      {activeModuleSubmission.teacher_feedback && (
                        <div className="bg-white/90 p-3 rounded-xl border border-emerald-200 text-xs">
                          <span className="font-bold text-emerald-900 text-[11px] block mb-0.5">
                            Catatan Apresiasi Pengajar:
                          </span>
                          <p className="text-slate-800 italic">
                            "{activeModuleSubmission.teacher_feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status: PENDING (Menunggu Penilaian) */}
                  {activeModuleSubmission.status === 'PENDING' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                        <Check className="w-4 h-4 text-amber-600" />
                        <span>Jawaban Berhasil Terkirim (Menunggu Evaluasi Pengajar)</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Jawaban Anda telah masuk antrean penilaian instruktur. <span className="font-bold">Modul berikutnya kini telah terbuka</span> dan dapat langsung Anda pelajari tanpa menunggu evaluasi selesai.
                      </p>
                    </div>
                  )}

                  {/* Preview File Jawaban yang Sudah Terkumpul */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        File / Tautan Jawaban yang Sudah Diunggah:
                      </span>
                      <span className="font-bold text-slate-800 block mt-0.5">
                        {activeModuleSubmission.file_size || 'File Dokumen Terunggah'}
                      </span>
                      {activeModuleSubmission.submission_notes && (
                        <span className="text-slate-500 text-[11px] block mt-0.5">
                          Catatan: "{activeModuleSubmission.submission_notes}"
                        </span>
                      )}
                    </div>

                    <a
                      href={activeModuleSubmission.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs shrink-0 self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      Buka File Jawaban
                    </a>
                  </div>
                </div>
              )}

              {/* UPLOADER EKSKLUSIF: HANYA ADA DI BAB AKHIR INI */}
              {(!activeModuleSubmission || activeModuleSubmission.status === 'REVISION') && (
                <form onSubmit={handleSubmitExam} className="space-y-4 pt-2">
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-1">
                      <UploadCloud className="w-4 h-4 text-nac-primary" />
                      Upload Langsung Lembar Jawaban Ulangan:
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pilih file jawaban Anda dari komputer (Excel .xlsx, PDF, Word .docx, ZIP) atau sertakan tautan Google Drive.
                    </p>
                  </div>

                  {/* File Upload Box (Drag and Drop / File Picker) */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      selectedFile
                        ? 'border-emerald-400 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-nac-primary bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.pdf,.docx,.doc,.zip,.rar"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="space-y-1.5">
                        <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                        <span className="font-bold text-slate-900 block text-xs">
                          {selectedFile.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {(selectedFile.size / 1048576).toFixed(2)} MB • Klik untuk mengganti file
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <span className="font-bold text-nac-primary text-xs hover:underline block">
                            Klik di sini untuk memilih file lembar jawaban
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Mendukung file Excel (.xlsx), PDF, Word (.docx), atau ZIP (Maks. 35 MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opsi Tambahan: Link Google Drive */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Atau Tautan Google Drive (Jika Jawaban Disimpan di Cloud)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={submissionUrlInput}
                      onChange={(e) => setSubmissionUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-nac-primary bg-white"
                    />
                  </div>

                  {/* Catatan Pengerjaan Siswa */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Catatan Tambahan untuk Pengajar (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Kertas kerja perhitungan PPh 21 TER dan rekonsiliasi fiskal telah selesai dikerjakan pada sheet 1 dan 2..."
                      value={submissionNotesInput}
                      onChange={(e) => setSubmissionNotesInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-nac-primary bg-white"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingExam}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-nac-primary hover:bg-nac-primary/90 text-white shadow-md transition"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {submittingExam
                      ? 'Mengunggah Jawaban...'
                      : activeModuleSubmission?.status === 'REVISION'
                      ? 'Kirim Ulang Jawaban Revisi'
                      : 'Kirim Lembar Jawaban & Buka Modul Berikutnya'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Daftar Bab / Chapters dalam Modul (Dengan Chapter-by-Chapter Locking) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Silabus & Kunci Bab Belajar</h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {course.curriculum?.length} Modul
              </span>
            </div>

            <div className="space-y-3">
              {course.curriculum?.map((module, mIdx) => {
                const isModUnlocked = isModuleUnlocked(mIdx);
                const isCurrentModule = activeModuleIndex === mIdx;

                // Check module exam submission status
                const moduleSub = userSubmissions.find(
                  (s) => s.module_id === module.id || s.module_id === module.exam?.id
                );
                const hasExamSubmitted = Boolean(moduleSub) || completedLessonIds.includes(`exam-${module.id}`);

                return (
                  <div
                    key={module.id || mIdx}
                    className={`rounded-xl border transition-all ${
                      isModUnlocked
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-200/60 bg-slate-50/80 opacity-70'
                    }`}
                  >
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => {
                        if (isModUnlocked) {
                          setActiveModuleIndex(mIdx);
                          if (module.lessons?.[0]) {
                            setActiveLessonId(module.lessons[0].id);
                          } else {
                            setActiveLessonId('EXAM');
                          }
                        } else {
                          showToast(`Selesaikan dan kumpulkan ulangan Modul ${mIdx} terlebih dahulu untuk membuka modul ini.`, 'warning');
                        }
                      }}
                      className="w-full text-left p-3.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {isModUnlocked ? (
                            <span
                              className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                                hasExamSubmitted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-nac-primary/10 text-nac-primary'
                              }`}
                            >
                              {hasExamSubmitted ? <Check className="w-3 h-3" /> : mIdx + 1}
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {module.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span>{module.duration || '8 Jam'}</span>
                            <span>•</span>
                            <span>{(module.lessons?.length || 0) + 1} Bab</span>
                            {hasExamSubmitted && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-bold">Ulangan Selesai</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isModUnlocked && (
                        <div>
                          {isCurrentModule ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* CHAPTERS INSIDE ACTIVE MODULE: CHAPTER-PER-CHAPTER LOCKING */}
                    {isModUnlocked && isCurrentModule && (
                      <div className="px-3 pb-3 space-y-1.5 border-t border-slate-100 pt-2">
                        {/* 1. BAB-BAB MATERI BIASA (BAB 1, BAB 2, DST) - TIDAK ADA UPLOADER! */}
                        {module.lessons?.map((les, cIdx) => {
                          const isCompleted = completedLessonIds.includes(les.id);
                          const isSelected = activeLessonId === les.id;
                          const isChapUnlocked = isChapterUnlocked(mIdx, cIdx, false);

                          return (
                            <button
                              key={les.id}
                              onClick={() => {
                                if (isChapUnlocked) {
                                  setActiveLessonId(les.id);
                                } else {
                                  showToast(`Selesaikan Bab ${cIdx} terlebih dahulu untuk membuka Bab ${cIdx + 1}.`, 'warning');
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 transition ${
                                !isChapUnlocked
                                  ? 'text-slate-400 bg-slate-50/50 opacity-60 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-sky-50 text-nac-primary font-bold border border-sky-200 shadow-sm'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {!isChapUnlocked ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                                <span className="truncate">Bab {cIdx + 1}: {les.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {!isChapUnlocked ? 'Terkunci' : les.duration}
                              </span>
                            </button>
                          );
                        })}

                        {/* 2. BAB AKHIR: KHUSUS LATIHAN & ULANGAN MODUL (SATU-SATUNYA YANG ADA UPLOADER) */}
                        {(() => {
                          const isExamUnlocked = isChapterUnlocked(mIdx, 0, true);

                          return (
                            <button
                              onClick={() => {
                                if (isExamUnlocked) {
                                  setActiveLessonId('EXAM');
                                } else {
                                  showToast('Selesaikan semua bab materi di modul ini terlebih dahulu sebelum membuka ulangan akhir modul.', 'warning');
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between border transition ${
                                !isExamUnlocked
                                  ? 'border-slate-200 text-slate-400 bg-slate-50/50 opacity-60 cursor-not-allowed'
                                  : activeLessonId === 'EXAM'
                                  ? 'bg-amber-100/90 text-amber-950 font-extrabold border-amber-300 shadow-sm ring-1 ring-amber-300'
                                  : hasExamSubmitted
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/60 font-bold'
                              }`}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                {!isExamUnlocked ? (
                                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                ) : (
                                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                                )}
                                <span className="truncate">
                                  🎯 Bab Akhir: Latihan & Ulangan Modul
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  !isExamUnlocked
                                    ? 'bg-slate-200 text-slate-500'
                                    : hasExamSubmitted
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-amber-200 text-amber-900'
                                }`}
                              >
                                {!isExamUnlocked ? 'Terkunci' : hasExamSubmitted ? 'Terkumpul' : 'Uploader'}
                              </span>
                            </button>
                          );
                        })()}
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
            recipient_name: user?.name || 'Mahasiswa NAC Tax Center',
            course_title: course?.title || 'Brevet Pajak A & B Terpadu',
            issue_date: new Date().toISOString().split('T')[0],
            grade: 'Sangat Memuaskan (A)',
            score: 95.0,
            director_name: 'Dr. Hendrawan Kartiko, S.E., S.H., LL.M., BKP C',
          }
        }
      />
    </div>
  );
};

export default CourseLearningPage;
