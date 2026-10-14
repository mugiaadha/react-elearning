import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CreditCard,
  GraduationCap,
  Users,
  Compass,
  FileCheck,
  ChevronRight,
  Sparkles,
  LogOut,
  FolderOpen,
  X
} from 'lucide-react';

export const PortalSidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const isStudent = user.role === 'student';

  const studentLinks = [
    {
      name: 'Ikhtisar Belajar',
      path: '/dashboard/student',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'Kursus Saya',
      path: '/dashboard/student/my-courses',
      icon: BookOpen,
    },
    {
      name: 'Ruang Kelas Aktif',
      path: `/dashboard/student/course/${user.active_brevet?.slug || 'brevet-ab-terpadu'}`,
      icon: GraduationCap,
      badge: 'Live',
    },
    {
      name: 'Sertifikat Digital',
      path: '/dashboard/student/certificates',
      icon: Award,
    },
    {
      name: 'Riwayat Tagihan & Bukti',
      path: '/dashboard/student/transactions',
      icon: CreditCard,
    },
  ];

  const teacherLinks = [
    {
      name: 'Dashboard Instruktur',
      path: '/dashboard/teacher',
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: 'Kelas Yang Diampu',
      path: '/dashboard/teacher/courses',
      icon: BookOpen,
    },
    {
      name: 'Monitoring Siswa',
      path: '/dashboard/teacher/students',
      icon: Users,
    },
  ];

  const links = isStudent ? studentLinks : teacherLinks;

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-slate-900 text-slate-300 border-r border-slate-800 overflow-hidden">
      {/* Brand Logo Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nac-navy to-nac-primary flex items-center justify-center text-white shadow-md shrink-0">
            <span className="font-extrabold text-lg text-amber-400">NAC</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white text-sm tracking-tight truncate">NAC TAX CENTER</div>
            <div className="text-[11px] text-emerald-400 font-medium truncate">
              {isStudent ? 'Portal Mahasiswa' : 'Portal Instruktur'}
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Mini Card */}
      <div className="p-3 sm:p-4 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3 shrink-0 overflow-hidden">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
          alt={user.name}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-emerald-500/50 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate" title={user.name}>{user.name}</div>
          <div className="text-[11px] text-slate-400 truncate" title={user.email}>{user.email}</div>
          <div className="mt-0.5">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
              {isStudent ? 'Siswa Aktif' : 'Instruktur BKP'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {links.map((item) => {
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
                    ? 'bg-nac-primary text-white shadow-glow-primary font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-300 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {isStudent && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Katalog Program
            </div>
            <NavLink
              to="/brevet"
              onClick={() => onClose && onClose()}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-sky-400 hover:text-sky-300 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>Daftar Brevet Lainnya</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        )}
      </div>

      {/* Bottom logout / Back to home */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <NavLink
          to="/"
          onClick={() => onClose && onClose()}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Compass className="w-4 h-4" />
          <span>Lihat Website Publik</span>
        </NavLink>
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 h-full overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default PortalSidebar;
