import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteContent } from "@/context/SiteContentContext";

interface HeroBanner {
  id: string | number;
  image: string;
  mobileImage?: string;
  title?: string;
  subtitle?: string;
  alt: string;
  href: string;
}

const HERO_BANNERS: HeroBanner[] = [
  {
    id: 1,
    image: "/hero-banner-3.jpg",
    mobileImage: "/hero-banner-mobile.jpg",
    title: "Timeless Ethnic Elegance",
    subtitle: "Style woven with tradition",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance",
    href: "/shop",
  },
  {
    id: 2,
    image: "/hero-banner-2.png",
    mobileImage: "/hero-banner-mobile.jpg",
    title: "Timeless Ethnic Elegance",
    subtitle: "Style woven with tradition",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Explore Collection",
    href: "/shop",
  },
  {
    id: 3,
    image: "/hero-banner-1.jpg",
    mobileImage: "/hero-banner-mobile.jpg",
    title: "Timeless Ethnic Elegance",
    subtitle: "Style woven with tradition",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Style Woven With Tradition",
    href: "/shop",
  },
];

export function HeroCarousel() {
  const { content } = useSiteContent();
  const banners = useMemo(() => {
    if (content.home.heroBanners && content.home.heroBanners.length > 0) {
      return content.home.heroBanners;
    }
    return HERO_BANNERS;
  }, [content.home.heroBanners]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);

  // Auto-play 5s, pause on hover
  useEffect(() => {
    if (isHovered || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, banners.length]);

  // Ensure currentSlide is within bounds if banners change
  useEffect(() => {
    if (currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [banners.length, currentSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (banners.length <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    } else if (diff < -50) {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  return (
    <section
      aria-label="Hero Banners"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full bg-[#FAF7F2] overflow-hidden select-none border-b border-[rgba(14,14,14,0.06)] m-0 p-0"
    >
      {/* 
        1. BANNER SIZE & RATIO (Mobile: aspect-[3/4] h-[75vh] max-h-[85vh], full width; Desktop: md:aspect-[2/1] md:max-h-[640px])
      */}
      <div className="relative w-full aspect-[3/4] h-[75vh] max-h-[85vh] md:h-auto md:aspect-[2/1] md:max-h-[640px] overflow-hidden bg-[#FAF7F2]">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
          const mobileSrc = (banner as any).mobileImage || banner.image || "/hero-banner-mobile.jpg";
          const headline = (banner as any).title || "Timeless Ethnic Elegance";
          const tagline = (banner as any).subtitle || "Style woven with tradition";

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Link
                to={banner.href || "/shop"}
                className="block w-full h-full relative cursor-pointer"
                aria-label={banner.alt}
              >
                {/* 2. IMAGE FITTING & PERFORMANCE */}
                <picture className="w-full h-full block">
                  <source media="(max-width: 768px)" srcSet={mobileSrc} />
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="w-full h-full object-cover object-[center_top] md:object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </picture>

                {/* 
                  3. TEXT OVERLAY (Active on mobile <= 768px, hidden on desktop md:hidden):
                  - Headline: clamp(32px, 8.5vw, 44px)
                  - Tagline: clamp(14px, 4vw, 18px)
                  - Bottom-center aligned, soft dark gradient
                */}
                <div
                  className="md:hidden absolute inset-x-0 bottom-0 pt-24 pb-8 px-4 flex flex-col items-center justify-end text-center pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.40) 50%, transparent 100%)",
                  }}
                >
                  <h2
                    className="font-['Playfair_Display',serif] font-bold text-[#FAF6EE] tracking-tight leading-[1.1] drop-shadow-md max-w-[92%]"
                    style={{
                      fontSize: "clamp(32px, 8.5vw, 44px)",
                    }}
                  >
                    {headline}
                  </h2>
                  <p
                    className="text-[#FAF6EE]/90 font-light tracking-wide mt-1.5 drop-shadow-sm max-w-[90%]"
                    style={{
                      fontSize: "clamp(14px, 4vw, 18px)",
                    }}
                  >
                    {tagline}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}

        {/* 
          4. SLIDER BEHAVIOR:
          - Dots/indicators centered at bottom, above mobile text area (bottom-28 on mobile, bottom-5 on desktop)
          - Prev/next arrow buttons hidden on mobile
        */}
        {banners.length > 1 && (
          <div className="absolute bottom-28 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 md:gap-2 pointer-events-auto">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentSlide
                    ? "w-5 md:w-8 bg-[#EDBC3D] shadow-xs"
                    : "w-1.5 md:w-2 bg-white/70 hover:bg-white shadow-xs"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
