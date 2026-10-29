import { useState, memo, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import { Badge } from "./Badge";
import { ImageSkeleton } from "./ImageSkeleton";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export interface LandingProduct {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  fabricTag?: string;
  isNew?: boolean;
  category?: string;
  availableSizes?: string[];
  colour?: string;
}

interface ProductCardProps {
  product: LandingProduct;
  onOpenQuickSize?: (product: LandingProduct) => void;
  className?: string;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const ProductCard = memo(function ProductCard({
  product,
  onOpenQuickSize,
  className = "",
}: ProductCardProps) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeWarning, setShowSizeWarning] = useState(false);

  const isWishlisted = wishlist.includes(String(product.id));

  const formatRs = (n: number) =>
    "Rs. " + new Intl.NumberFormat("en-IN").format(Math.round(n));

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : 0;
  const savings = hasDiscount ? product.originalPrice! - product.price : 0;

  const inStockSizes = product.availableSizes || ["S", "M", "L", "XL"];

  const handleWishlistClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(String(product.id));
    toast.success(
      isWishlisted
        ? "Removed from your wishlist."
        : "Added to your wishlist."
    );
  };

  const handleAddToCartClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) {
      setShowSizeWarning(true);
      setTimeout(() => setShowSizeWarning(false), 2400);
      if (onOpenQuickSize) {
        onOpenQuickSize(product);
      } else {
        toast.error("Please select a size first.");
      }
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
  };

  const handleMobileQuickAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenQuickSize) {
      onOpenQuickSize(product);
    } else {
      addToCart(
        product as any,
        inStockSizes[0] || "M",
        1,
        product.colour || "Standard",
        product.image,
        product.price
      );
      toast.success(`Added ${product.name} to bag.`);
    }
  };

  const handleBuyClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedSize) {
      addToCart(
        product as any,
        selectedSize,
        1,
        product.colour || "Standard",
        product.image,
        product.price
      );
      toast.success(`Added ${product.name} (${selectedSize}) to bag.`);
    } else if (onOpenQuickSize) {
      onOpenQuickSize(product);
    } else {
      addToCart(
        product as any,
        inStockSizes[0] || "M",
        1,
        product.colour || "Standard",
        product.image,
        product.price
      );
      toast.success(`Added ${product.name} to bag.`);
    }
  };

  return (
    <div
      className={`group/card relative flex flex-col font-['Poppins'] text-left bg-white select-none ${className}`}
    >
      {/* 3:4 Image Container with hover zoom 1.04 */}
      <Link
        to="/product/$id"
        params={{ id: String(product.id) }}
        className="relative block w-full overflow-hidden bg-[#EDEDED] aspect-[3/4] rounded-[14px] isolate"
      >
        <div className="w-full h-full transition-transform duration-300 ease-out group-hover/card:scale-[1.04] rounded-[inherit]">
          <ImageSkeleton
            src={product.image}
            alt={product.name}
            aspectRatio="3/4"
            className="w-full h-full rounded-[inherit]"
          />
        </div>

        {/* Top-left Badges: NEW IN + Fabric Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
          {product.isNew !== false && (
            <Badge label="NEW IN" variant="red" />
          )}
          {product.fabricTag && (
            <Badge label={product.fabricTag} variant="dark" />
          )}
        </div>

        {/* Top-right: Outlined Brand-Red Heart */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 size-8 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center transition-transform active:scale-90 hover:scale-110 cursor-pointer shadow-xs"
        >
          <Heart
            className={`size-4 transition-colors ${
              isWishlisted
                ? "text-[#D0202B] fill-[#D0202B]"
                : "text-[#D0202B] hover:fill-[#D0202B]/20"
            }`}
          />
        </button>

        {/* Size Warning Popup */}
        {showSizeWarning && (
          <div className="absolute inset-x-2 top-12 z-20 bg-[#111111]/90 text-white text-[11px] font-medium py-1.5 px-2.5 text-center rounded-[6px] shadow-lg animate-in fade-in">
            Select a size below to add to cart
          </div>
        )}

        {/* Desktop Hover Overlay: Size Chips & Slide-up ADD TO CART Button */}
        <div className="hidden lg:flex absolute inset-x-0 bottom-0 z-10 flex-col items-center bg-gradient-to-t from-white via-white/95 to-transparent pt-6 pb-2 px-2 translate-y-full group-hover/card:translate-y-0 transition-transform duration-200 ease-out rounded-b-[14px]">
          {/* Size Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1 mb-2">
            {ALL_SIZES.map((sz) => {
              const inStock = inStockSizes.includes(sz);
              const isSelected = selectedSize === sz;
              return (
                <button
                  key={sz}
                  type="button"
                  disabled={!inStock}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (inStock) setSelectedSize(sz);
                  }}
                  className={`size-[26px] text-[10px] font-semibold rounded-[6px] border transition-colors flex items-center justify-center cursor-pointer ${
                    !inStock
                      ? "border-[#E6E6E6] text-[#BBBBBB] line-through cursor-not-allowed bg-black/5"
                      : isSelected
                      ? "border-[#D0202B] bg-[#D0202B] text-white"
                      : "border-[#E6E6E6] text-[#222222] hover:border-[#D0202B] bg-white"
                  }`}
                  aria-label={`Select size ${sz}`}
                >
                  {sz}
                </button>
              );
            })}
          </div>

          {/* Full-width ADD TO CART button */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className="w-full h-[36px] bg-[#D0202B] hover:bg-[#b01721] text-white text-[11px] font-bold uppercase tracking-[0.1em] rounded-[6px] transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          >
            ADD TO CART
          </button>
        </div>

        {/* Mobile Quick-add '+' Button */}
        <button
          type="button"
          onClick={handleMobileQuickAdd}
          aria-label="Quick add to cart"
          className="lg:hidden absolute bottom-2 right-2 z-10 size-8 rounded-full bg-white text-[#D0202B] shadow-md flex items-center justify-center active:scale-95 cursor-pointer"
        >
          <Plus className="size-4 stroke-[2.5]" />
        </button>
      </Link>

      {/* Below Image: Title, Price and Buy Button */}
      <div className="pt-2.5 pb-2.5 px-1 sm:px-1.5 flex flex-col text-left">
        <Link
          to="/product/$id"
          params={{ id: String(product.id) }}
          className="text-[13px] sm:text-[14px] font-medium text-[#111111] hover:text-[#9F160A] line-clamp-2 min-h-[36px] sm:min-h-[38px] leading-[1.3] transition-colors"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Price & Buy Button Row */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Price Block */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-bold text-[#111111] text-[15px] sm:text-[16px] tabular-nums tracking-tight leading-none">
                {formatRs(product.price)}
              </span>
              {hasDiscount && (
                <span className="line-through text-[#888888] text-[11px] sm:text-[12px] leading-none">
                  {formatRs(product.originalPrice!)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-[#9F160A] font-semibold text-[10px] leading-none mt-1">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Buy Button on Right Side */}
          <button
            type="button"
            onClick={handleBuyClick}
            className="h-8 px-3.5 sm:px-4 bg-[#9F160A] hover:bg-[#7D1107] text-white text-[11px] sm:text-[12px] font-bold uppercase tracking-wider rounded-[6px] shadow-xs hover:shadow transition-all active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
            aria-label={`Buy ${product.name}`}
          >
            BUY
          </button>
        </div>
      </div>
    </div>
  );
});
