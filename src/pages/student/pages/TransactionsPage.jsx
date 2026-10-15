import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import userService from '../../../services/userService';
import {
  CreditCard,
  Download,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Printer,
  X,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const TransactionsPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
      setError(err.message || 'Gagal memuat riwayat transaksi dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const activeInvoice = user?.active_brevet || {
    invoice_id: 'INV-NAC-2026-0892',
    title: 'Brevet Pajak A & B Terpadu',
    amount: 2750000,
    registered_date: '2026-10-12',
    payment_method: 'QRIS Dinamis',
  };

  const isApproved = user?.payment_status === 'APPROVED';

  // Combine fetched enrollments or user active brevet
  const items = enrollments.length > 0 ? enrollments : [
    {
      invoice_id: activeInvoice.invoice_id || 'INV-NAC-2026-0892',
      title: activeInvoice.title || 'Brevet Pajak A & B Terpadu',
      amount: activeInvoice.amount || 2750000,
      payment_method: activeInvoice.payment_method || 'QRIS Dinamis',
      payment_status: user?.payment_status || 'PENDING_APPROVAL',
      is_active: isApproved,
      created_at: activeInvoice.registered_date || '2026-10-12',
    }
  ];

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Riwayat Transaksi & Pembayaran</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Status invoice pendaftaran brevet dan kuitansi pembayaran resmi Anda.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-nac-primary' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchTransactions} className="underline font-bold hover:text-amber-900">
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-nac-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Memuat riwayat transaksi dari backend...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Program Brevet</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Kuitansi Resmi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((inv, idx) => {
                const approved = inv.payment_status === 'APPROVED' || inv.is_active;
                return (
                  <tr key={inv.invoice_id || idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 font-mono font-bold text-slate-800">
                      {inv.invoice_id || `INV-NAC-2026-${String(idx + 1).padStart(4, '0')}`}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {inv.title || inv.brevet?.title || 'Brevet Pajak A & B Terpadu'}
                    </td>
                    <td className="py-4 px-4 font-bold text-nac-primary">
                      Rp {Number(inv.amount || 2750000).toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {inv.payment_method || 'QRIS Dinamis'}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          approved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {approved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {approved ? 'LUNAS (APPROVED)' : 'MENUNGGU VERIFIKASI'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {approved ? (
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-nac-primary border border-sky-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          Kuitansi Resmi
                        </button>
                      ) : (
                        <Link
                          to={`/onboarding/payment-pending?invoice_id=${inv.invoice_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Bayar Sekarang
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm tracking-wide">Kuitansi Pembayaran Elektronik Sah</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 space-y-5 text-slate-800 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="font-extrabold text-base text-slate-900">NAC TAX CENTER</div>
                  <div className="text-[11px] text-slate-500">Lembaga Pelatihan & Uji Kompetensi Brevet Pajak</div>
                  <div className="text-[10px] text-slate-400">Jakarta Pusat, DKI Jakarta • NPWP: 01.345.678.9-012.000</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">No. Kuitansi</div>
                  <div className="font-mono font-bold text-sm text-nac-primary">
                    {selectedReceipt.invoice_id || 'INV-NAC-2026-0892'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Tanggal: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diterima Dari:</div>
                <div className="font-bold text-sm text-slate-900">{user?.name || 'Mahasiswa Terdaftar'}</div>
                <div className="text-[11px] text-slate-600">{user?.email || 'email@peserta.id'} • Telp: {user?.phone || '0812-3456-7890'}</div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-2">Deskripsi Pelatihan</th>
                    <th className="py-2 text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5">
                      <div className="font-semibold text-slate-900">
                        {selectedReceipt.title || selectedReceipt.brevet?.title || 'Brevet Pajak A & B Terpadu'}
                      </div>
                      <div className="text-[10px] text-slate-500">Akses LMS Kelas Interaktif, Studi Kasus SPT & Sertifikasi Resmi</div>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      Rp {Number(selectedReceipt.amount || 2750000).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-500">Pajak Pendidikan (Bebas PPN)</td>
                    <td className="py-2 text-right text-slate-500">Rp 0</td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 font-bold text-slate-900">
                    <td className="py-3 text-sm">TOTAL PEMBAYARAN</td>
                    <td className="py-3 text-right text-sm text-nac-primary font-extrabold">
                      Rp {Number(selectedReceipt.amount || 2750000).toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Status Stamp */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-emerald-900 text-xs">STATUS: PEMBAYARAN LUNAS (TERVERIFIKASI)</div>
                    <div className="text-[10px] text-emerald-700">Metode: {selectedReceipt.payment_method || 'QRIS Dinamis'}</div>
                  </div>
                </div>
                <div className="text-[9px] font-mono text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-300">
                  VERIFIED BY NAC SYSTEM
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintReceipt}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-nac-primary hover:bg-sky-600 shadow-sm transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
