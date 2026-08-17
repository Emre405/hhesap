import React, { useState, useEffect } from 'react';
import { initialData } from './utils/helpers';
import { subscribeToAuthChanges, logoutUser } from './utils/firebase';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { OliveTab } from './components/OliveTab';
import { OliveOilTab } from './components/OliveOilTab';
import { CustomersTab } from './components/CustomersTab';
import { PaymentPlanTab } from './components/PaymentPlanTab';
import { AssetsDebtsTab } from './components/AssetsDebtsTab';
import { LoginScreen } from './components/LoginScreen';

export function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Firebase Oturum Dinleyicisi
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
      try {
        await logoutUser();
        setCurrentUser(null);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  // LocalStorage state management
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('zeytin_takip_data_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('LocalStorage parsing error', e);
      }
    }
    return initialData;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zeytin_takip_data_v1', JSON.stringify(data));
    }
  }, [data, currentUser]);

  // Reset to initial demo data
  const handleResetData = () => {
    if (confirm('Tüm veriler varsayılan örnek Türkçe veriler ile değiştirilecektir. Onaylıyor musunuz?')) {
      setData(initialData);
      localStorage.setItem('zeytin_takip_data_v1', JSON.stringify(initialData));
    }
  };

  // Import JSON backup
  const handleImportData = (importedData) => {
    setData(importedData);
  };

  // --- OLIVE HANDLERS ---
  const handleAddOliveSale = (newSale) => {
    setData((prev) => ({
      ...prev,
      oliveSales: [newSale, ...prev.oliveSales]
    }));
  };

  const handleDeleteOliveSale = (saleId) => {
    setData((prev) => ({
      ...prev,
      oliveSales: prev.oliveSales.filter((s) => s.id !== saleId)
    }));
  };

  const handleAddOliveStock = (newStock) => {
    setData((prev) => ({
      ...prev,
      oliveStockEntries: [newStock, ...prev.oliveStockEntries]
    }));
  };

  const handleDeleteOliveStock = (stockId) => {
    setData((prev) => ({
      ...prev,
      oliveStockEntries: prev.oliveStockEntries.filter((s) => s.id !== stockId)
    }));
  };

  const handleAddOliveCost = (newCost) => {
    setData((prev) => ({
      ...prev,
      oliveCosts: [newCost, ...prev.oliveCosts]
    }));
  };

  const handleDeleteOliveCost = (costId) => {
    setData((prev) => ({
      ...prev,
      oliveCosts: prev.oliveCosts.filter((c) => c.id !== costId)
    }));
  };

  // --- OIL HANDLERS ---
  const handleAddOilSale = (newSale) => {
    setData((prev) => ({
      ...prev,
      oilSales: [newSale, ...prev.oilSales]
    }));
  };

  const handleDeleteOilSale = (saleId) => {
    setData((prev) => ({
      ...prev,
      oilSales: prev.oilSales.filter((s) => s.id !== saleId)
    }));
  };

  const handleAddOilPurchase = (newPurch) => {
    setData((prev) => ({
      ...prev,
      oilPurchases: [newPurch, ...prev.oilPurchases]
    }));
  };

  const handleDeleteOilPurchase = (purchId) => {
    setData((prev) => ({
      ...prev,
      oilPurchases: prev.oilPurchases.filter((p) => p.id !== purchId)
    }));
  };

  const handleUpdateOilStockPrice = (price) => {
    setData((prev) => ({
      ...prev,
      oilStockUnitPrice: price
    }));
  };

  // --- CUSTOMER TAHSİLAT (DEBT COLLECTION) HANDLER ---
  const handleRecordPayment = (customerName, amountToPay) => {
    let remainingToDistribute = amountToPay;

    setData((prev) => {
      // 1. First deduct from olive sales of this customer
      const updatedOliveSales = prev.oliveSales.map((sale) => {
        if (remainingToDistribute <= 0) return sale;
        if (sale.customerName.trim().toLowerCase() === customerName.trim().toLowerCase() && sale.remainingBalance > 0) {
          const deduct = Math.min(sale.remainingBalance, remainingToDistribute);
          remainingToDistribute -= deduct;
          return {
            ...sale,
            paidAmount: sale.paidAmount + deduct,
            remainingBalance: sale.remainingBalance - deduct
          };
        }
        return sale;
      });

      // 2. Then deduct from olive oil sales if needed
      const updatedOilSales = prev.oilSales.map((sale) => {
        if (remainingToDistribute <= 0) return sale;
        if (sale.customerName.trim().toLowerCase() === customerName.trim().toLowerCase() && sale.remainingBalance > 0) {
          const deduct = Math.min(sale.remainingBalance, remainingToDistribute);
          remainingToDistribute -= deduct;
          return {
            ...sale,
            paidAmount: sale.paidAmount + deduct,
            remainingBalance: sale.remainingBalance - deduct
          };
        }
        return sale;
      });

      return {
        ...prev,
        oliveSales: updatedOliveSales,
        oilSales: updatedOilSales
      };
    });
  };

  // --- PAYMENT PLAN HANDLERS ---
  const handleUpdatePaymentPlan = (newPlan) => {
    setData((prev) => ({
      ...prev,
      paymentPlan: newPlan
    }));
  };

  // --- ASSETS & DEBTS HANDLERS ---
  const handleAddDebt = (newDebt) => {
    setData((prev) => ({
      ...prev,
      debts: [newDebt, ...prev.debts]
    }));
  };

  const handleDeleteDebt = (debtId) => {
    setData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== debtId)
    }));
  };

  const handleAddAsset = (newAsset) => {
    setData((prev) => ({
      ...prev,
      assets: [newAsset, ...prev.assets]
    }));
  };

  const handleDeleteAsset = (assetId) => {
    setData((prev) => ({
      ...prev,
      assets: prev.assets.filter((a) => a.id !== assetId)
    }));
  };

  // --- GENERIC UPDATE & DELETE TRANSACTION HANDLERS ---
  const handleUpdateTransaction = (updatedItem) => {
    const id = updatedItem?.id;
    if (!id) return;

    if (id.startsWith('os-')) {
      setData((prev) => ({
        ...prev,
        oliveSales: prev.oliveSales.map((item) => (item.id === id ? updatedItem : item))
      }));
    } else if (id.startsWith('oil-') || id.startsWith('oils-')) {
      setData((prev) => ({
        ...prev,
        oilSales: prev.oilSales.map((item) => (item.id === id ? updatedItem : item))
      }));
    } else if (id.startsWith('op-')) {
      setData((prev) => ({
        ...prev,
        oilPurchases: prev.oilPurchases.map((item) => (item.id === id ? updatedItem : item))
      }));
    } else if (id.startsWith('oc-')) {
      setData((prev) => ({
        ...prev,
        oliveCosts: prev.oliveCosts.map((item) => (item.id === id ? updatedItem : item))
      }));
    } else if (id.startsWith('ost-')) {
      setData((prev) => ({
        ...prev,
        oliveStockEntries: prev.oliveStockEntries.map((item) => (item.id === id ? updatedItem : item))
      }));
    } else if (id.startsWith('debt-')) {
      setData((prev) => ({
        ...prev,
        debts: prev.debts.map((item) => (item.id === id ? updatedItem : item))
      }));
    } else if (id.startsWith('asset-')) {
      setData((prev) => ({
        ...prev,
        assets: prev.assets.map((item) => (item.id === id ? updatedItem : item))
      }));
    }
  };

  const handleDeleteTransaction = (id) => {
    if (!id) return;
    if (id.startsWith('os-')) {
      handleDeleteOliveSale(id);
    } else if (id.startsWith('oil-') || id.startsWith('oils-')) {
      handleDeleteOilSale(id);
    } else if (id.startsWith('op-')) {
      handleDeleteOilPurchase(id);
    } else if (id.startsWith('oc-')) {
      handleDeleteOliveCost(id);
    } else if (id.startsWith('ost-')) {
      handleDeleteOliveStock(id);
    } else if (id.startsWith('debt-')) {
      handleDeleteDebt(id);
    } else if (id.startsWith('asset-')) {
      handleDeleteAsset(id);
    }
  };

  // 1. Yükleme Durumu
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-emerald-200 tracking-wide">Oturum Kontrol Ediliyor...</p>
      </div>
    );
  }

  // 2. Giriş Yapılmamışsa LoginScreen Göster
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // 3. Giriş Yapılmışsa Ana Uygulamayı Göster
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-safe-nav">
      {/* Mobil Header Bar */}
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Container - Mobile & Desktop Responsive Container */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 py-3 space-y-4">
        {activeTab === 'dashboard' && (
          <DashboardTab
            data={data}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'olive' && (
          <OliveTab
            data={data}
            onAddOliveSale={handleAddOliveSale}
            onDeleteOliveSale={handleDeleteOliveSale}
            onAddOliveStock={handleAddOliveStock}
            onDeleteOliveStock={handleDeleteOliveStock}
            onAddOliveCost={handleAddOliveCost}
            onDeleteOliveCost={handleDeleteOliveCost}
          />
        )}

        {activeTab === 'oil' && (
          <OliveOilTab
            data={data}
            onAddOilSale={handleAddOilSale}
            onDeleteOilSale={handleDeleteOilSale}
            onAddOilPurchase={handleAddOilPurchase}
            onDeleteOilPurchase={handleDeleteOilPurchase}
            onUpdateOilStockPrice={handleUpdateOilStockPrice}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersTab data={data} onRecordPayment={handleRecordPayment} />
        )}

        {activeTab === 'payments' && (
          <PaymentPlanTab
            paymentPlan={data.paymentPlan || []}
            onUpdatePaymentPlan={handleUpdatePaymentPlan}
          />
        )}

        {activeTab === 'other' && (
          <AssetsDebtsTab
            data={data}
            onAddDebt={handleAddDebt}
            onDeleteDebt={handleDeleteDebt}
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
            onResetData={handleResetData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Alt Navigasyon Barı */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
