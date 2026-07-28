import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { MaterialItem, SquishyRecipe } from '../types';

interface InventoryManagerProps {
  materials: MaterialItem[];
  recipes: SquishyRecipe[];
  onAddMaterial: () => void;
  onEditMaterial: (mat: MaterialItem) => void;
  onDeleteMaterial: (id: string) => void;
  onUpdateStock: (id: string, delta: number) => void;
  onRestockMaterial: (mat: MaterialItem, addedQty: number, totalPrice: number) => void;
  onUpdateRecipeStock: (recipeId: string, delta: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  materials,
  recipes,
  onAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onUpdateStock,
  onRestockMaterial,
  onUpdateRecipeStock
}) => {
  const [activeTab, setActiveTab] = useState<'consumable' | 'tool_mold' | 'finished'>('consumable');
  const [searchQuery, setSearchQuery] = useState('');
  const [restockItem, setRestockItem] = useState<MaterialItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(100);
  const [restockPrice, setRestockPrice] = useState<number>(300);

  // Filter materials
  const filteredMaterials = materials.filter(mat => {
    const matchesTab = mat.type === activeTab || (activeTab === 'consumable' && mat.type === 'packaging');
    const matchesSearch = mat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleConfirmRestock = () => {
    if (!restockItem) return;
    onRestockMaterial(restockItem, restockQty, restockPrice);
    setRestockItem(null);
  };

  const handleOpenRestockUrl = (url?: string) => {
    if (!url) return;
    let target = url;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E2DD] rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F2EDE7] text-[#8C7A66] px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
            <Package className="w-3.5 h-3.5 text-[#C2B280]" />
            <span>Inventory & Restock Engine</span>
          </div>
          <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] tracking-tight">手作庫存、圖文與一鍵補貨</h2>
          <p className="text-xs text-[#6D5D4E] mt-1">即時掌握克數剩餘量、外連淘寶/1688一鍵前往補貨與成品庫存</p>
        </div>

        {activeTab !== 'finished' && (
          <button
            onClick={onAddMaterial}
            className="bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center space-x-1.5 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4 text-[#C2B280]" />
            <span>新增資材/補貨網址</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex space-x-1 bg-[#F2EDE7] p-1 rounded-full border border-[#E5E2DD]">
          <button
            onClick={() => setActiveTab('consumable')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'consumable'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
            }`}
          >
            <span>🧪 耗材與包裝資材</span>
          </button>

          <button
            onClick={() => setActiveTab('tool_mold')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'tool_mold'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
            }`}
          >
            <span>🛠️ 模具與工具設備</span>
          </button>

          <button
            onClick={() => setActiveTab('finished')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 ${
              activeTab === 'finished'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
            }`}
          >
            <span>🐾 捏捏成品庫存</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8C7A66] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋原物料、模具或網址..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5E2DD] rounded-xl w-full sm:w-56 focus:outline-hidden focus:border-[#1A1A1A]"
          />
        </div>
      </div>

      {/* Main Material List View */}
      {activeTab !== 'finished' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map(mat => {
            const isLow = mat.currentStock <= mat.minStockAlert;
            return (
              <div
                key={mat.id}
                className={`bg-white rounded-3xl p-5 border transition-all space-y-4 ${
                  isLow ? 'border-amber-400 bg-amber-50/10' : 'border-[#E5E2DD]'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Material Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-[#F9F8F6] border border-[#E5E2DD] overflow-hidden flex items-center justify-center shrink-0">
                    {mat.imageUrl ? (
                      <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#8C7A66]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-serif font-bold text-[#1A1A1A]">{mat.name}</h3>
                      {isLow && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-700" /> 低庫存預警
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#8C7A66] line-clamp-1">{mat.note || '未填寫備註'}</p>

                    {/* Restock External Link Button */}
                    {mat.restockUrl && (
                      <button
                        onClick={() => handleOpenRestockUrl(mat.restockUrl)}
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#4A5D4E] hover:text-[#1A1A1A] hover:underline transition-colors mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3 text-[#C2B280]" />
                        <span>一鍵連至淘寶/1688補貨頁</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditMaterial(mat)}
                      className="p-1.5 text-[#6D5D4E] hover:text-[#1A1A1A] hover:bg-[#F2EDE7] rounded-lg transition-colors"
                      title="編輯材料與連結"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Level Bar & Cost Info */}
                <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8C7A66] block">當前剩餘存量</span>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className={`text-lg font-serif font-bold ${isLow ? 'text-amber-700' : 'text-[#1A1A1A]'}`}>
                        {mat.currentStock}
                      </span>
                      <span className="text-[#6D5D4E] text-[11px]">{mat.unit}</span>
                      <span className="text-[10px] text-[#8C7A66] ml-1">
                        (警戒 {mat.minStockAlert}{mat.unit})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8C7A66] block">
                      {mat.type === 'tool_mold' ? '單次翻模分攤' : '克數/單位取得單價'}
                    </span>
                    <span className="text-sm font-serif font-bold text-[#4A5D4E] mt-0.5 block">
                      {mat.type === 'tool_mold'
                        ? `¥${mat.amortizedCostPerUse || mat.costPerUnit}/次`
                        : `¥${mat.costPerUnit}/${mat.unit}`}
                    </span>
                  </div>
                </div>

                {/* Quick Increment/Decrement & Restock Button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onUpdateStock(mat.id, -10)}
                      className="px-2 py-1 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] text-[11px] font-semibold rounded-lg transition-colors font-mono"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => onUpdateStock(mat.id, -1)}
                      className="w-7 h-7 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] font-semibold rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateStock(mat.id, 1)}
                      className="w-7 h-7 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] font-semibold rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateStock(mat.id, 10)}
                      className="px-2 py-1 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] text-[11px] font-semibold rounded-lg transition-colors font-mono"
                    >
                      +10
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {mat.restockUrl && (
                      <button
                        onClick={() => handleOpenRestockUrl(mat.restockUrl)}
                        className="bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] font-semibold text-xs px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1"
                        title="開啟外部採購頁"
                      >
                        <ExternalLink className="w-3 h-3 text-[#C2B280]" />
                        <span>外連</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setRestockItem(mat);
                        setRestockQty(100);
                        setRestockPrice(mat.purchasePrice);
                      }}
                      className="bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3 text-[#C2B280]" />
                      <span>進貨紀錄</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Finished Squishy Stock View */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F9F8F6] border border-[#E5E2DD] overflow-hidden flex items-center justify-center shrink-0">
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{recipe.imageEmoji || '🐾'}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#1A1A1A]">{recipe.name}</h3>
                  <p className="text-xs text-[#4A5D4E] font-semibold font-mono">售價 ¥{recipe.actualPrice}</p>
                </div>
              </div>

              <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 flex justify-between items-center">
                <span className="text-xs text-[#6D5D4E] font-medium">現有成品存貨</span>
                <span className="text-xl font-serif font-bold text-[#1A1A1A]">{recipe.stockQty} 個</span>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onUpdateRecipeStock(recipe.id, -1)}
                  className="flex-1 py-2 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>售出 -1</span>
                </button>
                <button
                  onClick={() => onUpdateRecipeStock(recipe.id, 1)}
                  className="flex-1 py-2 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C2B280]" />
                  <span>製作完成 +1</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-5 border border-[#E5E2DD] shadow-xl">
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
              📦 快速補貨：{restockItem.name}
            </h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5">
                  採購增加數量 ({restockItem.unit})
                </label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value) || 0)}
                  className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl p-2.5 font-bold font-mono text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1A1A1A] block mb-1.5">
                  採購總支出金額 (¥)
                </label>
                <input
                  type="number"
                  value={restockPrice}
                  onChange={(e) => setRestockPrice(Number(e.target.value) || 0)}
                  className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl p-2.5 font-bold font-mono text-[#4A5D4E] focus:outline-hidden focus:border-[#1A1A1A]"
                />
                <p className="text-[10px] text-[#8C7A66] mt-1.5">
                  💡 系統將會自動在記帳簿中新增一筆耗材進貨支出紀錄。
                </p>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setRestockItem(null)}
                className="flex-1 py-2.5 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] rounded-xl text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRestock}
                className="flex-1 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl text-xs font-semibold"
              >
                確認進貨紀錄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
