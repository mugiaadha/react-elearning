import React from 'react';
import {
  Clock,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Award,
} from 'lucide-react';

export const TeacherModuleCard = ({
  mod,
  mIdx,
  onAddLesson,
  onDeleteLesson,
  onEditExam,
  onDeleteModule,
  getMaterialTypeBadge,
}) => {
  const exam = mod.exam || {
    id: `exam-${mod.id}`,
    title: `Ujian Studi Kasus: ${mod.title}`,
    description: 'Kerjakan studi kasus dan lampirkan link Google Drive lembar jawaban Anda di bawah.',
    question_url: null,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300">
      {/* Module Header Bar */}
      <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl bg-nac-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
            {mIdx + 1}
          </span>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {mod.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {mod.duration || '8 Jam Pelajaran'}
              </span>
              <span>•</span>
              <span>{mod.lessons?.length || 0} Bahan Ajar</span>
              <span>•</span>
              <span className="text-teal-700 font-semibold">1 Ujian Kelulusan</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => onAddLesson(mod)}
            className="btn-secondary text-xs py-1.5 px-3"
            title="Tambah Bahan Ajar ke Modul ini"
          >
            <Plus className="w-3.5 h-3.5 text-nac-primary" />
            Bahan Ajar
          </button>
          <button
            onClick={() => onDeleteModule(mod.id, mod.title)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Hapus Modul"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Content: Lessons & Exam */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* 1. Bahan Ajar (Google Drive / YouTube Links) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Bahan Ajar Pembelajaran:
            </span>
            <span className="text-[11px] text-slate-400">
              Tautan Eksternal Cloud
            </span>
          </div>

          {!mod.lessons || mod.lessons.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400">
              Belum ada bahan ajar. Klik "Bahan Ajar" di atas untuk menambahkan link video YouTube atau file Google Drive.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {mod.lessons.map((les) => {
                const badge = getMaterialTypeBadge(les.type);
                const IconComponent = badge.icon;
                return (
                  <div
                    key={les.id}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 shadow-sm">
                        <IconComponent className="w-4 h-4 text-nac-primary" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {les.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-slate-400">• {les.duration || '30 Min'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {les.url && (
                        <a
                          href={les.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-500 hover:text-nac-primary hover:bg-white rounded-lg transition"
                          title="Buka Tautan Materi di Tab Baru"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onDeleteLesson(mod.id, les.id, les.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                        title="Hapus Bahan Ajar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Ujian & Studi Kasus Modul */}
        <div className="rounded-xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/80 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase block">
                  Ujian & Kuis Syarat Kelulusan Modul:
                </span>
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {exam.title || `Ujian Studi Kasus: ${mod.title}`}
                </h5>
              </div>
            </div>

            <button
              onClick={() => onEditExam(mod, exam)}
              className="btn-secondary text-[11px] py-1 px-2.5 border-amber-300 text-amber-900 hover:bg-amber-100 self-start sm:self-auto"
            >
              Edit Soal Ujian
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {exam.description || 'Mahasiswa wajib mengunggah lembar jawaban studi kasus sebelum dapat melanjutkan ke modul berikutnya.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
            {exam.question_url ? (
              <a
                href={exam.question_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-50 transition text-xs shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                Buka Lembar Soal / Panduan Studi Kasus (Google Drive)
              </a>
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                (Belum ada link lembar soal eksternal ditautkan)
              </span>
            )}
            <span className="text-[11px] text-slate-500 font-medium">
              • Mahasiswa akan menjawab via uploader Google Drive di ruang kelas mereka.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherModuleCard;
