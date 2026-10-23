import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/SkeletonLoader";

const WishlistPage = lazy(() => import("@/pages/WishlistPage"));

export const Route = createFileRoute("/wishlist")({
  component: WishlistRoute,
  head: () => ({
    meta: [
      { title: "My Wishlist | Padmanabha Fabrics" },
      { name: "description", content: "Your curated list of fine fabrics and ready-to-wear collections." },
    ],
  }),
});

function WishlistRoute() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeaderSkeleton />
        </div>
      }
    >
      <WishlistPage />
    </Suspense>
  );
}
