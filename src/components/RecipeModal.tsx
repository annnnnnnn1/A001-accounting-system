import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Calculator, Bot, Upload, Image as ImageIcon } from 'lucide-react';
import { SquishyRecipe, MaterialItem, SquishyIngredient } from '../types';
import { recalculateRecipe } from '../utils/calculations';

interface RecipeModalProps {
  initialRecipe?: SquishyRecipe | null;
  materials: MaterialItem[];
  onClose: () => void;
  onSave: (recipe: SquishyRecipe) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  initialRecipe,
  materials,
  onClose,
  onSave
}) => {
  const materialsMap = new Map<string, MaterialItem>(materials.map(m => [m.id, m]));

  const [name, setName] = useState(initialRecipe?.name || '');
  const [category, setCategory] = useState(initialRecipe?.category || '貓爪系列');
  const [imageUrl, setImageUrl] = useState(initialRecipe?.imageUrl || '');
  const [imageEmoji, setImageEmoji] = useState(initialRecipe?.imageEmoji || '🐾');
  const [moldId, setMoldId] = useState(initialRecipe?.moldId || '');
  const [laborMinutes, setLaborMinutes] = useState(initialRecipe?.laborMinutes || 15);
  const [targetHourlyWage, setTargetHourlyWage] = useState(initialRecipe?.targetHourlyWage || 200);
  const [targetMarginPercent, setTargetMarginPercent] = useState(initialRecipe?.targetMarginPercent || 50);
  
  // Cross-Border & Platform Fee States (Dual-track with AI + Manual override)
  const [platformFeePercent, setPlatformFeePercent] = useState(initialRecipe?.platformFeePercent || 3.0);
  const [cardFeePercent, setCardFeePercent] = useState(initialRecipe?.cardFeePercent || 1.5);
  const [crossBorderFeePercent, setCrossBorderFeePercent] = useState(initialRecipe?.crossBorderFeePercent || 0);
  const [customFeeAdjustment, setCustomFeeAdjustment] = useState(initialRecipe?.customFeeAdjustment || 0);
  const [actualPrice, setActualPrice] = useState(initialRecipe?.actualPrice || 180);
  const [stockQty] = useState(initialRecipe?.stockQty || 5);
  const [tagsInput] = useState(initialRecipe ? initialRecipe.tags.join(', ') : '熱銷款, 慢回彈');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Consumable ingredients
  const [ingredients, setIngredients] = useState<SquishyIngredient[]>(
    initialRecipe?.ingredients || [
      {
        materialId: materials.find(m => m.type === 'consumable')?.id || '',
        materialName: materials.find(m => m.type === 'consumable')?.name || '',
        amountUsed: 60,
        calculatedCost: 38.4
      }
    ]
  );

  // Packaging ingredients
  const [packagingIngredients, setPackagingIngredients] = useState<SquishyIngredient[]>(
    initialRecipe?.packagingIngredients || [
      {
        materialId: materials.find(m => m.type === 'packaging')?.id || '',
        materialName: materials.find(m => m.type === 'packaging')?.name || '',
        amountUsed: 1,
        calculatedCost: 0.8
      }
    ]
  );

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draft recalculation
  const moldMat = moldId ? materialsMap.get(moldId) : null;
  const moldAmortizedCost = moldMat ? (moldMat.amortizedCostPerUse || moldMat.costPerUnit) : 0;

  const draftRecipe: SquishyRecipe = {
    id: initialRecipe?.id || 'temp',
    name: name || '未命名捏捏',
    category,
    imageUrl,
    ingredients,
    moldId,
    moldAmortizedCost,
    packagingIngredients,
    laborMinutes,
    targetHourlyWage,
    laborCost: (laborMinutes / 60) * targetHourlyWage,
    totalConsumableCost: 0,
    totalPackagingCost: 0,
    totalDirectCost: 0,
    totalTrueCost: 0,
    suggestedPrice: 0,
    actualPrice,
    targetMarginPercent,
    platformFeePercent,
    cardFeePercent,
    crossBorderFeePercent,
    customFeeAdjustment,
    stockQty,
    tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean),
    imageEmoji
  };

  const calculatedDraft = recalculateRecipe(draftRecipe, materialsMap);

  // AI Fee Engine Query handler
  const handleQueryAiFees = async (platformName: string) => {
    setAiLoading(true);
    setAiNote(null);
    try {
      const res = await fetch('/api/ai-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          cardType: '海外信用卡',
          recipeName: name,
          trueCost: calculatedDraft.totalTrueCost
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlatformFeePercent(data.platformFeePercent ?? 3.0);
        setCardFeePercent(data.cardFeePercent ?? 1.5);
        setCrossBorderFeePercent(data.crossBorderFeePercent ?? 0);
        setAiNote(data.reasoning || '已為您自動帶入最新市場手續費率。');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddIngredient = () => {
    const firstMat = materials.find(m => m.type === 'consumable');
    if (!firstMat) return;
    setIngredients([
      ...ingredients,
      {
        materialId: firstMat.id,
        materialName: firstMat.name,
        amountUsed: 10,
        calculatedCost: firstMat.costPerUnit * 10
      }
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddPackaging = () => {
    const firstPkg = materials.find(m => m.type === 'packaging');
    if (!firstPkg) return;
    setPackagingIngredients([
      ...packagingIngredients,
      {
        materialId: firstPkg.id,
        materialName: firstPkg.name,
        amountUsed: 1,
        calculatedCost: firstPkg.costPerUnit
      }
    ]);
  };

  const handleRemovePackaging = (index: number) => {
    setPackagingIngredients(packagingIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const finalRecipe: SquishyRecipe = {
      ...calculatedDraft,
      id: initialRecipe?.id || `recipe_${Date.now()}`,
      actualPrice: actualPrice || calculatedDraft.suggestedPrice
    };

    onSave(finalRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-[#E5E2DD] shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-[#C2B280]" />
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
              {initialRecipe ? '編輯捏捏定價與跨境成本' : '新增捏捏商品與克數定價配方'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8C7A66] hover:text-[#1A1A1A] rounded-full hover:bg-[#F2EDE7] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Product Image & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-2">
              <label className="font-semibold text-[#1A1A1A] block">
                捏捏商品名稱 *
              </label>
              <input
                type="text"
                required
                placeholder="例如: 萌粉肉墊貓爪捏捏"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-bold focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A1A1A] block">
                系列分類
              </label>
              <input
                type="text"
                placeholder="例: 貓爪系列"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Image & Emoji Picker */}
          <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3 space-y-2">
            <label className="font-semibold text-[#1A1A1A] block">
              商品圖片/圖示 (支援圖片上傳與Emoji)
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-xl bg-white border border-[#E5E2DD] overflow-hidden flex items-center justify-center shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{imageEmoji}</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="圖片網址..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white border border-[#E5E2DD] rounded-lg px-2.5 py-1 text-[#1A1A1A]"
                />
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 bg-[#F2EDE7] text-[#1A1A1A] font-semibold px-2.5 py-1 rounded-lg cursor-pointer">
                    <Upload className="w-3 h-3 text-[#C2B280]" />
                    <span>上傳照片</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                  </label>
                  <div className="flex space-x-1">
                    {['🐾', '🍞', '🧸', '🍡', '🐱', '🎀'].map(e => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setImageEmoji(e)}
                        className={`w-6 h-6 rounded-md text-xs flex items-center justify-center ${
                          imageEmoji === e ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E5E2DD]'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consumables Section (g-Based Costing) */}
          <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A1A1A]">🧪 1. 直接一次性耗材 (克數精算: AB膠/色膏/植絨粉)</span>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-[10px] bg-[#1A1A1A] text-white px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 uppercase tracking-wider"
              >
                <Plus className="w-3 h-3 text-[#C2B280]" /> 新增耗材
              </button>
            </div>

            {ingredients.map((ing, idx) => {
              const mat = materialsMap.get(ing.materialId);
              return (
                <div key={idx} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
                  <select
                    value={ing.materialId}
                    onChange={(e) => {
                      const selected = materialsMap.get(e.target.value);
                      const newArr = [...ingredients];
                      newArr[idx] = {
                        materialId: e.target.value,
                        materialName: selected?.name || '',
                        amountUsed: newArr[idx].amountUsed || 1,
                        calculatedCost: (selected?.costPerUnit || 0) * (newArr[idx].amountUsed || 1)
                      };
                      setIngredients(newArr);
                    }}
                    className="flex-1 bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg p-1.5 text-[11px] text-[#1A1A1A]"
                  >
                    {materials.filter(m => m.type === 'consumable').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (¥{m.costPerUnit}/{m.unit})
                      </option>
                    ))}
                  </select>

                  <div className="w-24 flex items-center space-x-1">
                    <input
                      type="number"
                      value={ing.amountUsed}
                      onChange={(e) => {
                        const newArr = [...ingredients];
                        newArr[idx].amountUsed = Number(e.target.value) || 0;
                        setIngredients(newArr);
                      }}
                      className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg p-1.5 text-center font-bold text-[#1A1A1A]"
                    />
                    <span className="text-[10px] text-[#8C7A66]">
                      {mat?.unit || 'g'}
                    </span>
                  </div>

                  <span className="text-xs font-serif font-bold text-[#4A5D4E] w-14 text-right">
                    ¥{(ing.amountUsed * (mat?.costPerUnit || 0)).toFixed(1)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Mold Selection */}
          <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 space-y-2">
            <span className="font-bold text-[#1A1A1A] block">🛠️ 2. 耐久模具選擇 (自動分攤折舊成本)</span>
            <select
              value={moldId}
              onChange={(e) => setMoldId(e.target.value)}
              className="w-full bg-white border border-[#E5E2DD] rounded-xl p-2.5 text-[#1A1A1A]"
            >
              <option value="">-- 無使用模具 (全手捏) --</option>
              {materials.filter(m => m.type === 'tool_mold').map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (單次分攤折舊: ¥{m.amortizedCostPerUse || m.costPerUnit})
                </option>
              ))}
            </select>
          </div>

          {/* Packaging Section */}
          <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A1A1A]">📦 3. 包裝資材 (袋子/貼紙/小卡)</span>
              <button
                type="button"
                onClick={handleAddPackaging}
                className="text-[10px] bg-[#1A1A1A] text-white px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 uppercase tracking-wider"
              >
                <Plus className="w-3 h-3 text-[#C2B280]" /> 新增包裝
              </button>
            </div>

            {packagingIngredients.map((ing, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-[#E5E2DD]">
                <select
                  value={ing.materialId}
                  onChange={(e) => {
                    const selected = materialsMap.get(e.target.value);
                    const newArr = [...packagingIngredients];
                    newArr[idx] = {
                      materialId: e.target.value,
                      materialName: selected?.name || '',
                      amountUsed: newArr[idx].amountUsed || 1,
                      calculatedCost: (selected?.costPerUnit || 0) * (newArr[idx].amountUsed || 1)
                    };
                    setPackagingIngredients(newArr);
                  }}
                  className="flex-1 bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg p-1.5 text-[11px] text-[#1A1A1A]"
                >
                  {materials.filter(m => m.type === 'packaging').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} (¥{m.costPerUnit}/{m.unit})
                    </option>
                  ))}
                </select>

                <div className="w-20 flex items-center space-x-1">
                  <input
                    type="number"
                    value={ing.amountUsed}
                    onChange={(e) => {
                      const newArr = [...packagingIngredients];
                      newArr[idx].amountUsed = Number(e.target.value) || 0;
                      setPackagingIngredients(newArr);
                    }}
                    className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-lg p-1.5 text-center font-bold text-[#1A1A1A]"
                  />
                  <span className="text-[10px] text-[#8C7A66]">個</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePackaging(idx)}
                  className="text-gray-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* AI Fee Engine & Fee Controls */}
          <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#C2B280]" />
                <span>🤖 跨境與平台手續費 (AI 智能帶入 + 手動覆蓋)</span>
              </span>
              <div className="flex space-x-1">
                {['淘寶/1688', '蝦皮購物', 'Pinkoi'].map(plat => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handleQueryAiFees(plat)}
                    disabled={aiLoading}
                    className="text-[10px] bg-white border border-[#E5E2DD] hover:bg-[#F2EDE7] px-2 py-0.5 rounded-lg font-semibold transition-all"
                  >
                    AI 試算 {plat}
                  </button>
                ))}
              </div>
            </div>

            {aiNote && (
              <p className="text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl">
                💡 AI 建議：{aiNote}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-[#8C7A66] block mb-1">
                  平台抽成 %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E5E2DD] rounded-xl px-2 py-1.5 text-center font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#8C7A66] block mb-1">
                  海外刷卡 %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={cardFeePercent}
                  onChange={(e) => setCardFeePercent(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E5E2DD] rounded-xl px-2 py-1.5 text-center font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#8C7A66] block mb-1">
                  跨境費 %
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={crossBorderFeePercent}
                  onChange={(e) => setCrossBorderFeePercent(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E5E2DD] rounded-xl px-2 py-1.5 text-center font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#8C7A66] block mb-1">
                  手動補貼/折扣 (元)
                </label>
                <input
                  type="number"
                  value={customFeeAdjustment}
                  onChange={(e) => setCustomFeeAdjustment(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-[#E5E2DD] rounded-xl px-2 py-1.5 text-center font-bold text-[#4A5D4E]"
                />
              </div>
            </div>
          </div>

          {/* Labor Time & Target Wage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                製作與包裝耗時 (分鐘)
              </label>
              <input
                type="number"
                value={laborMinutes}
                onChange={(e) => setLaborMinutes(Number(e.target.value) || 0)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 font-bold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                目標工時時薪 (¥/hr)
              </label>
              <input
                type="number"
                value={targetHourlyWage}
                onChange={(e) => setTargetHourlyWage(Number(e.target.value) || 0)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 font-bold text-[#4A5D4E]"
              />
            </div>
          </div>

          {/* Live Preview Outcome Card */}
          <div className="bg-[#1A1A1A] text-white p-5 rounded-2xl flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[10px] text-white/50 uppercase tracking-widest block">真實總成本</span>
              <span className="text-xl font-serif font-bold text-[#C2B280]">¥{calculatedDraft.totalTrueCost}</span>
            </div>

            <div>
              <span className="text-[10px] text-white/50 uppercase tracking-widest block">AI/公式推薦售價 ({targetMarginPercent}%毛利)</span>
              <span className="text-xl font-serif font-bold text-white">¥{calculatedDraft.suggestedPrice}</span>
            </div>

            <div>
              <label className="text-[10px] text-white/50 uppercase tracking-widest block">實際設定售價 (¥)</label>
              <input
                type="number"
                value={actualPrice}
                onChange={(e) => setActualPrice(Number(e.target.value) || 0)}
                className="w-20 bg-white/10 border border-white/20 rounded-lg text-center font-serif font-extrabold text-[#C2B280] text-sm py-1"
              />
            </div>
          </div>

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
              className="flex-1 py-3 bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4 text-[#C2B280]" />
              <span>儲存配方與雙軌定價</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
