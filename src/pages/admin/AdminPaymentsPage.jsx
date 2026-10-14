import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  AlertCircle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';

export const AdminPaymentsPage = () => {
  const { setPaymentStatus, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [processingAction, setProcessingAction] = useState(null); // 'approving' | 'rejecting'

  const loadPayments = async (isManual = false) => {
    try {
      setLoading(true);
      const data = await paymentService.getPendingPayments();
      setPayments(data);
      if (isManual) {
        showToast('Data pembayaran berhasil diperbarui.', 'info', 2500);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data pembayaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleApprove = async (paymentId) => {
    try {
      setProcessingAction('approving');
      showToast('Sedang memverifikasi pembayaran...', 'loading', 2000);
      await paymentService.approvePayment(paymentId);
      showToast(`Pembayaran #${paymentId} berhasil diverifikasi & status diubah ke ACTIVE!`, 'success', 4000);
      setSelectedPayment(null);
      await loadPayments();
      await refreshProfile();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyetujui pembayaran.', 'error');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Masukkan alasan penolakan pembayaran:', 'Bukti transfer tidak jelas / nominal tidak sesuai.');
    if (reason) {
      try {
        setProcessingAction('rejecting');
        showToast('Memproses penolakan transaksi...', 'loading', 2000);
        await paymentService.rejectPayment(paymentId, reason);
        showToast(`Pembayaran #${paymentId} telah ditolak.`, 'warning', 4000);
        setSelectedPayment(null);
        await loadPayments();
        await refreshProfile();
      } catch (err) {
        showToast('Gagal menolak pembayaran.', 'error');
      } finally {
        setProcessingAction(null);
      }
    }
  };

  const filtered = payments.filter((p) => {
    const matchesFilter =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && p.status === 'PENDING_APPROVAL') ||
      (filterStatus === 'APPROVED' && p.status === 'APPROVED') ||
      (filterStatus === 'REJECTED' && p.status === 'REJECTED');

    const matchesSearch =
      p.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brevet_title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const pendingCount = payments.filter((p) => p.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Verifikasi & Validasi Pembayaran Mahasiswa
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola bukti transfer, approval pendaftaran Brevet, dan pembukaan akses LMS.
          </p>
        </div>

        <button
          onClick={loadPayments}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'ALL'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({payments.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              filterStatus === 'PENDING'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-amber-400 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Menunggu Approval ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Disetujui
          </button>
          <button
            onClick={() => setFilterStatus('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterStatus === 'REJECTED'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ditolak
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mahasiswa, invoice..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Invoice & Waktu</th>
                <th className="py-3.5 px-4">Mahasiswa</th>
                <th className="py-3.5 px-4">Program Brevet</th>
                <th className="py-3.5 px-4">Nominal (IDR)</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    Memuat data transaksi dari static mock REST API...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white">{item.invoice_number}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(item.transaction_time || Date.now()).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{item.student_name}</div>
                      <div className="text-[11px] text-slate-400">{item.student_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {item.brevet_title}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      Rp {Number(item.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {item.payment_method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedPayment(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-sky-400 hover:bg-sky-600 hover:text-white transition shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Periksa Bukti
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl text-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  Audit Bukti Pembayaran: {selectedPayment.invoice_number}
                </h3>
                <p className="text-xs text-slate-400">
                  Verifikasi kecocokan nominal rekening sebelum menyetujui akses LMS.
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Image Preview */}
              <div>
                <span className="block font-semibold text-slate-300 mb-2">
                  Tangkapan Layar Bukti Transfer:
                </span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  {selectedPayment.proof_image_url && selectedPayment.proof_image_url.toLowerCase().endsWith('.pdf') ? (
                    <div className="p-8 flex flex-col items-center justify-center gap-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                        <FileText className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-sm">Dokumen Bukti Transfer (PDF)</p>
                        <p className="text-slate-400 text-xs mt-0.5">Berkas diunggah dalam format dokumen PDF.</p>
                      </div>
                      <a
                        href={selectedPayment.proof_image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-sky-950"
                      >
                        <ExternalLink className="w-4 h-4" /> Buka Dokumen PDF di Tab Baru
                      </a>
                    </div>
                  ) : (
                    <div className="relative group">
                      <img
                        src={selectedPayment.proof_image_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'}
                        alt="Bukti Transfer"
                        className="max-h-72 mx-auto rounded-lg object-contain border border-slate-800 shadow-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      {selectedPayment.proof_image_url && (
                        <div className="mt-2 flex justify-center">
                          <a
                            href={selectedPayment.proof_image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-sky-400 hover:text-sky-300 font-semibold hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Buka Gambar Ukuran Penuh
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Nama Mahasiswa</span>
                  <span className="font-bold text-white text-sm">{selectedPayment.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Nominal</span>
                  <span className="font-bold text-amber-400 text-sm">
                    Rp {Number(selectedPayment.amount).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Program Brevet</span>
                  <span className="font-semibold text-slate-300">{selectedPayment.brevet_title}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Metode Pembayaran</span>
                  <span className="font-semibold text-slate-300">{selectedPayment.payment_method}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Catatan Pengirim</span>
                  <span className="text-slate-300 italic">{selectedPayment.notes || 'Tidak ada catatan'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  disabled={!!processingAction}
                  onClick={() => handleReject(selectedPayment.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 transition disabled:opacity-50"
                >
                  {processingAction === 'rejecting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      <span>Menolak...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Tolak Pembayaran</span>
                    </>
                  )}
                </button>

                <button
                  disabled={!!processingAction}
                  onClick={() => handleApprove(selectedPayment.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 transition disabled:opacity-50"
                >
                  {processingAction === 'approving' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui & Aktifkan Mahasiswa (Approve)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
