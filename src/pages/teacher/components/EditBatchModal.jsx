import React, { useState, useEffect } from 'react';
import { Users, Calendar, ShieldCheck, Sparkles, Check, X, AlertCircle, UserCheck } from 'lucide-react';
import apiClient from '../../../services/api/apiClient';
import ENDPOINTS from '../../../services/api/endpoints';
import { useToast } from '../../../context/ToastContext';

export const EditBatchModal = ({
  isOpen,
  onClose,
  batch,
  currentBrevet,
  onBatchUpdated,
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

  // Fetch available teachers for multi-assignment
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

  // Populate form with existing batch values
  useEffect(() => {
    if (isOpen && batch) {
      setBatchName(batch.batch_name || '');
      setBatchCode(batch.batch_code || '');

      const formatDate = (d) => {
        if (!d) return '';
        try {
          return new Date(d).toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setStartDate(formatDate(batch.start_date));
      setEndDate(formatDate(batch.end_date));
      setStatus(batch.status || 'open');

      // Initialize selected teachers
      const initialIds = [];
      if (batch.teachers && Array.isArray(batch.teachers)) {
        batch.teachers.forEach((t) => initialIds.push(t.id));
      }
      if (batch.assigned_teacher_id && !initialIds.includes(batch.assigned_teacher_id)) {
        initialIds.push(batch.assigned_teacher_id);
      }
      setSelectedTeacherIds(initialIds);
      setError(null);
    }
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const toggleTeacher = (teacherId) => {
    setSelectedTeacherIds((prev) => {
      if (prev.includes(teacherId)) {
        // Jangan hilangkan semua jika ini pengampu utama satu-satunya
        if (prev.length === 1 && prev.includes(teacherId)) {
          return prev;
        }
        return prev.filter((id) => id !== teacherId);
      } else {
        return [...prev, teacherId];
      }
    });
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

      const brevetId = currentBrevet?.id || currentBrevet?.slug || batch.brevet_id;
      const res = await apiClient.put(
        ENDPOINTS.TEACHER_UPDATE_BATCH(brevetId, batch.id),
        payload
      );

      showToast(
        res.message || `Angkatan '${batchName}' berhasil diperbarui!`,
        'success'
      );

      if (onBatchUpdated) {
        onBatchUpdated(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update batch', err);
      setError(err?.response?.data?.message || err.message || 'Gagal memperbarui angkatan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Edit Data Angkatan / Batch
              </h3>
              <p className="text-[11px] text-slate-500">
                Program: <span className="font-semibold text-slate-700">{currentBrevet?.title || batch.brevet_id}</span>
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

        {/* Status Exclusivity Warning Banner */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-900 block">
              Aturan Status Angkatan
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Dalam 1 program brevet, status <strong>Dalam Pendaftaran</strong> dan <strong>Sedang Berjalan</strong> masing-masing hanya boleh aktif untuk 1 angkatan. Jika Anda menyetel status ini, angkatan lain yang sedang aktif akan otomatis dinonaktifkan. Status nonaktif (selesai) bebas berapa pun.
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
              placeholder="Contoh: Batch 42 - Reguler"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kode Angkatan
              </label>
              <input
                type="text"
                placeholder="BAT-AB-42"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status Angkatan *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs bg-white font-medium"
              >
                <option value="open">Dalam Pendaftaran (Open)</option>
                <option value="ongoing">Sedang Berjalan (Ongoing)</option>
                <option value="finished">Nonaktif / Selesai (Finished)</option>
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
                <span>Tim Guru Pengampu & Reviewer Jawaban</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                {selectedTeacherIds.length} Guru Ditugaskan
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pilih guru yang berhak memantau angkatan ini dan membantu menilai lembar jawaban studi kasus murid:
            </p>

            {loadingTeachers ? (
              <div className="py-3 text-center text-slate-400 text-xs animate-pulse">
                Memuat daftar pengajar...
              </div>
            ) : availableTeachers.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px]">
                Belum ada akun guru lain yang terdaftar.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                {availableTeachers.map((tch) => {
                  const isSelected = selectedTeacherIds.includes(tch.id);
                  const isPrimary = batch?.assigned_teacher_id === tch.id;

                  return (
                    <div
                      key={tch.id}
                      onClick={() => toggleTeacher(tch.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-medium'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={tch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={tch.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold truncate block">
                              {tch.name}
                            </span>
                            {isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                                Pengampu Utama
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {tch.email}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950'
                            : 'border border-slate-300 bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatchModal;

