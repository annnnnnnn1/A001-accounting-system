export type ExpenseCategory = 
  | 'consumable'   // 一次性耗材 (AB膠/色膏/植絨粉/手套/攪拌棒)
  | 'tool_mold'    // 固定資產/模具 (矽膠模具/消泡機/電子秤)
  | 'packaging'    // 包裝材料 (自封袋/貼紙/感謝卡/飛機盒)
  | 'shipping'     // 物流運費
  | 'platform'     // 平台手續費/抽成
  | 'booth'        // 市集攤位費/宣傳
  | 'other'        // 其他雜項
  | string;        // 支援自訂分類

export type IncomeCategory =
  | 'squishy_sale'  // 捏捏成品銷售
  | 'custom_order'  // 客製化捏捏訂單
  | 'market_booth'  // 線下市集銷售
  | 'wholesale'     // 批發/寄賣
  | 'other_income'  // 其他收入
  | string;         // 支援自訂分類

export type MaterialType = 'consumable' | 'tool_mold' | 'packaging';

export interface MaterialItem {
  id: string;
  name: string;
  type: MaterialType;
  unit: string; // e.g., 'g', 'ml', '個', '組', '卷'
  purchasePrice: number; // 購買總價 (元)
  purchaseQuantity: number; // 購買總克數/總量
  costPerUnit: number; // 單位成本 = purchasePrice / purchaseQuantity (元/g 或 元/個)
  costPerGram?: number; // 精算克單價 (元/g)
  currentStock: number; // 當前庫存量
  minStockAlert: number; // 低庫存預警警戒線
  imageUrl?: string; // 圖片連結/Base64
  restockUrl?: string; // 1一鍵補貨外連 (如淘寶/1688/蝦皮)
  note?: string;
  // For tool_mold amortizations:
  estimatedLifespanUses?: number; // 預估可使用次數 (例如模具預估做50個捏捏)
  amortizedCostPerUse?: number; // 每次使用分攤成本 = purchasePrice / estimatedLifespanUses
}

export interface SquishyIngredient {
  materialId: string;
  materialName: string;
  amountUsed: number; // 使用數量/克數 (例如 60g, 1個)
  amountInGrams?: number; // 精算使用克數 (g)
  calculatedCost: number; // 計算出成本 = amountUsed * costPerUnit
}

export interface SquishyRecipe {
  id: string;
  name: string; // 商品名稱 (例如: 貓爪超軟捏捏)
  category: string; // 分類 (如: 軟彈系, 慢回彈, 植絨款, 水感捏捏)
  imageUrl?: string; // 商品圖片 (支援本地上傳/圖床)
  ingredients: SquishyIngredient[]; // 耗材組成 (含克數精算)
  moldId?: string; // 使用的主模具
  moldAmortizedCost: number; // 模具分攤金額
  packagingIngredients: SquishyIngredient[]; // 包裝材料組成
  laborMinutes: number; // 製作耗時 (分鐘)
  targetHourlyWage: number; // 設定目標工時時薪 (例如 200元/小時)
  laborCost: number; // 計算人工成本 = (laborMinutes/60) * targetHourlyWage
  totalConsumableCost: number; // 總直接耗材成本
  totalPackagingCost: number; // 總包裝成本
  totalDirectCost: number; // 總直接成本 (耗材+模具+包裝)
  totalTrueCost: number; // 總真實成本 (含人工)
  suggestedPrice: number; // 建議售價
  actualPrice: number; // 實際設定售價
  targetMarginPercent: number; // 目標毛利率 (例如 50%)
  platformFeePercent: number; // 預估平台抽成 (例如 淘寶3%/蝦皮7.5%)
  cardFeePercent?: number; // 海外信用卡/跨境刷卡手續費 % (例如 1.5%)
  crossBorderFeePercent?: number; // 跨境綜合手續費 %
  customFeeAdjustment?: number; // 手動費用微調/折扣金額 (元)
  gramWeight?: number; // 捏捏作品總重量 (g)
  stockQty: number; // 目前成品庫存個數
  tags: string[]; // 標籤
  imageEmoji: string; // 捏捏圖示或可愛Emoji
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  title: string; // 描述
  relatedRecipeId?: string;
  relatedMaterialId?: string;
  quantity?: number;
  paymentMethod?: string; // 自訂支付管道: 現金/LINE Pay/微信/街口/信用卡/淘寶
  note?: string;
  imageUrl?: string; // 發票或交易明細圖片
  isTemplate?: boolean; // 是否為常用範本
}

export interface TransactionTemplate {
  id: string;
  name: string; // 範本名稱 (例: 月度包材進貨)
  type: 'income' | 'expense';
  category: string;
  amount: number;
  paymentMethod?: string;
  title: string;
  note?: string;
}

export interface ShopSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  grossMarginRate: number;
  consumableExpense: number;
  toolExpense: number;
  packagingExpense: number;
  otherExpense: number;
}
