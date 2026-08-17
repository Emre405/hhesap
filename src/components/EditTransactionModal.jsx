import React, { useState, useEffect } from 'react';
import { Edit3, X, Save } from 'lucide-react';
import NumericInput from './NumericInput';

export const EditTransactionModal = ({ isOpen, onClose, onSave, item }) => {
  // Local state for editable fields depending on transaction type
  const [date, setDate] = useState(item?.date || '');
  const [customerName, setCustomerName] = useState(item?.customerName || item?.supplier || item?.personName || '');
  const [calibre, setCalibre] = useState(item?.calibre || '230-260');
  const [quantityKg, setQuantityKg] = useState(item?.quantityKg || '');
  const [tinCount, setTinCount] = useState(item?.tinCount || '');
  const [unitPrice, setUnitPrice] = useState(item?.unitPrice || '');
  const [paidAmount, setPaidAmount] = useState(item?.paidAmount !== undefined ? item.paidAmount : '');
  const [amount, setAmount] = useState(item?.amount || item?.totalPrice || '');
  const [description, setDescription] = useState(item?.description || item?.category || '');

  useEffect(() => {
    if (item) {
      setDate(item.date || '');
      setCustomerName(item.customerName || item.supplier || item.personName || '');
      setCalibre(item.calibre || '230-260');
      setQuantityKg(item.quantityKg !== undefined ? item.quantityKg : '');
      setTinCount(item.tinCount !== undefined ? item.tinCount : '');
      setUnitPrice(item.unitPrice !== undefined ? item.unitPrice : '');
      setPaidAmount(item.paidAmount !== undefined ? item.paidAmount : '');
      setAmount(item.amount !== undefined ? item.amount : (item.totalPrice !== undefined ? item.totalPrice : ''));
      setDescription(item.description || item.category || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const type = item.itemType || item.id?.split('-')[0];
    let updatedItem = { ...item, date };

    if (type === 'os' || item.itemType === 'oliveSale') {
      const q = Number(quantityKg) || 0;
      const u = Number(unitPrice) || 0;
      const total = q * u;
      const paid = Number(paidAmount) || 0;
      updatedItem = {
        ...updatedItem,
        customerName: customerName.trim(),
        calibre,
        quantityKg: q,
        unitPrice: u,
        totalPrice: total,
        paidAmount: paid,
        remainingBalance: Math.max(0, total - paid)
      };
    } else if (type === 'oil' || type === 'oils' || item.itemType === 'oilSale') {
      const t = Number(tinCount) || 0;
      const u = Number(unitPrice) || 0;
      const total = t * u;
      const paid = Number(paidAmount) || 0;
      updatedItem = {
        ...updatedItem,
        customerName: customerName.trim(),
        tinCount: t,
        unitPrice: u,
        totalPrice: total,
        paidAmount: paid,
        remainingBalance: Math.max(0, total - paid)
      };
    } else if (type === 'op' || item.itemType === 'oilPurchase') {
      const t = Number(tinCount) || 0;
      const u = Number(unitPrice) || 0;
      const total = t * u;
      const paid = Number(paidAmount) || 0;
      updatedItem = {
        ...updatedItem,
        supplier: customerName.trim(),
        tinCount: t,
        unitPrice: u,
        totalPrice: total,
        paidAmount: paid,
        remainingBalance: Math.max(0, total - paid)
      };
    } else if (type === 'oc' || item.itemType === 'oliveCost') {
      updatedItem = {
        ...updatedItem,
        category: description || 'Zeytin Alım Tutarı',
        amount: Number(amount) || 0,
        description: description
      };
    } else if (type === 'ost' || item.itemType === 'oliveStock') {
      updatedItem = {
        ...updatedItem,
        supplier: customerName.trim(),
        calibre,
        quantityKg: Number(quantityKg) || 0
      };
    } else if (type === 'debt' || item.itemType === 'debt') {
      updatedItem = {
        ...updatedItem,
        personName: customerName.trim(),
        amount: Number(amount) || 0,
        description
      };
    } else if (type === 'asset' || item.itemType === 'asset') {
      updatedItem = {
        ...updatedItem,
        personName: customerName.trim(),
        amount: Number(amount) || 0,
        description
      };
    } else {
      // Fallback update
      updatedItem = {
        ...updatedItem,
        customerName: customerName.trim(),
        personName: customerName.trim(),
        supplier: customerName.trim(),
        amount: Number(amount) || updatedItem.amount,
        totalPrice: Number(amount) || updatedItem.totalPrice,
        description
      };
    }

    onSave(updatedItem);
    onClose();
  };

  const getItemTypeName = () => {
    if (item.itemType === 'oliveSale' || item.id?.startsWith('os-')) return 'Zeytin Satışı Düzenle';
    if (item.itemType === 'oilSale' || item.id?.startsWith('oil-') || item.id?.startsWith('oils-')) return 'Zeytinyağı Satışı Düzenle';
    if (item.itemType === 'oilPurchase' || item.id?.startsWith('op-')) return 'Zeytinyağı Alışı Düzenle';
    if (item.itemType === 'oliveCost' || item.id?.startsWith('oc-')) return 'Zeytin Gideri Düzenle';
    if (item.itemType === 'oliveStock' || item.id?.startsWith('ost-')) return 'Zeytin Stok Girişi Düzenle';
    if (item.itemType === 'debt' || item.id?.startsWith('debt-')) return 'Borç Kaydı Düzenle';
    if (item.itemType === 'asset' || item.id?.startsWith('asset-')) return 'Alacak Kaydı Düzenle';
    return 'İşlemi Düzenle';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-2xl space-y-3 border border-gray-100 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-1.5">
            <Edit3 size={18} className="text-emerald-700" />
            <span>{getItemTypeName()}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          {/* Tarih */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
              required
            />
          </div>

          {/* Müşteri / Tedarikçi / Kişi Adı */}
          {(item.customerName !== undefined || item.supplier !== undefined || item.personName !== undefined || item.id?.startsWith('os-') || item.id?.startsWith('oil-') || item.id?.startsWith('op-') || item.id?.startsWith('ost-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                {item.id?.startsWith('op-') || item.id?.startsWith('ost-') ? 'Tedarikçi / Kaynak' : 'Müşteri / Kişi Adı'}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                required
              />
            </div>
          )}

          {/* Kalibre (Zeytin Satışı / Stoğu için) */}
          {(item.calibre !== undefined || item.id?.startsWith('os-') || item.id?.startsWith('ost-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Zeytin Kalibresi</label>
              <select
                value={calibre}
                onChange={(e) => setCalibre(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
              >
                <option value="230-260">230-260 Kalibre</option>
                <option value="260-290">260-290 Kalibre</option>
                <option value="290-320">290-320 Kalibre</option>
                <option value="Yeşil Zeytin">Yeşil Zeytin</option>
              </select>
            </div>
          )}

          {/* Miktar (Kg) */}
          {(item.quantityKg !== undefined || item.id?.startsWith('os-') || item.id?.startsWith('ost-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Miktar (Kg)</label>
              <NumericInput
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-slate-900"
                required
              />
            </div>
          )}

          {/* Miktar (Teneke) */}
          {(item.tinCount !== undefined || item.id?.startsWith('oil-') || item.id?.startsWith('op-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Teneke Adedi</label>
              <NumericInput
                value={tinCount}
                onChange={(e) => setTinCount(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-slate-900"
                required
              />
            </div>
          )}

          {/* Birim Fiyat */}
          {(item.unitPrice !== undefined || item.id?.startsWith('os-') || item.id?.startsWith('oil-') || item.id?.startsWith('op-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Birim Fiyat (TL)</label>
              <NumericInput
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-emerald-900"
                required
              />
            </div>
          )}

          {/* Ödenen Tutar */}
          {(item.paidAmount !== undefined || item.id?.startsWith('os-') || item.id?.startsWith('oil-') || item.id?.startsWith('op-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Tahsil Edilen / Ödenen Tutar (TL)</label>
              <NumericInput
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-emerald-900"
              />
            </div>
          )}

          {/* Tutar (Maliyet, Borç, Alacak için) */}
          {(item.amount !== undefined || item.id?.startsWith('oc-') || item.id?.startsWith('debt-') || item.id?.startsWith('asset-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Tutar (TL)</label>
              <NumericInput
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-bold text-emerald-950"
                required
              />
            </div>
          )}

          {/* Açıklama / Kategori */}
          {(item.description !== undefined || item.category !== undefined || item.id?.startsWith('oc-') || item.id?.startsWith('debt-') || item.id?.startsWith('asset-')) && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">Açıklama / Kategori</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
              />
            </div>
          )}

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-1"
            >
              <Save size={14} />
              <span>Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
