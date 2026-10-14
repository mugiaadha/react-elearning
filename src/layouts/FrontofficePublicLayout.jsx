import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import RoleSwitcher from '../components/common/RoleSwitcher';

export const FrontofficePublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <RoleSwitcher />
      <Navbar />
      <main className="flex-1 min-h-[calc(100vh-140px)] flex flex-col justify-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default FrontofficePublicLayout;
