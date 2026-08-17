import React, { useState, useMemo } from 'react';
import { formatTL, formatNumber } from '../utils/helpers';
import { DollarSign, ShoppingBag, Droplets, TrendingUp, TrendingDown, Scale, ShieldAlert, History, Edit3, Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { EditTransactionModal } from './EditTransactionModal';

export const DashboardTab = ({ data, onUpdateTransaction, onDeleteTransaction }) => {
  const [filterLimit, setFilterLimit] = useState('10'); // '10', '20', 'all'
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // 1. Özet Metrik Hesaplamaları
  const totalOliveSalesTL = (data.oliveSales || []).reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const totalOliveCostsTL = (data.oliveCosts || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const oliveProfitTL = totalOliveSalesTL - totalOliveCostsTL;

  // Alacak Dağılımı
  const oliveReceivables = (data.oliveSales || []).reduce((acc, curr) => acc + (Number(curr.remainingBalance) || 0), 0);
  const oilReceivables = (data.oilSales || []).reduce((acc, curr) => acc + (Number(curr.remainingBalance) || 0), 0);
  const totalReceivablesTL = oliveReceivables + oilReceivables;

  // 2. Zeytin Stok & Kalibre Hesaplamaları
  const totalOliveSalesKg = (data.oliveSales || []).reduce((acc, curr) => acc + (Number(curr.quantityKg) || 0), 0);

  const calibres = ['230-260', '260-290', '290-320', 'Yeşil Zeytin'];
  const stockByCalibre = calibres.map((cal) => {
    const totalGiris = (data.oliveStockEntries || [])
      .filter((item) => item.calibre === cal)
      .reduce((acc, item) => acc + (Number(item.quantityKg) || 0), 0);

    const totalCikis = (data.oliveSales || [])
      .filter((item) => item.calibre === cal)
      .reduce((acc, item) => acc + (Number(item.quantityKg) || 0), 0);

    const remainingKg = Math.max(0, totalGiris - totalCikis);
    return { calibre: cal, girisKg: totalGiris, cikisKg: totalCikis, remainingKg };
  });

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

  // 3. Zeytinyağı Stok Özet
  const totalOilBoughtLiters = (data.oilPurchases || []).reduce((acc, curr) => acc + getItemLiters(curr), 0);
  const totalOilSoldLiters = (data.oilSales || []).reduce((acc, curr) => acc + getItemLiters(curr), 0);
  const remainingOilLiters = Math.max(0, totalOilBoughtLiters - totalOilSoldLiters);
  const remainingOilTinEquivalent = remainingOilLiters / 16;

  const totalOilSalesTL = (data.oilSales || []).reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const totalOilPurchasesTL = (data.oilPurchases || []).reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const estimatedRemainingOilValueTL = remainingOilTinEquivalent * (Number(data.oilStockUnitPrice) || 0);
  const netOilProfitTL = (totalOilSalesTL + estimatedRemainingOilValueTL) - totalOilPurchasesTL;

  // 4. Tüm Son İşlemlerin Birleştirilmesi
  const allTransactions = useMemo(() => {
    const list = [];

    // Zeytin Satışları
    (data.oliveSales || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'oliveSale',
        title: item.customerName || 'Zeytin Müşterisi',
        subtitle: `${item.quantityKg} kg • ${item.calibre || 'Kalibre'}`,
        amount: Number(item.totalPrice) || 0,
        badgeText: 'Zeytin Satışı',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      });
    });

    // Zeytinyağı Satışları
    (data.oilSales || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'oilSale',
        title: item.customerName || 'Yağ Müşterisi',
        subtitle: `${item.tinCount} Teneke Yağ`,
        amount: Number(item.totalPrice) || 0,
        badgeText: 'Yağ Satışı',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
      });
    });

    // Zeytinyağı Alışları
    (data.oilPurchases || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'oilPurchase',
        title: item.supplier || 'Yağ Tedarikçisi',
        subtitle: `${item.tinCount} Teneke Alım`,
        amount: Number(item.totalPrice) || 0,
        badgeText: 'Yağ Alımı',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
      });
    });

    // Zeytin Giderleri
    (data.oliveCosts || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'oliveCost',
        title: item.description || item.category || 'Gider',
        subtitle: item.category || 'Masraf',
        amount: Number(item.amount) || 0,
        badgeText: 'Gider',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
      });
    });

    // Stok Girişleri
    (data.oliveStockEntries || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'oliveStock',
        title: item.supplier || 'Stok Girişi',
        subtitle: `${item.quantityKg} kg • ${item.calibre}`,
        amount: 0,
        badgeText: 'Stok Girişi',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
      });
    });

    // Borç Kayıtları
    (data.debts || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'debt',
        title: item.personName || 'Borçlu',
        subtitle: item.description || 'Borç Kaydı',
        amount: Number(item.amount) || 0,
        badgeText: 'Borç',
        badgeClass: 'bg-red-100 text-red-800 border-red-200'
      });
    });

    // Alacak Kayıtları
    (data.assets || []).forEach((item) => {
      list.push({
        ...item,
        itemType: 'asset',
        title: item.personName || 'Alacaklı',
        subtitle: item.description || 'Alacak Kaydı',
        amount: Number(item.amount) || 0,
        badgeText: 'Alacak',
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-200'
      });
    });

    // Tarihe (varsa ID timestamp'e) göre yeniden eskiye sırala
    list.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || '').localeCompare(a.id || '');
    });

    return list;
  }, [data]);

  // Filtreye göre kesilen işlem listesi
  const displayedTransactions = useMemo(() => {
    if (filterLimit === '10') return allTransactions.slice(0, 10);
    if (filterLimit === '20') return allTransactions.slice(0, 20);
    return allTransactions;
  }, [allTransactions, filterLimit]);

  return (
    <div className="space-y-4 pb-4">
      {/* Ana Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Genel Durum & Özet</h2>
          <p className="text-xs text-gray-500">Mevcut hesaplar ve stok genel bakışı</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">
          Canlı Güncel
        </span>
      </div>

      {/* Özet Metrik Kartları (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Satış Tutarı */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs olive-card-border">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Zeytin Satışı</span>
            <ShoppingBag size={18} />
          </div>
          <p className="text-base sm:text-xl font-extrabold text-gray-900">{formatTL(totalOliveSalesTL)}</p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Toplam Zeytin Geliri</p>
        </div>

        {/* Toplam Maliyet */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs amber-card-border">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Maliyetler</span>
            <DollarSign size={18} />
          </div>
          <p className="text-base sm:text-xl font-extrabold text-gray-900">{formatTL(totalOliveCostsTL)}</p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">Alım + Diğer Giderler</p>
        </div>

        {/* Kar - Zarar Durumu */}
        <div className={`bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs ${oliveProfitTL >= 0 ? 'green-card-border' : 'red-card-border'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Zeytin Kar/Zarar</span>
            {oliveProfitTL >= 0 ? <TrendingUp size={18} className="text-green-600" /> : <TrendingDown size={18} className="text-red-600" />}
          </div>
          <p className={`text-base sm:text-xl font-extrabold ${oliveProfitTL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatTL(oliveProfitTL)}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">{oliveProfitTL >= 0 ? 'Kar Durumunda' : 'Zarar Durumunda'}</p>
        </div>

        {/* Toplam Alacaklar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs red-card-border">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wider">Toplam Alacak</span>
            <ShieldAlert size={18} />
          </div>
          <p className="text-base sm:text-xl font-extrabold text-red-600">{formatTL(totalReceivablesTL)}</p>
          <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-700 mt-1 pt-1 border-t border-gray-100">
            <span>Zeytin: {formatTL(oliveReceivables)}</span>
            <span>Yağ: {formatTL(oilReceivables)}</span>
          </div>
        </div>
      </div>

      {/* Zeytin Stok Özeti Kartı */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-800">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Zeytin Stok Özeti</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Satılan Miktar: <strong className="text-emerald-700 font-bold">{formatNumber(totalOliveSalesKg)} kg</strong></p>
            </div>
          </div>
        </div>

        {/* Kalibreler Grid */}
        <div className="grid grid-cols-2 gap-2">
          {stockByCalibre.map((item) => (
            <div key={item.calibre} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-gray-800">{item.calibre}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                  Mevcut
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-emerald-800 mt-1">
                {formatNumber(item.remainingKg)} <span className="text-xs sm:text-sm font-normal text-slate-600">kg</span>
              </p>
              <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
                <span>Giriş: {formatNumber(item.girisKg)}</span>
                <span>Satış: {formatNumber(item.cikisKg)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zeytinyağı Stok Kartı */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Zeytinyağı Stok Özeti</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Kalan Stok: <strong className="text-amber-800 font-bold">{formatNumber(remainingOilLiters)} Litre</strong> ({formatNumber(remainingOilTinEquivalent)} Teneke)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
            <p className="text-xs text-slate-600 font-medium">Kalan Stok</p>
            <p className="text-xs sm:text-sm font-extrabold text-amber-900">{formatNumber(remainingOilLiters)} Litre</p>
            <p className="text-[11px] text-amber-800 font-bold">({formatNumber(remainingOilTinEquivalent)} Teneke)</p>
          </div>
          <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
            <p className="text-xs text-slate-600 font-medium">Satılan</p>
            <p className="text-xs sm:text-sm font-extrabold text-emerald-700">{formatNumber(totalOilSoldLiters)} Litre</p>
            <p className="text-[11px] text-emerald-800 font-bold">({formatNumber(totalOilSoldLiters / 16)} Teneke)</p>
          </div>
          <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
            <p className="text-xs text-slate-600 font-medium">Yağ Net Kar</p>
            <p className={`text-xs sm:text-sm font-extrabold ${netOilProfitTL >= 0 ? 'text-green-700' : 'text-red-600'}`}>
              {formatTL(netOilProfitTL)}
            </p>
          </div>
        </div>
      </div>

      {/* SON İŞLEMLER LİSTESİ VE FİLTRELEME BÖLÜMÜ */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-700">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Son Yapılan İşlemler</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Toplam {allTransactions.length} işlem kaydı</p>
            </div>
          </div>

          {/* Filtreleme Butonları: Son 10 / Son 20 / Tümü */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterLimit('10')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterLimit === '10' ? 'bg-white text-indigo-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Son 10
            </button>
            <button
              onClick={() => setFilterLimit('20')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterLimit === '20' ? 'bg-white text-indigo-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Son 20
            </button>
            <button
              onClick={() => setFilterLimit('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                filterLimit === 'all' ? 'bg-white text-indigo-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tümü
            </button>
          </div>
        </div>

        {/* İşlem Listesi */}
        <div className="space-y-2.5">
          {displayedTransactions.length === 0 ? (
            <p className="text-center text-xs sm:text-sm text-gray-400 py-4">Henüz kayıtlı bir işlem bulunmuyor.</p>
          ) : (
            displayedTransactions.map((tx) => (
              <div
                key={tx.id || Math.random()}
                className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition"
              >
                <div className="space-y-0.5 max-w-[60%]">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${tx.badgeClass}`}>
                      {tx.badgeText}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-700">{tx.date || 'Tarihsiz'}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-extrabold text-gray-900 truncate">{tx.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium truncate">{tx.subtitle}</p>
                </div>

                <div className="flex items-center space-x-2 text-right">
                  <div>
                    {tx.amount > 0 && (
                      <p className="text-sm sm:text-base font-extrabold text-gray-900">{formatTL(tx.amount)}</p>
                    )}
                    {tx.remainingBalance > 0 && (
                      <p className="text-xs sm:text-sm font-bold text-red-600">Borç: {formatTL(tx.remainingBalance)}</p>
                    )}
                  </div>

                  {/* İşlem Butonları: Düzenle & Sil */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingItem(tx)}
                      title="İşlemi Düzenle"
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition active:scale-95"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeletingItem(tx)}
                      title="İşlemi Sil"
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DÜZENLEME MODALI */}
      {editingItem && (
        <EditTransactionModal
          isOpen={Boolean(editingItem)}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            onUpdateTransaction(updated);
            setEditingItem(null);
          }}
        />
      )}

      {/* SİLME ONAY MODALI */}
      {deletingItem && (
        <ConfirmModal
          isOpen={Boolean(deletingItem)}
          title="İşlemi Sil"
          message={`"${deletingItem.title || 'Bu işlem'}" kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
          confirmText="Evet, Sil"
          cancelText="İptal"
          onClose={() => setDeletingItem(null)}
          onConfirm={() => {
            if (onDeleteTransaction && deletingItem.id) {
              onDeleteTransaction(deletingItem.id);
            }
            setDeletingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default DashboardTab;
