import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompanyProfile } from '../../context/CompanyProfileContext';
import paymentService from '../../services/paymentService';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  Award,
  Shield,
  Compass,
  LogOut,
  Mail,
  GraduationCap,
  Newspaper,
  Building2,
  Inbox,
  ChevronDown,
  X,
  FileCheck2,
} from 'lucide-react';

export const BackofficeSidebar = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const { company } = useCompanyProfile();
  const location = useLocation();

  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const [unreadInquiryCount, setUnreadInquiryCount] = useState(0);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    keuangan: true,
    akademik: true,
    konten: true,
    pengaturan: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    // 1. Fetch pending payments count
    paymentService
      .getPendingPayments()
      .then((payments) => {
        const pending = (payments || []).filter((p) => p.status === 'PENDING_APPROVAL');
        setPendingPaymentCount(pending.length);
      })
      .catch(() => {});

    // 2. Fetch unread inquiries count
    apiClient
      .get(ENDPOINTS.ADMIN_CONTACTS, { params: { status: 'UNREAD' } })
      .then((res) => {
        setUnreadInquiryCount(res.unread_count ?? (res.data || []).length);
      })
      .catch(() => {});
  }, [location.pathname]);

  // Automatically expand accordion section when active route matches
  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/admin/payments')) {
      setOpenSections((prev) => ({ ...prev, keuangan: true }));
    } else if (
      p.includes('/admin/students') ||
      p.includes('/admin/teachers') ||
      p.includes('/admin/brevets') ||
      p.includes('/admin/certificates')
    ) {
      setOpenSections((prev) => ({ ...prev, akademik: true }));
    } else if (p.includes('/admin/blogs') || p.includes('/admin/contacts')) {
      setOpenSections((prev) => ({ ...prev, konten: true }));
    } else if (p.includes('/admin/email-templates') || p.includes('/admin/company-profile')) {
      setOpenSections((prev) => ({ ...prev, pengaturan: true }));
    }
  }, [location.pathname]);

  // Grouped Navigation Schema
  const menuGroups = [
    {
      key: 'keuangan',
      title: 'Keuangan & Transaksi',
      items: [
        {
          name: 'Verifikasi Pembayaran',
          path: '/admin/payments',
          icon: CreditCard,
          badge: pendingPaymentCount > 0 ? pendingPaymentCount : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold',
        },
      ],
    },
    {
      key: 'akademik',
      title: 'Akademik & Pengguna',
      items: [
        {
          name: 'Manajemen Mahasiswa',
          path: '/admin/students',
          icon: Users,
        },
        {
          name: 'Manajemen Pengajar',
          path: '/admin/teachers',
          icon: GraduationCap,
        },
        {
          name: 'Program & Silabus Brevet',
          path: '/admin/brevets',
          icon: BookOpen,
        },
        {
          name: 'Log & Audit Sertifikat',
          path: '/admin/certificates',
          icon: Award,
        },
      ],
    },
    {
      key: 'konten',
      title: 'Publikasi & Layanan Publik',
      items: [
        {
          name: 'Artikel & Wawasan Pajak',
          path: '/admin/blogs',
          icon: Newspaper,
        },
        {
          name: 'Inbox Konsultasi & Pesan',
          path: '/admin/contacts',
          icon: Inbox,
          badge: unreadInquiryCount > 0 ? unreadInquiryCount : null,
          badgeColor: 'bg-red-500 text-white font-bold',
        },
      ],
    },
    {
      key: 'pengaturan',
      title: 'Konfigurasi Sistem',
      items: [
        {
          name: 'Template Email Notifikasi',
          path: '/admin/email-templates',
          icon: Mail,
        },
        {
          name: 'Profil & Identitas Lembaga',
          path: '/admin/company-profile',
          icon: Building2,
        },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 border-r border-slate-900 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight uppercase">
              {company.short_name || 'NAC'} BACKOFFICE
            </div>
            <div className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">
              Portal Administrasi
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Profile Box */}
      <div className="p-3 sm:p-3.5 mx-3 my-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 shadow-inner">
          ADM
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="text-xs font-bold text-white truncate">Administrator Utama</div>
          <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@nactaxcenter.id'}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Superadmin Aktif
          </div>
        </div>
      </div>

      {/* Nav List with Accordions */}
      <div className="flex-1 px-3 py-1.5 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Standalone Dashboard Link */}
        <div>
          <NavLink
            to="/admin/dashboard"
            end
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-amber-700 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Ikhtisar & Metrik Utama</span>
            </div>
          </NavLink>
        </div>

        {/* Accordion Menu Groups */}
        {menuGroups.map((group) => {
          const isOpen = openSections[group.key];
          const hasActiveChild = group.items.some((it) => location.pathname === it.path);
          const totalGroupBadge = group.items.reduce((acc, it) => acc + (it.badge ? Number(it.badge) : 0), 0);

          return (
            <div
              key={group.key}
              className={`rounded-xl border transition-colors ${
                hasActiveChild
                  ? 'border-slate-800/90 bg-slate-900/30'
                  : 'border-transparent hover:border-slate-800/40'
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => toggleSection(group.key)}
                className="w-full flex items-center justify-between px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasActiveChild ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span className="truncate">{group.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {totalGroupBadge > 0 && !isOpen && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950">
                      {totalGroupBadge}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Accordion Body Items */}
              {isOpen && (
                <div className="space-y-1 pb-1 pt-0.5 px-1 animate-in fade-in duration-150">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-red-600 to-amber-700 text-white font-semibold shadow-md'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/90'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              item.badgeColor || 'bg-red-500 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="p-3 border-t border-slate-900 space-y-1 bg-slate-950/80">
        <NavLink
          to="/"
          onClick={() => onClose && onClose()}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
        >
          <Compass className="w-4 h-4 text-slate-400" />
          <span>Lihat Website Publik</span>
        </NavLink>
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition text-left font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sesi Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 h-full">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
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
