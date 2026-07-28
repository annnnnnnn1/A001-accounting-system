import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { BottomTabBar } from './components/BottomTabBar';
import { Dashboard } from './components/Dashboard';
import { PricingCalculator } from './components/PricingCalculator';
import { InventoryManager } from './components/InventoryManager';
import { Ledger } from './components/Ledger';
import { AnalyticsView } from './components/AnalyticsView';
import { QuickAddModal } from './components/QuickAddModal';
import { RecipeModal } from './components/RecipeModal';
import { MaterialModal } from './components/MaterialModal';

import { MaterialItem, SquishyRecipe, Transaction, TransactionTemplate } from './types';
import { INITIAL_MATERIALS, INITIAL_RECIPES, INITIAL_TRANSACTIONS, INITIAL_TRANSACTION_TEMPLATES } from './data/initialData';
import { calculateShopSummary, recalculateRecipe } from './utils/calculations';
import { exportToExcel } from './utils/excelExport';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // Persistence Keys
  const SHOP_NAME_KEY = 'squishy_shop_name_v2';
  const MATERIALS_KEY = 'squishy_materials_v2';
  const RECIPES_KEY = 'squishy_recipes_v2';
  const TRANSACTIONS_KEY = 'squishy_tx_v2';
  const TEMPLATES_KEY = 'squishy_templates_v2';

  const [shopName, setShopName] = useState<string>(() => {
    return localStorage.getItem(SHOP_NAME_KEY) || '喵喵手作捏捏工作室';
  });

  const handleUpdateShopName = (newName: string) => {
    const trimmed = newName.trim() || '我的手作捏捏工作室';
    setShopName(trimmed);
    localStorage.setItem(SHOP_NAME_KEY, trimmed);
  };

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem(MATERIALS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [recipes, setRecipes] = useState<SquishyRecipe[]>(() => {
    const saved = localStorage.getItem(RECIPES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [templates, setTemplates] = useState<TransactionTemplate[]>(() => {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTION_TEMPLATES;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  // Modals state
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [showRecipeModal, setShowRecipeModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<SquishyRecipe | null>(null);

  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

  // Recalculate recipes whenever materials change to maintain accurate material costs
  const refreshAllRecipeCosts = (updatedMaterials: MaterialItem[]) => {
    const materialsMap = new Map<string, MaterialItem>(updatedMaterials.map(m => [m.id, m]));
    setRecipes(prevRecipes => prevRecipes.map(r => recalculateRecipe(r, materialsMap)));
  };

  // Calculations summary
  const summary = calculateShopSummary(transactions);
  const lowStockCount = materials.filter(m => m.currentStock <= m.minStockAlert).length;

  // Handlers for Transactions
  const handleOpenQuickAdd = () => {
    setEditingTransaction(null);
    setShowQuickAddModal(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setShowQuickAddModal(true);
  };

  const handleSaveTransaction = (savedTx: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in savedTx && savedTx.id) {
      setTransactions(prev => prev.map(t => t.id === savedTx.id ? (savedTx as Transaction) : t));
    } else {
      const txWithId: Transaction = {
        ...savedTx,
        id: `tx_${Date.now()}`
      };
      setTransactions(prev => [txWithId, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Handlers for Templates
  const handleSaveTemplate = (newTpl: Omit<TransactionTemplate, 'id'>) => {
    const tplWithId: TransactionTemplate = {
      ...newTpl,
      id: `tpl_${Date.now()}`
    };
    setTemplates(prev => [tplWithId, ...prev]);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Handlers for Materials
  const handleSaveMaterial = (savedMat: MaterialItem) => {
    let updated: MaterialItem[];
    if (materials.some(m => m.id === savedMat.id)) {
      updated = materials.map(m => (m.id === savedMat.id ? savedMat : m));
    } else {
      updated = [savedMat, ...materials];
    }
    setMaterials(updated);
    refreshAllRecipeCosts(updated);
  };

  const handleDeleteMaterial = (id: string) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    refreshAllRecipeCosts(updated);
  };

  const handleUpdateMaterialStock = (id: string, delta: number) => {
    const updated = materials.map(m => {
      if (m.id === id) {
        const nextStock = Math.max(0, m.currentStock + delta);
        return { ...m, currentStock: nextStock };
      }
      return m;
    });
    setMaterials(updated);
  };

  const handleRestockMaterial = (mat: MaterialItem, addedQty: number, totalPrice: number) => {
    const updatedQty = mat.currentStock + addedQty;
    const updatedPurchasePrice = mat.purchasePrice + totalPrice;
    const updatedTotalQty = mat.purchaseQuantity + addedQty;
    const costPerUnit = Number((updatedPurchasePrice / updatedTotalQty).toFixed(2));

    const updatedMat: MaterialItem = {
      ...mat,
      currentStock: updatedQty,
      purchasePrice: updatedPurchasePrice,
      purchaseQuantity: updatedTotalQty,
      costPerUnit
    };

    const nextMaterials = materials.map(m => (m.id === mat.id ? updatedMat : m));
    setMaterials(nextMaterials);
    refreshAllRecipeCosts(nextMaterials);

    handleSaveTransaction({
      type: 'expense',
      category: mat.type === 'tool_mold' ? 'tool_mold' : 'consumable',
      amount: totalPrice,
      date: new Date().toISOString().slice(0, 10),
      title: `進貨補庫: ${mat.name} +${addedQty}${mat.unit}`,
      relatedMaterialId: mat.id,
      quantity: addedQty,
      paymentMethod: '信用卡',
      note: '庫存管理自動記錄支出'
    });
  };

  // Handlers for Recipes
  const handleSaveRecipe = (savedRecipe: SquishyRecipe) => {
    if (recipes.some(r => r.id === savedRecipe.id)) {
      setRecipes(recipes.map(r => (r.id === savedRecipe.id ? savedRecipe : r)));
    } else {
      setRecipes([...recipes, savedRecipe]);
    }
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const handleUpdateRecipePrice = (id: string, newActualPrice: number, targetMargin: number) => {
    const materialsMap = new Map<string, MaterialItem>(materials.map(m => [m.id, m]));
    setRecipes(recipes.map(r => {
      if (r.id === id) {
        const updated = {
          ...r,
          actualPrice: newActualPrice,
          targetMarginPercent: targetMargin
        };
        return recalculateRecipe(updated, materialsMap);
      }
      return r;
    }));
  };

  const handleUpdateRecipeFees = (
    id: string,
    platformFee: number,
    cardFee: number,
    crossBorderFee: number,
    customAdj: number
  ) => {
    const materialsMap = new Map<string, MaterialItem>(materials.map(m => [m.id, m]));
    setRecipes(recipes.map(r => {
      if (r.id === id) {
        const updated = {
          ...r,
          platformFeePercent: platformFee,
          cardFeePercent: cardFee,
          crossBorderFeePercent: crossBorderFee,
          customFeeAdjustment: customAdj
        };
        return recalculateRecipe(updated, materialsMap);
      }
      return r;
    }));
  };

  const handleUpdateRecipeStock = (recipeId: string, delta: number) => {
    setRecipes(recipes.map(r => {
      if (r.id === recipeId) {
        return { ...r, stockQty: Math.max(0, r.stockQty + delta) };
      }
      return r;
    }));
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('確定要將系統恢復至預設捏捏數據嗎？此動作不可撤銷。')) {
      setMaterials(INITIAL_MATERIALS);
      setRecipes(INITIAL_RECIPES);
      setTransactions(INITIAL_TRANSACTIONS);
      setTemplates(INITIAL_TRANSACTION_TEMPLATES);
      localStorage.clear();
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    exportToExcel({
      shopName,
      summary,
      transactions,
      materials,
      recipes
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-[#1A1A1A] font-sans antialiased selection:bg-[#F2EDE7]">
      {/* Outer Layout Wrapper */}
      <div className={isMobileFrame ? 'max-w-md mx-auto my-0 sm:my-6 shadow-2xl rounded-none sm:rounded-[40px] border-0 sm:border-[8px] border-slate-900 bg-[#F9F8F6] overflow-hidden relative min-h-[850px]' : 'w-full bg-[#F9F8F6] min-h-screen pb-16'}>
        
        {/* Header Nav */}
        <HeaderNav
          shopName={shopName}
          onChangeShopName={handleUpdateShopName}
          lowStockCount={lowStockCount}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          onExportExcel={handleExportExcel}
          onOpenLowStock={() => setActiveTab('inventory')}
        />

        {/* Main View Container */}
        <main className="px-4 py-4 mb-16 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              summary={summary}
              materials={materials}
              transactions={transactions}
              recipes={recipes}
              onNavigateTab={setActiveTab}
              onOpenQuickAdd={handleOpenQuickAdd}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenRecipeModal={() => {
                setEditingRecipe(null);
                setShowRecipeModal(true);
              }}
              onExportExcel={handleExportExcel}
            />
          )}

          {activeTab === 'ledger' && (
            <Ledger
              transactions={transactions}
              materials={materials}
              recipes={recipes}
              templates={templates}
              onOpenQuickAdd={handleOpenQuickAdd}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onDeleteTemplate={handleDeleteTemplate}
              onApplyTemplate={(tpl) => {
                handleSaveTransaction({
                  type: tpl.type,
                  category: tpl.category,
                  amount: tpl.amount,
                  date: new Date().toISOString().slice(0, 10),
                  title: tpl.title,
                  paymentMethod: tpl.paymentMethod,
                  note: tpl.note
                });
              }}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingCalculator
              recipes={recipes}
              materials={materials}
              onAddRecipe={() => {
                setEditingRecipe(null);
                setShowRecipeModal(true);
              }}
              onEditRecipe={(recipe) => {
                setEditingRecipe(recipe);
                setShowRecipeModal(true);
              }}
              onDeleteRecipe={handleDeleteRecipe}
              onUpdateRecipePrice={handleUpdateRecipePrice}
              onUpdateRecipeFees={handleUpdateRecipeFees}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              materials={materials}
              recipes={recipes}
              onAddMaterial={() => {
                setEditingMaterial(null);
                setShowMaterialModal(true);
              }}
              onEditMaterial={(mat) => {
                setEditingMaterial(mat);
                setShowMaterialModal(true);
              }}
              onDeleteMaterial={handleDeleteMaterial}
              onUpdateStock={handleUpdateMaterialStock}
              onRestockMaterial={handleRestockMaterial}
              onUpdateRecipeStock={handleUpdateRecipeStock}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              summary={summary}
              recipes={recipes}
              transactions={transactions}
              materials={materials}
              onExportExcel={handleExportExcel}
            />
          )}

          {/* Reset Demo Data */}
          <div className="pt-6 pb-4 text-center">
            <button
              onClick={handleResetData}
              className="text-[11px] text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 transition-colors font-mono"
            >
              <RotateCcw className="w-3 h-3" />
              <span>恢復系統預設範例數據</span>
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          onOpenQuickAdd={handleOpenQuickAdd}
        />
      </div>

      {/* Modals */}
      {showQuickAddModal && (
        <QuickAddModal
          initialTransaction={editingTransaction}
          recipes={recipes}
          materials={materials}
          templates={templates}
          onClose={() => {
            setShowQuickAddModal(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          onSaveTemplate={handleSaveTemplate}
        />
      )}

      {showRecipeModal && (
        <RecipeModal
          initialRecipe={editingRecipe}
          materials={materials}
          onClose={() => {
            setShowRecipeModal(false);
            setEditingRecipe(null);
          }}
          onSave={handleSaveRecipe}
        />
      )}

      {showMaterialModal && (
        <MaterialModal
          initialMaterial={editingMaterial}
          onClose={() => {
            setShowMaterialModal(false);
            setEditingMaterial(null);
          }}
          onSave={handleSaveMaterial}
        />
      )}
    </div>
  );
}
