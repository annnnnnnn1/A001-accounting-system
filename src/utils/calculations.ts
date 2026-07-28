import { MaterialItem, SquishyRecipe, Transaction, ShopSummary } from '../types';

/**
 * 計算零售建議售價 (考量平台手續費 + 海外/跨境信用卡費 + 手動微調 + 目標毛利率)
 * 公式: 售價 = (真實成本 + 手動調整) / (1 - 目標毛利率% - 平台手續費% - 信用卡費% - 跨境費%)
 */
export function calculateSuggestedPrice(
  trueCost: number,
  targetMarginPercent: number = 50,
  platformFeePercent: number = 5,
  cardFeePercent: number = 1.5,
  crossBorderFeePercent: number = 0,
  customFeeAdjustment: number = 0
): number {
  const marginRatio = targetMarginPercent / 100;
  const totalFeePercent = platformFeePercent + cardFeePercent + crossBorderFeePercent;
  const feeRatio = totalFeePercent / 100;
  
  const divisor = 1 - marginRatio - feeRatio;
  
  if (divisor <= 0.1) {
    // 防呆處理
    return Math.ceil((trueCost + customFeeAdjustment) * 2.5);
  }
  
  const rawPrice = (trueCost + customFeeAdjustment) / divisor;
  // 進位至整數
  return Math.ceil(rawPrice);
}

/**
 * 計算單個捏捏商品的淨利潤與預估扣費明細
 */
export function calculateRecipeProfitMetrics(
  recipe: SquishyRecipe,
  overridePrice?: number
) {
  const price = overridePrice !== undefined ? overridePrice : recipe.actualPrice;
  const trueCost = recipe.totalTrueCost;
  
  const platformFee = Math.round(price * (recipe.platformFeePercent / 100));
  const cardFee = Math.round(price * ((recipe.cardFeePercent || 0) / 100));
  const crossBorderFee = Math.round(price * ((recipe.crossBorderFeePercent || 0) / 100));
  const customAdj = recipe.customFeeAdjustment || 0;
  
  const totalFees = platformFee + cardFee + crossBorderFee + customAdj;
  const netProfit = Math.round(price - trueCost - totalFees);
  const netMarginPercent = price > 0 ? Number(((netProfit / price) * 100).toFixed(1)) : 0;
  
  const hourlyRateYield = recipe.laborMinutes > 0
    ? Math.round(((netProfit + recipe.laborCost) / (recipe.laborMinutes / 60)))
    : 0;

  return {
    price,
    trueCost,
    platformFee,
    cardFee,
    crossBorderFee,
    customAdj,
    totalFees,
    netProfit,
    netMarginPercent,
    hourlyRateYield
  };
}

/**
 * 依據材料現有單價（克單價元/g），即時試算/更新捏捏配方的各項克數成本分攤
 */
export function recalculateRecipe(
  recipe: SquishyRecipe,
  materialsMap: Map<string, MaterialItem>
): SquishyRecipe {
  // 1. 克數精算耗材成本
  let totalConsumableCost = 0;
  let totalGramWeight = 0;

  const updatedIngredients = recipe.ingredients.map(ing => {
    const mat = materialsMap.get(ing.materialId);
    // 單位取得成本 (元/g 或 元/個)
    const costPerUnit = mat ? mat.costPerUnit : 0;
    const amountUsed = ing.amountUsed || 0;
    const calculatedCost = Number((amountUsed * costPerUnit).toFixed(2));
    
    totalConsumableCost += calculatedCost;
    if (mat?.unit === 'g') {
      totalGramWeight += amountUsed;
    }
    
    return {
      ...ing,
      materialName: mat ? mat.name : ing.materialName,
      amountInGrams: mat?.unit === 'g' ? amountUsed : ing.amountInGrams,
      calculatedCost
    };
  });

  // 2. 模具分攤成本
  let moldAmortizedCost = recipe.moldAmortizedCost;
  if (recipe.moldId) {
    const moldMat = materialsMap.get(recipe.moldId);
    if (moldMat && moldMat.amortizedCostPerUse) {
      moldAmortizedCost = moldMat.amortizedCostPerUse;
    }
  }

  // 3. 包裝成本
  let totalPackagingCost = 0;
  const updatedPackaging = recipe.packagingIngredients.map(ing => {
    const mat = materialsMap.get(ing.materialId);
    const costPerUnit = mat ? mat.costPerUnit : 0;
    const calculatedCost = Number((ing.amountUsed * costPerUnit).toFixed(2));
    totalPackagingCost += calculatedCost;
    return {
      ...ing,
      materialName: mat ? mat.name : ing.materialName,
      calculatedCost
    };
  });

  // 4. 人工工時成本
  const laborCost = Number(((recipe.laborMinutes / 60) * recipe.targetHourlyWage).toFixed(1));

  // 5. 總直接成本 & 總真實成本
  const totalDirectCost = Number((totalConsumableCost + moldAmortizedCost + totalPackagingCost).toFixed(1));
  const totalTrueCost = Number((totalDirectCost + laborCost).toFixed(1));

  // 6. 建議售價 (含跨境卡費與手動微調)
  const suggestedPrice = calculateSuggestedPrice(
    totalTrueCost,
    recipe.targetMarginPercent,
    recipe.platformFeePercent,
    recipe.cardFeePercent || 1.5,
    recipe.crossBorderFeePercent || 0,
    recipe.customFeeAdjustment || 0
  );

  return {
    ...recipe,
    ingredients: updatedIngredients,
    packagingIngredients: updatedPackaging,
    moldAmortizedCost,
    laborCost,
    gramWeight: totalGramWeight > 0 ? totalGramWeight : recipe.gramWeight,
    totalConsumableCost: Number(totalConsumableCost.toFixed(1)),
    totalPackagingCost: Number(totalPackagingCost.toFixed(1)),
    totalDirectCost,
    totalTrueCost,
    suggestedPrice
  };
}

/**
 * 依據交易紀錄計算店鋪整體財務數據
 */
export function calculateShopSummary(transactions: Transaction[]): ShopSummary {
  let totalIncome = 0;
  let totalExpense = 0;
  let consumableExpense = 0;
  let toolExpense = 0;
  let packagingExpense = 0;
  let otherExpense = 0;

  transactions.forEach(tx => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpense += tx.amount;
      if (tx.category === 'consumable') consumableExpense += tx.amount;
      else if (tx.category === 'tool_mold') toolExpense += tx.amount;
      else if (tx.category === 'packaging') packagingExpense += tx.amount;
      else otherExpense += tx.amount;
    }
  });

  const netProfit = totalIncome - totalExpense;
  const grossMarginRate = totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(1)) : 0;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    grossMarginRate,
    consumableExpense,
    toolExpense,
    packagingExpense,
    otherExpense
  };
}

/**
 * 分類名稱轉換標籤
 */
export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    consumable: '🧪 一次性耗材 (AB膠/色膏/植絨粉)',
    tool_mold: '🛠️ 固定模具/工作室設備',
    packaging: '📦 包裝與禮物盒資材',
    shipping: '🚚 物流運費支出',
    platform: '💳 平台與跨境手續費',
    booth: '🎪 市集攤位與宣傳費',
    other: '雜項支出',
    squishy_sale: '🐾 捏捏成品銷售',
    custom_order: '🎨 客製捏捏訂單',
    market_booth: '🛍️ 市集現場銷售',
    wholesale: '📦 批發寄賣收入',
    other_income: '其他營收'
  };
  return map[category] || category;
}
