import React, { useState, useEffect } from 'react';
import { Users, Calendar, ShieldCheck, Sparkles, Plus, X, Lock, Check, UserCheck, AlertCircle } from 'lucide-react';
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
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available teachers
  useEffect(() => {
    if (isOpen) {
      const fetchTeachers = async () => {
        try {
          setLoadingTeachers(true);
          const res = await apiClient.get(ENDPOINTS.TEACHER_LIST);
          setAvailableTeachers(res.data || []);
        } catch (err) {
          console.warn('Failed to load teachers list', err);
        } finally {
          setLoadingTeachers(false);
        }
      };
      fetchTeachers();
    }
  }, [isOpen]);

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
      setSelectedTeacherIds([]);
      setError(null);
    }
  }, [isOpen, currentBrevet, existingBatchesCount]);

  if (!isOpen || !currentBrevet) return null;

  const toggleTeacher = (teacherId) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

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
        teacher_ids: selectedTeacherIds,
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

        {/* Explain Immutable Snapshot Benefit & Auto Deactivation */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-900 block">
              Kurikulum Terkunci & Aturan Status Tunggal
            </span>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Status <strong>Dalam Pendaftaran</strong> dan <strong>Sedang Berjalan</strong> hanya boleh aktif untuk 1 angkatan per program. Jika Anda membuka angkatan dengan status tersebut, angkatan lama dengan status yang sama otomatis dinonaktifkan (selesai).
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

          {/* Tim Guru Pengampu & Reviewer (Multi-Teacher Assignment) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-nac-primary" />
                <span>Tugaskan Guru Tambahan (Reviewer Jawaban)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                {selectedTeacherIds.length} Guru Dipilih
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Opsional: Pilih guru lain yang ingin ditugaskan untuk ikut memantau kelas dan membantu menilai jawaban tugas murid.
            </p>

            {loadingTeachers ? (
              <div className="py-2 text-center text-slate-400 text-xs animate-pulse">
                Memuat daftar pengajar...
              </div>
            ) : availableTeachers.length > 0 && (
              <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                {availableTeachers.map((tch) => {
                  const isSelected = selectedTeacherIds.includes(tch.id);

                  return (
                    <div
                      key={tch.id}
                      onClick={() => toggleTeacher(tch.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-medium'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={tch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={tch.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold truncate block">
                            {tch.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {tch.email}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'border border-slate-300 bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
