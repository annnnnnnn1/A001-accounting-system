import React, { useState } from 'react';
import { Download, Smartphone, Monitor, AlertTriangle, Pencil, Check, X } from 'lucide-react';

interface HeaderNavProps {
  shopName: string;
  onChangeShopName?: (newName: string) => void;
  lowStockCount: number;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onExportExcel: () => void;
  onOpenLowStock: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  shopName,
  onChangeShopName,
  lowStockCount,
  isMobileFrame,
  setIsMobileFrame,
  onExportExcel,
  onOpenLowStock
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(shopName);

  const handleSaveName = () => {
    if (tempName.trim() && onChangeShopName) {
      onChangeShopName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancel = () => {
    setTempName(shopName);
    setIsEditingName(false);
  };

  return (
    <header className="bg-white border-b border-[#E5E2DD] sticky top-0 z-30">
      {/* Status Bar simulation if in mobile frame mode */}
      {isMobileFrame && (
        <div className="bg-[#1A1A1A] text-white text-[11px] px-5 py-1 flex justify-between items-center font-mono tracking-tight select-none">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] opacity-70">5G</span>
            <div className="w-4 h-2 border border-white/80 rounded-[2px] p-[1px] flex items-center">
              <div className="w-full h-full bg-white/90 rounded-[1px]" />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Shop Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F2EDE7] border border-[#E5E2DD] flex items-center justify-center text-lg shadow-2xs shrink-0">
            🐾
          </div>
          <div>
            <div className="flex items-center space-x-2">
              {isEditingName ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="輸入手作店鋪名稱"
                    className="border border-[#4A5D4E] rounded-lg px-2 py-0.5 text-sm font-bold text-[#1A1A1A] bg-[#F9F8F6] focus:outline-hidden"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancel();
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 text-[#4A5D4E] hover:bg-[#F2EDE7] rounded-lg transition-colors"
                    title="儲存店名"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-400 hover:bg-[#F2EDE7] rounded-lg transition-colors"
                    title="取消"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center space-x-1.5 group cursor-pointer"
                  onClick={() => {
                    setTempName(shopName);
                    setIsEditingName(true);
                  }}
                  title="點擊修改店鋪名稱"
                >
                  <h1 className="font-serif italic font-bold text-[#4A5D4E] text-lg leading-tight group-hover:underline">
                    {shopName}
                  </h1>
                  <Pencil className="w-3.5 h-3.5 text-[#8C7A66] opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="bg-[#F2EDE7] text-[#8C7A66] text-[9px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 rounded-full border border-[#E5E2DD]">
                    Graduate Edition
                  </span>
                </div>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7A66] font-medium">NIE NIE LEDGER & COSTING</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Low Stock Badge Button */}
          {lowStockCount > 0 && (
            <button
              onClick={onOpenLowStock}
              className="flex items-center space-x-1.5 bg-[#F2EDE7] hover:bg-[#EAE4DC] text-[#8C7A66] border border-[#C2B280] text-xs px-2.5 py-1.5 rounded-full transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#C2B280]" />
              <span className="font-medium text-[11px]">{lowStockCount} 項補貨</span>
            </button>
          )}

          {/* Export Excel Button */}
          <button
            onClick={onExportExcel}
            className="flex items-center space-x-1.5 bg-[#1A1A1A] hover:bg-[#333333] active:scale-95 text-white text-[11px] uppercase tracking-widest font-semibold px-3.5 py-1.5 rounded-full transition-all shadow-xs"
            title="匯出 Excel 報表"
          >
            <Download className="w-3.5 h-3.5 text-[#C2B280]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {/* Mobile Frame Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="p-1.5 rounded-full text-[#6D5D4E] hover:text-[#1A1A1A] hover:bg-[#F2EDE7] transition-colors border border-[#E5E2DD]"
            title={isMobileFrame ? '切換全螢幕/電腦模式' : '切換 iOS 手機模擬模式'}
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

