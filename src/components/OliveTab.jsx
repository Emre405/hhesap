import React, { useState, useMemo } from 'react';
import { formatTL, formatNumber, getTodayString } from '../utils/helpers';
import { exportToExcel } from '../utils/excel';
import { PlusCircle, Search, FileSpreadsheet, Trash2, ChevronDown, ChevronUp, ShoppingBag, Box, DollarSign } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import NumericInput from './NumericInput';

export const OliveTab = ({ data, onAddOliveSale, onDeleteOliveSale, onAddOliveStock, onDeleteOliveStock, onAddOliveCost, onDeleteOliveCost }) => {
  const [subTab, setSubTab] = useState('sales'); // 'sales', 'stock', 'costs'
  const [confirmDeleteInfo, setConfirmDeleteInfo] = useState(null); // { id, type, title }

  // Form State: Zeytin Satışı
  const [saleDate, setSaleDate] = useState(getTodayString());
  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleCalibre, setSaleCalibre] = useState('230-260');
  const [saleQuantity, setSaleQuantity] = useState('');
  const [saleUnitPrice, setSaleUnitPrice] = useState('');
  const [salePaid, setSalePaid] = useState('');

  // Form State: Zeytin Stok Girişi
  const [stockDate, setStockDate] = useState(getTodayString());
  const [stockSupplier, setStockSupplier] = useState('');
  const [stockCalibre, setStockCalibre] = useState('230-260');
  const [stockQuantity, setStockQuantity] = useState('');

  // Form State: Zeytin Alım Maliyeti
  const [costDate, setCostDate] = useState(getTodayString());
  const [costCategory, setCostCategory] = useState('Zeytin Alım Tutarı');
  const [costAmount, setCostAmount] = useState('');
  const [costDesc, setCostDesc] = useState('');

  // List Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [expandedId, setExpandedId] = useState(null);

  // Auto Calculation for Zeytin Satışı Form
  const calcTotalSale = useMemo(() => {
    const q = Number(saleQuantity) || 0;
    const p = Number(saleUnitPrice) || 0;
    return q * p;
  }, [saleQuantity, saleUnitPrice]);

  const calcRemainingSale = useMemo(() => {
    const paid = Number(salePaid) || 0;
    return Math.max(0, calcTotalSale - paid);
  }, [calcTotalSale, salePaid]);

  // Handlers
  const handleSaleSubmit = (e) => {
    e.preventDefault();
    if (!saleCustomer || !saleQuantity || !saleUnitPrice) {
      alert('Lütfen Müşteri, Miktar ve Birim Fiyat alanlarını doldurunuz.');
      return;
    }
    const newSale = {
      id: 'os-' + Date.now(),
      date: saleDate,
      customerName: saleCustomer.trim(),
      calibre: saleCalibre,
      quantityKg: Number(saleQuantity),
      unitPrice: Number(saleUnitPrice),
      totalPrice: calcTotalSale,
      paidAmount: Number(salePaid) || 0,
      remainingBalance: calcRemainingSale
    };
    onAddOliveSale(newSale);
    // Reset form
    setSaleCustomer('');
    setSaleQuantity('');
    setSaleUnitPrice('');
    setSalePaid('');
    alert('Zeytin satışı başarıyla eklendi.');
  };

  const handleStockSubmit = (e) => {
    e.preventDefault();
    if (!stockQuantity) {
      alert('Lütfen miktar bilgisini giriniz.');
      return;
    }
    const newStock = {
      id: 'ost-' + Date.now(),
      date: stockDate,
      supplier: stockSupplier.trim() || 'Genel Giriş',
      calibre: stockCalibre,
      quantityKg: Number(stockQuantity)
    };
    onAddOliveStock(newStock);
    setStockSupplier('');
    setStockQuantity('');
    alert('Stok girişi eklendi.');
  };

  const handleCostSubmit = (e) => {
    e.preventDefault();
    if (!costAmount) {
      alert('Lütfen tutar giriniz.');
      return;
    }
    const newCost = {
      id: 'oc-' + Date.now(),
      date: costDate,
      category: costCategory,
      amount: Number(costAmount),
      description: costDesc.trim()
    };
    onAddOliveCost(newCost);
    setCostAmount('');
    setCostDesc('');
    alert('Maliyet kalemi eklendi.');
  };

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return data.oliveSales
      .filter((s) => s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || s.calibre.includes(searchQuery))
      .slice(0, pageSize === 'all' ? undefined : Number(pageSize));
  }, [data.oliveSales, searchQuery, pageSize]);

  // Cost Sub-summaries
  const totalRawOliveCost = data.oliveCosts
    .filter((c) => c.category === 'Zeytin Alım Tutarı')
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const totalOtherCosts = data.oliveCosts
    .filter((c) => c.category !== 'Zeytin Alım Tutarı')
    .reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

  const totalAllCosts = totalRawOliveCost + totalOtherCosts;

  return (
    <div className="space-y-4 pb-4">
      {/* Sub Tab Navigation Pills */}
      <div className="flex bg-gray-200/80 p-1 rounded-xl text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setSubTab('sales')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subTab === 'sales' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Zeytin Satışı</span>
        </button>
        <button
          onClick={() => setSubTab('stock')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subTab === 'stock' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <Box size={14} />
          <span>Stok Girişi</span>
        </button>
        <button
          onClick={() => setSubTab('costs')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1 transition ${
            subTab === 'costs' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600'
          }`}
        >
          <DollarSign size={14} />
          <span>Maliyetler</span>
        </button>
      </div>

      {/* 1. SUB TAB: ZEYTİN SATIŞI */}
      {subTab === 'sales' && (
        <div className="space-y-4">
          {/* Form Kartı */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <PlusCircle size={20} className="text-emerald-700" />
                <span>Zeytin Satışı</span>
              </h3>
            </div>

            <form onSubmit={handleSaleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Tarih</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Zeytin Kalibresi</label>
                  <select
                    value={saleCalibre}
                    onChange={(e) => setSaleCalibre(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="230-260">230 - 260 Kalibre</option>
                    <option value="260-290">260 - 290 Kalibre</option>
                    <option value="290-320">290 - 320 Kalibre</option>
                    <option value="Yeşil Zeytin">Yeşil Zeytin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Müşteri Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={saleCustomer}
                  onChange={(e) => setSaleCustomer(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Miktar (kg)</label>
                  <NumericInput
                    placeholder="0"
                    value={saleQuantity}
                    onChange={(e) => setSaleQuantity(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Birim Fiyat (TL/kg)</label>
                  <NumericInput
                    placeholder="0"
                    value={saleUnitPrice}
                    onChange={(e) => setSaleUnitPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Realtime Otomatik Hesaplama Kartı */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 font-medium">Toplam Tutar:</span>
                  <span className="font-extrabold text-emerald-900 text-base">{formatTL(calcTotalSale)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/40">
                  <div>
                    <label className="text-xs font-semibold text-emerald-900">Alınan Ödeme (TL)</label>
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
                      {formatTL(calcRemainingSale)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition active:scale-98 flex items-center justify-center space-x-1.5"
              >
                <PlusCircle size={18} />
                <span>Zeytin Satışını Kaydet</span>
              </button>
            </form>
          </div>

          {/* Geçmiş Zeytin Satışları Listesi */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Geçmiş Zeytin Satışları</h3>
              <button
                onClick={() =>
                  exportToExcel(
                    data.oliveSales.map((s) => ({
                      Tarih: s.date,
                      Müşteri: s.customerName,
                      Kalibre: s.calibre,
                      'Miktar (kg)': s.quantityKg,
                      'Birim Fiyat (TL)': s.unitPrice,
                      'Toplam Tutar (TL)': s.totalPrice,
                      'Alınan Ödeme (TL)': s.paidAmount,
                      'Kalan Bakiye (TL)': s.remainingBalance
                    })),
                    'Zeytin_Satis_Gecmisi.xlsx',
                    'Zeytin Satışları'
                  )
                }
                className="flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-emerald-200 transition"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>
            </div>

            {/* Arama & Sayfalama */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Müşteri veya kalibre ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="py-2 px-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700"
              >
                <option value="5">Son 5</option>
                <option value="10">Son 10</option>
                <option value="20">Son 20</option>
                <option value="all">Tümü</option>
              </select>
            </div>

            {/* Mobil Kart Yapısında Liste */}
            <div className="space-y-2">
              {filteredSales.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">Kayıt bulunamadı.</p>
              ) : (
                filteredSales.map((sale) => {
                  const isExpanded = expandedId === sale.id;
                  const isPaid = sale.remainingBalance <= 0;

                  return (
                    <div key={sale.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : sale.id)}
                        className="flex justify-between items-center cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm sm:text-base font-bold text-gray-900">{sale.customerName}</span>
                            <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-semibold">
                              {sale.calibre}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{sale.date} • {formatNumber(sale.quantityKg)} kg @ {formatTL(sale.unitPrice)}/kg</p>
                        </div>

                        <div className="text-right flex items-center space-x-2">
                          <div>
                            <p className="text-sm sm:text-base font-extrabold text-emerald-900">{formatTL(sale.totalPrice)}</p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-md font-bold inline-block mt-0.5 ${
                                isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {isPaid ? 'Ödendi' : `Bakiye: ${formatTL(sale.remainingBalance)}`}
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                        </div>
                      </div>

                      {/* Detay Kartı (Collapsible) */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-200 text-xs sm:text-sm space-y-1.5 bg-white p-2.5 rounded-lg">
                          <div className="flex justify-between text-slate-700">
                            <span>Toplanan Ödeme:</span>
                            <strong className="text-green-700">{formatTL(sale.paidAmount)}</strong>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>Kalan Borç Tutarı:</span>
                            <strong className="text-red-600">{formatTL(sale.remainingBalance)}</strong>
                          </div>
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setConfirmDeleteInfo({ id: sale.id, type: 'sale', title: `${sale.customerName} - Zeytin Satışı` })}
                              className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-bold flex items-center space-x-1 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                            >
                              <Trash2 size={14} />
                              <span>Kaydı Sil</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SUB TAB: ZEYTİN STOK GİRİŞİ */}
      {subTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Box size={20} className="text-emerald-700" />
              <span>Zeytin Stok Girişi</span>
            </h3>

            <form onSubmit={handleStockSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Tarih</label>
                  <input
                    type="date"
                    value={stockDate}
                    onChange={(e) => setStockDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Kalibre Seçimi</label>
                  <select
                    value={stockCalibre}
                    onChange={(e) => setStockCalibre(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="230-260">230 - 260 Kalibre</option>
                    <option value="260-290">260 - 290 Kalibre</option>
                    <option value="290-320">290 - 320 Kalibre</option>
                    <option value="Yeşil Zeytin">Yeşil Zeytin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tedarikçi / Bahçe Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Ayvalık Müstahsil / Kendi Bahçemiz"
                  value={stockSupplier}
                  onChange={(e) => setStockSupplier(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Giriş Yapılan Miktar (kg)</label>
                <NumericInput
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm shadow-md transition"
              >
                Stok Girişini Kaydet
              </button>
            </form>
          </div>

          {/* Stok Girişi Geçmişi Listesi */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Geçmiş Stok Girişleri</h3>
              <button
                onClick={() =>
                  exportToExcel(
                    data.oliveStockEntries.map((st) => ({
                      Tarih: st.date,
                      Tedarikçi: st.supplier,
                      Kalibre: st.calibre,
                      'Miktar (kg)': st.quantityKg
                    })),
                    'Zeytin_Stok_Girisleri.xlsx',
                    'Stok Girişleri'
                  )
                }
                className="flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>
            </div>

            <div className="space-y-2">
              {data.oliveStockEntries.map((st) => (
                <div key={st.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{st.supplier}</span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{st.date} • {st.calibre}</p>
                  </div>
                  <div className="text-right flex items-center space-x-2">
                    <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-sm">
                      +{formatNumber(st.quantityKg)} kg
                    </span>
                    <button
                      onClick={() => setConfirmDeleteInfo({ id: st.id, type: 'stock', title: `${st.supplier} - Stok Girişi` })}
                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB TAB: ZEYTİN MALİYETLERİ */}
      {subTab === 'costs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <DollarSign size={20} className="text-amber-600" />
              <span>Zeytin Alım Maliyeti / Gider Ekle</span>
            </h3>

            <form onSubmit={handleCostSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Tarih</label>
                  <input
                    type="date"
                    value={costDate}
                    onChange={(e) => setCostDate(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">Maliyet Kalemi</label>
                  <select
                    value={costCategory}
                    onChange={(e) => setCostCategory(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Zeytin Alım Tutarı">Zeytin Alım Tutarı (Müstahsil)</option>
                    <option value="Tuz ve İşçilik">Tuz ve İşçilik</option>
                    <option value="Nakliye & Ambalaj">Nakliye & Ambalaj</option>
                    <option value="Diğer Giderler">Diğer Giderler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tutar (TL)</label>
                <NumericInput
                  placeholder="0"
                  value={costAmount}
                  onChange={(e) => setCostAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-amber-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Açıklama</label>
                <input
                  type="text"
                  placeholder="Örn: Edremit alımı 2. parti ödemesi"
                  value={costDesc}
                  onChange={(e) => setCostDesc(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition"
              >
                Maliyet Kaydını Ekle
              </button>
            </form>
          </div>

          {/* Maliyetler Özeti & Geçmiş Liste */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Geçmiş Maliyetler & Alt Özet</h3>
              <button
                onClick={() =>
                  exportToExcel(
                    data.oliveCosts.map((c) => ({
                      Tarih: c.date,
                      Kategori: c.category,
                      'Tutar (TL)': c.amount,
                      Açıklama: c.description
                    })),
                    'Zeytin_Maliyet_Giderleri.xlsx',
                    'Maliyetler'
                  )
                }
                className="flex items-center space-x-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold"
              >
                <FileSpreadsheet size={14} />
                <span>Excel</span>
              </button>
            </div>

            {/* Alt Özet Kartı */}
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-700">
                <span>Toplam Zeytin Alım Tutarı:</span>
                <strong className="text-amber-900">{formatTL(totalRawOliveCost)}</strong>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Diğer Giderler (İşçilik, Nakliye vb.):</span>
                <strong className="text-amber-800">{formatTL(totalOtherCosts)}</strong>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-amber-950 pt-1 border-t border-amber-200">
                <span>GENEL TOPLAM MALİYET:</span>
                <span>{formatTL(totalAllCosts)}</span>
              </div>
            </div>

            {/* Liste */}
            <div className="space-y-2 pt-1">
              {data.oliveCosts.map((cost) => (
                <div key={cost.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{cost.category}</span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{cost.date} • {cost.description || 'Açıklama yok'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-amber-900 text-sm sm:text-base">{formatTL(cost.amount)}</span>
                    <button onClick={() => setConfirmDeleteInfo({ id: cost.id, type: 'cost', title: `${cost.category} - Maliyet` })} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
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
            if (confirmDeleteInfo.type === 'sale') onDeleteOliveSale(confirmDeleteInfo.id);
            else if (confirmDeleteInfo.type === 'stock') onDeleteOliveStock(confirmDeleteInfo.id);
            else if (confirmDeleteInfo.type === 'cost') onDeleteOliveCost(confirmDeleteInfo.id);
            setConfirmDeleteInfo(null);
          }}
        />
      )}
    </div>
  );
};
