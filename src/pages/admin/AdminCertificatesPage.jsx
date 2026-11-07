import React, { useState, useEffect } from 'react';
import certificateService from '../../services/certificateService';
import { Award, ShieldCheck, ExternalLink, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.getAllCertificates();
      setCerts(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal memuat log sertifikat dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const filtered = certs.filter(
    (c) =>
      c.certificate_id.toLowerCase().includes(search.toLowerCase()) ||
      c.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      c.course_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Audit & Log Penerbitan Sertifikat Digital
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar seluruh sertifikat resmi yang telah diterbitkan dan tersimpan di database QR validasi.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID Sertifikat, nama..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={fetchCerts}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
            title="Segarkan data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
            onClick={fetchCerts}
            className="px-2.5 py-1 bg-rose-700 text-white rounded-lg font-bold text-[11px]"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Memuat log pangkalan data sertifikat digital...</p>
        </div>
      ) : (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Tidak ditemukan data sertifikat.
              </div>
            ) : (
              filtered.map((c) => (
                <div key={c.certificate_id} className="p-4 space-y-2.5 hover:bg-slate-900/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs break-all">
                      {c.certificate_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 shrink-0">
                      {c.grade}
                    </span>
                  </div>

                  <div>
                    <div className="font-semibold text-white text-sm">{c.recipient_name}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{c.course_title}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Terbit: {c.issue_date}</span>
                    <Link
                      to={`/verify-certificate/${c.certificate_id}`}
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold hover:underline"
                    >
                      <span>Cek Validitas QR</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Seri Registrasi</th>
                  <th className="py-3 px-4">Penerima Sertifikat</th>
                  <th className="py-3 px-4">Program Brevet</th>
                  <th className="py-3 px-4">Tgl Terbit</th>
                  <th className="py-3 px-4">Yudisium</th>
                  <th className="py-3 px-4 text-center">URL QR Publik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      Tidak ditemukan data sertifikat.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.certificate_id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {c.certificate_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {c.recipient_name}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {c.course_title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{c.issue_date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                          {c.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/verify-certificate/${c.certificate_id}`}
                          className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold text-[11px] hover:underline"
                        >
                          <span>Cek Validitas</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificatesPage;
