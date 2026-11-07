import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalTopbar from '../components/portal/PortalTopbar';
import RoleSwitcher from '../components/common/RoleSwitcher';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CreditCard,
  GraduationCap,
  Users,
} from 'lucide-react';

export const FrontofficePortalLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  const studentNavItems = [
    {
      label: 'Beranda',
      path: '/dashboard/student',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Kursus',
      path: '/dashboard/student/my-courses',
      icon: BookOpen,
    },
    {
      label: 'Belajar',
      path: `/dashboard/student/course/${user?.active_brevet?.slug || 'brevet-ab-terpadu'}`,
      icon: GraduationCap,
      highlight: true,
    },
    {
      label: 'Sertifikat',
      path: '/dashboard/student/certificates',
      icon: Award,
    },
    {
      label: 'Tagihan',
      path: '/dashboard/student/transactions',
      icon: CreditCard,
    },
  ];

  const teacherNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard/teacher',
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: 'Kurikulum',
      path: '/dashboard/teacher/courses',
      icon: BookOpen,
    },
    {
      label: 'Mahasiswa',
      path: '/dashboard/teacher/students',
      icon: Users,
    },
  ];

  const mobileNavItems = isStudent ? studentNavItems : teacherNavItems;

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-100 overflow-hidden">
      <RoleSwitcher />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <PortalSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-100 overflow-hidden">
          <PortalTopbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
            <Outlet />
          </main>

          {/* Mobile Bottom Navigation Bar */}
          {user && (
            <nav
              aria-label="Navigasi Bawah Mobile"
              className="md:hidden shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5 pb-safe z-30 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-around">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all min-w-[56px] ${
                          isActive
                            ? item.highlight
                              ? 'text-nac-primary bg-sky-50 font-extrabold'
                              : 'text-nac-primary font-extrabold'
                            : 'text-slate-400 hover:text-slate-700'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`p-1 rounded-lg transition-all ${
                              isActive
                                ? 'bg-nac-primary/10 text-nac-primary scale-105'
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
          )}
        </div>
      </div>
    </div>
  );
};

export default FrontofficePortalLayout;
