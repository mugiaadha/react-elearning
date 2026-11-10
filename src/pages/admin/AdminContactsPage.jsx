import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import { useToast } from '../../context/ToastContext';
import {
  Inbox,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  Trash2,
  Search,
  ExternalLink,
  RefreshCw,
  Filter,
} from 'lucide-react';

export const AdminContactsPage = () => {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(ENDPOINTS.ADMIN_CONTACTS, {
        params: {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          q: searchQuery || undefined,
        },
      });
      setInquiries(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch contact inquiries', err);
      showToast('Gagal memuat kotak masuk konsultasi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiClient.patch(ENDPOINTS.ADMIN_CONTACT_STATUS(id), { status: newStatus });
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus, replied_at: newStatus === 'REPLIED' ? 'Baru saja' : item.replied_at } : item
        )
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Status pesan berhasil diubah ke: ${newStatus}`, 'success');
    } catch (err) {
      showToast('Gagal mengubah status pesan', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pesan konsultasi ini dari arsip kotak masuk?')) return;
    try {
      await apiClient.delete(ENDPOINTS.ADMIN_CONTACT_DELETE(id));
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      showToast('Pesan konsultasi berhasil dihapus', 'success');
    } catch (err) {
      showToast('Gagal menghapus pesan konsultasi', 'error');
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.contact?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-amber-400" />
            Kotak Masuk Konsultasi & Pertanyaan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Arsip pertanyaan publik dari Halaman Kontak dan Formulir Diskusi Artikel Blog NAC.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, nomor WA, email, atau isi pesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="UNREAD">Belum Ditindaklanjuti (UNREAD)</option>
            <option value="REPLIED">Sudah Dihubungi (REPLIED)</option>
            <option value="ARCHIVED">Diarsipkan (ARCHIVED)</option>
          </select>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">Memuat daftar konsultasi...</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
              Tidak ada pesan konsultasi yang cocok.
            </div>
          ) : (
            filteredInquiries.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedInquiry(item)}
                className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-2 ${
                  selectedInquiry?.id === item.id
                    ? 'bg-slate-800/90 border-amber-500/80 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{item.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'REPLIED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'ARCHIVED'
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{item.contact}</span>
                </div>
                <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">{item.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span className="capitalize">Sumber: {item.source}</span>
                  <span>{item.created_at}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inquiry Detail View */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedInquiry.name}</h2>
                  <div className="flex items-center gap-3 text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" /> {selectedInquiry.contact}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Waktu: {selectedInquiry.created_at}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedInquiry.status !== 'REPLIED' ? (
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'REPLIED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Tandai Dibalas
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(selectedInquiry.id, 'UNREAD')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium flex items-center gap-1.5 transition"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Set Belum Dibalas
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedInquiry.id)}
                    className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-800/40 transition"
                    title="Hapus pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Isi Pertanyaan / Permintaan Konsultasi:
                </span>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Quick Action to WhatsApp / Mailto */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/${selectedInquiry.contact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 inline-flex items-center gap-2 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Hubungi via WhatsApp
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`mailto:${selectedInquiry.contact}?subject=Tanggapan%20Konsultasi%20Pajak%20NAC%20Tax%20Center`}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 inline-flex items-center gap-2 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Kirim Email Balasan
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center p-8 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-center text-xs space-y-2">
              <Inbox className="w-8 h-8 text-slate-600" />
              <p>Pilih salah satu pesan pada daftar di sebelah kiri untuk melihat rincian isi konsultasi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContactsPage;

