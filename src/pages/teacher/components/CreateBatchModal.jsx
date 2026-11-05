import React, { useState, useEffect } from 'react';
import { Users, Calendar, ShieldCheck, Sparkles, Plus, X, Lock } from 'lucide-react';
import apiClient from '../../../services/api/apiClient';
import ENDPOINTS from '../../../services/api/endpoints';
import { useToast } from '../../../context/ToastContext';

export const CreateBatchModal = ({
  isOpen,
  onClose,
  currentBrevet,
  existingBatchesCount = 0,
  onBatchCreated,
}) => {
  const { showToast } = useToast();

  const [batchName, setBatchName] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('open');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize sensible defaults when modal opens
  useEffect(() => {
    if (isOpen && currentBrevet) {
      const nextNum = existingBatchesCount + 1;
      const cleanPrefix = (currentBrevet.id || 'course')
        .replace('brevet-', '')
        .toUpperCase();

      setBatchName(`Batch ${nextNum} - Gelombang Baru`);
      setBatchCode(`BAT-${cleanPrefix}-${nextNum}`);

      const today = new Date();
      const inTwoMonths = new Date();
      inTwoMonths.setMonth(today.getMonth() + 2);

      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(inTwoMonths.toISOString().split('T')[0]);
      setStatus('open');
      setError(null);
    }
  }, [isOpen, currentBrevet, existingBatchesCount]);

  if (!isOpen || !currentBrevet) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName.trim()) {
      setError('Nama angkatan wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        batch_name: batchName.trim(),
        batch_code: batchCode.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status: status,
      };

      const res = await apiClient.post(
        ENDPOINTS.TEACHER_BREVET_BATCHES(currentBrevet.id || currentBrevet.slug),
        payload
      );

      showToast(
        res.message || `Angkatan '${batchName}' berhasil dibuka dengan kurikulum terkunci!`,
        'success'
      );

      if (onBatchCreated) {
        onBatchCreated(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create batch', err);
      setError(err?.response?.data?.message || err.message || 'Gagal membuat angkatan baru.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Buka Angkatan / Batch Baru
              </h3>
              <p className="text-[11px] text-slate-500">
                Program: <span className="font-semibold text-slate-700">{currentBrevet.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explain Immutable Snapshot Benefit */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-900 block">
              Kurikulum Snapshot Terkunci Otomatis (Cohort-Based)
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Seluruh modul dan bab materi master saat ini ({currentBrevet.curriculum?.length || 0} modul) akan disalin dan dikunci untuk angkatan ini. Perubahan kurikulum di masa depan tidak akan mengganggu progres murid di angkatan ini.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Angkatan / Batch *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Batch 43 - Weekend Eksekutif"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kode Angkatan (Unik)
              </label>
              <input
                type="text"
                placeholder="BAT-AB-43"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Angkatan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white font-medium"
              >
                <option value="open">Buka Pendaftaran (Open)</option>
                <option value="ongoing">Sedang Berjalan (Ongoing)</option>
                <option value="finished">Selesai (Finished)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Mulai Kelas
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Target Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Membuka Angkatan...' : 'Buka Angkatan Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBatchModal;
