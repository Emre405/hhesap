import React, { useState, useMemo } from 'react';
import { formatTL } from '../utils/helpers';
import { exportToExcel } from '../utils/excel';
import { Search, FileSpreadsheet, Users, Wallet, CheckCircle, AlertTriangle, CreditCard, X, Eye, FileText } from 'lucide-react';
import { CustomerDetailModal } from './CustomerDetailModal';
import NumericInput from './NumericInput';

export const CustomersTab = ({ data, onRecordPayment }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'debtors', 'settled'
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaymentModal, setActivePaymentModal] = useState(null); // customer object
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null); // customer object for statement modal

  // Group transactions by customer
  const customerMap = useMemo(() => {
    const map = {};

    // Process Zeytin sales
    data.oliveSales.forEach((sale) => {
      const name = sale.customerName.trim();
      if (!map[name]) {
        map[name] = { name, totalSales: 0, totalPaid: 0, totalRemaining: 0, oliveSalesCount: 0, oilSalesCount: 0 };
      }
      map[name].totalSales += Number(sale.totalPrice) || 0;
      map[name].totalPaid += Number(sale.paidAmount) || 0;
      map[name].totalRemaining += Number(sale.remainingBalance) || 0;
      map[name].oliveSalesCount += 1;
    });

    // Process Zeytinyağı sales
    data.oilSales.forEach((sale) => {
      const name = sale.customerName.trim();
      if (!map[name]) {
        map[name] = { name, totalSales: 0, totalPaid: 0, totalRemaining: 0, oliveSalesCount: 0, oilSalesCount: 0 };
      }
      map[name].totalSales += Number(sale.totalPrice) || 0;
      map[name].totalPaid += Number(sale.paidAmount) || 0;
      map[name].totalRemaining += Number(sale.remainingBalance) || 0;
      map[name].oilSalesCount += 1;
    });

    return Object.values(map);
  }, [data.oliveSales, data.oilSales]);

  // Overall customer metrics
  const totalCustomerSales = customerMap.reduce((acc, c) => acc + c.totalSales, 0);
  const totalCustomerPaid = customerMap.reduce((acc, c) => acc + c.totalPaid, 0);
  const totalCustomerRemaining = customerMap.reduce((acc, c) => acc + c.totalRemaining, 0);

  // Filter logic
  const filteredCustomers = customerMap.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'debtors') return c.totalRemaining > 0;
    if (filterType === 'settled') return c.totalRemaining <= 0;
    return true;
  });

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentAmountInput);
    if (!amount || amount <= 0) {
      alert('Geçerli bir tahsilat tutarı giriniz.');
      return;
    }
    if (amount > activePaymentModal.totalRemaining) {
      if (!confirm('Girilen tutar müşterinin mevcut borcundan fazladır. Devam etmek istiyor musunuz?')) {
        return;
      }
    }
    onRecordPayment(activePaymentModal.name, amount);
    setActivePaymentModal(null);
    setPaymentAmountInput('');
    alert(`${activePaymentModal.name} müşterisinden ${formatTL(amount)} tahsilat alındı ve bakiye güncellendi.`);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Üst Özet Kartları */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-800">
              <Users size={18} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Cari Hesap Bakiyeleri</h2>
          </div>
          <button
            onClick={() =>
              exportToExcel(
                customerMap.map((c) => ({
                  'Müşteri Adı': c.name,
                  'Toplam Satış (TL)': c.totalSales,
                  'Alınan Ödeme (TL)': c.totalPaid,
                  'Kalan Borç (TL)': c.totalRemaining,
                  'Bakiye Durumu': c.totalRemaining > 0 ? 'Borçlu' : 'Ödendi'
                })),
                'Musteri_Cari_Hesaplar.xlsx',
                'Müşteriler'
              )
            }
            className="flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold"
          >
            <FileSpreadsheet size={14} />
            <span>Excel'e Aktar</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Toplam Satış</p>
            <p className="font-extrabold text-gray-900 mt-0.5 text-sm sm:text-base">{formatTL(totalCustomerSales)}</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium">Tahsil Edilen</p>
            <p className="font-extrabold text-emerald-800 mt-0.5 text-sm sm:text-base">{formatTL(totalCustomerPaid)}</p>
          </div>
          <div className="bg-red-50 p-2 rounded-xl border border-red-100">
            <p className="text-xs text-red-600 font-medium">Toplam Alacak</p>
            <p className="font-extrabold text-red-600 mt-0.5 text-sm sm:text-base">{formatTL(totalCustomerRemaining)}</p>
          </div>
        </div>
      </div>

      {/* Filtre ve Arama */}
      <div className="space-y-2">
        <div className="flex bg-slate-200/90 p-1.5 rounded-2xl text-sm sm:text-base gap-1 shadow-inner border border-slate-300/60">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-2 rounded-xl transition-all duration-150 ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/30 font-extrabold scale-[1.02]'
                : 'text-slate-700 hover:text-slate-900 font-bold hover:bg-slate-300/50'
            }`}
          >
            Tümü ({customerMap.length})
          </button>
          <button
            onClick={() => setFilterType('debtors')}
            className={`flex-1 py-2 rounded-xl transition-all duration-150 ${
              filterType === 'debtors'
                ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600/30 font-extrabold scale-[1.02]'
                : 'text-slate-700 hover:text-red-700 font-bold hover:bg-red-50/60'
            }`}
          >
            Borçlular ({customerMap.filter((c) => c.totalRemaining > 0).length})
          </button>
          <button
            onClick={() => setFilterType('settled')}
            className={`flex-1 py-2 rounded-xl transition-all duration-150 ${
              filterType === 'settled'
                ? 'bg-emerald-700 text-white shadow-md ring-2 ring-emerald-700/30 font-extrabold scale-[1.02]'
                : 'text-slate-700 hover:text-emerald-700 font-bold hover:bg-emerald-50/60'
            }`}
          >
            Borçsuzlar ({customerMap.filter((c) => c.totalRemaining <= 0).length})
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri adıyla ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Mobil Müşteri Kartları */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl text-center text-xs sm:text-sm text-gray-400 border border-gray-100">
            Aranan kriterlere uygun müşteri bulunamadı.
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const hasDebt = cust.totalRemaining > 0;

            return (
              <div
                key={cust.name}
                className={`bg-white rounded-2xl p-3.5 shadow-xs border transition-all hover:shadow-md cursor-pointer ${
                  hasDebt ? 'border-red-200 red-card-border' : 'border-emerald-200 green-card-border'
                }`}
                onClick={() => setSelectedCustomerDetail(cust)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center space-x-1.5 hover:text-emerald-800 transition">
                      <span className="underline decoration-dotted underline-offset-2">{cust.name}</span>
                      {hasDebt ? (
                        <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                      ) : (
                        <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      Zeytin Satışı: {cust.oliveSalesCount} • Yağ Satışı: {cust.oilSalesCount}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-block ${
                        hasDebt ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {hasDebt ? 'Borçlu' : 'Tamamı Ödendi'}
                    </span>
                    <p className={`text-base font-extrabold mt-1 ${hasDebt ? 'text-red-600' : 'text-green-700'}`}>
                      {formatTL(cust.totalRemaining)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomerDetail(cust);
                    }}
                    className="text-gray-700 hover:text-emerald-800 text-xs sm:text-sm font-bold flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
                  >
                    <Eye size={14} className="text-emerald-700" />
                    <span>Ekstre / Detaylar</span>
                  </button>

                  {hasDebt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePaymentModal(cust);
                        setPaymentAmountInput(cust.totalRemaining.toString());
                      }}
                      className="bg-emerald-800 hover:bg-emerald-900 text-white px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center space-x-1 transition active:scale-95"
                    >
                      <CreditCard size={14} />
                      <span>Tahsilat Yap</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TAHSİLAT YAP MODALI */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-2xl p-4.5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 border border-gray-100 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-1.5">
                <Wallet size={18} className="text-emerald-700" />
                <span>Tahsilat Al - {activePaymentModal.name}</span>
              </h3>
              <button onClick={() => setActivePaymentModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div className="bg-red-50 p-3 rounded-xl text-xs sm:text-sm space-y-1 border border-red-100">
              <p className="text-slate-600 font-medium">Mevcut Toplam Borç:</p>
              <p className="text-xl font-extrabold text-red-600">{formatTL(activePaymentModal.totalRemaining)}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tahsil Edilen Tutar (TL)</label>
                <NumericInput
                  placeholder="0"
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-extrabold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActivePaymentModal(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition active:scale-95"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
                >
                  Tahsilatı Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MÜŞTERİ EKSTRE / DETAY MODALI */}
      {selectedCustomerDetail && (
        <CustomerDetailModal
          customer={selectedCustomerDetail}
          data={data}
          onClose={() => setSelectedCustomerDetail(null)}
          onOpenPaymentModal={(cust) => {
            setActivePaymentModal(cust);
            setPaymentAmountInput(cust.totalRemaining.toString());
          }}
        />
      )}
    </div>
  );
};
