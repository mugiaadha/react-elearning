import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import blogService from '../../services/blogService';
import { useToast } from '../../context/ToastContext';
import {
  Newspaper,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  Upload,
  Image as ImageIcon,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'PPh 21 & Pemotongan',
  'Coretax DJP',
  'PPN & e-Faktur',
  'PPh Badan & Rekonsiliasi',
  'Pajak Internasional',
  'KUP & Sengketa Pajak',
  'Regulasi UU HPP',
];

const INITIAL_FORM = {
  title: '',
  category: 'Coretax DJP',
  excerpt: '',
  content: '',
  image_url: '',
  attachment_url: '',
  attachment_name: '',
  author_name: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
  author_role: 'Managing Partner & Konsultan Pajak BKP',
  read_time: '6 Menit Baca',
  tags: 'UU HPP, Coretax DJP, Regulasi Pajak',
  status: 'PUBLISHED',
  is_featured: false,
};

export const AdminBlogsPage = () => {
  const { showToast } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAdminBlogs();
      setBlogs(data || []);
    } catch (err) {
      console.error('Error loading admin blogs:', err);
      showToast('Gagal memuat daftar konten artikel.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingBlog(null);
    setForm(INITIAL_FORM);
    setCoverFile(null);
    setAttachmentFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || '',
      category: blog.category || 'Coretax DJP',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      image_url: blog.image_url || blog.image || '',
      attachment_url: blog.attachment_url || '',
      attachment_name: blog.attachment_name || '',
      author_name: blog.author_name || 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
      author_role: blog.author_role || 'Managing Partner & Konsultan Pajak BKP',
      read_time: blog.read_time || blog.readTime || '6 Menit Baca',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
      status: blog.status || 'PUBLISHED',
      is_featured: Boolean(blog.is_featured),
    });
    setCoverFile(null);
    setAttachmentFile(null);
    setIsModalOpen(true);
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('Judul artikel dan isi konten wajib diisi.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('category', form.category);
      formData.append('excerpt', form.excerpt.trim());
      formData.append('content', form.content);
      formData.append('image_url', form.image_url.trim());
      formData.append('attachment_url', form.attachment_url.trim());
      formData.append('attachment_name', form.attachment_name.trim());
      formData.append('author_name', form.author_name.trim());
      formData.append('author_role', form.author_role.trim());
      formData.append('read_time', form.read_time.trim());
      formData.append('tags', form.tags);
      formData.append('status', form.status);
      formData.append('is_featured', form.is_featured ? '1' : '0');

      if (coverFile) {
        formData.append('image_file', coverFile);
      }
      if (attachmentFile) {
        formData.append('attachment_file', attachmentFile);
      }

      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, formData);
        showToast(`Konten "${form.title}" berhasil diperbarui!`, 'success');
      } else {
        await blogService.createBlog(formData);
        showToast(`Artikel baru "${form.title}" berhasil diunggah & diterbitkan!`, 'success');
      }

      setIsModalOpen(false);
      await fetchBlogs();
    } catch (err) {
      console.error('Save blog error:', err);
      showToast(err.message || 'Gagal menyimpan konten artikel.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (blog) => {
    const nextStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await blogService.updateBlog(blog.id, { status: nextStatus });
      showToast(
        `Status artikel diubah menjadi ${nextStatus === 'PUBLISHED' ? 'Diterbitkan' : 'Draft'}.`,
        'info'
      );
      fetchBlogs();
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status artikel.', 'error');
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Hapus artikel "${blog.title}" secara permanen?`)) return;
    try {
      await blogService.deleteBlog(blog.id);
      showToast(`Artikel "${blog.title}" berhasil dihapus.`, 'info');
      setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
    } catch (err) {
      showToast(err.message || 'Gagal menghapus artikel.', 'error');
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.author_name?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const publishedCount = blogs.filter((b) => b.status === 'PUBLISHED').length;
  const draftCount = blogs.filter((b) => b.status === 'DRAFT').length;
  const totalViews = blogs.reduce((acc, b) => acc + (Number(b.views_count) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-400" />
            Manajemen Konten Blog & Wawasan Pajak
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unggah artikel regulasi pajak, kajian UU HPP & Coretax, gambar sampul, serta lampiran kertas kerja untuk halaman publik.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Konten Artikel Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Artikel Diterbitkan
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {publishedCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Draf tersimpan
            </div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {draftCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Pembaca Publik
            </div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">
              {totalViews.toLocaleString('id-ID')}x
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'ALL', label: `Semua (${blogs.length})` },
            { key: 'PUBLISHED', label: `Published (${publishedCount})` },
            { key: 'DRAFT', label: `Draft (${draftCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === tab.key
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, kategori, penulis..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Blog List (Mobile Cards + Desktop Table) */}
      {loading ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <p className="text-xs">Memuat daftar artikel blog dari database...</p>
        </div>
      ) : (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-800/70">
            {filteredBlogs.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">
                Belum ada artikel yang sesuai filter.
              </div>
            ) : (
              filteredBlogs.map((blog) => (
                <div key={blog.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={blog.image || blog.image_url}
                      alt={blog.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400">
                          {blog.category}
                        </span>
                        {blog.is_featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                            ★ Utama
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            blog.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {blog.status}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white mt-1 line-clamp-2">
                        {blog.title}
                      </h3>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {blog.date} • {blog.views_count || 0}x dibaca
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <Link
                      to={`/blog/${blog.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:underline"
                    >
                      <span>Lihat Publik</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-amber-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(blog)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Artikel & Kategori</th>
                  <th className="py-3.5 px-4">Penulis</th>
                  <th className="py-3.5 px-4">Lampiran</th>
                  <th className="py-3.5 px-4">Statistik</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-500">
                      Tidak ditemukan konten artikel.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <img
                            src={blog.image || blog.image_url}
                            alt={blog.title}
                            className="w-14 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400">
                                {blog.category}
                              </span>
                              {blog.is_featured && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ★ Sorotan Utama
                                </span>
                              )}
                            </div>
                            <div className="font-bold text-white line-clamp-1">
                              {blog.title}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {blog.excerpt}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{blog.author_name}</div>
                        <div className="text-[11px] text-slate-500">{blog.date}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {blog.attachment_url ? (
                          <a
                            href={blog.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-900/60"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[140px]">
                              {blog.attachment_name || 'Dokumen Lampiran'}
                            </span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 text-slate-300 font-semibold">
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>{blog.views_count || 0}x</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{blog.readTime}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          title="Klik untuk ubah status publikasi"
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition ${
                            blog.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                          }`}
                        >
                          {blog.status === 'PUBLISHED' ? '● Diterbitkan' : '○ Draft'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            to={`/blog/${blog.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 transition"
                            title="Lihat di halaman publik"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(blog)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition"
                            title="Edit Konten"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog)}
                            className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 transition"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* Upload / Edit Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92dvh] overflow-y-auto shadow-2xl p-5 sm:p-7 space-y-5 text-slate-100">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>
                    {editingBlog ? 'Perbarui Konten Artikel Pajak' : 'Upload & Terbitkan Artikel Pajak Baru'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mendukung penulisan format paragraf/heading (`##` / `###`), gambar sampul (upload file atau URL), dan lampiran dokumen.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Judul Artikel / Kajian Pajak *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Contoh: Panduan Rekonsiliasi Fiskal PPh Badan & Coretax 2026"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Kategori Topik *
                  </label>
                  <input
                    type="text"
                    list="blog-category-options"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Pilih atau ketik kategori..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                  <datalist id="blog-category-options">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Ringkasan Singkat (Excerpt)
                </label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat yang tampil pada kartu katalog artikel..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Main Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-300">
                    Isi Konten Artikel Lengkap *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Tips: Gunakan <code className="text-amber-400">### Subjudul</code>, <code className="text-amber-400">**tebal**</code>, dan <code className="text-amber-400">- poin list</code>
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tulis pembahasan lengkap regulasi, dasar hukum, contoh kasus perhitungan, dan kesimpulan..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-3 text-white font-sans leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Cover Image Upload or URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Upload Gambar Sampul (JPG/PNG/WebP)</span>
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30"
                  />
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">
                      Atau tempel URL Gambar Sampul:
                    </span>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Attachment Upload or URL */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Lampiran Kertas Kerja / PDF Regulasi (Opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAttachmentFile(file);
                      if (file && !form.attachment_name) {
                        setForm((prev) => ({ ...prev, attachment_name: file.name }));
                      }
                    }}
                    className="w-full text-[11px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30"
                  />
                  <input
                    type="text"
                    value={form.attachment_name}
                    onChange={(e) => setForm({ ...form, attachment_name: e.target.value })}
                    placeholder="Judul lampiran (misal: Simulator Excel PPh 21.xlsx)"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={form.attachment_url}
                    onChange={(e) => setForm({ ...form, attachment_url: e.target.value })}
                    placeholder="Atau tautan Google Drive / Docs..."
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Author, Read time, Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Nama Penulis / Pakar
                  </label>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Jabatan / Kredensial Penulis
                  </label>
                  <input
                    type="text"
                    value={form.author_role}
                    onChange={(e) => setForm({ ...form, author_role: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Estimasi Waktu Baca & Tag
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="PPh 21, Coretax, UU HPP"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Publication Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-amber-300">
                      Jadikan Sorotan Utama (Featured Banner)
                    </span>
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PUBLISHED">Langsung Terbitkan (PUBLISHED)</option>
                    <option value="DRAFT">Simpan sebagai Draft (DRAFT)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-lg transition disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Konten...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{editingBlog ? 'Simpan Perubahan' : 'Upload & Terbitkan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogsPage;

