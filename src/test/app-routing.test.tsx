import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches a page for / instead of falling back to not found", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).toBe("/");
  });

  it("matches a page for /about instead of falling back to not found", () => {
    const matches = router.matchRoutes("/about");
    expect(matches.at(-1)?.routeId).toBe("/about");
  });

  it("matches a page for /shop instead of falling back to not found", () => {
    const matches = router.matchRoutes("/shop");
    expect(matches.at(-1)?.routeId).toBe("/shop");
  });

  it("matches a page for /contact instead of falling back to not found", () => {
    const matches = router.matchRoutes("/contact");
    expect(matches.at(-1)?.routeId).toBe("/contact");
  });

  it("matches protected admin route /admin", () => {
    const matches = router.matchRoutes("/admin");
    expect(matches.at(-1)?.routeId).toBe("/admin/");
  });

  it("matches admin login route /admin/login", () => {
    const matches = router.matchRoutes("/admin/login");
    expect(matches.at(-1)?.routeId).toBe("/admin/login");
  });
});
