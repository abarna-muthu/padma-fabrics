import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Check,
} from "lucide-react";
import { MicroLabel } from "@/components/MicroLabel";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/SkeletonLoader";
import { FeaturedCollectionCarousel } from "@/components/FeaturedCollectionCarousel";
import { productServices } from "@/services/api";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

// Local imagery from src/assets
import newsletterFabrics from "@/assets/newsletter-fabrics.jpg";
import everydayEleganceBanner from "@/assets/everyday-elegance-banner.jpg";
import newStylesBanner from "@/assets/new-styles-banner.jpg";
import silkSareesCategory from "@/assets/silk-sarees-category.jpg";
import chuditharCategory from "@/assets/chudithar-ensembles-category.jpg";
import coordsetsCategory from "@/assets/artisanal-coordsets-category.jpg";
import maxisCategory from "@/assets/flowing-maxis-category.jpg";
import heroEthnicBanner from "@/assets/hero-ethnic-collection.jpg";


// =========================================================================
// EDITORIAL IMAGE CARDS DATA (Find Your Perfect Style)
// =========================================================================
const EDITORIAL_COLLECTIONS = [
  {
    title: "Silk Sarees & Brocades",
    slug: "Saree",
    image: silkSareesCategory,
    tag: "Loom Heritage",
  },
  {
    title: "Chudithar Ensembles",
    slug: "Chudithar",
    image: chuditharCategory,
    tag: "Everyday & Festive",
  },
  {
    title: "Artisanal Coordsets",
    slug: "Coordset",
    image: coordsetsCategory,
    tag: "Contemporary Fit",
  },
  {
    title: "Flowing Maxis & Silhouettes",
    slug: "Maxi",
    image: maxisCategory,
    tag: "Relaxed Grace",
  },
];

