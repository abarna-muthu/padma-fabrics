import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/SkeletonLoader";
import { useStore } from "@/context/StoreContext";
import { reviewServices } from "@/services/api";

// Assets
import silkSareesCategory from "@/assets/silk-sarees-category.jpg";
import chuditharCategory from "@/assets/chudithar-ensembles-category.jpg";
import coordsetsCategory from "@/assets/artisanal-coordsets-category.jpg";
import maxisCategory from "@/assets/flowing-maxis-category.jpg";
import everydayEleganceBanner from "@/assets/everyday-elegance-banner.jpg";
import newStylesBanner from "@/assets/new-styles-banner.jpg";
import burgundySilk from "@/assets/burgundy-silk.jpg";
import ivoryBrocade from "@/assets/ivory-brocade.jpg";
import sageFabric from "@/assets/sage-fabric.jpg";
import shopByPatternBanner from "@/assets/shop-by-pattern-banner.png";

// =========================================================================
// 1. HERO BANNERS DATA (Full-width auto-playing slider)
// =========================================================================
const HERO_SLIDES = [
  {
    id: 1,
    image: "/hero-banner-1.jpg",
    title: "The Festive Edit",
    subtitle: "Style Woven With Authentic South Indian Tradition",
    cta: "Explore Sarees",
    link: "/shop?category=Saree",
  },
  {
    id: 2,
    image: "/hero-banner-2.png",
    title: "Contemporary Sets",
    subtitle: "Bespoke Chudithars & Coordinates for Modern Celebrations",
    cta: "Shop Kurta Sets",
    link: "/shop?category=Chudithar",
  },
  {
    id: 3,
    image: "/hero-banner-3.jpg",
    title: "Handloom Heritage",
    subtitle: "Pure Zari, Breathable Cottons & Everyday Grace",
    cta: "View Collection",
    link: "/shop?search=new",
  },
];

// =========================================================================
// 2. POPULAR CATEGORIES (Circular / rounded-square pills)
// =========================================================================
const POPULAR_CATEGORIES = [
  {
    title: "New Arrivals",
    image: "/hero-banner-1.jpg",
    param: { search: "new" },
  },
  {
    title: "Kurta Sets",
    image: chuditharCategory,
    param: { category: "Chudithar" },
  },
  {
    title: "Silk Sarees",
    image: silkSareesCategory,
    param: { category: "Saree" },
  },
  {
    title: "Co-ord Sets",
    image: coordsetsCategory,
    param: { category: "Coordset" },
  },
  {
    title: "Flowing Dresses",
    image: maxisCategory,
    param: { category: "Maxi" },
  },
  {
    title: "Everyday Tops",
    image: newStylesBanner,
    param: { category: "Chudithar Top" },
  },
  {
    title: "Bottoms",
    image: sageFabric,
    param: { category: "2piece" },
  },
  {
    title: "Festive Combos",
    image: everydayEleganceBanner,
    param: { category: "Combo Dresses" },
  },
];

// =========================================================================
// 3. SHOP BY OCCASION DATA
// =========================================================================
const OCCASIONS = [
  {
    title: "Haldi Celebration",
    image: "/hero-banner-1.jpg",
    subtitle: "Radiant yellows & festive prints",
    param: { search: "yellow" },
  },
  {
    title: "Mehndi Evening",
    image: coordsetsCategory,
    subtitle: "Lush greens & relaxed silhouettes",
    param: { search: "green" },
  },
  {
    title: "Sangeet Night",
    image: silkSareesCategory,
    subtitle: "Zari glamour & shimmer weaves",
    param: { category: "Saree" },
  },
  {
    title: "Bridesmaid Edit",
    image: chuditharCategory,
    subtitle: "Coordinated pastel suits & tunics",
    param: { category: "Chudithar" },
  },
  {
    title: "Everyday Festive",
    image: maxisCategory,
    subtitle: "Effortless comfort for celebrations",
    param: { category: "Maxi" },
  },
  {
    title: "Party & Reception",
    image: ivoryBrocade,
    subtitle: "Opulent brocades & rich jewel tones",
    param: { search: "wine" },
  },
];

