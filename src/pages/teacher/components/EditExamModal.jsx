import React from 'react';
import { Award } from 'lucide-react';

export const EditExamModal = ({
  isOpen,
  onClose,
  activeModule,
  examForm,
  setExamForm,
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
              <Award className="w-4 h-4 text-amber-600" />
              Edit Ujian & Syarat Kelulusan Modul
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
              {submitting ? 'Menyimpan...' : 'Perbarui Ujian Modul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExamModal;
