import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  ExternalLink,
  PlusCircle,
  LayoutDashboard,
  Sparkles,
  Database,
  Cloud,
} from 'lucide-react';
import { WEBSITE_BASE } from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('neffto_admin_token');
    localStorage.removeItem('neffto_admin_user');
    navigate('/login');
  };

  const user = JSON.parse(
    localStorage.getItem('neffto_admin_user') || '{"name":"Admin"}'
  );

  const isDashboard = location.pathname === '/';
  const isNewPost = location.pathname === '/blogs/new';

  return (
    <header className="sticky top-0 z-50 bg-[#020e24]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between transition-all">
      {/* Brand & Nav */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#042558] via-[#5482b4] to-[#c3e9fe] flex items-center justify-center font-extrabold text-white text-lg shadow-xl shadow-[#5482b4]/20 border border-white/20 group-hover:scale-105 transition-transform duration-300">
              N
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#020e24] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-white via-white/90 to-[#c3e9fe] bg-clip-text text-transparent">
                Neffto Studio
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#5482b4]/20 text-[#c3e9fe] border border-[#5482b4]/40 shadow-xs">
                PRO CMS
              </span>
            </div>
            <div className="text-[11px] text-white/50 flex items-center gap-1.5">
              <span>Cloud & Blog Control Suite</span>
            </div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-white/10">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isDashboard
                ? 'bg-[#5482b4]/20 text-white border border-[#5482b4]/40 shadow-xs'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#5482b4]" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/blogs/new"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isNewPost
                ? 'bg-[#5482b4] text-white shadow-lg shadow-[#5482b4]/30'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#c3e9fe]" />
            <span>Write New Post</span>
          </Link>
        </nav>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live System Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#042558]/40 border border-white/10 text-[11px] text-white/70">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="flex items-center gap-1 font-medium text-white/80">
            <Database className="w-3 h-3 text-[#5482b4]" /> Atlas
            <span className="text-white/30">•</span>
            <Cloud className="w-3 h-3 text-[#c3e9fe]" /> Cloudinary
          </span>
        </div>

        {/* View Live Website Button */}
        <a
          href={`${WEBSITE_BASE}/blogs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition shadow-sm"
          title="Open live public blog on website"
        >
          <span>Live Website</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#5482b4]" />
        </a>

        {/* User Avatar Badge */}
        <div className="flex items-center gap-2 pl-2 sm:border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5482b4] to-[#042558] border border-[#5482b4]/40 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-white/90">
            {user.name || 'Admin'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 text-white/70 hover:text-red-400 transition cursor-pointer"
          title="Sign out of Admin Studio"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
