import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import brevetService from '../../services/brevetService';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Award
} from 'lucide-react';

export const BrevetCatalogPage = () => {
  const [brevets, setBrevets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  useEffect(() => {
    brevetService.getAllBrevets()
      .then(setBrevets)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = brevets.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel =
      selectedLevel === 'ALL' ||
      (selectedLevel === 'AB' && b.id === 'brevet-ab') ||
      (selectedLevel === 'C' && b.id === 'brevet-c') ||
      (selectedLevel === 'CORETAX' && b.id === 'coretax-mastery');
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Katalog Lengkap Pelatihan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pilihan Program Sertifikasi Brevet Pajak
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Temukan program brevet yang dirancang terstruktur sesuai regulasi perpajakan terkini di Indonesia. Seluruh program dilengkapi simulasi praktis dan sertifikat digital.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Level Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSelectedLevel('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedLevel === 'ALL'
                ? 'bg-nac-primary text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Program
          </button>
          <button
            onClick={() => setSelectedLevel('AB')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedLevel === 'AB'
                ? 'bg-nac-primary text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Brevet AB Terpadu
          </button>
          <button
            onClick={() => setSelectedLevel('C')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedLevel === 'C'
                ? 'bg-nac-primary text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Brevet C Eksekutif
          </button>
          <button
            onClick={() => setSelectedLevel('CORETAX')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedLevel === 'CORETAX'
                ? 'bg-nac-primary text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Simulasi Coretax DJP
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi, silabus..."
            className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:ring-2 focus:ring-nac-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 text-center py-16 text-slate-500">
            Memuat daftar program dari static mock API (/api/brevets.json)...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-slate-500">
            Tidak ada program brevet yang sesuai dengan pencarian Anda.
          </div>
        ) : (
          filtered.map((brevet) => (
            <div
              key={brevet.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={brevet.thumbnail}
                  alt={brevet.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow">
                  {brevet.badge}
                </span>
                <span className="absolute bottom-3 left-4 text-xs font-medium text-white flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {brevet.duration}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-nac-primary transition">
                    {brevet.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {brevet.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    {brevet.features?.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block line-through">
                      Rp {brevet.original_price?.toLocaleString('id-ID')}
                    </span>
                    <span className="text-base font-black text-nac-primary font-mono">
                      Rp {brevet.price?.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/brevet/${brevet.slug}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Silabus
                    </Link>
                    <Link
                      to={`/register?brevet_id=${brevet.id}`}
                      className="btn-primary text-xs py-2 px-3.5 shadow-sm"
                    >
                      Daftar &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrevetCatalogPage;
