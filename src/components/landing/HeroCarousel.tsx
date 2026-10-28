import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteContent } from "@/context/SiteContentContext";

interface HeroBanner {
  id: string | number;
  image: string;
  alt: string;
  href: string;
}

const HERO_BANNERS: HeroBanner[] = [
  {
    id: 1,
    image: "/hero-banner-3.jpg",
    alt: "Padmanabha Fabrics - Timeless Elegance in Every Thread, Premium Sarees",
    href: "/shop",
  },
  {
    id: 2,
    image: "/hero-banner-2.png",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Explore Collection",
    href: "/shop",
  },
  {
    id: 3,
    image: "/hero-banner-1.jpg",
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
      className="relative w-full bg-[#FAF7F2] overflow-hidden select-none border-b border-[rgba(14,14,14,0.06)]"
    >
      <div className="relative w-full aspect-[2/1] max-h-[640px] overflow-hidden bg-[#FAF7F2]">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
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
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </Link>
            </div>
          );
        })}

        {/* Minimal dot indicators centered at bottom */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 pointer-events-auto">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentSlide
                    ? "w-6 sm:w-8 bg-[#EDBC3D] shadow-xs"
                    : "w-1.5 sm:w-2 bg-white/70 hover:bg-white shadow-xs"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
