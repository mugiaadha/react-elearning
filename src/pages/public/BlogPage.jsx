import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BlogPage = () => {
  const articles = [
    {
      id: 1,
      title: 'Panduan Praktis Perhitungan PPh 21 Skema TER PP 58/2023 & PMK 168/2023',
      excerpt: 'Pahami cara menghitung PPh Pasal 21 pegawai tetap masa pajak Januari s.d. November dan perhitungan ulang pada masa Desember.',
      date: '10 Okt 2026',
      readTime: '6 Menit Baca',
      category: 'PPh 21',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      title: 'Kesiapan Wajib Pajak Badan Menghadapi Implementasi Coretax System DJP',
      excerpt: 'Perubahan mekanisme Faktur Pajak Baru, integrasi Deposit Pajak (Taxpayer Ledger), dan automasi SPT unifikasi.',
      date: '05 Okt 2026',
      readTime: '8 Menit Baca',
      category: 'Coretax DJP',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      title: 'Bedah Regulasi PMK 172/2023: Dokumentasi Transfer Pricing (Local File & Master File)',
      excerpt: 'Prinsip kewajaran dan kelaziman usaha (ALP) bagi grup perusahaan multinasional dan transaksi istimewa.',
      date: '28 Sep 2026',
      readTime: '10 Menit Baca',
      category: 'Pajak Internasional',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-nac-primary uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
          Wawasan & Regulasi Terkini
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Artikel & Analisis Kebijakan Pajak Indonesia
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Ulasan hukum, panduan teknis pelaporan, dan studi kasus perpajakan dari para pakar NAC Tax Center.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((art) => (
          <article
            key={art.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col group"
          >
            <div className="h-44 overflow-hidden relative">
              <img
                src={art.image}
                alt={art.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-sm">
                {art.category}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{art.date}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{art.readTime}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-nac-primary transition leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Membuka artikel lengkap: ${art.title}`)}
                  className="text-xs font-bold text-nac-primary hover:underline inline-flex items-center gap-1"
                >
                  Baca Selengkapnya &rarr;
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
