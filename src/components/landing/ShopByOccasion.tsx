import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { ImageSkeleton } from "./ImageSkeleton";
import sareeImg from "@/assets/saree-occasion-center.jpg";
import chuditharImg from "@/assets/chudithar-occasion.jpg";
import palazzoImg from "@/assets/palazzo-occasion.jpg";
import maxiImg from "@/assets/maxi-occasion.jpg";

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
        {/* 1. Haldi (Col 1, Row 1 on desktop) - Reserved for user's future image */}
        <Link
          to="/shop"
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

        {/* 2. Chudithar (Col 1, Row 2 on desktop) */}
        <Link
          to="/shop"
          search={{ category: "Chudithar" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-1 md:row-start-2 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src={chuditharImg}
              alt="Chudithar"
              style={{ objectPosition: "top" }}
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              CHUDITHAR
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-[#EDBC3D] font-semibold mt-0.5">
              EXPLORE STYLES →
            </span>
          </div>
        </Link>

        {/* 3. Saree (Center tile: Col 2, Row Span 2 on desktop; Col-span 2, Row-span 2 on mobile) */}
        <Link
          to="/shop"
          search={{ category: "Saree" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group col-span-2 row-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src={sareeImg}
              alt="Saree"
              style={{ objectPosition: "top" }}
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white text-center pointer-events-none rounded-[inherit]">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D] mb-1">
              ROYAL COUTURE
            </span>
            <h3 className="font-['Cormorant_Garamond'] text-[28px] md:text-[34px] font-light uppercase tracking-[0.08em] leading-tight mb-2">
              SAREE
            </h3>
            <div>
              <span className="inline-block px-5 py-2 border border-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-white hover:text-[#111111] transition-colors rounded-[2px]">
                SHOP NOW
              </span>
            </div>
          </div>
        </Link>

        {/* 4. Palazzo (Col 3, Row 1 on desktop) */}
        <Link
          to="/shop"
          search={{ category: "Palazzo" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-3 md:row-start-1 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src={palazzoImg}
              alt="Palazzo"
              style={{ objectPosition: "top" }}
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              PALAZZO
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-[#EDBC3D] font-semibold mt-0.5">
              EXPLORE STYLES →
            </span>
          </div>
        </Link>

        {/* 5. Maxi (Col 3, Row 2 on desktop) */}
        <Link
          to="/shop"
          search={{ category: "Maxi" } as any}
          className="relative block w-full h-full min-h-0 overflow-hidden rounded-[14px] bg-[#EDEDED] group md:col-start-3 md:row-start-2 isolate"
        >
          <div className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 rounded-[inherit]">
            <ImageSkeleton
              src={maxiImg}
              alt="Maxi"
              style={{ objectPosition: "top" }}
              className="w-full h-full rounded-[inherit]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white text-center pointer-events-none rounded-[inherit]">
            <h3 className="font-['Poppins'] font-bold text-[14px] md:text-[16px] uppercase tracking-[0.08em]">
              MAXI
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
