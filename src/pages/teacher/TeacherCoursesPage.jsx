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
  FolderPlus,
  Users,
  Calendar,
  Lock,
  Edit3
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import { CreateBrevetModal } from './components/CreateBrevetModal';
import { CreateBatchModal } from './components/CreateBatchModal';
import { EditBatchModal } from './components/EditBatchModal';
import { CreateModuleModal } from './components/CreateModuleModal';
import { AddLessonModal } from './components/AddLessonModal';
import { EditExamModal } from './components/EditExamModal';
import { TeacherModuleCard } from './components/TeacherModuleCard';

export const TeacherCoursesPage = () => {
  const [brevets, setBrevets] = useState([]);
  const [selectedBrevetId, setSelectedBrevetId] = useState('');
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Modals state
  const [isBrevetModalOpen, setIsBrevetModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [selectedBatchToEdit, setSelectedBatchToEdit] = useState(null);
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

  // Fetch cohort batches for the selected brevet
  const fetchBatches = async (brevetId) => {
    if (!brevetId) return;
    try {
      setLoadingBatches(true);
      const res = await apiClient.get(ENDPOINTS.TEACHER_BREVET_BATCHES(brevetId));
      setBatches(res.data || []);
    } catch (err) {
      console.warn('Failed to load batches', err);
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchBrevets();
  }, []);

  useEffect(() => {
    if (selectedBrevetId) {
      fetchBatches(selectedBrevetId);
    }
  }, [selectedBrevetId]);

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
            Panduan Penyematan Materi & Soal Ujian (YouTube & Google Drive)
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            Seluruh bahan pembelajaran (Video YouTube, Modul PDF, Kertas Kerja Excel, Word, Slide Presentasi) serta Lembar Soal Ujian cukup ditautkan melalui tautan Google Drive atau YouTube agar langsung dapat diakses oleh mahasiswa di ruang kelas.
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {currentBrevet.badge || 'Program Aktif'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-300" />
                {currentBrevet.active_batch?.batch_name || 'Batch 42 - Reguler'} (Terkunci Per-Angkatan)
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

          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Buka Angkatan Baru</span>
            </button>
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

      {/* Cohort Batches Management Card */}
      {currentBrevet && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  Daftar Angkatan Kelas & Jadwal Pelaksanaan
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {batches.length} Angkatan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap angkatan memiliki silabus dan daftar materi tersendiri sehingga progres mahasiswa pada angkatan berjalan tetap terjaga.
              </p>
            </div>

            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buka Angkatan Baru</span>
            </button>
          </div>

          {loadingBatches ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin mx-auto" />
              <p>Memuat daftar angkatan kelas...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Belum ada angkatan khusus yang tercatat untuk program ini.
              </p>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Buka Angkatan Pertama Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {batches.map((batch) => {
                const isFinished = batch.status === 'finished';
                const isOngoing = batch.status === 'ongoing';
                const isOpen = batch.status === 'open';

                const statusBadge = isOpen
                  ? { label: 'Pendaftaran Dibuka', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                  : isOngoing
                  ? { label: 'Sedang Berjalan', bg: 'bg-sky-50 text-sky-700 border-sky-200' }
                  : { label: 'Selesai', bg: 'bg-slate-50 text-slate-600 border-slate-200' };

                const modulesCount = Array.isArray(batch.curriculum)
                  ? batch.curriculum.length
                  : (currentBrevet.curriculum?.length || 0);

                return (
                  <div
                    key={batch.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-300 transition shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {batch.batch_name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono font-semibold">
                            {batch.batch_code || `BAT-${batch.id}`}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {batch.start_date ? new Date(batch.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Segera'} - {batch.end_date ? new Date(batch.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Selesai'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700">
                            {batch.enrollments_count ?? 0} Siswa Terdaftar
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        Terkunci
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">
                          {modulesCount} Modul
                        </span>
                        <button
                          onClick={() => {
                            setSelectedBatchToEdit(batch);
                            setIsEditBatchModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200/70 transition"
                          title="Edit Angkatan dan Pengampu"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

      {/* MODAL 1B: Create Cohort Batch */}
      <CreateBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        currentBrevet={currentBrevet}
        existingBatchesCount={batches.length}
        onBatchCreated={() => {
          fetchBatches(currentBrevet?.id || selectedBrevetId);
          fetchBrevets();
        }}
      />

      {/* MODAL 1C: Edit Cohort Batch */}
      <EditBatchModal
        isOpen={isEditBatchModalOpen}
        onClose={() => {
          setIsEditBatchModalOpen(false);
          setSelectedBatchToEdit(null);
        }}
        batch={selectedBatchToEdit}
        currentBrevet={currentBrevet}
        onBatchUpdated={() => {
          fetchBatches(currentBrevet?.id || selectedBrevetId);
          fetchBrevets();
        }}
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
