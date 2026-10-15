import React from 'react';
import {
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Download,
  HelpCircle,
} from 'lucide-react';
import { formatYouTubeEmbedUrl, getMaterialTypeMeta } from './learningHelpers';

export const LessonContentView = ({
  activeLesson,
  activeLessonIndex,
  regularLessons = [],
  completedLessonIds = [],
  nextChapterId,
  gdriveDocuments = [],
  onCompleteAndNext,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* 1. LAYAR BESAR DI ATAS: VIDEO YOUTUBE DARI GURU */}
      {activeLesson?.type === 'video' && (activeLesson.video_url || activeLesson.url) ? (
        <div className="bg-slate-950 overflow-hidden">
          <div className="aspect-video bg-slate-950 relative flex items-center justify-center">
            <iframe
              className="w-full h-full border-0"
              src={formatYouTubeEmbedUrl(activeLesson.video_url || activeLesson.url)}
              title={activeLesson.title || 'Video Pembelajaran Perpajakan'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Video Kuliah Interaktif Terintegrasi Sistem Belajar</span>
            <a
              href={activeLesson.video_url || activeLesson.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-xs font-semibold hover:underline"
            >
              <span>Buka Video di YouTube (Tab Baru)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-300">
            <FileText className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
            Materi Bacaan & Dokumen Kuliah
          </span>
          <h3 className="text-lg font-bold text-white max-w-lg mx-auto">
            {activeLesson?.title || 'Materi Modul Ajar'}
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Pelajari materi di bawah ini dan unduh dokumen lampiran yang disediakan pengajar.
          </p>
        </div>
      )}

      {/* 2. DI BAWAH LAYAR BESAR: INFO MATERI & DOKUMEN GOOGLE DRIVE */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Durasi: {activeLesson?.duration || '45 Menit'}</span>
              <span>•</span>
              <span className="capitalize">{activeLesson?.type || 'Video Kuliah'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bab {activeLessonIndex + 1}: {activeLesson?.title}
            </h3>
          </div>

          {/* TOMBOL: TANDAI SELESAI & BUKA BAB BERIKUTNYA */}
          {activeLesson && (
            <button
              onClick={() => onCompleteAndNext(activeLesson.id, nextChapterId)}
              className="shrink-0 btn-emerald text-xs inline-flex items-center gap-2 py-2 px-4 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completedLessonIds.includes(activeLesson.id)
                ? activeLessonIndex === regularLessons.length - 1
                  ? 'Sudah Selesai (Lanjut ke Bab Akhir / Ulangan)'
                  : 'Sudah Selesai (Lanjut ke Bab Berikutnya)'
                : activeLessonIndex === regularLessons.length - 1
                ? 'Tandai Selesai & Buka Bab Akhir (Ulangan)'
                : 'Tandai Selesai & Buka Bab Berikutnya'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* DOKUMEN-DOKUMEN DARI GOOGLE DRIVE YANG DIKASIH GURU (MURID BISA DOWNLOAD) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-nac-primary" />
              Dokumen Bahan Ajar Google Drive (Download Materi dari Guru):
            </h4>
            <span className="text-[11px] text-slate-400">Unduh & Pelajari</span>
          </div>

          {gdriveDocuments.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              Materi bab ini disajikan melalui video kuliah interaktif. Silakan tonton sampai selesai, lalu klik tombol di atas untuk membuka bab berikutnya.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gdriveDocuments.map((doc) => {
                const meta = getMaterialTypeMeta(doc.type);
                const IconComp = meta.icon;
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <IconComp className="w-4 h-4 text-nac-primary" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {meta.label} • {doc.duration || 'Bahan Ajar'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nac-primary/10 hover:bg-nac-primary text-nac-primary hover:text-white font-bold text-xs transition"
                      title="Download Materi dari Guru"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Card: Menjelaskan bahwa Uploader HANYA ada di Bab Akhir */}
        <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex items-start gap-3 text-xs text-sky-900">
          <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Informasi Alur Belajar Modul:</span>
            <p className="text-[11px] text-sky-800 mt-0.5 leading-relaxed">
              Selesaikan setiap bab materi secara berurutan. Bab selanjutnya akan otomatis terbuka setelah Anda menyelesaikan bab ini. Form uploader lembar jawaban <span className="font-bold">hanya tersedia pada Bab Akhir (Ulangan Modul)</span> sebagai syarat kelulusan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContentView;
