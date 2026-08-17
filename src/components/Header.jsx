import React from 'react';
import { LogOut, UserCheck } from 'lucide-react';

export const Header = ({ currentUser, onLogout }) => {
  return (
    <header className="olive-header-bg text-white sticky top-0 z-40 shadow-md border-b border-emerald-900/40">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* LOGO VE BAŞLIK */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="relative group flex items-center justify-center flex-shrink-0">
            {/* Glow Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 rounded-2xl blur-xs opacity-75"></div>

            {/* Logo Kutusu */}
            <div className="relative bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 p-2 rounded-xl border border-amber-300/40 shadow-xl flex items-center justify-center">
              <svg className="w-7 h-7 drop-shadow-md" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#header-logo-bg)" stroke="url(#header-logo-border)" strokeWidth="1.5" />
                <rect x="7" y="10" width="18" height="13" rx="2.5" stroke="#FDE68A" strokeWidth="1.8" fill="none" />
                <path d="M7 14.5H25" stroke="#FDE68A" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.7" />
                <path d="M10 19.5L14 16L17.5 17.5L22.5 12" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.5 12H22.5V15" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="21" cy="18.5" r="2.2" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="0.8" />
                <path d="M21 17.3V19.7M20.2 18.5H21.8" stroke="#78350F" strokeWidth="0.6" strokeLinecap="round" />
                <defs>
                  <linearGradient id="header-logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#064E3B" />
                    <stop offset="1" stopColor="#022C22" />
                  </linearGradient>
                  <linearGradient id="header-logo-border" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-black tracking-wider text-white leading-none uppercase drop-shadow-sm">
              HESAP TAKİP
            </h1>
            <p className="text-[10px] sm:text-[11px] text-amber-200/90 font-bold tracking-wide mt-0.5">
              Cari & Finans Sistemi
            </p>
          </div>
        </div>

        {/* SAĞ TARAF: KULLANICI BİLGİSİ VE ÇIKIŞ BUTONU */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] text-emerald-200 font-semibold truncate max-w-[140px]">
                {currentUser.email}
              </span>
              <span className="text-[9px] text-amber-300 font-medium flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Yetkili Girişi
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Oturumu Kapat / Çıkış Yap"
              className="bg-emerald-950/70 hover:bg-red-950/80 border border-emerald-700/60 hover:border-red-500/50 text-emerald-200 hover:text-red-200 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <LogOut size={15} />
              <span className="hidden xs:inline text-[11px]">Çıkış</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
