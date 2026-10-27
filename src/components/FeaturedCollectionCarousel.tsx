import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Eye,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatters";
import { productServices } from "@/services/api";
import type { Product } from "@/lib/catalog";

// Demo product IDs and titles to strictly exclude from the featured carousel
const DEMO_IDS = new Set([
  "wine-silk",
  "heritage-silk",
  "sage-cotton",
  "ivory-brocade",
  "linen-shirt",
  "navy-tee",
  "maroon-anarkali",
  "pattu-pavadai",
  "pf-mvi2hcnc",
  "pf-mvi2jlu8",
  "pf-mvp0gyhf",
  "pf-mvp0jhqa",
]);

function isDummyOrDemo(p: any): boolean {
  if (!p) return true;
  const id = String(p.id || "");
  if (DEMO_IDS.has(id)) return true;
  const name = (p.name || "").toLowerCase();
  if (
    name.includes("wine zari") ||
    name.includes("royal indigo") ||
    name.includes("sage buti") ||
    name.includes("heritage silk") ||
    name.includes("linen shirt") ||
    name.includes("navy tee") ||
    name.includes("pattu pavadai") ||
    name.includes("maroon anarkali")
  ) {
    return true;
  }
  const img = p.image || p.imageUrl || p.image_url || "";
  if (
    typeof img === "string" &&
    (img.includes("burgundy-silk") ||
      img.includes("sage-fabric") ||
      img.includes("ivory-brocade") ||
      img.includes("fabric-hero") ||
      img.startsWith("/assets/"))
  ) {
    return true;
  }
  return false;
}

