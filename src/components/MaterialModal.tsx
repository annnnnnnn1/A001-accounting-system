import React, { useState } from 'react';
import { X, Check, Package, Link2, Upload, Image as ImageIcon } from 'lucide-react';
import { MaterialItem, MaterialType } from '../types';

interface MaterialModalProps {
  initialMaterial?: MaterialItem | null;
  onClose: () => void;
  onSave: (mat: MaterialItem) => void;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  initialMaterial,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(initialMaterial?.name || '');
  const [type, setType] = useState<MaterialType>(initialMaterial?.type || 'consumable');
  const [unit, setUnit] = useState(initialMaterial?.unit || 'g');
  const [purchasePrice, setPurchasePrice] = useState<number>(initialMaterial?.purchasePrice || 320);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(initialMaterial?.purchaseQuantity || 500);
  const [currentStock, setCurrentStock] = useState<number>(initialMaterial?.currentStock || 500);
  const [minStockAlert, setMinStockAlert] = useState<number>(initialMaterial?.minStockAlert || 100);
  const [estimatedLifespanUses, setEstimatedLifespanUses] = useState<number>(initialMaterial?.estimatedLifespanUses || 50);
  const [imageUrl, setImageUrl] = useState(initialMaterial?.imageUrl || '');
  const [restockUrl, setRestockUrl] = useState(initialMaterial?.restockUrl || '');
  const [note, setNote] = useState(initialMaterial?.note || '');

  const costPerUnit = purchaseQuantity > 0 ? Number((purchasePrice / purchaseQuantity).toFixed(2)) : 0;
  const costPerGram = unit === 'g' ? costPerUnit : undefined;
  const amortizedCostPerUse = estimatedLifespanUses > 0 ? Number((purchasePrice / estimatedLifespanUses).toFixed(1)) : costPerUnit;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || purchasePrice <= 0 || purchaseQuantity <= 0) return;

    onSave({
      id: initialMaterial?.id || `mat_${Date.now()}`,
      name,
      type,
      unit,
      purchasePrice,
      purchaseQuantity,
      costPerUnit,
      costPerGram,
      currentStock,
      minStockAlert,
      estimatedLifespanUses: type === 'tool_mold' ? estimatedLifespanUses : undefined,
      amortizedCostPerUse: type === 'tool_mold' ? amortizedCostPerUse : undefined,
      imageUrl,
      restockUrl,
      note
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E5E2DD] shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-[#C2B280]" />
            <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">
              {initialMaterial ? '編輯原物料/模具' : '新增原物料或模具資材'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8C7A66] hover:text-[#1A1A1A] rounded-full hover:bg-[#F2EDE7] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Image Upload & Preview */}
          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1.5">
              耗材/模具圖片 (支援上傳或連結)
            </label>
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F9F8F6] border border-[#E5E2DD] overflow-hidden flex items-center justify-center shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[#8C7A66]" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="貼上圖床網址 (例: https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-1.5 text-[#1A1A1A]"
                />
                <label className="inline-flex items-center gap-1.5 bg-[#F2EDE7] hover:bg-[#E5E2DD] text-[#1A1A1A] font-semibold px-3 py-1 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#C2B280]" />
                  <span>從電腦選擇上傳...</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1">
              材料/模具名稱 *
            </label>
            <input
              type="text"
              required
              placeholder="例如: 食品級AB軟矽膠"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-bold focus:outline-hidden focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1">
              一鍵進貨補貨連結 (淘寶/1688/拼多多/蝦皮網址)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-[#8C7A66] absolute left-3 top-2.5" />
              <input
                type="url"
                placeholder="https://item.taobao.com/item.htm?id=..."
                value={restockUrl}
                onChange={(e) => setRestockUrl(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl text-[#1A1A1A] font-mono focus:outline-hidden focus:border-[#1A1A1A]"
              />
            </div>
            <p className="text-[10px] text-[#8C7A66] mt-1">
              🔗 設定網址後，可在庫存管理頁直接點擊「一鍵前往補貨」。
            </p>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1">
              資材類別
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaterialType)}
              className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A] font-medium"
            >
              <option value="consumable">🧪 一次性耗材 (AB膠、色膏、植絨粉)</option>
              <option value="tool_mold">🛠️ 固定資產模具/設備 (矽膠模具、消泡機)</option>
              <option value="packaging">📦 包裝資材 (袋子、貼紙、小卡)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                購買總金額 *
              </label>
              <input
                type="number"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-2.5 py-2 font-serif font-bold text-[#4A5D4E]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                購買總克數/總量 *
              </label>
              <input
                type="number"
                required
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Number(e.target.value) || 0)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-2.5 py-2 font-bold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                單位 (g/ml/個)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-2.5 py-2 font-bold text-center text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Type specific fields */}
          {type === 'tool_mold' ? (
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3.5 space-y-1.5">
              <label className="font-semibold text-[#1A1A1A] block">
                預估模具翻模壽命次數
              </label>
              <input
                type="number"
                value={estimatedLifespanUses}
                onChange={(e) => setEstimatedLifespanUses(Number(e.target.value) || 1)}
                className="w-full bg-white border border-[#E5E2DD] rounded-xl px-3 py-1.5 font-bold text-[#1A1A1A]"
              />
              <p className="text-[10px] text-[#6D5D4E]">
                💡 每次翻模分攤折舊成本 = <strong className="font-serif">¥{amortizedCostPerUse}</strong> / 個捏捏
              </p>
            </div>
          ) : (
            <div className="bg-[#F9F8F6] border border-[#E5E2DD] rounded-2xl p-3 text-[#6D5D4E]">
              克數/單位取得成本 = <strong className="font-serif text-[#1A1A1A]">¥{costPerUnit} / {unit}</strong>
              {unit === 'g' && <span className="ml-2 text-xs font-semibold text-[#4A5D4E]">(精算單價: ¥{costPerUnit}/g)</span>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                現有庫存量 ({unit})
              </label>
              <input
                type="number"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value) || 0)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 font-bold text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#1A1A1A] block mb-1">
                低庫存警戒線 ({unit})
              </label>
              <input
                type="number"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value) || 0)}
                className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 font-bold text-rose-800"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#1A1A1A] block mb-1">
              備註說明 (選填)
            </label>
            <input
              type="text"
              placeholder="例如: 買自淘寶旗艦店、1688批發..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#F9F8F6] border border-[#E5E2DD] rounded-xl px-3 py-2 text-[#1A1A1A]"
            />
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
              <span>儲存材料與連結</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
