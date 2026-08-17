import React, { useState } from 'react';
import {
  loginWithEmail,
  resetPassword,
  getFirebaseAuthErrorMessage,
  isFirebaseConfigured,
  saveCustomFirebaseConfig,
  getStoredFirebaseConfig
} from '../utils/firebase';
import { Mail, Lock, Eye, EyeOff, LogIn, KeyRound, AlertCircle, CheckCircle2, Settings, HelpCircle, Shield, ArrowRight } from 'lucide-react';

export const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Şifremi Unuttum Modalı
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ text: '', type: '' });

  // Firebase Yapılandırma Modalı (Kullanıcı dilerse tarayıcıdan da anahtarları girebilir)
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configInput, setConfigInput] = useState(() => {
    const current = getStoredFirebaseConfig();
    return current.apiKey ? JSON.stringify(current, null, 2) : '';
  });
  const [configError, setConfigError] = useState('');

  const configured = isFirebaseConfigured();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!configured) {
      setErrorMsg('Firebase bağlantı ayarları henüz girilmemiş. Lütfen aşağıdaki "Firebase Ayarları" butonuna tıklayarak anahtarlarınızı girin.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Lütfen Gmail veya e-posta adresinizi giriniz.');
      return;
    }

    if (!password) {
      setErrorMsg('Lütfen şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await loginWithEmail(email, password, rememberMe);
      setSuccessMsg('Giriş başarılı! Yönlendiriliyorsunuz...');
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setForgotMsg({ text: '', type: '' });

    if (!forgotEmail.trim()) {
      setForgotMsg({ text: 'Lütfen kayıtlı e-posta adresinizi yazınız.', type: 'error' });
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail);
      setForgotMsg({
        text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol ediniz.',
        type: 'success'
      });
    } catch (err) {
      setForgotMsg({
        text: getFirebaseAuthErrorMessage(err.code),
        type: 'error'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setConfigError('');
    try {
      let parsed = JSON.parse(configInput);
      if (!parsed.apiKey || !parsed.projectId) {
        setConfigError('JSON içeriğinde "apiKey" ve "projectId" alanları zorunludur.');
        return;
      }
      saveCustomFirebaseConfig(parsed);
    } catch (err) {
      setConfigError('Geçersiz JSON formatı! Lütfen Firebase Console SDK snippetini doğru formatta yapıştırın.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Arka Plan Işık Efektleri */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo ve Başlık */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center relative group mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 rounded-3xl blur-sm opacity-80 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 p-4 rounded-2xl border border-amber-300/40 shadow-2xl">
              <svg className="w-12 h-12 drop-shadow-md" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#login-bg)" stroke="url(#login-border)" strokeWidth="1.5" />
                <rect x="7" y="10" width="18" height="13" rx="2.5" stroke="#FDE68A" strokeWidth="1.8" fill="none" />
                <path d="M7 14.5H25" stroke="#FDE68A" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.7" />
                <path d="M10 19.5L14 16L17.5 17.5L22.5 12" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.5 12H22.5V15" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="21" cy="18.5" r="2.2" fill="#F59E0B" stroke="#FEF3C7" strokeWidth="0.8" />
                <path d="M21 17.3V19.7M20.2 18.5H21.8" stroke="#78350F" strokeWidth="0.6" strokeLinecap="round" />
                <defs>
                  <linearGradient id="login-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#064E3B" />
                    <stop offset="1" stopColor="#022C22" />
                  </linearGradient>
                  <linearGradient id="login-border" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
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

        {/* Giriş Kartı */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">Yönetici Girişi</h2>
                <p className="text-[11px] text-slate-400">Firebase ile Güvenli Oturum</p>
              </div>
            </div>

            <button
              onClick={() => setShowConfigModal(true)}
              title="Firebase Bağlantı Ayarları"
              className="text-xs flex items-center gap-1 text-slate-400 hover:text-amber-400 transition bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-amber-500/40"
            >
              <Settings size={14} />
              <span>Ayarlar</span>
            </button>
          </div>

          {/* Firebase Henüz Yapılandırılmadı Uyarısı */}
          {!configured && (
            <div className="mb-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-amber-300">Firebase Bilgileri Eksik:</strong>
                Giriş yapabilmek için Firebase proje bilgilerinizi girmeniz gerekmektedir.
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="mt-2 inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs transition"
                >
                  <Settings size={13} />
                  Firebase Bilgilerini Gir
                </button>
              </div>
            </div>
          )}

          {/* Hata Bildirimi */}
          {errorMsg && (
            <div className="mb-4 bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-200 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Başarı Bildirimi */}
          {successMsg && (
            <div className="mb-4 bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Giriş Formu */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-posta Alanı */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gmail / E-posta Adresi
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
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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

            {/* Beni Hatırla ve Şifremi Unuttum */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500/40"
                />
                <span>Beni Hatırla</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-amber-400 hover:text-amber-300 hover:underline transition font-medium"
              >
                Şifremi Unuttum?
              </button>
            </div>

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

        {/* Alt Bilgi */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          Bu sisteme yalnızca Firebase Console üzerinde tanımlanan yetkili Gmail hesapları erişebilir.
        </p>
      </div>

      {/* ŞİFREMİ UNUTTUM MODALI */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-4 text-amber-400">
              <KeyRound size={22} />
              <h3 className="font-bold text-white text-base">Şifre Sıfırlama</h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Kayıtlı Gmail / e-posta adresinizi giriniz. Firebase size yeni şifre oluşturabileceğiniz güvenli bir bağlantı gönderecektir.
            </p>

            {forgotMsg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 ${
                  forgotMsg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
                    : 'bg-red-500/15 border border-red-500/30 text-red-200'
                }`}
              >
                {forgotMsg.type === 'success' ? (
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{forgotMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">E-posta</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="ornek@gmail.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Kapat
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {forgotLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIREBASE YAPILANDIRMA AYARLARI MODALI */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Settings size={20} />
                <h3 className="font-bold text-white text-base">Firebase Bağlantı Ayarları</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Firebase Console'dan (<strong>Project Settings &gt; General &gt; Your Apps &gt; SDK setup and configuration</strong>) aldığınız <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">firebaseConfig</code> nesnesini aşağıdaki alana yapıştırıp kaydedebilirsiniz:
            </p>

            {configError && (
              <div className="mb-3 bg-red-500/15 border border-red-500/30 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{configError}</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Firebase Config JSON:
                </label>
                <textarea
                  rows={8}
                  value={configInput}
                  onChange={(e) => setConfigInput(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "proje.firebaseapp.com",\n  "projectId": "proje-id",\n  "storageBucket": "proje.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "1:..."\n}`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 flex items-center gap-1">
                  <HelpCircle size={13} className="text-amber-400" />
                  Nasıl Yapılır?
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
                  <li><strong>console.firebase.google.com</strong> adresine gidin.</li>
                  <li>Yeni bir proje oluşturup <strong>Authentication</strong> menüsünden <strong>Email/Password</strong> seçeneğini etkinleştirin.</li>
                  <li><strong>Users</strong> sekmesinden Gmail ve Şifrenizi ekleyin.</li>
                  <li>Proje ayarlarından Web App oluşturup yukarıdaki config nesnesini yapıştırın.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md"
                >
                  <CheckCircle2 size={14} />
                  Yapılandırmayı Kaydet ve Yenile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
