import React from 'react';
import {
  Lock,
  RotateCcw,
  Check,
  CheckCircle2,
  Clock,
  PlayCircle,
  Award,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Users,
} from 'lucide-react';

export const CourseSyllabusSidebar = ({
  curriculum = [],
  batchName,
  activeModuleIndex,
  setActiveModuleIndex,
  activeLessonId,
  setActiveLessonId,
  completedLessonIds = [],
  userSubmissions = [],
  isModuleUnlocked,
  isChapterUnlocked,
  showToast,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Silabus & Kunci Bab Belajar</h3>
          {batchName && (
            <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3 text-amber-600" />
              <span>Angkatan: {batchName}</span>
            </p>
          )}
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {curriculum.length} Modul
        </span>
      </div>

      <div className="space-y-3">
        {curriculum.map((module, mIdx) => {
          const isModUnlocked = isModuleUnlocked(mIdx);
          const isCurrentModule = activeModuleIndex === mIdx;

          // Check module exam submission status
          const moduleSub = userSubmissions.find(
            (s) => s.module_id === module.id || s.module_id === module.exam?.id || s.module_id === `exam-${module.id}`
          );
          const isRevision = moduleSub?.status === 'REVISION';
          const isApproved = moduleSub?.status === 'APPROVED';
          const isPending = moduleSub?.status === 'PENDING';
          const hasExamSubmitted = Boolean(moduleSub) || completedLessonIds.includes(`exam-${module.id}`);

          return (
            <div
              key={module.id || mIdx}
              className={`rounded-xl border transition-all ${
                isRevision
                  ? 'border-orange-400 bg-orange-50/70 shadow-sm ring-2 ring-orange-400/40'
                  : isModUnlocked
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-200/60 bg-slate-50/80 opacity-70'
              }`}
            >
              {/* Module Accordion Header */}
              <button
                onClick={() => {
                  if (isModUnlocked) {
                    setActiveModuleIndex(mIdx);
                    if (module.lessons?.[0]) {
                      setActiveLessonId(module.lessons[0].id);
                    } else {
                      setActiveLessonId('EXAM');
                    }
                  } else {
                    showToast?.(`Selesaikan dan kumpulkan ulangan Modul ${mIdx} terlebih dahulu untuk membuka modul ini.`, 'warning');
                  }
                }}
                className="w-full text-left p-3.5 flex items-center justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {isModUnlocked ? (
                      isRevision ? (
                        <span
                          className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center bg-orange-500 text-white shadow-sm ring-2 ring-orange-200 animate-pulse"
                          title="Pengajar meminta revisi pada lembar jawaban modul ini"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </span>
                      ) : isApproved ? (
                        <span
                          className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-emerald-100 text-emerald-800"
                          title="Ulangan modul telah lulus"
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      ) : isPending ? (
                        <span
                          className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-amber-100 text-amber-800"
                          title="Jawaban telah dikirim, menunggu evaluasi pengajar"
                        >
                          <Clock className="w-3 h-3" />
                        </span>
                      ) : hasExamSubmitted ? (
                        <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-nac-primary/10 text-nac-primary">
                          {mIdx + 1}
                        </span>
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-bold leading-snug ${isRevision ? 'text-orange-950' : 'text-slate-900'}`}>
                      {module.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span>{module.duration || '8 Jam'}</span>
                      <span>•</span>
                      <span>{(module.lessons?.length || 0) + 1} Bab</span>
                      {isRevision ? (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-200 text-orange-950 border border-orange-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-orange-700" />
                            Perlu Revisi Guru
                          </span>
                        </>
                      ) : isApproved ? (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Lulus ({moduleSub.score || 95}/100)
                          </span>
                        </>
                      ) : isPending ? (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Menunggu Review
                          </span>
                        </>
                      ) : hasExamSubmitted ? (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">Ulangan Selesai</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {isModUnlocked && (
                  <div>
                    {isCurrentModule ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </button>

              {/* CHAPTERS INSIDE ACTIVE MODULE: CHAPTER-PER-CHAPTER LOCKING */}
              {isModUnlocked && isCurrentModule && (
                <div className="px-3 pb-3 space-y-1.5 border-t border-slate-100 pt-2">
                  {/* 1. BAB-BAB MATERI BIASA (BAB 1, BAB 2, DST) */}
                  {module.lessons?.map((les, cIdx) => {
                    const isCompleted = completedLessonIds.includes(les.id);
                    const isSelected = activeLessonId === les.id;
                    const isChapUnlocked = isChapterUnlocked(mIdx, cIdx, false);

                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          if (isChapUnlocked) {
                            setActiveLessonId(les.id);
                          } else {
                            showToast?.(`Selesaikan Bab ${cIdx} terlebih dahulu untuk membuka Bab ${cIdx + 1}.`, 'warning');
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 transition ${
                          !isChapUnlocked
                            ? 'text-slate-400 bg-slate-50/50 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-sky-50 text-nac-primary font-bold border border-sky-200 shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {!isChapUnlocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">Bab {cIdx + 1}: {les.title}</span>
                          {(les.is_update || les.is_optional) && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-bold border border-purple-200 shrink-0">
                              Update Baru
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {!isChapUnlocked ? 'Terkunci' : les.duration}
                        </span>
                      </button>
                    );
                  })}

                  {/* 2. BAB AKHIR: KHUSUS LATIHAN & ULANGAN MODUL */}
                  {(() => {
                    const isExamUnlocked = isChapterUnlocked(mIdx, 0, true);

                    return (
                      <button
                        onClick={() => {
                          if (isExamUnlocked) {
                            setActiveLessonId('EXAM');
                          } else {
                            showToast?.('Selesaikan semua bab materi di modul ini terlebih dahulu sebelum membuka ulangan akhir modul.', 'warning');
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between border transition ${
                          !isExamUnlocked
                            ? 'border-slate-200 text-slate-400 bg-slate-50/50 opacity-60 cursor-not-allowed'
                            : isRevision
                            ? 'bg-orange-100/90 text-orange-950 font-extrabold border-orange-400 shadow-sm ring-2 ring-orange-400/50 hover:bg-orange-200/80'
                            : activeLessonId === 'EXAM'
                            ? 'bg-amber-100/90 text-amber-950 font-extrabold border-amber-300 shadow-sm ring-1 ring-amber-300'
                            : isApproved
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : hasExamSubmitted
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/60 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {!isExamUnlocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : isRevision ? (
                            <RotateCcw className="w-4 h-4 text-orange-700 shrink-0" />
                          ) : isApproved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isPending ? (
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <Award className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <span className="truncate">
                            {isRevision
                              ? '⚠️ Bab Akhir: Perlu Revisi Jawaban!'
                              : '🎯 Bab Akhir: Latihan & Ulangan Modul'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            !isExamUnlocked
                              ? 'bg-slate-200 text-slate-500'
                              : isRevision
                              ? 'bg-orange-600 text-white font-black animate-pulse shadow-sm'
                              : isApproved
                              ? 'bg-emerald-200 text-emerald-900'
                              : isPending
                              ? 'bg-amber-200 text-amber-900'
                              : hasExamSubmitted
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-amber-200 text-amber-900'
                          }`}
                        >
                          {!isExamUnlocked
                            ? 'Terkunci'
                            : isRevision
                            ? 'Upload Revisi'
                            : isApproved
                            ? 'Lulus'
                            : isPending
                            ? 'Menunggu Review'
                            : hasExamSubmitted
                            ? 'Terkumpul'
                            : 'Uploader'}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSyllabusSidebar;
