import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CollectionCard {
  id: string;
  number: string;
  name: string;
  caption: string;
  categoryLabel: string;
  tabs: string[];
  shopSearch: {
    category?: string;
    pattern?: string;
    search?: string;
  };
  placeholderBg: string;
  image?: string;
}

export const TABS = [
  "SHOP ALL",
  "EMBROIDERED",
  "FLORAL PRINTS",
  "ETHNIC PRINTS",
  "EVERYDAY WEAR",
] as const;

export type CollectionTab = (typeof TABS)[number];

export const COLLECTION_CARDS: CollectionCard[] = [
  {
    id: "saree-collection",
    number: "01",
    name: "SAREE COLLECTION",
    caption: "The Saree Edit",
    categoryLabel: "THE SAREE EDIT",
    tabs: ["SHOP ALL", "ETHNIC PRINTS", "EMBROIDERED"],
    shopSearch: { category: "Saree" },
    placeholderBg: "from-[#F5EFEB] to-[#EAE0D5]",
  },
  {
    id: "embroidered",
    number: "02",
    name: "EMBROIDERED",
    caption: "Embroidered Elegance",
    categoryLabel: "EMBROIDERED ELEGANCE",
    tabs: ["SHOP ALL", "EMBROIDERED"],
    shopSearch: { pattern: "embroidery", search: "Embroidered" },
    placeholderBg: "from-[#F0ECE6] to-[#E2DDD5]",
  },
  {
    id: "floral-prints",
    number: "03",
    name: "FLORAL PRINTS",
    caption: "Bloom in Style",
    categoryLabel: "BLOOM IN STYLE",
    tabs: ["SHOP ALL", "FLORAL PRINTS"],
    shopSearch: { pattern: "florals", search: "Floral" },
    placeholderBg: "from-[#F7ECE8] to-[#EAD8D1]",
  },
  {
    id: "festive-wear",
    number: "04",
    name: "FESTIVE WEAR",
    caption: "Festive Favourites",
    categoryLabel: "FESTIVE FAVOURITES",
    tabs: ["SHOP ALL", "EMBROIDERED", "ETHNIC PRINTS"],
    shopSearch: { pattern: "embellished", search: "Festive" },
    placeholderBg: "from-[#F4EFE6] to-[#E6DEC9]",
  },
  {
    id: "ethnic-prints",
    number: "05",
    name: "ETHNIC PRINTS",
    caption: "Prints & Patterns",
    categoryLabel: "PRINTS & PATTERNS",
    tabs: ["SHOP ALL", "ETHNIC PRINTS"],
    shopSearch: { pattern: "prints", search: "Print" },
    placeholderBg: "from-[#F3EDE3] to-[#E5DDD0]",
  },
  {
    id: "everyday-wear",
    number: "06",
    name: "EVERYDAY WEAR",
    caption: "Everyday Comfort",
    categoryLabel: "EVERYDAY COMFORT",
    tabs: ["SHOP ALL", "EVERYDAY WEAR", "FLORAL PRINTS"],
    shopSearch: { pattern: "solids", search: "Everyday" },
    placeholderBg: "from-[#EDEBE6] to-[#DDD9D0]",
  },
  {
    id: "kurti-sets",
    number: "07",
    name: "KURTI & SETS",
    caption: "Everyday Ethnic Style",
    categoryLabel: "EVERYDAY ETHNIC STYLE",
    tabs: ["SHOP ALL", "EVERYDAY WEAR", "ETHNIC PRINTS", "EMBROIDERED"],
    shopSearch: { category: "Chudithar", search: "Kurti" },
    placeholderBg: "from-[#F2EDE7] to-[#E2D8CF]",
  },
];