// =========================================================================
// 4. SHOP BY PATTERN DATA
// =========================================================================
const PATTERNS = [
  {
    title: "Solid Classics",
    image: burgundySilk,
    tag: "Minimalist & Chic",
    param: { search: "solid" },
  },
  {
    title: "Intricate Embroidery",
    image: chuditharCategory,
    tag: "Threadwork & Zari",
    param: { search: "embroidery" },
  },
  {
    title: "Botanical Florals",
    image: maxisCategory,
    tag: "Fresh Blooming Motifs",
    param: { search: "floral" },
  },
  {
    title: "Embellished & Zari",
    image: silkSareesCategory,
    tag: "Occasion Ready",
    param: { search: "zari" },
  },
  {
    title: "Artisanal Prints",
    image: coordsetsCategory,
    tag: "Traditional Block Prints",
    param: { search: "print" },
  },
];

// =========================================================================
// 5. TREND JOURNAL (BLOG) DATA
// =========================================================================
const BLOG_POSTS = [
  {
    id: 1,
    title: "The Art of Handloom: Weaving Tradition into Modern Wardrobes",
    date: "October 18, 2026",
    excerpt: "Discover why artisanal South Indian silks and soft cotton coordsets are reigning over modern ethnic fashion.",
    image: silkSareesCategory,
    category: "Heritage & Craft",
    link: "/about",
  },
  {
    id: 2,
    title: "5 Festive Silhouettes Every Woman Needs This Wedding Season",
    date: "October 12, 2026",
    excerpt: "From breathable tiered maxis to statement 3-piece anarkalis, here is your definitive festive styling guide.",
    image: everydayEleganceBanner,
    category: "Style Guide",
    link: "/shop?category=Chudithar",
  },
  {
    id: 3,
    title: "Caring for Your Silks & Brocades: Longevity Tips from Master Weavers",
    date: "September 28, 2026",
    excerpt: "Preserve the natural lustre and heirloom finish of your pure zari borders with our master weavers' care secrets.",
    image: ivoryBrocade,
    category: "Fabric Care",
    link: "/about",
  },
];

