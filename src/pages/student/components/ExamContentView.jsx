import React from 'react';
import {
  Award,
  Download,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Check,
  ExternalLink,
  UploadCloud,
  CheckCircle,
} from 'lucide-react';

export const ExamContentView = ({
  activeModuleIndex,
  course,
  activeModuleExam,
  activeModuleSubmission,
  isApprovedByTeacher,
  onNextModule,
  onClaimCertificate,
  onSubmitExam,
  submittingExam,
  selectedFile,
  setSelectedFile,
  submissionUrlInput,
  setSubmissionUrlInput,
  submissionNotesInput,
  setSubmissionNotesInput,
  fileInputRef,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-7">
      {/* Header Bab Akhir: Latihan & Ulangan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                Bab Akhir • Ulangan Modul {activeModuleIndex + 1}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Syarat Buka Modul Berikutnya</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {activeModuleExam.title}
            </h3>
          </div>
        </div>

        {/* Action Buttons: Download Soal & Sudah Selesai / Lanjut ke Modul Berikutnya */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {activeModuleExam.question_url && (
            <a
              href={activeModuleExam.question_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Soal
            </a>
          )}
          {activeModuleIndex < (course?.curriculum?.length || 0) - 1 ? (
            <button
              type="button"
              onClick={onNextModule}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sudah Selesai (Lanjut ke Modul {activeModuleIndex + 2})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : isApprovedByTeacher ? (
            <button
              type="button"
              onClick={onClaimCertificate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Lihat Kelulusan & Buka Sertifikat</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Petunjuk Soal dari Pengajar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
        <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-slate-500">
          Petunjuk Pengerjaan Ulangan:
        </span>
        <p className="leading-relaxed">
          {activeModuleExam.description}
        </p>
      </div>

      {/* Status Evaluasi / Kelulusan dari Guru */}
      {activeModuleSubmission && (
        <div className="space-y-3">
          {/* Status: REVISION (Guru Meminta Revisi) */}
          {activeModuleSubmission.status === 'REVISION' && (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-300 text-orange-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-orange-800">
                <RotateCcw className="w-4 h-4 text-orange-600 animate-spin-slow" />
                <span>Pengajar Meminta Revisi pada Jawaban Ulangan Ini</span>
              </div>
              {activeModuleSubmission.teacher_feedback ? (
                <div className="bg-white/80 p-3 rounded-xl border border-orange-200 text-xs">
                  <span className="font-bold text-orange-900 text-[11px] block mb-0.5">
                    Catatan Koreksi dari Guru:
                  </span>
                  <p className="text-slate-700 italic">
                    "{activeModuleSubmission.teacher_feedback}"
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-orange-900">
                  Mohon periksa kembali kertas kerja Anda dan unggah ulang file lembar jawaban di form bawah.
                </p>
              )}
            </div>
          )}

          {/* Status: APPROVED (Lulus) */}
          {activeModuleSubmission.status === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>LULUS! Ulangan Modul Ini Telah Diterima oleh Guru</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-xs font-mono">
                  Nilai: {activeModuleSubmission.score || 95} / 100
                </span>
              </div>

              {activeModuleSubmission.teacher_feedback && (
                <div className="bg-white/90 p-3 rounded-xl border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 text-[11px] block mb-0.5">
                    Catatan Apresiasi Pengajar:
                  </span>
                  <p className="text-slate-800 italic">
                    "{activeModuleSubmission.teacher_feedback}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Status: PENDING (Menunggu Penilaian) */}
          {activeModuleSubmission.status === 'PENDING' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <Check className="w-4 h-4 text-amber-600" />
                <span>Jawaban Berhasil Terkirim (Menunggu Evaluasi Pengajar)</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Jawaban Anda telah masuk antrean penilaian instruktur. <span className="font-bold">Modul berikutnya kini telah terbuka</span> dan dapat langsung Anda pelajari tanpa menunggu evaluasi selesai.
              </p>
            </div>
          )}

          {/* Preview File Jawaban yang Sudah Terkumpul */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                File / Tautan Jawaban yang Sudah Diunggah:
              </span>
              <span className="font-bold text-slate-800 block mt-0.5">
                {activeModuleSubmission.file_size || 'File Dokumen Terunggah'}
              </span>
              {activeModuleSubmission.submission_notes && (
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Catatan: "{activeModuleSubmission.submission_notes}"
                </span>
              )}
            </div>

            <a
              href={activeModuleSubmission.submission_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs shrink-0 self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              Buka File Jawaban
            </a>
          </div>
        </div>
      )}

      {/* UPLOADER EKSKLUSIF: HANYA ADA DI BAB AKHIR INI */}
      {(!activeModuleSubmission || activeModuleSubmission.status === 'REVISION') && (
        <form onSubmit={onSubmitExam} className="space-y-4 pt-2">
          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2 mb-1">
              <UploadCloud className="w-4 h-4 text-nac-primary" />
              Upload Langsung Lembar Jawaban Ulangan:
            </h4>
            <p className="text-[11px] text-slate-500">
              Pilih file jawaban Anda dari komputer (Excel .xlsx, PDF, Word .docx, ZIP) atau sertakan tautan Google Drive.
            </p>
          </div>

          {/* File Upload Box (Drag and Drop / File Picker) */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
              selectedFile
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-slate-300 hover:border-nac-primary bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.pdf,.docx,.doc,.zip,.rar"
              onChange={(e) => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-1.5">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <span className="font-bold text-slate-900 block text-xs">
                  {selectedFile.name}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {(selectedFile.size / 1048576).toFixed(2)} MB • Klik untuk mengganti file
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                <div>
                  <span className="font-bold text-nac-primary text-xs hover:underline block">
                    Klik di sini untuk memilih file lembar jawaban
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Mendukung file Excel (.xlsx), PDF, Word (.docx), atau ZIP (Maks. 35 MB)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Opsi Tambahan: Link Google Drive */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Atau Tautan Google Drive (Jika Jawaban Disimpan di Cloud)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/.../view"
              value={submissionUrlInput}
              onChange={(e) => setSubmissionUrlInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-nac-primary bg-white"
            />
          </div>

          {/* Catatan Pengerjaan Siswa */}
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Catatan Tambahan untuk Pengajar (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Kertas kerja perhitungan PPh 21 TER dan rekonsiliasi fiskal telah selesai dikerjakan pada sheet 1 dan 2..."
              value={submissionNotesInput}
              onChange={(e) => setSubmissionNotesInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-nac-primary bg-white"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submittingExam}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-nac-primary hover:bg-nac-primary/90 text-white shadow-md transition"
          >
            <UploadCloud className="w-4 h-4" />
            {submittingExam
              ? 'Mengunggah Jawaban...'
              : activeModuleSubmission?.status === 'REVISION'
              ? 'Kirim Ulang Jawaban Revisi'
              : 'Kirim Lembar Jawaban & Buka Modul Berikutnya'}
          </button>
        </form>
      )}

      {/* Tombol Navigasi Lanjut ke Modul Berikutnya atau Status Kelulusan & Sertifikat di Bab Akhir */}
      {activeModuleIndex < (course?.curriculum?.length || 0) - 1 ? (
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-0.5">
            <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Langkah Selanjutnya: Modul {activeModuleIndex + 2}
            </h5>
            <p className="text-[11px] text-slate-500">
              Setelah selesai mempelajari materi bab akhir atau mengunggah lembar jawaban, klik tombol di samping untuk langsung melanjutkan pembelajaran ke modul berikutnya.
            </p>
          </div>

          <button
            type="button"
            onClick={onNextModule}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sudah Selesai (Lanjut ke Modul {activeModuleIndex + 2})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : isApprovedByTeacher ? (
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 p-5 rounded-2xl border-2 border-amber-400 shadow-sm animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-sm">
                Status Kelulusan: LULUS
              </span>
              <span className="text-xs text-amber-900 font-bold">
                • Nilai Akhir: {activeModuleSubmission?.score || 95} / 100
              </span>
            </div>
            <h5 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600 shrink-0" />
              Selamat! Anda Telah Lulus & Sertifikat Siap Dilihat
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Pengajar telah mengevaluasi lembar jawaban ulangan akhir Anda dan menyatakan Anda LULUS resmi. Klik tombol di samping untuk melihat status kelulusan dan membuka sertifikat digital resmi Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={onClaimCertificate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:shadow-lg transition shrink-0"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Lihat Status Kelulusan & Buka Sertifikat</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ExamContentView;
