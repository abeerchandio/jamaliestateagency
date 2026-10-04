import React, { useState } from 'react';
import { X, Lock, Mail, Key, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { adminLogin, adminSendPasswordReset } from '../../firebase/authService';
import { isFirebaseConfigured } from '../../firebase/config';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenConfigModal?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenConfigModal
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isFirebaseConfigured()) {
      setError('Firebase is not yet configured with your project credentials. Please connect Firebase first.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }

    setLoading(true);

    try {
      if (isResetMode) {
        await adminSendPasswordReset(email);
        setSuccessMsg('Password reset email sent! Please check your inbox.');
        setLoading(false);
      } else {
        if (!password) {
          setError('Please enter your password.');
          setLoading(false);
          return;
        }
        await adminLogin(email, password);
        setLoading(false);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-700 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">
            Nawabshah Estate Agency
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900">
          {isResetMode ? 'Reset Administrator Password' : 'Admin Portal Login'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          {isResetMode
            ? 'Enter your admin email to receive a password reset link.'
            : 'Access the property management dashboard, inquiries, and listings.'}
        </p>

        {!isFirebaseConfigured() && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Firebase Credentials Required</span>
            </div>
            <p className="text-slate-600">
              Your Firebase project credentials are not yet connected.
            </p>
            {onOpenConfigModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConfigModal();
                }}
                className="text-emerald-700 font-bold underline hover:text-emerald-800 cursor-pointer block mt-1"
              >
                Click here to paste your Firebase Configuration
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abeerachandio@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {!isResetMode && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-[11px] text-emerald-700 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required={!isResetMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-70 transition-colors"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : isResetMode ? (
                <span>Send Password Reset Email</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log In to Admin Dashboard</span>
                </>
              )}
            </button>

            {isResetMode && (
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 text-center block"
              >
                Back to Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
