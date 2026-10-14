import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';

export const AdminStudentsPage = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async (isManual = false) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.ADMIN_STUDENTS);
      setStudents(res.data || []);
      if (isManual) {
        showToast('Pangkalan data siswa berhasil diperbarui.', 'info', 2500);
      }
    } catch (err) {
      console.error('Failed to fetch admin students', err);
      setError(err.message || 'Gagal memuat data mahasiswa dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.brevet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Pangkalan Data Siswa & Pendaftaran
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data registrasi mahasiswa, program yang diambil, dan status aktif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, email..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={() => fetchStudents(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchStudents}
            className="px-2.5 py-1 bg-rose-700 text-white rounded-lg font-bold text-[11px]"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Memuat pangkalan data siswa...</p>
        </div>
      ) : (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nama Mahasiswa</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Program Brevet</th>
                <th className="py-3 px-4">Tgl Registrasi</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4">Progres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    Tidak ditemukan mahasiswa yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{s.email}</div>
                      <div className="text-[11px] text-slate-500">{s.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">{s.brevet}</td>
                    <td className="py-3.5 px-4 text-slate-400">{s.registered}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">{s.progress}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
