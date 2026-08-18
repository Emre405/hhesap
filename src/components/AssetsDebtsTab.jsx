import React, { useState } from 'react';
import { formatTL } from '../utils/helpers';
import { exportToExcel, downloadFile, generateHTMLBackup, generatePDFBackup, generateTXTBackup } from '../utils/excel';
import { PlusCircle, Trash2, Download, Upload, ShieldCheck, FileText, Landmark, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import NumericInput from './NumericInput';

export const AssetsDebtsTab = ({
  data,
  onAddDebt,
  onDeleteDebt,
  onAddAsset,
  onDeleteAsset,
  onResetData,
  onImportData
}) => {
  const [subSection, setSubSection] = useState('balance'); // 'balance', 'backup'
  const [confirmDeleteInfo, setConfirmDeleteInfo] = useState(null); // { id, type, title }

  // Borç Form State
  const [debtDesc, setDebtDesc] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtCategory, setDebtCategory] = useState('Banka/Kooperatif');

  // Varlık Form State
  const [assetDesc, setAssetDesc] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [assetType, setAssetType] = useState('Nakit/Banka');

  // Math
  const totalDebts = data.debts.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);
  const totalAssets = data.assets.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
  const netWorth = totalAssets - totalDebts;

  const handleDebtSubmit = (e) => {
    e.preventDefault();
    if (!debtDesc || !debtAmount) return;
    const newDebt = {
      id: 'd-' + Date.now(),
      description: debtDesc.trim(),
      amount: Number(debtAmount),
      category: debtCategory
    };
    onAddDebt(newDebt);
    setDebtDesc('');
    setDebtAmount('');
    alert('Borç kaydı eklendi.');
  };

  const handleAssetSubmit = (e) => {
    e.preventDefault();
    if (!assetDesc || !assetAmount) return;
    const newAsset = {
      id: 'a-' + Date.now(),
      description: assetDesc.trim(),
      amount: Number(assetAmount),
      type: assetType
    };
    onAddAsset(newAsset);
    setAssetDesc('');
    setAssetAmount('');
    alert('Varlık kaydı eklendi.');
  };

  // Backups
  const handleDownloadPDF = () => {
    generatePDFBackup(data);
  };

  const handleDownloadTXT = () => {
    const txtContent = generateTXTBackup(data);
    downloadFile(txtContent, `Zeytin_Takip_Detayli_Yedek_${Date.now()}.txt`, 'text/plain;charset=utf-8');
  };

  const handleDownloadHTML = () => {
    const htmlContent = generateHTMLBackup(data);
    downloadFile(htmlContent, `Zeytin_Takip_Detayli_Yedek_${Date.now()}.html`, 'text/html;charset=utf-8');
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, `Zeytin_Takip_Veri_${Date.now()}.json`, 'application/json');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedJson = JSON.parse(event.target.result);
        if (confirm('Yüklenen yedek dosyasındaki veriler mevcut verilerin üzerine yazılacaktır. Onaylıyor musunuz?')) {
          onImportData(importedJson);
          alert('Yedek başarıyla yüklendi!');
        }
      } catch (err) {
        alert('Geçersiz yedek dosyası formatı!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Sub tabs */}
      <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setSubSection('balance')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subSection === 'balance' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <Landmark size={16} />
          <span>Genel Bilanço (Borç & Varlık)</span>
        </button>
        <button
          onClick={() => setSubSection('backup')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subSection === 'backup' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Yedekleme & Veri</span>
        </button>
      </div>

      {/* SECTION 1: GENEL BİLANÇO */}
      {subSection === 'balance' && (
        <div className="space-y-4">
          {/* GENEL BİLANÇO ÖZET KART */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-wide">GENEL BİLANÇO ÖZETİ</h2>
                <p className="text-xs text-slate-300 font-medium">Tüm mal varlığı ve genel borçlar dengesi</p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
                Bilanço
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <p className="text-xs text-slate-300 font-medium">Toplam Genel Varlıklar</p>
                <p className="text-base sm:text-lg font-extrabold text-green-300 mt-0.5">{formatTL(totalAssets)}</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <p className="text-xs text-slate-300 font-medium">Toplam Genel Borçlar</p>
                <p className="text-base sm:text-lg font-extrabold text-red-300 mt-0.5">{formatTL(totalDebts)}</p>
              </div>
            </div>

            <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-500/40 flex justify-between items-center">
              <div>
                <p className="text-xs text-emerald-200 uppercase font-semibold">Net Genel Varlık Durumu</p>
                <p className="text-xs text-emerald-300 font-medium">(Varlıklar - Borçlar)</p>
              </div>
              <span className={`text-base sm:text-lg font-extrabold ${netWorth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatTL(netWorth)}
              </span>
            </div>
          </div>

          {/* BORÇLAR BÖLÜMÜ */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <PlusCircle size={20} className="text-red-600" />
              <span>Yeni Genel Borç Kaydı Ekle</span>
            </h3>

            <form onSubmit={handleDebtSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Borç Açıklaması</label>
                  <input
                    type="text"
                    placeholder="Örn: Traktör Kredisi"
                    value={debtDesc}
                    onChange={(e) => setDebtDesc(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Kategori</label>
                  <select
                    value={debtCategory}
                    onChange={(e) => setDebtCategory(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Banka/Kooperatif">Banka/Kooperatif</option>
                    <option value="Kredi">Kredi</option>
                    <option value="Resmi Borç">Resmi Borç (ÇKS/Aidat)</option>
                    <option value="Şahıs Borcu">Şahıs Borcu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tutar (TL)</label>
                <NumericInput
                  placeholder="0"
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-red-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-sm shadow-xs"
              >
                Borç Kaydını Ekle
              </button>
            </form>

            {/* Borçlar Listesi */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-700">
                <span>Mevcut Genel Borçlar ({data.debts.length})</span>
                <button
                  onClick={() =>
                    exportToExcel(
                      data.debts.map((d) => ({ Açıklama: d.description, Kategori: d.category, 'Tutar (TL)': d.amount })),
                      'Genel_Borclar.xlsx',
                      'Borçlar'
                    )
                  }
                  className="text-red-700 hover:underline text-xs"
                >
                  Excel'e Aktar
                </button>
              </div>

              {data.debts.map((d) => (
                <div key={d.id} className="bg-red-50/50 p-3 rounded-xl border border-red-100 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{d.description}</span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{d.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-red-600 text-sm sm:text-base">{formatTL(d.amount)}</span>
                    <button onClick={() => setConfirmDeleteInfo({ id: d.id, type: 'debt', title: d.description })} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-100/50 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VARLIKLAR BÖLÜMÜ */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <PlusCircle size={20} className="text-green-600" />
              <span>Yeni Genel Varlık Kaydı Ekle</span>
            </h3>

            <form onSubmit={handleAssetSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Varlık Açıklaması</label>
                  <input
                    type="text"
                    placeholder="Örn: 5 Dönüm Zeytinlik"
                    value={assetDesc}
                    onChange={(e) => setAssetDesc(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Varlık Tipi</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Nakit/Banka">Nakit / Banka Hesabı</option>
                    <option value="Gayrimenkul">Gayrimenkul / Zeytinlik</option>
                    <option value="Araç/Ekipman">Araç / Ekipman / Traktör</option>
                    <option value="Diğer">Diğer Değerli Varlık</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tahmini Değer (TL)</label>
                <NumericInput
                  placeholder="0"
                  value={assetAmount}
                  onChange={(e) => setAssetAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-green-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm shadow-xs"
              >
                Varlık Kaydını Ekle
              </button>
            </form>

            {/* Varlıklar Listesi */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-700">
                <span>Mevcut Genel Varlıklar ({data.assets.length})</span>
                <button
                  onClick={() =>
                    exportToExcel(
                      data.assets.map((a) => ({ Açıklama: a.description, Tip: a.type, 'Değer (TL)': a.amount })),
                      'Genel_Varliklar.xlsx',
                      'Varlıklar'
                    )
                  }
                  className="text-green-700 hover:underline text-xs"
                >
                  Excel'e Aktar
                </button>
              </div>

              {data.assets.map((a) => (
                <div key={a.id} className="bg-green-50/50 p-3 rounded-xl border border-green-100 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{a.description}</span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{a.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-green-700 text-sm sm:text-base">{formatTL(a.amount)}</span>
                    <button onClick={() => setConfirmDeleteInfo({ id: a.id, type: 'asset', title: a.description })} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-100/50 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: YEDEKLEME & VERİ YÖNETİMİ */}
      {subSection === 'backup' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-1.5">
              <Download size={16} className="text-emerald-700" />
              <span>Veri İndirme ve Yedekleme Butonları</span>
            </h3>

            <p className="text-xs text-gray-500">
              Tüm zeytin, zeytinyağı, müşteri cari hesapları, ödeme planı ve bilanço verilerinizi tek tıkla cihazınıza indirebilirsiniz.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={handleDownloadPDF}
                className="p-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95"
              >
                <FileText size={18} className="text-red-200" />
                <span>Detaylı PDF (.pdf)</span>
              </button>

              <button
                onClick={handleDownloadTXT}
                className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95"
              >
                <FileText size={18} className="text-amber-400" />
                <span>Metin Dosyası (.txt)</span>
              </button>

              <button
                onClick={handleDownloadHTML}
                className="p-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95"
              >
                <FileText size={18} className="text-emerald-300" />
                <span>HTML Dosyası (.html)</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="p-3 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow-sm transition active:scale-95"
              >
                <Download size={18} className="text-indigo-300" />
                <span>JSON Dosyası (.json)</span>
              </button>

              <label className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex flex-col items-center justify-center space-y-1 shadow-sm cursor-pointer transition active:scale-95">
                <Upload size={18} className="text-yellow-200" />
                <span>Yedek Yükle (Import)</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* SIFIRLAMA & PROFİL BİLGİSİ */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-1.5">
              <RefreshCw size={16} className="text-amber-600" />
              <span>Sistem Ayarları & Oturum</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-gray-700">
                <span>Kullanıcı Kimliği:</span>
                <strong className="text-emerald-800">HSP-2026-MOBILE</strong>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>Depolama Alnı:</span>
                <strong className="text-slate-800">Tarayıcı LocalStorage</strong>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span>Uygulama Modu:</span>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 size={11} />
                  <span>Mobile-First Responsive</span>
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={onResetData}
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5"
              >
                <RefreshCw size={14} />
                <span>Örnek Demo Verileri Yeniden Yükle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİLME ONAY MODALI */}
      {confirmDeleteInfo && (
        <ConfirmModal
          isOpen={Boolean(confirmDeleteInfo)}
          title="Kaydı Sil"
          message={`"${confirmDeleteInfo.title}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Evet, Sil"
          cancelText="İptal"
          onClose={() => setConfirmDeleteInfo(null)}
          onConfirm={() => {
            if (confirmDeleteInfo.type === 'debt') onDeleteDebt(confirmDeleteInfo.id);
            else if (confirmDeleteInfo.type === 'asset') onDeleteAsset(confirmDeleteInfo.id);
            setConfirmDeleteInfo(null);
          }}
        />
      )}
    </div>
  );
};
