import { useState, useRef, useEffect, useCallback } from "react";

export interface TestimonialItem {
  id: number | string;
  name: string;
  city?: string;
  initial: string;
  avatar?: string;
  avatarBg: string;
  text: string;
  rating?: number;
}

/**
 * Authentic customer reviews preserved from Padmanabha Fabrics' review collection.
 * Exported so review text and customer details can be easily updated or extended.
 */
export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    name: "BHAVYA",
    city: "Bangalore",
    initial: "B",
    avatarBg: "bg-[#9F160A]", // Brand Deep Wine
    text: "Very nice looking awesome. The fabric drape and stitching quality are truly exceptional!",
    rating: 5,
  },
  {
    id: 2,
    name: "PUNITA",
    city: "Mumbai",
    initial: "P",
    avatarBg: "bg-[#D15608]", // Brand Terracotta
    text: "Very comfortable top - if there were more colours in the same top, I would definitely buy every shade.",
    rating: 5,
  },
  {
    id: 3,
    name: "LAVANYA",
    city: "Delhi",
    initial: "L",
    avatarBg: "bg-[#C2185B]", // Festive Rose
    text: "Such a beautiful dress loved it. Received multiple compliments at the family get-together.",
    rating: 5,
  },
  {
    id: 4,
    name: "RAKSHA",
    city: "Bangalore",
    initial: "R",
    avatarBg: "bg-[#6A1B9A]", // Royal Plum
    text: "Purchased this kurta & it's perfect for Summers. Light breezy and lovely artisan print.",
    rating: 5,
  },
  {
    id: 5,
    name: "AKANKSHA",
    city: "Delhi",
    initial: "A",
    avatarBg: "bg-[#00796B]", // Deep Emerald
    text: "It's so comfortable and I just loved the color.. so bright, radiant, and true to the picture!",
    rating: 5,
  },
  {
    id: 6,
    name: "PRIYADHARSHINI",
    city: "Chennai",
    initial: "P",
    avatarBg: "bg-[#D81B60]", // Rani Pink
    text: "The pure silk texture and zari border work are gorgeous. Excellent showroom experience online.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const isTouchingRef = useRef(false);

  // Triple array for seamless infinite marquee loop
  const loopList = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  // Card dimensions for responsive step calculation
  const getCardMetrics = useCallback(() => {
    if (typeof window === "undefined") return { cardWidth: 180, gap: 20 };
    const w = window.innerWidth;
    if (w < 640) return { cardWidth: 170, gap: 16 };
    if (w < 1024) return { cardWidth: 190, gap: 20 };
    return { cardWidth: 200, gap: 24 };
  }, []);

  // Listen for reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Smooth continuous animation loop via requestAnimationFrame
  useEffect(() => {
    if (prefersReducedMotion) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, 50); // cap delta to prevent jumps
      lastTime = now;

      if (!isHovered && !isTouchingRef.current && trackRef.current && containerRef.current) {
        const { cardWidth, gap } = getCardMetrics();
        const step = cardWidth + gap;
        const singleSetWidth = TESTIMONIALS.length * step;

        // Auto-scroll speed: ~38px per second
        offsetRef.current += (38 * delta) / 1000;

        if (offsetRef.current >= singleSetWidth) {
          offsetRef.current -= singleSetWidth;
        }

        trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;

        // Calculate card currently nearest to the center of the viewport/container
        const containerWidth = containerRef.current.clientWidth;
        const containerCenter = containerWidth / 2;
        const activeIdx =
          Math.round((offsetRef.current + containerCenter - cardWidth / 2) / step) %
          TESTIMONIALS.length;

        setActiveIndex((prev) => (prev !== activeIdx ? activeIdx : prev));
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, prefersReducedMotion, getCardMetrics]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    isTouchingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartXRef.current - currentX;
    touchStartXRef.current = currentX;

    const { cardWidth, gap } = getCardMetrics();
    const step = cardWidth + gap;
    const singleSetWidth = TESTIMONIALS.length * step;

    offsetRef.current += diff;
    if (offsetRef.current >= singleSetWidth) offsetRef.current -= singleSetWidth;
    if (offsetRef.current < 0) offsetRef.current += singleSetWidth;

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const activeIdx =
        Math.round((offsetRef.current + containerWidth / 2 - cardWidth / 2) / step) %
        TESTIMONIALS.length;
      setActiveIndex(activeIdx);
    }
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
    isTouchingRef.current = false;
  };

  return (
    <section
      aria-label="What our clients say"
      className="relative block w-full bg-[#EEF3F9] py-14 sm:py-16 md:py-24 select-none overflow-hidden clear-both isolate"
    >
      {/* Centered White Panel */}
      <div className="max-w-[920px] mx-auto px-4 sm:px-6 relative">
        <div className="relative bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_12px_45px_rgba(0,0,0,0.06)] border border-black/[0.03] pt-10 sm:pt-12 md:pt-14 pb-28 sm:pb-32 md:pb-36 px-6 sm:px-10 text-center overflow-hidden">
          {/* Decorative Large Light-Grey Opening Quote Mark on Left */}
          <span
            aria-hidden="true"
            className="absolute -left-1 sm:left-4 top-2 text-[100px] sm:text-[140px] md:text-[160px] font-serif font-bold text-[#EDEDED] leading-none select-none pointer-events-none -z-0 opacity-80"
          >
            “
          </span>

          {/* Heading Block */}
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-['Poppins'] font-bold text-[24px] sm:text-[28px] md:text-[32px] text-[#222222] tracking-tight leading-tight mb-3">
              What our Clients say!
            </h2>

            {/* Decorative Salmon/Peach Underline: One long rounded bar + one short dash */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-14 sm:w-16 h-1 bg-[#FF9E8A] rounded-full" />
              <span className="w-2.5 h-1 bg-[#FF9E8A] rounded-full" />
            </div>

            <p className="mt-3 text-[12px] sm:text-[13px] text-[#777777] max-w-md mx-auto">
              Real stories and experiences from patrons across India who celebrate fine fabrics with us.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Cards Row Overlapping the Bottom Half of the Panel */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative -mt-20 sm:-mt-24 md:-mt-28 w-full max-w-full overflow-hidden py-6 z-20"
      >
        <div
          ref={trackRef}
          className="flex items-center gap-4 sm:gap-5 md:gap-6 will-change-transform"
          style={{ width: "max-content" }}
        >
          {loopList.map((item, index) => {
            const isCenter = activeIndex === index % TESTIMONIALS.length;

            return (
              <article
                key={`${item.id}-${index}`}
                aria-current={isCenter ? "true" : undefined}
                className={`w-[170px] sm:w-[190px] md:w-[205px] h-[255px] sm:h-[265px] md:h-[275px] shrink-0 bg-white rounded-[16px] p-4 sm:p-4.5 flex flex-col justify-between border border-black/[0.04] select-none transition-all duration-400 ease-out cursor-default relative ${
                  isCenter
                    ? "scale-[1.08] sm:scale-[1.12] -translate-y-2.5 shadow-[0_18px_38px_rgba(0,0,0,0.13)] z-30 ring-1 ring-[#FF9E8A]/40"
                    : "scale-100 translate-y-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] z-10 opacity-90 hover:opacity-100"
                }`}
              >
                {/* 1) Circular Avatar (48px) centered at top */}
                <div className="flex flex-col items-center">
                  <div className="relative size-12 mb-2">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        loading="lazy"
                        className="size-12 rounded-full object-cover shadow-2xs ring-2 ring-[#FF9E8A]/25"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) (fallback as HTMLElement).style.display = "flex";
                        }}
                      />
                    ) : null}

                    {/* Fallback avatar with client initial in brand colour */}
                    <div
                      style={{ display: item.avatar ? "none" : "flex" }}
                      className={`size-12 rounded-full ${item.avatarBg} text-white font-['Poppins'] font-bold text-[18px] items-center justify-center shadow-xs ring-2 ring-[#FF9E8A]/25`}
                      aria-label={item.name}
                    >
                      {item.initial}
                    </div>
                  </div>

                  {/* 2) Client Name below avatar */}
                  <h3 className="font-['Poppins'] font-semibold text-[13px] text-[#222222] tracking-wide uppercase leading-tight text-center line-clamp-1">
                    {item.name}
                  </h3>
                  {item.city && (
                    <span className="text-[10px] text-[#888888] font-normal tracking-wide text-center">
                      {item.city}
                    </span>
                  )}

                  {/* 5 Star Rating */}
                  <div className="flex items-center gap-0.5 mt-1 text-[#EDBC3D] text-[11px]" aria-label="5 out of 5 stars">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                </div>

                {/* 3 & 4) Testimonial text with opening and closing quote marks */}
                <div className="relative flex-1 flex flex-col justify-center px-1 pt-1.5 pb-1 text-left">
                  {/* Top-left opening quote mark */}
                  <span
                    aria-hidden="true"
                    className="font-serif text-[18px] leading-none text-[#D6D6D6] select-none block -mb-1"
                  >
                    “
                  </span>

                  <p className="font-['Poppins'] text-[12px] sm:text-[12.5px] text-[#444444] leading-relaxed line-clamp-4 font-normal">
                    {item.text}
                  </p>

                  {/* Bottom-right closing quote mark */}
                  <span
                    aria-hidden="true"
                    className="font-serif text-[18px] leading-none text-[#D6D6D6] select-none block text-right -mt-1"
                  >
                    ”
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
