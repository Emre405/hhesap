import React, { useState, useMemo } from 'react';
import { formatTL } from '../utils/helpers';
import { Trash2, TrendingUp, TrendingDown, Archive, Edit3 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import NumericInput from './NumericInput';

export const PaymentPlanTab = ({ paymentPlan = [], onUpdatePaymentPlan }) => {
  // Form states for adding items inside a month card
  const [newItemMonthId, setNewItemMonthId] = useState(null);
  const [itemType, setItemType] = useState('receivable'); // 'receivable', 'payment'
  const [itemTitle, setItemTitle] = useState('');
  const [itemAmount, setItemAmount] = useState('');

  // Show past months toggle
  const [showArchive, setShowArchive] = useState(false);

  // Delete confirmation modal states
  const [deletingMonthId, setDeletingMonthId] = useState(null);
  const [deletingItemInfo, setDeletingItemInfo] = useState(null); // { monthId, itemId, title, type }

  // Edit item modal state
  const [editingItemInfo, setEditingItemInfo] = useState(null); // { monthId, itemId, title, amount, type }

  // Month names Turkish map
  const monthNames = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // Current Month Helper (e.g. '2026-08')
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }, []);

  const formatMonthTitle = (monthStr) => {
    if (!monthStr) return '';
    const [year, monthNum] = monthStr.split('-');
    const mIndex = Number(monthNum);
    return `${monthNames[mIndex] || monthNum} ${year}`;
  };

  // Helper to add N months to a YYYY-MM string
  const addMonthsToStr = (yearMonthStr, monthsToAdd) => {
    const [year, month] = yearMonthStr.split('-').map(Number);
    const date = new Date(year, month - 1 + monthsToAdd, 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  };

  // 1. GENERATE ROLLING 6 MONTHS STARTING FROM CURRENT MONTH
  const rollingPlanList = useMemo(() => {
    // Collect all existing months in paymentPlan map
    const planMap = {};
    (paymentPlan || []).forEach((m) => {
      if (m.month) planMap[m.month] = { ...m };
    });

    // Determine the rolling 6 months array [currentMonth, currentMonth+1, ..., currentMonth+5]
    const list = [];
    for (let i = 0; i < 6; i++) {
      const mStr = addMonthsToStr(currentMonthStr, i);
      if (planMap[mStr]) {
        list.push(planMap[mStr]);
      } else {
        list.push({
          id: `pp-${mStr}`,
          month: mStr,
          receivables: [],
          payments: []
        });
      }
    }

    // Also collect past months (strictly prior to currentMonthStr) for archive
    const pastMonths = (paymentPlan || [])
      .filter((m) => m.month < currentMonthStr)
      .sort((a, b) => a.month.localeCompare(b.month));

    // Clone list and clean auto carryovers
    const cleanedList = list.map((m) => ({
      ...m,
      receivables: (m.receivables || []).filter((r) => !r.isCarryOver && !r.title?.startsWith('Önceki Aydan')),
      payments: (m.payments || []).filter((p) => !p.isCarryOver && !p.title?.startsWith('Önceki Aydan'))
    }));

    // Cascade carryovers through the rolling 6 months
    for (let i = 0; i < cleanedList.length - 1; i++) {
      const current = cleanedList[i];
      const totalRec = current.receivables.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const totalPay = current.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const netDiff = totalRec - totalPay;

      if (netDiff !== 0) {
        const next = cleanedList[i + 1];
        const prevLabel = formatMonthTitle(current.month);

        if (netDiff > 0) {
          next.receivables.push({
            id: `carry-rec-${current.month}`,
            title: `Önceki Aydan Devreden Nakit (${prevLabel})`,
            amount: netDiff,
            isCarryOver: true
          });
        } else {
          next.payments.push({
            id: `carry-pay-${current.month}`,
            title: `Önceki Aydan Devreden Açık (${prevLabel})`,
            amount: Math.abs(netDiff),
            isCarryOver: true
          });
        }
      }
    }

    return { rollingList: cleanedList, pastMonths };
  }, [paymentPlan, currentMonthStr]);

  const displayedList = rollingPlanList.rollingList;
  const pastList = rollingPlanList.pastMonths;

  // Handlers
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!itemTitle || !itemAmount) return;

    const amountNum = Number(itemAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const currentPlan = paymentPlan || [];
    let found = false;
    const updatedPlan = currentPlan.map((mObj) => {
      if (mObj.month === newItemMonthId) {
        found = true;
        const newItem = {
          id: (itemType === 'receivable' ? 'r-' : 'p-') + Date.now(),
          title: itemTitle.trim(),
          amount: amountNum
        };
        if (itemType === 'receivable') {
          return { ...mObj, receivables: [...(mObj.receivables || []), newItem] };
        } else {
          return { ...mObj, payments: [...(mObj.payments || []), newItem] };
        }
      }
      return mObj;
    });

    if (!found) {
      const newItem = {
        id: (itemType === 'receivable' ? 'r-' : 'p-') + Date.now(),
        title: itemTitle.trim(),
        amount: amountNum
      };
      updatedPlan.push({
        id: `pp-${newItemMonthId}`,
        month: newItemMonthId,
        receivables: itemType === 'receivable' ? [newItem] : [],
        payments: itemType === 'payment' ? [newItem] : []
      });
    }

    onUpdatePaymentPlan(updatedPlan);
    setNewItemMonthId(null);
    setItemTitle('');
    setItemAmount('');
  };

  const handleDeleteItem = (monthId, itemId, type) => {
    const currentPlan = paymentPlan || [];
    const updatedPlan = currentPlan.map((mObj) => {
      if (mObj.month === monthId) {
        if (type === 'receivable') {
          return { ...mObj, receivables: (mObj.receivables || []).filter((r) => r.id !== itemId) };
        } else {
          return { ...mObj, payments: (mObj.payments || []).filter((p) => p.id !== itemId) };
        }
      }
      return mObj;
    });
    onUpdatePaymentPlan(updatedPlan);
  };

  const handleEditItemSubmit = (e) => {
    e.preventDefault();
    if (!editingItemInfo) return;

    const { monthId, itemId, title, amount, type } = editingItemInfo;
    if (!title || !amount) return;

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const currentPlan = paymentPlan || [];
    const updatedPlan = currentPlan.map((mObj) => {
      if (mObj.month === monthId) {
        if (type === 'receivable') {
          const updatedRecs = (mObj.receivables || []).map((r) =>
            r.id === itemId ? { ...r, title: title.trim(), amount: amountNum } : r
          );
          return { ...mObj, receivables: updatedRecs };
        } else {
          const updatedPays = (mObj.payments || []).map((p) =>
            p.id === itemId ? { ...p, title: title.trim(), amount: amountNum } : p
          );
          return { ...mObj, payments: updatedPays };
        }
      }
      return mObj;
    });

    onUpdatePaymentPlan(updatedPlan);
    setEditingItemInfo(null);
  };

  const handleClearMonth = (monthId) => {
    const currentPlan = paymentPlan || [];
    const updatedPlan = currentPlan.map((mObj) => {
      if (mObj.month === monthId) {
        return { ...mObj, receivables: [], payments: [] };
      }
      return mObj;
    });
    onUpdatePaymentPlan(updatedPlan);
    setDeletingMonthId(null);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* GEÇMİŞ AYLAR ARŞİVİ (Varsa ve açıldıysa) */}
      {showArchive && pastList.length > 0 && (
        <div className="bg-slate-100/80 p-3 rounded-2xl border border-slate-200 space-y-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-700 flex items-center space-x-1">
            <Archive size={16} />
            <span>Geçmiş Dönem Kayıtları (Arşiv)</span>
          </h3>
          <div className="space-y-2">
            {pastList.map((pMonth) => {
              const rec = pMonth.receivables.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
              const pay = pMonth.payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
              const diff = rec - pay;

              return (
                <div key={pMonth.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs sm:text-sm flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-900">{formatMonthTitle(pMonth.month)}</span>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                      Alacak: {formatTL(rec)} • Ödeme: {formatTL(pay)}
                    </p>
                  </div>
                  <span className={`font-extrabold text-sm sm:text-base ${diff >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    Net: {formatTL(diff)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DÖNER 6 AYLIK KARTLAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {displayedList.map((mCard, idx) => {
          const isCurrentMonth = mCard.month === currentMonthStr;
          const totalRec = (mCard.receivables || []).reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
          const totalPay = (mCard.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
          const netBalance = totalRec - totalPay;
          const isPositive = netBalance >= 0;

          const formattedMonthLabel = formatMonthTitle(mCard.month);

          return (
            <div
              key={mCard.month}
              className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                isCurrentMonth ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}
            >
              {/* Kart Başlığı */}
              <div className="relative flex items-center justify-center border-b border-gray-100 pb-2">
                <div className="flex items-center space-x-2 justify-center text-center">
                  <span className={`text-base sm:text-lg font-black px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 ${
                    isCurrentMonth 
                      ? 'bg-emerald-700 text-white border border-emerald-800 shadow-xs' 
                      : 'text-emerald-900 bg-emerald-50 border border-emerald-100'
                  }`}>
                    <span>🗓️ {formattedMonthLabel}</span>
                  </span>

                  <span className="text-xs text-slate-400 font-bold">
                    ({idx + 1} / 6)
                  </span>
                </div>

                <button
                  onClick={() => setDeletingMonthId(mCard.month)}
                  title="Kart İçeriğini Temizle"
                  className="absolute right-0 text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Alacaklar ve Ödemeler Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm mt-2.5">
                {/* ALACAKLAR */}
                <div className="bg-green-50/60 p-3 rounded-xl border border-green-100 space-y-2">
                  <div className="flex justify-between items-center border-b border-green-200/60 pb-1.5">
                    <span className="font-bold text-green-900 flex items-center space-x-1">
                      <TrendingUp size={16} className="text-green-600" />
                      <span>Alacaklar & Gelirler (+)</span>
                    </span>
                    <button
                      onClick={() => {
                        setNewItemMonthId(mCard.month);
                        setItemType('receivable');
                      }}
                      className="text-xs bg-green-700 text-white font-bold px-2.5 py-1 rounded-full hover:bg-green-800 transition active:scale-95"
                    >
                      + Alacak Ekle
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {mCard.receivables.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">Alacak kaydı yok</p>
                    ) : (
                      mCard.receivables.map((r) => (
                        <div
                          key={r.id}
                          className={`flex justify-between items-center p-2 rounded-lg border text-xs sm:text-sm ${
                            r.isCarryOver || r.title?.includes('Önceki Aydan') || r.title?.includes('Geçmiş Aylardan')
                              ? 'bg-amber-50 border-amber-200 font-bold text-amber-950 shadow-xs'
                              : 'bg-white border-green-100 text-slate-800'
                          }`}
                        >
                          <span className="font-medium flex items-center space-x-1 truncate max-w-[70%]">
                            {(r.isCarryOver || r.title?.includes('Önceki Aydan') || r.title?.includes('Geçmiş Aylardan')) && (
                              <span className="text-[10px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-extrabold mr-1 flex-shrink-0">
                                DEVİR
                              </span>
                            )}
                            <span className="truncate">{r.title}</span>
                          </span>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <span className="font-bold text-green-800">{formatTL(r.amount)}</span>
                            {!r.isCarryOver && (
                              <div className="flex items-center space-x-0.5">
                                <button
                                  onClick={() =>
                                    setEditingItemInfo({
                                      monthId: mCard.month,
                                      itemId: r.id,
                                      title: r.title,
                                      amount: String(r.amount),
                                      type: 'receivable'
                                    })
                                  }
                                  title="Kalemi Düzenle"
                                  className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingItemInfo({ monthId: mCard.month, itemId: r.id, title: r.title, type: 'receivable' })}
                                  title="Kalemi Sil"
                                  className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-green-200/60 flex justify-between font-bold text-green-950 text-sm">
                    <span>Toplam Alacak:</span>
                    <span>{formatTL(totalRec)}</span>
                  </div>
                </div>

                {/* ÖDEMELER */}
                <div className="bg-red-50/60 p-3 rounded-xl border border-red-100 space-y-2">
                  <div className="flex justify-between items-center border-b border-red-200/60 pb-1.5">
                    <span className="font-bold text-red-900 flex items-center space-x-1">
                      <TrendingDown size={16} className="text-red-600" />
                      <span>Ödemeler & Borçlar (-)</span>
                    </span>
                    <button
                      onClick={() => {
                        setNewItemMonthId(mCard.month);
                        setItemType('payment');
                      }}
                      className="text-xs bg-red-700 text-white font-bold px-2.5 py-1 rounded-full hover:bg-red-800 transition active:scale-95"
                    >
                      + Ödeme Ekle
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {mCard.payments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-1">Ödeme kaydı yok</p>
                    ) : (
                      mCard.payments.map((p) => (
                        <div
                          key={p.id}
                          className={`flex justify-between items-center p-2 rounded-lg border text-xs sm:text-sm ${
                            p.isCarryOver || p.title?.includes('Önceki Aydan') || p.title?.includes('Geçmiş Aylardan')
                              ? 'bg-rose-100/70 border-rose-300 font-bold text-rose-950 shadow-xs'
                              : 'bg-white border-red-100 text-slate-800'
                          }`}
                        >
                          <span className="font-medium flex items-center space-x-1 truncate max-w-[70%]">
                            {(p.isCarryOver || p.title?.includes('Önceki Aydan') || p.title?.includes('Geçmiş Aylardan')) && (
                              <span className="text-[10px] bg-rose-200 text-rose-900 px-1 py-0.2 rounded font-extrabold mr-1 flex-shrink-0">
                                DEVİR BORÇ
                              </span>
                            )}
                            <span className="truncate">{p.title}</span>
                          </span>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <span className="font-bold text-red-700">{formatTL(p.amount)}</span>
                            {!p.isCarryOver && (
                              <div className="flex items-center space-x-0.5">
                                <button
                                  onClick={() =>
                                    setEditingItemInfo({
                                      monthId: mCard.month,
                                      itemId: p.id,
                                      title: p.title,
                                      amount: String(p.amount),
                                      type: 'payment'
                                    })
                                  }
                                  title="Kalemi Düzenle"
                                  className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingItemInfo({ monthId: mCard.month, itemId: p.id, title: p.title, type: 'payment' })}
                                  title="Kalemi Sil"
                                  className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-1.5 border-t border-red-200/60 flex justify-between font-bold text-red-950 text-sm">
                    <span>Toplam Ödeme:</span>
                    <span>{formatTL(totalPay)}</span>
                  </div>
                </div>
              </div>

              {/* FARK KARTI */}
              <div
                className={`py-2.5 px-3.5 rounded-xl border flex justify-between items-center mt-2.5 shadow-xs ${
                  isPositive
                    ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                    : 'bg-red-100/90 text-red-950 border-red-300'
                }`}
              >
                <span className="font-black text-sm sm:text-base tracking-wide">Fark:</span>
                <span className={`text-base sm:text-lg font-black tracking-wide ${isPositive ? 'text-emerald-800' : 'text-red-700'}`}>
                  {formatTL(netBalance)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* KALEM EKLEME MODALI */}
      {newItemMonthId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xs rounded-2xl p-4 shadow-2xl space-y-3 border border-gray-100 my-auto">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              {itemType === 'receivable' ? '🟢 Alacak / Gelir Kalemi Ekle' : '🔴 Ödeme / Borç Kalemi Ekle'}
            </h3>

            <form onSubmit={handleAddItemSubmit} className="space-y-3 text-sm">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Kalem Adı / Açıklama</label>
                <input
                  type="text"
                  placeholder="Örn: Gübre Faturası / Çek Tahsilatı"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tutar (TL)</label>
                <NumericInput
                  placeholder="0"
                  value={itemAmount}
                  onChange={(e) => setItemAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewItemMonthId(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KALEM DÜZENLEME MODALI */}
      {editingItemInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xs rounded-2xl p-4 shadow-2xl space-y-3 border border-gray-100 my-auto">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              {editingItemInfo.type === 'receivable' ? '✏️ Alacak / Gelir Kaydını Düzenle' : '✏️ Ödeme / Borç Kaydını Düzenle'}
            </h3>

            <form onSubmit={handleEditItemSubmit} className="space-y-3 text-sm">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Kalem Adı / Açıklama</label>
                <input
                  type="text"
                  placeholder="Açıklama"
                  value={editingItemInfo.title}
                  onChange={(e) => setEditingItemInfo({ ...editingItemInfo, title: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">Tutar (TL)</label>
                <NumericInput
                  placeholder="0"
                  value={editingItemInfo.amount}
                  onChange={(e) => setEditingItemInfo({ ...editingItemInfo, amount: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-extrabold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItemInfo(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SİLME ONAY MODALLARI */}
      {deletingMonthId && (
        <ConfirmModal
          isOpen={Boolean(deletingMonthId)}
          title="Ay Kartı İçeriğini Temizle"
          message={`${formatMonthTitle(deletingMonthId)} ayındaki tüm eklenmiş alacak ve ödeme kayıtlarını silmek istediğinize emin misiniz?`}
          confirmText="Evet, Temizle"
          cancelText="İptal"
          onClose={() => setDeletingMonthId(null)}
          onConfirm={() => handleClearMonth(deletingMonthId)}
        />
      )}

      {deletingItemInfo && (
        <ConfirmModal
          isOpen={Boolean(deletingItemInfo)}
          title="Kalem Kaydını Sil"
          message={`"${deletingItemInfo.title}" kaydını silmek istediğinize emin misiniz?`}
          confirmText="Evet, Sil"
          cancelText="İptal"
          onClose={() => setDeletingItemInfo(null)}
          onConfirm={() => {
            handleDeleteItem(deletingItemInfo.monthId, deletingItemInfo.itemId, deletingItemInfo.type);
            setDeletingItemInfo(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentPlanTab;
