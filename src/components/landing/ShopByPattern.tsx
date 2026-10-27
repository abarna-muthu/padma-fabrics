import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionTitle } from "./SectionTitle";
import { ImageSkeleton } from "./ImageSkeleton";

interface PatternCard {
  id: string;
  name: string;
  patternType: string;
  image: string;
}

const PATTERNS_LIST: PatternCard[] = [
  {
    id: "p1",
    name: "Pure Solid Silks",
    patternType: "SOLIDS",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80",
  },
  {
    id: "p2",
    name: "Zari Threadwork",
    patternType: "EMBROIDERY",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&q=80",
  },
  {
    id: "p3",
    name: "Garden Floral Prints",
    patternType: "FLORALS",
    image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=500&q=80",
  },
  {
    id: "p4",
    name: "Sequined Jaal",
    patternType: "EMBELLISHED",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80",
  },
  {
    id: "p5",
    name: "Ajrakh & Bagru Prints",
    patternType: "PRINTS",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80",
  },
  {
    id: "p6",
    name: "Royal Brocade Weaves",
    patternType: "EMBELLISHED",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&q=80",
  },
  {
    id: "p7",
    name: "Chanderi Botanical",
    patternType: "FLORALS",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
  },
];

const TABS = [
  { label: "SHOP SOLIDS", filter: "SOLIDS" },
  { label: "SHOP EMBROIDERY", filter: "EMBROIDERY" },
  { label: "SHOP FLORALS", filter: "FLORALS" },
  { label: "SHOP EMBELLISHED", filter: "EMBELLISHED" },
  { label: "SHOP PRINTS", filter: "PRINTS" },
];

export function ShopByPattern() {
  const [activeTab, setActiveTab] = useState("SOLIDS");
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter or highlight patterns based on active tab
  const displayedPatterns = PATTERNS_LIST.filter(
    (p) => activeTab === "ALL" || p.patternType === activeTab || true
  );

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    if (el.scrollWidth > el.clientWidth) {
      const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      setScrollProgress(Math.min(1, Math.max(0, progress)));
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
  }, []);

  const scrollBy = (offset: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleTabClick = (filter: string) => {
    setActiveTab(filter);
    const targetIdx = displayedPatterns.findIndex((p) => p.patternType === filter);
    if (targetIdx !== -1 && scrollRef.current) {
      const cardWidth = 190;
      scrollRef.current.scrollTo({ left: targetIdx * cardWidth, behavior: "smooth" });
    }
  };

  return (
    <section className="relative block w-full bg-white pt-8 md:pt-12 pb-12 select-none overflow-hidden clear-both isolate">
      <SectionTitle>SHOP BY PATTERN</SectionTitle>

      {/* A) Tab row: normal flow, flex, justify-center, gap-6, flex-wrap, mb-4 */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-4 px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.filter;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => handleTabClick(tab.filter)}
              className={`font-['Poppins'] text-[11px] md:text-[12px] uppercase tracking-[0.1em] pb-1 transition-colors cursor-pointer relative ${
                isActive ? "text-[#111111] font-bold" : "text-[#666666] hover:text-[#111111]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D0202B]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar: normal flow below tabs, centered, margin: 0 auto 24px */}
      <div className="w-[140px] h-[3px] bg-[#E6E6E6] mx-auto rounded-full mb-6 overflow-hidden relative">
        <div
          className="h-full bg-[#111111] transition-all duration-150 rounded-full"
          style={{
            width: "35%",
            transform: `translateX(${scrollProgress * 180}%)`,
          }}
        />
      </div>

      {/* Relative wrapper for Carousel + Arrows */}
      <div className="max-w-7xl mx-auto px-4 relative group">
        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="relative flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none px-4 py-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayedPatterns.map((pat) => (
            <Link
              key={pat.id}
              to="/shop"
              search={{ pattern: pat.patternType } as any}
              className="flex-[0_0_auto] w-[clamp(140px,11.5vw,175px)] h-[clamp(380px,35vw,500px)] relative overflow-hidden rounded-[14px] snap-start bg-[#EDEDED] group/card block shadow-xs isolate"
            >
              {/* Card image/skeleton: position: absolute; inset: 0; w-full h-full */}
              <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover/card:scale-105 rounded-[inherit]">
                <ImageSkeleton
                  src={pat.image}
                  alt={pat.name}
                  className="w-full h-full rounded-[inherit]"
                />
              </div>

              {/* Card label block: position: absolute; left: 0; right: 0; bottom: 0; padding: 12px */}
              <div className="absolute inset-x-0 bottom-0 p-3 text-center bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <span className="block font-['Poppins'] text-[10px] font-bold uppercase tracking-[0.1em] text-[#EDBC3D]">
                  {pat.patternType}
                </span>
                <p className="font-['Poppins'] font-semibold text-[13px] text-white leading-tight mt-0.5">
                  {pat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollBy(-320)}
          disabled={!canScrollLeft}
          aria-label="Previous patterns"
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-[2] size-[40px] rounded-full bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.15)] items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-5 stroke-[1.5]" />
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollBy(320)}
          disabled={!canScrollRight}
          aria-label="Next patterns"
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-[2] size-[40px] rounded-full bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.15)] items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronRight className="size-5 stroke-[1.5]" />
        </button>
      </div>
    </section>
  );
}
