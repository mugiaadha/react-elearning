import React, { useState, useEffect } from 'react';
import brevetService from '../../services/brevetService';
import { BookOpen, Tag, Users, CheckCircle } from 'lucide-react';

export const AdminBrevetsPage = () => {
  const [brevets, setBrevets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    brevetService.getAllBrevets()
      .then(setBrevets)
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Gagal memuat kurikulum.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          Manajemen Kurikulum & Program Brevet
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Daftar silabus aktif, harga pendaftaran, dan struktur materi pembelajaran.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Memuat daftar silabus dari database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {brevets.map((b) => (
          <div key={b.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                {b.badge || 'Resmi'}
              </span>
              <span className="text-xs text-slate-400">{b.duration}</span>
            </div>

            <div>
              <h3 className="font-bold text-white text-base">{b.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Biaya Investasi</span>
                <span className="text-amber-400 font-bold font-mono text-sm">
                  Rp {b.price?.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">Silabus Modul</span>
                <span className="text-slate-300 font-semibold">{b.curriculum?.length || 0} Modul</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default AdminBrevetsPage;
