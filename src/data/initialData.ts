import { MaterialItem, SquishyRecipe, Transaction, TransactionTemplate } from '../types';

export const INITIAL_MATERIALS: MaterialItem[] = [
  {
    id: 'mat_1',
    name: 'AB高透明軟矽膠 (食品級超軟)',
    type: 'consumable',
    unit: 'g',
    purchasePrice: 320,
    purchaseQuantity: 500,
    costPerUnit: 0.64,
    costPerGram: 0.64,
    currentStock: 350,
    minStockAlert: 100,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://item.taobao.com/item.htm?id=60000000000',
    note: '主要捏捏原液，按重量比例1:1混合 (淘寶旗艦店進貨)'
  },
  {
    id: 'mat_2',
    name: '馬卡龍專用色膏/調色精 (10色套裝)',
    type: 'consumable',
    unit: 'g',
    purchasePrice: 180,
    purchaseQuantity: 100,
    costPerUnit: 1.8,
    costPerGram: 1.8,
    currentStock: 75,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://detail.1688.com/offer/60000000001.html',
    note: '1688批發店家進貨，色彩飽和度高'
  },
  {
    id: 'mat_3',
    name: '高超柔絨感植絨粉 (粉白黃)',
    type: 'consumable',
    unit: 'g',
    purchasePrice: 120,
    purchaseQuantity: 50,
    costPerUnit: 2.4,
    costPerGram: 2.4,
    currentStock: 32,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://item.taobao.com/item.htm?id=60000000002',
    note: '外表防黏與增加柔軟手感'
  },
  {
    id: 'mat_4',
    name: '高透防黏自封袋/OPP袋',
    type: 'packaging',
    unit: '個',
    purchasePrice: 80,
    purchaseQuantity: 100,
    costPerUnit: 0.8,
    currentStock: 65,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://shopee.tw/search?keyword=OPP%E8%87%AA%E5%B0%81%E8%A2%8B',
    note: '成品獨立包裝袋'
  },
  {
    id: 'mat_5',
    name: '品牌感謝小卡與圓形密封貼紙',
    type: 'packaging',
    unit: '套',
    purchasePrice: 150,
    purchaseQuantity: 50,
    costPerUnit: 3.0,
    currentStock: 38,
    minStockAlert: 10,
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://detail.1688.com/offer/60000000003.html',
    note: '出貨裝飾加分耗材'
  },
  {
    id: 'mat_6',
    name: '貓爪立體矽膠模具 (高透鏡面)',
    type: 'tool_mold',
    unit: '個',
    purchasePrice: 180,
    purchaseQuantity: 1,
    costPerUnit: 180,
    currentStock: 1,
    minStockAlert: 1,
    estimatedLifespanUses: 60,
    amortizedCostPerUse: 3.0,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://item.taobao.com/item.htm?id=60000000004',
    note: '預估可翻模使用 60 次'
  },
  {
    id: 'mat_7',
    name: '吐司厚切造型矽膠模具',
    type: 'tool_mold',
    unit: '個',
    purchasePrice: 220,
    purchaseQuantity: 1,
    costPerUnit: 220,
    currentStock: 1,
    minStockAlert: 1,
    estimatedLifespanUses: 50,
    amortizedCostPerUse: 4.4,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
    restockUrl: 'https://item.taobao.com/item.htm?id=60000000005',
    note: '預估可翻模使用 50 次'
  }
];

