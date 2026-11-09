import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import blogService from '../../services/blogService';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Eye,
  FileText,
  UserCheck,
  Loader2,
} from 'lucide-react';

export const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await blogService.getBlogs();
        setArticles(data || []);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(['Semua']);
    articles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCategory =
        selectedCategory === 'Semua' || art.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        art.title?.toLowerCase().includes(q) ||
        art.excerpt?.toLowerCase().includes(q) ||
        art.category?.toLowerCase().includes(q) ||
        (Array.isArray(art.tags) &&
          art.tags.some((t) => t.toLowerCase().includes(q)));
      return matchCategory && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    if (selectedCategory !== 'Semua' || searchQuery.trim()) return null;
    return filteredArticles.find((a) => a.is_featured) || filteredArticles[0] || null;
  }, [filteredArticles, selectedCategory, searchQuery]);

  const gridArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Wawasan Pajak & UU HPP Terkini
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Artikel, Bedah Regulasi & Kebijakan Pajak Indonesia
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Ulasan hukum pajak, panduan teknis Coretax DJP, kertas kerja rekonsiliasi, dan studi kasus perpajakan yang disusun langsung oleh konsultan terdaftar NAC Tax Center.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition ${
                  active
                    ? 'bg-nac-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik pajak, PMK, Coretax..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nac-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-nac-primary mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Memuat artikel & kajian perpajakan terbaru...
          </p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            Artikel Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Belum ada artikel yang cocok dengan kata kunci atau kategori yang Anda pilih.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('Semua');
              setSearchQuery('');
            }}
            className="btn-secondary text-xs"
          >
            Tampilkan Semua Artikel
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Article Banner */}
          {featuredArticle && (
            <Link
              to={`/blog/${featuredArticle.slug || featuredArticle.id}`}
              className="group block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-6 h-56 sm:h-72 lg:h-auto overflow-hidden relative bg-slate-900">
                  <img
                    src={
                      featuredArticle.image ||
                      featuredArticle.image_url ||
                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80'
                    }
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow">
                      SOROTAN UTAMA
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-nac-primary" />
                        {featuredArticle.date}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-nac-primary" />
                        {featuredArticle.readTime || featuredArticle.read_time}
                      </span>
                      {featuredArticle.views_count > 0 && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {featuredArticle.views_count}x dibaca
                          </span>
                        </>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-nac-primary transition leading-snug">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    {featuredArticle.attachment_url && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-xs">
                          Lampiran Tersedia: {featuredArticle.attachment_name || 'Kertas Kerja / Dokumen Regulasi'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          featuredArticle.author_avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            featuredArticle.author_name || 'Pakar NAC'
                          )}&background=0284c7&color=fff`
                        }
                        alt={featuredArticle.author_name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {featuredArticle.author_name || 'Tim Pakar NAC Tax Center'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {featuredArticle.author_role || 'Konsultan Pajak Terdaftar (BKP)'}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-nac-primary group-hover:translate-x-1 transition shrink-0">
                      <span>Baca Kajian</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Articles Grid */}
          {gridArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {gridArticles.map((art) => (
                <article
                  key={art.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col group"
                >
                  <Link
                    to={`/blog/${art.slug || art.id}`}
                    className="h-48 overflow-hidden relative block bg-slate-900"
                  >
                    <img
                      src={
                        art.image ||
                        art.image_url ||
                        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                      {art.category}
                    </span>
                    {art.attachment_url && (
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/95 text-white shadow flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Lampiran</span>
                      </span>
                    )}
                  </Link>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-nac-primary" />
                        <span>{art.date}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-nac-primary" />
                        <span>{art.readTime || art.read_time}</span>
                      </div>

                      <Link
                        to={`/blog/${art.slug || art.id}`}
                        className="block font-bold text-slate-900 text-sm sm:text-base group-hover:text-nac-primary transition leading-snug"
                      >
                        {art.title}
                      </Link>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 text-[11px] text-slate-600 font-medium truncate">
                        <UserCheck className="w-3.5 h-3.5 text-nac-primary shrink-0" />
                        <span className="truncate">
                          {art.author_name || 'Tim Pakar NAC'}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${art.slug || art.id}`}
                        className="text-xs font-bold text-nac-primary hover:underline inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Baca</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPage;
