import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import brevetService from '../../../../services/brevetService';
import certificateService from '../../../../services/certificateService';
import userService from '../../../../services/userService';
import apiClient from '../../../../services/api/apiClient';
import ENDPOINTS from '../../../../services/api/endpoints';
import { useAuth } from '../../../../context/AuthContext';
import { useToast } from '../../../../context/ToastContext';
import CertificateModal from '../../../../components/common/CertificateModal';
import {
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LearningHeaderBanners } from '../../components/LearningHeaderBanners';
import { LockedChapterView } from '../../components/LockedChapterView';
import { LessonContentView } from '../../components/LessonContentView';
import { ExamContentView } from '../../components/ExamContentView';
import { CourseSyllabusSidebar } from '../../components/CourseSyllabusSidebar';

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
      let activeUserId = user?.id;
      try {
        const profile = await userService.getProfile();
        if (profile?.id) {
          activeUserId = profile.id;
        }
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
      if (activeUserId) {
        const userKey = `nac_completed_lessons_${activeUserId}_${slug}`;
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

      // Check if student already has a claimed certificate for this course
      try {
        const certs = await certificateService.getAllCertificates();
        const existingCert = certs.find(
          (c) =>
            c.course_title?.toLowerCase().includes(data.title?.toLowerCase()) ||
            data.title?.toLowerCase().includes(c.course_title?.toLowerCase())
        );
        if (existingCert) {
          setCertificateData(existingCert);
        }
      } catch (certErr) {}
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

  // Identify all modules in the curriculum that need revision from teacher
  const modulesNeedingRevision = (course?.curriculum || []).map((mod, modIdx) => {
    const sub = userSubmissions.find(
      (s) => s.module_id === mod.id || s.module_id === mod.exam?.id || s.module_id === `exam-${mod.id}`
    );
    if (sub && sub.status === 'REVISION') {
      return {
        ...mod,
        modIdx,
        submission: sub,
        feedback: sub.teacher_feedback || 'Pengajar meminta perbaikan lembar jawaban studi kasus.',
      };
    }
    return null;
  }).filter(Boolean);

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
  const isFinalModule = activeModuleIndex === (course?.curriculum?.length || 1) - 1;
  const finalModule = course?.curriculum?.[(course?.curriculum?.length || 1) - 1];
  const finalExamSubmission = userSubmissions.find(
    (s) =>
      s.module_id === finalModule?.id ||
      s.module_id === `exam-${finalModule?.id}` ||
      s.module_id === finalModule?.exam?.id
  );

  const hasFinalExamApproved = Boolean(
    finalExamSubmission && finalExamSubmission.status === 'APPROVED'
  );

  // Strictly approved by teacher:
  // Must have existing certificate, OR all lessons & exams submitted and final exam approved by teacher
  const isApprovedByTeacher = Boolean(
    certificateData ||
    (allModulesFinished && !revisionSubmission && hasFinalExamApproved)
  );

  // Waiting for evaluation?
  // Only when student has finished modules & submitted final exam, but teacher hasn't evaluated yet
  const isPendingEvaluation = Boolean(
    !isApprovedByTeacher &&
    !revisionSubmission &&
    finalExamSubmission &&
    finalExamSubmission.status === 'PENDING'
  );

  // Selected Chapter Lock Status:
  const isExamUnlocked = isChapterUnlocked(activeModuleIndex, 0, true);
  const isActiveLessonUnlocked =
    !isExamSelected && isChapterUnlocked(activeModuleIndex, activeLessonIndex >= 0 ? activeLessonIndex : 0, false);
  const isCurrentSelectionUnlocked = isExamSelected ? isExamUnlocked : isActiveLessonUnlocked;

  // Reset Progress Handler (for developer and testing convenience)
  // Reset Progress Handler (for developer and testing convenience)
  const handleResetCourseProgress = async () => {
    if (!window.confirm('Reset progres pembelajaran kursus ini kembali ke Bab 1? Semua bab setelah Bab 1 akan terkunci kembali.')) {
      return;
    }
    try {
      localStorage.removeItem(`nac_completed_lessons_${slug}`);
      if (user?.id) {
        localStorage.removeItem(`nac_completed_lessons_${user.id}_${slug}`);
      }
    } catch (e) {}

    setCompletedLessonIds([]);
    try {
      await apiClient.post(ENDPOINTS.USER_COURSE_PROGRESS_RESET, {
        slug: course?.slug || slug || 'brevet-ab-terpadu',
      });
      await refreshProfile?.();
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
      try {
        localStorage.removeItem(`nac_completed_lessons_${slug}`);
        if (user?.id) {
          localStorage.setItem(`nac_completed_lessons_${user.id}_${slug}`, JSON.stringify(updated));
        }
      } catch (e) {}

      // Calculate accurately updated progress percentage
      const newCompletedLessons = allCourseLessons.filter((l) => updated.includes(l.id));
      const newCompletedExams = course?.curriculum?.filter((m) => {
        const examKey = `exam-${m.id}`;
        return (
          userSubmissions.some(
            (s) => s.module_id === m.id || s.module_id === m.exam?.id || s.module_id === examKey
          ) || updated.includes(examKey)
        );
      }) || [];
      const newPercent = totalCourseItems > 0
        ? Math.min(100, Math.round(((newCompletedLessons.length + newCompletedExams.length) / totalCourseItems) * 100))
        : 0;

      try {
        await userService.updateCourseProgress({
          slug: course?.slug || slug || 'brevet-ab-terpadu',
          lessonId: currentLessonId,
          completed: true,
          progress_percentage: newPercent,
        });
        await refreshProfile?.();
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
      let nextCompleted = completedLessonIds;
      if (!completedLessonIds.includes(examKey)) {
        nextCompleted = [...completedLessonIds, examKey];
        setCompletedLessonIds(nextCompleted);
        try {
          localStorage.removeItem(`nac_completed_lessons_${slug}`);
          if (user?.id) {
            localStorage.setItem(`nac_completed_lessons_${user.id}_${slug}`, JSON.stringify(nextCompleted));
          }
        } catch (e) {}
      }

      // Calculate progress percentage after this exam submission
      const newCompletedLessons = allCourseLessons.filter((l) => nextCompleted.includes(l.id));
      const newCompletedModulesList = course?.curriculum?.filter((m) => {
        const mKey = `exam-${m.id}`;
        return (
          m.id === activeModule?.id ||
          userSubmissions.some(
            (s) => s.module_id === m.id || s.module_id === m.exam?.id || s.module_id === mKey
          ) || nextCompleted.includes(mKey)
        );
      }) || [];
      const newPercent = totalCourseItems > 0
        ? Math.min(100, Math.round(((newCompletedLessons.length + newCompletedModulesList.length) / totalCourseItems) * 100))
        : 0;

      try {
        await userService.updateCourseProgress({
          slug: course?.slug || slug || 'brevet-ab-terpadu',
          lessonId: examKey,
          completed: true,
          progress_percentage: newPercent,
        });
        await refreshProfile?.();
      } catch (e) {
        console.warn('Backend exam sync notice:', e);
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

  // Selesaikan Bab Akhir dan Lanjut ke Modul Berikutnya
  const handleNextModule = async () => {
    // Record exam completion for the current module in state and persistent storage
    const currentModule = course?.curriculum?.[activeModuleIndex];
    const isFinalModuleIndex = activeModuleIndex >= (course?.curriculum?.length || 1) - 1;

    // For non-final modules, progressing to next module marks previous module exam completed.
    // For the final module, the exam CANNOT be auto-completed without actual submission!
    if (currentModule && !isFinalModuleIndex) {
      const examKey = `exam-${currentModule.id}`;
      if (!completedLessonIds.includes(examKey)) {
        const nextCompleted = [...completedLessonIds, examKey];
        setCompletedLessonIds(nextCompleted);
        const storageKey = getUserLessonKey();
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
          } catch (e) {}
        }
        userService.updateCourseProgress({
          slug: course?.slug || slug || 'brevet-ab-terpadu',
          lessonId: examKey,
          completed: true,
        }).catch((err) => console.warn('Sync exam progress notice:', err));
      }
    }

    if (activeModuleIndex < (course?.curriculum?.length || 0) - 1) {
      const nextIdx = activeModuleIndex + 1;
      const nextMod = course.curriculum[nextIdx];
      setActiveModuleIndex(nextIdx);
      if (nextMod?.lessons?.[0]) {
        setActiveLessonId(nextMod.lessons[0].id);
      } else {
        setActiveLessonId('EXAM');
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
      showToast(`Berhasil melanjutkan ke Modul ${nextIdx + 1}: ${nextMod.title}`, 'success', 3500);
    } else {
      // Di bab/modul akhir, hanya buka sertifikat jika sudah dinyatakan lulus oleh pengajar
      if (isApprovedByTeacher) {
        handleClaimCertificate();
      } else {
        showToast('Status kelulusan dan sertifikat hanya dapat dibuka setelah resmi dinyatakan lulus oleh pengajar.', 'warning', 4000);
      }
    }
  };

  const handleClaimCertificate = async () => {
    if (!certificateData) {
      try {
        // Calculate dynamic final score from actual graded exam submissions
        const graded = userSubmissions.filter((s) => typeof s.score === 'number' && s.score > 0);
        const dynamicScore = graded.length > 0
          ? Math.round((graded.reduce((acc, curr) => acc + curr.score, 0) / graded.length) * 10) / 10
          : undefined;

        const newCert = await certificateService.issueCertificate({
          studentName: user?.name || 'Mahasiswa NAC Tax Center',
          courseTitle: course?.title || 'Brevet Pajak A & B Terpadu',
          score: dynamicScore,
        });
        setCertificateData(newCert?.data || newCert);
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

      {/* Banner Notifikasi Status Pembelajaran & Kelulusan */}
      <LearningHeaderBanners
        modulesNeedingRevision={modulesNeedingRevision}
        isApprovedByTeacher={isApprovedByTeacher}
        isPendingEvaluation={isPendingEvaluation}
        revisionSubmission={revisionSubmission}
        onOpenCertificate={handleClaimCertificate}
        onOpenRevisionModule={(modIdx) => {
          setActiveModuleIndex(modIdx);
          setActiveLessonId('EXAM');
          window.scrollTo({ top: 180, behavior: 'smooth' });
          showToast(`Membuka form revisi ulangan Modul ${modIdx + 1}`, 'info', 3000);
        }}
      />

      {/* Main Grid: Learning Area (lg:col-span-8) & Modules Syllabus (lg:col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Layar Besar Pembelajaran */}
        <div className="lg:col-span-8 space-y-6">
          {!isCurrentSelectionUnlocked ? (
            <LockedChapterView
              isExamSelected={isExamSelected}
              activeLessonIndex={activeLessonIndex}
              regularLessons={regularLessons}
              completedLessonIds={completedLessonIds}
              onOpenCurrentLesson={() => {
                const firstIncomplete = regularLessons.find((l) => !completedLessonIds.includes(l.id)) || regularLessons[0];
                if (firstIncomplete) {
                  setActiveLessonId(firstIncomplete.id);
                }
              }}
            />
          ) : !isExamSelected ? (
            <LessonContentView
              activeLesson={activeLesson}
              activeLessonIndex={activeLessonIndex}
              regularLessons={regularLessons}
              completedLessonIds={completedLessonIds}
              nextChapterId={nextChapterId}
              gdriveDocuments={gdriveDocuments}
              onCompleteAndNext={handleCompleteAndNext}
            />
          ) : (
            <ExamContentView
              activeModuleIndex={activeModuleIndex}
              course={course}
              activeModuleExam={activeModuleExam}
              activeModuleSubmission={activeModuleSubmission}
              isApprovedByTeacher={isApprovedByTeacher}
              onNextModule={handleNextModule}
              onClaimCertificate={handleClaimCertificate}
              onSubmitExam={handleSubmitExam}
              submittingExam={submittingExam}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              submissionUrlInput={submissionUrlInput}
              setSubmissionUrlInput={setSubmissionUrlInput}
              submissionNotesInput={submissionNotesInput}
              setSubmissionNotesInput={setSubmissionNotesInput}
              fileInputRef={fileInputRef}
            />
          )}
        </div>

        {/* Right Column: Daftar Bab / Chapters dalam Modul (Dengan Chapter-by-Chapter Locking) */}
        <div className="lg:col-span-4 space-y-4">
          <CourseSyllabusSidebar
            curriculum={course.curriculum}
            activeModuleIndex={activeModuleIndex}
            setActiveModuleIndex={setActiveModuleIndex}
            activeLessonId={activeLessonId}
            setActiveLessonId={setActiveLessonId}
            completedLessonIds={completedLessonIds}
            userSubmissions={userSubmissions}
            isModuleUnlocked={isModuleUnlocked}
            isChapterUnlocked={isChapterUnlocked}
            showToast={showToast}
          />
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
