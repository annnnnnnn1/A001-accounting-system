import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Check, BookmarkPlus, Edit3, Plus, Type } from 'lucide-react';
import { Transaction, SquishyRecipe, MaterialItem, TransactionTemplate } from '../types';

interface QuickAddModalProps {
  initialTransaction?: Transaction | null;
  recipes: SquishyRecipe[];
  materials: MaterialItem[];
  templates?: TransactionTemplate[];
  onClose: () => void;
  onSave: (tx: Transaction | Omit<Transaction, 'id'>) => void;
  onSaveTemplate?: (tpl: Omit<TransactionTemplate, 'id'>) => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'consumable', label: '🧪 一次性耗材 (AB膠/色膏/植絨粉)' },
  { value: 'tool_mold', label: '🛠️ 固定模具與工作室設備' },
  { value: 'packaging', label: '📦 包裝貼紙與小卡' },
  { value: 'shipping', label: '🚚 物流運費支出' },
  { value: 'platform', label: '💳 平台抽成與跨境費' },
  { value: 'booth', label: '🎪 市集攤位費與宣傳' },
  { value: 'other', label: '雜項支出' },
];

const INCOME_CATEGORIES = [
  { value: 'squishy_sale', label: '🐾 捏捏成品銷售' },
  { value: 'custom_order', label: '🎨 客製捏捏訂單' },
  { value: 'market_booth', label: '🛍️ 市集現場銷售' },
  { value: 'wholesale', label: '📦 批發寄賣收入' },
  { value: 'other_income', label: '其他營收' },
];

