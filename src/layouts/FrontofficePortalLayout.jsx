import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PortalSidebar from '../components/portal/PortalSidebar';
import PortalTopbar from '../components/portal/PortalTopbar';
import RoleSwitcher from '../components/common/RoleSwitcher';

export const FrontofficePortalLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      <RoleSwitcher />
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <PortalSidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-100 overflow-hidden">
          <PortalTopbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default FrontofficePortalLayout;
