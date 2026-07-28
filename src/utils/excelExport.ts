import * as XLSX from 'xlsx';
import { MaterialItem, SquishyRecipe, Transaction, ShopSummary } from '../types';
import { getCategoryLabel, calculateShopSummary } from './calculations';

export interface ExportExcelData {
  shopName?: string;
  summary: ShopSummary;
  transactions: Transaction[];
  materials: MaterialItem[];
  recipes: SquishyRecipe[];
  startDate?: string;
  endDate?: string;
}

export function exportToExcel({
  shopName = '喵喵手作捏捏工作室',
  summary,
  transactions,
  materials,
  recipes,
  startDate,
  endDate
}: ExportExcelData) {
  const wb = XLSX.utils.book_new();
  const exportDate = new Date().toLocaleDateString('zh-TW');

  // -------------------------------------------------------------
  // Sheet 1: 財務總覽 (Summary)
  // -------------------------------------------------------------
  const summarySheetData = [
    ['捏捏手作工作室 - 財務經營結算總覽'],
    ['店鋪名稱', shopName],
    ['匯出日期', exportDate],
    ['統計區間', startDate && endDate ? `${startDate} 至 ${endDate}` : '全部歷史紀錄'],
    [],
    ['關鍵財務指標', '金額 (NT$)'],
    ['總營業收入', summary.totalIncome],
    ['總營業支出', summary.totalExpense],
    ['淨利潤 (收入 - 支出)', summary.netProfit],
    ['整體淨利率', `${summary.grossMarginRate}%`],
    [],
    ['成本結構明細 (支出分類小計)', '金額 (NT$)', '佔總支出比例'],
    [
      '一次性耗材 (AB膠/色膏/植絨粉)',
      summary.consumableExpense,
      summary.totalExpense > 0 ? `${((summary.consumableExpense / summary.totalExpense) * 100).toFixed(1)}%` : '0%'
    ],
    [
      '耐久模具與工具設備 (分攤卡)',
      summary.toolExpense,
      summary.totalExpense > 0 ? `${((summary.toolExpense / summary.totalExpense) * 100).toFixed(1)}%` : '0%'
    ],
    [
      '包裝與禮物盒材料',
      summary.packagingExpense,
      summary.totalExpense > 0 ? `${((summary.packagingExpense / summary.totalExpense) * 100).toFixed(1)}%` : '0%'
    ],
    [
      '其他營業費用 (運費/市集/平台費)',
      summary.otherExpense,
      summary.totalExpense > 0 ? `${((summary.otherExpense / summary.totalExpense) * 100).toFixed(1)}%` : '0%'
    ]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  // 設定第一行字體與欄寬
  wsSummary['!cols'] = [{ wch: 32 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, '財務經營總覽');

  // -------------------------------------------------------------
  // Sheet 2: 收支記帳明細 (Ledger)
  // -------------------------------------------------------------
  const ledgerRows = transactions.map(tx => ({
    '交易日期': tx.date,
    '收支類型': tx.type === 'income' ? '收入 (+)' : '支出 (-)',
    '收支分類': getCategoryLabel(tx.category),
    '金額 (NT$)': tx.amount,
    '項目標題': tx.title,
    '支付方式': tx.paymentMethod || '未指定',
    '數量': tx.quantity || 1,
    '備註說明': tx.note || ''
  }));

  const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
  wsLedger['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 24 },
    { wch: 12 },
    { wch: 30 },
    { wch: 12 },
    { wch: 8 },
    { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsLedger, '收支記帳明細');

  // -------------------------------------------------------------
  // Sheet 3: 原料與模具庫存清單 (Inventory)
  // -------------------------------------------------------------
  const inventoryRows = materials.map(mat => {
    const isLowStock = mat.currentStock <= mat.minStockAlert;
    const typeLabel =
      mat.type === 'consumable'
        ? '一次性耗材'
        : mat.type === 'tool_mold'
        ? '固定模具/工具'
        : '包裝資材';

    return {
      '材料/工具名稱': mat.name,
      '類別': typeLabel,
      '現有庫存量': mat.currentStock,
      '單位': mat.unit,
      '採購總金額': mat.purchasePrice,
      '單位成本': `$${mat.costPerUnit}/${mat.unit}`,
      '低庫存警戒線': mat.minStockAlert,
      '庫存狀態': isLowStock ? '⚠️ 庫存偏低 (需補貨)' : '✅ 庫存充足',
      '模具預估可翻模次數': mat.estimatedLifespanUses || '-',
      '模具單次分攤成本': mat.amortizedCostPerUse ? `$${mat.amortizedCostPerUse}/次` : '-',
      '備註說明': mat.note || ''
    };
  });

  const wsInventory = XLSX.utils.json_to_sheet(inventoryRows);
  wsInventory['!cols'] = [
    { wch: 28 },
    { wch: 15 },
    { wch: 12 },
    { wch: 8 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsInventory, '原料與模具庫存');

  // -------------------------------------------------------------
  // Sheet 4: 捏捏商品成本與自動定價分析 (Squishy Recipes)
  // -------------------------------------------------------------
  const recipeRows = recipes.map(recipe => {
    const estimatedProfitPerUnit = recipe.actualPrice - recipe.totalTrueCost;
    const profitMargin = recipe.actualPrice > 0 ? ((estimatedProfitPerUnit / recipe.actualPrice) * 100).toFixed(1) : '0';

    return {
      '捏捏商品名稱': recipe.name,
      '系列分類': recipe.category,
      '現有成品庫存': recipe.stockQty,
      '直接耗材成本': recipe.totalConsumableCost,
      '模具分攤成本': recipe.moldAmortizedCost,
      '包裝耗材成本': recipe.totalPackagingCost,
      '製作耗時 (分)': recipe.laborMinutes,
      '人工工時成本': recipe.laborCost,
      '真實總成本 (含人工)': recipe.totalTrueCost,
      '智能建議售價': recipe.suggestedPrice,
      '實際設定售價': recipe.actualPrice,
      '目標毛利率 (%)': `${recipe.targetMarginPercent}%`,
      '單個預估淨利': estimatedProfitPerUnit,
      '實際淨利半邊率': `${profitMargin}%`,
      '標籤屬性': recipe.tags.join(' / ')
    };
  });

  const wsRecipes = XLSX.utils.json_to_sheet(recipeRows);
  wsRecipes['!cols'] = [
    { wch: 26 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, wsRecipes, '捏捏定價與成本分析');

  // Export file
  const fileName = `捏捏手作財務與庫存報表_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
