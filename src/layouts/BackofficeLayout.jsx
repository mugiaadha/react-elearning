import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import BackofficeSidebar from '../components/backoffice/BackofficeSidebar';
import BackofficeTopbar from '../components/backoffice/BackofficeTopbar';
import RoleSwitcher from '../components/common/RoleSwitcher';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  GraduationCap,
  Award,
} from 'lucide-react';

export const BackofficeLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminMobileNavItems = [
    {
      label: 'Ikhtisar',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Pembayaran',
      path: '/admin/payments',
      icon: CreditCard,
    },
    {
      label: 'Siswa',
      path: '/admin/students',
      icon: Users,
    },
    {
      label: 'Pengajar',
      path: '/admin/teachers',
      icon: GraduationCap,
    },
    {
      label: 'Sertifikat',
      path: '/admin/certificates',
      icon: Award,
    },
  ];

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
      <RoleSwitcher />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <BackofficeSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-900">
          <BackofficeTopbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8 bg-slate-900 overflow-y-auto">
            <Outlet />
          </main>

          {/* Mobile Bottom Navigation Bar for Admin */}
          <nav
            aria-label="Navigasi Bawah Admin Mobile"
            className="md:hidden shrink-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-1.5 py-1.5 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center justify-around">
              {adminMobileNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-w-[56px] ${
                        isActive
                          ? 'text-amber-400 font-extrabold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={`p-1 rounded-lg transition-all ${
                            isActive
                              ? 'bg-amber-500/15 text-amber-400 scale-105'
                              : 'text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[64px] leading-tight">
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default BackofficeLayout;
