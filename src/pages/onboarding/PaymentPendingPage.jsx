import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import paymentService from '../../services/paymentService';
import isDevMode from '../../config/devMode';
import Badge from '../../components/common/Badge';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  CreditCard,
  Copy,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  FileCheck
} from 'lucide-react';

export const PaymentPendingPage = () => {
  const { user, refreshProfile, switchRole, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.active_brevet?.payment_proof_url || null
  );
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // If already approved, automatically redirect to student dashboard
  useEffect(() => {
    if (user?.role === 'student' && user?.payment_status === 'APPROVED') {
      navigate('/dashboard/student');
    }
  }, [user, navigate]);

  // Sync previewUrl if user already has an uploaded payment proof in database
  useEffect(() => {
    if (user?.active_brevet?.payment_proof_url && !selectedFile) {
      setPreviewUrl(user.active_brevet.payment_proof_url);
      const isPdf = user.active_brevet.payment_proof_url.toLowerCase().endsWith('.pdf');
      setFileInfo({
        name: isPdf ? 'Dokumen_Bukti_Transfer.pdf' : 'Bukti_Transfer_Tersimpan.jpg',
        size: 'Tersimpan di server',
        isPdf,
      });
    }
  }, [user?.active_brevet?.payment_proof_url, selectedFile]);

  const invoice = user?.active_brevet || {
    id: 'brevet-ab',
    title: 'Brevet Pajak A & B Terpadu',
    invoice_id: 'INV-NAC-2026-0892',
    amount: 2750000,
    registered_date: '2026-10-12',
    payment_method: 'QRIS Dinamis',
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Nomor rekening / Virtual Account berhasil disalin!', 'info', 2500);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran file maksimal 10 MB. Silakan pilih file yang lebih kecil.', 'error', 4000);
      return;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: formattedSize,
      isPdf,
    });

    if (isPdf) {
      // PDF documents cannot be rendered in <img> tags; save object URL for opening
      setPreviewUrl(URL.createObjectURL(file));
      showToast(`Dokumen PDF "${file.name}" siap diunggah.`, 'info', 2500);
    } else {
      // For images, read as DataURL (base64) for immediate guaranteed local rendering
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
      };
      reader.readAsDataURL(file);
      showToast(`Gambar bukti "${file.name}" siap diunggah.`, 'info', 2500);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileInfo(null);
    setPreviewUrl(user?.active_brevet?.payment_proof_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Pilihan berkas bukti transfer dibatalkan.', 'info', 2000);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!previewUrl && !selectedFile) {
      showToast('Silakan pilih berkas bukti transfer terlebih dahulu.', 'warning');
      return;
    }
    setUploading(true);
    showToast('Sedang mengirim bukti transfer ke server...', 'loading', 2000);
    try {
      const response = await paymentService.submitPaymentProof({
        invoiceId: invoice.invoice_id || 'INV-NAC-2026-0892',
        proofImageUrl:
          typeof previewUrl === 'string' && previewUrl.startsWith('http')
            ? previewUrl
            : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        notes: notes || 'Bukti transfer diunggah oleh mahasiswa.',
        file: selectedFile,
      });

      setUploadSuccess(true);
      if (response?.data?.proof_image_url) {
        setPreviewUrl(response.data.proof_image_url);
      }
      setSelectedFile(null);
      showToast('Bukti transfer berhasil dikirim! Menunggu audit tim admin.', 'success', 4000);
      await refreshProfile();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal mengirim bukti pembayaran.', 'error', 4000);
    } finally {
      setUploading(false);
    }
  };

  const handleInstantApprovalSimulation = async () => {
    try {
      setSimulating(true);
      showToast('Menjalankan simulasi persetujuan instan...', 'loading', 1500);
      await paymentService.approvePayment(invoice.invoice_id || 'INV-NAC-2026-0892');
      await switchRole('student', 'APPROVED');
      showToast('Pembayaran berhasil disetujui! Membuka akses kelas...', 'success', 3000);
      navigate('/dashboard/student');
    } catch (err) {
      showToast('Gagal memproses simulasi approval.', 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* 3-Step Visual Progress Breadcrumb */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-xs font-semibold text-emerald-700">1. Pendaftaran</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-200 max-w-[60px]"></div>
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
              ✓
            </div>
            <span className="text-xs font-semibold text-emerald-700">2. Email Terverifikasi</span>
          </div>
          <div className="flex-1 h-0.5 bg-emerald-200 max-w-[60px]"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-nac-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
              3
            </div>
            <span className="text-xs font-bold text-slate-900">3. Pembayaran</span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs text-slate-500 shrink-0">
            <span>Akun: <strong>{user.email}</strong></span>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="text-slate-500 hover:text-rose-600 font-medium ml-2 transition"
            >
              (Ganti Akun)
            </button>
          </div>
        )}
      </div>

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-5 rounded-r-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <h2 className="text-base font-bold text-amber-900">
              Menunggu Verifikasi Pembayaran (Onboarding Gateway)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 mt-1">
            Akses ke <strong>Ruang Kelas & Modul Brevet</strong> akan otomatis terbuka setelah tim keuangan NAC memverifikasi bukti pembayaran Anda.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Badge status="PENDING_APPROVAL" size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Invoice & QRIS Payment Gateway */}
        <div className="lg:col-span-7 space-y-6">
          {/* Invoice Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-nac-primary flex items-center justify-center text-white">
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Rincian Tagihan Resmi</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {invoice.invoice_id || 'INV-NAC-2026-0892'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                BELUM DIVERIFIKASI
              </span>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Program Terpilih</span>
                <span className="font-bold text-slate-900">{invoice.title}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Metode Pembayaran</span>
                <span className="font-medium text-slate-800">QRIS Dinamis & Virtual Account</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Batas Waktu Pembayaran</span>
                <span className="font-medium text-rose-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 23 Jam 59 Menit
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 text-base">
                <span className="font-bold text-slate-800">Total Tagihan (Nett)</span>
                <span className="text-xl font-black text-nac-primary">
                  Rp {(invoice.amount || 2750000).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* QRIS & VA Payment Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-nac-primary" />
                  Pindai QRIS Standar Bank Indonesia
                </h4>
                <p className="text-xs text-slate-500">
                  Mendukung BCA, Mandiri, BNI, BRI, GoPay, OVO, ShopeePay, Dana
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Bebas Biaya Admin
              </span>
            </div>

            {/* QRIS Code Mockup */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-between shrink-0">
                <div className="w-full text-center border-b border-slate-100 pb-1">
                  <span className="font-black text-slate-900 tracking-wider text-xs">QRIS</span>
                  <span className="text-[9px] text-slate-400 block">NMID: ID1020268892100</span>
                </div>
                {/* SVG QR Pattern */}
                <div className="w-32 h-32 flex items-center justify-center bg-slate-900 p-2 rounded-lg text-white">
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v4h-2v-4zm6 4h2v2h-2v-2zm-2 2h2v2h-2v-2zm-4-2h2v2h-2v-2zm0-4h2v2h-2v-2zm4-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="text-[10px] font-semibold text-slate-600">NAC TAX CENTER INDONESIA</div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Atau Transfer Rekening Resmi Yayasan NAC:</span>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <span className="font-bold text-slate-900">BCA: 8820-9912-34</span>
                      <span className="text-[11px] text-slate-500 block">a.n. NAC Tax Center Indonesia</span>
                    </div>
                    <button
                      onClick={() => handleCopy('8820991234')}
                      className="inline-flex items-center gap-1 text-[11px] text-nac-primary font-semibold hover:underline"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                </div>

                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                  <li>Pastikan nominal transfer sesuai persis hingga digit terakhir.</li>
                  <li>Simpan tangkapan layar (screenshot) bukti transaksi yang berhasil.</li>
                  <li>Unggah bukti pada formulir di sebelah kanan untuk verifikasi.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Proof of Payment Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Unggah Bukti Pembayaran</h4>
                <p className="text-xs text-slate-500">Kirim struk / bukti transfer Anda</p>
              </div>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4 pt-4">
              {/* File upload zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  File Bukti Transfer (JPG, PNG, PDF)
                </label>

                {previewUrl ? (
                  <div className="relative border-2 border-emerald-500/40 bg-emerald-50/20 rounded-xl p-4 text-center">
                    {fileInfo?.isPdf || (typeof previewUrl === 'string' && previewUrl.toLowerCase().endsWith('.pdf')) ? (
                      <div className="py-3 flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-200">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 break-all">{fileInfo?.name || 'Dokumen Bukti Transfer (PDF)'}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{fileInfo?.size || 'Format Dokumen PDF'}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {typeof previewUrl === 'string' && (
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500" /> Lihat Dokumen
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
                          >
                            <X className="w-3 h-3" /> Hapus / Ganti
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative group max-w-xs mx-auto overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                          <img
                            src={previewUrl}
                            alt="Preview Bukti Transfer"
                            className="max-h-48 w-auto mx-auto object-contain rounded-lg transition group-hover:scale-105 duration-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs px-2 pt-1 border-t border-slate-200/60">
                          <div className="text-left overflow-hidden">
                            <p className="font-semibold text-slate-800 truncate text-[11px]">{fileInfo?.name || 'Bukti Transfer Terpilih'}</p>
                            <p className="text-[10px] text-slate-500">{fileInfo?.size || 'Siap diunggah'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            >
                              Ganti
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Hapus file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      onClick={(e) => { e.target.value = null; }}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-slate-300 hover:border-nac-primary rounded-xl p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-sky-50/50 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      onClick={(e) => { e.target.value = null; }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="py-2 space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center text-slate-500 group-hover:text-nac-primary transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">
                        Seret & lepas foto bukti transfer, atau <span className="text-nac-primary underline">klik untuk cari</span>
                      </p>
                      <p className="text-[11px] text-slate-400">Mendukung format JPG, PNG, PDF (Maks. 10 MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Transfer via BCA Mobile an Dimas Pratama jam 09:30"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                ></textarea>
              </div>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bukti berhasil dikirim! Menunggu verifikasi admin backend.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-primary text-xs py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg transition disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah Bukti Pembayaran...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Kirim Bukti Pembayaran</span>
                  </>
                )}
              </button>
            </form>

            {/* Interactive Testing Helper for Reviewer (Only visible when DEV_MODE=true) */}
            {isDevMode && (
              <div className="mt-6 pt-5 border-t border-slate-100 bg-amber-50/60 -mx-6 -mb-6 p-5 rounded-b-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Simulasi Evaluator / Admin Review
                </div>
                <p className="text-[11px] text-amber-800 mb-3">
                  Untuk menguji alur verifikasi admin tanpa menunggu:
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={simulating}
                    onClick={handleInstantApprovalSimulation}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-60"
                  >
                    {simulating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses Persetujuan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simulasikan Persetujuan Admin Seketika (Buka Dashboard)</span>
                      </>
                    )}
                  </button>
                  <Link
                    to="/admin/payments"
                    className="text-center text-[11px] text-slate-700 hover:text-slate-900 font-semibold underline"
                  >
                    Atau buka Panel Admin Backoffice (/admin/payments) &rarr;
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
