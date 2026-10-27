import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { ImageSkeleton } from "./ImageSkeleton";

export function ShopByOccasion() {
  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>SHOP BY OCCASION</SectionTitle>

      {/* Bento Grid: 3 columns desktop, 2 columns mobile, sizing explicitly to content */}
      <div
        className="max-w-7xl mx-auto grid grid-cols-2 auto-rows-[220px] md:auto-rows-auto md:grid-cols-3 md:grid-rows-2 gap-2.5 h-auto md:h-[clamp(520px,48vw,700px)]"
        style={{
          gridTemplateRows: undefined,
        }}
      >
        {/* 1. Haldi (Col 1, Row 1 on desktop) */}
        <Link
          to="/shop"
          search={{ occasion: "Haldi" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-1 md:row-start-1 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80"
              alt="Haldi"
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              HALDI
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-[#EDBC3D] font-semibold mt-0.5">
              EXPLORE STYLES →
            </span>
          </div>
        </Link>

        {/* 2. Mehndi (Col 1, Row 2 on desktop) */}
        <Link
          to="/shop"
          search={{ occasion: "Mehndi" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-1 md:row-start-2 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src="https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=800&q=80"
              alt="Mehndi"
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              MEHNDI
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-[#EDBC3D] font-semibold mt-0.5">
              EXPLORE STYLES →
            </span>
          </div>
        </Link>

        {/* 3. Wedding (Center tile: Col 2, Row Span 2 on desktop; Col-span 2, Row-span 2 on mobile) */}
        <Link
          to="/shop"
          search={{ occasion: "Wedding" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group col-span-2 row-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=85"
              alt="Wedding"
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white text-center pointer-events-none rounded-[inherit]">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D] mb-1">
              ROYAL COUTURE
            </span>
            <h3 className="font-['Cormorant_Garamond'] text-[28px] md:text-[34px] font-light uppercase tracking-[0.08em] leading-tight mb-2">
              WEDDING
            </h3>
            <div>
              <span className="inline-block px-5 py-2 border border-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-[#111111] transition-colors rounded-[2px]">
                SHOP NOW
              </span>
            </div>
          </div>
        </Link>

        {/* 4. Sangeet (Col 3, Row 1 on desktop) */}
        <Link
          to="/shop"
          search={{ occasion: "Sangeet" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-3 md:row-start-1 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80"
              alt="Sangeet"
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              SANGEET
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-[#EDBC3D] font-semibold mt-0.5">
              EXPLORE STYLES →
            </span>
          </div>
        </Link>

        {/* 5. Festive (Col 3, Row 2 on desktop) */}
        <Link
          to="/shop"
          search={{ occasion: "Festive" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-3 md:row-start-2 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
              alt="Festive"
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              FESTIVE
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-[#EDBC3D] font-semibold mt-0.5">
              EXPLORE STYLES →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
