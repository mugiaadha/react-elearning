import React from 'react';
import { ShieldCheck, Award, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Tentang Lembaga
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pusat Unggulan Pelatihan & Sertifikasi Brevet Perpajakan
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          NAC Tax Center didirikan sebagai wadah akselerasi kompetensi perpajakan praktis bagi mahasiswa, akuntan korporasi, dan calon konsultan pajak di Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">Misi & Standar Kualitas NAC</h2>
          <p>
            Dengan disahkannya UU Harmonisasi Peraturan Perpajakan (UU HPP) serta peluncuran sistem Coretax DJP terintegrasi, lanskap administrasi pajak Indonesia mengalami revolusi digital terbesar dalam sejarah.
          </p>
          <p>
            NAC Tax Center hadir memastikan setiap praktisi menguasai tidak hanya teori kepatuhan formal, tetapi juga keterampilan teknis pengoperasian aplikasi mutakhir (e-Faktur 4.0, e-Bupot Unifikasi, hingga Taxpayer Ledger Coretax).
          </p>
          <div className="pt-2 flex flex-col gap-2 font-medium text-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instruktur berizin resmi Konsultan Pajak (BKP) Tingkat A, B, & C</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Simulasi studi kasus nyata sengketa & pemeriksaan pajak DJP</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sertifikat kelulusan digital dilengkapi sistem verifikasi QR online</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-950 text-white p-8 rounded-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center">
              BKP
            </div>
            <div>
              <div className="font-bold text-sm">Akreditasi & Afiliasi Profesi</div>
              <div className="text-xs text-slate-400">Ikatan Konsultan Pajak Indonesia</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Kurikulum kami disusun selaras dengan Silabus Ujian Sertifikasi Konsultan Pajak (USKP) nasional untuk menjamin nilai aplikatif yang tinggi.
          </p>
          <Link to="/brevet" className="btn-primary text-xs w-full justify-center">
            Lihat Program Brevet Kami
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
