import { useState } from "react";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { PopularCategories } from "@/components/landing/PopularCategories";
import { OurBestsellers } from "@/components/landing/OurBestsellers";
import { ShopByOccasion } from "@/components/landing/ShopByOccasion";
import { ShopByPattern } from "@/components/landing/ShopByPattern";
import { LovedByCelebs } from "@/components/landing/LovedByCelebs";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { OnlineExclusive } from "@/components/landing/OnlineExclusive";
import { FindAStoreStrip } from "@/components/landing/FindAStoreStrip";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { MobileBottomNav } from "@/components/landing/MobileBottomNav";
import { LoginModal } from "@/components/landing/LoginModal";
import { SizeSelectorModal } from "@/components/landing/SizeSelectorModal";
import type { LandingProduct } from "@/components/landing/ProductCard";

export function HomePage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [sizeModalProduct, setSizeModalProduct] = useState<LandingProduct | null>(null);

  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleOpenQuickSize = (product: LandingProduct) => {
    setSizeModalProduct(product);
  };

  return (
    <div className="min-h-screen bg-white text-[#222222] font-['Poppins'] flex flex-col relative pb-16 md:pb-0">
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* SECTION 6 - POPULAR CATEGORIES */}
      <PopularCategories />

      {/* SECTION 7 - OUR BESTSELLERS (cream background) */}
      <OurBestsellers onOpenQuickSize={handleOpenQuickSize} />

      {/* SECTION 8 - SHOP BY OCCASION (bento grid) */}
      <ShopByOccasion />

      {/* SECTION 9 - SHOP BY PATTERN (progress bar + tall portrait cards) */}
      <ShopByPattern />

      {/* SECTION 10 - LOVED BY CELEBS (1:2 cards with sparkle) */}
      <LovedByCelebs />

      {/* TESTIMONIALS SECTION (animated marquee with centered focus card) */}
      <TestimonialsSection />

      {/* SECTION 13 - ONLINE EXCLUSIVE (split layout) */}
      <OnlineExclusive onOpenQuickSize={handleOpenQuickSize} />

      {/* SECTION 15 - FIND A STORE STRIP (red pin + gold watermark) */}
      <FindAStoreStrip />

      {/* SECTION 16 - TRUST STRIP (3 pillars with outline SVGs) */}
      <TrustStrip />

      {/* MOBILE BOTTOM NAV (fixed at bottom on mobile) */}
      <MobileBottomNav onOpenLogin={handleOpenLogin} />

      {/* UI-ONLY OVERLAYS */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <SizeSelectorModal
        product={sizeModalProduct}
        isOpen={Boolean(sizeModalProduct)}
        onClose={() => setSizeModalProduct(null)}
      />
    </div>
  );
}

export default HomePage;
