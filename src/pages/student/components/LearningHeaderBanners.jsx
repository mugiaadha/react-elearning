import React from 'react';
import {
  Award,
  Clock,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

export const LearningHeaderBanners = ({
  modulesNeedingRevision = [],
  isApprovedByTeacher,
  isPendingEvaluation,
  revisionSubmission,
  onOpenCertificate,
  onOpenRevisionModule,
}) => {
  return (
    <div className="space-y-4">
      {/* 0. PERINGATAN REVISI PER MODUL (INTERAKTIF & JELAS) */}
      {modulesNeedingRevision.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg border border-orange-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-full bg-white text-orange-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Perlu Tindakan Anda
                </span>
                <span className="text-xs font-bold text-orange-100">
                  {modulesNeedingRevision.length} Modul Perlu Diperbaiki
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Pengajar Meminta Revisi pada Jawaban Ulangan
              </h3>
              <p className="text-xs text-orange-100 mt-0.5 leading-relaxed">
                Silakan buka modul yang ditandai warna oranye untuk membaca catatan koreksi instruktur dan mengirim ulang lembar jawaban Anda.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-stretch md:self-auto">
            {modulesNeedingRevision.map((m) => (
              <button
                key={m.id || m.modIdx}
                onClick={() => onOpenRevisionModule?.(m.modIdx)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-white hover:bg-orange-50 text-orange-950 shadow-md transition self-stretch sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
                <span>Buka & Perbaiki Modul {m.modIdx + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. LULUS OLEH GURU (GRADUATED & APPROVED) - SERTIFIKAT DIGITAL TERBIT */}
      {isApprovedByTeacher && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl p-5 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Selamat! Anda Telah Dinyatakan LULUS oleh Pengajar</h3>
              <p className="text-xs font-medium text-slate-900">
                Seluruh modul & ujian telah selesai dievaluasi oleh Pengajar. Sertifikat kelulusan resmi Anda telah diterbitkan dengan Nomor Registrasi BKP unik.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCertificate}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-slate-950 hover:bg-slate-900 shadow-md transition"
          >
            <Award className="w-4 h-4 text-amber-400" />
            Buka & Cetak Sertifikat Digital
          </button>
        </div>
      )}

      {/* 2. MENUNGGU EVALUASI PENGAJAR (SELURUH MODUL SELESAI, SEDANG DIPERIKSA GURU) */}
      {isPendingEvaluation && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md text-emerald-200 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Seluruh Modul & Ujian Telah Selesai Dikumpulkan!</h3>
              <p className="text-xs text-emerald-100">
                Lembar jawaban Anda sedang dalam proses peninjauan dan penilaian oleh Pengajar. Sertifikat resmi akan diterbitkan setelah Pengajar meluluskan evaluasi akhir Anda.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30 text-emerald-100">
            Status: Menunggu Penilaian Pengajar
          </span>
        </div>
      )}

      {/* 3. PERMINTAAN REVISI DARI GURU (FALLBACK JIKA BELUM ADA MODUL SPESIFIK) */}
      {revisionSubmission && modulesNeedingRevision.length === 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Pengajar Meminta Revisi pada Jawaban Ulangan</h3>
              <p className="text-xs text-amber-100">
                Terdapat catatan dari pengajar: "{revisionSubmission.teacher_feedback || 'Mohon perbaiki lembar jawaban sesuai petunjuk'}". Silakan periksa modul terkait dan kirimkan kembali jawaban revisi Anda.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-4 py-2 rounded-xl bg-slate-950 text-amber-400 text-xs font-bold">
            Perlu Revisi
          </span>
        </div>
      )}
    </div>
  );
};

export default LearningHeaderBanners;
