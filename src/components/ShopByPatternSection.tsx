import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MicroLabel } from "./MicroLabel";

// Real product photos from assets folder
import sageFabric from "@/assets/sage-fabric.jpg";
import womensDress from "@/assets/womens-dress.jpg";
import kidsDress from "@/assets/kids-dress.jpg";
import lehengaPhoto from "@/assets/girls-lehenga.jpg";
import mensShirt from "@/assets/mens-shirt.jpg";
import burgundySilk from "@/assets/burgundy-silk.jpg";
import ivoryBrocade from "@/assets/ivory-brocade.jpg";

/**
 * TODO: Backend currently lacks a dedicated 'pattern' column on the 'products' schema.
 * Representative local pattern collection below links to /shop?pattern=<slug>.
 * Once backend migration adds 'pattern', fetch pattern clusters and representative
 * images dynamically via src/services/api.js.
 */
export const PATTERNS_DATA = [
  {
    number: "01",
    name: "Solids",
    slug: "solids",
    image: sageFabric,
    alt: "Plain solid texture fabric",
  },
  {
    number: "02",
    name: "Embroidery",
    slug: "embroidery",
    image: womensDress,
    alt: "Handcrafted embroidery needlework fabric",
  },
  {
    number: "03",
    name: "Florals",
    slug: "florals",
    image: kidsDress,
    alt: "Artisan floral print motif fabric",
  },
  {
    number: "04",
    name: "Embellished",
    slug: "embellished",
    image: lehengaPhoto,
    alt: "Embellished festive weave fabric with sequin accents",
  },
  {
    number: "05",
    name: "Prints",
    slug: "prints",
    image: mensShirt,
    alt: "Traditional hand-block and artisan geometric print fabric",
  },
  {
    number: "06",
    name: "Zari & Brocade",
    slug: "zari-brocade",
    image: burgundySilk,
    alt: "Intricate gold zari brocade silk weave",
  },
  {
    number: "07",
    name: "Checks & Stripes",
    slug: "checks-stripes",
    image: ivoryBrocade,
    alt: "Woven textured checks and artisanal stripes fabric",
  },
];

export function ShopByPatternSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundary to disable/enable arrow buttons
  const checkScrollBounds = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    // Allow a 2px tolerance for fractional subpixel scaling
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    checkScrollBounds();
    slider.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);

    return () => {
      slider.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, []);

  // Scroll by one tile width
  const scrollByTile = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    // Find the width of the first tile plus gap
    const firstTile = container.querySelector<HTMLElement>("[data-pattern-tile]");
    const tileWidth = firstTile ? firstTile.offsetWidth + 20 : 240;
    const scrollAmount = direction === "left" ? -tileWidth : tileWidth;

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      className="bg-[#F4F0E8] text-[#0E0E0E] py-24 sm:py-32 border-t border-[rgba(14,14,14,0.08)] select-none"
      aria-label="Shop by Pattern"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
          {/* LEFT COLUMN: ~25% width on desktop, stacks on mobile */}
          <div className="lg:w-[26%] lg:shrink-0 flex flex-col justify-between self-stretch">
            <div className="space-y-3">
              <MicroLabel className="mb-1">
                SHOP BY PATTERN
              </MicroLabel>

              {/* Heading: "Find Your" / "Pattern." (second line in light italic serif) */}
              <h2 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.08] text-[#0E0E0E]">
                Find Your <br className="hidden sm:inline" />
                <span className="font-['Cormorant_Garamond'] italic font-light text-[#0E0E0E]">
                  Pattern.
                </span>
              </h2>

              <p className="text-xs sm:text-[14px] font-light text-[#0E0E0E]/70 leading-relaxed max-w-xs pt-1">
                From plain solids to rich zari work.
              </p>
            </div>

            {/* Circular Prev/Next Arrow Buttons (Desktop & Tablet: visible, Mobile: hidden) */}
            <div className="hidden lg:flex items-center gap-3 pt-8 mt-auto">
              <button
                type="button"
                onClick={() => scrollByTile("left")}
                disabled={!canScrollLeft}
                aria-label="Previous patterns"
                className="size-11 rounded-full border border-[rgba(14,14,14,0.2)] hover:border-[#D15608] hover:text-[#D15608] text-[#0E0E0E] flex items-center justify-center transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D15608] active:scale-95"
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </button>

              <button
                type="button"
                onClick={() => scrollByTile("right")}
                disabled={!canScrollRight}
                aria-label="Next patterns"
                className="size-11 rounded-full border border-[rgba(14,14,14,0.2)] hover:border-[#D15608] hover:text-[#D15608] text-[#0E0E0E] flex items-center justify-center transition-all cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D15608] active:scale-95"
              >
                <ChevronRight className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: ~75% width, horizontal slider of pattern tiles */}
          <div className="lg:flex-1 min-w-0">
            <div
              ref={sliderRef}
              tabIndex={0}
              aria-label="Pattern tiles gallery"
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-5 pb-4 no-scrollbar focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D15608] rounded-[2px]"
            >
              {PATTERNS_DATA.map((pattern, idx) => (
                <Link
                  key={pattern.slug}
                  to="/shop"
                  search={{ pattern: pattern.slug } as any}
                  data-pattern-tile
                  style={{ animationDelay: `${idx * 60}ms` }}
                  className="group relative aspect-3/4 rounded-2xl overflow-hidden bg-[#EBE6DC] border border-[rgba(14,14,14,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 block shrink-0 snap-start w-[45vw] min-w-[155px] max-w-[190px] md:w-[31%] md:min-w-[210px] lg:w-[calc(25%-15px)] lg:min-w-[205px] transition-all hover:border-[#D15608] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D15608]"
                >
                  {/* Portrait 3:4 photo with slow zoom on hover (scale 1.04, 700ms) */}
                  <img
                    src={pattern.image}
                    alt={pattern.alt}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-104"
                  />

                  {/* Dark bottom gradient overlay (the only allowed gradient) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                  {/* Number 01/02/03 top-right */}
                  <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
                    <span className="font-mono text-xs font-medium text-white/90 tracking-wider">
                      {pattern.number}
                    </span>
                  </div>

                  {/* Pattern name and "Shop Now →" at bottom-left */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white pointer-events-none">
                    <h3 className="font-['Manrope'] text-base sm:text-lg font-medium tracking-tight leading-snug">
                      {pattern.name}
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-medium text-[#EDBC3D] group-hover:text-white transition-colors">
                      <span>Shop Now</span>
                      <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopByPatternSection;
