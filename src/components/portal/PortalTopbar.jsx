import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfileSettingsModal from '../common/ProfileSettingsModal';
import {
  Bell,
  Sparkles,
  BookOpen,
  Menu,
  GraduationCap,
  LogOut,
  Settings,
  ChevronDown,
  Home,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Badge from '../common/Badge';

export const PortalTopbar = ({ title, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isTeacher = user.role === 'teacher';
  const displayTitle =
    title ||
    (isTeacher
      ? 'Portal Pengajar & Instruktur'
      : 'Portal Pembelajaran Mahasiswa');

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
      showToast('Anda telah berhasil keluar dari akun.', 'info');
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          {/* Mobile Hamburger Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 truncate">
            {displayTitle}
          </h1>

          {user.active_brevet && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-200 truncate">
              <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{user.active_brevet.title}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {user.role === 'student' && (
            <div className="hidden xs:block">
              <Badge status={user.payment_status} size="sm" />
            </div>
          )}

          {isTeacher && (
            <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
              Instruktur BKP
            </span>
          )}

          {/* Notifications */}
          <button
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            aria-label="Notifikasi"
            onClick={() => showToast('Tidak ada notifikasi baru saat ini.', 'info')}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* Profile Interactive Dropdown */}
          <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-nac-primary/30"
              aria-expanded={dropdownOpen}
            >
              <img
                src={
                  user.avatar ||
                  (isTeacher
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80')
                }
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
              />
              <div className="hidden sm:block text-left max-w-[120px] truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1 text-[10px] font-semibold text-nac-primary uppercase tracking-wider">
                    {user.role === 'teacher' ? 'Instruktur / Dosen Pajak' : 'Mahasiswa Peserta'}
                  </div>
                </div>

                <div className="p-2 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Pengaturan Akun & Sandi</span>
                  </button>

                  <Link
                    to="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Lihat Beranda Publik</span>
                  </Link>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default PortalTopbar;
