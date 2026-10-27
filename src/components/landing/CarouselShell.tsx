import { useRef, useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dots } from "./Dots";

interface CarouselShellProps {
  children: ReactNode;
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  dotsCount?: number;
  activeDotIndex?: number;
  onDotSelect?: (index: number) => void;
  onScrollProgress?: (progress: number) => void;
  ariaLabel?: string;
}

export function CarouselShell({
  children,
  className = "",
  showArrows = true,
  showDots = false,
  dotsCount = 0,
  activeDotIndex = 0,
  onDotSelect,
  onScrollProgress,
  ariaLabel = "Product Carousel",
}: CarouselShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag-to-scroll state
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    if (onScrollProgress && el.scrollWidth > el.clientWidth) {
      const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      onScrollProgress(Math.min(1, Math.max(0, progress)));
    }
  };

  useEffect(() => {
    const el = containerRef.current;
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
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      scrollBy(-320);
    } else if (e.key === "ArrowRight") {
      scrollBy(320);
    }
  };

  // Pointer drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    isDown.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  return (
    <div
      className="relative group/carousel w-full select-none"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Scrollable Container with Snap */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2 cursor-grab active:cursor-grabbing ${className}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Left Arrow Button (40px white circle, soft shadow, thin chevron, vertically centered, hidden on mobile) */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scrollBy(-360)}
          disabled={!canScrollLeft}
          aria-label="Previous slide"
          className={`hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 size-[40px] rounded-full bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.15)] items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none`}
        >
          <ChevronLeft className="size-5 stroke-[1.5]" />
        </button>
      )}

      {/* Right Arrow Button (40px white circle, soft shadow, thin chevron, vertically centered, hidden on mobile) */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scrollBy(360)}
          disabled={!canScrollRight}
          aria-label="Next slide"
          className={`hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 size-[40px] rounded-full bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.15)] items-center justify-center transition-all duration-200 cursor-pointer hover:bg-[#FAF6EE] hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none`}
        >
          <ChevronRight className="size-5 stroke-[1.5]" />
        </button>
      )}

      {/* Optional Dots */}
      {showDots && dotsCount > 0 && (
        <div className="mt-6 flex justify-center">
          <Dots
            count={dotsCount}
            activeIndex={activeDotIndex}
            onSelect={onDotSelect}
          />
        </div>
      )}
    </div>
  );
}
