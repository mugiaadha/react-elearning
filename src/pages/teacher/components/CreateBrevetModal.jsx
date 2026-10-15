import React from 'react';
import { FolderPlus } from 'lucide-react';

export const CreateBrevetModal = ({
  isOpen,
  onClose,
  brevetForm,
  setBrevetForm,
  onSubmit,
  submitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-nac-primary" />
            Buat Program Brevet Baru
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
              {submitting ? 'Menyimpan...' : 'Simpan & Terbitkan Program'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrevetModal;
