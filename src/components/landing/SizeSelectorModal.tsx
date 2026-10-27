import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import type { LandingProduct } from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface SizeSelectorModalProps {
  product: LandingProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export function SizeSelectorModal({
  product,
  isOpen,
  onClose,
}: SizeSelectorModalProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelectedSize("");
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const inStockSizes = product.availableSizes || ["S", "M", "L", "XL"];

  const handleSubmit = () => {
    if (!selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    addToCart(
      product as any,
      selectedSize,
      1,
      product.colour || "Standard",
      product.image,
      product.price
    );
    toast.success(`Added ${product.name} (${selectedSize}) to bag.`);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white p-6 rounded-[14px] shadow-2xl text-left font-['Poppins']"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-[#777777] hover:text-[#111111] p-1 cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <h3 className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#111111] mb-1">
          Size You Need:
        </h3>
        <p className="text-[12px] text-[#777777] mb-4 truncate">
          {product.name}
        </p>

        {/* Size chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_SIZES.map((sz) => {
            const inStock = inStockSizes.includes(sz);
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                disabled={!inStock}
                onClick={() => inStock && setSelectedSize(sz)}
                className={`min-w-[42px] h-[38px] px-2 text-[12px] font-semibold rounded-[8px] border transition-colors flex items-center justify-center cursor-pointer ${
                  !inStock
                    ? "border-[#E6E6E6] text-[#BBBBBB] line-through cursor-not-allowed bg-black/5"
                    : isSelected
                    ? "border-[#D0202B] bg-[#D0202B] text-white"
                    : "border-[#E6E6E6] text-[#222222] hover:border-[#D0202B] bg-white"
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>

        <Button
          variant="primary"
          fullWidth
          disabled={!selectedSize}
          onClick={handleSubmit}
        >
          SUBMIT & ADD TO BAG
        </Button>
      </div>
    </div>
  );
}
