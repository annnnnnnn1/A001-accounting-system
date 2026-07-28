import React from 'react';
import { 
  PieChart as PieIcon, 
  Award, 
  Download, 
  FileSpreadsheet, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { ShopSummary, SquishyRecipe, Transaction, MaterialItem } from '../types';

interface AnalyticsViewProps {
  summary: ShopSummary;
  recipes: SquishyRecipe[];
  transactions: Transaction[];
  materials: MaterialItem[];
  onExportExcel: () => void;
}

const COLORS = ['#1A1A1A', '#4A5D4E', '#C2B280', '#8C7A66', '#A39281'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  summary,
  recipes,
  materials,
  onExportExcel
}) => {
  // Pie chart cost breakdown
  const costPieData = [
    { name: '一次性耗材 (膠/粉/色膏)', value: summary.consumableExpense },
    { name: '固定模具與工具', value: summary.toolExpense },
    { name: '包裝資材', value: summary.packagingExpense },
    { name: '運費與平台雜項', value: summary.otherExpense }
  ].filter(item => item.value > 0);

  // Profitability Ranking Data for Recipes
  const productProfitData = recipes.map(recipe => {
    const platformFee = Math.round(recipe.actualPrice * (recipe.platformFeePercent / 100));
    const unitNetProfit = recipe.actualPrice - recipe.totalTrueCost - platformFee;
    const hourlyRateYield = recipe.laborMinutes > 0
      ? Math.round(((unitNetProfit + recipe.laborCost) / (recipe.laborMinutes / 60)))
      : 0;

    return {
      name: recipe.name.length > 8 ? recipe.name.substring(0, 8) + '...' : recipe.name,
      fullName: recipe.name,
      unitNetProfit,
      hourlyRateYield,
      actualPrice: recipe.actualPrice,
      trueCost: recipe.totalTrueCost
    };
  }).sort((a, b) => b.unitNetProfit - a.unitNetProfit);

  // Find most expensive tool/mold to calculate Break-Even
  const expensiveTools = materials.filter(m => m.type === 'tool_mold');

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* Top Banner */}
      <div className="bg-white border border-[#E5E2DD] rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F2EDE7] text-[#8C7A66] px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C2B280]" />
            <span>Data Intelligence · Profit Margin Optimization</span>
          </div>
          <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] tracking-tight">成本結構與商品獲利分析</h2>
          <p className="text-xs text-[#6D5D4E] mt-1">清楚分析哪一款捏捏最賺錢、時薪報酬最高</p>
        </div>

        <button
          onClick={onExportExcel}
          className="bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center space-x-1.5 shrink-0 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#C2B280]" />
          <span>匯出 Excel</span>
        </button>
      </div>

      {/* Main Grid Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cost Structure Pie Chart */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#4A5D4E]" />
              <span>支出成本結構比例 (耗材 vs. 模具 vs. 包裝)</span>
            </h3>
          </div>

          {costPieData.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {costPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`¥${value}`, '支出金額']}
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', backgroundColor: '#F9F8F6', borderColor: '#E5E2DD' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-xs text-[#8C7A66]">
              尚無支出數據
            </div>
          )}

          {/* Pie Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-[#E5E2DD]">
            {costPieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[#6D5D4E] truncate">{item.name}:</span>
                <span className="font-bold font-serif text-[#1A1A1A]">¥{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Profitability Bar Chart */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#C2B280]" />
              <span>各款捏捏單件淨利潤排行 (¥)</span>
            </h3>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productProfitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E2DD" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6D5D4E' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6D5D4E' }} />
                <Tooltip
                  formatter={(val: number) => [`¥${val}`, '單件淨利']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', backgroundColor: '#F9F8F6', borderColor: '#E5E2DD' }}
                />
                <Bar dataKey="unitNetProfit" fill="#1A1A1A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly Wage Return & Product Ranking Table */}
      <div className="bg-white rounded-3xl p-5 border border-[#E5E2DD] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C2B280]" />
            <span>捏捏商品獲利能力與時薪回報排名</span>
          </h3>
        </div>

        <div className="divide-y divide-[#E5E2DD]/60 text-xs">
          {productProfitData.map((item, index) => (
            <div key={index} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  index === 0 ? 'bg-[#1A1A1A] text-white' : 'bg-[#F2EDE7] text-[#6D5D4E]'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">{item.fullName}</h4>
                  <p className="text-[10px] text-[#8C7A66]">
                    售價 ¥{item.actualPrice} · 真實成本 ¥{item.trueCost}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center space-x-5">
                <div>
                  <span className="text-[10px] text-[#8C7A66] uppercase tracking-wider block">單件純利</span>
                  <span className="font-serif font-bold text-[#4A5D4E] text-sm">¥{item.unitNetProfit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7A66] uppercase tracking-wider block">折算時薪</span>
                  <span className="font-serif font-bold text-[#C2B280] text-sm">¥{item.hourlyRateYield}/hr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Break-Even Investment ROI Tracker */}
      {expensiveTools.length > 0 && (
        <div className="bg-[#1A1A1A] text-white rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#C2B280] uppercase tracking-widest flex items-center gap-2">
              <span>🛠️ 固定資產設備保本回報率 (Break-Even)</span>
            </h3>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">Equipment Amortization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expensiveTools.slice(0, 2).map(tool => {
              const avgNetProfitPerSquishy = 80; // average
              const breakEvenUnits = Math.ceil(tool.purchasePrice / avgNetProfitPerSquishy);

              return (
                <div key={tool.id} className="bg-white/5 rounded-2xl p-4 text-xs space-y-1.5 border border-white/10">
                  <div className="flex justify-between font-bold text-white">
                    <span>{tool.name}</span>
                    <span className="text-[#C2B280] font-serif">¥{tool.purchasePrice}</span>
                  </div>
                  <p className="text-[10px] text-white/70">
                    估算約需售出 <strong className="text-white">{breakEvenUnits} 個捏捏</strong> 即可全額回收該項設備成本！
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Excel Export CTA Card */}
      <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-xs shrink-0">
            <FileSpreadsheet className="w-6 h-6 text-[#C2B280]" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1A1A1A]">一鍵匯出全套 Excel 財務與庫存報表</h3>
            <p className="text-xs text-[#6D5D4E] mt-0.5">
              包含「經營總覽、收支明細、原料模具庫存表、捏捏定價分析」4大完整工作表
            </p>
          </div>
        </div>

        <button
          onClick={onExportExcel}
          className="w-full sm:w-auto bg-[#1A1A1A] hover:bg-[#333] active:scale-95 text-white font-semibold text-xs uppercase tracking-widest px-6 py-3.5 rounded-full transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Download className="w-4 h-4 text-[#C2B280]" />
          <span>下載 .xlsx 報表</span>
        </button>
      </div>
    </div>
  );
};

