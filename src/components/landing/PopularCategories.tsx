import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { ImageSkeleton } from "./ImageSkeleton";

// Bundled high-res category imagery
import sareeImg from "@/assets/silk-sarees-category.jpg";
import chuditharImg from "@/assets/chudithar-ensembles-category.jpg";
import coordsetImg from "@/assets/artisanal-coordsets-category.jpg";
import maxiImg from "@/assets/flowing-maxis-category.jpg";
import nightyImg from "@/assets/ivory-brocade.jpg";
import comboDressesImg from "@/assets/girls-party-frock.jpg";

interface CategoryItem {
  id: string;
  title: string;
  image: string;
  href: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "saree",
    title: "SAREE",
    image: sareeImg,
    href: "/shop?category=Saree",
  },
  {
    id: "chudithar",
    title: "CHUDITHAR",
    image: chuditharImg,
    href: "/shop?category=Chudithar",
  },
  {
    id: "coordset",
    title: "COORDSET",
    image: coordsetImg,
    href: "/shop?category=Coordset",
  },
  {
    id: "maxi",
    title: "MAXI",
    image: maxiImg,
    href: "/shop?category=Maxi",
  },
  {
    id: "nighty",
    title: "NIGHTY",
    image: nightyImg,
    href: "/shop?category=Nighty",
  },
  {
    id: "chudithar-top",
    title: "CHUDITHAR TOP",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
    href: "/shop?category=Chudithar Top",
  },
  {
    id: "2piece",
    title: "2 PIECE",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792647721/padma_products/xkgskhhlfb7jhekh9rq6.jpg",
    href: "/shop?category=2piece",
  },
  {
    id: "combo-dresses",
    title: "COMBO DRESSES",
    image: comboDressesImg,
    href: "/shop?category=Combo Dresses",
  },
  {
    id: "palazzo",
    title: "PALAZZO",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792664369/padma_products/nb32h1yqb7bhl2xuvsr5.jpg",
    href: "/shop?category=palazzo",
  },
];

export function PopularCategories() {
  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>POPULAR CATEGORIES</SectionTitle>

      {/* Grid 3 columns x 3 rows (2 columns mobile with 9th tile spanning both columns) */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {CATEGORIES.map((cat, idx) => (
          <Link
            key={cat.id}
            to={cat.href}
            className={`group flex flex-col items-center ${
              idx === CATEGORIES.length - 1 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            {/* Tile Image ~340x370 with hover scale 1.04 */}
            <div className="w-full overflow-hidden bg-[#EDEDED] aspect-[340/370] rounded-[14px] isolate">
              <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.04] rounded-[inherit]">
                <ImageSkeleton
                  src={cat.image}
                  alt={cat.title}
                  aspectRatio="340/370"
                  className="w-full h-full rounded-[inherit]"
                />
              </div>
            </div>

            {/* Centered UPPERCASE bold 10-11px caption BELOW the image */}
            <span className="font-['Poppins'] font-bold uppercase text-[10px] md:text-[11px] tracking-[0.08em] text-[#111111] mt-2.5 text-center group-hover:text-[#D0202B] transition-colors">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
