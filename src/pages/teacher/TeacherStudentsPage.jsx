import React, { useState, useEffect } from 'react';
import { Users, AlertCircle, RefreshCw, CheckCircle2, Search, Filter, Layers, Award, Clock, BookOpen } from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';

export const TeacherStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrevet, setSelectedBrevet] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.TEACHER_STUDENTS);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setError(err.message || 'Gagal memuat data mahasiswa dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter options
  const uniqueBrevets = Array.from(new Set(students.map((s) => s.enrolled).filter(Boolean)));
  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch_name).filter(Boolean)));

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.batch_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrevet = selectedBrevet === 'ALL' || s.enrolled === selectedBrevet;
    const matchesBatch = selectedBatch === 'ALL' || s.batch_name === selectedBatch;

    return matchesSearch && matchesBrevet && matchesBatch;
  });

  const totalGraduated = students.filter((s) => s.status?.toLowerCase().includes('lulus')).length;
  const totalActive = students.filter((s) => !s.status?.toLowerCase().includes('lulus')).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-700" />
            Monitoring Progres Mahasiswa Per Angkatan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau keaktifan peserta kelas, pengelompokan angkatan (cohort), dan penyelesaian ujian studi kasus.
          </p>
        </div>

        <button
          onClick={fetchStudents}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Mahasiswa
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {students.length}
          </div>
          <span className="text-[10px] text-slate-400 block">Terdaftar resmi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Aktif Belajar
          </span>
          <div className="text-xl sm:text-2xl font-black text-sky-600 font-mono">
            {totalActive}
          </div>
          <span className="text-[10px] text-sky-500 block">Dalam proses modul</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Lulus Resmi
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
            {totalGraduated}
          </div>
          <span className="text-[10px] text-emerald-500 block">Sertifikat terbit</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Angkatan
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
            {uniqueBatches.length || 1}
          </div>
          <span className="text-[10px] text-amber-500 block">Cohort terdaftar</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama mahasiswa, email, atau kode batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Filter Brevet */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={selectedBrevet}
              onChange={(e) => setSelectedBrevet(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            >
              <option value="ALL">Semua Program Brevet</option>
              {uniqueBrevets.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Filter Batch */}
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            >
              <option value="ALL">Semua Angkatan (Batch)</option>
              {uniqueBatches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>
        </div>

        {(selectedBrevet !== 'ALL' || selectedBatch !== 'ALL' || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Menampilkan {filteredStudents.length} dari {students.length} mahasiswa
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrevet('ALL');
                setSelectedBatch('ALL');
              }}
              className="text-teal-700 hover:underline font-bold text-[11px]"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStudents}
            className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Loading State & Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs">Memuat data mahasiswa dari backend...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Nama Siswa</th>
                <th className="py-3.5 px-4 font-bold">Program Brevet</th>
                <th className="py-3.5 px-4 font-bold">Angkatan / Batch</th>
                <th className="py-3.5 px-4 font-bold">Progres Modul</th>
                <th className="py-3.5 px-4 font-bold">Aktivitas Terakhir</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 space-y-2">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-slate-600">Tidak ada mahasiswa yang cocok.</p>
                    <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter angkatan Anda.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isGraduated = s.status?.toLowerCase().includes('lulus');
                  const isPendingExam = s.status?.toLowerCase().includes('menjelang');

                  const statusClass = isGraduated
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isPendingExam
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {s.enrolled}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-amber-900 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{s.batch_name || 'Batch 42 - Reguler'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">
                          {s.batch_code || 'BAT-AB-42'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isGraduated ? 'bg-emerald-500' : 'bg-teal-600'}`}
                              style={{ width: s.progress }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700 font-mono text-[11px]">{s.progress}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{s.lastActive}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusClass}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentsPage;
