import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.ts';
import { AdminUser } from '../../types.ts';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToSite }) => {
  const [email, setEmail] = useState('moseseawotimiro2008@gmail.com');
  const [password, setPassword] = useState('orez2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (role: 'owner' | 'admin') => {
    if (role === 'owner') {
      setEmail('moseseawotimiro2008@gmail.com');
      setPassword('orez2026!');
    } else {
      setEmail('admin@orez.studio');
      setPassword('orezadmin');
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-[#F5F1EA] flex flex-col justify-center items-center px-4 py-12 relative bg-subtle-grid">
      {/* Back button */}
      <button
        onClick={onBackToSite}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#F5F1EA]/60 hover:text-[#E8746A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Portfolio</span>
      </button>

      <div className="w-full max-w-md bg-[#181818] border border-[#F5F1EA]/15 rounded-md p-8 sm:p-10 shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#8B1E1E]/20 border border-[#8B1E1E] flex items-center justify-center mx-auto mb-4 text-[#E8746A]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-display font-medium text-2xl sm:text-3xl tracking-tight text-[#F5F1EA]">
            ORez STUdio
          </h1>
          <p className="text-xs font-sans uppercase tracking-widest text-[#F5F1EA]/50 mt-1">
            Studio Administration & Management
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-sm bg-[#8B1E1E]/20 border border-[#8B1E1E] text-xs text-[#E8746A] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/60 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5F1EA]/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@orez.studio"
                className="w-full pl-10 pr-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A] transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/60 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5F1EA]/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/15 text-sm text-[#F5F1EA] focus:outline-none focus:border-[#E8746A] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#F5F1EA] text-[#141414] font-semibold text-xs uppercase tracking-widest hover:bg-[#E8746A] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg mt-2"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Preset quick test shortcuts */}
        <div className="mt-8 pt-6 border-t border-[#F5F1EA]/10">
          <div className="text-[10px] font-sans uppercase tracking-wider text-[#F5F1EA]/40 mb-3 text-center">
            Demo Credentials Quick Select
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCredentials('owner')}
              className="p-2 rounded-sm border border-[#F5F1EA]/10 bg-[#141414] hover:border-[#8B1E1E] text-left transition-colors"
            >
              <div className="text-[11px] font-semibold text-[#E8746A]">Owner Role</div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/50 truncate">
                moseseawotimiro...
              </div>
            </button>
            <button
              type="button"
              onClick={() => setCredentials('admin')}
              className="p-2 rounded-sm border border-[#F5F1EA]/10 bg-[#141414] hover:border-[#8B1E1E] text-left transition-colors"
            >
              <div className="text-[11px] font-semibold text-[#F5F1EA]/80">Admin Role</div>
              <div className="text-[10px] font-sans text-[#F5F1EA]/50 truncate">
                admin@orez.studio
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
