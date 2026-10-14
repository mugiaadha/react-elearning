import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import brevetService from '../../services/brevetService';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Award,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  PlayCircle
} from 'lucide-react';

export const BrevetDetailPage = () => {
  const { slug } = useParams();
  const [brevet, setBrevet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(0);

  useEffect(() => {
    brevetService.getBrevetBySlug(slug)
      .then(setBrevet)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-nac-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Memuat detail kurikulum program...
      </div>
    );
  }

  if (!brevet) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-slate-900">Program Brevet tidak ditemukan.</h2>
        <Link to="/brevet" className="text-sm text-nac-primary underline mt-2 inline-block">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  {brevet.badge}
                </span>
                <span className="text-xs text-slate-400">{brevet.level}</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {brevet.rating} ({brevet.total_reviews} ulasan)
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {brevet.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {brevet.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{brevet.duration} ({brevet.total_hours} Jam Pelatihan)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{brevet.total_enrolled?.toLocaleString('id-ID')} Mahasiswa Terdaftar</span>
                </div>
              </div>
            </div>

            {/* Price Floating Card */}
            <div className="lg:col-span-4 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <span className="text-xs text-slate-400 line-through">
                  Rp {brevet.original_price?.toLocaleString('id-ID')}
                </span>
                <div className="text-3xl font-black text-nac-primary font-mono">
                  Rp {brevet.price?.toLocaleString('id-ID')}
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Hemat {brevet.discount_percentage}% (Periode Pendaftaran Berjalan)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {brevet.features?.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/register?brevet_id=${brevet.id}`}
                className="w-full btn-primary text-center py-3.5 text-sm font-bold shadow-lg shadow-nac-primary/20 block"
              >
                Daftar Program Ini Sekarang &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Silabus & Struktur Kurikulum Modul
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Total {brevet.curriculum?.length} modul terpadu yang dirancang berjenjang dari teori fundamental hingga praktik pengisian formulir pajak.
              </p>
            </div>

            <div className="space-y-4">
              {brevet.curriculum?.map((mod, idx) => {
                const isOpen = openModuleIndex === idx;
                return (
                  <div key={mod.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <button
                      onClick={() => setOpenModuleIndex(isOpen ? -1 : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-nac-primary/10 text-nac-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{mod.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{mod.description}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 border-t border-slate-100 space-y-2.5 bg-white">
                        {mod.lessons?.map((les) => (
                          <div key={les.id} className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50">
                            <div className="flex items-center gap-2.5">
                              {les.type === 'video' ? (
                                <PlayCircle className="w-4 h-4 text-nac-primary" />
                              ) : (
                                <FileText className="w-4 h-4 text-emerald-600" />
                              )}
                              <span className="font-medium text-slate-800">{les.title}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">{les.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instructor Box */}
            {brevet.instructor && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={brevet.instructor.avatar}
                  alt={brevet.instructor.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100 shadow"
                />
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Instruktur Utama
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{brevet.instructor.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{brevet.instructor.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{brevet.instructor.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrevetDetailPage;
