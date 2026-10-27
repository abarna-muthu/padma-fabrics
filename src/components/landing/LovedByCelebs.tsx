import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { CarouselShell } from "./CarouselShell";
import { ImageSkeleton } from "./ImageSkeleton";

interface CelebCard {
  id: string;
  celebName: string;
  outfitName: string;
  image: string;
}

const CELEB_CARDS: CelebCard[] = [
  {
    id: "c1",
    celebName: "PRIYA ANAND",
    outfitName: "Crimson Brocade Saree",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  },
  {
    id: "c2",
    celebName: "TRISHA KRISHNAN",
    outfitName: "Zari Embroidered Anarkali",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
  },
  {
    id: "c3",
    celebName: "SAMANTHA RUTH",
    outfitName: "Chanderi Ivory Kurta Set",
    image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=600&q=80",
  },
  {
    id: "c4",
    celebName: "ADITI RAO HYDARI",
    outfitName: "Handwoven Organza Silk",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
  },
  {
    id: "c5",
    celebName: "NAYANTHARA",
    outfitName: "Heritage Kanchipuram Weave",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
  },
];

export function LovedByCelebs() {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle
        icon={<span className="text-[#C9922B] text-lg animate-pulse">✦</span>}
      >
        LOVED BY CELEBS
      </SectionTitle>

      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Carousel of tall portrait cards (~1:2, 4.5 visible desktop, 1.5 mobile, 16px gap) */}
        <CarouselShell
          showArrows={true}
          showDots={true}
          dotsCount={5}
          activeDotIndex={activeDot}
          onDotSelect={setActiveDot}
          ariaLabel="Celebs Carousel"
        >
          {CELEB_CARDS.map((celeb) => (
            <div
              key={celeb.id}
              className="w-[220px] sm:w-[260px] md:w-[280px] shrink-0 snap-start mr-4 relative group overflow-hidden rounded-[14px] aspect-[1/2] bg-[#EDEDED] isolate"
            >
              <div className="w-full h-full transition-transform duration-500 group-hover:scale-105 rounded-[inherit]">
                <ImageSkeleton
                  src={celeb.image}
                  alt={celeb.celebName}
                  className="w-full h-full rounded-[inherit]"
                />
              </div>

              {/* Bottom dark gradient with celebrity name and "Shop the look" link */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-4 text-white text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#EDBC3D]">
                  SPOTTED IN
                </span>
                <h4 className="font-['Poppins'] font-bold text-[14px] uppercase tracking-[0.04em] mt-0.5">
                  {celeb.celebName}
                </h4>
                <p className="text-[11px] text-white/80 line-clamp-1 mb-2">
                  {celeb.outfitName}
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:text-[#EDBC3D] underline"
                >
                  SHOP THE LOOK →
                </Link>
              </div>
            </div>
          ))}
        </CarouselShell>
      </div>
    </section>
  );
}
