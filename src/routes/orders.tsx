import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/SkeletonLoader";

const OrdersPage = lazy(() => import("@/pages/OrdersPage"));

export const Route = createFileRoute("/orders")({
  component: OrdersRoute,
  head: () => ({
    meta: [
      { title: "My Orders & Tracking | Padmanabha Fabrics" },
      { name: "description", content: "Track your orders, view invoices, and shipment tracking." },
    ],
  }),
});

function OrdersRoute() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <PageHeaderSkeleton />
        </div>
      }
    >
      <OrdersPage />
    </Suspense>
  );
}