export function ShopByPattern() {
  const [activeTab, setActiveTab] = useState<CollectionTab>("SHOP ALL");
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter collection cards based on active tab
  const displayedCards =
    activeTab === "SHOP ALL"
      ? COLLECTION_CARDS
      : COLLECTION_CARDS.filter((card) => card.tabs.includes(activeTab));

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    if (el.scrollWidth > el.clientWidth) {
      const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      setScrollProgress(Math.min(1, Math.max(0, progress)));
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [displayedCards.length]);

  const scrollBy = (offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleTabClick = (tab: CollectionTab) => {
    setActiveTab(tab);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="relative block w-full bg-[#FCFAF7] py-12 md:py-16 select-none overflow-hidden clear-both isolate border-y border-[#F0ECE4]/80">
      {/* 1. Section Heading */}
      <div className="text-center max-w-2xl mx-auto mb-7 md:mb-8 px-4">
        <span className="block font-['Poppins'] text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.22em] text-[#9F160A] mb-2">
          CURATED FOR YOU
        </span>
        <h2 className="font-['Cormorant_Garamond'] text-[30px] sm:text-[36px] md:text-[42px] font-normal tracking-tight text-[#111111] leading-tight mb-2.5">
          Discover Your Style
        </h2>
        <p className="font-['Poppins'] text-[12px] sm:text-[13px] md:text-[14px] text-[#666666] font-normal leading-relaxed max-w-xl mx-auto">
          From everyday essentials to statement ethnic wear, find pieces that feel uniquely you.
        </p>
      </div>

      {/* 2. Collection Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 md:gap-8 mb-4 px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`font-['Poppins'] text-[11px] md:text-[12px] uppercase tracking-[0.14em] pb-1.5 transition-colors cursor-pointer relative ${
                isActive
                  ? "text-[#111111] font-semibold"
                  : "text-[#777777] hover:text-[#111111] font-medium"
              }`}
            >
              {tab}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#9F160A] transition-all" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar indicator */}
      <div className="w-[140px] h-[3px] bg-[#EAE6DE] mx-auto rounded-full mb-8 overflow-hidden relative">
        <div
          className="h-full bg-[#111111] transition-all duration-150 rounded-full"
          style={{
            width: "35%",
            transform: `translateX(${scrollProgress * 185}%)`,
          }}
        />
      </div>

      {/* 3. Collection Cards Row with Arrows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="relative flex items-center gap-3.5 sm:gap-4 md:gap-4.5 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none px-1 py-2 justify-start xl:justify-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayedCards.map((card) => (
            <Link
              key={card.id}
              to="/shop"
              search={card.shopSearch as any}
              className="flex-[0_0_auto] w-[clamp(175px,46vw,200px)] sm:w-[210px] md:w-[220px] lg:w-[165px] xl:w-[calc((100%-6*16px)/7)] xl:max-w-[175px] h-[380px] sm:h-[420px] md:h-[440px] lg:h-[450px] relative overflow-hidden rounded-[16px] md:rounded-[18px] snap-start bg-[#EAE5DF] group/card block shadow-xs transition-all duration-300 hover:shadow-lg isolate cursor-pointer"
            >
              {/* Full-height image placeholder with portrait proportions & subtle hover zoom */}
              <div className="absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover/card:scale-105 rounded-[inherit]">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-[inherit]"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-b ${card.placeholderBg} flex flex-col items-center justify-center p-6 text-center select-none rounded-[inherit] relative overflow-hidden`}
                  >
                    {/* Subtle luxury watermark pattern */}
                    <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />

                    {/* Minimal refined emblem */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="size-11 rounded-full border border-[#111111]/15 bg-white/40 backdrop-blur-xs flex items-center justify-center mb-2 shadow-2xs">
                        <span className="font-['Cormorant_Garamond'] text-[15px] font-semibold text-[#111111]/45 tracking-widest">
                          {card.number}
                        </span>
                      </div>
                      <span className="font-['Poppins'] text-[9px] uppercase tracking-[0.22em] text-[#111111]/40 font-medium">
                        Editorial Edit
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtle dark gradient overlay at bottom for readable text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none rounded-[inherit]" />

              {/* Card text block: Category label + Collection Title */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-center pointer-events-none z-10">
                <span className="block font-['Poppins'] text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.16em] text-[#EDBC3D] mb-1 drop-shadow-xs">
                  {card.caption}
                </span>
                <h3 className="font-['Poppins'] font-bold text-[13px] sm:text-[14px] md:text-[15px] text-white uppercase tracking-[0.05em] leading-snug drop-shadow-xs">
                  {card.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollBy(-320)}
          disabled={!canScrollLeft}
          aria-label="Previous collections"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-[20] size-[40px] rounded-full bg-white text-[#111111] shadow-[0_2px_12px_rgba(0,0,0,0.12)] border border-[#EAE6DE] items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-5 stroke-[1.5]" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollBy(320)}
          disabled={!canScrollRight}
          aria-label="Next collections"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-[20] size-[40px] rounded-full bg-white text-[#111111] shadow-[0_2px_12px_rgba(0,0,0,0.12)] border border-[#EAE6DE] items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight className="size-5 stroke-[1.5]" />
        </button>
      </div>
    </section>
  );
}

export { ShopByPattern as CollectionShowcase };
export default ShopByPattern;