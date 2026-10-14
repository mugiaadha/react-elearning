import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfileSettingsModal from './ProfileSettingsModal';
import {
  FileText,
  Shield,
  BookOpen,
  Menu,
  X,
  ArrowRight,
  User,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Settings,
  Sparkles,
  CreditCard
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Program Brevet', path: '/brevet' },
    { name: 'Wawasan Pajak & UU HPP', path: '/blog' },
    { name: 'Tentang Kami', path: '/about' },
    { name: 'Kontak', path: '/contact' },
  ];

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      await logout();
      showToast('Anda telah berhasil keluar dari sistem.', 'info');
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'teacher') return '/dashboard/teacher';
    if (user.payment_status !== 'APPROVED') return '/onboarding/payment-pending';
    return '/dashboard/student';
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'admin') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-amber-400/40">ADMIN</span>;
    }
    if (user.role === 'teacher') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">INSTRUKTUR BKP</span>;
    }
    if (user.payment_status === 'APPROVED') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">SISWA AKTIF</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">PENDING VERIFIKASI</span>;
  };

  const renderAuthSection = (isMobile = false) => {
    if (!isAuthenticated || !user) {
      return (
        <div className={`flex items-center ${isMobile ? 'flex-col gap-2 w-full pt-2' : 'gap-3'}`}>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className={`text-sm font-semibold text-slate-700 hover:text-nac-primary px-3 py-2 transition ${
              isMobile ? 'w-full text-center bg-slate-100 rounded-xl' : ''
            }`}
          >
            Masuk
          </Link>
          <Link
            to="/brevet"
            onClick={() => setMobileMenuOpen(false)}
            className={`btn-primary text-sm shadow-sm ${isMobile ? 'w-full justify-center' : ''}`}
          >
            Daftar Brevet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      );
    }

    if (isMobile) {
      return (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0284c7&color=fff`}
              alt={user.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0284c7&color=fff`;
              }}
              className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
            />
            <div className="truncate flex-1">
              <div className="font-bold text-sm text-slate-800 truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
              <div className="mt-1">{getRoleBadge()}</div>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-nac-primary bg-sky-50"
            >
              <LayoutDashboard className="w-4 h-4" />
              Buka Dashboard
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsProfileModalOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Pengaturan Profil
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
              Keluar (Logout)
            </button>
          </div>
        </div>
      );
    }

    // Desktop Dropdown
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          {/* Quick Dashboard Button */}
          <Link
            to={getDashboardPath()}
            className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-nac-primary" />
            <span>Dashboard</span>
          </Link>

          {/* User Button */}
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-100 border border-slate-200 transition focus:outline-none focus:ring-2 focus:ring-nac-primary/30"
            aria-expanded={userDropdownOpen}
          >
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0284c7&color=fff`}
              alt={user.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0284c7&color=fff`;
              }}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
            />
            <div className="text-left hidden sm:block max-w-[110px] truncate">
              <span className="text-xs font-semibold text-slate-800 block truncate">{user.name}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {userDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header info */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0284c7&color=fff`}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0284c7&color=fff`;
                  }}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-slate-800 truncate">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1">{getRoleBadge()}</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              <Link
                to={getDashboardPath()}
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-nac-primary transition"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard Utama</span>
              </Link>

              {user.role === 'student' && (
                <Link
                  to="/dashboard/student/transactions"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Riwayat Transaksi & Kuitansi</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition text-left"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Pengaturan Profil & Sandi</span>
              </button>
            </div>

            {/* Logout item */}
            <div className="pt-1 mt-1 border-t border-slate-100 p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group overflow-hidden">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-nac-navy to-nac-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-amber-400">NAC</span>
              </div>
              <div className="truncate">
                <div className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight leading-none truncate">
                  NAC TAX CENTER
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide mt-0.5 truncate hidden xs:block">
                  Pusat Pelatihan & Sertifikasi Brevet Pajak
                </div>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-nac-primary font-semibold bg-sky-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Right CTA (Desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {renderAuthSection(false)}
            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-800" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-nac-primary font-semibold bg-sky-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {renderAuthSection(true)}
          </div>
        )}
      </header>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
