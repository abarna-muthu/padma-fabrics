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

  // Sizes available - sanitize & filter out bogus single digits/numbers like "1" or "0"
  const availableSizes: string[] = (() => {
    const raw = Array.isArray(product?.sizes)
      ? product.sizes
      : typeof product?.sizes === "string"
        ? product.sizes.split(",")
        : [];
    const valid = raw
      .map((s: any) => String(s).trim())
      .filter((s: string) => s !== "" && s !== "1" && s !== "0" && !/^\d+$/.test(s));

    if (valid.length > 0) return valid;
    return product?.category === "Saree" ? ["Free Size"] : ["S", "M", "L", "XL"];
  })();

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "Standard");

  const salePrice = Number(product?.price) || 0;
  const rawBadge = badgeText !== undefined ? badgeText : product?.badge;
  const badge = typeof rawBadge === "string" ? rawBadge.trim() : (rawBadge ? String(rawBadge).trim() : "");
  const badgeLower = badge.toLowerCase();
  // Filter out any standalone numeric badges like "1" or "0"
  const isDisplayBadge = Boolean(badge && badge !== "1" && badge !== "0" && !/^\d+$/.test(badge));

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      openProduct(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, 1, product.colour, product.image, product.price);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize, 1, product.colour, product.image, product.price);
    buyNow(product, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(String(product?.id || ""), product?.name || "");
  };

  return (
    <article
      className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 select-none shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)] hover:-translate-y-1 ${
        light
          ? "bg-[#141414] border border-[rgba(244,240,232,0.1)] text-[#F4F0E8]"
          : "bg-white border border-[rgba(14,14,14,0.08)] text-[#0E0E0E]"
      }`}
    >
      {/* 3:4 Aspect Ratio Image Container */}
      <div
        className="relative aspect-3/4 w-full rounded-t-2xl overflow-hidden bg-[#EBE6DC] dark:bg-[#1E1E1E] cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={product?.image || product?.imageUrl || product?.image_url || "/placeholder.svg"}
          alt={product?.name || "Product"}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-104"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            const fallback = product?.imageUrl || product?.image_url;
            if (fallback && target.src !== fallback) {
              target.src = fallback;
            }
          }}
        />

        {/* Tiny Pill Badge Top-Left (Suppressed if numeric/1) */}
        {isDisplayBadge ? (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.15em] ${
                badgeLower.includes("sale") || badgeLower.includes("discount") || badgeLower.includes("off")
                  ? "bg-[#9F160A] text-white"
                  : badgeLower.includes("bestseller") || badgeLower.includes("trending") || badgeLower.includes("new")
                  ? "bg-[#EDBC3D] text-[#0E0E0E]"
                  : "bg-[#0E0E0E] text-[#F4F0E8] border border-[rgba(244,240,232,0.2)]"
              }`}
            >
              {badge}
            </span>
          </div>
        ) : null}

        {/* Minimal Heart Top-Right */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 size-8 rounded-full flex items-center justify-center transition-all ${
            isFavorite
              ? "bg-[#9F160A] text-white"
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
          {/* Size Chips - Only show when multiple real sizes exist (never lone 1) */}
          {availableSizes.length > 1 && (
            <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {availableSizes.slice(0, 4).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-medium transition-all ${
                    selectedSize === sz
                      ? "bg-[#D15608] text-white ring-1 ring-[#EDBC3D] shadow-xs"
                      : "bg-black/50 text-white/90 hover:bg-black/70 border border-white/20"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}

          {/* Add to Cart Pill Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 rounded-full bg-[#D15608] hover:bg-[#9F160A] text-white text-[11px] font-semibold uppercase tracking-[0.14em] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98 border border-[#EDBC3D]/40"
          >
            <ShoppingBag className="size-3 text-[#FAF6EE]" strokeWidth={1.5} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Details Below Image */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Name */}
          <h3
            onClick={handleCardClick}
            className="font-['Manrope'] text-xs sm:text-sm font-medium tracking-tight line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem] leading-snug cursor-pointer hover:text-[#D15608] transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price with Tabular Numerals on left, Action Buttons on right */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mt-2 pt-1.5 border-t border-[rgba(14,14,14,0.06)]">
            <div className="flex items-baseline gap-0.5 sm:gap-1 min-w-0">
              <span className="font-['Manrope'] text-xs sm:text-[15px] font-bold tabular-nums text-foreground truncate">
                {formatPrice(salePrice)}
              </span>
              <span
                className={`text-[9px] sm:text-xs font-light shrink-0 ${
                  light ? "text-[#F4F0E8]/60" : "text-[#0E0E0E]/60"
                }`}
              >
                / {product.unit || "piece"}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Quick Add to Cart Button (Mobile & Desktop) */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="size-7 sm:size-7.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-[#0E0E0E] dark:text-[#FAF6EE] flex items-center justify-center transition-all cursor-pointer active:scale-90 touch-manipulation border border-[rgba(14,14,14,0.1)]"
                title="Add to Bag"
                aria-label="Add to bag"
              >
                <ShoppingBag className="size-3.5 text-[#D15608] dark:text-[#EDBC3D]" strokeWidth={1.5} />
              </button>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#D15608] hover:bg-[#9F160A] text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 border border-[#EDBC3D]/40 shrink-0 inline-flex items-center gap-1 touch-manipulation whitespace-nowrap"
                title="Buy Now"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
