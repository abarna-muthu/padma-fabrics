import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { products as staticCatalog, type Product } from "@/lib/catalog";
import { formatPrice } from "@/utils/formatters";
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  Star,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailPageProps {
  id?: string;
}

export function ProductDetailPage({ id }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { productsList } = useStore();

  const allProducts: Product[] = [
    ...productsList,
    ...staticCatalog.filter((sp) => !productsList.some((lp) => lp.id === sp.id)),
  ];

  // Find product by id
  const product = allProducts.find((p) => String(p.id) === String(id)) || allProducts[0];

  const availableSizes: string[] =
    product && Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : product?.category === "Saree"
        ? ["Free Size"]
        : ["S", "M", "L", "XL"];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "Standard");
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#6B1E2E]">Product Not Found</h2>
        <p className="text-xs text-[#5C5549] mt-2 mb-6">The requested weave could not be located in our catalog.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-[#6B1E2E] text-white text-xs font-semibold uppercase rounded">
          Browse Shop
        </Link>
      </div>
    );
  }

  const isFav = wishlist.includes(String(product.id));
  const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
  const hasDiscount = originalPrice && originalPrice > product.price;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    navigate({ to: "/checkout" });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 border border-[#E5DAC4] dark:border-[#B8913A]/25 rounded-2xl bg-white dark:bg-[#1E191A] shadow-xs">
        {/* Left: Product Image */}
        <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#FAF6EE] dark:bg-[#2A2425] border border-[#B8913A]/20">
          <img
            src={product.image || product.imageUrl || product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              const fallback = product.imageUrl || product.image_url;
              if (fallback && target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />

          {/* Wishlist Floating Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(String(product.id), product.name)}
            className={`absolute top-4 right-4 size-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
              isFav
                ? "bg-[#6B1E2E] text-white"
                : "bg-white/90 dark:bg-black/70 hover:bg-white text-[#5C5549] dark:text-white"
            }`}
            title={isFav ? "Saved in Wishlist" : "Save to Wishlist"}
          >
            <Heart className={`size-5 ${isFav ? "fill-white" : ""}`} />
          </button>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0E0E0E]/80 text-[#FAF6EE] border border-white/20">
                {product.badge}
              </span>
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B8913A]">
                {product.category || "Authentic Handloom"}
              </span>
              {product.fabric && (
                <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                  · {product.fabric}
                </span>
              )}
            </div>

            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center text-[#B8913A]">
                <Star className="size-4 fill-[#B8913A]" />
                <span className="text-xs font-semibold ml-1">{product.rating || "4.9"}</span>
              </div>
              <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                (48 Verified Customer Reviews)
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl sm:text-3xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-base text-[#5C5549] dark:text-[#B5AC9E] line-through">
                  {formatPrice(originalPrice!)}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-[#B8913A] rounded">
                  {Math.round(((originalPrice! - product.price) / originalPrice!) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-4 leading-relaxed">
              {product.description ||
                "Woven with meticulous artisan care in Menambedu, Ambattur. Features premium tensile strength, breathable natural fiber composition, and timeless cultural motifs suited for bridal, celebratory, and everyday styling."}
            </p>

            {/* Size Selector */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE]">
                  Select Size
                </span>
                <span className="text-[11px] text-[#B8913A]">Size Chart & Sizing Guide</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      selectedSize === sz
                        ? "bg-[#6B1E2E] text-white shadow-xs"
                        : "border border-[#E5DAC4] dark:border-white/10 hover:border-[#B8913A] text-[#0E0E0E] dark:text-[#FAF6EE]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
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
                  className="size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-bold px-3">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#E5DAC4] dark:border-[#B8913A]/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-lg bg-[#FAF6EE] hover:bg-[#F2ECE1] dark:bg-white/10 text-[#6B1E2E] dark:text-[#FAF6EE] border border-[#B8913A]/40 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <ShoppingBag className="size-4 text-[#B8913A]" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-lg bg-[#6B1E2E] hover:bg-[#521623] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
              >
                <Zap className="size-4 text-[#B8913A] fill-[#B8913A]" />
                <span>Buy Now Directly</span>
              </button>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-2 gap-2 pt-3 text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
              <div className="flex items-center gap-1.5">
                <Truck className="size-3.5 text-[#B8913A]" />
                <span>Dispatched from Chennai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#B8913A]" />
                <span>100% Genuine Handlooms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
