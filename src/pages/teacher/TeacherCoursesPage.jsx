import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';

export const TeacherCoursesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [targetModule, setTargetModule] = useState('Modul 1: Ketentuan Umum Perpajakan (KUP)');
  const [fileType, setFileType] = useState('PDF');
  const [success, setSuccess] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.TEACHER_MATERIALS);
      setMaterials(res.data || []);
    } catch (err) {
      console.error('Failed to fetch materials', err);
      setError(err.message || 'Gagal memuat bahan ajar dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialTitle.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await apiClient.post(ENDPOINTS.TEACHER_MATERIALS, {
        title: materialTitle,
        target_module: targetModule,
        file_type: fileType,
      });

      setSuccess(res.message || `Bahan ajar "${materialTitle}" berhasil diunggah ke server!`);
      setMaterialTitle('');
      setModalOpen(false);
      fetchMaterials();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to upload material', err);
      setError(err.message || 'Gagal mengunggah bahan ajar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            Manajemen Kurikulum & Modul Ajar
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unggah modul ajar, video rekaman kuliah, dan file spreadsheet latihan untuk siswa.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs"
        >
          <Plus className="w-4 h-4" />
          + Unggah Bahan Ajar Baru
        </button>
      </div>

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

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Brevet Pajak A & B Terpadu (Silabus Aktif)</h3>
          <button
            onClick={fetchMaterials}
            disabled={loading}
            className="text-xs text-teal-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Memuat bahan ajar...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada bahan ajar yang diunggah.</p>
            ) : (
              materials.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className={`w-4 h-4 ${m.file_type === 'Excel' ? 'text-emerald-600' : 'text-rose-500'}`} />
                    <div>
                      <span className="font-bold text-slate-800 block">{m.title}</span>
                      <span className="text-slate-400">{m.file_type} • {m.created_date_text || 'Tersedia'} • {m.target_module}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    {m.status || 'Tersedia untuk Mahasiswa'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Unggah Bahan Ajar Baru</h3>
            <form onSubmit={handleAddMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Bahan Ajar</label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="Contoh: Studi Kasus PPh 23 Jasa Konstruksi"
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Modul</label>
                <select
                  value={targetModule}
                  onChange={(e) => setTargetModule(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none"
                >
                  <option>Modul 1: Ketentuan Umum Perpajakan (KUP)</option>
                  <option>Modul 2: PPh 21/26 Skema TER PP 58/2023</option>
                  <option>Modul 3: PPh Potong Pungut (Withholding Tax)</option>
                  <option>Modul 4: PPN & e-Faktur 4.0</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe File</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 focus:outline-none"
                >
                  <option value="PDF">Dokumen PDF (Materi / Presentasi)</option>
                  <option value="Excel">Spreadsheet Excel (Kertas Kerja Latihan)</option>
                  <option value="Video">Tautan Rekaman Video Zoom / MP4</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan & Publikasikan'}
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
