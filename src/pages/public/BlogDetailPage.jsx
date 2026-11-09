import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import blogService from '../../services/blogService';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Download,
  FileText,
  Tag,
  ArrowRight,
  BookOpen,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const { showToast } = useToast();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await blogService.getBlogDetail(slug);
        setArticle(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error('Failed to fetch blog detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Tautan artikel berhasil disalin ke clipboard!', 'success');
    }
  };

  const renderFormattedContent = (rawContent) => {
    if (!rawContent) return null;

    // If content contains HTML tags, render safely
    if (/<(p|h1|h2|h3|h4|ul|ol|li|strong|br|div)\b/i.test(rawContent)) {
      return (
        <div
          className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: rawContent }}
        />
      );
    }

    // Otherwise render Markdown-style paragraphs, headings, and lists cleanly
    const blocks = rawContent.split(/\n\n+/);
    return (
      <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="text-lg sm:text-xl font-extrabold text-slate-900 pt-3"
              >
                {trimmed.replace(/^###\s+/, '')}
              </h3>
            );
          }

          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-xl sm:text-2xl font-extrabold text-slate-900 pt-4"
              >
                {trimmed.replace(/^##\s+/, '')}
              </h2>
            );
          }

          // Bullet or numbered lists
          const lines = trimmed.split('\n');
          if (lines.every((l) => /^(-|\*|\d+\.)\s+/.test(l.trim()))) {
            return (
              <ul
                key={idx}
                className="list-disc pl-5 space-y-2 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80"
              >
                {lines.map((line, lIdx) => {
                  const cleanLine = line.trim().replace(/^(-|\*|\d+\.)\s+/, '');
                  const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                  return (
                    <li key={lIdx} className="text-xs sm:text-sm text-slate-700">
                      {parts.map((part, pIdx) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={pIdx} className="font-bold text-slate-900">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Standard paragraph with bold support (**text**)
          const parts = trimmed.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="leading-relaxed text-slate-700">
              {parts.map((part, pIdx) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-nac-primary mx-auto" />
        <p className="text-xs text-slate-500">Memuat artikel lengkap...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Artikel Tidak Ditemukan</h2>
        <Link to="/blog" className="btn-primary text-xs inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Artikel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-nac-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Wawasan Pajak & UU HPP</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <Share2 className="w-3.5 h-3.5 text-nac-primary" />
          <span>Bagikan Artikel</span>
        </button>
      </div>

      {/* Article Main Card */}
      <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover Image */}
        <div className="h-56 sm:h-80 md:h-96 w-full overflow-hidden relative bg-slate-900">
          <img
            src={
              article.image ||
              article.image_url ||
              'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80'
            }
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950">
              {article.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {article.date}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {article.readTime || article.read_time}
            </span>
            {article.views_count > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 text-white backdrop-blur-sm inline-flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                {article.views_count}x dibaca
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 md:p-12 space-y-8">
          {/* Title & Author Strip */}
          <div className="space-y-5 border-b border-slate-100 pb-6">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border-l-4 border-nac-primary">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <img
                  src={
                    article.author_avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      article.author_name || 'Pakar NAC'
                    )}&background=0284c7&color=fff`
                  }
                  alt={article.author_name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{article.author_name || 'Tim Pakar NAC Tax Center'}</span>
                    <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500">
                    {article.author_role || 'Konsultan Pajak Terdaftar (BKP)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Article Body */}
          {renderFormattedContent(article.content)}

          {/* Optional Attachment / Companion Document Card */}
          {article.attachment_url && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    Lampiran Dokumen & Kertas Kerja Praktis
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {article.attachment_name || 'Unduh Dokumen Pendamping Regulasi / Kertas Kerja'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Dokumen pendukung resmi yang disiapkan oleh tim instruktur NAC Tax Center.
                  </p>
                </div>
              </div>

              <a
                href={article.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Buka / Unduh Lampiran</span>
              </a>
            </div>
          )}

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 inline-flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5 text-nac-primary" />
                Topik Terkait:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA Banner to Brevet Catalog */}
          <div className="p-6 sm:p-8 rounded-3xl bg-nac-navy text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Tingkatkan Kompetensi Praktis Anda
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold">
                Ingin Mempelajari Studi Kasus Ini Secara Mendalam?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ikuti kelas intensif Brevet Pajak A & B Terpadu, Brevet C Eksekutif, atau Simulasi Coretax DJP bersama praktisi BKP berpengalaman.
              </p>
            </div>
            <Link
              to="/brevet"
              className="btn-primary bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shrink-0 w-full md:w-auto justify-center"
            >
              <span>Lihat Program Brevet</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {Array.isArray(article.related_posts) && article.related_posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            Artikel & Kajian Pajak Lainnya
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {article.related_posts.map((rel) => (
              <Link
                key={rel.id}
                to={`/blog/${rel.slug || rel.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="h-36 overflow-hidden bg-slate-900 relative">
                  <img
                    src={rel.image || rel.image_url}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                    {rel.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-nac-primary transition line-clamp-2">
                    {rel.title}
                  </h4>
                  <span className="text-[11px] font-bold text-nac-primary inline-flex items-center gap-1">
                    Baca Artikel <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;