export function FeaturedCollectionCarousel() {
  const { openProduct, activeProducts } = useStore();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active center index
  const [activeIndex, setActiveIndex] = useState(0);

  // Scroll container ref
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Fetch only original uploaded products from backend API with fallback to active catalog
  useEffect(() => {
    let isMounted = true;
    const fetchWomensProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let rawList: any[] = [];
        if (activeProducts && activeProducts.length > 0) {
          rawList = activeProducts.filter((p) => !isDummyOrDemo(p));
        } else {
          const res = await productServices.getAllProducts();
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            rawList = res.data.filter((p) => !isDummyOrDemo(p));
          }
        }

        // Filter exclusively for women's clothing items
        const womensOnly = rawList.filter((p) => {
          const cat = (p.category || p.category_id || "").toLowerCase();
          const name = (p.name || "").toLowerCase();

          // Exclude explicit menswear
          if (cat === "men" || cat === "mens" || name.includes("men's") || name.includes("shirt")) {
            return false;
          }

          const isWomensCategory =
            cat.includes("chudithar") ||
            cat.includes("kurti") ||
            cat.includes("saree") ||
            cat.includes("coordset") ||
            cat.includes("maxi") ||
            cat.includes("2piece") ||
            cat.includes("combo") ||
            cat.includes("dress") ||
            cat.includes("palazzo") ||
            cat.includes("women");

          const isWomensName =
            name.includes("kurti") ||
            name.includes("saree") ||
            name.includes("chudithar") ||
            name.includes("anarkali") ||
            name.includes("suit") ||
            name.includes("dress") ||
            name.includes("lehenga") ||
            name.includes("palazzo") ||
            name.includes("coordset") ||
            name.includes("maxi");

          return isWomensCategory || isWomensName;
        });

        if (isMounted) {
          if (womensOnly.length > 0) {
            setProducts(womensOnly);
            // Default center index
            setActiveIndex(Math.min(1, womensOnly.length - 1));
          } else if (rawList.length > 0) {
            setProducts(rawList);
            setActiveIndex(Math.min(1, rawList.length - 1));
          } else {
            setProducts([]);
          }
        }
      } catch (err: any) {
        console.warn("Featured collection load error:", err);
        if (isMounted) {
          if (activeProducts && activeProducts.length > 0) {
            const safeList = activeProducts.filter((p) => !isDummyOrDemo(p));
            setProducts(safeList);
            setActiveIndex(Math.min(1, safeList.length - 1));
          } else {
            setError("Unable to load featured collection.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWomensProducts();
    return () => {
      isMounted = false;
    };
  }, [activeProducts]);

  // Center the active card inside the slider
  const scrollToCard = useCallback((index: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-carousel-card]");
    if (cards[index]) {
      const card = cards[index];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const containerCenter = container.clientWidth / 2;
      const targetScroll = cardCenter - containerCenter;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  }, []);

  const handlePrev = () => {
    if (products.length === 0) return;
    const nextIdx = activeIndex > 0 ? activeIndex - 1 : products.length - 1;
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    if (products.length === 0) return;
    const nextIdx = activeIndex < products.length - 1 ? activeIndex + 1 : 0;
    scrollToCard(nextIdx);
  };

  // Drag / swipe handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    detectActiveCard();
  };

  // Active index ref for event listeners
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const isWheelingRef = useRef(false);
  const wheelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Wheel event on container for smooth step-by-step card popping
  useEffect(() => {
    const container = sliderRef.current;
    if (!container || products.length === 0) return;

    const onWheel = (e: WheelEvent) => {
      // Dominant delta (vertical wheel is e.deltaY, horizontal trackpad is e.deltaX)
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 15) return;

      const direction = delta > 0 ? 1 : -1;
      const current = activeIndexRef.current;

      // Allow natural vertical page scroll when user is at boundaries
      if (
        (current === 0 && direction < 0) ||
        (current >= products.length - 1 && direction > 0)
      ) {
        return;
      }

      // Inside carousel: prevent default page jump
      e.preventDefault();

      if (isWheelingRef.current) return;
      isWheelingRef.current = true;

      const next = Math.max(0, Math.min(products.length - 1, current + direction));
      scrollToCard(next);

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        isWheelingRef.current = false;
      }, 280);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [products.length, scrollToCard]);

  // Detect which card is currently closest to center on scroll
  const detectActiveCard = useCallback(() => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const cards = container.querySelectorAll<HTMLElement>("[data-carousel-card]");

    let closestIdx = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  }, []);

  useEffect(() => {
    const container = sliderRef.current;
    if (!container) return;

    let timeout: NodeJS.Timeout;
    const onScroll = () => {
      if (isWheelingRef.current) return;
      clearTimeout(timeout);
      timeout = setTimeout(detectActiveCard, 60);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [detectActiveCard]);

  return (
    <section
      className="w-full py-20 sm:py-28 bg-[#FAF7F2] border-b border-[rgba(14,14,14,0.06)] overflow-hidden select-none"
      aria-label="Featured Collection"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===================================================================
            1. CENTERED SECTION HEADING WITH GENEROUS WHITESPACE
           =================================================================== */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#EDBC3D]/30 shadow-2xs mb-3">
            <Sparkles className="size-3 text-[#EDBC3D]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D15608]">
              WOMEN'S ETHNIC & READY-TO-WEAR
            </span>
          </div>

          <h2 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#0E0E0E] leading-tight">
            Featured Collection
          </h2>

          <p className="font-['Manrope'] text-xs sm:text-sm font-light text-[#0E0E0E]/65 uppercase tracking-[0.16em] mt-2">
            Discover styles made for you
          </p>
        </div>

        {/* ===================================================================
            2. CAROUSEL CONTROLS & GALLERY VIEW
           =================================================================== */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden py-6 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[280px] sm:w-[320px] aspect-3/4 rounded-2xl bg-black/5 animate-pulse shrink-0"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(14,14,14,0.08)] max-w-md mx-auto p-8 shadow-xs">
            <p className="text-sm text-[#9F160A] font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#D15608] text-white text-xs uppercase tracking-wider hover:bg-[#9F160A] transition-colors"
            >
              Refresh Collection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[rgba(14,14,14,0.08)] max-w-md mx-auto p-8 shadow-xs">
            <p className="text-sm text-[#0E0E0E]/70 font-light">
              No women's clothing styles found in the catalog right now.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block px-6 py-2.5 rounded-full bg-[#D15608] text-white text-xs uppercase tracking-wider hover:bg-[#9F160A] transition-colors"
            >
              Explore Full Shop
            </Link>
          </div>
        ) : (
          <div className="relative">
            {/* FLOATING PREV / NEXT ARROWS (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center justify-between absolute -top-16 right-0 gap-3 z-30">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous women's style"
                className="size-11 rounded-full border border-[rgba(14,14,14,0.15)] bg-white/90 hover:bg-[#0E0E0E] hover:text-white text-[#0E0E0E] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next women's style"
                className="size-11 rounded-full border border-[rgba(14,14,14,0.15)] bg-white/90 hover:bg-[#0E0E0E] hover:text-white text-[#0E0E0E] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* HORIZONTAL CAROUSEL TRACK */}
            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex items-center gap-6 sm:gap-10 overflow-x-auto py-14 sm:py-20 px-4 sm:px-16 no-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {products.map((product, idx) => {
                const isActive = idx === activeIndex;
                const isFavorite = wishlist.includes(String(product.id));
                const productImg =
                  product.image ||
                  (product as any).imageUrl ||
                  (product as any).image_url ||
                  "/placeholder.svg";

                const sizes =
                  Array.isArray(product.sizes) && product.sizes.length > 0
                    ? product.sizes
                    : ["S", "M", "L", "XL"];

                return (
                  <div
                    key={product.id || idx}
                    data-carousel-card
                    onClick={() => {
                      if (isActive) {
                        openProduct(product);
                      } else {
                        scrollToCard(idx);
                      }
                    }}
                    style={{
                      transition:
                        "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 450ms ease, opacity 350ms ease, border-color 350ms ease",
                    }}
                    className={`group relative shrink-0 snap-center cursor-pointer rounded-2xl overflow-hidden ${
                      isActive
                        ? "w-[80vw] sm:w-[340px] md:w-[380px] lg:w-[410px] z-30 scale-[1.03] sm:scale-[1.06] -translate-y-3 sm:-translate-y-4 opacity-100 shadow-[0_24px_50px_-12px_rgba(14,14,14,0.28),0_0_25px_rgba(209,86,8,0.22)] border-2 border-[#D15608] ring-2 ring-[#EDBC3D]/30 bg-white"
                        : "w-[74vw] sm:w-[290px] md:w-[320px] lg:w-[340px] z-10 scale-100 translate-y-0 opacity-100 shadow-md border border-[rgba(14,14,14,0.12)] bg-white hover:border-[#D15608]/50 hover:shadow-lg"
                    }`}
                  >
                    {/* PRODUCT IMAGE CONTAINER */}
                    <div className="relative aspect-3/4 w-full overflow-hidden bg-[#F4EFEA] rounded-t-2xl">
                      <img
                        src={productImg}
                        alt={product.name}
                        loading="lazy"
                        className={`w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                          isActive ? "group-hover:scale-106 scale-102" : "group-hover:scale-104 scale-100"
                        }`}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = (product as any).imageUrl || (product as any).image_url || product.image;
                          if (fallback && target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                      />

                      {/* Subtle Dark Gradient Overlay for Contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                      {/* Top Badges: Category & Editor Tag */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] bg-white/95 text-[#0E0E0E] backdrop-blur-xs shadow-2xs">
                          {product.category || "Women's Wear"}
                        </span>

                        {isActive ? (
                          <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] bg-[#0E0E0E] text-[#EDBC3D] border border-[#EDBC3D]/50 shadow-md flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                            <Sparkles className="size-2.5 text-[#EDBC3D]" />
                            <span>POP LOOK</span>
                          </span>
                        ) : product.badge && typeof product.badge === "string" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.15em] bg-[#EDBC3D] text-[#0E0E0E] shadow-2xs">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Wishlist Heart Button (Top-Right under badge) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(String(product.id), product.name);
                        }}
                        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute bottom-3.5 right-3.5 size-9 sm:size-10 rounded-full bg-white/95 hover:bg-white text-[#0E0E0E] flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-90 cursor-pointer z-10 touch-manipulation"
                      >
                        <Heart
                          className={`size-4 transition-colors ${
                            isFavorite
                              ? "fill-[#9F160A] text-[#9F160A]"
                              : "text-[#0E0E0E] hover:text-[#9F160A]"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>

                      {/* Quick Add To Bag Pill on Hover (Visible on Active Card) */}
                      <div className="absolute bottom-3.5 left-3.5 z-10 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(
                              product,
                              sizes[0] || "Standard",
                              1,
                              product.colour,
                              product.image,
                              product.price,
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#D15608] text-white hover:bg-[#9F160A] transition-all text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider shadow-md cursor-pointer active:scale-95 touch-manipulation whitespace-nowrap"
                        >
                          <ShoppingBag className="size-3" strokeWidth={1.5} />
                          <span>Quick Add</span>
                        </button>
                      </div>
                    </div>

                    {/* PRODUCT DETAILS (Below Image) */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between space-y-2.5">
                      <div className="space-y-1">
                        <h3 className="font-['Manrope'] text-sm sm:text-base font-semibold text-[#0E0E0E] tracking-tight line-clamp-1 group-hover:text-[#D15608] transition-colors">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="text-[11px] text-[#0E0E0E]/60 font-light line-clamp-1">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* Available Size Chips */}
                      {sizes && sizes.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-[#0E0E0E]/50 uppercase tracking-wider mr-1">
                            Sizes:
                          </span>
                          {sizes.slice(0, 4).map((sz: string) => (
                            <span
                              key={sz}
                              className="px-2 py-0.5 rounded-sm bg-black/5 text-[10px] font-medium text-[#0E0E0E]/80 border border-black/5"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price & View Action */}
                      <div className="pt-2 border-t border-[rgba(14,14,14,0.06)] flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-['Manrope'] text-base sm:text-lg font-bold text-[#0E0E0E]">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-[11px] text-[#0E0E0E]/50 font-light">
                            / {product.unit || "piece"}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-[#D15608] group-hover:translate-x-1 transition-transform">
                          <span>View Details</span>
                          <Eye className="size-3" strokeWidth={1.5} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION DOTS */}
            <div className="flex items-center justify-center gap-1.5 pt-6">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToCard(idx)}
                  aria-label={`Go to style ${idx + 1}`}
                  className="py-2.5 px-1 flex items-center justify-center cursor-pointer touch-manipulation"
                >
                  <span
                    className={`h-1.5 rounded-full transition-all block ${
                      idx === activeIndex
                        ? "w-8 bg-[#D15608]"
                        : "w-2.5 bg-[#0E0E0E]/20 hover:bg-[#0E0E0E]/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedCollectionCarousel;
