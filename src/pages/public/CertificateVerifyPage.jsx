import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import certificateService from '../../services/certificateService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  XCircle,
  Award,
  CheckCircle2,
  Calendar,
  User,
  Search,
  BookOpen,
  Loader2
} from 'lucide-react';

export const CertificateVerifyPage = () => {
  const { certId } = useParams();
  const { showToast } = useToast();
  const [queryId, setQueryId] = useState(certId || 'NAC-CERT-2026-AB-88219');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkCertificate = async (idToCheck, isManual = false) => {
    if (!idToCheck?.trim()) {
      showToast('Masukkan nomor seri sertifikat terlebih dahulu.', 'warning');
      return;
    }
    setLoading(true);
    if (isManual) {
      showToast(`Memeriksa nomor seri "${idToCheck.trim().toUpperCase()}" di pangkalan data...`, 'loading', 1500);
    }
    try {
      const res = await certificateService.verifyCertificate(idToCheck);
      setResult(res);
      if (isManual) {
        if (res.isValid) {
          showToast(`Sertifikat terverifikasi resmi atas nama ${res.certificate?.recipient_name}!`, 'success', 4000);
        } else {
          showToast(`Sertifikat "${idToCheck}" tidak ditemukan di pangkalan data sah.`, 'warning', 4500);
        }
      }
    } catch (err) {
      console.error(err);
      if (isManual) {
        showToast('Gagal memverifikasi ke pangkalan data.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certId) {
      checkCertificate(certId, false);
    } else {
      checkCertificate('NAC-CERT-2026-AB-88219', false);
    }
  }, [certId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    checkCertificate(queryId, true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Award className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Pangkalan Data & Verifikasi Sertifikat Resmi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Layanan publik validasi keaslian sertifikat kelulusan Brevet Pajak NAC Tax Center Indonesia.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            placeholder="Masukkan Nomor Seri (contoh: NAC-CERT-2026-AB-88219)"
            className="w-full text-xs font-mono rounded-xl border border-slate-300 pl-9 pr-3 py-3 focus:ring-2 focus:ring-nac-primary focus:outline-none uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary text-xs px-6 py-3 flex items-center justify-center gap-2 font-bold disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memeriksa...</span>
            </>
          ) : (
            <span>Verifikasi Sekarang</span>
          )}
        </button>
      </form>

      {/* Result Card */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Memeriksa pangkalan data pendaftaran sertifikat...
        </div>
      ) : result?.isValid ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-block mb-1">
                SERTIFIKAT SAH & RESMI TERVERIFIKASI
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Pangkalan Data NAC Tax Center
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[11px] block">Nomor Seri Registrasi</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {result.certificate.certificate_id}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[11px] block">Nama Pemilik Sertifikat</span>
              <span className="font-bold text-nac-navy text-sm">
                {result.certificate.recipient_name}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1 sm:col-span-2">
              <span className="text-slate-400 text-[11px] block">Program Pelatihan Diselesaikan</span>
              <span className="font-bold text-slate-800 text-sm">
                {result.certificate.course_title}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[11px] block">Tanggal Penerbitan</span>
              <span className="font-semibold text-slate-800">
                {result.certificate.issue_date}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 text-[11px] block">Hasil Yudisium</span>
              <span className="font-bold text-emerald-700">
                {result.certificate.grade}
              </span>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            Diterbitkan oleh NAC Tax Center Indonesia • BKP Reg: SI-8821/BKP-C/2021
          </div>
        </div>
      ) : (
        <div className="bg-rose-50 rounded-2xl border border-rose-200 p-8 text-center space-y-3">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="font-bold text-rose-900 text-base">Sertifikat Tidak Ditemukan</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            {result?.message || 'Nomor seri sertifikat tidak terdaftar di sistem NAC Tax Center.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificateVerifyPage;