// =========================================================================
// 6. CUSTOMER TESTIMONIALS DATA
// =========================================================================
const TESTIMONIALS = [
  {
    id: 1,
    name: "Radha Krishnan",
    city: "Chennai",
    rating: 5,
    quote: "Authentic weave and extraordinary fabric texture. The wine silk saree color matched the pictures perfectly! Excellent delivery to Anna Nagar.",
  },
  {
    id: 2,
    name: "Ananya Sundaram",
    city: "Bangalore",
    rating: 5,
    quote: "The coordset fits like a dream! Soft cotton finish, beautiful fall, and the size guide was 100% accurate. My go-to store for ethnic wear.",
  },
  {
    id: 3,
    name: "Dr. Meenakshi Iyer",
    city: "Coimbatore",
    rating: 5,
    quote: "Ordered multiple chudithar sets for my daughter's wedding events. The packaging and material richness exceeded our expectations. Highly recommended!",
  },
  {
    id: 4,
    name: "Pooja Venkatesh",
    city: "Hyderabad",
    rating: 5,
    quote: "Prompt dispatch from Chennai and exceptional drape on the tiered maxi dress. The fabric is light and luxurious for festive gatherings.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { productsList, activeProducts } = useStore();

  // 1. Hero banner slider state
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const nextHeroSlide = () => setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevHeroSlide = () => setCurrentHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // 2. Bestsellers tab state
  const BESTSELLER_TABS = [
    { label: "All", filter: "All" },
    { label: "Kurta Sets", filter: "Chudithar" },
    { label: "Anarkali Sets", filter: "anarkali" },
    { label: "Sarees", filter: "Saree" },
    { label: "Co-ords", filter: "Coordset" },
    { label: "Tops & Tunics", filter: "Chudithar Top" },
    { label: "Sale", filter: "sale" },
  ];

  const [activeTab, setActiveTab] = useState("All");

  const catalog = activeProducts && activeProducts.length > 0 ? activeProducts : productsList;

  // Filter products for bestsellers
  const bestsellersProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    if (activeTab === "All") return catalog.slice(0, 8);

    if (activeTab === "sale") {
      return catalog.filter((p) => p.originalPrice && p.originalPrice > p.price).slice(0, 8);
    }

    if (activeTab === "anarkali") {
      return catalog
        .filter((p) => p.name.toLowerCase().includes("anarkali") || p.description?.toLowerCase().includes("anarkali"))
        .slice(0, 8);
    }

    const filtered = catalog.filter(
      (p) => p.category?.toLowerCase() === activeTab.toLowerCase(),
    );
    return filtered.length > 0 ? filtered.slice(0, 8) : catalog.slice(0, 8);
  }, [catalog, activeTab]);

  // Online exclusive / featured collection (6 items)
  const exclusiveProducts = useMemo(() => {
    if (!catalog || catalog.length === 0) return [];
    return [...catalog].reverse().slice(0, 6);
  }, [catalog]);

  // Pattern slider scroll
  const patternScrollRef = useRef<HTMLDivElement>(null);
  const scrollPatterns = (direction: "left" | "right") => {
    if (patternScrollRef.current) {
      const scrollAmount = 320;
      patternScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Testimonial slider state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const nextTestimonial = () => setCurrentTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setCurrentTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="bg-white text-[#0E0E0E] min-h-screen select-none">
      {/* =========================================================================
          SECTION 1: HERO BANNER SLIDER (Full-width with dots & arrows)
      ========================================================================== */}
      <section className="relative w-full overflow-hidden bg-[#FAF6EE] border-b border-[#EBE6DC]">
        <div className="relative aspect-16/9 sm:aspect-21/9 md:aspect-24/9 lg:aspect-3/1 w-full overflow-hidden">
          {HERO_SLIDES.map((slide, idx) => {
            const isCurrent = currentHeroSlide === idx;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
                  isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
                onClick={() => navigate({ to: slide.link as any })}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent flex items-center p-6 sm:p-12 lg:p-16">
                  <div className="max-w-xl text-white space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-left-6 duration-700">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#EDBC3D]">
                      Padmanabha Fabrics Edit
                    </span>
                    <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-sm">
                      {slide.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-white/90 font-light max-w-md hidden sm:block">
                      {slide.subtitle}
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all">
                        <span>{slide.cta}</span>
                        <ArrowRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevHeroSlide();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/80 hover:bg-white text-[#0E0E0E] flex items-center justify-center shadow-md z-20 cursor-pointer backdrop-blur-xs transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextHeroSlide();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full bg-white/80 hover:bg-white text-[#0E0E0E] flex items-center justify-center shadow-md z-20 cursor-pointer backdrop-blur-xs transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-20">
            {HERO_SLIDES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentHeroSlide(dotIdx)}
                className={`transition-all cursor-pointer rounded-full ${
                  currentHeroSlide === dotIdx
                    ? "w-8 h-2 bg-[#9F160A]"
                    : "w-2 h-2 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: POPULAR CATEGORIES (Circular / Rounded-square cards row)
      ========================================================================== */}
      <section className="py-10 sm:py-14 border-b border-[#EBE6DC] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#0E0E0E]">
              Popular Categories
            </h2>
            <p className="text-xs text-[#5C5549] uppercase tracking-[0.16em] mt-1 font-medium">
              Explore Our Signature Weaves & Silhouettes
            </p>
          </div>

          {/* Horizontal Scroll on Mobile, Flex on Desktop */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center">
            {POPULAR_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => navigate({ to: "/shop", search: cat.param as any })}
                className="flex flex-col items-center gap-2.5 shrink-0 cursor-pointer group"
              >
                <div className="size-20 sm:size-24 md:size-28 rounded-full overflow-hidden border-2 border-[#E5DAC4] group-hover:border-[#9F160A] transition-all p-1 bg-[#FAF6EE] shadow-xs group-hover:scale-105 duration-300">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-xs sm:text-[13px] font-semibold text-[#0E0E0E] group-hover:text-[#9F160A] transition-colors text-center whitespace-nowrap">
                  {cat.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUR BESTSELLERS (Heading + Tabs + 4-col Grid)
      ========================================================================== */}
      <section className="py-12 sm:py-16 bg-[#FAF7F2] border-b border-[#EBE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9F160A]">
              Curated Favorites
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold text-[#0E0E0E] mt-1">
              Our Bestsellers
            </h2>
            <p className="text-xs text-[#5C5549] max-w-md mx-auto mt-1.5 font-light">
              Loved by thousands across India for their fine drape, authentic weave, and bespoke finishes.
            </p>

            {/* Bestseller Filter Tabs (W for Woman style) */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mt-6">
              {BESTSELLER_TABS.map((tab) => {
                const isSelected = activeTab === tab.filter;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(tab.filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9F160A] text-white shadow-sm"
                        : "bg-white text-[#5C5549] hover:text-[#0E0E0E] border border-[#E5DAC4]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-col Desktop / 2-col Mobile Product Grid */}
          {bestsellersProducts.length === 0 ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {bestsellersProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-[#0E0E0E] text-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-white text-xs font-bold uppercase tracking-[0.16em] transition-all cursor-pointer"
            >
              <span>Explore All Bestsellers</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SHOP BY OCCASION & SHOP BY PATTERN
      ========================================================================== */}
      <section className="py-14 sm:py-18 bg-white border-b border-[#EBE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* A. SHOP BY OCCASION */}
          <div>
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9F160A]">
                Celebrate with Padmanabha
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold text-[#0E0E0E] mt-1">
                Shop By Occasion
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {OCCASIONS.map((occ, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate({ to: "/shop", search: occ.param as any })}
                  className="group relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer shadow-sm border border-[#E5DAC4]"
                >
                  <img
                    src={occ.image}
                    alt={occ.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3 text-white">
                    <h3 className="font-['Cormorant_Garamond'] text-base sm:text-lg font-bold leading-tight">
                      {occ.title}
                    </h3>
                    <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                      {occ.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. SHOP BY PATTERN (Horizontal Slider with Arrows) */}
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9F160A]">
                  Textile Artistry
                </span>
                <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-bold text-[#0E0E0E] mt-1">
                  Shop By Pattern & Craft
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollPatterns("left")}
                  className="size-8 rounded-full border border-[#E5DAC4] hover:bg-[#FAF6EE] text-[#0E0E0E] flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollPatterns("right")}
                  className="size-8 rounded-full border border-[#E5DAC4] hover:bg-[#FAF6EE] text-[#0E0E0E] flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div
              ref={patternScrollRef}
              className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-none"
            >
              {PATTERNS.map((pat, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate({ to: "/shop", search: pat.param as any })}
                  className="w-64 sm:w-72 shrink-0 group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer shadow-sm border border-[#E5DAC4]"
                >
                  <img
                    src={pat.image}
                    alt={pat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#EDBC3D]">
                      {pat.tag}
                    </span>
                    <h3 className="font-['Cormorant_Garamond'] text-xl font-bold leading-tight mt-0.5">
                      {pat.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FEATURED COLLECTION ("Online Exclusive")
      ========================================================================== */}
      <section className="py-14 sm:py-18 bg-[#FAF7F2] border-b border-[#EBE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9F160A]">
                Limited Availability
              </span>
              <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold text-[#0E0E0E] mt-1">
                Online Exclusive Weaves
              </h2>
              <p className="text-xs text-[#5C5549] max-w-lg mt-1 font-light">
                Curated silk borders and contemporary silhouettes available exclusively for direct website delivery.
              </p>
            </div>
            <Link
              to="/shop"
              search={{ search: "exclusive" } as any}
              className="text-xs font-bold uppercase tracking-wider text-[#9F160A] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View All Exclusives</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {exclusiveProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: CUSTOMER REVIEWS (Carousel of Testimonials)
      ========================================================================== */}
      <section className="py-14 sm:py-18 bg-white border-b border-[#EBE6DC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9F160A]">
            Verified Customer Stories
          </span>
          <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold text-[#0E0E0E] mt-1 mb-8">
            Loved Across India
          </h2>

          <div className="relative bg-[#FAF7F2] rounded-2xl p-6 sm:p-10 border border-[#EBE6DC] shadow-xs">
            <div className="flex justify-center mb-3 text-[#EDBC3D]">
              {[...Array(TESTIMONIALS[currentTestimonialIndex]!.rating)].map((_, i) => (
                <Star key={i} className="size-4 fill-[#EDBC3D]" />
              ))}
            </div>

            <p className="font-['Cormorant_Garamond'] text-lg sm:text-2xl italic text-[#0E0E0E] leading-relaxed max-w-2xl mx-auto">
              "{TESTIMONIALS[currentTestimonialIndex]!.quote}"
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="size-10 rounded-full bg-[#9F160A] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {TESTIMONIALS[currentTestimonialIndex]!.name.charAt(0)}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-[#0E0E0E]">
                  {TESTIMONIALS[currentTestimonialIndex]!.name}
                </h4>
                <p className="text-[11px] text-[#5C5549]">
                  Verified Customer · {TESTIMONIALS[currentTestimonialIndex]!.city}
                </p>
              </div>
            </div>

            {/* Review Navigation Arrows */}
            <button
              type="button"
              onClick={prevTestimonial}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white border border-[#E5DAC4] text-[#0E0E0E] flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#FAF6EE]"
              aria-label="Previous review"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-full bg-white border border-[#E5DAC4] text-[#0E0E0E] flex items-center justify-center shadow-xs cursor-pointer hover:bg-[#FAF6EE]"
              aria-label="Next review"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TREND JOURNAL (BLOG CARDS)
      ========================================================================== */}
      <section className="py-14 sm:py-18 bg-[#FAF7F2] border-b border-[#EBE6DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9F160A]">
              Editorial Stories
            </span>
            <h2 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-bold text-[#0E0E0E] mt-1">
              The Trend Journal
            </h2>
            <p className="text-xs text-[#5C5549] uppercase tracking-wider mt-1">
              Styling Notes, Loom Stories & Seasonal Forecasts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate({ to: post.link as any })}
                className="bg-white rounded-xl overflow-hidden border border-[#EBE6DC] shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-16/10 overflow-hidden bg-[#FAF6EE]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#9F160A]">
                      <span>{post.category}</span>
                      <span>·</span>
                      <span className="text-[#5C5549]">{post.date}</span>
                    </div>
                    <h3 className="font-['Cormorant_Garamond'] text-lg sm:text-xl font-bold text-[#0E0E0E] leading-snug mt-1.5 group-hover:text-[#9F160A] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#5C5549] leading-relaxed mt-2 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#9F160A] group-hover:underline">
                      <span>Read More</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TRUST STRIP (Free Shipping, 7-Day Returns, Secure Payments)
      ========================================================================== */}
      <section className="py-8 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#EBE6DC]">
            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <div className="size-12 rounded-full bg-[#FAF6EE] text-[#9F160A] flex items-center justify-center">
                <Truck className="size-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E]">
                Free Shipping
              </h4>
              <p className="text-[11px] text-[#5C5549] max-w-xs">
                Complimentary standard delivery across India on domestic orders over ₹999.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <div className="size-12 rounded-full bg-[#FAF6EE] text-[#9F160A] flex items-center justify-center">
                <RotateCcw className="size-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E]">
                Easy 7-Day Returns
              </h4>
              <p className="text-[11px] text-[#5C5549] max-w-xs">
                Hassle-free exchanges and returns on unworn, original tagged garments.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
              <div className="size-12 rounded-full bg-[#FAF6EE] text-[#9F160A] flex items-center justify-center">
                <ShieldCheck className="size-6" strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E]">
                100% Secure Payments
              </h4>
              <p className="text-[11px] text-[#5C5549] max-w-xs">
                Encrypted transactions via UPI, Credit/Debit cards & Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
