import React, { useState, useMemo } from 'react';
import { formatTL, formatNumber, getTodayString } from '../utils/helpers';
import { exportToExcel } from '../utils/excel';
import { PlusCircle, Search, FileSpreadsheet, Trash2, Droplets, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import NumericInput from './NumericInput';

export const OliveOilTab = ({ data = {}, onAddOilSale, onDeleteOilSale, onAddOilPurchase, onDeleteOilPurchase, onUpdateOilStockPrice }) => {
  const [subTab, setSubTab] = useState('sales'); // 'sales', 'purchases'
  const [confirmDeleteInfo, setConfirmDeleteInfo] = useState(null); // { id, type, title }

  // Editable Kalan Stok Birim Fiyatı (Teneke Başına)
  const [unitPriceInput, setUnitPriceInput] = useState(data.oilStockUnitPrice || 4000);

  // Form State: Zeytinyağı Satışı
  const [saleDate, setSaleDate] = useState(getTodayString());
  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleTinType, setSaleTinType] = useState('16 Litrelik Teneke');
  const [saleTinCount, setSaleTinCount] = useState('');
  const [saleUnitPrice, setSaleUnitPrice] = useState('');
  const [salePaid, setSalePaid] = useState('');

  // Form State: Zeytinyağı Alımı
  const [purchDate, setPurchDate] = useState(getTodayString());
  const [purchSupplier, setPurchSupplier] = useState('');
  const [purchTinType, setPurchTinType] = useState('16 Litrelik Teneke');
  const [purchTinCount, setPurchTinCount] = useState('');
  const [purchUnitPrice, setPurchUnitPrice] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Helper for tin liters multiplier
  const getLitersPerTin = (tinType) => {
    if (tinType.includes('5 Litre')) return 5;
    if (tinType.includes('1 Litre')) return 1;
    return 16; // default 16 lt
  };

  const getItemLiters = (item) => {
    if (item.totalLiters !== undefined && !isNaN(Number(item.totalLiters)) && Number(item.totalLiters) > 0) {
      return Number(item.totalLiters);
    }
    const tinType = item.tinType || '';
    const count = Number(item.tinCount) || 0;
    if (tinType.includes('5 Litre')) return count * 5;
    if (tinType.includes('1 Litre')) return count * 1;
    return count * 16;
  };

  // Stock summary math
  const totalBoughtLiters = (data.oilPurchases || []).reduce((acc, p) => acc + getItemLiters(p), 0);
  const totalSoldLiters = (data.oilSales || []).reduce((acc, s) => acc + getItemLiters(s), 0);
  const remainingLiters = Math.max(0, totalBoughtLiters - totalSoldLiters);
  const remainingTinEquivalent = remainingLiters / 16;

  const totalSalesTL = (data.oilSales || []).reduce((acc, s) => acc + (Number(s.totalPrice) || 0), 0);
  const totalPurchasesTL = (data.oilPurchases || []).reduce((acc, p) => acc + (Number(p.totalPrice) || 0), 0);

  const remainingValueTL = remainingTinEquivalent * (Number(unitPriceInput) || 0);
  const netProfitTL = (totalSalesTL + remainingValueTL) - totalPurchasesTL;

  // Real-time sale calc
  const saleLiters = useMemo(() => {
    const count = Number(saleTinCount) || 0;
    return count * getLitersPerTin(saleTinType);
  }, [saleTinCount, saleTinType]);

  const saleTotal = useMemo(() => {
    const count = Number(saleTinCount) || 0;
    const price = Number(saleUnitPrice) || 0;
    return count * price;
  }, [saleTinCount, saleUnitPrice]);

  const saleBalance = useMemo(() => {
    const paid = Number(salePaid) || 0;
    return Math.max(0, saleTotal - paid);
  }, [saleTotal, salePaid]);

  // Real-time purch calc
  const purchLiters = useMemo(() => {
    const count = Number(purchTinCount) || 0;
    return count * getLitersPerTin(purchTinType);
  }, [purchTinCount, purchTinType]);

  const purchTotal = useMemo(() => {
    const count = Number(purchTinCount) || 0;
    const price = Number(purchUnitPrice) || 0;
    return count * price;
  }, [purchTinCount, purchUnitPrice]);

  // Handlers
  const handleSaleSubmit = (e) => {
    e.preventDefault();
    if (!saleCustomer || !saleTinCount || !saleUnitPrice) {
      alert('Lütfen Müşteri, Teneke Sayısı ve Birim Fiyat alanlarını doldurunuz.');
      return;
    }
    const newSale = {
      id: 'ois-' + Date.now(),
      date: saleDate,
      customerName: saleCustomer.trim(),
      tinType: saleTinType,
      tinCount: Number(saleTinCount),
      totalLiters: saleLiters,
      unitPricePerTin: Number(saleUnitPrice),
      totalPrice: saleTotal,
      paidAmount: Number(salePaid) || 0,
      remainingBalance: saleBalance
    };
    onAddOilSale(newSale);
    setSaleCustomer('');
    setSaleTinCount('');
    setSaleUnitPrice('');
    setSalePaid('');
    alert('Zeytinyağı satışı eklendi.');
  };

  const handlePurchSubmit = (e) => {
    e.preventDefault();
    if (!purchSupplier || !purchTinCount || !purchUnitPrice) {
      alert('Lütfen Tedarikçi, Teneke Sayısı ve Birim Fiyat alanlarını giriniz.');
      return;
    }
    const newPurch = {
      id: 'oip-' + Date.now(),
      date: purchDate,
      supplier: purchSupplier.trim(),
      tinType: purchTinType,
      tinCount: Number(purchTinCount),
      totalLiters: purchLiters,
      unitPricePerTin: Number(purchUnitPrice),
      totalPrice: purchTotal
    };
    onAddOilPurchase(newPurch);
    setPurchSupplier('');
    setPurchTinCount('');
    setPurchUnitPrice('');
    alert('Zeytinyağı alım kaydı eklendi.');
  };

  const handleStockPriceChange = (val) => {
    setUnitPriceInput(val);
    onUpdateOilStockPrice(Number(val) || 0);
  };

  const filteredOilSales = (data.oilSales || []).filter((s) =>
    (s.customerName || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Sub Tabs: Satış / Alım */}
      <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setSubTab('sales')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subTab === 'sales' ? 'bg-white text-amber-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <ArrowUpCircle size={16} className="text-emerald-600" />
          <span>Yağ Satışı Yap</span>
        </button>
        <button
          onClick={() => setSubTab('purchases')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subTab === 'purchases' ? 'bg-white text-amber-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <ArrowDownCircle size={16} className="text-amber-600" />
          <span>Yağ Alımı Ekle</span>
        </button>
      </div>

      {/* 1. SUB TAB: YAĞ SATIŞI */}
      {subTab === 'sales' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <PlusCircle size={20} className="text-amber-700" />
              <span>Zeytinyağı Satışı</span>
            </h3>

            <form onSubmit={handleSaleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Tarih</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Teneke Tipi</label>
                  <select
                    value={saleTinType}
                    onChange={(e) => setSaleTinType(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="16 Litrelik Teneke">16 Litrelik Teneke</option>
                    <option value="5 Litrelik Teneke">5 Litrelik Teneke</option>
                    <option value="1 Litrelik Şişe">1 Litrelik Şişe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Müşteri Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Mustafa Kaya"
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Teneke Sayısı</label>
                  <NumericInput
                    placeholder="0"
                    value={saleTinCount}
                    onChange={(e) => setSaleTinCount(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Birim Fiyat (TL/Teneke)</label>
                  <NumericInput
                    placeholder="0"
                    value={saleUnitPrice}
                    onChange={(e) => setSaleUnitPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-amber-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Realtime Otomatik Hesaplama */}
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Toplam Miktar (Litre):</span>
                  <span className="font-bold text-amber-900 text-sm sm:text-base">{saleLiters} Litre</span>
                </div>
                <div className="flex justify-between items-center font-extrabold text-amber-950 pt-1 border-t border-amber-200/60">
                  <span>Otomatik Toplam Fiyat:</span>
                  <span className="text-base sm:text-lg">{formatTL(saleTotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60">
                  <div>
                    <label className="text-xs font-semibold text-emerald-800">Alınan Ödeme (TL)</label>
                    <NumericInput
                      placeholder="0"
                      value={salePaid}
                      onChange={(e) => setSalePaid(e.target.value)}
                      className="w-full mt-1 p-2 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-emerald-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-rose-700">Kalan Bakiye (TL)</span>
                    <div className="mt-1 p-2 bg-white border border-red-200 rounded-lg text-sm font-bold text-red-600">
                      {formatTL(saleBalance)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-sm shadow-md transition"
              >
                Zeytinyağı Satışını Kaydet
              </button>
            </form>
          </div>

          {/* Geçmiş Zeytinyağı Satışları Listesi */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Geçmiş Yağ Satışları</h3>
              <button
                onClick={() =>
                  exportToExcel(
                    data.oilSales.map((s) => ({
                      Tarih: s.date,
                      Müşteri: s.customerName,
                      Ambalaj: s.tinType,
                      'Teneke Adedi': s.tinCount,
                      'Toplam Litre': s.totalLiters,
                      'Birim Fiyat (TL)': s.unitPricePerTin,
                      'Toplam Fiyat (TL)': s.totalPrice,
                      'Alınan Ödeme (TL)': s.paidAmount,
                      'Kalan Bakiye (TL)': s.remainingBalance
                    })),
                    'Zeytinyagi_Satis_Gecmisi.xlsx',
                    'Yağ Satışları'
                  )
                }
                className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredOilSales.length === 0 ? (
                <p className="text-center text-xs sm:text-sm text-gray-400 py-3">Kayıt yok.</p>
              ) : (
                filteredOilSales.map((s) => (
                  <div key={s.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{s.customerName}</span>
                      <span className="font-extrabold text-amber-900 text-sm sm:text-base">{formatTL(s.totalPrice)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      {s.date} • {s.tinCount} Teneke ({s.totalLiters} L) @ {formatTL(s.unitPricePerTin)}
                    </p>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-xs sm:text-sm">
                      <span className="text-slate-700">Ödenen: <strong className="text-green-700">{formatTL(s.paidAmount)}</strong></span>
                      <span className="text-slate-700">Kalan Bakiye: <strong className="text-red-600">{formatTL(s.remainingBalance)}</strong></span>
                      <button onClick={() => setConfirmDeleteInfo({ id: s.id, type: 'sale', title: `${s.customerName} - Yağ Satışı` })} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB TAB: YAĞ ALIMI */}
      {subTab === 'purchases' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <PlusCircle size={20} className="text-amber-700" />
              <span>Zeytinyağı Alımı</span>
            </h3>

            <form onSubmit={handlePurchSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Tarih</label>
                  <input
                    type="date"
                    value={purchDate}
                    onChange={(e) => setPurchDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Teneke Tipi</label>
                  <select
                    value={purchTinType}
                    onChange={(e) => setPurchTinType(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="16 Litrelik Teneke">16 Litrelik Teneke</option>
                    <option value="5 Litrelik Teneke">5 Litrelik Teneke</option>
                    <option value="1 Litrelik Şişe">1 Litrelik Şişe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tedarikçi / Fabrika</label>
                <input
                  type="text"
                  placeholder="Örn: Edremit Yağ Fabrikası"
                  value={purchSupplier}
                  onChange={(e) => setPurchSupplier(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Teneke Sayısı</label>
                  <NumericInput
                    placeholder="0"
                    value={purchTinCount}
                    onChange={(e) => setPurchTinCount(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Birim Alım Fiyatı (TL)</label>
                  <NumericInput
                    placeholder="0"
                    value={purchUnitPrice}
                    onChange={(e) => setPurchUnitPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-amber-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 flex justify-between items-center text-xs sm:text-sm">
                <span className="text-slate-700 font-medium">Toplam Miktar: <strong className="text-slate-900">{purchLiters} Litre</strong></span>
                <span className="text-slate-700 font-medium">Toplam Alım Tutarı: <strong className="text-amber-900 text-sm sm:text-base font-extrabold">{formatTL(purchTotal)}</strong></span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-sm shadow-md transition"
              >
                Zeytinyağı Alımını Kaydet
              </button>
            </form>
          </div>

          {/* Geçmiş Alımlar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Geçmiş Yağ Alımları</h3>
              <button
                onClick={() =>
                  exportToExcel(
                    data.oilPurchases.map((p) => ({
                      Tarih: p.date,
                      Tedarikçi: p.supplier,
                      Ambalaj: p.tinType,
                      'Teneke Adedi': p.tinCount,
                      'Toplam Litre': p.totalLiters,
                      'Birim Fiyat (TL)': p.unitPricePerTin,
                      'Toplam Alım Tutarı (TL)': p.totalPrice
                    })),
                    'Zeytinyagi_Alim_Gecmisi.xlsx',
                    'Yağ Alımları'
                  )
                }
                className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>
            </div>

            <div className="space-y-2">
              {(data.oilPurchases || []).length === 0 ? (
                <p className="text-center text-xs sm:text-sm text-gray-400 py-3">Kayıt yok.</p>
              ) : (
                (data.oilPurchases || []).map((p) => (
                  <div key={p.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{p.supplier}</span>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{p.date} • {p.tinCount} Teneke ({p.totalLiters} L)</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-amber-900 text-sm sm:text-base">{formatTL(p.totalPrice)}</span>
                      <button onClick={() => setConfirmDeleteInfo({ id: p.id, type: 'purchase', title: `${p.supplier} - Yağ Alımı` })} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ÖZET KART - STOK DURUMU VE NET KAR / ZARAR (SAYFANIN EN ALTINDA) */}
      <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 text-white rounded-2xl p-4 shadow-md space-y-3 mt-4">
        <div className="flex items-center justify-between border-b border-amber-700/60 pb-2">
          <div className="flex items-center space-x-2">
            <Droplets size={22} className="text-yellow-300 animate-bounce" />
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-wide">ZEYTİNYAĞI STOK & KAR/ZARAR</h2>
              <p className="text-xs text-amber-200 font-medium">Canlı Bakiye Değerlemesi</p>
            </div>
          </div>
          <span className="text-xs sm:text-sm bg-yellow-400 text-amber-950 px-3 py-1 rounded-full font-extrabold">
            Stok: {formatNumber(remainingLiters)} Litre ({formatNumber(remainingTinEquivalent)} Teneke)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-700/40">
            <p className="text-xs text-amber-200 font-medium">Toplam Yağ Satış Tutarı</p>
            <p className="text-base sm:text-lg font-extrabold text-white mt-0.5">{formatTL(totalSalesTL)}</p>
          </div>

          <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-700/40">
            <p className="text-xs text-amber-200 font-medium">Kalan Stok Birim Fiyatı (TL/Teneke)</p>
            <NumericInput
              value={unitPriceInput}
              onChange={(e) => handleStockPriceChange(e.target.value)}
              placeholder="TL/Teneke"
              className="w-full mt-1 p-1.5 bg-amber-900/80 border border-yellow-400/50 rounded text-sm font-bold text-yellow-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-xs flex justify-between items-center border border-white/15">
          <div>
            <p className="text-xs text-amber-100 font-medium">Kalan Stok Parasal Değeri ({formatNumber(remainingLiters)} L / {formatNumber(remainingTinEquivalent)} Teneke)</p>
            <p className="text-sm sm:text-base font-bold text-amber-200">{formatTL(remainingValueTL)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-100 font-medium">Zeytinyağı Net Kar/Zarar</p>
            <p className={`text-base sm:text-lg font-extrabold ${netProfitTL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {formatTL(netProfitTL)}
            </p>
          </div>
        </div>
      </div>

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
            if (confirmDeleteInfo.type === 'sale') onDeleteOilSale(confirmDeleteInfo.id);
            else if (confirmDeleteInfo.type === 'purchase') onDeleteOilPurchase(confirmDeleteInfo.id);
            setConfirmDeleteInfo(null);
          }}
        />
      )}
    </div>
  );
};
