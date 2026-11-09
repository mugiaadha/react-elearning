import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import blogService from '../../services/blogService';
import { useCompanyProfile } from '../../context/CompanyProfileContext';
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
  Type,
  Sun,
  Moon,
  ListTree,
  MessageSquarePlus,
  ShieldCheck,
  RefreshCw,
  Send,
  Mail,
  Sparkles,
} from 'lucide-react';

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const { company } = useCompanyProfile();
  const { showToast } = useToast();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Reader Comfort Preferences
  const [fontSize, setFontSize] = useState('md'); // 'sm' | 'md' | 'lg'
  const [readingTheme, setReadingTheme] = useState('paper'); // 'paper' | 'sepia' | 'dark'

  // Question / Inquiry Form State (Bottom of Article -> Queued Email to company_profile.email)
  const [qName, setQName] = useState('');
  const [qContact, setQContact] = useState('');
  const [qText, setQText] = useState('');
  const [websiteTrap, setWebsiteTrap] = useState(''); // Honeypot anti-bot
  const [captcha, setCaptcha] = useState({
    captcha_token: '',
    captcha_question: 'Memuat verifikasi...',
  });
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState('');

  const loadCaptcha = async () => {
    try {
      setLoadingCaptcha(true);
      const data = await blogService.getCaptchaChallenge();
      if (data) {
        setCaptcha(data);
        setCaptchaAnswer('');
      }
    } catch (err) {
      console.error('Captcha load error:', err);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setQuestionSuccess('');
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
    loadCaptcha();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract Table of Contents (headings) from article content
  const tableOfContents = useMemo(() => {
    if (!article?.content) return [];
    const blocks = article.content.split(/\r?\n\r?\n+/);
    const items = [];
    blocks.forEach((b, idx) => {
      const firstLine = b.trim().split(/\r?\n/)[0].trim();
      if (firstLine.startsWith('### ') || firstLine.startsWith('## ')) {
        const text = firstLine.replace(/^#{2,3}\s+/, '').replace(/\*\*/g, '');
        const id = `section-${idx}`;
        items.push({ id, text });
      }
    });
    return items;
  }, [article?.content]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Tautan artikel berhasil disalin ke clipboard!', 'success');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!qName.trim() || !qContact.trim() || !qText.trim()) {
      showToast('Mohon lengkapi nama, kontak, dan isi pertanyaan Anda.', 'warning');
      return;
    }

    if (!captchaAnswer.trim()) {
      showToast('Silakan isi jawaban verifikasi keamanan (CAPTCHA).', 'warning');
      return;
    }

    try {
      setSendingQuestion(true);
      setQuestionSuccess('');

      const res = await blogService.askBlogQuestion(article.slug || article.id, {
        name: qName.trim(),
        contact: qContact.trim(),
        question: qText.trim(),
        captcha_token: captcha.captcha_token,
        captcha_answer: captchaAnswer.trim(),
        website_trap: websiteTrap,
      });

      const msg =
        res?.message ||
        `Pertanyaan Anda berhasil dikirim ke tim konsultan ${company.company_name} (${company.email})!`;
      setQuestionSuccess(msg);
      showToast(msg, 'success', 5000);
      setQName('');
      setQContact('');
      setQText('');
      setCaptchaAnswer('');
      loadCaptcha();
    } catch (err) {
      showToast(
        err.message || 'Gagal mengirim pertanyaan. Periksa kembali jawaban CAPTCHA Anda.',
        'error',
        4000
      );
      loadCaptcha();
    } finally {
      setSendingQuestion(false);
    }
  };

  const fontSizeConfig = {
    sm: {
      body: 'text-[13px] sm:text-[14px] leading-[1.8]',
      h1: 'text-xl sm:text-2xl md:text-[26px]',
      h2: 'text-base sm:text-lg',
      lead: 'text-xs sm:text-[13.5px]',
    },
    md: {
      body: 'text-[14.5px] sm:text-[15.5px] leading-[1.85]',
      h1: 'text-2xl sm:text-[28px] md:text-3xl',
      h2: 'text-[17px] sm:text-[19px]',
      lead: 'text-[13.5px] sm:text-[15px]',
    },
    lg: {
      body: 'text-base sm:text-[18px] leading-[1.9]',
      h1: 'text-2xl sm:text-3xl md:text-4xl',
      h2: 'text-lg sm:text-[22px]',
      lead: 'text-sm sm:text-[16.5px]',
    },
  }[fontSize];

  const fontSizeClasses = fontSizeConfig.body;

  const themeClasses = {
    paper: {
      card: 'bg-white border-slate-200 text-slate-800',
      heading: 'text-slate-900',
      paragraph: 'text-slate-700',
      lead: 'bg-sky-50/70 border-nac-primary text-slate-700',
      callout: 'bg-amber-50/90 border-amber-400 text-amber-950',
      listBox: 'bg-slate-50/90 border-slate-200/90 text-slate-700',
      muted: 'text-slate-500',
    },
    sepia: {
      card: 'bg-[#fbf7ef] border-[#e6dcc8] text-[#2c241b]',
      heading: 'text-[#1f1811]',
      paragraph: 'text-[#382e22]',
      lead: 'bg-[#f3ead8] border-amber-700 text-[#2c241b]',
      callout: 'bg-[#f5e8c7] border-amber-600 text-[#2c241b]',
      listBox: 'bg-[#f4ede0] border-[#e2d5bc] text-[#382e22]',
      muted: 'text-[#6e5d49]',
    },
    dark: {
      card: 'bg-slate-900 border-slate-800 text-slate-100',
      heading: 'text-white',
      paragraph: 'text-slate-300',
      lead: 'bg-slate-800/90 border-amber-400 text-slate-200',
      callout: 'bg-amber-950/40 border-amber-500/60 text-amber-200',
      listBox: 'bg-slate-950/70 border-slate-800 text-slate-300',
      muted: 'text-slate-400',
    },
  }[readingTheme];

  const renderInlineBold = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={pIdx} className={`font-bold ${themeClasses.heading}`}>
          {part.slice(2, -2)}
        </strong>
      ) : (
        part
      )
    );
  };

  const renderBodyElement = (text, key, isFirstParagraph = false) => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    // Blockquote / Legal Callout (> ...)
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      return (
        <blockquote
          key={key}
          className={`p-4 sm:p-5 rounded-2xl border-l-4 ${themeClasses.callout} font-medium shadow-sm my-3`}
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
            <div className="leading-relaxed">{renderInlineBold(quoteText)}</div>
          </div>
        </blockquote>
      );
    }

    // Bullet or Numbered List
    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 0 && lines.every((l) => /^(-|\*|\d+\.)\s+/.test(l))) {
      return (
        <ul
          key={key}
          className={`space-y-2.5 p-4 sm:p-5 rounded-2xl border ${themeClasses.listBox}`}
        >
          {lines.map((line, lIdx) => {
            const isNumbered = /^\d+\.\s+/.test(line);
            const prefixMatch = line.match(/^(\d+\.)\s+/);
            const cleanLine = line.replace(/^(-|\*|\d+\.)\s+/, '');
            return (
              <li key={lIdx} className="flex items-start gap-3">
                {isNumbered ? (
                  <span className="w-5 h-5 rounded-md bg-nac-primary/15 text-nac-primary font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-1">
                    {prefixMatch?.[1]?.replace('.', '')}
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-nac-primary shrink-0 mt-2.5" />
                )}
                <span className="flex-1">{renderInlineBold(cleanLine)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    // Check if paragraph contains a leading line + bullet items below it
    const firstBulletIdx = lines.findIndex((l) => /^(-|\*|\d+\.)\s+/.test(l));
    if (firstBulletIdx > 0) {
      const introText = lines.slice(0, firstBulletIdx).join(' ');
      const listText = lines.slice(firstBulletIdx).join('\n');
      return (
        <div key={key} className="space-y-3">
          <p className="leading-relaxed">{renderInlineBold(introText)}</p>
          {renderBodyElement(listText, `${key}-list`, false)}
        </div>
      );
    }

    return (
      <p
        key={key}
        className={`leading-[1.85] ${
          isFirstParagraph
            ? 'first-letter:text-2xl sm:first-letter:text-3xl first-letter:font-extrabold first-letter:text-nac-primary first-letter:mr-1.5 first-letter:float-left first-letter:leading-none'
            : ''
        }`}
      >
        {renderInlineBold(trimmed)}
      </p>
    );
  };

  const renderFormattedContent = (rawContent) => {
    if (!rawContent) return null;

    if (/<(p|h1|h2|h3|h4|ul|ol|li|strong|br|div)\b/i.test(rawContent)) {
      return (
        <div
          className={`max-w-none space-y-4 ${fontSizeClasses} ${themeClasses.paragraph}`}
          dangerouslySetInnerHTML={{ __html: rawContent }}
        />
      );
    }

    const blocks = rawContent.split(/\r?\n\r?\n+/);
    let firstParagraphRendered = false;

    return (
      <div className={`space-y-5 ${fontSizeClasses} ${themeClasses.paragraph} tracking-[0.005em]`}>
        {blocks.map((block, idx) => {
          const trimmed = block.trim();
          if (!trimmed) return null;

          // Subheading H3 / H2 (Separate only the first line as heading, render remaining lines as normal paragraph/list!)
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const blockLines = trimmed.split(/\r?\n/);
            const headingLine = blockLines[0].replace(/^#{2,3}\s+/, '').trim();
            const restContent = blockLines.slice(1).join('\n').trim();

            return (
              <div key={idx} className="space-y-3 pt-3">
                <h2
                  id={`section-${idx}`}
                  className={`scroll-mt-28 ${fontSizeConfig.h2} font-extrabold ${themeClasses.heading} pb-1.5 border-b border-slate-200/40 flex items-center gap-2.5 tracking-tight`}
                >
                  <span className="w-1.5 h-5 rounded-full bg-nac-primary shrink-0" />
                  <span>{renderInlineBold(headingLine)}</span>
                </h2>
                {restContent && renderBodyElement(restContent, `${idx}-body`, false)}
              </div>
            );
          }

          const isFirst = !firstParagraphRendered;
          firstParagraphRendered = true;
          return renderBodyElement(trimmed, idx, isFirst);
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-nac-primary mx-auto" />
        <p className="text-xs text-slate-500">Menyiapkan ruang baca artikel...</p>
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
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50">
        <div
          className="h-full bg-gradient-to-r from-nac-primary via-sky-500 to-amber-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10">
        {/* Top Action Bar & Reader Comfort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl border border-slate-200 shadow-sm sticky top-16 sm:top-20 z-30">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-nac-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Wawasan Pajak</span>
          </Link>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
            {/* Font Size Controls */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="px-2 text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Ukuran Teks:</span>
              </span>
              {[
                { key: 'sm', label: 'A-' },
                { key: 'md', label: 'A' },
                { key: 'lg', label: 'A+' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFontSize(item.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition ${
                    fontSize === item.key
                      ? 'bg-nac-navy text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Reading Theme Controls */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setReadingTheme('paper')}
                title="Mode Terang (Kertas Putih)"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition ${
                  readingTheme === 'paper'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Putih</span>
              </button>
              <button
                type="button"
                onClick={() => setReadingTheme('sepia')}
                title="Mode Sepia (Hangat & Ramah Mata)"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  readingTheme === 'sepia'
                    ? 'bg-[#f3ead8] text-[#2c241b] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sepia
              </button>
              <button
                type="button"
                onClick={() => setReadingTheme('dark')}
                title="Mode Gelap (Malam)"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition ${
                  readingTheme === 'dark'
                    ? 'bg-slate-900 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Gelap</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-nac-primary" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Table of Contents (Desktop) */}
          {tableOfContents.length > 0 && (
            <aside className="hidden lg:block lg:col-span-3 sticky top-36 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-nac-primary">
                  <ListTree className="w-4 h-4" />
                  <span>Daftar Isi Kajian</span>
                </div>
                <nav className="space-y-1.5 text-xs">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block py-1.5 px-2.5 rounded-lg text-slate-600 hover:text-nac-primary hover:bg-sky-50 font-medium transition leading-snug"
                    >
                      {item.text}
                    </a>
                  ))}
                  <a
                    href="#diskusi-konsultasi"
                    className="block py-2 px-2.5 mt-2 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold transition leading-snug border border-amber-200"
                  >
                    💬 Ajukan Pertanyaan Pajak
                  </a>
                </nav>
              </div>

              <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Diterbitkan Oleh
                </span>
                <div className="text-sm font-extrabold">{company.company_name}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {company.tagline}
                </p>
                <div className="pt-1 text-[11px] text-sky-300 font-mono truncate">
                  {company.email}
                </div>
              </div>
            </aside>
          )}

          {/* Main Reading Column */}
          <div
            className={`${
              tableOfContents.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12 max-w-4xl mx-auto w-full'
            } space-y-8`}
          >
            <article
              className={`rounded-3xl border overflow-hidden shadow-md transition-colors duration-200 ${themeClasses.card}`}
            >
              {/* Hero Cover Image */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
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

              {/* Reading Canvas (Optimal 68ch measure & generous padding) */}
              <div className="p-5 sm:p-8 md:p-12">
                <div className="max-w-[68ch] mx-auto space-y-8">
                  {/* Article Header */}
                  <div className="space-y-4 border-b border-slate-200/50 pb-6">
                    <h1
                      className={`${fontSizeConfig.h1} font-extrabold leading-tight tracking-tight ${themeClasses.heading}`}
                    >
                      {article.title}
                    </h1>

                    {article.excerpt && (
                      <p
                        className={`${fontSizeConfig.lead} font-medium leading-relaxed p-4 rounded-2xl border-l-4 ${themeClasses.lead}`}
                      >
                        {article.excerpt}
                      </p>
                    )}

                    {/* Author Card */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={
                            article.author_avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              article.author_name || 'Pakar Pajak'
                            )}&background=0284c7&color=fff`
                          }
                          alt={article.author_name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                        />
                        <div>
                          <div
                            className={`text-xs sm:text-sm font-extrabold flex items-center gap-1.5 ${themeClasses.heading}`}
                          >
                            <span>{article.author_name || `Tim Pakar ${company.company_name}`}</span>
                            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                          </div>
                          <div className={`text-[11px] sm:text-xs ${themeClasses.muted}`}>
                            {article.author_role || 'Konsultan Pajak Terdaftar (BKP)'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Table of Contents */}
                  {tableOfContents.length > 0 && (
                    <div
                      className={`lg:hidden p-4 rounded-2xl border ${themeClasses.listBox} space-y-2`}
                    >
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-nac-primary">
                        <ListTree className="w-4 h-4" />
                        <span>Pokok Bahasan Artikel</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {tableOfContents.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className="block py-1 font-semibold hover:text-nac-primary underline-offset-2 hover:underline"
                          >
                            • {item.text}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formatted Main Article Text */}
                  {renderFormattedContent(article.content)}

                  {/* Companion Document Download Box */}
                  {article.attachment_url && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-900">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                            Lampiran Kertas Kerja & Regulasi
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                            {article.attachment_name ||
                              'Unduh Dokumen Pendamping Regulasi / Kertas Kerja'}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Disediakan oleh tim instruktur {company.company_name}.
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
                    <div className="pt-4 border-t border-slate-200/50 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold inline-flex items-center gap-1 mr-1 ${themeClasses.muted}`}
                      >
                        <Tag className="w-3.5 h-3.5 text-nac-primary" />
                        Topik Terkait:
                      </span>
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-800 text-xs font-semibold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* =================================================================
                BOTTOM QUESTION / CONSULTATION BOX -> QUEUED EMAIL TO COMPANY_PROFILE
                ================================================================= */}
            <section
              id="diskusi-konsultasi"
              className="scroll-mt-24 bg-white rounded-3xl border-2 border-sky-100 shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-950 via-nac-navy to-slate-900 p-6 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      Diskusi & Konsultasi Langsung Materi Artikel
                    </span>
                    <h3 className="text-lg sm:text-2xl font-extrabold">
                      Punya Pertanyaan Terkait Kasus Pajak di Atas?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300">
                      Tulis pertanyaan Anda di bawah ini. Sistem akan meneruskannya langsung ke email resmi{' '}
                      <strong className="text-amber-300 font-mono">{company.email}</strong> ({company.company_name}).
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-xs shrink-0">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Respon oleh Tim BKP</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                {questionSuccess && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold">Pertanyaan Berhasil Terkirim!</div>
                      <p className="mt-0.5 text-emerald-800">{questionSuccess}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleQuestionSubmit} className="space-y-4 text-xs sm:text-sm">
                  {/* Honeypot field hidden from human users */}
                  <input
                    type="text"
                    name="website_trap"
                    value={websiteTrap}
                    onChange={(e) => setWebsiteTrap(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Nama Lengkap Anda *
                      </label>
                      <input
                        type="text"
                        required
                        value={qName}
                        onChange={(e) => setQName(e.target.value)}
                        placeholder="Contoh: Rendra Pratama, S.E."
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Email Aktif / Nomor WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={qContact}
                        onChange={(e) => setQContact(e.target.value)}
                        placeholder="rendra@perusahaan.co.id / 0812xxxx"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Pertanyaan / Studi Kasus yang Ingin Dikonsultasikan *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      placeholder={`Tanyakan detail penerapan regulasi pada artikel "${article.title}" atau kasus perpajakan di perusahaan Anda...`}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 focus:bg-white p-3.5 text-slate-900 focus:ring-2 focus:ring-nac-primary focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Anti-Spam Verification Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-nac-primary flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Pertanyaan Keamanan
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-nac-primary mt-0.5 flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-white border border-sky-200 font-mono text-slate-900 shadow-sm">
                            {captcha.captcha_question}
                          </span>
                          <button
                            type="button"
                            onClick={loadCaptcha}
                            disabled={loadingCaptcha}
                            title="Ganti pertanyaan hitung"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-nac-primary hover:bg-white transition"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${loadingCaptcha ? 'animate-spin' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-44">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        placeholder="Ketik hasil angka..."
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-center font-mono font-bold text-slate-900 focus:ring-2 focus:ring-nac-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <span className="text-[11px] text-slate-500">
                      🔒 Pertanyaan Anda akan dijawab langsung oleh tim konsultan pajak kami melalui email atau WhatsApp.
                    </span>

                    <button
                      type="submit"
                      disabled={sendingQuestion}
                      className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-xl font-extrabold shadow-md hover:shadow-lg transition inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {sendingQuestion ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengirim Pertanyaan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Pertanyaan ke Tim Pajak</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Related Posts */}
            {Array.isArray(article.related_posts) && article.related_posts.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Baca Juga Kajian Perpajakan Terkait
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
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
