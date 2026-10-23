import { SectionHeading } from "@/components/SectionHeading";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGridSkeleton } from "@/components/SkeletonLoader";

export function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Shop Fabrics & Collections" }]} className="mb-6" />

      <SectionHeading
        kicker="Textile Catalog"
        title="Explore All Weaves & Silhouettes"
        description="Filter by Saree, Chudithar, Coordset, Maxi, Nighty, Chudithar Top, 2piece, and Combo Dresses."
      />

      <div className="p-8 border border-dashed border-[#B8913A]/40 rounded-lg bg-white/40 dark:bg-white/5 my-6 text-center">
        <span className="text-xs uppercase font-bold tracking-widest text-[#B8913A]">
          Catalog Grid Placeholder
        </span>
        <p className="text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-1">
          Ready for category filter pills, sorting options, and interactive ProductCards.
        </p>
      </div>

      <ProductGridSkeleton count={4} />
    </div>
  );
}

export default ShopPage;
