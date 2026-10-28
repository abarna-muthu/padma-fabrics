import { useState, useMemo } from "react";
import { SectionTitle } from "./SectionTitle";
import { CarouselShell } from "./CarouselShell";
import { ProductCard, type LandingProduct } from "./ProductCard";
import { useStore } from "@/context/StoreContext";

// Bundled high-res category imagery
import sareeImg from "@/assets/silk-sarees-category.jpg";
import chuditharImg from "@/assets/chudithar-ensembles-category.jpg";
import coordsetImg from "@/assets/artisanal-coordsets-category.jpg";
import maxiImg from "@/assets/flowing-maxis-category.jpg";
import nightyImg from "@/assets/ivory-brocade.jpg";
import comboDressesImg from "@/assets/girls-party-frock.jpg";

interface StoreCategoryTab {
  id: string;
  label: string;
  defaultImage: string;
  categoryKey?: string;
}

const STORE_CATEGORY_TABS: StoreCategoryTab[] = [
  {
    id: "chudithar-top",
    label: "CHUDITHAR TOP",
    categoryKey: "Chudithar Top",
    defaultImage:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
  },
  {
    id: "palazzo",
    label: "PALAZZO",
    categoryKey: "palazzo",
    defaultImage:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792664369/padma_products/nb32h1yqb7bhl2xuvsr5.jpg",
  },
  {
    id: "coordset",
    label: "COORDSET",
    categoryKey: "Coordset",
    defaultImage:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792659785/padma_products/ikle3vv4bhgmbv1aj3pu.jpg",
  },
  {
    id: "2piece",
    label: "2 PIECE",
    categoryKey: "2piece",
    defaultImage:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792647721/padma_products/xkgskhhlfb7jhekh9rq6.jpg",
  },
  {
    id: "chudithar",
    label: "CHUDITHAR",
    categoryKey: "Chudithar",
    defaultImage:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792662337/padma_products/lb5ccdoexcapbuhze89r.jpg",
  },
  {
    id: "saree",
    label: "SAREE",
    categoryKey: "Saree",
    defaultImage: sareeImg,
  },
  {
    id: "maxi",
    label: "MAXI",
    categoryKey: "Maxi",
    defaultImage: maxiImg,
  },
  {
    id: "nighty",
    label: "NIGHTY",
    categoryKey: "Nighty",
    defaultImage: nightyImg,
  },
  {
    id: "western-top",
    label: "WESTERN TOP",
    categoryKey: "Western Top",
    defaultImage:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
  },
  {
    id: "combo-dresses",
    label: "COMBO DRESSES",
    categoryKey: "Combo Dresses",
    defaultImage: comboDressesImg,
  },
];

const FALLBACK_SEED_PRODUCTS: LandingProduct[] = [
  {
    id: "seed-top-1",
    name: "Embroidered Special Glass Top - Rani Pink",
    price: 350,
    originalPrice: 499,
    category: "Chudithar Top",
    fabricTag: "Pure Cotton",
    isNew: true,
    image:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
    availableSizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: "seed-coord-1",
    name: "Elephant Printed Cotton Kurti Pant Co-ord Set",
    price: 650,
    originalPrice: 899,
    category: "Coordset",
    fabricTag: "Pure Cotton",
    isNew: true,
    image:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792659785/padma_products/ikle3vv4bhgmbv1aj3pu.jpg",
    availableSizes: ["M", "L", "XL", "2XL"],
  },
  {
    id: "seed-palazzo-1",
    name: "Ethnic Printed Cotton Palazzo Pants",
    price: 299,
    originalPrice: 450,
    category: "palazzo",
    fabricTag: "Breathable Cotton",
    isNew: true,
    image:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792664369/padma_products/nb32h1yqb7bhl2xuvsr5.jpg",
    availableSizes: ["Free Size", "XL", "2XL"],
  },
  {
    id: "seed-2piece-1",
    name: "Kurti Scott Set / Floral Printed Kurti Pant Set",
    price: 550,
    originalPrice: 750,
    category: "2piece",
    fabricTag: "Rayon Cotton",
    isNew: true,
    image:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792647721/padma_products/xkgskhhlfb7jhekh9rq6.jpg",
    availableSizes: ["S", "M", "L", "XL"],
  },
  {
    id: "seed-chudithar-1",
    name: "Floral Printed & Embroidered 3-Piece Churidar Suit Set",
    price: 750,
    originalPrice: 999,
    category: "Chudithar",
    fabricTag: "Chanderi Cotton",
    isNew: true,
    image:
      "https://res.cloudinary.com/ugzb1wup/image/upload/v1792662337/padma_products/lb5ccdoexcapbuhze89r.jpg",
    availableSizes: ["M", "L", "XL", "2XL"],
  },
  {
    id: "seed-saree-1",
    name: "Artisanal Kanjeevaram Silk Saree with Rich Zari Pallu",
    price: 1850,
    originalPrice: 2499,
    category: "Saree",
    fabricTag: "Pure Silk",
    isNew: true,
    image: sareeImg,
    availableSizes: ["Free Size"],
  },
];

interface OurBestsellersProps {
  onOpenQuickSize?: (p: LandingProduct) => void;
}

