import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Send,
  Eye,
  Code,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Sparkles,
  ShieldCheck,
  Loader2,
  Copy
} from 'lucide-react';

export const AdminEmailTemplatesPage = () => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('tester.admin@nactaxcenter.id');
  const [sendingTest, setSendingTest] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'

  const fetchTemplates = async (isManual = false) => {
    try {
      setLoading(true);
      const data = await userService.getEmailTemplates();
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      } else if (selectedTemplate && data) {
        const found = data.find((t) => t.id === selectedTemplate.id);
        if (found) setSelectedTemplate(found);
      }
      if (isManual) {
        showToast('Template email master berhasil diperbarui dari database.', 'info', 2500);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat template email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTestSend = async () => {
    if (!testEmail.trim() || !selectedTemplate) {
      showToast('Alamat email penerima wajib diisi.', 'warning');
      return;
    }

    setSendingTest(true);
    showToast(`Mengirim email uji coba "${selectedTemplate.name}" via SMTP...`, 'loading', 2500);
    try {
      const res = await userService.testSendEmailTemplate(testEmail.trim(), selectedTemplate.slug);
      if (res.success) {
        showToast(`Email berhasil dikirim ke ${testEmail}! (SMTP status: OK)`, 'success', 4000);
      } else {
        showToast(res.message || 'Gagal mengirim email via SMTP.', 'warning', 4500);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Kesalahan koneksi SMTP.', 'error', 4000);
    } finally {
      setSendingTest(false);
    }
  };

  const getPreviewHtml = (template) => {
    if (!template) return '';
    let html = template.body_html || '';
    const mocks = {
      '{{name}}': 'Dimas Anindito Pratama, S.E.',
      '{{email}}': 'dimas.pratama@gmail.com',
      '{{verification_code}}': '882190',
      '{{verification_url}}': 'http://localhost:5173/verify-email?code=882190',
      '{{expiry_minutes}}': '15',
      '{{app_name}}': 'NAC Tax Center',
      '{{app_url}}': 'http://localhost:5173',
      '{{brevet_title}}': 'Brevet Pajak A & B Terpadu',
      '{{invoice_id}}': 'INV-NAC-2026-0892',
      '{{amount}}': '2.750.000',
      '{{brevet_slug}}': 'brevet-ab-terpadu',
      '{{certificate_id}}': 'NAC-CERT-2026-AB-88219',
      '{{course_title}}': 'Brevet Pajak A & B Terpadu',
      '{{grade}}': 'Sangat Memuaskan (A)',
      '{{score}}': '95.5',
      '{{year}}': '2026',
      '{{support_email}}': 'admisi@nactaxcenter.id',
      '{{support_phone}}': '+62 812-8890-4123',
    };

    for (const [key, val] of Object.entries(mocks)) {
      html = html.replaceAll(key, val);
    }
    return html;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            Master Template Email & Layanan SMTP
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Template email transaksional resmi tersimpan di database SQLite & dikirim via transport SMTP.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Driver: SMTP / Mailer</span>
          </span>

          <button
            onClick={() => fetchTemplates(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Muat ulang template"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !selectedTemplate ? (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-2" />
          <p className="text-xs">Memuat master template email dari database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Template List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Daftar Master Template ({templates.length})
            </div>

            <div className="space-y-2">
              {templates.map((tpl) => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-white'
                        : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs truncate">{tpl.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-amber-400 border border-slate-700">
                        {tpl.slug}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Subjek: {tpl.subject}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Test Send Card */}
            {selectedTemplate && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Uji Pengiriman SMTP Langsung</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Kirim template <strong>{selectedTemplate.slug}</strong> ke alamat email tujuan untuk menguji fungsionalitas server SMTP.
                </p>

                <div className="space-y-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="email.tujuan@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
                  />
                  <button
                    onClick={handleTestSend}
                    disabled={sendingTest}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition disabled:opacity-60"
                  >
                    {sendingTest ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengirim via SMTP...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Email Percobaan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Template Detail & Live Preview */}
          <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {selectedTemplate ? (
              <>
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedTemplate.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Subjek: <span className="font-semibold text-amber-300 font-mono">{selectedTemplate.subject}</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                        activeTab === 'preview'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Preview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('code')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                        activeTab === 'code'
                          ? 'bg-slate-800 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Kode HTML Master</span>
                    </button>
                  </div>
                </div>

                {/* Available Placeholders */}
                {selectedTemplate.placeholders && (
                  <div className="px-5 py-3 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
                    <span className="text-slate-400 font-bold shrink-0">Variabel Dinamis:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedTemplate.placeholders.map((ph) => (
                        <span
                          key={ph}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]"
                        >
                          {`{{${ph}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body Content */}
                <div className="p-4 sm:p-6 flex-1 min-h-[460px]">
                  {activeTab === 'preview' ? (
                    <div className="bg-slate-100 rounded-xl p-4 overflow-auto border border-slate-700/50 shadow-inner max-h-[550px]">
                      <div
                        dangerouslySetInnerHTML={{ __html: getPreviewHtml(selectedTemplate) }}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-auto max-h-[550px] leading-relaxed whitespace-pre-wrap">
                        {selectedTemplate.body_html}
                      </pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500">
                Pilih salah satu template email di sebelah kiri.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplatesPage;
