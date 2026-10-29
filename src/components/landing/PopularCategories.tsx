import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { ImageSkeleton } from "./ImageSkeleton";
import { useSiteContent, DEFAULT_POPULAR_CATEGORIES } from "@/context/SiteContentContext";

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
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207105/padma_categories/p5pjfcwp74z22buj17zk.jpg",
    href: "/shop?category=Saree",
  },
  {
    id: "chudithar",
    title: "CHUDITHAR",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207146/padma_categories/hldl0tzbrvgdb05mjmpl.jpg",
    href: "/shop?category=Chudithar",
  },
  {
    id: "coordset",
    title: "COORDSET",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207181/padma_categories/o41bdu5v3onqbxh0o1sh.jpg",
    href: "/shop?category=Coordset",
  },
  {
    id: "maxi",
    title: "MAXI",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207257/padma_categories/la5hitoxfylu0xevoeqv.jpg",
    href: "/shop?category=Maxi",
  },
  {
    id: "nighty",
    title: "NIGHTY",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207301/padma_categories/bi6ccssdb2b8gblqmo03.jpg",
    href: "/shop?category=Nighty",
  },
  {
    id: "chudithar-top",
    title: "CHUDITHAR TOP",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207330/padma_categories/kwupakpq240fuhjbxvbx.jpg",
    href: "/shop?category=Chudithar Top",
  },
  {
    id: "2piece",
    title: "2 PIECE",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207410/padma_categories/yeavgte3wqqxiidrx921.jpg",
    href: "/shop?category=2piece",
  },
  {
    id: "combo-dresses",
    title: "COMBO DRESSES",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207440/padma_categories/tysvr2pz2dttrsnubnf7.jpg",
    href: "/shop?category=Combo Dresses",
  },
  {
    id: "palazzo",
    title: "PALAZZO",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207461/padma_categories/mdmtbankwfema3fcodrd.jpg",
    href: "/shop?category=palazzo",
  },
];

export function PopularCategories() {
  const { content } = useSiteContent();
  const categories = useMemo(() => {
    if (content.home.popularCategories && content.home.popularCategories.length > 0) {
      return content.home.popularCategories;
    }
    return DEFAULT_POPULAR_CATEGORIES;
  }, [content.home.popularCategories]);

  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>POPULAR CATEGORIES</SectionTitle>

      {/* Grid 3 columns x 3 rows (2 columns mobile with last tile spanning both columns if odd) */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {categories.map((cat, idx) => (
          <Link
            key={`${cat.id || idx}-${cat.image}`}
            to={cat.href || `/shop?category=${encodeURIComponent(cat.title)}`}
            className={`group flex flex-col items-center ${
              idx === categories.length - 1 && categories.length % 2 !== 0 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            {/* Tile Image ~340x370 with hover scale 1.04 */}
            <div className="w-full overflow-hidden bg-[#EDEDED] aspect-[340/370] rounded-[14px] isolate">
              <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.04] rounded-[inherit]">
                <ImageSkeleton
                  key={cat.image}
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
