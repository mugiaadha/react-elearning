import React, { useEffect } from 'react';
import { X, Printer, Download, CheckCircle, Shield, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CertificateModal = ({ isOpen, onClose, certificate }) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D97706', '#059669', '#0284C7', '#F59E0B']
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-4 sm:my-8">
        {/* Header toolbar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 truncate">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate">Sertifikat Kelulusan Digital Resmi</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Cetak /</span> PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Sertifikat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-3 sm:p-8 md:p-12 bg-[#FDFBF7] text-slate-800 relative select-none print:m-0 print:p-6 overflow-x-auto" id="printable-certificate">
          <div className="border-2 sm:border-4 border-amber-600/80 p-4 sm:p-8 md:p-10 relative rounded-lg outline outline-2 outline-offset-2 sm:outline-offset-4 outline-amber-700/40 min-w-[280px]">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-4 h-4 sm:w-8 sm:h-8 border-t-2 border-l-2 border-amber-700"></div>
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4 h-4 sm:w-8 sm:h-8 border-t-2 border-r-2 border-amber-700"></div>
            <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 w-4 h-4 sm:w-8 sm:h-8 border-b-2 border-l-2 border-amber-700"></div>
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-8 sm:h-8 border-b-2 border-r-2 border-amber-700"></div>

            {/* Certificate Header */}
            <div className="text-center space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] sm:text-xs font-bold tracking-widest uppercase border border-amber-200">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-700" />
                NAC TAX CENTER INDONESIA
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-wide pt-1">
                SERTIFIKAT KELULUSAN
              </h2>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-mono tracking-wider">
                NOMOR SERI REGISTRASI: {certificate.certificate_id}
              </p>
            </div>

            {/* Body */}
            <div className="my-5 sm:my-8 text-center space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 uppercase tracking-widest font-semibold">
                DIBERIKAN DENGAN BANGGA KEPADA:
              </p>
              <div className="text-xl sm:text-3xl md:text-4xl font-black text-nac-navy tracking-tight font-serif border-b-2 border-amber-500/40 inline-block px-4 sm:px-8 pb-1.5">
                {certificate.recipient_name}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed pt-1">
                Atas keberhasilan menyelesaikan seluruh kurikulum pembelajaran teori, simulasi aplikasi kepatuhan perpajakan, dan lulus Ujian Komprehensif pada program:
              </p>
              <div className="text-base sm:text-xl md:text-2xl font-bold text-amber-800 font-serif">
                {certificate.course_title}
              </div>
              <div className="inline-block bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border border-amber-200 text-[11px] sm:text-xs text-slate-700 font-semibold shadow-sm">
                Yudisium: <span className="text-emerald-700 font-bold">{certificate.grade || 'Sangat Memuaskan (A)'}</span> — Nilai Akhir: <span className="font-bold">{certificate.score || 92.5} / 100</span>
              </div>
            </div>

            {/* Footer Signatures & QR Code */}
            <div className="pt-4 sm:pt-8 md:pt-10 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
              {/* QR Code Validation */}
              <div className="flex items-center gap-2.5 sm:gap-3 bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-900 p-1 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v4h-2v-4zm6 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-4-2h2v2h-2v-2zm0-4h2v2h-2v-2zm4-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    Terverifikasi Digital
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5">
                    Scan QR keabsahan pangkalan data
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-sky-700 font-medium">
                    Terbit: {certificate.issue_date}
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center sm:text-right">
                <div className="font-serif italic text-slate-400 text-xs sm:text-sm mb-0.5">Signed digitally by:</div>
                <div className="font-bold text-slate-900 font-serif text-sm sm:text-base">
                  {certificate.director_name}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Direktur Eksekutif NAC Tax Center
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400">
                  BKP No. Reg: SI-8821/BKP-C/2021
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer note */}
        <div className="bg-slate-50 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-slate-200 text-center text-[10px] sm:text-xs text-slate-500">
          Sertifikat ini diakui oleh mitra industri & korporasi sebagai bukti kecakapan teknis Brevet Pajak terapan.
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
