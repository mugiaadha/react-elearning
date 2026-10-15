import React from 'react';
import { Plus, Video, Award } from 'lucide-react';

export const CreateModuleModal = ({
  isOpen,
  onClose,
  moduleForm,
  setModuleForm,
  onSubmit,
  submitting,
  brevetTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-nac-primary" />
              Tambah Modul Baru
            </h3>
            <p className="text-[11px] text-slate-500">
              Untuk program: {brevetTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
              onClick={onClose}
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
  );
};

export default CreateModuleModal;
