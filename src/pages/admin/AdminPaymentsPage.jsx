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
  Loader2,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  QrCode
} from 'lucide-react';

export const AdminPaymentsPage = () => {
  const { refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const loadPayments = async (isManual = false) => {
    try {
      setLoading(true);
      const data = await paymentService.getPendingPayments();
      setPayments(data || []);
      if (isManual) {
        showToast('Data transaksi Midtrans berhasil diperbarui.', 'info', 2500);
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

  const handleSyncStatus = async (payment) => {
    const orderId = payment.invoice_number || payment.id;
    try {
      setSyncingId(orderId);
      showToast(`Menyinkronkan status order ${orderId} ke Midtrans...`, 'loading', 2000);
      const res = await paymentService.checkPaymentStatus(orderId);
      showToast('Status berhasil disinkronkan dengan gateway Midtrans.', 'success', 3000);
      if (selectedPayment && (selectedPayment.invoice_number === orderId || selectedPayment.id === orderId)) {
        setSelectedPayment(res.data);
      }
      await loadPayments();
      await refreshProfile();
    } catch (err) {
      console.error(err);
      showToast('Gagal menyinkronkan status dengan Midtrans API.', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      setProcessingAction('approving');
      showToast('Sedang memverifikasi persetujuan transaksi...', 'loading', 2000);
      await paymentService.approvePayment(paymentId);
      showToast(`Pembayaran #${paymentId} berhasil diverifikasi & disetujui secara manual!`, 'success', 4000);
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
    const reason = prompt('Masukkan alasan pembatalan pembayaran:', 'Dibatalkan oleh administrator.');
    if (reason) {
      try {
        setProcessingAction('rejecting');
        showToast('Memproses pembatalan transaksi...', 'loading', 2000);
        await paymentService.rejectPayment(paymentId, reason);
        showToast(`Pembayaran #${paymentId} telah dibatalkan.`, 'warning', 4000);
        setSelectedPayment(null);
        await loadPayments();
        await refreshProfile();
      } catch (err) {
        console.error(err);
        showToast('Gagal membatalkan pembayaran.', 'error');
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
      p.student_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brevet_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalTransactions = payments.length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING_APPROVAL').length;
  const approvedCount = payments.filter((p) => p.status === 'APPROVED').length;
  const totalRevenue = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-sky-400" />
            Manajemen & Audit Pembayaran Midtrans
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau transaksi masuk, sinkronisasi gateway Midtrans real-time, dan status aktivasi kelas siswa.
          </p>
        </div>

        <button
          onClick={() => loadPayments(true)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Muat Ulang Transaksi</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Transaksi</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalTransactions}</div>
          <p className="text-[11px] text-slate-500 mt-1">Keseluruhan order tagihan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Menunggu Bayar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Status pending Midtrans</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lunas / Settlement</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{approvedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Akses kelas aktif otomatis</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Pendapatan Terverifikasi</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dana bruto terkonfirmasi</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari invoice, nama, atau brevet..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === st
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st === 'ALL'
                ? 'Semua'
                : st === 'PENDING'
                ? 'Menunggu'
                : st === 'APPROVED'
                ? 'Lunas'
                : 'Dibatalkan'}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">No. Invoice & Waktu</th>
                <th className="py-3.5 px-4">Mahasiswa</th>
                <th className="py-3.5 px-4">Program Brevet</th>
                <th className="py-3.5 px-4">Nominal (IDR)</th>
                <th className="py-3.5 px-4">Saluran Bayar Midtrans</th>
                <th className="py-3.5 px-4">Status Transaksi</th>
                <th className="py-3.5 px-4 text-center">Aksi & Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400 mb-2" />
                    Memuat data transaksi dari sistem...
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
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white">{item.invoice_number}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(item.transaction_time || item.created_at || Date.now()).toLocaleDateString('id-ID', {
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
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-medium text-white">{item.payment_method || 'Midtrans Gateway'}</div>
                      {item.payment_type && (
                        <div className="text-[10px] text-slate-500 font-mono uppercase">
                          Type: {item.payment_type}
                        </div>
                      )}
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
                        {item.status === 'APPROVED' ? 'LUNAS (SETTLEMENT)' : item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedPayment(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold bg-slate-800 text-sky-400 hover:bg-sky-600 hover:text-white transition shadow-sm text-xs"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => handleSyncStatus(item)}
                          disabled={syncingId === (item.invoice_number || item.id)}
                          className="p-1.5 rounded-xl font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition shadow-sm disabled:opacity-50"
                          title="Sinkronkan status dengan Midtrans API"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              syncingId === (item.invoice_number || item.id) ? 'animate-spin text-sky-400' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl text-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  Detail Transaksi Midtrans
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedPayment.invoice_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Status Header Pill */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Status Verifikasi Sistem:</span>
                  <span className="font-bold text-sm text-white">{selectedPayment.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Midtrans Status:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {selectedPayment.transaction_status || 'Belum Diproses Siswa'}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Mahasiswa</span>
                  <span className="font-bold text-white text-sm">{selectedPayment.student_name}</span>
                  <span className="text-slate-400 block text-[11px]">{selectedPayment.student_email}</span>
                </div>

                <div>
                  <span className="text-slate-500 block">Total Tagihan</span>
                  <span className="font-bold text-amber-400 text-sm font-mono">
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

                {selectedPayment.transaction_id && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Midtrans Transaction ID</span>
                    <span className="font-mono text-slate-300 text-[11px]">{selectedPayment.transaction_id}</span>
                  </div>
                )}

                {selectedPayment.settlement_time && (
                  <div>
                    <span className="text-slate-500 block">Waktu Settlement</span>
                    <span className="font-semibold text-emerald-400">
                      {new Date(selectedPayment.settlement_time).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Catatan</span>
                    <span className="text-slate-300 italic">{selectedPayment.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSyncStatus(selectedPayment)}
                  disabled={syncingId === (selectedPayment.invoice_number || selectedPayment.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold border border-slate-700 transition"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      syncingId === (selectedPayment.invoice_number || selectedPayment.id) ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Sinkronkan Status Gateway</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedPayment.status !== 'APPROVED' && (
                    <button
                      type="button"
                      disabled={processingAction === 'approving'}
                      onClick={() => handleApprove(selectedPayment.id || selectedPayment.invoice_number)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui Manual</span>
                    </button>
                  )}

                  {selectedPayment.status !== 'REJECTED' && (
                    <button
                      type="button"
                      disabled={processingAction === 'rejecting'}
                      onClick={() => handleReject(selectedPayment.id || selectedPayment.invoice_number)}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Batalkan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsPage;
