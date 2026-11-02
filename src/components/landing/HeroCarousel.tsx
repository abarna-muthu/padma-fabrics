import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteContent } from "@/context/SiteContentContext";

interface HeroBanner {
  id: string | number;
  image: string; // Desktop Image (horizontal)
  desktopImage?: string; // Desktop Image alias
  mobileImage?: string; // Mobile Image (vertical, 4:5 ratio)
  title?: string;
  subtitle?: string;
  buttonText?: string;
  alt: string;
  href: string;
}

const HERO_BANNERS: HeroBanner[] = [
  {
    id: 1,
    image: "/hero-banner-3.jpg",
    desktopImage: "/hero-banner-3.jpg",
    mobileImage: "",
    alt: "Padmanabha Fabrics - Diwali Edit, Silhouettes to Host, Shine & Celebrate In",
    href: "/shop",
  },
  {
    id: 2,
    image: "/hero-banner-2.png",
    desktopImage: "/hero-banner-2.png",
    mobileImage: "",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Explore Collection",
    href: "/shop",
  },
  {
    id: 3,
    image: "/hero-banner-1.jpg",
    desktopImage: "/hero-banner-1.jpg",
    mobileImage: "",
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
        Hero Banner Container:
        - Mobile (width up to 767px): Vertical portrait banner with 4:5 aspect ratio (e.g. 1080 x 1350 px)
        - Laptop / Desktop / Tablet (width 768px and above): Horizontal landscape banner (2:1 aspect ratio, max 640px)
      */}
      <div className="relative w-full aspect-[4/5] md:aspect-[2/1] md:max-h-[640px] overflow-hidden bg-[#FAF7F2]">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
          const desktopSrc = (banner as any).desktopImage || banner.image;
          const mobileSrc = (banner as any).mobileImage?.trim()
            ? (banner as any).mobileImage
            : desktopSrc;
          const headline = (banner as any).title;
          const tagline = (banner as any).subtitle;
          const buttonText = (banner as any).buttonText;

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
                {/* 
                  Responsive Banner Image:
                  - Mobile image (portrait 4:5) for screens up to 767px
                  - Desktop image (landscape 2:1) for screens 768px and above
                  - Fallback to desktop image if mobile image is not uploaded
                */}
                <picture className="w-full h-full block">
                  {mobileSrc && (
                    <source media="(max-width: 767px)" srcSet={mobileSrc} />
                  )}
                  <img
                    src={desktopSrc}
                    alt={banner.alt || "Padmanabha Fabrics"}
                    className="w-full h-full object-cover object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </picture>

                {/* Banner Text / Button Overlay (Visible & Clickable if configured) */}
                {(headline || tagline || buttonText) && (
                  <div
                    className="absolute inset-x-0 bottom-0 pt-20 pb-10 md:pb-12 px-5 md:px-10 flex flex-col items-center md:items-start justify-end text-center md:text-left pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
                    }}
                  >
                    {headline && (
                      <h2
                        className="font-['Playfair_Display',serif] font-bold text-[#FAF6EE] tracking-tight leading-[1.1] drop-shadow-md max-w-[92%]"
                        style={{
                          fontSize: "clamp(22px, 5.5vw, 40px)",
                        }}
                      >
                        {headline}
                      </h2>
                    )}
                    {tagline && (
                      <p
                        className="text-[#FAF6EE]/90 font-light tracking-wide mt-1.5 drop-shadow-sm max-w-[90%]"
                        style={{
                          fontSize: "clamp(12px, 3.2vw, 16px)",
                        }}
                      >
                        {tagline}
                      </p>
                    )}
                    {buttonText && (
                      <span className="mt-3 inline-flex items-center justify-center px-5 py-2 rounded-full text-xs md:text-sm font-semibold tracking-wide bg-[#FAF6EE] text-[#1A1A1A] hover:bg-white transition-all shadow-md pointer-events-auto">
                        {buttonText}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>
          );
        })}

        {banners.length > 1 && (
          <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 md:gap-2 pointer-events-auto">
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
