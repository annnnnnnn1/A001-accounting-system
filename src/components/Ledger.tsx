import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  Pencil,
  Calendar, 
  CreditCard,
  FileSpreadsheet,
  Bookmark,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Transaction, MaterialItem, SquishyRecipe, TransactionTemplate } from '../types';
import { getCategoryLabel } from '../utils/calculations';

interface LedgerProps {
  transactions: Transaction[];
  materials: MaterialItem[];
  recipes: SquishyRecipe[];
  templates?: TransactionTemplate[];
  onOpenQuickAdd: () => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteTemplate?: (id: string) => void;
  onApplyTemplate?: (tpl: TransactionTemplate) => void;
}

export const Ledger: React.FC<LedgerProps> = ({
  transactions,
  materials,
  recipes,
  templates = [],
  onOpenQuickAdd,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteTemplate,
  onApplyTemplate
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Filtering
  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (searchQuery && !tx.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Quick stats
  const totalIn = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const net = totalIn - totalOut;

  // Export Excel Report Handler
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: 收支紀錄
      const txData = transactions.map(t => ({
        '日期': t.date,
        '收支類型': t.type === 'income' ? '收入' : '支出',
        '交易說明': t.title,
        '分類': getCategoryLabel(t.category),
        '金額 (¥)': t.amount,
        '支付/收款管道': t.paymentMethod || '',
        '備註': t.note || ''
      }));
      const ws1 = XLSX.utils.json_to_sheet(txData);
      XLSX.utils.book_append_sheet(wb, ws1, '收支交易紀錄');

      // Sheet 2: 耗材庫存與補貨外連
      const matData = materials.map(m => ({
        '資材名稱': m.name,
        '類別': m.type === 'consumable' ? '耗材' : m.type === 'tool_mold' ? '模具' : '包裝',
        '現有庫存': m.currentStock,
        '單位': m.unit,
        '購買金額 (¥)': m.purchasePrice,
        '單位成本 (¥/g或個)': m.costPerUnit,
        '一鍵補貨網址': m.restockUrl || ''
      }));
      const ws2 = XLSX.utils.json_to_sheet(matData);
      XLSX.utils.book_append_sheet(wb, ws2, '資材庫存盤點');

      // Sheet 3: 捏捏定價與平台抽成
      const recipeData = recipes.map(r => ({
        '捏捏商品': r.name,
        '系列': r.category,
        '真實總成本 (¥)': r.totalTrueCost,
        '建議售價 (¥)': r.suggestedPrice,
        '實際售價 (¥)': r.actualPrice,
        '平台抽成 (%)': r.platformFeePercent,
        '海外刷卡 (%)': r.cardFeePercent || 1.5,
        '克數重量 (g)': r.gramWeight || 0
      }));
      const ws3 = XLSX.utils.json_to_sheet(recipeData);
      XLSX.utils.book_append_sheet(wb, ws3, '捏捏定價明細');

      XLSX.writeFile(wb, `Squishy_Accounting_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      console.error('Excel Export Error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Top Banner */}
      <div className="bg-white border border-[#E5E2DD] rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F2EDE7] text-[#8C7A66] px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5 text-[#C2B280]" />
            <span>Financial Ledger & Custom Templates</span>
          </div>
          <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] tracking-tight">手作店鋪記帳與 Excel 報表</h2>
          <p className="text-xs text-[#6D5D4E] mt-1">自訂收支分類與管道、儲存常用範本庫，並支援一鍵匯出 Excel</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] font-semibold text-xs px-4 py-2.5 rounded-full flex items-center space-x-1.5 transition-all border border-[#E5E2DD]"
            title="匯出 Excel 完整對帳報表"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#4A5D4E]" />
            <span>匯出 Excel</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#C2B280]" />
            <span>記一筆</span>
          </button>
        </div>
      </div>

      {/* Template Library Toggle Drawer */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center space-x-2 text-xs font-bold text-[#1A1A1A] hover:text-[#4A5D4E] transition-colors"
          >
            <Bookmark className="w-4 h-4 text-[#C2B280]" />
            <span>⚡ 常用記帳範本庫 ({templates.length})</span>
            <span className="text-[10px] text-[#8C7A66] font-normal">(點擊{showTemplates ? '收合' : '展開'})</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="text-[11px] font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 新增範本
          </button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E5E2DD]/60">
            {templates.map(tpl => (
              <div key={tpl.id} className="bg-[#F9F8F6] rounded-2xl p-3 border border-[#E5E2DD] flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">{tpl.name}</h4>
                  <p className="text-[10px] text-[#8C7A66] mt-0.5">
                    {tpl.type === 'expense' ? '支出' : '收入'} · {tpl.paymentMethod || '信用卡'} · <strong className="font-mono text-[#1A1A1A]">¥{tpl.amount}</strong>
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  {onApplyTemplate && (
                    <button
                      onClick={() => onApplyTemplate(tpl)}
                      className="bg-[#1A1A1A] text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                    >
                      帶入
                    </button>
                  )}
                  {onDeleteTemplate && (
                    <button
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Type Filters */}
          <div className="flex space-x-1 bg-[#F2EDE7] p-1 rounded-full border border-[#E5E2DD]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
              }`}
            >
              全部 ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'income'
                  ? 'bg-[#4A5D4E] text-white shadow-xs'
                  : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
              }`}
            >
              收入紀錄 (+)
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
              }`}
            >
              支出紀錄 (-)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7A66] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋交易項目描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5E2DD] rounded-xl w-full sm:w-52 focus:outline-hidden focus:border-[#1A1A1A]"
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center space-x-2 text-xs pt-1 border-t border-[#E5E2DD]/50">
          <Filter className="w-3.5 h-3.5 text-[#8C7A66]" />
          <span className="text-[#6D5D4E] font-medium">分類篩選：</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-1 text-[#1A1A1A] text-xs focus:outline-hidden"
          >
            <option value="all">全部分類</option>
            <optgroup label="支出分類">
              <option value="consumable">一次性耗材 (膠/色膏/粉)</option>
              <option value="tool_mold">固定模具與工具</option>
              <option value="packaging">包裝材料</option>
              <option value="shipping">物流運費</option>
              <option value="platform">平台抽成與跨境費</option>
              <option value="booth">市集攤位費</option>
            </optgroup>
            <optgroup label="收入分類">
              <option value="squishy_sale">捏捏成品銷售</option>
              <option value="custom_order">客製捏捏訂單</option>
              <option value="market_booth">市集現場銷售</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Filtered Summary Bar */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-white border border-[#E5E2DD] rounded-2xl p-3.5 text-center">
          <span className="text-[#8C7A66] block text-[10px] uppercase tracking-wider">收入小計</span>
          <span className="font-serif font-bold text-[#4A5D4E] text-base mt-0.5 block">+¥{totalIn}</span>
        </div>
        <div className="bg-white border border-[#E5E2DD] rounded-2xl p-3.5 text-center">
          <span className="text-[#8C7A66] block text-[10px] uppercase tracking-wider">支出小計</span>
          <span className="font-serif font-bold text-rose-700 text-base mt-0.5 block">-¥{totalOut}</span>
        </div>
        <div className="bg-[#1A1A1A] text-white rounded-2xl p-3.5 text-center">
          <span className="text-white/50 block text-[10px] uppercase tracking-wider">對帳淨額</span>
          <span className={`font-serif font-bold text-base mt-0.5 block ${net >= 0 ? 'text-[#C2B280]' : 'text-rose-400'}`}>
            ¥{net}
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] divide-y divide-[#E5E2DD]/60">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-[#8C7A66] text-xs">
            查無符合條件的記帳紀錄
          </div>
        ) : (
          filteredTransactions.map(tx => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between group hover:bg-[#F9F8F6] px-2 rounded-xl transition-colors">
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    tx.type === 'income'
                      ? 'bg-[#F2EDE7] text-[#4A5D4E] border-[#E5E2DD]'
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1A1A1A]">{tx.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8C7A66] mt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#8C7A66]" />
                      {tx.date}
                    </span>
                    <span>·</span>
                    <span className="bg-[#F2EDE7] text-[#8C7A66] px-2 py-0.5 rounded-md font-semibold border border-[#E5E2DD]">
                      {getCategoryLabel(tx.category)}
                    </span>
                    {tx.paymentMethod && (
                      <>
                        <span>·</span>
                        <span className="text-[#6D5D4E] uppercase tracking-wider font-mono">{tx.paymentMethod}</span>
                      </>
                    )}
                  </div>
                  {tx.note && <p className="text-[10px] text-[#8C7A66] mt-0.5">{tx.note}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`text-base font-serif font-bold ${
                    tx.type === 'income' ? 'text-[#4A5D4E]' : 'text-[#1A1A1A]'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}¥{tx.amount}
                </span>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  {onEditTransaction && (
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="opacity-60 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F2EDE7] rounded-lg transition-all"
                      title="編輯這筆紀錄"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="opacity-40 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
