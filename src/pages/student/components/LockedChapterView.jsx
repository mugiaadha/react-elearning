import React from 'react';
import { Lock, PlayCircle } from 'lucide-react';

export const LockedChapterView = ({
  isExamSelected,
  activeLessonIndex,
  regularLessons = [],
  completedLessonIds = [],
  onOpenCurrentLesson,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8 sm:p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
          Akses Terkunci Secara Berurutan
        </span>
        <h3 className="text-xl font-bold text-slate-900">
          {isExamSelected ? 'Ulangan Akhir Modul Ini Masih Terkunci' : `Bab ${activeLessonIndex + 1} Masih Terkunci`}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isExamSelected
            ? `Anda harus menyelesaikan dan mempelajari seluruh ${regularLessons.length} bab materi kuliah pada modul ini terlebih dahulu sebelum dapat mengakses lembar soal dan form uploader ulangan akhir modul.`
            : `Anda harus menyelesaikan Bab ${activeLessonIndex} terlebih dahulu sebelum dapat mengakses dan mempelajari materi pada Bab ${activeLessonIndex + 1}.`}
        </p>
      </div>
      <div className="pt-2">
        <button
          onClick={onOpenCurrentLesson}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-nac-primary hover:bg-nac-primary/90 text-xs shadow-md transition"
        >
          <PlayCircle className="w-4 h-4" />
          Buka Bab yang Sedang Berjalan
        </button>
      </div>
    </div>
  );
};

export default LockedChapterView;
