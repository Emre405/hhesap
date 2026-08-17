import React, { useState, useMemo } from 'react';
import { formatTL, formatNumber } from '../utils/helpers';
import { exportToExcel } from '../utils/excel';
import { X, FileSpreadsheet, CreditCard, ShoppingBag, Droplets, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export const CustomerDetailModal = ({ customer, data, onClose, onOpenPaymentModal }) => {
  const [detailTab, setDetailTab] = useState('all'); // 'all', 'olive', 'oil'

  const nameLower = (customer?.name || '').trim().toLowerCase();

  // Filter olive sales for this customer
  const customerOliveSales = useMemo(() => {
    if (!customer) return [];
    return (data?.oliveSales || []).filter(
      (s) => s.customerName && s.customerName.trim().toLowerCase() === nameLower
    );
  }, [data?.oliveSales, nameLower, customer]);

  // Filter oil sales for this customer
  const customerOilSales = useMemo(() => {
    if (!customer) return [];
    return (data?.oilSales || []).filter(
      (s) => s.customerName && s.customerName.trim().toLowerCase() === nameLower
    );
  }, [data?.oilSales, nameLower, customer]);

  // Combine all transactions sorted descending by date
  const allCustomerTransactions = useMemo(() => {
    if (!customer) return [];
    const list = [];

    customerOliveSales.forEach((s) => {
      list.push({
        ...s,
        type: 'olive',
        typeLabel: 'Zeytin Satışı',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        details: `${s.quantityKg} kg • ${s.calibre || '230-260'}`,
        unitPriceText: `${formatTL(s.unitPrice)} / kg`
      });
    });

    customerOilSales.forEach((s) => {
      list.push({
        ...s,
        type: 'oil',
        typeLabel: 'Yağ Satışı',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        details: `${s.tinCount} Teneke (${s.totalLiters || s.tinCount * 16} L)`,
        unitPriceText: `${formatTL(s.unitPricePerTin || s.unitPrice)} / Teneke`
      });
    });

    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || '').localeCompare(a.id || '');
    });

    return list;
  }, [customerOliveSales, customerOilSales]);

  // Excel Export Handler for this customer
  const handleExportStatement = () => {
    const exportData = [
      ...customerOliveSales.map((s) => ({
        Tarih: s.date,
        'İşlem Tipi': 'Zeytin Satışı',
        'Detay / Kalibre': s.calibre,
        'Miktar (kg)': s.quantityKg,
        'Birim Fiyat (TL)': s.unitPrice,
        'Toplam Tutar (TL)': s.totalPrice,
        'Ödenen Tutar (TL)': s.paidAmount,
        'Kalan Borç (TL)': s.remainingBalance
      })),
      ...customerOilSales.map((s) => ({
        Tarih: s.date,
        'İşlem Tipi': 'Zeytinyağı Satışı',
        'Detay / Kalibre': `${s.tinCount} Teneke (${s.totalLiters || s.tinCount * 16} L)`,
        'Miktar (kg/Teneke)': s.tinCount,
        'Birim Fiyat (TL)': s.unitPricePerTin || s.unitPrice,
        'Toplam Tutar (TL)': s.totalPrice,
        'Ödenen Tutar (TL)': s.paidAmount,
        'Kalan Borç (TL)': s.remainingBalance
      }))
    ];

    exportToExcel(
      exportData,
      `${customer?.name?.replace(/\s+/g, '_') || 'Musteri'}_Musteri_Ekstresi.xlsx`,
      'Müşteri Ekstresi'
    );
  };

  if (!customer) return null;

  const hasDebt = customer.totalRemaining > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl p-4 shadow-2xl space-y-3.5 border border-gray-100 my-auto max-h-[92vh] flex flex-col">
        {/* Modal Başlık Barı */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 flex-shrink-0">
          <div>
            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-1.5">
              <span>{customer.name}</span>
              {hasDebt ? (
                <AlertTriangle size={15} className="text-red-500" />
              ) : (
                <CheckCircle size={15} className="text-green-600" />
              )}
            </h3>
            <p className="text-[11px] text-gray-500">Müşteri Cari Hesap Detay Ekstresi</p>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleExportStatement}
              title="Ekstreyi Excel İndir"
              className="flex items-center space-x-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-[11px] font-bold transition active:scale-95"
            >
              <FileSpreadsheet size={14} />
              <span>Excel</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Özet Bakiye Kartı */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-100">
              <p className="text-[10px] text-gray-500">Toplam Alışveriş</p>
              <p className="text-xs font-extrabold text-gray-900 mt-0.5">{formatTL(customer.totalSales)}</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
              <p className="text-[10px] text-emerald-700 font-medium">Toplam Tahsilat</p>
              <p className="text-xs font-extrabold text-emerald-800 mt-0.5">{formatTL(customer.totalPaid)}</p>
            </div>
            <div className={`p-2 rounded-lg border ${hasDebt ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <p className={`text-[10px] font-medium ${hasDebt ? 'text-red-600' : 'text-green-700'}`}>Kalan Borç</p>
              <p className={`text-xs font-extrabold mt-0.5 ${hasDebt ? 'text-red-600' : 'text-green-700'}`}>
                {formatTL(customer.totalRemaining)}
              </p>
            </div>
          </div>

          {hasDebt && onOpenPaymentModal && (
            <button
              onClick={() => {
                onClose();
                onOpenPaymentModal(customer);
              }}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
            >
              <CreditCard size={14} />
              <span>Bu Müşteriden Tahsilat Yap ({formatTL(customer.totalRemaining)})</span>
            </button>
          )}
        </div>

        {/* Sekme Seçenekleri: Tümü / Zeytin / Zeytinyağı */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold flex-shrink-0">
          <button
            onClick={() => setDetailTab('all')}
            className={`flex-1 py-1.5 rounded-lg transition ${detailTab === 'all' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500'
              }`}
          >
            Tüm Hareketler ({allCustomerTransactions.length})
          </button>
          <button
            onClick={() => setDetailTab('olive')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${detailTab === 'olive' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-gray-500'
              }`}
          >
            <ShoppingBag size={13} />
            <span>Zeytin ({customerOliveSales.length})</span>
          </button>
          <button
            onClick={() => setDetailTab('oil')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${detailTab === 'oil' ? 'bg-white text-amber-800 shadow-xs font-bold' : 'text-gray-500'
              }`}
          >
            <Droplets size={13} />
            <span>Yağ ({customerOilSales.length})</span>
          </button>
        </div>

        {/* İŞLEM LİSTESİ */}
        <div className="overflow-y-auto space-y-2.5 pr-0.5 flex-1 max-h-[50vh]">
          {detailTab === 'all' && (
            allCustomerTransactions.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-400 py-6">Müşteriye ait işlem bulunamadı.</p>
            ) : (
              allCustomerTransactions.map((tx) => (
                <div key={tx.id || Math.random()} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${tx.badgeClass}`}>
                          {tx.typeLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{tx.date}</span>
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">{tx.details}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm sm:text-base font-extrabold text-slate-900">{formatTL(tx.totalPrice)}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">{tx.unitPriceText}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 text-xs sm:text-sm">
                    <span className="text-slate-700">
                      Ödenen: <strong className="text-emerald-700 font-bold">{formatTL(tx.paidAmount)}</strong>
                    </span>
                    <span className={`font-bold ${tx.remainingBalance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {tx.remainingBalance > 0 ? `Borç: ${formatTL(tx.remainingBalance)}` : 'Ödendi'}
                    </span>
                  </div>
                </div>
              ))
            )
          )}

          {detailTab === 'olive' && (
            customerOliveSales.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-400 py-6">Zeytin satışı kaydı yok.</p>
            ) : (
              customerOliveSales.map((s) => (
                <div key={s.id} className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-1.5 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1">
                        <Calendar size={13} className="text-emerald-600" />
                        <span>Tarih: {s.date}</span>
                      </span>
                      <p className="text-sm sm:text-base font-extrabold text-emerald-950 mt-1">
                        {s.quantityKg} kg • {s.calibre} Kalibre
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-extrabold text-emerald-900">{formatTL(s.totalPrice)}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Birim: {formatTL(s.unitPrice)}/kg</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-emerald-100 text-xs sm:text-sm">
                    <span className="text-slate-700">Alınan: <strong className="text-emerald-700 font-bold">{formatTL(s.paidAmount)}</strong></span>
                    <span className={`font-bold ${s.remainingBalance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {s.remainingBalance > 0 ? `Borç: ${formatTL(s.remainingBalance)}` : 'Ödendi'}
                    </span>
                  </div>
                </div>
              ))
            )
          )}

          {detailTab === 'oil' && (
            customerOilSales.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-400 py-6">Zeytinyağı satışı kaydı yok.</p>
            ) : (
              customerOilSales.map((s) => (
                <div key={s.id} className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 space-y-1.5 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1">
                        <Calendar size={13} className="text-amber-600" />
                        <span>Tarih: {s.date}</span>
                      </span>
                      <p className="text-sm sm:text-base font-extrabold text-amber-950 mt-1">
                        {s.tinCount} Teneke ({s.totalLiters || s.tinCount * 16} L)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-extrabold text-amber-900">{formatTL(s.totalPrice)}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">Birim: {formatTL(s.unitPricePerTin || s.unitPrice)}/Teneke</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-amber-100 text-xs sm:text-sm">
                    <span className="text-slate-700">Alınan: <strong className="text-emerald-700 font-bold">{formatTL(s.paidAmount)}</strong></span>
                    <span className={`font-bold ${s.remainingBalance > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {s.remainingBalance > 0 ? `Borç: ${formatTL(s.remainingBalance)}` : 'Ödendi'}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        <div className="pt-2 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
