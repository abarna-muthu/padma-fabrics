import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/utils/formatters";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { cleanSizes, type Product } from "@/lib/catalog";
import { MobileSizeSelectModal } from "@/components/MobileSizeSelectModal";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product | any;
  light?: boolean | undefined;
  badgeText?: string | undefined;
  onQuickView?: ((product: Product) => void) | undefined;
}

export function ProductCard({ product, light = false, badgeText, onQuickView }: ProductCardProps) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const isFavorite = wishlist.includes(String(product.id));

  // Clean available sizes
  const availableSizes: string[] = cleanSizes(product.sizes, product.category, product.description);
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "Standard");
  const [isMobileSizeModalOpen, setIsMobileSizeModalOpen] = useState(false);

  // Second image for flip on hover (W for Woman style)
  const primaryImage = product.image || product.imageUrl || "/placeholder.svg";
  const secondImage =
    Array.isArray(product.images) && product.images.length > 1 && product.images[1] !== primaryImage
      ? product.images[1]
      : Array.isArray(product.variants) && product.variants[0]?.image && product.variants[0].image !== primaryImage
      ? product.variants[0].image
      : null;

  const salePrice = Number(product.price) || 0;
  const originalPrice = product.originalPrice || product.original_price;
  const hasDiscount = originalPrice && Number(originalPrice) > salePrice;
  const discountPercent = hasDiscount
    ? Math.round(((Number(originalPrice) - salePrice) / Number(originalPrice)) * 100)
    : 0;

  // Badge text
  const badge = badgeText || product.badge || (hasDiscount ? `${discountPercent}% OFF` : null);

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      navigate({ to: "/product/$id", params: { id: String(product.id) } });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, sizeToUse?: string) => {
    e.stopPropagation();
    const chosen = sizeToUse || selectedSize || availableSizes[0] || "Standard";
    addToCart(product, chosen, 1, product.colour, primaryImage, salePrice);
    toast.success(`Added ${product.name} (${chosen}) to bag!`, {
      action: {
        label: "View Bag",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(String(product.id), product.name);
    if (!isFavorite) {
      toast.success(`Saved "${product.name}" to your wishlist!`);
    } else {
      toast.info(`Removed "${product.name}" from wishlist.`);
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group relative flex flex-col bg-white text-[#0E0E0E] rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-300 hover:shadow-lg border border-[#EBE6DC]/80"
      >
        {/* 3:4 Aspect Ratio Image Container */}
        <div className="relative aspect-3/4 w-full bg-[#FAF6EE] overflow-hidden">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
              secondImage ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
            }`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
          />

          {/* Secondary Image on Hover (if available) */}
          {secondImage && (
            <img
              src={secondImage}
              alt={`${product.name} angle 2`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          {/* Top-Left Tag / Badge */}
          {badge && badge !== "1" && badge !== "0" && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-[#141414]/85 backdrop-blur-xs text-[#FAF6EE] border border-white/20">
                {badge}
              </span>
            </div>
          )}

          {/* Top-Right Heart Icon */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2.5 right-2.5 z-10 size-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isFavorite
                ? "bg-[#9F160A] text-white shadow-md"
                : "bg-white/80 hover:bg-white text-black/70 hover:text-[#9F160A] backdrop-blur-xs shadow-xs"
            }`}
          >
            <Heart className={`size-4 ${isFavorite ? "fill-white" : ""}`} strokeWidth={1.75} />
          </button>

          {/* Desktop Hover Overlay: Size selector + Slide-up Add to Cart button */}
          <div
            className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 hidden lg:flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Size Selector on Hover */}
            {availableSizes.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {availableSizes.slice(0, 5).map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`size-6 rounded-full text-[10px] font-bold uppercase transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? "bg-[#9F160A] text-white ring-1 ring-white shadow-xs"
                          : "bg-black/40 text-white/90 hover:bg-black/70 border border-white/20"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Slide-Up Add to Cart Button */}
            <button
              type="button"
              onClick={(e) => handleAddToCart(e, selectedSize)}
              className="w-full py-2 rounded-lg bg-[#9F160A] hover:bg-[#7D1107] text-white text-[11px] font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <ShoppingBag className="size-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        {/* Product Details Below Image */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-1.5">
          <div>
            {/* Category / Fabric Subtitle */}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9F160A]">
              {product.category || "Authentic Handloom"}
            </span>

            {/* Product Title (2-line clamp) */}
            <h3
              className="font-['Manrope'] text-xs sm:text-[13px] font-semibold text-[#0E0E0E] line-clamp-2 min-h-[2rem] sm:min-h-[2.3rem] leading-snug mt-1 group-hover:text-[#9F160A] transition-colors"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          {/* Price Row: Bold sale price, strikethrough original price, discount badge */}
          <div className="pt-1.5 border-t border-[#EBE6DC]/80 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <span className="font-['Manrope'] text-xs sm:text-sm font-bold text-[#0E0E0E]">
                {formatPrice(salePrice)}
              </span>

              {hasDiscount && (
                <span className="text-[11px] text-[#5C5549] line-through">
                  {formatPrice(Number(originalPrice))}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="text-[10px] font-bold text-[#9F160A]">
                  ({discountPercent}% OFF)
                </span>
              )}
            </div>

            {/* Mobile Quick Add to Cart Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileSizeModalOpen(true);
              }}
              className="lg:hidden size-7 rounded-full bg-[#FAF6EE] text-[#9F160A] hover:bg-[#9F160A] hover:text-white border border-[#E5DAC4] flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingBag className="size-3.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Mobile Size Selection Sheet */}
      <MobileSizeSelectModal
        isOpen={isMobileSizeModalOpen}
        onClose={() => setIsMobileSizeModalOpen(false)}
        product={product}
        availableSizes={availableSizes}
        onConfirm={(chosenSize) => {
          setSelectedSize(chosenSize);
          addToCart(product, chosenSize, 1, product.colour, primaryImage, salePrice);
          toast.success(`Added ${product.name} (${chosenSize}) to bag!`, {
            action: {
              label: "View Bag",
              onClick: () => setIsCartOpen(true),
            },
          });
        }}
      />
    </>
  );
}

export default ProductCard;
