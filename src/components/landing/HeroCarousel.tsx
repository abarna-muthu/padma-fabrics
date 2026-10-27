import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "./Button";

interface SlideData {
  id: number;
  headline: string;
  tagline: string;
  subtext: string;
  image: string;
  buttonText: string;
  href: string;
  focalY?: number;
  mobileFocalY?: number;
}

const HERO_SLIDES: SlideData[] = [
  {
    id: 1,
    headline: "Indo Fusion",
    tagline: "E D I T",
    subtext: "Effortless and versatile styles made for everyday, travel, and beyond.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=85",
    buttonText: "SHOP NOW",
    href: "/shop?category=Kurtas",
    focalY: 30,
    mobileFocalY: 20,
  },
  {
    id: 2,
    headline: "Pure Silks",
    tagline: "H E R I T A G E",
    subtext: "Artisanal woven silks crafted with timeless Chennai zari work.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&q=85",
    buttonText: "SHOP NOW",
    href: "/shop?category=Saree",
    focalY: 22,
    mobileFocalY: 20,
  },
  {
    id: 3,
    headline: "Modern Sets",
    tagline: "F E S T I V E",
    subtext: "Coordinated silhouettes tailored for intimate celebrations.",
    image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=1600&q=85",
    buttonText: "SHOP NOW",
    href: "/shop?category=Kurta Sets",
    focalY: 30,
    mobileFocalY: 20,
  },
  {
    id: 4,
    headline: "Fluid Drapes",
    tagline: "C O N T E M P O R A R Y",
    subtext: "Breathable chanderis and light organza ensembles for the season.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=85",
    buttonText: "SHOP NOW",
    href: "/shop?category=Dresses",
    focalY: 30,
    mobileFocalY: 20,
  },
  {
    id: 5,
    headline: "Royal Weaves",
    tagline: "E X C L U S I V E",
    subtext: "Limited editions designed to shine from day to dusk.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&q=85",
    buttonText: "SHOP NOW",
    href: "/shop?exclusive=true",
    focalY: 30,
    mobileFocalY: 20,
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);

  // Autoplay 5s, pause on hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    } else if (diff < -50) {
      setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
  };

  return (
    <section
      aria-label="Hero Carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative block w-full overflow-hidden select-none mb-0 pb-0 bg-[#111111] leading-none h-[clamp(420px,40vw,570px)] max-sm:aspect-[4/5] max-sm:h-auto"
    >
      <style>{`
        @media (max-width: 639px) {
          .hero-slide-img {
            object-position: center var(--mobile-focal, 20%) !important;
          }
        }
      `}</style>

      {/* 5 slides with fade transition */}
      {HERO_SLIDES.map((slide, idx) => {
        const isActive = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image: display block, w-full h-full, object-fit: cover, per-slide focal point */}
            <img
              src={slide.image}
              alt={slide.headline}
              className="hero-slide-img block w-full h-full object-cover"
              style={{
                objectPosition: `center ${slide.focalY ?? 30}%`,
                ["--mobile-focal" as any]: `${slide.mobileFocalY ?? 20}%`,
              }}
            />

            {/* Left-to-right gradient overlay (rgba(0,0,0,0.35) to transparent) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none" />

            {/* Left-aligned overlay block ~12% from left, vertically centered */}
            <div className="absolute inset-y-0 left-[6%] md:left-[12%] flex flex-col justify-center max-w-md text-white z-20 pt-8 leading-normal">
              <h1 className="font-['Cormorant_Garamond'] text-[38px] sm:text-[48px] md:text-[56px] font-light leading-[1.05] tracking-[0.06em] drop-shadow-md">
                {slide.headline}
              </h1>
              <p className="font-['Poppins'] text-[13px] md:text-[16px] font-light tracking-[0.5em] text-[#EDBC3D] uppercase mt-1 mb-2.5">
                {slide.tagline}
              </p>
              <p className="font-['Poppins'] text-[12px] md:text-[14px] text-white/90 font-normal leading-relaxed max-w-[320px] mb-6">
                {slide.subtext}
              </p>
              <div>
                <Link to={slide.href}>
                  <Button
                    variant="hero"
                    className="w-[150px] h-[40px] text-[11px] font-bold"
                  >
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* 5 Dots centered 24px from bottom: absolute, bottom: 24px, left: 50%, -translate-x-1/2, z-30 */}
      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2 pointer-events-auto">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-[7px] rounded-full transition-all duration-300 cursor-pointer ${
              i === currentSlide
                ? "w-[24px] bg-white"
                : "w-[7px] bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
