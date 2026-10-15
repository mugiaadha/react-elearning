import React from 'react';
import { Plus } from 'lucide-react';

export const AddLessonModal = ({
  isOpen,
  onClose,
  activeModule,
  lessonForm,
  setLessonForm,
  onSubmit,
  submitting,
}) => {
  if (!isOpen || !activeModule) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-nac-primary" />
              Tambah Bahan Ajar Baru
            </h3>
            <p className="text-[11px] text-slate-500">
              Untuk: {activeModule.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
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
              {submitting ? 'Menyimpan...' : 'Tambahkan Bahan Ajar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLessonModal;
