import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/SkeletonLoader";

const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));

export const Route = createFileRoute("/checkout")({
  component: CheckoutRoute,
  head: () => ({
    meta: [
      { title: "Checkout | Padmanabha Fabrics" },
      { name: "description", content: "Fast and secure checkout for fine Indian fabrics." },
    ],
  }),
});

function CheckoutRoute() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeaderSkeleton />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
}
