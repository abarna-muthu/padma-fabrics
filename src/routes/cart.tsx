import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/SkeletonLoader";

const CartPage = lazy(() => import("@/pages/CartPage"));

export const Route = createFileRoute("/cart")({
  component: CartRoute,
  head: () => ({
    meta: [
      { title: "Shopping Bag | Padmanabha Fabrics" },
      { name: "description", content: "Review your selected fabrics and ready-to-wear items." },
    ],
  }),
});

function CartRoute() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeaderSkeleton />
        </div>
      }
    >
      <CartPage />
    </Suspense>
  );
}
