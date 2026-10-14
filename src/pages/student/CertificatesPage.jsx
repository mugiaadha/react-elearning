import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import certificateService from '../../services/certificateService';
import CertificateModal from '../../components/common/CertificateModal';
import { Award, Eye, ShieldCheck, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CertificatesPage = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const allCerts = await certificateService.getAllCertificates();
      // Match current student certs or all for demo
      const userCerts = allCerts.filter(
        (c) =>
          !user ||
          c.recipient_name?.toLowerCase().includes(user.name?.toLowerCase()) ||
          allCerts.length <= 2
      );
      setCertificates(userCerts.length > 0 ? userCerts : allCerts);
    } catch (err) {
      console.error('Failed to load certificates', err);
      setError(err.message || 'Gagal memuat sertifikat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Sertifikat Kelulusan Digital Saya
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sertifikat resmi terakreditasi dengan QR code verifikasi online dan nomor registrasi unik.
          </p>
        </div>

        <button
          onClick={fetchCertificates}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Memeriksa pangkalan data sertifikat digital...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Sertifikat Kelulusan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Selesaikan seluruh modul perkuliahan Brevet Pajak dan ujian akhir hingga progres 100% untuk memperoleh sertifikat kelulusan terakreditasi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.certificate_id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> RESMI & VALID
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-0.5">
                  NO. REG: {cert.certificate_id}
                </span>
                <h3 className="font-bold text-slate-900 text-base">{cert.course_title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Yudisium: <span className="font-semibold text-emerald-700">{cert.grade}</span> ({cert.score}/100)
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Terbit: {cert.issue_date}</span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/verify-certificate/${cert.certificate_id}`}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    title="Cek URL Verifikasi Publik"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat / Cetak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CertificateModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default CertificatesPage;
