import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  PortfolioData,
  SiteSettings,
  Category,
  Artwork,
  Exhibition,
  AboutContent,
  CVDoc,
  SocialLink,
} from '../types';
import { api, getStoredToken, getStoredUsername, clearStoredToken } from '../api/client';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Helper to get Vite base path without trailing slash, e.g. '/portfoli1' or ''
export const getAppBasePath = (): string => {
  const base = import.meta.env.BASE_URL || '/';
  return base === '/' ? '' : base.replace(/\/+$/, '');
};

// Converts full window.location.pathname (e.g. '/portfoli1/about') into app route (e.g. '/about')
export const normalizeAppPath = (pathname: string): string => {
  const basePath = getAppBasePath();
  let path = (pathname || '/').split('?')[0].split('#')[0];
  if (basePath && path.startsWith(basePath)) {
    path = path.slice(basePath.length);
  }
  if (!path || path === '') return '/';
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
};

// Converts app route (e.g. '/about') into full browser path (e.g. '/portfoli1/about')
export const formatAppUrl = (route: string): string => {
  const basePath = getAppBasePath();
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  return `${basePath}${cleanRoute}`;
};

interface PortfolioContextType {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  reloadData: () => Promise<void>;
  // Auth state
  isAdmin: boolean;
  adminUser: string | null;
  setAdminUser: (user: string | null) => void;
  loginAdmin: (token: string, username: string) => void;
  logoutAdmin: () => Promise<void>;
  // Navigation & Cover State
  currentPath: string;
  navigate: (path: string) => void;
  formatUrl: (route: string) => string;
  hasEntered: boolean;
  setHasEntered: (val: boolean) => void;
  enterPortfolio: () => void;
  // Year & Category Filters for Archive
  selectedYear: string | null;
  setSelectedYear: (year: string | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  clearFilters: () => void;
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  const [selectedYear, setSelectedYearState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(null);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return normalizeAppPath(window.location.pathname);
  });

  const [hasEntered, setHasEntered] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navigate = useCallback((path: string) => {
    const [pathPart, ...queryParts] = path.split('?');
    const queryString = queryParts.length > 0 ? `?${queryParts.join('?')}` : '';
    const targetRoute = normalizeAppPath(pathPart);
    const fullUrl = `${formatAppUrl(targetRoute)}${queryString}`;
    if (window.location.pathname + window.location.search !== fullUrl) {
      window.history.pushState({}, '', fullUrl);
    }
    setCurrentPath(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const enterPortfolio = useCallback(() => {
    setHasEntered(true);
    setSelectedYearState(null);
    setSelectedCategoryState(null);
    const fullUrl = formatAppUrl('/');
    if (window.location.pathname !== fullUrl) {
      window.history.pushState({}, '', fullUrl);
    }
    setCurrentPath('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizeAppPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getPublicData();
      // If admin token is present, try loading inquiries/messages as well
      const token = getStoredToken();
      if (token) {
        try {
          const msgs = await api.getMessages();
          res.inquiries = msgs;
          res.messages = msgs;
        } catch {
          // ignore if unauthorized
        }
      }
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch public portfolio data:', err);
      setError(err.message || 'Failed to load portfolio content');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth session
  const verifyAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setIsAdmin(false);
      setAdminUser(null);
      return;
    }
    try {
      const me = await api.getMe();
      if (me.authenticated) {
        setIsAdmin(true);
        setAdminUser(me.username);
      } else {
        clearStoredToken();
        setIsAdmin(false);
        setAdminUser(null);
      }
    } catch {
      const storedToken = getStoredToken();
      const storedUser = getStoredUsername();
      if (storedToken && storedUser) {
        setIsAdmin(true);
        setAdminUser(storedUser);
      } else {
        clearStoredToken();
        setIsAdmin(false);
        setAdminUser(null);
      }
    }
  }, []);

  const loginAdmin = useCallback((_token: string, username: string) => {
    setIsAdmin(true);
    setAdminUser(username);
    showToast(`Welcome back, ${username}`, 'success');
  }, [showToast]);

  const logoutAdmin = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      clearStoredToken();
      setIsAdmin(false);
      setAdminUser(null);
      setHasEntered(true);
      showToast('Logged out successfully. Returned to website.', 'info');
      navigate('/');
    }
  }, [navigate, showToast]);

  const setSelectedYear = useCallback((year: string | null) => {
    setSelectedYearState(year);
    if (year !== null && normalizeAppPath(window.location.pathname) !== '/') {
      navigate('/');
    }
  }, [navigate]);

  const setSelectedCategory = useCallback((cat: string | null) => {
    setSelectedCategoryState(cat);
    if (cat !== null && normalizeAppPath(window.location.pathname) !== '/') {
      navigate('/');
    }
  }, [navigate]);

  const clearFilters = useCallback(() => {
    setSelectedYearState(null);
    setSelectedCategoryState(null);
    if (normalizeAppPath(window.location.pathname) !== '/') {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    refreshData();
    verifyAuth();
  }, [refreshData, verifyAuth]);

  return (
    <PortfolioContext.Provider
      value={{
        data,
        loading,
        error,
        refreshData,
        reloadData: refreshData,
        isAdmin,
        adminUser,
        setAdminUser,
        loginAdmin,
        logoutAdmin,
        currentPath,
        navigate,
        formatUrl: formatAppUrl,
        hasEntered,
        setHasEntered,
        enterPortfolio,
        selectedYear,
        setSelectedYear,
        selectedCategory,
        setSelectedCategory,
        clearFilters,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