export function OurBestsellers({ onOpenQuickSize }: OurBestsellersProps) {
  const { productsList, activeProducts } = useStore();
  const [activeTab, setActiveTab] = useState(STORE_CATEGORY_TABS[0]?.id || "chudithar-top");

  // Map products from store catalog
  const mappedProducts: LandingProduct[] = useMemo(() => {
    const source =
      activeProducts && activeProducts.length > 0
        ? activeProducts
        : productsList && productsList.length > 0
        ? productsList
        : [];

    if (source.length > 0) {
      return source.map((p) => {
        const rawImg = p.image || (p as any).imageUrl || "";
        const validImg =
          rawImg &&
          (rawImg.startsWith("http") ||
            rawImg.startsWith("/") ||
            rawImg.startsWith("data:"))
            ? rawImg
            : "/placeholder.svg";

        return {
          id: p.id,
          name: p.name,
          price: Number(p.price) || 0,
          originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
          image: validImg,
          category: p.category || "",
          fabricTag: (p as any).fabric || p.category || "Authentic",
          isNew: (p as any).badge === "New arrival" || Boolean((p as any).isNew),
          availableSizes: (p.sizes as any) || ["M", "L", "XL", "2XL"],
          colour: p.colour || "",
        };
      });
    }

    return [];
  }, [activeProducts, productsList]);

  // Derive live thumbnail images for tabs from actual store products
  const tabsWithLiveImages = useMemo(() => {
    return STORE_CATEGORY_TABS.map((tab) => {
      if (!tab.categoryKey) {
        // "BESTSELLERS" tab
        const firstWithValidImg = mappedProducts.find(
          (p) => p.image && !p.image.includes("placeholder")
        );
        return {
          ...tab,
          image: firstWithValidImg?.image || tab.defaultImage,
        };
      }

      const normTabKey = tab.categoryKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      const prodInCat = mappedProducts.find((p) => {
        const prodCat = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          prodCat === normTabKey &&
          p.image &&
          !p.image.includes("placeholder") &&
          p.image !== "New arrival"
        );
      });

      return {
        ...tab,
        image: prodInCat?.image || tab.defaultImage,
      };
    });
  }, [mappedProducts]);

  // Filter products by selected category tab
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") {
      return mappedProducts;
    }

    const selectedTab = STORE_CATEGORY_TABS.find((t) => t.id === activeTab);
    const targetKey = (selectedTab?.categoryKey || activeTab)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const matches = mappedProducts.filter((p) => {
      const prodCat = (p.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return prodCat === targetKey || prodCat.includes(targetKey) || targetKey.includes(prodCat);
    });

    return matches;
  }, [mappedProducts, activeTab]);

  return (
    <section className="relative block w-full bg-[#FBF6EE] py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>OUR BESTSELLERS</SectionTitle>

      {/* A) Tab Strip: Real store categories with round image thumbnails */}
      <div className="max-w-6xl mx-auto mb-10 overflow-x-auto scrollbar-none snap-x pb-2">
        <div className="flex items-center justify-start md:justify-center gap-4 sm:gap-6 min-w-max px-2">
          {tabsWithLiveImages.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center group cursor-pointer focus:outline-none"
              >
                {/* Round thumbnail (~85px-115px, 1px border; active: 3px brand-red ring) */}
                <div
                  className={`size-[85px] sm:size-[100px] md:size-[115px] rounded-full overflow-hidden border p-0.5 transition-all duration-300 ${
                    isActive
                      ? "ring-3 ring-[#D0202B] border-[#D0202B] scale-105"
                      : "border-[#E6E6E6] hover:border-[#999999]"
                  }`}
                >
                  <img
                    src={tab.image}
                    alt={tab.label}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = tab.defaultImage || "/placeholder.svg";
                    }}
                  />
                </div>
                {/* Label */}
                <span
                  className={`font-['Poppins'] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.06em] mt-2.5 transition-colors whitespace-nowrap text-center ${
                    isActive ? "text-[#D0202B]" : "text-[#111111] group-hover:text-[#D0202B]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* B) Product Carousel for selected category */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {filteredProducts.length > 0 ? (
          <CarouselShell
            key={activeTab}
            showArrows={true}
            ariaLabel="Bestsellers Product Carousel"
          >
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-[260px] sm:w-[280px] md:w-[300px] lg:w-[320px] shrink-0 snap-start mr-6"
              >
                <ProductCard
                  product={prod}
                  onOpenQuickSize={onOpenQuickSize}
                />
              </div>
            ))}
          </CarouselShell>
        ) : (
          <div className="w-full text-center py-12 px-4 bg-white/60 rounded-[14px] border border-[#E6E6E6]/60 my-4">
            <p className="font-['Poppins'] font-semibold text-sm text-[#555555]">
              No products available in this category yet.
            </p>
            <p className="font-['Poppins'] text-xs text-[#888888] mt-1">
              New arrivals will be listed soon.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab(STORE_CATEGORY_TABS[0]?.id || "chudithar-top")}
              className="mt-4 px-4 py-2 bg-[#D0202B] text-white text-[11px] font-bold uppercase tracking-wider rounded-[2px] hover:bg-[#B01A24] transition-colors cursor-pointer"
            >
              View Chudithar Top
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