export const INITIAL_RECIPES: SquishyRecipe[] = [
  {
    id: 'recipe_1',
    name: '萌粉肉墊貓爪捏捏 (超軟慢回彈)',
    category: '貓爪系列',
    imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400&auto=format&fit=crop&q=80',
    ingredients: [
      { materialId: 'mat_1', materialName: 'AB高透明軟矽膠', amountUsed: 60, amountInGrams: 60, calculatedCost: 38.4 },
      { materialId: 'mat_2', materialName: '馬卡龍專用色膏', amountUsed: 1, amountInGrams: 1, calculatedCost: 1.8 },
      { materialId: 'mat_3', materialName: '高超柔絨感植絨粉', amountUsed: 1, amountInGrams: 1, calculatedCost: 2.4 }
    ],
    moldId: 'mat_6',
    moldAmortizedCost: 3.0,
    packagingIngredients: [
      { materialId: 'mat_4', materialName: '高透防黏自封袋', amountUsed: 1, calculatedCost: 0.8 },
      { materialId: 'mat_5', materialName: '感謝小卡與貼紙', amountUsed: 1, calculatedCost: 3.0 }
    ],
    laborMinutes: 15,
    targetHourlyWage: 200,
    laborCost: 50,
    totalConsumableCost: 42.6,
    totalPackagingCost: 3.8,
    totalDirectCost: 49.4,
    totalTrueCost: 99.4,
    suggestedPrice: 180,
    actualPrice: 180,
    targetMarginPercent: 50,
    platformFeePercent: 3.0, // 淘寶/小紅書/拼多多
    cardFeePercent: 1.5, // 跨境刷卡手續費
    crossBorderFeePercent: 0,
    customFeeAdjustment: 0,
    gramWeight: 62,
    stockQty: 8,
    tags: ['熱銷爆款', '超軟彈', '粉嫩手感'],
    imageEmoji: '🐾'
  },
  {
    id: 'recipe_2',
    name: '焦糖香草厚切吐司捏捏',
    category: '甜點系列',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    ingredients: [
      { materialId: 'mat_1', materialName: 'AB高透明軟矽膠', amountUsed: 85, amountInGrams: 85, calculatedCost: 54.4 },
      { materialId: 'mat_2', materialName: '馬卡龍專用色膏', amountUsed: 2, amountInGrams: 2, calculatedCost: 3.6 }
    ],
    moldId: 'mat_7',
    moldAmortizedCost: 4.4,
    packagingIngredients: [
      { materialId: 'mat_4', materialName: '高透防黏自封袋', amountUsed: 1, calculatedCost: 0.8 },
      { materialId: 'mat_5', materialName: '感謝小卡與貼紙', amountUsed: 1, calculatedCost: 3.0 }
    ],
    laborMinutes: 20,
    targetHourlyWage: 200,
    laborCost: 66.7,
    totalConsumableCost: 58.0,
    totalPackagingCost: 3.8,
    totalDirectCost: 66.2,
    totalTrueCost: 132.9,
    suggestedPrice: 220,
    actualPrice: 220,
    targetMarginPercent: 50,
    platformFeePercent: 7.5, // 蝦皮購物
    cardFeePercent: 1.5,
    crossBorderFeePercent: 0,
    customFeeAdjustment: 0,
    gramWeight: 87,
    stockQty: 5,
    tags: ['療癒慢回彈', '仿真甜點', '高時薪'],
    imageEmoji: '🍞'
  }
];

export const INITIAL_TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  {
    id: 'tpl_1',
    name: '📦 每月常規包材進貨',
    type: 'expense',
    category: 'packaging',
    amount: 230,
    paymentMethod: '信用卡',
    title: '採購自封袋與品牌貼紙小卡',
    note: '每月常規進貨補充包材'
  },
  {
    id: 'tpl_2',
    name: '🧪 淘寶AB原液/矽膠進貨',
    type: 'expense',
    category: 'consumable',
    amount: 320,
    paymentMethod: '淘寶/微信',
    title: '購買食品級超軟AB矽膠原液 500g',
    note: '淘寶跨境進貨，含海外手續費'
  },
  {
    id: 'tpl_3',
    name: '🎪 週末市集現場銷售套組',
    type: 'income',
    category: 'market_booth',
    amount: 1500,
    paymentMethod: '現金',
    title: '文創市集現場銷售一批',
    note: '現金與現場轉帳收入'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'expense',
    category: 'consumable',
    amount: 320,
    date: '2026-07-05',
    title: '購買食品級AB軟矽膠 500g',
    relatedMaterialId: 'mat_1',
    quantity: 500,
    paymentMethod: '信用卡',
    note: '淘寶進貨補充耗材，含跨境刷卡手續費'
  },
  {
    id: 'tx_2',
    type: 'expense',
    category: 'tool_mold',
    amount: 180,
    date: '2026-07-06',
    title: '購買貓爪立體矽膠模具',
    relatedMaterialId: 'mat_6',
    quantity: 1,
    paymentMethod: '微信/支付寶',
    note: '耐用耐久模具，攤銷成本算入個體捏捏'
  },
  {
    id: 'tx_5',
    type: 'income',
    category: 'squishy_sale',
    amount: 540,
    date: '2026-07-15',
    title: '售出萌粉貓爪捏捏 x 3個',
    relatedRecipeId: 'recipe_1',
    quantity: 3,
    paymentMethod: '街口支付',
    note: '買家好評回購'
  }
];
