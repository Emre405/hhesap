import React, { useState } from 'react';
import { loginWithEmail, getFirebaseAuthErrorMessage } from '../utils/firebase';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Lütfen E-posta adresinizi giriniz.');
      return;
    }

    if (!password) {
      setErrorMsg('Lütfen şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await loginWithEmail(email, password, rememberMe);
      if (onLoginSuccess) {
        onLoginSuccess(userCredential.user);
      }
    } catch (err) {
      console.error('Login error:', err);
      const friendlyMessage = getFirebaseAuthErrorMessage(err.code);
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Arka Plan Işık Efektleri */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* LOGO VE BAŞLIK */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center relative group mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 rounded-3xl blur-sm opacity-80 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 p-4 rounded-2xl border border-amber-300/40 shadow-2xl">
              <svg className="w-12 h-12 drop-shadow-md" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#login-bg-simple)" stroke="url(#login-border-simple)" strokeWidth="1.5" />
                <rect x="7" y="10" width="18" height="13" rx="2.5" stroke="#FDE68A" strokeWidth="1.8" fill="none" />
                <path d="M7 14.5H25" stroke="#FDE68A" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.7" />
                <path d="M10 19.5L14 16L17.5 17.5L22.5 12" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.5 12H22.5V15" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="21" cy="18.5" r="2.2" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="0.8" />
                <path d="M21 17.3V19.7M20.2 18.5H21.8" stroke="#78350F" strokeWidth="0.6" strokeLinecap="round" />
                <defs>
                  <linearGradient id="login-bg-simple" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#064E3B" />
                    <stop offset="1" stopColor="#022C22" />
                  </linearGradient>
                  <linearGradient id="login-border-simple" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase drop-shadow-md">
            HESAP TAKİP
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 font-semibold tracking-wide mt-1">
            Zeytin & Zeytinyağı Cari ve Finans Sistemi
          </p>
        </div>

        {/* GİRİŞ KARTI */}
        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/70">
          {/* Hata Bildirimi */}
          {errorMsg && (
            <div className="mb-4 bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-200 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Giriş Formu */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-posta Alanı */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@gmail.com"
                  autoComplete="email"
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Şifre Alanı */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Beni Hatırla */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/40"
                />
                <span>Beni Hatırla</span>
              </label>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Giriş Yapılıyor...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sisteme Giriş Yap</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
