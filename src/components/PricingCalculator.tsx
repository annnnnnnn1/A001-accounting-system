import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Sparkles, 
  Edit3, 
  Trash2, 
  HelpCircle,
  TrendingUp,
  Bot,
  CreditCard,
  Scale
} from 'lucide-react';
import { SquishyRecipe, MaterialItem } from '../types';

interface PricingCalculatorProps {
  recipes: SquishyRecipe[];
  materials: MaterialItem[];
  onAddRecipe: () => void;
  onEditRecipe: (recipe: SquishyRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onUpdateRecipePrice: (id: string, newActualPrice: number, targetMargin: number) => void;
  onUpdateRecipeFees?: (id: string, platformFee: number, cardFee: number, crossBorderFee: number, customAdj: number) => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  recipes,
  onAddRecipe,
  onEditRecipe,
  onDeleteRecipe,
  onUpdateRecipePrice,
  onUpdateRecipeFees
}) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];

  if (!selectedRecipe) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center space-y-4 border border-[#E5E2DD]">
        <Calculator className="w-12 h-12 text-[#C2B280] mx-auto" />
        <h3 className="text-base font-serif font-bold text-[#1A1A1A]">尚未建立捏捏品項定價配方</h3>
        <p className="text-xs text-[#6D5D4E]">立即新增第一款捏捏，精準試算AB膠克數、模具分攤與跨境手續費！</p>
        <button
          onClick={onAddRecipe}
          className="bg-[#1A1A1A] hover:bg-[#333] text-white text-xs uppercase tracking-widest font-semibold px-5 py-2.5 rounded-full transition-all"
        >
          ➕ 新增第一款捏捏定價
        </button>
      </div>
    );
  }

  // Calculate profitability metrics
  const actualPrice = selectedRecipe.actualPrice;
  const trueCost = selectedRecipe.totalTrueCost;
  const platformFee = Math.round(actualPrice * (selectedRecipe.platformFeePercent / 100));
  const cardFee = Math.round(actualPrice * ((selectedRecipe.cardFeePercent || 0) / 100));
  const crossBorderFee = Math.round(actualPrice * ((selectedRecipe.crossBorderFeePercent || 0) / 100));
  const customAdj = selectedRecipe.customFeeAdjustment || 0;
  
  const totalFees = platformFee + cardFee + crossBorderFee + customAdj;
  const unitNetProfit = Math.round(actualPrice - trueCost - totalFees);
  const netMarginPercent = actualPrice > 0 ? Number(((unitNetProfit / actualPrice) * 100).toFixed(1)) : 0;
  
  const hourlyRateYield = selectedRecipe.laborMinutes > 0
    ? Math.round(((unitNetProfit + selectedRecipe.laborCost) / (selectedRecipe.laborMinutes / 60)))
    : 0;

  // AI Fee Engine Handler
  const handleAiFeeQuery = async (platformName: string) => {
    setAiLoading(true);
    setAiReasoning(null);
    try {
      const res = await fetch('/api/ai-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          cardType: '海外信用卡',
          recipeName: selectedRecipe.name,
          trueCost: selectedRecipe.totalTrueCost
        })
      });
      const data = await res.json();
      if (data.success && onUpdateRecipeFees) {
        onUpdateRecipeFees(
          selectedRecipe.id,
          data.platformFeePercent ?? 3.0,
          data.cardFeePercent ?? 1.5,
          data.crossBorderFeePercent ?? 0,
          selectedRecipe.customFeeAdjustment || 0
        );
        setAiReasoning(data.reasoning || '已為您自動試算該平台與跨境刷卡手續費。');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Page Title & Intro Banner */}
      <div className="bg-white border border-[#E5E2DD] rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F2EDE7] text-[#8C7A66] px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C2B280]" />
            <span>Gram Costing & AI Fee Engine</span>
          </div>
          <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] tracking-tight">捏捏克數精算與 AI 跨境定價</h2>
          <p className="text-xs text-[#6D5D4E] mt-1">含 AB膠/色膏克數費用、淘寶/蝦皮/跨境信用卡抽成與手動彈性覆蓋</p>
        </div>
        <button
          onClick={onAddRecipe}
          className="bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center space-x-1.5 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4 text-[#C2B280]" />
          <span>新增捏捏商品</span>
        </button>
      </div>

      {/* Recipe Tabs Selection */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {recipes.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => setSelectedRecipeId(recipe.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-2 shrink-0 border ${
              recipe.id === selectedRecipe.id
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#6D5D4E] hover:bg-[#F2EDE7] border-[#E5E2DD]'
            }`}
          >
            <span>{recipe.imageEmoji || '🐾'}</span>
            <span>{recipe.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Recipe Detail Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E2DD] space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E2DD] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F2EDE7] border border-[#E5E2DD] overflow-hidden flex items-center justify-center shrink-0">
              {selectedRecipe.imageUrl ? (
                <img src={selectedRecipe.imageUrl} alt={selectedRecipe.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{selectedRecipe.imageEmoji || '🐾'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">{selectedRecipe.name}</h3>
                <span className="bg-[#F2EDE7] text-[#8C7A66] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#E5E2DD] uppercase tracking-wider">
                  {selectedRecipe.category}
                </span>
                {selectedRecipe.gramWeight && (
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-emerald-700" />
                    <span>約 {selectedRecipe.gramWeight}g</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                {selectedRecipe.tags.map((tag, idx) => (
                  <span key={idx} className="bg-[#F9F8F6] text-[#8C7A66] text-[10px] px-2 py-0.5 rounded-md border border-[#E5E2DD]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEditRecipe(selectedRecipe)}
              className="p-2 text-[#6D5D4E] hover:text-[#1A1A1A] hover:bg-[#F2EDE7] rounded-xl transition-colors"
              title="編輯配方與費率"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteRecipe(selectedRecipe.id)}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cost Allocation Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
              <span>📊 成本結構與克數分攤明細 (每件捏捏)</span>
            </h4>
            <button
              onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
              className="text-[11px] text-[#4A5D4E] hover:underline flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>克數與費率計算說明</span>
            </button>
          </div>

          {showFormulaTooltip && (
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 text-xs text-[#6D5D4E] space-y-1 mb-4">
              <p className="font-bold text-[#1A1A1A]">💡 捏捏真實成本與雙軌費率公式：</p>
              <p>• <strong>克數耗材成本</strong> = AB膠/原液(使用克數 × 克單價) + 色膏/植絨粉用量。</p>
              <p>• <strong>模具壽命折舊</strong> = 模具購買價格 ÷ 預估翻模次數 (例 ¥180 / 60次 = ¥3/次)。</p>
              <p>• <strong>雙軌扣費機制</strong> = 平台抽成({selectedRecipe.platformFeePercent}%) + 海外刷卡費({selectedRecipe.cardFeePercent || 1.5}%) + 跨境處理費 + 手動調整。</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Pillar 1: Consumables */}
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[#1A1A1A]">
                <span className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider">
                  🧪 1. 克數精算耗材
                </span>
                <span className="text-xs font-serif font-bold text-[#4A5D4E]">¥{selectedRecipe.totalConsumableCost}</span>
              </div>
              <div className="text-[10px] text-[#8C7A66] space-y-1">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[110px]">{ing.materialName} ({ing.amountUsed}g)</span>
                    <span className="font-mono">¥{ing.calculatedCost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 2: Mold Amortization */}
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[#1A1A1A]">
                <span className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider">
                  🛠️ 2. 模具折舊
                </span>
                <span className="text-xs font-serif font-bold text-[#C2B280]">¥{selectedRecipe.moldAmortizedCost}</span>
              </div>
              <p className="text-[10px] text-[#8C7A66]">
                單次翻模分攤，確保固定資產投入不虧本。
              </p>
            </div>

            {/* Pillar 3: Packaging */}
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[#1A1A1A]">
                <span className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider">
                  📦 3. 包裝資材
                </span>
                <span className="text-xs font-serif font-bold text-[#8C7A66]">¥{selectedRecipe.totalPackagingCost}</span>
              </div>
              <div className="text-[10px] text-[#8C7A66] space-y-1">
                {selectedRecipe.packagingIngredients.map((ing, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{ing.materialName}</span>
                    <span className="font-mono">¥{ing.calculatedCost}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 4: Direct Labor */}
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[#1A1A1A]">
                <span className="text-[11px] font-bold flex items-center gap-1 uppercase tracking-wider">
                  ⏱️ 4. 人工工時
                </span>
                <span className="text-xs font-serif font-bold text-[#1A1A1A]">¥{selectedRecipe.laborCost}</span>
              </div>
              <p className="text-[10px] text-[#8C7A66]">
                耗時 {selectedRecipe.laborMinutes} 分鐘 (目標時薪 ¥{selectedRecipe.targetHourlyWage}/hr)
              </p>
            </div>
          </div>
        </div>

        {/* AI Cross-Border Fee Engine Drawer */}
        <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-[#C2B280]" />
              <span className="text-xs font-bold text-[#1A1A1A]">AI 智能平台與跨境費率帶入 (雙軌機制)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {['淘寶/1688', '蝦皮購物', 'Pinkoi'].map(plat => (
                <button
                  key={plat}
                  onClick={() => handleAiFeeQuery(plat)}
                  disabled={aiLoading}
                  className="text-[11px] bg-white hover:bg-[#F2EDE7] border border-[#E5E2DD] text-[#1A1A1A] px-2.5 py-1 rounded-xl font-semibold transition-all shadow-2xs"
                >
                  帶入 {plat} 費率
                </button>
              ))}
            </div>
          </div>

          {aiReasoning && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-medium">
              💡 {aiReasoning}
            </div>
          )}

          {/* Fee Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
              <span className="text-[10px] text-[#8C7A66] block">平台抽成 ({selectedRecipe.platformFeePercent}%)</span>
              <span className="font-serif font-bold text-[#1A1A1A]">¥{platformFee}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
              <span className="text-[10px] text-[#8C7A66] block">海外刷卡 ({selectedRecipe.cardFeePercent || 1.5}%)</span>
              <span className="font-serif font-bold text-[#1A1A1A]">¥{cardFee}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
              <span className="text-[10px] text-[#8C7A66] block">跨境處理解 ({selectedRecipe.crossBorderFeePercent || 0}%)</span>
              <span className="font-serif font-bold text-[#1A1A1A]">¥{crossBorderFee}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
              <span className="text-[10px] text-[#8C7A66] block">手動調整/回饋</span>
              <span className="font-serif font-bold text-[#4A5D4E]">¥{customAdj}</span>
            </div>
          </div>
        </div>

        {/* Total Cost Summary Pill */}
        <div className="bg-[#1A1A1A] text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-white/50 block">每件捏捏真實總成本 Total True Cost</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-serif font-bold text-[#C2B280]">¥{selectedRecipe.totalTrueCost}</span>
              <span className="text-xs text-white/60">
                (硬性直接支出 ¥{selectedRecipe.totalDirectCost})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-white/50 block">智能推薦售價 Suggested Price</span>
            <span className="text-2xl font-serif font-bold text-[#4A5D4E] bg-white/10 px-3 py-1 rounded-xl inline-block mt-1">
              ¥{selectedRecipe.suggestedPrice}
            </span>
          </div>
        </div>

        {/* Interactive Pricing Strategy & Profitability Yield Analyzer */}
        <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4A5D4E]" />
              <span>定價策略與實際淨利試算</span>
            </h4>
            <span className="text-[10px] bg-[#F2EDE7] text-[#8C7A66] border border-[#E5E2DD] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              目前售價: ¥{actualPrice}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Actual Selling Price Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1A1A1A] block">
                實際銷售定價 (¥)
              </label>
              <input
                type="number"
                value={actualPrice}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  onUpdateRecipePrice(selectedRecipe.id, val, selectedRecipe.targetMarginPercent);
                }}
                className="w-full bg-white border border-[#E5E2DD] rounded-xl px-3 py-2 text-sm font-bold text-[#1A1A1A] font-mono focus:outline-hidden focus:border-[#1A1A1A]"
              />
              <p className="text-[10px] text-[#8C7A66]">
                建議標價: <strong>¥{selectedRecipe.suggestedPrice}</strong> (依手作難度隨心定價)
              </p>
            </div>

            {/* Target Margin % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#1A1A1A]">期望目標毛利率</span>
                <span className="font-bold text-[#4A5D4E]">{selectedRecipe.targetMarginPercent}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={selectedRecipe.targetMarginPercent}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateRecipePrice(selectedRecipe.id, actualPrice, val);
                }}
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C7A66]">
                <span>薄利多銷 (20%)</span>
                <span>合理手作 (50%)</span>
                <span>高價值精品 (80%)</span>
              </div>
            </div>
          </div>

          {/* Profitability Outcome Yield Indicators */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E5E2DD]">
            <div className="bg-white rounded-xl p-3 border border-[#E5E2DD] text-center">
              <span className="text-[10px] text-[#8C7A66] uppercase tracking-wider block">單個扣費後純利</span>
              <span className={`text-base font-serif font-bold ${unitNetProfit >= 0 ? 'text-[#4A5D4E]' : 'text-rose-600'}`}>
                ¥{unitNetProfit}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#E5E2DD] text-center">
              <span className="text-[10px] text-[#8C7A66] uppercase tracking-wider block">真實淨利率 (%)</span>
              <span className="text-base font-serif font-bold text-[#1A1A1A]">{netMarginPercent}%</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#E5E2DD] text-center">
              <span className="text-[10px] text-[#8C7A66] uppercase tracking-wider block">折算報酬時薪</span>
              <span className="text-base font-serif font-bold text-[#C2B280]">¥{hourlyRateYield}/hr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
