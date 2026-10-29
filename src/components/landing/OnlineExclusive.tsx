import { useMemo } from "react";
import { CarouselShell } from "./CarouselShell";
import { ProductCard, type LandingProduct } from "./ProductCard";
import { ImageSkeleton } from "./ImageSkeleton";
import { useStore } from "@/context/StoreContext";
import onlineExclusiveBanner from "@/assets/online-exclusive-banner.jpg";

const EXCLUSIVE_PRODUCTS: LandingProduct[] = [
  {
    id: "ex-1",
    name: "Light Yellow Floral Printed Pure Cotton Straight Kurta With Pants And Dupatta Set",
    price: 3400,
    originalPrice: 4299,
    fabricTag: "Pure Cotton",
    isNew: true,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&q=80",
    availableSizes: ["S", "M", "L", "XL"],
  },
  {
    id: "ex-2",
    name: "Mint Green Chevron Printed Kota Straight Kurta",
    price: 1500,
    originalPrice: 2299,
    fabricTag: "Kota Doria",
    isNew: true,
    image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=700&q=80",
    availableSizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "ex-3",
    name: "Mustard Embroidered A-Line Rayon Kurta",
    price: 1140,
    originalPrice: 2299,
    fabricTag: "Rayon",
    isNew: false,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&q=80",
    availableSizes: ["M", "L", "XL", "XXL"],
  },
  {
    id: "ex-4",
    name: "Rose Pink Jacquard Woven Festive Kurta Ensemble",
    price: 3899,
    originalPrice: 4999,
    fabricTag: "Jacquard",
    isNew: true,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80",
    availableSizes: ["S", "M", "L", "XL"],
  },
];

interface OnlineExclusiveProps {
  onOpenQuickSize?: (p: LandingProduct) => void;
}

export function OnlineExclusive({ onOpenQuickSize }: OnlineExclusiveProps) {
  const { productsList, activeProducts } = useStore();

  const exclusiveProducts: LandingProduct[] = useMemo(() => {
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
          fabricTag: p.fabric || (p.category ? `${p.category}` : "Pure Cotton"),
          isNew: true,
          category: p.category || "",
          availableSizes:
            Array.isArray(p.sizes) && p.sizes.length > 0
              ? p.sizes
              : ["S", "M", "L", "XL"],
        };
      });
    }

    return EXCLUSIVE_PRODUCTS;
  }, [activeProducts, productsList]);

  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 flex flex-col lg:flex-row items-stretch gap-8 lg:gap-10">
        {/* LEFT ~30%: One tall portrait image (~430x700) */}
        <div className="w-full lg:w-[32%] shrink-0">
          <div className="w-full h-[480px] sm:h-[540px] md:h-[580px] lg:h-[640px] rounded-[14px] overflow-hidden bg-[#EDEDED] relative group shadow-sm isolate">
            <ImageSkeleton
              src={onlineExclusiveBanner}
              alt="Online Exclusive New Styles Collection"
              style={{ objectPosition: "top center" }}
              className="w-full h-full rounded-[inherit]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white text-left rounded-[inherit]">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D]">
                DIGITAL ATELIER
              </span>
              <h3 className="font-['Cormorant_Garamond'] text-[28px] md:text-[32px] font-light uppercase tracking-[0.06em] leading-tight">
                ONLINE EXCLUSIVE
              </h3>
            </div>
          </div>
        </div>

        {/* RIGHT ~70%: Heading, subtext, ProductCard carousel (3.5 visible, 24px gap) */}
        <div className="w-full lg:w-[68%] flex flex-col justify-between overflow-hidden">
          <div className="text-left mb-6">
            <h2 className="font-['Poppins'] font-bold uppercase text-[22px] md:text-[24px] text-[#111111] tracking-[0.04em]">
              ONLINE EXCLUSIVE
            </h2>
            <p className="text-[12px] text-[#777777] max-w-[420px] mt-1 leading-relaxed">
              Effortless kurtas and kurta sets that transition seamlessly from day to evening occasions.
            </p>
          </div>

          <div className="w-full">
            <CarouselShell showArrows={true} ariaLabel="Online Exclusive Carousel">
              {exclusiveProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="w-[240px] sm:w-[260px] md:w-[280px] shrink-0 snap-start mr-6"
                >
                  <ProductCard
                    product={prod}
                    onOpenQuickSize={onOpenQuickSize}
                  />
                </div>
              ))}
            </CarouselShell>
          </div>
        </div>
      </div>
    </section>
  );
}
