import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';

// 1. Firebase Yapılandırmasını Al (.env veya localStorage)
export const getStoredFirebaseConfig = () => {
  try {
    const custom = localStorage.getItem('hesap_takip_firebase_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed?.apiKey && parsed?.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Custom Firebase config parse error:', e);
  }

  // .env dosyasından oku
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };
};

export const saveCustomFirebaseConfig = (config) => {
  if (!config || !config.apiKey || !config.projectId) {
    throw new Error('Geçersiz Firebase yapılandırması');
  }
  localStorage.setItem('hesap_takip_firebase_config', JSON.stringify(config));
  window.location.reload();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem('hesap_takip_firebase_config');
  window.location.reload();
};

export const isFirebaseConfigured = () => {
  const cfg = getStoredFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.apiKey.trim() !== '' && cfg.projectId && cfg.projectId.trim() !== '');
};

// 2. Firebase Uygulamasını Başlat
const firebaseConfig = getStoredFirebaseConfig();

let app;
let auth;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
}

export { auth, app };

// 3. Giriş İşlemi
export const loginWithEmail = async (email, password, rememberMe = true) => {
  if (!auth) {
    throw new Error('Firebase yapılandırması henüz tamamlanmadı.');
  }

  // Kalıcılık ayarı (Beni Hatırla)
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  } catch (e) {
    console.warn('Set persistence warning:', e);
  }

  return await signInWithEmailAndPassword(auth, email.trim(), password);
};

// 4. Çıkış İşlemi
export const logoutUser = async () => {
  if (!auth) return;
  return await signOut(auth);
};

// 5. Şifre Sıfırlama E-postası
export const resetPassword = async (email) => {
  if (!auth) {
    throw new Error('Firebase yapılandırması henüz tamamlanmadı.');
  }
  return await sendPasswordResetEmail(auth, email.trim());
};

// 6. Oturum Durumu Dinleyicisi
export const subscribeToAuthChanges = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// 7. Türkçe Anlaşılır Hata Mesajları
export const getFirebaseAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.';
    case 'auth/user-not-found':
      return 'Bu Gmail / e-posta adresine kayıtlı kullanıcı bulunamadı.';
    case 'auth/invalid-email':
      return 'Lütfen geçerli bir e-posta adresi yazınız.';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı devre dışı bırakılmış.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız giriş denemesi yapıldı. Lütfen biraz bekleyin veya şifrenizi sıfırlayın.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantısı hatası! Lütfen internetinizi kontrol ediniz.';
    case 'auth/operation-not-allowed':
      return 'Firebase Console üzerinde "Email/Password" oturum açma yöntemi henüz etkinleştirilmemiş.';
    case 'auth/missing-password':
      return 'Lütfen şifrenizi giriniz.';
    case 'auth/missing-email':
      return 'Lütfen e-posta adresinizi giriniz.';
    default:
      return `Giriş yapılamadı: ${errorCode || 'Bilinmeyen hata'}`;
  }
};