const DEFAULT_PAYMENTS = [
  '信用卡',
  '微信/支付寶',
  '街口支付',
  'LINE Pay',
  '蝦皮錢包',
  '現金',
  '銀行轉帳',
  'PayPal',
  '貨到付款'
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  initialTransaction = null,
  templates = [],
  onClose,
  onSave,
  onSaveTemplate
}) => {
  const isEditing = !!initialTransaction;

  const [type, setType] = useState<'income' | 'expense'>(initialTransaction?.type || 'expense');
  const [amount, setAmount] = useState<string>(initialTransaction?.amount ? String(initialTransaction.amount) : '');
  const [title, setTitle] = useState<string>(initialTransaction?.title || '');
  
  // Category state
  const initialCat = initialTransaction?.category || (type === 'expense' ? 'consumable' : 'squishy_sale');
  const isKnownCat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].some(c => c.value === initialCat);
  const [categoryMode, setCategoryMode] = useState<'preset' | 'custom'>(isKnownCat ? 'preset' : 'custom');
  const [selectedCategory, setSelectedCategory] = useState<string>(isKnownCat ? initialCat : (type === 'expense' ? 'consumable' : 'squishy_sale'));
  const [customCategory, setCustomCategory] = useState<string>(!isKnownCat ? initialCat : '');

  // Payment Method state
  const initialPayment = initialTransaction?.paymentMethod || '信用卡';
  const isKnownPayment = DEFAULT_PAYMENTS.includes(initialPayment);
  const [paymentMode, setPaymentMode] = useState<'preset' | 'custom'>(isKnownPayment ? 'preset' : 'custom');
  const [selectedPayment, setSelectedPayment] = useState<string>(isKnownPayment ? initialPayment : '信用卡');
  const [customPayment, setCustomPayment] = useState<string>(!isKnownPayment ? initialPayment : '');

  const [date, setDate] = useState<string>(initialTransaction?.date || new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>(initialTransaction?.note || '');
  
  const [saveAsTemplate, setSaveAsTemplate] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>('');

  const handleApplyTemplate = (tpl: TransactionTemplate) => {
    setType(tpl.type);
    setAmount(tpl.amount.toString());
    setTitle(tpl.title);
    if (tpl.note) setNote(tpl.note);

    // Apply category
    const knownCat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].some(c => c.value === tpl.category);
    if (knownCat) {
      setCategoryMode('preset');
      setSelectedCategory(tpl.category);
    } else {
      setCategoryMode('custom');
      setCustomCategory(tpl.category);
    }

    // Apply payment method
    if (tpl.paymentMethod) {
      if (DEFAULT_PAYMENTS.includes(tpl.paymentMethod)) {
        setPaymentMode('preset');
        setSelectedPayment(tpl.paymentMethod);
      } else {
        setPaymentMode('custom');
        setCustomPayment(tpl.paymentMethod);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const finalCategory = categoryMode === 'custom' 
      ? (customCategory.trim() || (type === 'expense' ? 'other' : 'other_income'))
      : selectedCategory;

    const finalPaymentMethod = paymentMode === 'custom'
      ? (customPayment.trim() || '現金')
      : selectedPayment;

    const txData = {
      ...(initialTransaction ? { id: initialTransaction.id } : {}),
      type,
      category: finalCategory,
      amount: Number(amount),
      date,
      title,
      paymentMethod: finalPaymentMethod,
      note
    };

    onSave(txData as Transaction);

    if (saveAsTemplate && onSaveTemplate && templateName.trim()) {
      onSaveTemplate({
        name: templateName.trim(),
        type,
        category: finalCategory,
        amount: Number(amount),
        paymentMethod: finalPaymentMethod,
        title,
        note
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E5E2DD] shadow-2xl animate-in slide-in-from-bottom duration-200 my-auto max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{isEditing ? '✏️' : '🐾'}</span>
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
              {isEditing ? '編輯收支紀錄' : '快速紀錄收支與範本'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C7A66] hover:text-[#1A1A1A] rounded-full hover:bg-[#F2EDE7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Income / Expense Segmented Control */}
        <div className="grid grid-cols-2 gap-2 bg-[#F2EDE7] p-1 rounded-full border border-[#E5E2DD] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              if (categoryMode === 'preset') setSelectedCategory('consumable');
            }}
            className={`py-2 rounded-full flex items-center justify-center space-x-1.5 transition-all ${
              type === 'expense'
                ? 'bg-rose-900 text-white shadow-xs'
                : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>新增支出 (-)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              if (categoryMode === 'preset') setSelectedCategory('squishy_sale');
            }}
            className={`py-2 rounded-full flex items-center justify-center space-x-1.5 transition-all ${
              type === 'income'
                ? 'bg-[#4A5D4E] text-white shadow-xs'
                : 'text-[#6D5D4E] hover:text-[#1A1A1A]'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>新增收入 (+)</span>
          </button>
        </div>

        {/* Quick Presets & Saved Templates (Only when creating) */}
        {!isEditing && templates.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7A66] block mb-1.5">
              ⚡ 常用記帳範本庫 (一鍵帶入)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {templates.filter(t => t.type === type).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleApplyTemplate(t)}
                  className="text-[11px] bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] px-3 py-1 rounded-full transition-all border border-[#E5E2DD] flex items-center gap-1 font-medium"
                >
                  <span>{t.name}</span>
                  <span className="font-mono text-[10px] opacity-70">(¥{t.amount})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1">
              交易項目描述 *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'expense' ? '例如: 淘寶進貨食品級AB矽膠 500g' : '例如: 售出萌粉貓爪捏捏 x 3'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium focus:outline-hidden focus:border-[#1A1A1A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                金額 (¥) *
              </label>
              <input
                type="number"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-base font-serif font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#1A1A1A]">
                  收支分類
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (categoryMode === 'preset') {
                      setCategoryMode('custom');
                    } else {
                      setCategoryMode('preset');
                    }
                  }}
                  className="text-[10px] text-[#4A5D4E] hover:underline font-semibold flex items-center gap-0.5"
                >
                  {categoryMode === 'preset' ? '✏️ 手動自訂' : '📋 選擇預設'}
                </button>
              </div>

              {categoryMode === 'custom' ? (
                <input
                  type="text"
                  required
                  placeholder="手動輸入分類 (例: 蝦皮廣告費)"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#4A5D4E] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium focus:outline-hidden"
                />
              ) : (
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCategoryMode('custom');
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium focus:outline-hidden"
                >
                  {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                  <option value="__custom__">✏️ 自訂分類 (手動輸入)...</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                交易日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#1A1A1A]">
                  支付/收款管道
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (paymentMode === 'preset') {
                      setPaymentMode('custom');
                    } else {
                      setPaymentMode('preset');
                    }
                  }}
                  className="text-[10px] text-[#4A5D4E] hover:underline font-semibold"
                >
                  {paymentMode === 'preset' ? '✏️ 手動自訂' : '📋 選擇預設'}
                </button>
              </div>

              {paymentMode === 'custom' ? (
                <input
                  type="text"
                  required
                  placeholder="手動輸入管道 (例: 街口 / 悠遊卡)"
                  value={customPayment}
                  onChange={(e) => setCustomPayment(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#4A5D4E] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium focus:outline-hidden"
                />
              ) : (
                <select
                  value={selectedPayment}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setPaymentMode('custom');
                    } else {
                      setSelectedPayment(e.target.value);
                    }
                  }}
                  className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium focus:outline-hidden"
                >
                  {DEFAULT_PAYMENTS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="__custom__">✏️ 自訂管道 (手動輸入)...</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1">
              備註說明 (選填)
            </label>
            <input
              type="text"
              placeholder="例如: 淘寶跨境訂單，含折價券..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A]"
            />
          </div>

          {/* Save as Template Toggle (Only when creating) */}
          {!isEditing && (
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="rounded-md border-[#E5E2DD] accent-[#1A1A1A]"
                />
                <span className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                  <BookmarkPlus className="w-3.5 h-3.5 text-[#C2B280]" />
                  <span>存為常用記帳範本 (以便下次一鍵套用)</span>
                </span>
              </label>

              {saveAsTemplate && (
                <input
                  type="text"
                  placeholder="輸入範本名稱 (例: 📦 每月常規包材進貨)"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full bg-white border border-[#E5E2DD] rounded-xl px-3 py-1.5 font-bold text-[#1A1A1A]"
                />
              )}
            </div>
          )}

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] font-semibold rounded-xl transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 font-semibold text-white rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 ${
                type === 'expense' ? 'bg-rose-900 hover:bg-rose-950' : 'bg-[#4A5D4E] hover:bg-[#3B4B3F]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? '更新記帳紀錄' : '儲存記帳紀錄'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