// =========================================================================
// BENEFITS STRIP DATA
// =========================================================================
const BENEFITS = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary delivery on domestic orders over ₹999.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day hassle-free exchange on unworn, tagged apparel.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "100% encrypted checkout via Cards, UPI & NetBanking.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Dedicated assistance via phone & WhatsApp desk.",
    link: "/contact",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { setFilter, activeProducts, categoriesList } = useStore();

  // Featured Products state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch live products through src/services/api.js with fallback to cached store
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productServices.getAllProducts();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
      } else if (activeProducts && activeProducts.length > 0) {
        setProducts(activeProducts);
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      console.warn("API load failed, falling back to cached catalog:", err);
      if (activeProducts && activeProducts.length > 0) {
        setProducts(activeProducts);
      } else {
        setError("Unable to connect to product catalog. Please verify your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProducts && activeProducts.length > 0) {
      setProducts(activeProducts);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [activeProducts]);

  const handleCategoryNav = (catSlug: string) => {
    setFilter(catSlug);
    navigate({ to: "/shop", search: { category: catSlug } as any });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubscribed(true);
    toast.success("Thank you for subscribing to Padmanabha Fabrics style updates.");
    setNewsletterEmail("");
  };

  // Prioritize activeProducts (manually added/managed original products in admin portal)
  const catalogToDisplay = activeProducts && activeProducts.length > 0 ? activeProducts : products;

  // Filter products for "Our Most Loved Styles"
  const filteredProducts = catalogToDisplay.filter((p) => {
    if (!p) return false;
    if (selectedCategory === "All") return true;
    const cat = typeof p.category === "string" ? p.category.toLowerCase() : (p.category ? String(p.category).toLowerCase() : "");
    return cat === selectedCategory.toLowerCase();
  });

  // Strictly single "All" pill with deduplicated category names
  const availableCategories = useMemo(() => {
    const raw = categoriesList && categoriesList.length > 0
      ? categoriesList
      : ["Saree", "Chudithar", "Coordset", "Maxi", "Nighty"];

    const uniqueNonAll = Array.from(
      new Set(
        raw
          .map((c) => (typeof c === "string" ? c.trim() : (c as any)?.name?.trim() || String(c)))
          .filter((c) => c && c.toLowerCase() !== "all")
      )
    );

    return ["All", ...uniqueNonAll];
  }, [categoriesList]);

  return (
    <div className="bg-[#FAF7F2] text-[#0E0E0E] min-h-screen selection:bg-[#B8913A]/20 selection:text-[#0E0E0E]">
      {/* ===================================================================
          1. HERO SECTION — MAIN VISUAL FOCUS (Split Layout)
          Left: ~50% width content on warm ivory.
          Right: ~50% width large fashion photography in neutral tones.
         =================================================================== */}
      <section className="relative w-full bg-[#FAF7F2] border-b border-[rgba(14,14,14,0.06)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT CONTENT: ~50% width */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pr-6">
              <MicroLabel className="text-[#B8913A]">
                THE NEW SEASON
              </MicroLabel>

              <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-[#0E0E0E]">
                Style That Feels <br className="hidden sm:inline" />
                <span className="italic font-light">Like You.</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-[#0E0E0E]/70 font-light leading-relaxed max-w-lg">
                Discover thoughtfully selected styles for every occasion, from everyday essentials to statement pieces handcrafted direct from master looms in Chennai.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#0E0E0E] text-[#F4F0E8] hover:bg-[#B8913A] transition-colors text-xs font-semibold uppercase tracking-[0.08em] sm:tracking-[0.14em] cursor-pointer shadow-xs active:scale-98 text-center w-full sm:w-auto touch-manipulation"
                >
                  Shop Collection
                </Link>

                <Link
                  to="/shop"
                  search={{ filter: "new" } as any}
                  className="inline-flex items-center justify-center px-5 sm:px-8 py-3 sm:py-3.5 rounded-full border border-[rgba(14,14,14,0.25)] text-[#0E0E0E] hover:border-[#0E0E0E] hover:bg-black/5 transition-all text-xs font-semibold uppercase tracking-[0.08em] sm:tracking-[0.14em] cursor-pointer active:scale-98 text-center w-full sm:w-auto touch-manipulation"
                >
                  Explore New Arrivals
                </Link>
              </div>

              {/* Editorial provenance note */}
              <div className="pt-6 border-t border-[rgba(14,14,14,0.08)] flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-6 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-[#0E0E0E]/60">
                <span>Hand-inspected Weaves</span>
                <span>·</span>
                <span>Retail & Wholesale</span>
                <span>·</span>
                <span>Direct Loom Dispatch</span>
              </div>
            </div>

            {/* RIGHT SIDE: Large fashion photograph */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative aspect-[4/5] w-full max-w-[480px] lg:max-w-[500px] rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[rgba(14,14,14,0.08)] shadow-[0_16px_40px_-10px_rgba(30,22,12,0.18),0_6px_20px_rgba(30,22,12,0.08)] group">
                <img
                  src={heroEthnicBanner}
                  alt="Padmanabha Fabrics contemporary ethnic collection"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white text-xs tracking-wider uppercase font-medium bg-black/45 backdrop-blur-xs px-4 py-2.5 rounded-lg border border-white/10">
                  <span>Contemporary Ready-to-Wear</span>
                  <span className="text-[#B8913A]">Edition 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. FEATURED COLLECTION — PREMIUM WOMEN'S FASHION CAROUSEL
         =================================================================== */}
      <FeaturedCollectionCarousel />

      {/* ===================================================================
          4. SHOP BY CATEGORY — EDITORIAL IMAGE CARDS
          "Find Your Perfect Style", eyebrow "EXPLORE COLLECTIONS",
          4 cards in single row (desktop), 2 cols (tablet/mobile), ~4:5 aspect ratio.
         =================================================================== */}
      <section
        className="w-full py-20 sm:py-24 bg-[#F4F0E8] border-b border-[rgba(14,14,14,0.06)] select-none"
        aria-label="Editorial Collections"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
            <MicroLabel className="mb-2">EXPLORE COLLECTIONS</MicroLabel>
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#0E0E0E]">
              Find Your Perfect Style
            </h2>
            <p className="text-xs sm:text-sm text-[#0E0E0E]/70 font-light mt-2 max-w-md mx-auto">
              Curated edits designed for everyday comfort, grand celebrations, and timeless wardrobe elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EDITORIAL_COLLECTIONS.map((col) => (
              <button
                key={col.slug}
                type="button"
                onClick={() => handleCategoryNav(col.slug)}
                className="group relative aspect-4/5 w-full rounded-[2px] overflow-hidden bg-[#EBE6DC] border border-[rgba(14,14,14,0.08)] block text-left cursor-pointer transition-all hover:border-[#B8913A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8913A]"
              >
                <img
                  src={col.image}
                  alt={col.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-104"
                />

                {/* Dark bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Tag Top-Left */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {col.tag}
                  </span>
                </div>

                {/* Title & Explore Link Bottom-Left */}
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white pointer-events-none">
                  <h3 className="font-['Manrope'] text-lg sm:text-xl font-medium tracking-tight leading-snug">
                    {col.title}
                  </h3>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-medium text-[#B8913A] group-hover:text-white transition-colors">
                    <span>Explore Collection</span>
                    <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================================
          4. PROMOTIONAL BANNERS
          Banner A ("Everyday Elegance") & Banner B ("New Styles, Fresh Looks")
          Soft cream/beige background, refined black CTA buttons, balanced layout.
         =================================================================== */}
      <section className="w-full py-16 sm:py-20 bg-[#FAF7F2] border-b border-[rgba(14,14,14,0.06)] relative overflow-hidden">
        {/* Soft atmospheric background lighting / shadow gradient */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#D8BE9A]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#D8BE9A]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* BANNER A: Everyday Elegance */}
            <Link
              to="/shop"
              aria-label="Special Collection - Everyday Elegance - Shop Collection"
              className="group relative block rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[rgba(14,14,14,0.08)] shadow-[0_16px_40px_-10px_rgba(30,22,12,0.18),0_6px_20px_rgba(30,22,12,0.08)] hover:shadow-[0_28px_56px_-12px_rgba(30,22,12,0.28),0_12px_28px_rgba(30,22,12,0.14)] transition-all duration-500 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#B8913A]/50"
            >
              <div className="relative w-full aspect-[1024/705] overflow-hidden">
                <img
                  src={everydayEleganceBanner}
                  alt="Special Collection - Everyday Elegance - Shop Collection"
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* Subtle soft sheen highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </Link>

            {/* BANNER B: New Styles, Fresh Looks */}
            <Link
              to="/shop"
              search={{ filter: "new" } as any}
              aria-label="Just Arrived - New Styles, Fresh Looks - Explore New Arrivals"
              className="group relative block rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[rgba(14,14,14,0.08)] shadow-[0_16px_40px_-10px_rgba(30,22,12,0.18),0_6px_20px_rgba(30,22,12,0.08)] hover:shadow-[0_28px_56px_-12px_rgba(30,22,12,0.28),0_12px_28px_rgba(30,22,12,0.14)] transition-all duration-500 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-[#B8913A]/50"
            >
              <div className="relative w-full aspect-[1024/705] overflow-hidden">
                <img
                  src={newStylesBanner}
                  alt="Just Arrived - New Styles, Fresh Looks - Explore New Arrivals"
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* Subtle soft sheen highlight on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================================
          5. BESTSELLING / FEATURED PRODUCTS
          "Our Most Loved Styles", eyebrow "CUSTOMER FAVOURITES",
          "View All Products →", live product data, loading & empty states.
         =================================================================== */}
      <section
        className="w-full py-20 sm:py-28 bg-[#FAF7F2] border-b border-[rgba(14,14,14,0.06)]"
        aria-label="Our Most Loved Styles"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <MicroLabel className="mb-2">CUSTOMER FAVOURITES</MicroLabel>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#0E0E0E]">
                Our Most Loved Styles
              </h2>
              <p className="text-xs sm:text-sm text-[#0E0E0E]/70 font-light mt-1 max-w-md">
                Handpicked customer favourites crafted with precision weaving and timeless comfort.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-medium text-[#B8913A] hover:underline shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {availableCategories.slice(0, 7).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[34px] touch-manipulation flex items-center justify-center ${
                  selectedCategory === cat
                    ? "bg-[#0E0E0E] text-[#F4F0E8] shadow-xs"
                    : "bg-black/5 text-[#0E0E0E]/80 hover:bg-black/10 border border-[rgba(14,14,14,0.08)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid State Handling */}
          {loading && (!catalogToDisplay || catalogToDisplay.length === 0) ? (
            <ProductGridSkeleton count={8} />
          ) : error && (!catalogToDisplay || catalogToDisplay.length === 0) ? (
            <div className="text-center py-16 px-4 bg-[#EBE6DC]/50 rounded-[2px] border border-[rgba(14,14,14,0.08)]">
              <p className="text-sm text-[#6B1E2E] font-medium">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-6 py-2 rounded-full bg-[#0E0E0E] text-[#F4F0E8] text-xs uppercase tracking-wider hover:bg-[#B8913A] cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-[#EBE6DC]/50 rounded-[2px] border border-[rgba(14,14,14,0.08)]">
              <p className="text-sm text-[#0E0E0E]/70 font-light">
                No products found in this category right now.
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-block px-6 py-2 rounded-full bg-[#0E0E0E] text-[#F4F0E8] text-xs uppercase tracking-wider hover:bg-[#B8913A]"
              >
                Explore Full Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          6. BENEFITS STRIP
          4 evenly spaced items: Free Shipping, Easy Returns, Secure Payments, Customer Support.
         =================================================================== */}
      <section
        className="w-full py-16 bg-[#FAF7F2] border-b border-[rgba(14,14,14,0.06)] select-none"
        aria-label="Customer Benefits"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-4 p-2">
                  <div className="size-11 rounded-full bg-[#EBE6DC] border border-[rgba(14,14,14,0.08)] flex items-center justify-center shrink-0 text-[#0E0E0E]">
                    <Icon className="size-5 text-[#B8913A]" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-['Manrope'] text-sm font-semibold uppercase tracking-wider text-[#0E0E0E]">
                      {b.title}
                    </h4>
                    <p className="text-xs text-[#0E0E0E]/70 font-light leading-relaxed">
                      {b.description}
                    </p>
                    {b.link && (
                      <Link
                        to={b.link}
                        className="text-[11px] font-medium text-[#B8913A] hover:underline uppercase tracking-wider block pt-1"
                      >
                        Contact Team →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          7. NEWSLETTER / PROMOTIONAL SECTION
          Fashion photograph on the left, soft beige content on the right,
          elegant serif heading, email input, black Subscribe button.
         =================================================================== */}
      <section className="w-full py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2px] overflow-hidden bg-[#EBE6DC] border border-[rgba(14,14,14,0.08)] grid grid-cols-1 lg:grid-cols-12 shadow-xs">
            {/* LEFT: Fashion photograph */}
            <div className="lg:col-span-5 relative aspect-4/3 lg:aspect-auto min-h-[300px]">
              <img
                src={newsletterFabrics}
                alt="Padmanabha Fabrics Chennai artisan weaves and brocades"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </div>

            {/* RIGHT: Content & Subscription Form */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-4">
              <MicroLabel className="text-[#B8913A]">STAY IN STYLE</MicroLabel>

              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#0E0E0E] leading-tight">
                A Little More Style in Your Inbox
              </h2>

              <p className="text-xs sm:text-sm text-[#0E0E0E]/70 font-light leading-relaxed max-w-lg">
                Discover new arrivals, collection highlights, and updates from Padmanabha Fabrics. Be the first to preview exclusive artisan weaves and seasonal drops.
              </p>

              {isSubscribed ? (
                <div className="pt-4 flex items-center gap-2 text-sm text-[#2E6F40] font-medium">
                  <Check className="size-4" strokeWidth={2} />
                  <span>You are subscribed to Padmanabha Fabrics style updates.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="pt-3 flex flex-col sm:flex-row gap-2 max-w-md"
                >
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 bg-white border border-[rgba(14,14,14,0.15)] rounded-full px-5 py-3 text-xs text-[#0E0E0E] placeholder:text-[#0E0E0E]/40 focus:outline-none focus:border-[#B8913A] shadow-2xs"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-full bg-[#0E0E0E] text-[#F4F0E8] hover:bg-[#B8913A] transition-colors text-xs uppercase tracking-[0.16em] font-medium cursor-pointer shadow-xs whitespace-nowrap active:scale-98"
                  >
                    Subscribe
                  </button>
                </form>
              )}

              <p className="text-[10px] text-[#0E0E0E]/50 font-light pt-1">
                By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
