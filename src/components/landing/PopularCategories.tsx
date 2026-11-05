import { useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { useSiteContent, DEFAULT_POPULAR_CATEGORIES } from "@/context/SiteContentContext";

export function PopularCategories() {
  const { content } = useSiteContent();

  const categories = useMemo(() => {
    if (content.home.popularCategories && content.home.popularCategories.length > 0) {
      return content.home.popularCategories;
    }
    return DEFAULT_POPULAR_CATEGORIES;
  }, [content.home.popularCategories]);

  // Preload and cache category images in browser memory to eliminate flash/flicker
  useEffect(() => {
    if (typeof window !== "undefined" && Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (cat.image) {
          const img = new Image();
          img.src = cat.image;
        }
      });
    }
  }, [categories]);

  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>POPULAR CATEGORIES</SectionTitle>

      {/* Grid 3 columns x 3 rows (2 columns mobile with last tile spanning both columns if odd) */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id || `category-${idx}`}
            to={cat.href || `/shop?category=${encodeURIComponent(cat.title)}`}
            className={`group flex flex-col items-center ${
              idx === categories.length - 1 && categories.length % 2 !== 0 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            {/* Tile Image ~340x370 with hover scale 1.04 */}
            <div className="w-full overflow-hidden bg-[#EDEDED] aspect-[340/370] rounded-[14px] isolate">
              <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.04] rounded-[inherit]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  width="340"
                  height="370"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="w-full h-full object-cover rounded-[inherit] block opacity-100"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>

            {/* Centered UPPERCASE bold 10-11px caption BELOW the image */}
            <span className="font-['Poppins'] font-bold uppercase text-[10px] md:text-[11px] tracking-[0.08em] text-[#111111] mt-2.5 text-center group-hover:text-[#D0202B] transition-colors">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
