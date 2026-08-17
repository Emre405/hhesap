# 🫒 HESAP TAKİP — Zeytin & Zeytinyağı Cari ve Finansal Takip Sistemi

Modern, hızlı, mobil uyumlu (PWA) ve **Firebase Authentication (Gmail & Şifre)** ile korunan profesyonel cari ve finansal takip uygulaması. **Firebase Hosting** üzerinden 7/24 ücretsiz olarak canlıda yayınlanabilir.

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
- ☁️ **Firebase Hosting:** Google altyapısında ücretsiz SSL sertifikalı hızlı yayınlama.

---

## 🛠️ ADIM 1: Firebase Kurulumu ve Kullanıcı Belirleme

Giriş ekranında kullanacağınız **Gmail** ve **Şifre**yi belirlemek için:

### 1. Firebase Projesi Oluşturun
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin ve Google hesabınızla giriş yapın.
2. **"Proje Ekle" (Add Project)** butonuna tıklayın, projenize bir isim verin (Örn: `hesap-takip-2026`) ve projeyi oluşturun.

### 2. E-posta / Şifre Giriş Yöntemini Açın
1. Sol menüden **Build (Oluştur) > Authentication** seçeneğine tıklayın ve **"Get Started"** deyin.
2. **"Sign-in method"** sekmesine gelin ve **"Email/Password"** seçeneğini seçin.
3. İlk sıradaki **"Email/Password"** seçeneğini **Enable (Etkin)** yapın ve **Save (Kaydet)** deyin.

### 3. Kendi Gmail Adresinizi ve Şifrenizi Ekleyin
1. **Authentication** menüsü altındaki **"Users" (Kullanıcılar)** sekmesine gelin.
2. **"Add User" (Kullanıcı Ekle)** butonuna tıklayın.
3. Giriş yapmak istediğiniz **Gmail adresinizi** ve belirlediğiniz **Şifreyi** yazarak kullanıcıyı oluşturun. *(Artık uygulamaya yalnızca bu bilgilerle girilebilir).*

### 4. Firebase Yapılandırma Anahtarlarını Alın
1. Sol üstteki ⚙️ **Proje Ayarları (Project Settings)** simgesine tıklayın.
2. **"General" (Genel)** sekmesinde en alta inin ve **"Your apps"** bölümündeki **Web ( `</>` )** simgesine tıklayın.
3. Uygulamaya bir takma ad verin (Örn: `Hesap Takip Web`) ve kaydedin.
4. Ekrana gelen `firebaseConfig` kodlarını kopyalayın:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "proje-id.firebaseapp.com",
  projectId: "proje-id",
  storageBucket: "proje-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

### 5. Bilgileri Uygulamaya Tanımlayın
- **Kolay Yol (Arayüzden):** Uygulamayı açtığınızda Giriş Ekranındaki **"Ayarlar"** butonuna tıklayın ve yukarıdaki JSON kodunu yapıştırıp kaydedin.
- **Veya `.env` Dosyası ile:** Proje klasöründeki `.env` dosyasını açıp değerleri yapıştırın.

---

## 🚀 ADIM 2: Firebase Hosting ile Canlıya Yayınlama

Uygulamanızı Google Firebase Hosting üzerinde canlıya almak için terminalde şu komutları sırasıyla çalıştırın:

```bash
# 1. Firebase Araçları ile giriş yapın (Google hesabınızla tarayıcıda onaylayın):
npx firebase-tools login

# 2. .firebaserc dosyasındaki "hesap-takip" kısmını kendi Firebase Proje ID'niz ile değiştirin veya:
npx firebase-tools use --add

# 3. Projenizi derleyin ve tek komutla Firebase Hosting'e canlıya yükleyin:
npm run deploy
```

> 🎯 **Sonuç:** Komut bittiğinde terminalde sitenizin canlı linki çıkacaktır:
> `https://proje-id.web.app` ve `https://proje-id.firebaseapp.com`
> Artık uygulamanız Google sunucularında 7/24 ücretsiz, hızlı ve SSL sertifikalı olarak yayındadır!

---

## 🐙 ADIM 3: GitHub Bağlantısını Oluşturma

Projeyi yedeklemek ve versiyonlamak için kendi GitHub hesabınıza yükleyebilirsiniz:

1. [GitHub](https://github.com/) üzerinde oturum açın ve sağ üstten **"New repository"** butonuna tıklayın.
2. Depo adını belirleyin (Örn: `hesap-takip`) ve **"Create repository"** deyin.
3. Terminalde şu komutları çalıştırın:

```bash
# 1. Değişiklikleri kaydedin:
git add .
git commit -m "feat: Firebase Hosting ve Auth yapilandirmasi"

# 2. Kendi GitHub linkinizi bağlayın:
git remote add origin https://github.com/KULLANICI_ADI/hesap-takip.git

# 3. Kodları GitHub'a gönderin:
git push -u origin main
```

---

## 📱 ADIM 4: Telefona Mobil Uygulama Olarak Yükleme

- **Android (Chrome):** `https://proje-id.web.app` adresinizi Chrome'da açın. Sağ üstteki 3 noktaya tıklayıp **"Uygulamayı Yükle"** veya **"Ana Ekrana Ekle"** seçeneğine basın.
- **iPhone / iPad (Safari):** Safari'de sitenizi açın. Alttaki **Paylaş (kare ve yukarı ok)** simgesine basın ve **"Ana Ekrana Ekle"** deyin.
