import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfileSettingsModal from '../common/ProfileSettingsModal';
import {
  Bell,
  ShieldCheck,
  Database,
  Server,
  Menu,
  LogOut,
  Settings,
  ChevronDown,
  Home
} from 'lucide-react';

export const BackofficeTopbar = ({ title = 'Panel Kontrol Admin', onToggleMobileMenu }) => {
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

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
      showToast('Anda telah keluar dari backoffice admin.', 'info');
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <>
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 text-white">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Buka Menu Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">{title}</h1>

          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            Backend API: <span className="text-emerald-400 font-mono text-[11px]">Laravel 12 (Active)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>SQLite Database</span>
          </div>

          <button
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
            aria-label="Admin Alerts"
            onClick={() => showToast('Semua sistem dan antrean pembayaran beroperasi normal.', 'success')}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
          </button>

          {/* Admin Profile Dropdown */}
          <div className="relative pl-2 border-l border-slate-800" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              aria-expanded={dropdownOpen}
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                alt={user?.name || 'Admin'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0284c7&color=fff`;
                }}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="hidden sm:block text-left max-w-[120px] truncate">
                <div className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Super Admin</div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/40">
                  <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@nactaxcenter.id'}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    <ShieldCheck className="w-3 h-3" />
                    Akses Penuh Backoffice
                  </div>
                </div>

                <div className="p-2 space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Pengaturan Akun Admin</span>
                  </button>

                  <Link
                    to="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Lihat Halaman Publik</span>
                  </Link>
                </div>

                <div className="pt-1 mt-1 border-t border-slate-800 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Admin Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default BackofficeTopbar;
