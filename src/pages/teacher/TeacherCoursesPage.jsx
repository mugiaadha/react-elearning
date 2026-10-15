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
import { CreateBrevetModal } from './components/CreateBrevetModal';
import { CreateModuleModal } from './components/CreateModuleModal';
import { AddLessonModal } from './components/AddLessonModal';
import { EditExamModal } from './components/EditExamModal';
import { TeacherModuleCard } from './components/TeacherModuleCard';

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
            Tambah Modul
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${isSelected
                  ? 'bg-nac-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                <span>{b.title}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
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
              Tambah Modul Baru
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
            {currentBrevet.curriculum.map((mod, mIdx) => (
              <TeacherModuleCard
                key={mod.id || mIdx}
                mod={mod}
                mIdx={mIdx}
                onAddLesson={(targetMod) => {
                  setActiveModuleForAction(targetMod);
                  setIsLessonModalOpen(true);
                }}
                onDeleteLesson={handleDeleteLesson}
                onEditExam={(targetMod, targetExam) => {
                  setActiveModuleForAction(targetMod);
                  setExamForm({
                    title: targetExam.title || `Ujian Studi Kasus: ${targetMod.title}`,
                    description: targetExam.description || '',
                    question_url: targetExam.question_url || '',
                  });
                  setIsExamModalOpen(true);
                }}
                onDeleteModule={handleDeleteModule}
                getMaterialTypeBadge={getMaterialTypeBadge}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Create Brevet */}
      <CreateBrevetModal
        isOpen={isBrevetModalOpen}
        onClose={() => setIsBrevetModalOpen(false)}
        brevetForm={brevetForm}
        setBrevetForm={setBrevetForm}
        onSubmit={handleCreateBrevet}
        submitting={submitting}
      />

      {/* MODAL 2: Create Module */}
      <CreateModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        moduleForm={moduleForm}
        setModuleForm={setModuleForm}
        onSubmit={handleCreateModule}
        submitting={submitting}
        brevetTitle={currentBrevet?.title}
      />

      {/* MODAL 3: Add Lesson to Module */}
      <AddLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        activeModule={activeModuleForAction}
        lessonForm={lessonForm}
        setLessonForm={setLessonForm}
        onSubmit={handleAddLesson}
        submitting={submitting}
      />

      {/* MODAL 4: Edit Exam for Module */}
      <EditExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        activeModule={activeModuleForAction}
        examForm={examForm}
        setExamForm={setExamForm}
        onSubmit={handleUpdateExam}
        submitting={submitting}
      />
    </div>
  );
};

export default TeacherCoursesPage;
