import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { API_BASE } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin security key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('neffto_admin_token', data.token);
        localStorage.setItem('neffto_admin_user', JSON.stringify(data.user || { name: 'Admin' }));
        navigate('/');
      } else {
        setError(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      // Fallback local authentication check if backend is offline
      if (password === 'neffto@admin2026') {
        const token = `offline-token-${Date.now()}`;
        localStorage.setItem('neffto_admin_token', token);
        localStorage.setItem('neffto_admin_user', JSON.stringify({ name: 'Admin', role: 'admin' }));
        navigate('/');
      } else {
        setError('Connection failed and password does not match default key');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020e24] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#042558]/60 blur-[140px] pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-80 h-80 bg-[#5482b4]/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-[#042558]/40 border border-white/10 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-8">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5482b4] to-[#042558] flex items-center justify-center mx-auto shadow-xl border border-white/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Neffto Solution
            </h1>
            <p className="text-xs text-white/60">
              Admin Blog Studio & Content Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#020e24]/70 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#5482b4] focus:ring-2 focus:ring-[#5482b4]/20 transition"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-white/40 flex justify-between pt-1">
                <span>Default key: <code className="text-[#c3e9fe]">neffto@admin2026</code></span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#5482b4] hover:bg-[#5482b4]/90 text-white font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#5482b4]/25 transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Access Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-white/40 mt-6">
          &copy; {new Date().getFullYear()} Neffto Solution. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
