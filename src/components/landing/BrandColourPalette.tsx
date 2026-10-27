import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { CarouselShell } from "./CarouselShell";
import { ImageSkeleton } from "./ImageSkeleton";

interface PaletteCard {
  id: string;
  name: string;
  tagline: string;
  image: string;
  colorHex: string;
}

const PALETTES: PaletteCard[] = [
  {
    id: "white-whisper",
    name: "WHITE WHISPER",
    tagline: "Soft, timeless, effortlessly elegant.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    colorHex: "#F7F7F7",
  },
  {
    id: "blush-bloom",
    name: "BLUSH BLOOM",
    tagline: "A softer side of everyday elegance.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
    colorHex: "#F2D2D0",
  },
  {
    id: "blue-horizon",
    name: "BLUE HORIZON",
    tagline: "Calm hues, endless possibilities.",
    image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=600&q=80",
    colorHex: "#C5D7E8",
  },
  {
    id: "marigold-magic",
    name: "MARIGOLD MAGIC",
    tagline: "Sunlit shades for radiant days.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
    colorHex: "#F4C430",
  },
  {
    id: "nature-emerald",
    name: "EMERALD MEADOW",
    tagline: "Nature-inspired shades of serene abundance.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    colorHex: "#2E5845",
  },
];

export function BrandColourPalette() {
  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>THE BRAND COLOUR PALETTE</SectionTitle>

      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Carousel of ~4.3 visible lifestyle cards (~330px, 16px gap, subtle border/shadow) */}
        <CarouselShell showArrows={true} ariaLabel="Brand Colour Palette Carousel">
          {PALETTES.map((card) => (
            <Link
              key={card.id}
              to="/shop"
              search={{ colour: card.name.split(" ")[0] } as any}
              className="w-[280px] sm:w-[310px] md:w-[330px] shrink-0 snap-start mr-4 group flex flex-col"
            >
              {/* Collage-style Image + Bold UPPERCASE colour label at lower-left */}
              <div className="w-full aspect-[4/5] overflow-hidden rounded-[14px] bg-[#EDEDED] relative border border-[#E6E6E6] shadow-xs isolate">
                <div className="w-full h-full transition-transform duration-500 group-hover:scale-105 rounded-[inherit]">
                  <ImageSkeleton
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full rounded-[inherit]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white rounded-[inherit]">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full border border-white/60 shadow-xs"
                      style={{ backgroundColor: card.colorHex }}
                    />
                    <h3 className="font-['Poppins'] font-bold text-[14px] uppercase tracking-[0.08em]">
                      {card.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Small centered grey tagline below */}
              <p className="font-['Poppins'] text-[12px] text-[#777777] text-center mt-2.5 px-2">
                {card.tagline}
              </p>
            </Link>
          ))}
        </CarouselShell>
      </div>
    </section>
  );
}
