import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  PlusCircle, 
  Calculator, 
  Package, 
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Pencil,
  Trash2
} from 'lucide-react';
import { ShopSummary, MaterialItem, Transaction, SquishyRecipe } from '../types';
import { getCategoryLabel } from '../utils/calculations';

interface DashboardProps {
  summary: ShopSummary;
  materials: MaterialItem[];
  transactions: Transaction[];
  recipes: SquishyRecipe[];
  onNavigateTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onOpenRecipeModal: () => void;
  onExportExcel: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  materials,
  transactions,
  recipes,
  onNavigateTab,
  onOpenQuickAdd,
  onEditTransaction,
  onDeleteTransaction,
  onOpenRecipeModal,
  onExportExcel
}) => {
  const lowStockItems = materials.filter(m => m.currentStock <= m.minStockAlert);
  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const totalExpenseBreakdown = (summary.consumableExpense + summary.toolExpense + summary.packagingExpense + summary.otherExpense) || 1;
  const consumablePct = Math.round((summary.consumableExpense / totalExpenseBreakdown) * 100);
  const toolPct = Math.round((summary.toolExpense / totalExpenseBreakdown) * 100);
  const packagingPct = Math.round((summary.packagingExpense / totalExpenseBreakdown) * 100);
  const otherPct = Math.max(0, 100 - (consumablePct + toolPct + packagingPct));

  return (
    <div className="space-y-6 pb-6 font-sans">
      
      {/* Top Banner & Quick Action */}
      <div className="bg-white border border-[#E5E2DD] rounded-3xl p-6 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F2EDE7] text-[#8C7A66] rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-[#C2B280]" />
              <span>Graduate Edition · NieNie Ledger</span>
            </div>
            <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] tracking-tight">
              當月經營收支與耗材分攤
            </h2>
            <p className="text-xs text-[#6D5D4E] mt-1">
              精確分攤耗材與耐久模具，極致掌控手作捏捏毛利率
            </p>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="px-5 py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-[#333] transition-all flex items-center gap-2 shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#C2B280]" />
            <span>記一筆</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-[#E5E2DD]">
        <div className="border-b-2 md:border-b-0 md:border-r border-[#1A1A1A] pb-4 md:pb-0 md:pr-6">
          <p className="text-[10px] uppercase tracking-widest text-[#8C7A66] font-bold mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#4A5D4E]" />
            總營業收入 Total Revenue
          </p>
          <p className="text-3xl font-serif tracking-tight text-[#1A1A1A]">
            ¥{summary.totalIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#4A5D4E] mt-2 font-bold uppercase tracking-wider">
            +18.4% 營運成長
          </p>
        </div>

        <div className="border-b-2 md:border-b-0 md:border-r border-[#E5E2DD] pb-4 md:pb-0 md:pr-6">
          <p className="text-[10px] uppercase tracking-widest text-[#8C7A66] font-bold mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#C2B280]" />
            淨利潤 Net Profit
          </p>
          <p className={`text-3xl font-serif tracking-tight ${summary.netProfit >= 0 ? 'text-[#4A5D4E]' : 'text-rose-600'}`}>
            ¥{summary.netProfit.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#8C7A66] mt-2 font-bold uppercase tracking-wider">
            淨利率 {summary.grossMarginRate}%
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8C7A66] font-bold mb-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-rose-500" />
            總營業支出 Total Expense
          </p>
          <p className="text-3xl font-serif tracking-tight text-[#1A1A1A]">
            ¥{summary.totalExpense.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#8C7A66] mt-2 font-bold uppercase tracking-wider">
            {lowStockItems.length > 0 ? `${lowStockItems.length} 項原物料需補貨` : '庫存狀況良好'}
          </p>
        </div>
      </div>

      {/* Middle Grid: Cost Analysis & Dark Strategy Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost Analysis */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E2DD] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">支出結構與自動分類</h3>
              <span className="text-[10px] text-[#8C7A66] font-mono">BY CATEGORY</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#1A1A1A]">
                  <span>一次性耗材 (AB膠/色膏/植絨)</span>
                  <span className="font-mono">¥{summary.consumableExpense} ({consumablePct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#F3F4F1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4A5D4E] rounded-full" style={{ width: `${consumablePct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#1A1A1A]">
                  <span>模具與工具分攤</span>
                  <span className="font-mono">¥{summary.toolExpense} ({toolPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#F3F4F1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C2B280] rounded-full" style={{ width: `${toolPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#1A1A1A]">
                  <span>包裝與包材</span>
                  <span className="font-mono">¥{summary.packagingExpense} ({packagingPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#F3F4F1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D9C5B2] rounded-full" style={{ width: `${packagingPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium text-[#1A1A1A]">
                  <span>運費與市集雜項</span>
                  <span className="font-mono">¥{summary.otherExpense} ({otherPct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-[#F3F4F1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8C7A66] rounded-full" style={{ width: `${otherPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-[#E5E2DD]">
            <p className="text-xs text-[#6D5D4E] italic flex items-center gap-2">
              <span className="text-[#4A5D4E] font-bold">💡 策略建議:</span> 
              批次購買 AB 膠原料可降低單件產品邊際成本約 15%。
            </p>
          </div>
        </div>

        {/* Pricing Strategy Dark Card */}
        <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="text-xs uppercase tracking-widest font-bold text-white">熱門捏捏定價策略</h3>
              <span className="text-[10px] text-[#C2B280] font-mono uppercase tracking-widest">Pricing Strategy</span>
            </div>

            {recipes.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs opacity-70">主打款式: {recipes[0].name}</span>
                  <span className="text-[10px] font-mono text-[#C2B280]">{recipes[0].category}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">耗材與模具成本</p>
                    <p className="text-xl font-serif font-bold text-white">¥{recipes[0].totalTrueCost}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] opacity-40 uppercase tracking-widest mb-1">設定售價</p>
                    <p className="text-xl font-serif font-bold text-[#C2B280]">¥{recipes[0].actualPrice}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="opacity-70">目標毛利率 (Target Margin)</span>
                    <span className="font-bold text-[#C2B280]">{recipes[0].targetMarginPercent}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full">
                    <div className="h-full bg-[#C2B280] rounded-full" style={{ width: `${Math.min(100, recipes[0].targetMarginPercent)}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/50 py-4">尚無商品配方，請至定價計算頁新增。</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-white/50 uppercase tracking-widest">查看完整定價計算</span>
            <button
              onClick={() => onNavigateTab('pricing')}
              className="px-4 py-1.5 bg-[#4A5D4E] hover:bg-[#3B4C3F] text-white text-[11px] font-semibold uppercase tracking-widest rounded-full transition-all"
            >
              進入定價計算器 →
            </button>
          </div>
        </div>

      </div>

      {/* Restock Warning Banner (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-[#F2EDE7] border border-[#C2B280] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#E5E2DD] rounded-xl text-[#8C7A66]">
              <ShieldAlert className="w-5 h-5 text-[#8C7A66]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1A1A1A]">
                有 {lowStockItems.length} 項原物料庫存低於警戒線！
              </h4>
              <p className="text-[11px] text-[#6D5D4E] mt-0.5">
                {lowStockItems.map(item => item.name.split(' ')[0]).join('、')} 建議及時補貨
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-xs"
          >
            去庫存盤點
          </button>
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#8C7A66] uppercase tracking-widest px-1">
          捷徑與高頻操作 Shortcut Operations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenQuickAdd}
            className="bg-white hover:bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F2EDE7] text-[#1A1A1A] flex items-center justify-center mb-3 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] block">快速記一筆</span>
            <span className="text-[10px] text-[#8C7A66] block mt-0.5">新增收入或耗材支出</span>
          </button>

          <button
            onClick={onOpenRecipeModal}
            className="bg-white hover:bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F2EDE7] text-[#4A5D4E] flex items-center justify-center mb-3 group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] block">新捏捏試算定價</span>
            <span className="text-[10px] text-[#8C7A66] block mt-0.5">自動試算工時與毛利</span>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="bg-white hover:bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F2EDE7] text-[#8C7A66] flex items-center justify-center mb-3 group-hover:bg-[#8C7A66] group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] block">庫存與模具</span>
            <span className="text-[10px] text-[#8C7A66] block mt-0.5">查看AB膠與模具壽命</span>
          </button>

          <button
            onClick={onExportExcel}
            className="bg-white hover:bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 text-left transition-all group shadow-2xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F2EDE7] text-[#C2B280] flex items-center justify-center mb-3 group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] block">匯出 Excel 報表</span>
            <span className="text-[10px] text-[#8C7A66] block mt-0.5">多工作表完整數據</span>
          </button>
        </div>
      </div>

      {/* Top Squishy Recipes Showcase */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🐾</span>
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest">全品項捏捏成本與定價</h3>
          </div>
          <button
            onClick={() => onNavigateTab('pricing')}
            className="text-xs text-[#4A5D4E] hover:underline font-semibold flex items-center gap-1"
          >
            <span>管理品項 ({recipes.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 space-y-2 hover:border-[#4A5D4E] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{recipe.imageEmoji || '🐾'}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-1">{recipe.name}</h4>
                    <span className="text-[10px] text-[#8C7A66]">{recipe.category} · 庫存 {recipe.stockQty} 個</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-[11px] pt-2 border-t border-[#E5E2DD]">
                <div>
                  <span className="text-[#8C7A66] block text-[9px] uppercase tracking-wider">真實成本</span>
                  <span className="font-semibold text-[#1A1A1A] font-mono">¥{recipe.totalTrueCost}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#8C7A66] block text-[9px] uppercase tracking-wider">設定售價</span>
                  <span className="font-bold text-[#4A5D4E] font-mono">¥{recipe.actualPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger Feed */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
            <span>📝 近期收支明細 Recent Transactions</span>
          </h3>
          <button
            onClick={() => onNavigateTab('ledger')}
            className="text-xs text-[#4A5D4E] hover:underline font-semibold"
          >
            查看全部紀錄
          </button>
        </div>

        <div className="divide-y divide-[#E5E2DD]">
          {recentTransactions.map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between group hover:bg-[#F9F8F6] px-2 rounded-xl transition-colors">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    tx.type === 'income'
                      ? 'bg-[#F2EDE7] text-[#4A5D4E] border border-[#4A5D4E]/20'
                      : 'bg-[#F2EDE7] text-[#1A1A1A] border border-[#E5E2DD]'
                  }`}
                >
                  {tx.type === 'income' ? '收' : '支'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">{tx.title}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-[#8C7A66] mt-0.5">
                    <span className="font-mono">{tx.date}</span>
                    <span>·</span>
                    <span>{getCategoryLabel(tx.category)}</span>
                    {tx.paymentMethod && (
                      <>
                        <span>·</span>
                        <span className="uppercase font-mono">{tx.paymentMethod}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-bold font-mono ${
                    tx.type === 'income' ? 'text-[#4A5D4E]' : 'text-[#1A1A1A]'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}¥{tx.amount}
                </span>

                <div className="flex items-center space-x-1">
                  {onEditTransaction && (
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="opacity-60 group-hover:opacity-100 p-1 text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F2EDE7] rounded-md transition-all"
                      title="編輯此筆明細"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="opacity-40 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

