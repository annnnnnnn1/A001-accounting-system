import React from 'react';
import { 
  Home, 
  CreditCard, 
  Calculator, 
  Package, 
  PieChart
} from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
  onOpenQuickAdd: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount
}) => {
  const tabs = [
    { id: 'dashboard', label: '總覽', icon: Home },
    { id: 'ledger', label: '記帳', icon: CreditCard },
    { id: 'pricing', label: '定價', icon: Calculator },
    { id: 'inventory', label: '庫存', icon: Package, badge: lowStockCount },
    { id: 'analytics', label: '分析', icon: PieChart }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E2DD] z-40 pb-safe">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center space-y-0.5 w-12 py-1 transition-all relative ${
                isActive ? 'text-[#4A5D4E] font-bold' : 'text-gray-400 hover:text-gray-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#C2B280] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-widest uppercase">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#4A5D4E] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

