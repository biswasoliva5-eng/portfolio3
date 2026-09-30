import React, { useEffect, useState } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { HomeView } from './views/HomeView';
import { GalleryView } from './views/GalleryView';
import { ArtworkDetailView } from './views/ArtworkDetailView';
import { AboutView } from './views/AboutView';
import { ExhibitionsView } from './views/ExhibitionsView';
import { CVView } from './views/CVView';
import { ContactView } from './views/ContactView';
import { CoverView } from './views/CoverView';
import { AdminView } from './views/admin/AdminView';
import { AdminLoginView } from './views/admin/AdminLoginView';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, data, loading, clearFilters, navigate, hasEntered, isAdmin } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Update browser document title based on current view
  useEffect(() => {
    const baseTitle = data?.settings.siteTitle || 'Oliva Biswas';
    if (currentPath === '/') {
      document.title = baseTitle;
    } else if (currentPath.startsWith('/admin')) {
      document.title = `Admin | Oliva Biswas Studio`;
    } else if (currentPath === '/about') {
      document.title = `About | Oliva Biswas`;
    } else if (currentPath === '/exhibitions') {
      document.title = `Exhibitions | Oliva Biswas`;
    } else if (currentPath === '/cv') {
      document.title = `CV | Oliva Biswas`;
    } else if (currentPath === '/contact') {
      document.title = `Contact | Oliva Biswas`;
    } else if (currentPath.startsWith('/artwork/')) {
      const slug = currentPath.replace('/artwork/', '');
      const art = data?.artworks.find(a => a.slug === slug);
      document.title = art ? `${art.title} (${art.year}) | Oliva Biswas` : `Artwork | Oliva Biswas`;
    } else {
      const catSlug = currentPath.replace(/^\//, '');
      const cat = data?.categories.find(c => c.slug === catSlug);
      document.title = cat ? `${cat.name} | Oliva Biswas` : baseTitle;
    }
  }, [currentPath, data]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-white flex flex-col md:flex-row">
        {/* Skeleton Sidebar */}
        <div className="hidden md:block w-48 lg:w-56 shrink-0 pt-12 pb-10 pl-8 lg:pl-12 pr-4 space-y-8">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-neutral-200 animate-pulse rounded-xs" />
            <div className="h-3 w-20 bg-neutral-100 animate-pulse rounded-xs" />
          </div>
          <div className="space-y-3 pt-6">
            <div className="h-3 w-24 bg-neutral-200 animate-pulse rounded-xs" />
            <div className="h-3 w-28 bg-neutral-100 animate-pulse rounded-xs" />
            <div className="h-3 w-20 bg-neutral-100 animate-pulse rounded-xs" />
            <div className="h-3 w-16 bg-neutral-100 animate-pulse rounded-xs" />
          </div>
        </div>

        {/* Skeleton Gallery Grid */}
        <main className="flex-1 pt-8 md:pt-12 pb-24 px-6 md:px-10 lg:px-14">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
            <div className="h-6 w-36 bg-neutral-200 animate-pulse rounded-xs" />
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-neutral-400 animate-ping" />
              <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase">
                Loading Studio Works...
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex flex-col space-y-3">
                <div className="aspect-4/5 w-full bg-neutral-100 animate-pulse rounded-xs" />
                <div className="h-4 w-3/4 bg-neutral-200 animate-pulse rounded-xs" />
                <div className="h-3 w-1/2 bg-neutral-100 animate-pulse rounded-xs" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // 1. Admin Routes (rendered in its own self-contained view with authentication check)
  if (currentPath === '/admin/login') {
    if (isAdmin) {
      return (
        <>
          <AdminView />
          <ToastContainer />
        </>
      );
    }
    return (
      <>
        <AdminLoginView />
        <ToastContainer />
      </>
    );
  }

  if (currentPath.startsWith('/admin')) {
    if (!isAdmin) {
      return (
        <>
          <AdminLoginView />
          <ToastContainer />
        </>
      );
    }
    return (
      <>
        <AdminView />
        <ToastContainer />
      </>
    );
  }

  // Cover Screen Route (Full-Screen Hero Presentation)
  // Shows full-screen cover on initial landing until user clicks ENTER, or if navigated to /cover
  const isCover = currentPath === '/cover' || (currentPath === '/' && !hasEntered);

  if (isCover) {
    return (
      <>
        <CoverView />
        <ToastContainer />
      </>
    );
  }

  // 2. Public Routes (Inside Minimal Sidebar Layout)
  let mainView: React.ReactNode = null;

  if (currentPath === '/') {
    mainView = <HomeView />;
  } else if (currentPath === '/about') {
    mainView = <AboutView />;
  } else if (currentPath === '/exhibitions') {
    mainView = <ExhibitionsView />;
  } else if (currentPath === '/cv') {
    mainView = <CVView />;
  } else if (currentPath === '/contact') {
    mainView = <ContactView />;
  } else if (currentPath.startsWith('/artwork/')) {
    const slug = currentPath.replace('/artwork/', '');
    mainView = <ArtworkDetailView slug={slug} />;
  } else {
    // Check if category slug matches
    const catSlug = currentPath.replace(/^\//, '');
    mainView = <GalleryView categorySlug={catSlug} />;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            clearFilters();
            navigate('/');
          }}
          className="text-left"
        >
          <span className="font-normal text-base text-neutral-950 block leading-tight">
            {data?.settings.artistName || 'Oliva Biswas'}
          </span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-neutral-700 hover:text-black"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-20 bg-white px-8 py-6 overflow-y-auto border-b border-neutral-200">
          <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Left Sidebar (Sticky, clean, minimal like reference) */}
      <div className="hidden md:block w-48 lg:w-56 shrink-0 sticky top-0 h-screen overflow-y-auto pt-12 pb-10 pl-8 lg:pl-12 pr-4 border-r border-transparent">
        <Sidebar />
      </div>

      {/* Main Content Area (Right) */}
      <main className="flex-1 min-w-0 min-h-screen pt-8 md:pt-12 pb-24 px-6 md:px-10 lg:px-14">
        {mainView}
      </main>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}
