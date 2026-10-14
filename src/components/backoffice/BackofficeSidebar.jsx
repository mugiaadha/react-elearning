import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import paymentService from '../../services/paymentService';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  Award,
  Shield,
  Compass,
  LogOut,
  CheckCircle,
  Clock,
  X,
  Mail
} from 'lucide-react';

export const BackofficeSidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(3);

  useEffect(() => {
    paymentService.getPendingPayments().then((payments) => {
      const pending = payments.filter((p) => p.status === 'PENDING_APPROVAL');
      setPendingCount(pending.length);
    }).catch(() => {});
  }, []);

  const adminLinks = [
    {
      name: 'Ikhtisar CMS & Metrik',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'Verifikasi Pembayaran',
      path: '/admin/payments',
      icon: CreditCard,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      name: 'Manajemen Siswa',
      path: '/admin/students',
      icon: Users,
    },
    {
      name: 'Kurikulum & Program Brevet',
      path: '/admin/brevets',
      icon: BookOpen,
    },
    {
      name: 'Log & Audit Sertifikat',
      path: '/admin/certificates',
      icon: Award,
    },
    {
      name: 'Master Template Email (SMTP)',
      path: '/admin/email-templates',
      icon: Mail,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 border-r border-slate-900">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight">NAC BACKOFFICE</div>
            <div className="text-[11px] text-red-400 font-semibold tracking-wider uppercase">Admin Control</div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Profile */}
      <div className="p-3 sm:p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
          ADM
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-semibold text-white truncate">Administrator Utama</div>
          <div className="text-[11px] text-slate-400 truncate">Superadmin NAC</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Sistem Aktif
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Modul Administrasi
        </div>
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-amber-700 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${item.badgeColor || 'bg-red-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer links */}
      <div className="p-3 border-t border-slate-900 space-y-1">
        <NavLink
          to="/"
          onClick={() => onClose && onClose()}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <Compass className="w-4 h-4" />
          <span>Lihat Website Publik</span>
        </NavLink>
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 shrink-0 h-full">
        {content}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default BackofficeSidebar;
