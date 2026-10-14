import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const Badge = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size] || 'px-2.5 py-1 text-xs font-semibold';

  if (norm === 'PENDING_APPROVAL' || norm === 'PENDING') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        <Clock className="w-3.5 h-3.5 animate-pulse text-amber-600" />
        Menunggu Verifikasi Admin
      </span>
    );
  }

  if (norm === 'APPROVED' || norm === 'ACTIVE' || norm === 'VALID') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Aktif / Disetujui
      </span>
    );
  }

  if (norm === 'REJECTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Ditolak
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
      {status || 'Unknown'}
    </span>
  );
};

export default Badge;
