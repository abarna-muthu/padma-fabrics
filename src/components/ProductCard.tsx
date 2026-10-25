import { useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import type { Product } from "@/lib/catalog";

interface ProductCardProps {
  product: Product | any;
  light?: boolean | undefined; // when rendered in dark sections
  badgeText?: string | undefined;
  onQuickView?: ((product: Product) => void) | undefined;
}

export function ProductCard({ product, light = false, badgeText, onQuickView }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { openProduct, buyNow } = useStore();

  const isFavorite = wishlist.includes(String(product.id));

  // Sizes available
  const availableSizes: string[] =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : product.category === "Saree"
        ? ["Free Size"]
        : ["S", "M", "L", "XL"];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "Standard");

  const salePrice = Number(product.price) || 0;
  const badge = badgeText || product.badge || "New";

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      openProduct(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(String(product.id), product.name);
  };

  return (
    <article
      className={`group relative flex flex-col rounded-[2px] transition-all duration-300 select-none ${
        light
          ? "bg-[#141414] border border-[rgba(244,240,232,0.1)] text-[#F4F0E8]"
          : "bg-white border border-[rgba(14,14,14,0.08)] text-[#0E0E0E]"
      }`}
    >
      {/* 3:4 Aspect Ratio Image Container */}
      <div
        className="relative aspect-3/4 w-full rounded-[2px] overflow-hidden bg-[#EBE6DC] dark:bg-[#1E1E1E] cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-104"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Tiny Pill Badge Top-Left */}
        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.15em] ${
                badge.toLowerCase().includes("bestseller") || badge.toLowerCase().includes("trending")
                  ? "bg-[#B8913A] text-[#0E0E0E]"
                  : "bg-[#0E0E0E] text-[#F4F0E8] border border-[rgba(244,240,232,0.2)]"
              }`}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Minimal Heart Top-Right */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 size-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-[#6B1E2E] text-white"
              : "bg-black/20 hover:bg-black/50 text-white backdrop-blur-xs"
          }`}
        >
          <Heart
            className={`size-3.5 ${isFavorite ? "fill-white" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        {/* Hover Action Overlay on Desktop: Size Chips & Add to Cart */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10 hidden lg:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Size Chips */}
          <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {availableSizes.slice(0, 4).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-medium transition-all ${
                  selectedSize === sz
                    ? "bg-[#6B1E2E] text-white ring-1 ring-[#B8913A] shadow-xs"
                    : "bg-black/50 text-white/90 hover:bg-black/70 border border-white/20"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Add to Cart Pill Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 rounded-full bg-[#6B1E2E] hover:bg-[#832638] text-white text-[11px] font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98 border border-[#B8913A]/40"
          >
            <ShoppingBag className="size-3 text-[#FAF6EE]" strokeWidth={1.5} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Details Below Image */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Name */}
          <h3
            onClick={handleCardClick}
            className="font-['Manrope'] text-xs sm:text-sm font-medium tracking-tight line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem] leading-snug cursor-pointer hover:text-[#B8913A] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price with Tabular Numerals */}
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="font-['Manrope'] text-xs sm:text-[15px] font-semibold tabular-nums">
              {formatPrice(salePrice)}
            </span>
            <span
              className={`text-[11px] sm:text-xs font-light ${
                light ? "text-[#F4F0E8]/60" : "text-[#0E0E0E]/60"
              }`}
            >
              / {product.unit || "piece"}
            </span>
          </div>
        </div>

        {/* Mobile-Only Action Button (clean, accessible, does not block fabric image) */}
        <div className="lg:hidden pt-2 border-t border-[rgba(14,14,14,0.06)]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 rounded-full bg-[#6B1E2E] hover:bg-[#832638] active:scale-98 text-white text-[11px] font-semibold uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-[#B8913A]/40"
          >
            <ShoppingBag className="size-3 text-[#FAF6EE]" strokeWidth={1.5} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
