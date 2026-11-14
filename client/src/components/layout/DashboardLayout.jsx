import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 overflow-hidden relative transition-colors duration-200">
      {/* Ambient Atmospheric Lighting Blobs */}
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-10 left-10 w-80 h-80 bg-accent-violet/10 dark:bg-accent-violet/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-72 h-72 bg-accent-cyan/8 dark:bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Top Navigation - Pinned at top */}
      <div className="shrink-0 z-40">
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </div>

      {/* Body Canvas - fills remaining viewport height, sidebar fixed on left, content scrolls */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <Sidebar isMobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

