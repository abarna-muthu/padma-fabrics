import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Saved Wishlist" }]} className="mb-6" />

      <SectionHeading
        kicker="Personal Collection"
        title="Saved Fabrics & Styles"
        description="View all pieces you've curated for upcoming festive occasions and wardrobe updates."
      />

      {wishlistCount === 0 ? (
        <div className="p-12 border border-dashed border-[#B8913A]/40 rounded-lg bg-white dark:bg-[#262022] text-center my-8 max-w-md mx-auto">
          <Heart className="size-12 text-[#B8913A] mx-auto mb-3 opacity-60" />
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
            No Saved Items Yet
          </h3>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-2 mb-6">
            Tap the heart icon on any fabric or ready-to-wear silhouette in our store to save it here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#6B1E2E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#521623] shadow-xs"
          >
            <span>Explore Collections</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="p-8 border border-dashed border-[#B8913A]/40 rounded-lg bg-white/40 dark:bg-white/5 text-center my-6">
          <p className="text-sm text-[#5C5549] dark:text-[#B5AC9E]">
            You have <strong>{wishlistCount}</strong> item(s) in your saved wishlist.
          </p>
          <div className="mt-4">
            <Link
              to="/shop"
              className="inline-block px-5 py-2 rounded-md bg-[#6B1E2E] text-white text-xs font-semibold uppercase tracking-wider"
            >
              Browse More Styles
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
