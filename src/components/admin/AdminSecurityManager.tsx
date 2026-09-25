import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { api } from '../../api/client';
import {
  Shield,
  KeyRound,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  Info,
} from 'lucide-react';

interface AdminSecurityManagerProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminSecurityManager: React.FC<AdminSecurityManagerProps> = ({ showToast }) => {
  const { adminUser, setAdminUser, logoutAdmin, navigate } = usePortfolio();

  // Username form state
  const [newUsername, setNewUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Handle Username Change
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    setUsernameSuccess(null);

    const trimmed = newUsername.trim();
    if (!trimmed) {
      setUsernameError('Please enter a new username.');
      return;
    }

    if (trimmed.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
      return;
    }

    if (trimmed.toLowerCase() === adminUser?.toLowerCase()) {
      setUsernameError('The new username is the same as the current username.');
      return;
    }

    try {
      setUpdatingUsername(true);
      const res = await api.changeUsername(trimmed);
      setAdminUser(res.username);
      setUsernameSuccess(`Username successfully changed to "${res.username}".`);
      showToast(`Username changed to "${res.username}"`, 'success');
      setNewUsername('');
    } catch (err: any) {
      const msg = err.message || 'Failed to update username.';
      setUsernameError(msg);
      showToast(msg, 'error');
    } finally {
      setUpdatingUsername(false);
    }
  };

  // Handle Password Change
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    try {
      setUpdatingPassword(true);
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password successfully updated! Your admin access is now secured with the new password.');
      showToast('Password updated successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.message || 'Failed to update password. Please check your current password.';
      setPasswordError(msg);
      showToast(msg, 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-xs font-sans text-neutral-900">
      {/* Header Banner */}
      <div className="bg-neutral-950 text-white p-5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-800 rounded-lg text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Admin Security & Password Manager</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Change admin username and password to keep your portfolio CMS completely secure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Admin: {adminUser || 'Admin'}</span>
          </span>
        </div>
      </div>

      {/* Security Notice Card */}
      <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-lg flex items-start gap-3 text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-semibold text-blue-950">
            অ্যাডমিন নিরাপত্তা ও এক্সেস নিয়ন্ত্রণ (Security Protection)
          </div>
          <p className="text-blue-800 leading-relaxed">
            আপনার অ্যাডমিন প্যানেল এখন সুরক্ষিত। সঠিক ইউজারনেম এবং পাসওয়ার্ড ছাড়া কেউ এই প্যানেলে ঢুকতে পারবে না।
            নিচের ফর্মগুলো ব্যবহার করে আপনি যেকোনো সময় আপনার ইউজারনেম ও পাসওয়ার্ড পরিবর্তন করতে পারেন।
          </p>
        </div>
      </div>

      {/* Two Column Grid for Username and Password Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* 1. CHANGE USERNAME FORM */}
        <div className="bg-white border border-neutral-200/90 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <User className="w-4 h-4 text-neutral-700" />
            <h3 className="font-semibold text-sm text-neutral-950">Change Admin Username</h3>
          </div>

          <div className="bg-neutral-50 p-3 rounded border border-neutral-100 space-y-1">
            <div className="text-[11px] text-neutral-500">Current Logged-in Username:</div>
            <div className="text-sm font-semibold text-neutral-900 font-mono">
              {adminUser || 'olivabiswas'}
            </div>
          </div>

          {usernameSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{usernameSuccess}</span>
            </div>
          )}

          {usernameError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{usernameError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <div>
              <label className="block text-neutral-700 font-medium mb-1.5">
                New Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="e.g. olivabiswas or your-name"
                className="w-full border border-neutral-200 p-2.5 rounded focus:outline-hidden focus:border-neutral-900 font-mono text-xs"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Minimum 3 characters. Use letters, numbers, or dashes.
              </span>
            </div>

            <button
              type="submit"
              disabled={updatingUsername}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium py-2.5 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingUsername ? (
                <span>Updating Username...</span>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>Update Username</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 2. CHANGE PASSWORD FORM */}
        <div className="bg-white border border-neutral-200/90 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <KeyRound className="w-4 h-4 text-neutral-700" />
            <h3 className="font-semibold text-sm text-neutral-950">Change Admin Password</h3>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full border border-neutral-200 p-2.5 pr-9 rounded focus:outline-hidden focus:border-neutral-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1.5">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border border-neutral-200 p-2.5 pr-9 rounded focus:outline-hidden focus:border-neutral-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-neutral-700 font-medium mb-1.5">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full border border-neutral-200 p-2.5 pr-9 rounded focus:outline-hidden focus:border-neutral-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium py-2.5 rounded text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {updatingPassword ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Logout & Testing Card */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-neutral-600">
        <div>
          <div className="font-semibold text-neutral-900 text-xs">
            Want to test your new credentials?
          </div>
          <div className="text-[11px] text-neutral-500">
            Sign out of the admin panel and log in again with your updated username and password.
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logoutAdmin();
            navigate('/admin/login');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 hover:bg-white text-neutral-800 rounded font-medium transition-colors cursor-pointer text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out & Test Login</span>
        </button>
      </div>
    </div>
  );
};
