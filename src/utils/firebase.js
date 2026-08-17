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

// 1. Firebase hhesap Proje Yapılandırması
export const defaultFirebaseConfig = {
  apiKey: "AIzaSyAJizOVgE_t2wTzUF4EsBNga8KG7lczgCo",
  authDomain: "hhesap.firebaseapp.com",
  projectId: "hhesap",
  storageBucket: "hhesap.firebasestorage.app",
  messagingSenderId: "993107666569",
  appId: "1:993107666569:web:b255098a3a06dfd0a98858"
};

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

  // .env dosyasından veya varsayılan hhesap konfigürasyonundan oku
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId
  };
};

export const isFirebaseConfigured = () => {
  const cfg = getStoredFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.apiKey.trim() !== '' && cfg.projectId && cfg.projectId.trim() !== '');
};

// 2. Firebase Uygulamasını Başlat
const firebaseConfig = getStoredFirebaseConfig();

let app;
let auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (err) {
  console.error('Firebase initialization error:', err);
}

export { auth, app };

// 3. Giriş İşlemi
export const loginWithEmail = async (email, password, rememberMe = true) => {
  if (!auth) {
    throw new Error('Firebase Auth servisine bağlanılamadı.');
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

// 5. Oturum Durumu Dinleyicisi
export const subscribeToAuthChanges = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// 6. Türkçe Anlaşılır Hata Mesajları
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
      return 'Çok fazla başarısız giriş denemesi yapıldı. Lütfen biraz bekleyin.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantısı hatası! Lütfen internetinizi kontrol ediniz.';
    case 'auth/operation-not-allowed':
      return 'Firebase Console üzerinde "Email/Password" oturum açma yöntemi henüz etkinleştirilmemiş.';
    case 'auth/missing-password':
      return 'Lütfen şifrenizi giriniz.';
    case 'auth/missing-email':
      return 'Lütfen e-posta adresinizi giriniz.';
    default:
      return `Giriş yapılamadı (${errorCode || 'Hata'}). Lütfen e-posta ve şifrenizi kontrol ediniz.`;
  }
};
