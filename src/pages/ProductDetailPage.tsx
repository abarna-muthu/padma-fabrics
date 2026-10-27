import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { products as staticCatalog, type Product, type ProductVariant } from "@/lib/catalog";
import { formatPrice } from "@/utils/formatters";
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailPageProps {
  id?: string;
}

const COMMON_COLOUR_MAP: Record<string, string> = {
  "rani pink": "#D81B60",
  "teal blue": "#008080",
  "dusty pink": "#DCAE96",
  "mustard yellow": "#E1AD01",
  "bottle green": "#004225",
  "rust brown": "#8B3103",
  "lavender purple": "#967BB6",
  "wine red": "#722F37",
  "wine": "#722F37",
  "navy blue": "#000080",
  "royal blue": "#4169E1",
  "maroon": "#800000",
  "olive green": "#556B2F",
  "coral": "#FF7F50",
  "peach": "#FFE5B4",
  "emerald green": "#50C878",
  "golden yellow": "#EDBC3D",
  "deep red": "#9F160A",
  "black": "#1A1A1A",
  "white": "#FFFFFF",
  "cream": "#FAF6EE",
  "beige": "#F5F5DC",
  "grey": "#808080",
};

function getColourHex(colourName: string, customHex?: string): string {
  if (customHex && /^#([0-9A-F]{3}){1,2}$/i.test(customHex)) {
    return customHex;
  }
  const clean = colourName.toLowerCase().trim();
  if (COMMON_COLOUR_MAP[clean]) {
    return COMMON_COLOUR_MAP[clean]!;
  }
  for (const [key, val] of Object.entries(COMMON_COLOUR_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }
  return "#D15608";
}

export function ProductDetailPage({ id }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { productsList } = useStore();

  const allProducts: Product[] = useMemo(() => [
    ...productsList,
    ...staticCatalog.filter((sp) => !productsList.some((lp) => lp.id === sp.id)),
  ], [productsList]);

  // Find product by id
  const product = allProducts.find((p) => String(p.id) === String(id)) || allProducts[0];

  // Variants list
  const variants: ProductVariant[] = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    if (product.colour && product.colour !== "Custom") {
      return [
        {
          id: `var-${product.id}-default`,
          colour: product.colour,
          colourHex: getColourHex(product.colour),
          price: product.price,
          stock: product.stock,
          images: product.images && product.images.length > 0 ? product.images : [product.image],
        },
      ];
    }
    return [];
  }, [product]);

  // Selected colour state
  const [selectedColour, setSelectedColour] = useState<string>(() => {
    return variants[0]?.colour || product?.colour || "";
  });

  // Keep selectedColour in sync if product changes
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedColour(variants[0]!.colour);
    } else if (product?.colour) {
      setSelectedColour(product.colour);
    }
  }, [product?.id, variants]);

  const activeVariant = useMemo(() => {
    return variants.find((v) => v.colour.toLowerCase() === selectedColour.toLowerCase()) || variants[0];
  }, [variants, selectedColour]);

  // Gallery images determination
  const galleryImages: string[] = useMemo(() => {
    if (!product) return [];
    if (activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      return activeVariant.images.filter(Boolean);
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    const mainImg = product.image || (product as any).imageUrl || (product as any).image_url;
    return mainImg ? [mainImg] : ["/placeholder.svg"];
  }, [product, activeVariant]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Reset active image index when gallery changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [galleryImages]);

  // Size list determination
  const rawSizes: string[] = useMemo(() => {
    if (!product) return [];
    if (activeVariant && Array.isArray(activeVariant.sizes) && activeVariant.sizes.length > 0) {
      return activeVariant.sizes;
    }
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return [...product.sizes];
    }
    if (typeof product.sizes === "string") {
      try {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
      return (product.sizes as string).split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [product, activeVariant]);

  const validSizes = useMemo(() => {
    return rawSizes
      .map((s: any) => String(s).trim())
      .filter((s: string) => s !== "" && s !== "1" && s !== "0" && !/^\d+$/.test(s));
  }, [rawSizes]);

  const availableSizes: string[] = useMemo(() => {
    if (validSizes.length > 0) return validSizes;
    if (product?.category === "Saree") return ["Free Size"];
    return ["S", "M", "L", "XL", "2XL"];
  }, [validSizes, product?.category]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#9F160A]">Product Not Found</h2>
        <p className="text-xs text-[#5C5549] mt-2 mb-6">The requested weave could not be located in our catalog.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-semibold uppercase rounded transition-colors">
          Browse Shop
        </Link>
      </div>
    );
  }

  // Current effective price and stock
  const effectivePrice = activeVariant?.price !== undefined && Number(activeVariant.price) > 0
    ? Number(activeVariant.price)
    : Number(product.price);

  const effectiveStock = activeVariant?.stock !== undefined
    ? Number(activeVariant.stock)
    : Number(product.stock !== undefined ? product.stock : 10);

  const isOutOfStock = effectiveStock <= 0;

  // Stock check per size
  const isSizeOutOfStock = (sizeName: string) => {
    if (isOutOfStock) return true;
    if (activeVariant?.sizeStock && activeVariant.sizeStock[sizeName] !== undefined) {
      return Number(activeVariant.sizeStock[sizeName]) <= 0;
    }
    if (product.sizeStock && product.sizeStock[sizeName] !== undefined) {
      return Number(product.sizeStock[sizeName]) <= 0;
    }
    return false;
  };

  const isFav = wishlist.includes(String(product.id));
  const originalPrice = activeVariant?.originalPrice
    ? Number(activeVariant.originalPrice)
    : product.originalPrice
      ? Number(product.originalPrice)
      : undefined;
  const hasDiscount = originalPrice && originalPrice > effectivePrice;

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0] || "/placeholder.svg";

  const handleSelectSize = (sz: string) => {
    if (isSizeOutOfStock(sz)) return;
    setSelectedSize(sz);
    setSizeError(false);
  };

  const validateSelection = (): boolean => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error("Please select an available size to proceed.", {
        description: "Choose your preferred clothing size above.",
      });
      return false;
    }
    if (isOutOfStock) {
      toast.error("This product variant is currently out of stock.");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(
      product,
      selectedSize || "Standard",
      quantity,
      selectedColour || activeVariant?.colour || product.colour,
      currentImage,
      effectivePrice,
    );
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    addToCart(
      product,
      selectedSize || "Standard",
      quantity,
      selectedColour || activeVariant?.colour || product.colour,
      currentImage,
      effectivePrice,
    );
    navigate({ to: "/checkout" });
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          { label: product.category || "Weaves", href: "/shop" },
          { label: product.name },
        ]}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 border border-[#E5DAC4] dark:border-[#D15608]/25 rounded-2xl bg-white dark:bg-[#1E191A] shadow-xs">
        {/* Left: Product Image Gallery */}
        <div className="flex flex-col gap-4">
          {/* Main Product Image Container */}
          <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#FAF6EE] dark:bg-[#2A2425] border border-[#D15608]/20 group">
            <img
              src={currentImage}
              alt={`${product.name} - ${selectedColour || "View"} ${activeImageIndex + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-300"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (target.src !== "/placeholder.svg") {
                  target.src = "/placeholder.svg";
                }
              }}
            />

            {/* Gallery Navigation Arrows (only if multiple images) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white text-[#0E0E0E] dark:text-white flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer touch-manipulation z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white text-[#0E0E0E] dark:text-white flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer touch-manipulation z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Lightbox / Zoom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-3 right-3 size-9 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white text-[#5C5549] dark:text-white flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 cursor-pointer z-10"
              title="Click to expand view"
              aria-label="Expand image view"
            >
              <Maximize2 className="size-4" />
            </button>

            {/* Wishlist Floating Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(String(product.id), product.name)}
              className={`absolute top-4 right-4 size-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer z-10 ${
                isFav
                  ? "bg-[#9F160A] text-white"
                  : "bg-white/90 dark:bg-black/70 hover:bg-white text-[#5C5549] dark:text-white"
              }`}
              title={isFav ? "Saved in Wishlist" : "Save to Wishlist"}
              aria-label="Save to Wishlist"
            >
              <Heart className={`size-5 ${isFav ? "fill-white" : ""}`} />
            </button>

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0E0E0E]/80 text-[#FAF6EE] border border-white/20">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Image counter indicator */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                {activeImageIndex + 1} / {galleryImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative size-16 sm:size-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[#D15608] ring-2 ring-[#D15608]/30 scale-102"
                      : "border-[#E5DAC4] dark:border-white/10 hover:border-[#D15608]/60 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Variant Selectors */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D15608]">
                {product.category || "Authentic Handloom"}
              </span>
              {product.fabric && (
                <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                  · {product.fabric}
                </span>
              )}
            </div>

            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#0E0E0E] dark:text-[#FAF6EE] mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <div className="flex items-center text-[#EDBC3D]">
                <Star className="size-4 fill-[#EDBC3D]" />
                <span className="text-xs font-semibold ml-1">{product.rating || "4.9"}</span>
              </div>
              <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                (48 Verified Customer Reviews)
              </span>
              {product.sku && (
                <span className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E] font-mono">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl sm:text-3xl font-bold text-[#D15608] dark:text-[#FAF6EE]">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-[#5C5549] dark:text-[#B5AC9E] line-through">
                  {formatPrice(originalPrice!)}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-[#9F160A] rounded">
                  {Math.round(((originalPrice! - effectivePrice) / originalPrice!) * 100)}% OFF
                </span>
              )}
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-md">
                  Out of Stock
                </span>
              ) : effectiveStock <= 5 ? (
                <span className="px-2.5 py-0.5 text-xs font-bold text-amber-800 bg-amber-100 rounded-md">
                  Only {effectiveStock} left
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-md">
                  In Stock ({effectiveStock} available)
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-4 leading-relaxed">
              {product.description ||
                "Woven with meticulous artisan care in Menambedu, Ambattur. Features premium tensile strength, breathable natural fiber composition, and timeless cultural motifs suited for bridal, celebratory, and everyday styling."}
            </p>

            {/* 1. Colour Variant Selection */}
            {variants.length > 0 && (
              <div className="mt-6 pt-5 border-t border-[#E5DAC4]/60 dark:border-white/10">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE]">
                    Available Colours:
                  </span>
                  <span className="text-xs font-bold text-[#9F160A] dark:text-[#EDBC3D]">
                    {selectedColour || variants[0]?.colour}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {variants.map((v) => {
                    const isSelected = selectedColour.toLowerCase() === v.colour.toLowerCase();
                    const swatchHex = v.colourHex || getColourHex(v.colour);
                    return (
                      <button
                        key={v.colour}
                        type="button"
                        onClick={() => setSelectedColour(v.colour)}
                        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#9F160A] bg-[#9F160A]/5 text-[#9F160A] font-bold shadow-xs"
                            : "border-[#E5DAC4] dark:border-white/10 hover:border-[#D15608] text-[#5C5549] dark:text-[#FAF6EE]"
                        }`}
                        title={v.colour}
                      >
                        <span
                          className="size-4 rounded-full border border-black/20 shadow-2xs shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: swatchHex }}
                        >
                          {isSelected && (
                            <Check className={`size-2.5 ${swatchHex === "#FFFFFF" || swatchHex === "#FAF6EE" ? "text-black" : "text-white"}`} />
                          )}
                        </span>
                        <span className="text-xs capitalize">{v.colour}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Size Selection */}
            <div className="mt-6 pt-5 border-t border-[#E5DAC4]/60 dark:border-white/10">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE]">
                    Select Size:
                  </span>
                  {selectedSize ? (
                    <span className="text-xs font-bold text-[#D15608] dark:text-[#EDBC3D]">
                      {selectedSize}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#9F160A] font-medium animate-pulse">
                      (Required)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#D15608]">Sizing: S to 6XL</span>
              </div>

              {sizeError && (
                <div className="mb-2.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="size-4 shrink-0 text-red-600" />
                  <span>Please choose your preferred size before adding to cart.</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const outOfStock = isSizeOutOfStock(sz);
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => handleSelectSize(sz)}
                      className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer touch-manipulation ${
                        outOfStock
                          ? "border border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed opacity-60"
                          : isSelected
                            ? "bg-[#D15608] text-white shadow-md ring-2 ring-[#D15608]/40 scale-102"
                            : sizeError
                              ? "border-2 border-red-400 hover:border-red-600 text-[#0E0E0E] dark:text-[#FAF6EE]"
                              : "border border-[#E5DAC4] dark:border-white/15 hover:border-[#D15608] text-[#0E0E0E] dark:text-[#FAF6EE] bg-white/60 dark:bg-white/5"
                      }`}
                      title={outOfStock ? `${sz} is out of stock` : `Select size ${sz}`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E5DAC4] dark:border-white/20 rounded-md bg-[#FAF6EE] dark:bg-black/20">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-9 sm:size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer touch-manipulation"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="text-xs font-bold px-3 tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                  disabled={quantity >= effectiveStock}
                  className="size-9 sm:size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer touch-manipulation disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#E5DAC4] dark:border-[#D15608]/20 space-y-3 pb-20 sm:pb-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full min-h-[46px] py-3.5 px-4 rounded-xl bg-[#FAF6EE] hover:bg-[#F2ECE1] dark:bg-white/10 text-[#D15608] dark:text-[#FAF6EE] border border-[#D15608]/40 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="size-4 text-[#D15608]" />
                <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full min-h-[46px] py-3.5 px-4 rounded-xl bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="size-4 text-amber-300 fill-amber-300" />
                <span>Buy Now Directly</span>
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-2 gap-2 pt-3 text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
              <div className="flex items-center gap-1.5">
                <Truck className="size-3.5 text-[#D15608]" />
                <span>Dispatched from Chennai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#D15608]" />
                <span>100% Genuine Handlooms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 sm:right-2 text-white hover:text-[#EDBC3D] size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close zoom preview"
            >
              <X className="size-6" />
            </button>

            {/* Enlarged Image */}
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-xl">
              <img
                src={currentImage}
                alt={`${product.name} zoom preview`}
                className="max-h-[75vh] w-auto max-w-full object-contain shadow-2xl"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector in modal */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto p-1 max-w-full">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`size-14 sm:size-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#EDBC3D] ring-2 ring-[#EDBC3D]/50 scale-105"
                        : "border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Purchase Bar */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden z-40 bg-white/95 dark:bg-[#1E191A]/95 backdrop-blur-md p-3 border-t border-[#E5DAC4] dark:border-white/10 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-lg bg-[#FAF6EE] dark:bg-white/10 text-[#D15608] dark:text-[#FAF6EE] border border-[#D15608]/40 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-98 touch-manipulation disabled:opacity-50"
        >
          <ShoppingBag className="size-3.5 text-[#D15608]" />
          <span>Add to Bag</span>
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-lg bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md active:scale-98 touch-manipulation disabled:opacity-50"
        >
          <Zap className="size-3.5 text-amber-300 fill-amber-300" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
