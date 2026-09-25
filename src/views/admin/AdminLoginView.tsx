import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../api/client';
import { Lock, ArrowLeft } from 'lucide-react';

export const AdminLoginView: React.FC = () => {
  const { loginAdmin, navigate, showToast, formatUrl } = usePortfolio();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login(username, password);
      if (res.token) {
        loginAdmin(res.token, res.username || username);
        showToast('Welcome back to the Studio CMS', 'success');
        navigate('/admin');
      } else {
        setError('Authentication failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-white border border-neutral-200 text-neutral-900 mb-3 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-normal text-neutral-950 tracking-tight">
            Oliva Biswas Studio
          </h2>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-sans">
            CMS Portal
          </p>
        </div>

        <div className="bg-white py-8 px-6 sm:px-10 border border-neutral-200/80 shadow-xs">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-2 border-red-500 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
            <div>
              <label className="block text-neutral-600 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden focus:border-neutral-900 transition-colors"
                placeholder="olivabiswas"
              />
            </div>

            <div>
              <label className="block text-neutral-600 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden focus:border-neutral-900 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-950 text-white py-2.5 text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
            <a
              href={formatUrl('/')}
              onClick={e => {
                e.preventDefault();
                navigate('/');
              }}
              className="inline-flex items-center gap-1 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </a>
            <span className="text-[11px]">Default: olivabiswas / oliva23</span>
          </div>
        </div>
      </div>
    </div>
  );
};
