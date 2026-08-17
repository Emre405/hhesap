# 🫒 HESAP TAKİP — Zeytin & Zeytinyağı Cari ve Finansal Takip Sistemi

Modern, hızlı, mobil uyumlu (PWA) ve **Firebase Authentication (Gmail & Şifre)** ile korunan profesyonel cari ve finansal takip uygulaması.

---

## 🌟 Özellikler

- 🔐 **Firebase Giriş Ekranı:** Sadece Firebase Console üzerinden sizin ekleyeceğiniz yetkili Gmail ve Şifre ile sisteme erişim.
- 🫒 **Zeytin Modülü:** Müstahsil alımları, kalibre bazlı stok, maliyet ve müşteri satış takibi.
- 💧 **Zeytinyağı Modülü:** Teneke bazlı alım, satış, litre hesabı ve stok değeri takibi.
- 👥 **Müşteri & Cari Takip:** Müşteri bazlı borç-alacak bakiyesi ve akıllı tahsilat dağıtım sistemi.
- 📅 **12 Aylık Finans & Nakit Akış Planı:** Yılın her ayı için alacaklar ve ödeme planı.
- 📊 **Bilanço & Varlık / Borç:** Net varlık durumu, grafikler ve finansal özet.
- 💾 **Yedekleme & Excel:** Tek tıkla Excel (.xlsx), HTML, JSON ve TXT formatlarında yedek alma ve geri yükleme.
- 📱 **Mobil PWA Desteği:** Android ve iPhone'da "Ana Ekrana Ekle" özelliğiyle tıpkı yerel bir mobil uygulama gibi tam ekran çalışır.

---

## 🛠️ ADIM 1: Firebase Kurulumu ve Kullanıcı Belirleme

Giriş ekranında kullanacağınız **Gmail** ve **Şifre**yi belirlemek için aşağıdaki adımları uygulayın:

### 1. Firebase Projesi Oluşturun
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin ve Google hesabınızla giriş yapın.
2. **"Proje Ekle" (Add Project)** butonuna tıklayın, projenize bir isim verin (Örn: `hesap-takip`) ve projeyi oluşturun.

### 2. E-posta / Şifre Giriş Yöntemini Açın
1. Sol menüden **Build (Oluştur) > Authentication** seçeneğine tıklayın ve **"Get Started"** deyin.
2. **"Sign-in method"** sekmesine gelin ve **"Email/Password"** seçeneğini seçin.
3. İlk sıradaki **"Email/Password"** butonunu **Enable (Etkin)** yapın ve **Save (Kaydet)** deyin.

### 3. Kendi Gmail Adresinizi ve Şifrenizi Ekleyin
1. **Authentication** menüsü altındaki **"Users" (Kullanıcılar)** sekmesine gelin.
2. **"Add User" (Kullanıcı Ekle)** butonuna tıklayın.
3. Giriş yapmak istediğiniz **Gmail adresinizi** ve istediğiniz **Şifreyi** yazarak kullanıcıyı oluşturun. *(Artık uygulamaya yalnızca bu oluşturduğunuz bilgilerle girilebilir).*

### 4. Firebase Yapılandırma Anahtarlarını Alın
1. Sol üstteki ⚙️ **Proje Ayarları (Project Settings)** simgesine tıklayın.
2. **"General" (Genel)** sekmesinde en alta inin ve **"Your apps"** bölümündeki **Web ( `</>` )** simgesine tıklayın.
3. Uygulamaya bir takma ad verin (Örn: `Hesap Takip Web`) ve kaydedin.
4. Ekrana gelen `firebaseConfig` kodlarını kopyalayın:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "hesap-takip.firebaseapp.com",
  projectId: "hesap-takip",
  storageBucket: "hesap-takip.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

### 5. Bilgileri Uygulamaya Tanımlayın (2 Kolay Yoldan Biri)
- **Kolay Yol (Arayüzden):** Uygulamayı açtığınızda Giriş Ekranındaki **"Ayarlar"** butonuna tıklayın ve yukarıdaki JSON kodunu yapıştırıp kaydedin.
- **Veya `.env` Dosyası ile:** Proje klasöründeki `.env` dosyasını açıp değerleri yapıştırın:
  ```env
  VITE_FIREBASE_API_KEY=AIzaSy...
  VITE_FIREBASE_AUTH_DOMAIN=hesap-takip.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=hesap-takip
  VITE_FIREBASE_STORAGE_BUCKET=hesap-takip.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
  VITE_FIREBASE_APP_ID=1:123456789:web:...
  ```

---

## 🐙 ADIM 2: GitHub Bağlantısını Oluşturma

Projeyi kendi GitHub hesabınıza yüklemek için:

1. [GitHub](https://github.com/) üzerinde oturum açın ve sağ üstten **"New repository"** butonuna tıklayın.
2. Depo adını belirleyin (Örn: `hesap-takip`) ve **"Create repository"** deyin (README veya .gitignore eklemeyin, zaten hazır).
3. Bu proje klasöründe terminali / komut satırını açarak aşağıdaki komutları sırasıyla çalıştırın:

```bash
# 1. Değişiklikleri ekleyin ve ilk commit'i yapın (önceden yapılmadıysa):
git add .
git commit -m "feat: Hesap ve Cari Takip Sistemi hazırlandı"

# 2. Ana dalı main yapın:
git branch -M main

# 3. Kendi GitHub depo adresinizi ekleyin (KULLANICI_ADI ve REPO_ADI kısımlarını kendi linkinizle değiştirin):
git remote add origin https://github.com/KULLANICI_ADI/hesap-takip.git

# 4. Kodları GitHub'a gönderin:
git push -u origin main
```

---

## 🚀 ADIM 3: İnternete Canlıya Alma (Vercel ile Ücretsiz Yayınlama)

Uygulamanızı tüm cihazlardan ve internetten erişilebilir kılmak için en kolay yöntem **Vercel**'dir:

1. [Vercel](https://vercel.com/) sitesine gidin ve **"Continue with GitHub"** seçeneğiyle ücretsiz üye olun / giriş yapın.
2. **"Add New... > Project"** butonuna tıklayın.
3. GitHub üzerindeki `hesap-takip` deponuzun yanındaki **"Import"** butonuna basın.
4. **Environment Variables** bölümüne Firebase anahtarlarınızı (`VITE_FIREBASE_API_KEY`, vb.) ekleyin (veya yayınladıktan sonra giriş ekranındaki Ayarlar'dan da girebilirsiniz).
5. **"Deploy"** butonuna tıklayın!
6. Yaklaşık 30 saniye içinde uygulamanız `https://hesap-takip.vercel.app` gibi bir adreste 7/24 ücretsiz olarak canlıya alınacaktır.

---

## 📱 ADIM 4: Telefona Mobil Uygulama Olarak Yükleme

- **Android (Chrome):** Canlı web sitesi adresinizi Chrome'da açın. Sağ üstteki 3 noktaya tıklayıp **"Uygulamayı Yükle"** veya **"Ana Ekrana Ekle"** seçeneğine basın.
- **iPhone / iPad (Safari):** Safari'de sitenizi açın. Alttaki **Paylaş (kare ve yukarı ok)** simgesine basın ve **"Ana Ekrana Ekle"** deyin.

Artık ana ekranınızda uygulamanızın logosu belirecek ve tam ekran mobil uygulama konforunda kullanabileceksiniz.
