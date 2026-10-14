import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Mail,
  Lock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Trash2,
  Copy,
  Sparkles,
  Loader2,
  Send,
  X,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import { useToast } from '../../context/ToastContext';

export const AdminTeachersPage = () => {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Konsultan Pajak & Instruktur Brevet',
    password: '',
    sendEmail: true,
  });

  // Success Credential Modal
  const [createdTeacherData, setCreatedTeacherData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generate random password helper
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `NacTeach#${rand}`;
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(ENDPOINTS.ADMIN_TEACHERS);
      setTeachers(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data pengajar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: 'Konsultan Pajak Senior • Spesialis Brevet Terpadu',
      password: generateRandomPassword(),
      sendEmail: true,
    });
    setCreateModalOpen(true);
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Nama dan Email pengajar wajib diisi.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      showToast('Mendaftarkan akun instruktur & menjadwalkan email via SMTP...', 'loading', 3000);

      const res = await apiClient.post(ENDPOINTS.ADMIN_TEACHERS, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        password: formData.password,
      });

      showToast(res.message || 'Akun pengajar berhasil dibuat!', 'success', 3500);
      setCreateModalOpen(false);
      setCreatedTeacherData(res.data);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal membuat akun pengajar.', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCredentials = async (teacher) => {
    if (!confirm(`Kirim ulang email kredensial kata sandi baru untuk ${teacher.name}?`)) return;

    try {
      showToast(`Mengirim ulang kredensial ke ${teacher.email} via SMTP...`, 'loading', 2500);
      const res = await apiClient.post(ENDPOINTS.ADMIN_TEACHER_RESEND_INVITE(teacher.id));
      showToast(`Kredensial baru berhasil dikirim ke ${teacher.email}!`, 'success', 4000);
      setCreatedTeacherData({
        name: teacher.name,
        email: teacher.email,
        plain_password: res.data?.new_password,
        specialization: teacher.specialization,
      });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal mengirim ulang kredensial.', 'error', 4000);
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!confirm(`Hapus akun pengajar ${teacher.name} (${teacher.email}) dari sistem?`)) return;

    try {
      showToast(`Menghapus akun ${teacher.name}...`, 'loading', 2000);
      await apiClient.delete(ENDPOINTS.ADMIN_TEACHER_DELETE(teacher.id));
      showToast(`Akun pengajar ${teacher.name} berhasil dihapus.`, 'success', 3000);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal menghapus akun pengajar.', 'error', 3000);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdTeacherData) return;
    const text = `Akun Instruktur NAC Tax Center:\nNama: ${createdTeacherData.name}\nEmail / Username: ${createdTeacherData.email}\nKata Sandi: ${createdTeacherData.plain_password}\nLink Login: http://localhost:5173/login?email=${encodeURIComponent(createdTeacherData.email)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Kredensial berhasil disalin ke clipboard!', 'success', 2000);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.specialization?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-400" />
            Manajemen Pengajar & Instruktur Pajak BKP
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Sesuai kebijakan akademi, akun pengajar dibuat secara resmi oleh administrator. Kredensial login dikirim otomatis via SMTP ke email pengajar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-primary text-xs inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Akun Pengajar Baru</span>
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{teachers.length}</div>
            <div className="text-[11px] text-slate-400">Total Instruktur Terdaftar</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">SMTP Queue</div>
            <div className="text-[11px] text-slate-400">Email Undangan Kredensial</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">100% Aktif</div>
            <div className="text-[11px] text-slate-400">Hak Akses Portal Guru</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau bidang keahlian..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition"
            />
          </div>

          <button
            onClick={fetchTeachers}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-teal-400 mx-auto" />
            <p className="text-xs">Memuat daftar pengajar...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-xs">Tidak ada data pengajar yang sesuai pencarian.</p>
            <button
              onClick={handleOpenCreateModal}
              className="text-xs text-teal-400 hover:underline font-bold"
            >
              + Buat Akun Pengajar Baru Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Nama & Gelar Instruktur</th>
                  <th className="py-3 px-4">Username / Email</th>
                  <th className="py-3 px-4">Spesialisasi Perpajakan</th>
                  <th className="py-3 px-4">No. WhatsApp</th>
                  <th className="py-3 px-4">Tanggal Dibuat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-sky-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-inner">
                          {t.name ? t.name.charAt(0) : 'T'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{t.name}</div>
                          <div className="text-[10px] text-teal-400 font-mono flex items-center gap-1">
                            <span>ID: {t.string_id || `tch-${t.id}`}</span>
                            {t.invited_by_admin && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                Diundang Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        {t.specialization}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {t.phone || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {t.created_at}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleResendCredentials(t)}
                        title="Kirim Ulang Kredensial via SMTP"
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-teal-400 hover:text-white hover:bg-teal-700/40 transition inline-flex items-center gap-1 text-[11px]"
                      >
                        <Send className="w-3 h-3" />
                        <span className="hidden sm:inline">Kirim Kredensial</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeacher(t)}
                        title="Hapus Akun Pengajar"
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-rose-400 hover:text-white hover:bg-rose-700/40 transition inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create & Invite Teacher */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-inner shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Buat Akun Pengajar Baru</h3>
                <p className="text-xs text-slate-400">
                  Kredensial login acak akan dibuatkan dan otomatis dikirimkan ke email guru.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Lengkap & Gelar Instruktur <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dra. Sri Wahyuni, Ak., M.Ak., BKP"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Alamat Email (Username Login) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sri.wahyuni@nactaxcenter.id"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-teal-500 transition font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">No. WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+62 812-xxxx-xxxx"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Spesialisasi / Gelar</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Konsultan Pajak BKP"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    Kata Sandi Acak (Generated Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: generateRandomPassword() })}
                    className="text-[11px] text-teal-400 hover:underline inline-flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Acak Ulang</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    value={formData.password}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-amber-400 font-mono font-bold text-xs focus:outline-none select-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pengajar dapat langsung menggunakan kata sandi ini untuk login dan dapat mengubahnya kapan saja di profil mereka.
                </p>
              </div>

              <div className="p-3 bg-teal-950/40 border border-teal-800/60 rounded-xl flex items-center gap-2 text-teal-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Email resmi berisi tautan login & kata sandi akan otomatis dikirimkan via antrean SMTP.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-teal-900/40 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Akun & Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Buat Akun & Kirim Undangan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Created Teacher Credentials Summary */}
      {createdTeacherData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreatedTeacherData(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-teal-400" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Akun Pengajar Berhasil Dibuat!</h3>
              <p className="text-xs text-slate-400">
                Email undangan kredensial telah dijadwalkan ke <span className="text-teal-300 font-bold">{createdTeacherData.email}</span>.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Nama Pengajar:</span>
                <span className="font-bold text-white">{createdTeacherData.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Username / Email:</span>
                <span className="font-mono font-bold text-teal-300">{createdTeacherData.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Kata Sandi Acak:</span>
                <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {createdTeacherData.plain_password}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full py-2.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-md transition text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kredensial Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Kredensial untuk WhatsApp / Catatan</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCreatedTeacherData(null)}
                className="w-full py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition text-xs"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachersPage;
