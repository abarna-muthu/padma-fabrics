import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Sparkles,
  Zap,
  Check,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { products as staticCatalog, type Product } from "@/lib/catalog";
import { formatPrice } from "@/utils/formatters";
import { toast } from "sonner";

export function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { productsList, activeProducts, openProduct } = useStore();

  // Selected sizes for each wishlisted product
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Merge productsList with staticCatalog fallback
  const allProducts: Product[] = [
    ...productsList,
    ...staticCatalog.filter((sp) => !productsList.some((lp) => lp.id === sp.id)),
  ];

  // Resolve all wishlisted product objects
  const wishlistedItems = wishlist
    .map((id) => allProducts.find((p) => String(p.id) === String(id)))
    .filter((p): p is Product => Boolean(p));

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const availableSizes =
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : product.category === "Saree"
          ? ["Free Size"]
          : ["S", "M", "L", "XL"];
    const chosenSize = selectedSizes[product.id] || availableSizes[0] || "Standard";

    addToCart(product, chosenSize, 1);
  };

  const handleBuyNow = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleAddToCart(product);
    navigate({ to: "/checkout" });
  };

  const handleMoveAllToBag = () => {
    if (wishlistedItems.length === 0) return;
    wishlistedItems.forEach((product) => {
      const availableSizes =
        Array.isArray(product.sizes) && product.sizes.length > 0
          ? product.sizes
          : product.category === "Saree"
            ? ["Free Size"]
            : ["S", "M", "L", "XL"];
      const chosenSize = selectedSizes[product.id] || availableSizes[0] || "Standard";
      addToCart(product, chosenSize, 1);
    });
    toast.success(`Moved all ${wishlistedItems.length} items to your shopping bag!`);
    navigate({ to: "/cart" });
  };

  // Recommended fallback products if wishlist is empty
  const recommendedProducts = (activeProducts && activeProducts.length > 0 ? activeProducts : staticCatalog).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          { label: "My Wishlist" },
        ]}
        className="mb-6"
      />

      {/* Header section with counts and quick actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5DAC4] dark:border-[#B8913A]/20">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B8913A]">
            Curated Wardrobe
          </span>
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mt-1">
            Saved Fabrics & Silhouettes
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-1.5 max-w-2xl">
            Pieces handpicked for your celebratory occasions, festive styling, and everyday luxury.
          </p>
        </div>

        {wishlistedItems.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleMoveAllToBag}
              className="px-4 py-2 rounded bg-[#6B1E2E] hover:bg-[#521623] text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <ShoppingBag className="size-3.5" />
              <span>Move All to Bag ({wishlistedItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear your saved wishlist?")) {
                  clearWishlist();
                  toast.info("Wishlist cleared");
                }
              }}
              className="p-2 rounded border border-[#E5DAC4] dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[#5C5549] hover:text-rose-600 transition-colors cursor-pointer"
              title="Clear all wishlist items"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Items Content */}
      {wishlistedItems.length === 0 ? (
        <div className="my-12">
          <div className="p-10 sm:p-14 border border-dashed border-[#B8913A]/40 rounded-xl bg-white dark:bg-[#1E191A] text-center max-w-lg mx-auto shadow-xs">
            <div className="size-16 rounded-full bg-[#FAF6EE] dark:bg-[#2A2425] flex items-center justify-center mx-auto mb-4 border border-[#B8913A]/25">
              <Heart className="size-8 text-[#B8913A]" strokeWidth={1.5} />
            </div>
            <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-2 mb-6 leading-relaxed">
              Explore our master artisan weaves and ready-to-wear collections. Tap the heart icon on any fabric to save it here for later.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#6B1E2E] hover:bg-[#521623] text-white text-xs font-semibold uppercase tracking-widest shadow-md transition-all"
            >
              <span>Explore All Collections</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Recommended products preview */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-['Playfair_Display'] text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                    Trending Handlooms & Silhouettes
                  </h4>
                  <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                    Popular selections from our Ambattur, Chennai showroom.
                  </p>
                </div>
                <Link
                  to="/shop"
                  className="text-xs font-semibold uppercase tracking-wider text-[#B8913A] hover:underline"
                >
                  View Shop →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openProduct(p)}
                    className="p-3 border border-[#E5DAC4] dark:border-[#B8913A]/20 rounded-lg bg-white dark:bg-[#1E191A] cursor-pointer hover:border-[#B8913A] transition-all group"
                  >
                    <div className="aspect-3/4 rounded overflow-hidden bg-[#FAF6EE] mb-2.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    </div>
                    <h5 className="font-medium text-xs truncate group-hover:text-[#B8913A] transition-colors">
                      {p.name}
                    </h5>
                    <p className="text-xs font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mt-1">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistedItems.map((product) => {
              const availableSizes: string[] =
                Array.isArray(product.sizes) && product.sizes.length > 0
                  ? product.sizes
                  : product.category === "Saree"
                    ? ["Free Size"]
                    : ["S", "M", "L", "XL"];

              const currentSize = selectedSizes[product.id] || availableSizes[0] || "Standard";
              const originalPrice = product.originalPrice ? Number(product.originalPrice) : undefined;
              const hasDiscount = originalPrice && originalPrice > product.price;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col rounded-lg border border-[#E5DAC4] dark:border-[#B8913A]/25 bg-white dark:bg-[#1E191A] shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-3/4 w-full bg-[#FAF6EE] dark:bg-[#2A2425] overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
                      }}
                    />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0E0E0E]/80 backdrop-blur-xs text-[#FAF6EE] border border-white/10">
                        {product.category || "Authentic Weave"}
                      </span>
                    </div>

                    {/* Remove from wishlist button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(String(product.id))}
                      className="absolute top-3 right-3 z-10 size-8 rounded-full bg-white/90 dark:bg-black/70 hover:bg-rose-500 hover:text-white text-rose-600 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Heart className="size-4 fill-rose-600 group-hover:fill-current" />
                    </button>

                    {/* Fabric tag bottom-left overlay */}
                    {product.fabric && (
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 backdrop-blur-xs text-white">
                          {product.fabric}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h3
                        onClick={() => openProduct(product)}
                        className="font-['Manrope'] text-sm font-semibold text-[#0E0E0E] dark:text-[#FAF6EE] line-clamp-2 hover:text-[#B8913A] transition-colors cursor-pointer"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-['Manrope'] text-base font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                          {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E] line-through">
                            {formatPrice(originalPrice!)}
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {Math.round(((originalPrice! - product.price) / originalPrice!) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Size Selector */}
                      <div className="mt-3">
                        <span className="text-[11px] font-medium text-[#5C5549] dark:text-[#B5AC9E] block mb-1.5">
                          Select Size:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {availableSizes.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeChange(product.id, sz)}
                              className={`px-2.5 py-1 text-[11px] rounded font-medium transition-all ${
                                currentSize === sz
                                  ? "bg-[#6B1E2E] text-white shadow-xs"
                                  : "border border-[#E5DAC4] dark:border-white/10 hover:border-[#B8913A] text-[#0E0E0E] dark:text-[#FAF6EE]"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dual Action Buttons: Add to Cart & Buy Now */}
                    <div className="pt-3 border-t border-[#E5DAC4] dark:border-[#B8913A]/20 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full py-2.5 rounded bg-[#FAF6EE] hover:bg-[#F2ECE1] dark:bg-white/10 dark:hover:bg-white/15 text-[#6B1E2E] dark:text-[#FAF6EE] border border-[#B8913A]/40 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                      >
                        <ShoppingBag className="size-3.5 text-[#B8913A]" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(product, e)}
                        className="w-full py-2.5 rounded bg-[#6B1E2E] hover:bg-[#521623] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                      >
                        <Zap className="size-3.5 text-[#B8913A] fill-[#B8913A]" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom assurance footer */}
          <div className="mt-12 p-6 rounded-xl border border-[#E5DAC4] dark:border-[#B8913A]/25 bg-[#FAF6EE] dark:bg-[#1E191A] grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <PackageCheck className="size-5 text-[#B8913A]" />
              <div className="text-left">
                <h5 className="font-semibold text-xs text-[#0E0E0E] dark:text-[#FAF6EE]">Express Showroom Dispatch</h5>
                <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">Packed directly in Ambattur, Chennai</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <ShieldCheck className="size-5 text-[#B8913A]" />
              <div className="text-left">
                <h5 className="font-semibold text-xs text-[#0E0E0E] dark:text-[#FAF6EE]">100% Authentic Handlooms</h5>
                <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">Pure silks, coordsets & cotton weaves</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="size-5 text-[#B8913A]" />
              <div className="text-left">
                <h5 className="font-semibold text-xs text-[#0E0E0E] dark:text-[#FAF6EE]">Cash on Delivery Available</h5>
                <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">Pay comfortably when parcel arrives</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
