import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import brevetService from '../../services/brevetService';
import {
  ShieldCheck,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Clock,
  Star,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const [brevets, setBrevets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brevetService.getAllBrevets()
      .then(setBrevets)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-nac-navy to-slate-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pusat Pelatihan Brevet Pajak Terakreditasi 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Kuasai Perpajakan Terapan, Siap Hadapi Era{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">
                Coretax DJP & UU HPP
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Tingkatkan jenjang karier perpajakan Anda dengan kurikulum praktis terintegrasi: Brevet AB Terpadu & Brevet C Eksekutif dibimbing langsung oleh Konsultan Pajak Berizin (BKP) dan mantan pemeriksa DJP.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/brevet"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 transition active:scale-95 text-sm"
              >
                <span>Lihat Katalog Brevet & Biaya</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/brevet/brevet-ab-terpadu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition text-sm"
              >
                <span>Silabus Brevet AB Terpadu</span>
              </Link>
            </div>

            {/* Key trust indicators */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sertifikat Terverifikasi QR</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Simulasi e-Faktur 4.0 & e-Bupot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Skema TER PPh 21 PP 58/2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <div className="text-center p-2 border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-4xl font-extrabold text-nac-primary font-mono">5.400+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Alumni Praktisi Tersebar di Indonesia</div>
          </div>
          <div className="text-center p-2 border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-600 font-mono">98.4%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Tingkat Kelulusan Ujian Komprehensif</div>
          </div>
          <div className="text-center p-2 border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">100%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Instruktur BKP & Praktisi Berpengalaman</div>
          </div>
          <div className="text-center p-2">
            <div className="text-2xl sm:text-4xl font-extrabold text-indigo-600 font-mono">4.95/5</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Rating Kepuasan Pelatihan</div>
          </div>
        </div>
      </section>

      {/* 3. Program Brevet Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Pilihan Program Sertifikasi
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Program Pelatihan Brevet Pajak Resmi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pilih kurikulum yang sesuai dengan kebutuhan karier dan target industri Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {brevets.map((brevet) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow">
                  {brevet.badge}
                </span>
                <span className="absolute bottom-3 left-4 text-xs font-medium text-white flex items-center gap-1">
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
                    {brevet.features?.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block line-through">
                      Rp {brevet.original_price?.toLocaleString('id-ID')}
                    </span>
                    <span className="text-lg font-black text-nac-primary font-mono">
                      Rp {brevet.price?.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <Link
                    to={`/brevet/${brevet.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-nac-primary text-white transition"
                  >
                    <span>Detail</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Keunggulan & Mengapa NAC Tax Center */}
      <section className="bg-slate-100/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Mengapa Memilih NAC Tax Center?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Standar mutu tinggi untuk menjamin kesiapan Anda menjadi profesional perpajakan kompeten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-nac-primary flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Kurikulum Paling Terkini</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Materi selalu diperbarui dengan regulasi terbaru: UU Harmonisasi Peraturan Perpajakan (UU HPP), skema TER PPh 21, dan integrasi Coretax DJP.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instruktur BKP & Eks Pemeriksa DJP</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Belajar langsung dari praktisi yang terbiasa menangani sengketa pajak, SP2DK, dan audit kepatuhan korporasi skala nasional dan PMA.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Sertifikat Digital Terverifikasi QR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap lulusan mendapatkan sertifikat resmi dengan Nomor Seri Registrasi dan kode QR yang dapat divalidasi langsung oleh perusahaan pemberi kerja.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-950 via-nac-navy to-nac-primary rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Siap Memulai Karier Sebagai Ahli Pajak Terpercaya?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Daftar sekarang untuk mengamankan kuota kelas Brevet Pajak angkatan berikutnya. Akses materi langsung terbuka setelah approval pembayaran.
            </p>
            <div className="pt-4 flex justify-center">
              <Link
                to="/brevet"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-xl transition"
              >
                <span>Daftar Program Brevet Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
