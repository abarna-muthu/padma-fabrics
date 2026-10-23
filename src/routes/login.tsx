import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PageHeaderSkeleton } from "@/components/SkeletonLoader";

const LoginPage = lazy(() => import("@/pages/LoginPage"));

export const Route = createFileRoute("/login")({
  component: LoginRoute,
  head: () => ({
    meta: [
      { title: "Sign In / Register | Padmanabha Fabrics" },
      { name: "description", content: "Access your customer account, order history, and saved wishlists." },
    ],
  }),
});

function LoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-12">
          <PageHeaderSkeleton />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
