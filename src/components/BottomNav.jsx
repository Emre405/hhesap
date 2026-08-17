import React from 'react';
import { Home, ShoppingBag, Droplets, Users, Calendar, ShieldCheck } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'olive', label: 'Zeytin', icon: ShoppingBag },
    { id: 'oil', label: 'Zeytinyağı', icon: Droplets },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'payments', label: 'Ödeme Planı', icon: Calendar },
    { id: 'other', label: 'Bilanço/Yedek', icon: ShieldCheck }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-1 flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 transition-all duration-150 active:scale-95"
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-100 shadow-xs' : ''}`}>
                <Icon size={20} className={isActive ? 'stroke-[2.5] text-emerald-800' : 'stroke-[2] text-slate-800'} />
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight leading-tight text-center ${
                isActive ? 'text-emerald-950 font-black' : 'text-black font-bold'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
