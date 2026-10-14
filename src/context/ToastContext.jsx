import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Show toast with message, type, duration, and optional title
   * @param {string} message 
   * @param {'success'|'error'|'info'|'warning'|'loading'} type 
   * @param {number} duration ms (0 for indefinite)
   * @param {string} [title] 
   */
  const showToast = useCallback((message, type = 'success', duration = 4000, title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = {
      id,
      message,
      type,
      title: title || (type === 'success' ? 'Berhasil' : type === 'error' ? 'Peringatan' : type === 'warning' ? 'Perhatian' : type === 'loading' ? 'Memproses' : 'Informasi'),
      createdAt: Date.now(),
      duration,
    };

    setToasts((prev) => {
      // Prevent duplicate toasts with identical message within 2.5s
      const isDuplicate = prev.some((t) => t.message === message && Date.now() - t.createdAt < 2500);
      if (isDuplicate) return prev;

      // When showing success/error, remove any active loading toast so multiple toasts don't stack
      const filtered = (type === 'success' || type === 'error')
        ? prev.filter((t) => t.type !== 'loading')
        : prev;

      return [...filtered, newToast];
    });

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, updateToast }}>
      {children}

      {/* Floating Toast Notification Container - Top Right */}
      <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isInfo = toast.type === 'info';
          const isLoading = toast.type === 'loading';
          const isSuccess = toast.type === 'success' || (!isError && !isWarning && !isInfo && !isLoading);

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                isError
                  ? 'bg-rose-950/90 border-rose-700/60 text-rose-50 shadow-rose-950/40'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-600/60 text-amber-50 shadow-amber-950/40'
                  : isInfo
                  ? 'bg-slate-900/90 border-sky-600/50 text-slate-100 shadow-sky-950/30'
                  : isLoading
                  ? 'bg-slate-900/90 border-indigo-500/60 text-indigo-50 shadow-indigo-950/40'
                  : 'bg-emerald-950/90 border-emerald-600/60 text-emerald-50 shadow-emerald-950/40'
              }`}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                {isError ? (
                  <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                ) : isWarning ? (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                ) : isInfo ? (
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <Info className="w-4 h-4" />
                  </div>
                ) : isLoading ? (
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 pr-1 overflow-hidden">
                <div className="text-xs font-bold tracking-tight opacity-95">
                  {toast.title}
                </div>
                <div className="text-xs text-slate-200/90 font-medium leading-relaxed mt-0.5 break-words">
                  {toast.message}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
