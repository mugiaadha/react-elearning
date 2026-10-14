import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Video,
  Layers,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  FolderPlus
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';

export const TeacherCoursesPage = () => {
  const [brevets, setBrevets] = useState([]);
  const [selectedBrevetId, setSelectedBrevetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Modals state
  const [isBrevetModalOpen, setIsBrevetModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [activeModuleForAction, setActiveModuleForAction] = useState(null);

  // Form states - Brevet
  const [brevetForm, setBrevetForm] = useState({
    title: '',
    tagline: '',
    description: '',
    level: 'Menengah',
    duration: '8 Minggu',
    price: 2500000,
  });

  // Form states - Module
  const [moduleForm, setModuleForm] = useState({
    title: '',
    duration: '8 Jam Pelajaran',
    lessonTitle: '',
    lessonType: 'video', // 'video', 'pdf', 'excel', 'word', 'ppt'
    lessonUrl: '',
    lessonDuration: '45 Menit',
    examTitle: '',
    examDescription: 'Kerjakan studi kasus dan lampirkan link Google Drive lembar jawaban Anda di bawah.',
    examQuestionUrl: '',
  });

  // Form states - Add Lesson
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'pdf',
    url: '',
    duration: '30 Menit',
  });

  // Form states - Edit Exam
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    question_url: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch all Brevets
  const fetchBrevets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.TEACHER_BREVETS);
      const data = res.data || [];
      setBrevets(data);
      if (data.length > 0 && (!selectedBrevetId || !data.some(b => b.id === selectedBrevetId))) {
        setSelectedBrevetId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch brevets', err);
      setError(err.message || 'Gagal memuat kurikulum dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrevets();
  }, []);

  const currentBrevet = brevets.find((b) => b.id === selectedBrevetId) || brevets[0];

  // Helper to get lesson type visual badge
  const getMaterialTypeBadge = (type) => {
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

  // Create new Brevet
  const handleCreateBrevet = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const res = await apiClient.post(ENDPOINTS.TEACHER_BREVETS, brevetForm);
      setSuccess(res.message || 'Program Brevet baru berhasil dibuat!');
      setIsBrevetModalOpen(false);
      setBrevetForm({
        title: '',
        tagline: '',
        description: '',
        level: 'Menengah',
        duration: '8 Minggu',
        price: 2500000,
      });
      await fetchBrevets();
      if (res.data?.id) setSelectedBrevetId(res.data.id);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal membuat program Brevet.');
    } finally {
      setSubmitting(false);
    }
  };

  // Create new Module in Current Brevet
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!currentBrevet) return;

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        title: moduleForm.title,
        duration: moduleForm.duration,
        lessons: moduleForm.lessonUrl.trim()
          ? [
              {
                title: moduleForm.lessonTitle.trim() || `Materi Ajar: ${moduleForm.title}`,
                type: moduleForm.lessonType,
                url: moduleForm.lessonUrl.trim(),
                duration: moduleForm.lessonDuration,
              },
            ]
          : [],
        exam_title: moduleForm.examTitle.trim() || `Ujian Studi Kasus: ${moduleForm.title}`,
        exam_description: moduleForm.examDescription,
        exam_question_url: moduleForm.examQuestionUrl.trim() || null,
      };

      const res = await apiClient.post(ENDPOINTS.TEACHER_STORE_MODULE(currentBrevet.id), payload);
      setSuccess(res.message || 'Modul baru berhasil ditambahkan!');
      setIsModuleModalOpen(false);
      setModuleForm({
        title: '',
        duration: '8 Jam Pelajaran',
        lessonTitle: '',
        lessonType: 'video',
        lessonUrl: '',
        lessonDuration: '45 Menit',
        examTitle: '',
        examDescription: 'Kerjakan studi kasus dan lampirkan link Google Drive lembar jawaban Anda di bawah.',
        examQuestionUrl: '',
      });
      await fetchBrevets();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan modul.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Lesson to existing module
  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!currentBrevet || !activeModuleForAction) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await apiClient.post(
        ENDPOINTS.TEACHER_STORE_LESSON(currentBrevet.id, activeModuleForAction.id),
        lessonForm
      );
      setSuccess(res.message || 'Bahan ajar berhasil ditambahkan ke modul!');
      setIsLessonModalOpen(false);
      setLessonForm({
        title: '',
        type: 'pdf',
        url: '',
        duration: '30 Menit',
      });
      await fetchBrevets();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan bahan ajar.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update Exam for existing module
  const handleUpdateExam = async (e) => {
    e.preventDefault();
    if (!currentBrevet || !activeModuleForAction) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await apiClient.put(
        ENDPOINTS.TEACHER_UPDATE_MODULE(currentBrevet.id, activeModuleForAction.id),
        {
          exam: {
            id: activeModuleForAction.exam?.id || `exam-${activeModuleForAction.id}`,
            title: examForm.title,
            description: examForm.description,
            question_url: examForm.question_url.trim() || null,
          },
        }
      );
      setSuccess(res.message || 'Konfigurasi ujian modul berhasil diperbarui!');
      setIsExamModalOpen(false);
      await fetchBrevets();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal memperbarui ujian.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (!window.confirm(`Yakin ingin menghapus modul "${moduleTitle}" dari kurikulum?`)) return;
    try {
      setLoading(true);
      const res = await apiClient.delete(ENDPOINTS.TEACHER_DELETE_MODULE(currentBrevet.id, moduleId));
      setSuccess(res.message || 'Modul berhasil dihapus.');
      await fetchBrevets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal menghapus modul.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (moduleId, lessonId, lessonTitle) => {
    if (!window.confirm(`Hapus bahan ajar "${lessonTitle}"?`)) return;
    try {
      setLoading(true);
      const res = await apiClient.delete(
        ENDPOINTS.TEACHER_DELETE_LESSON(currentBrevet.id, moduleId, lessonId)
      );
      setSuccess(res.message || 'Bahan ajar berhasil dihapus.');
      await fetchBrevets();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal menghapus bahan ajar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nac-primary/10 text-nac-primary text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Manajemen Kurikulum & Modul Ajar
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Program Brevet & Bahan Pembelajaran
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola modul brevet, tautkan bahan ajar (Google Drive / YouTube), dan tentukan ujian kelulusan mahasiswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBrevetModalOpen(true)}
            className="btn-secondary text-xs"
          >
            <FolderPlus className="w-4 h-4 text-nac-primary" />
            + Buat Brevet Baru
          </button>
          <button
            onClick={() => setIsModuleModalOpen(true)}
            disabled={!currentBrevet}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            + Tambah Modul
          </button>
        </div>
      </div>

      {/* Cloud Link Architecture Notice */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-sky-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-800/50 flex items-start gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm">
            Arsitektur Bebas Kuota: Seluruh Bahan Ajar Berupa Tautan Cloud (Google Drive & YouTube)
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Sistem dirancang tanpa penyimpanan lokal file server. Semua bahan (Video YouTube, PDF Handout, Template Excel/Kertas Kerja, Word, PPT) serta Lembar Soal Ujian ditautkan via URL Google Drive / YouTube yang dapat dibuka langsung oleh mahasiswa.
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Brevet Switcher Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-nac-primary" />
            Pilih Program Brevet yang Dikelola:
          </span>
          <button
            onClick={fetchBrevets}
            disabled={loading}
            className="text-xs text-nac-primary hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {brevets.map((b) => {
            const isSelected = (currentBrevet?.id === b.id);
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBrevetId(b.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-nac-primary text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{b.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {b.curriculum?.length || 0} Modul
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Brevet Info Card */}
      {currentBrevet && (
        <div className="bg-gradient-to-r from-slate-900 to-nac-navy text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {currentBrevet.badge || 'Program Aktif'}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {currentBrevet.level || 'Tingkat Menengah'} • {currentBrevet.duration || '12 Minggu'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentBrevet.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              {currentBrevet.tagline || currentBrevet.description}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setIsModuleModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow"
            >
              <Plus className="w-4 h-4" />
              + Tambah Modul Baru
            </button>
          </div>
        </div>
      )}

      {/* Modules & Materials Hierarchy List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-nac-primary" />
            Daftar Modul, Bahan Ajar & Ujian Kelulusan
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Total {currentBrevet?.curriculum?.length || 0} Modul Terkonfigurasi
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-nac-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Memuat kurikulum modul...</p>
          </div>
        ) : (currentBrevet?.curriculum?.length || 0) === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Belum Ada Modul di Program Ini</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Silakan tambahkan modul pertama beserta materi video YouTube, handout PDF, file latihan Excel, dan studi kasus kelulusan.
            </p>
            <button
              onClick={() => setIsModuleModalOpen(true)}
              className="btn-primary text-xs mx-auto"
            >
              <Plus className="w-4 h-4" />
              Tambah Modul Sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {currentBrevet.curriculum.map((mod, mIdx) => {
              const exam = mod.exam || {
                id: `exam-${mod.id}`,
                title: `Ujian Studi Kasus: ${mod.title}`,
                description: 'Kerjakan studi kasus dan lampirkan link Google Drive lembar jawaban Anda di bawah.',
                question_url: null,
              };

              return (
                <div
                  key={mod.id || mIdx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300"
                >
                  {/* Module Header Bar */}
                  <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-xl bg-nac-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {mIdx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          {mod.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {mod.duration || '8 Jam Pelajaran'}
                          </span>
                          <span>•</span>
                          <span>{mod.lessons?.length || 0} Bahan Ajar</span>
                          <span>•</span>
                          <span className="text-teal-700 font-semibold">1 Ujian Kelulusan</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setActiveModuleForAction(mod);
                          setIsLessonModalOpen(true);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                        title="Tambah Bahan Ajar ke Modul ini"
                      >
                        <Plus className="w-3.5 h-3.5 text-nac-primary" />
                        + Bahan Ajar
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id, mod.title)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus Modul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Module Content: Lessons & Exam */}
                  <div className="p-4 sm:p-5 space-y-5">
                    {/* 1. Bahan Ajar (Google Drive / YouTube Links) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          Bahan Ajar Pembelajaran:
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Tautan Eksternal Cloud
                        </span>
                      </div>

                      {(!mod.lessons || mod.lessons.length === 0) ? (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400">
                          Belum ada bahan ajar. Klik "+ Bahan Ajar" di atas untuk menambahkan link video YouTube atau file Google Drive.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {mod.lessons.map((les) => {
                            const badge = getMaterialTypeBadge(les.type);
                            const IconComponent = badge.icon;
                            return (
                              <div
                                key={les.id}
                                className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs transition"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 shadow-sm">
                                    <IconComponent className="w-4 h-4 text-nac-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-slate-900 block truncate">
                                      {les.title}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                      <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${badge.bg}`}>
                                        {badge.label}
                                      </span>
                                      <span className="text-slate-400">• {les.duration || '30 Min'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {les.url && (
                                    <a
                                      href={les.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-slate-500 hover:text-nac-primary hover:bg-white rounded-lg transition"
                                      title="Buka Tautan Materi di Tab Baru"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleDeleteLesson(mod.id, les.id, les.title)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                                    title="Hapus Bahan Ajar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 2. Ujian & Studi Kasus Modul */}
                    <div className="rounded-xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/80 p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase block">
                              Ujian & Kuis Syarat Kelulusan Modul:
                            </span>
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                              {exam.title || `Ujian Studi Kasus: ${mod.title}`}
                            </h5>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveModuleForAction(mod);
                            setExamForm({
                              title: exam.title || `Ujian Studi Kasus: ${mod.title}`,
                              description: exam.description || '',
                              question_url: exam.question_url || '',
                            });
                            setIsExamModalOpen(true);
                          }}
                          className="btn-secondary text-[11px] py-1 px-2.5 border-amber-300 text-amber-900 hover:bg-amber-100 self-start sm:self-auto"
                        >
                          Edit Soal Ujian
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {exam.description || 'Mahasiswa wajib mengunggah lembar jawaban studi kasus sebelum dapat melanjutkan ke modul berikutnya.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        {exam.question_url ? (
                          <a
                            href={exam.question_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-50 transition text-xs shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                            Buka Lembar Soal / Panduan Studi Kasus (Google Drive)
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            (Belum ada link lembar soal eksternal ditautkan)
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-medium">
                          • Mahasiswa akan menjawab via uploader Google Drive di ruang kelas mereka.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Create Brevet */}
      {isBrevetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-nac-primary" />
                Buat Program Brevet Baru
              </h3>
              <button
                onClick={() => setIsBrevetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBrevet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Program Brevet *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Brevet Pajak C Eksekutif (Pajak Internasional)"
                  value={brevetForm.title}
                  onChange={(e) => setBrevetForm({ ...brevetForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline Ringkas</label>
                <input
                  type="text"
                  placeholder="Contoh: Kuasai Transfer Pricing, Tax Treaty, dan Coretax Internasional"
                  value={brevetForm.tagline}
                  onChange={(e) => setBrevetForm({ ...brevetForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={brevetForm.level}
                    onChange={(e) => setBrevetForm({ ...brevetForm, level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs bg-white"
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Pemula hingga Menengah">Pemula hingga Menengah</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Lanjutan / Eksekutif">Lanjutan / Eksekutif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Durasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: 10 Minggu"
                    value={brevetForm.duration}
                    onChange={(e) => setBrevetForm({ ...brevetForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biaya Investasi / Pendaftaran (Rp)</label>
                <input
                  type="number"
                  placeholder="2500000"
                  value={brevetForm.price}
                  onChange={(e) => setBrevetForm({ ...brevetForm, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Lengkap Program *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Penjelasan silabus, standar kompetensi, dan manfaat sertifikasi..."
                  value={brevetForm.description}
                  onChange={(e) => setBrevetForm({ ...brevetForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBrevetModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan & Terbitkan Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Module */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5 text-nac-primary" />
                  Tambah Modul Baru
                </h3>
                <p className="text-[11px] text-slate-500">
                  Untuk program: {currentBrevet?.title}
                </p>
              </div>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Judul Modul *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Modul 4: PPh Pasal 23 & 26 Terapan"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi</label>
                  <input
                    type="text"
                    placeholder="8 Jam Pelajaran"
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                  />
                </div>
              </div>

              {/* Bahan Ajar Awal */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-nac-primary" />
                  Bahan Ajar Awal (Link YouTube / Google Drive)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Judul Bahan Ajar</label>
                    <input
                      type="text"
                      placeholder="Pemaparan Silabus & Rekaman Kuliah"
                      value={moduleForm.lessonTitle}
                      onChange={(e) => setModuleForm({ ...moduleForm, lessonTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipe Bahan Ajar</label>
                    <select
                      value={moduleForm.lessonType}
                      onChange={(e) => setModuleForm({ ...moduleForm, lessonType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    >
                      <option value="video">Video YouTube (Kuliah / Rekaman)</option>
                      <option value="pdf">File PDF Handout (Google Drive)</option>
                      <option value="excel">File Excel / Kertas Kerja (Google Drive)</option>
                      <option value="word">File Dokumen Word (Google Drive)</option>
                      <option value="ppt">File Slide Presentasi PPT (Google Drive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tautan / URL Materi (YouTube / Google Drive) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... atau https://drive.google.com/..."
                    value={moduleForm.lessonUrl}
                    onChange={(e) => setModuleForm({ ...moduleForm, lessonUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Tidak perlu upload file fisik. Tautan eksternal langsung disimpan di modul.
                  </span>
                </div>
              </div>

              {/* Ujian Modul */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block text-xs flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  Konfigurasi Ujian & Studi Kasus Kelulusan Modul *
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Judul Ujian Modul *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Studi Kasus Pemotongan & SPT Masa PPh 23"
                    value={moduleForm.examTitle}
                    onChange={(e) => setModuleForm({ ...moduleForm, examTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Petunjuk Pengerjaan Ujian</label>
                  <textarea
                    rows={2}
                    value={moduleForm.examDescription}
                    onChange={(e) => setModuleForm({ ...moduleForm, examDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Link Google Drive Soal / Studi Kasus (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={moduleForm.examQuestionUrl}
                    onChange={(e) => setModuleForm({ ...moduleForm, examQuestionUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Tambahkan Modul ke Kurikulum'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Lesson to Module */}
      {isLessonModalOpen && activeModuleForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-nac-primary" />
                  Tambah Bahan Ajar Baru
                </h3>
                <p className="text-[11px] text-slate-500">
                  Untuk: {activeModuleForAction.title}
                </p>
              </div>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Bahan Ajar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kertas Kerja Rekonsiliasi Fiskal PT Sejahtera.xlsx"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Bahan Ajar</label>
                  <select
                    value={lessonForm.type}
                    onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs bg-white"
                  >
                    <option value="video">Video YouTube</option>
                    <option value="pdf">File PDF (Google Drive)</option>
                    <option value="excel">File Excel (Google Drive)</option>
                    <option value="word">File Word (Google Drive)</option>
                    <option value="ppt">File PPT (Google Drive)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Durasi Belajar</label>
                  <input
                    type="text"
                    placeholder="30 Menit"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tautan URL (Google Drive / YouTube) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... atau https://youtube.com/..."
                  value={lessonForm.url}
                  onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Pastikan izin file Google Drive diatur ke "Anyone with the link can view".
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Tambahkan Bahan Ajar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit Exam for Module */}
      {isExamModalOpen && activeModuleForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Edit Ujian & Syarat Kelulusan Modul
                </h3>
                <p className="text-[11px] text-slate-500">
                  Untuk: {activeModuleForAction.title}
                </p>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateExam} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Ujian Modul *</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Petunjuk / Deskripsi Ujian *</label>
                <textarea
                  rows={3}
                  required
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Link Google Drive Soal / Studi Kasus (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={examForm.question_url}
                  onChange={(e) => setExamForm({ ...examForm, question_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-nac-primary text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Perbarui Ujian Modul'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;
