import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/SkeletonLoader";

const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));

export const Route = createFileRoute("/product/$id")({
  component: ProductDetailRoute,
  head: () => ({
    meta: [
      { title: "Product Details | Padmanabha Fabrics" },
      { name: "description", content: "Fine Indian weaves and bespoke artisan craftsmanship." },
    ],
  }),
});

function ProductDetailRoute() {
  const { id } = Route.useParams();

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeaderSkeleton />
        </div>
      }
    >
      <ProductDetailPage id={id} />
    </Suspense>
  );
}
