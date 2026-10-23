import { Breadcrumb } from "@/components/Breadcrumb";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/SkeletonLoader";

interface ProductDetailPageProps {
  id?: string;
}

export function ProductDetailPage({ id }: ProductDetailPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          { label: id ? `Product #${id}` : "Product Details" },
        ]}
        className="mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 border border-[#E5DAC4] dark:border-[#B8913A]/25 rounded-lg bg-white dark:bg-[#262022]">
        {/* Left: Gallery Placeholder */}
        <div className="space-y-4">
          <div className="aspect-3/4 rounded-lg bg-[#FAF6EE] dark:bg-[#1C1819] flex items-center justify-center border border-[#B8913A]/20">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B8913A]">
              Product Image Preview ({id || "ID"})
            </span>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-16 w-16 rounded" />
            <Skeleton className="h-16 w-16 rounded" />
            <Skeleton className="h-16 w-16 rounded" />
          </div>
        </div>

        {/* Right: Product Details Placeholder */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#B8913A]">
              Authentic Chennai Weave
            </span>
            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mt-1.5">
              Handcrafted Artisan Piece #{id || "1"}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">₹1,299</span>
              <span className="text-sm text-[#5C5549] line-through">₹1,899</span>
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-[#B8913A] rounded">
                31% OFF
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-4 leading-relaxed">
              Woven with meticulous care in Menambedu, Ambattur. Features premium tensile strength, breathable natural fiber composition, and timeless cultural motifs.
            </p>
          </div>

          <div className="p-4 border border-dashed border-[#B8913A]/30 rounded bg-[#FAF6EE]/50 dark:bg-black/20 text-center">
            <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
              Product Detail Page Foundation Placeholder.
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <Link
                to="/cart"
                className="px-6 py-2.5 rounded-md bg-[#6B1E2E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#521623]"
              >
                Go to Bag
              </Link>
              <Link
                to="/shop"
                className="px-6 py-2.5 rounded-md border border-[#B8913A] text-[#6B1E2E] dark:text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
