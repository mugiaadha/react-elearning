import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nac-navy to-nac-primary flex items-center justify-center text-white shadow-md">
                <span className="font-extrabold text-lg text-amber-400">NAC</span>
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">
                  NAC TAX CENTER
                </span>
                <p className="text-xs text-slate-500">Pusat Pelatihan & Sertifikasi Brevet Pajak Terakreditasi</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              Lembaga pelatihan brevet perpajakan profesional terkemuka di Indonesia. Menyiapkan praktisi akuntansi dan perpajakan siap kerja dengan kurikulum terpadu berbasis UU Harmonisasi Peraturan Perpajakan (UU HPP) dan simulasi Coretax DJP terbaru.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 pt-2 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Sertifikat Terverifikasi Resmi dengan Pengaman QR Code</span>
            </div>
          </div>

          {/* Program Brevet */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Program Brevet
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/brevet/brevet-ab-terpadu" className="hover:text-white transition">
                  Brevet AB Terpadu
                </Link>
              </li>
              <li>
                <Link to="/brevet/brevet-c-eksekutif" className="hover:text-white transition">
                  Brevet C Eksekutif
                </Link>
              </li>
              <li>
                <Link to="/brevet/simulasi-coretax-djp" className="hover:text-white transition">
                  Simulasi Coretax DJP
                </Link>
              </li>
              <li>
                <Link to="/brevet" className="text-sky-400 hover:text-sky-300 transition font-medium">
                  Semua Program & Jadwal &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan & Validasi */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Layanan & Validasi
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/verify-certificate/NAC-CERT-2026-AB-88219" className="hover:text-white transition flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Verifikasi Sertifikat
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition">
                  Wawasan Pajak & UU HPP
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition">
                  Profil Pengajar & BKP
                </Link>
              </li>
              <li>
                <Link to="/onboarding/payment-pending" className="hover:text-white transition">
                  Konfirmasi Pembayaran
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Sekretariat Pusat
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
                <span>NAC Tax Tower Lt. 8, Jl. HR Rasuna Said Kav. C-22, Jakarta Selatan 12920</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>info@nactaxcenter.id</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>+62 (021) 5290-8800 / 0812-8890-4123</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 NAC Tax Center. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-slate-400 cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-slate-400 cursor-pointer">Standar Kompetensi BKP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
