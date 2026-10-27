import { useState } from "react";
import { X, Check, ShoppingBag, ArrowRight } from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import type { Product } from "@/lib/catalog";

interface MobileSizeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  availableSizes: string[];
  onConfirm: (size: string) => void;
}

export function MobileSizeSelectModal({
  isOpen,
  onClose,
  product,
  availableSizes,
  onConfirm,
}: MobileSizeSelectModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "Standard");

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onConfirm(selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white p-5 text-[#0E0E0E] shadow-2xl border border-[#EBE6DC] space-y-4 animate-in slide-in-from-bottom duration-250 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EBE6DC]">
          <div className="flex items-center gap-3">
            <img
              src={product.image || product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              className="size-14 rounded-lg object-cover border border-[#E5DAC4]"
            />
            <div>
              <h4 className="text-xs font-bold text-[#0E0E0E] line-clamp-1">{product.name}</h4>
              <p className="text-sm font-bold text-[#9F160A] mt-0.5">{formatPrice(product.price)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-black/40 hover:text-black cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E]">
            Select Preferred Size
          </span>
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {availableSizes.map((sz) => {
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                    isSelected
                      ? "bg-[#9F160A] text-white border-[#9F160A] shadow-xs"
                      : "bg-[#FAF6EE] text-[#0E0E0E] border-[#E5DAC4] hover:border-[#9F160A]"
                  }`}
                >
                  <span>{sz}</span>
                  {isSelected && <Check className="size-3" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-3 rounded-xl bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="size-4" />
          <span>Add to Bag</span>
        </button>
      </div>
    </div>
  );
}

export default MobileSizeSelectModal;
