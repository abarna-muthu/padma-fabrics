import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL, categories, collections } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import { PATTERNS_DATA } from "@/components/ShopByPatternSection";

export const Route = createFileRoute("/shop")({
  validateSearch: (
    search: Record<string, unknown> = {},
  ): {
    category?: string | undefined;
    pattern?: string | undefined;
    search?: string | undefined;
    filter?: string | undefined;
    sale?: boolean | string | undefined;
  } => {
    return {
      category: typeof search?.["category"] === "string" ? search["category"] : undefined,
      pattern: typeof search?.["pattern"] === "string" ? search["pattern"] : undefined,
      search: typeof search?.["search"] === "string" ? search["search"] : undefined,
      filter: typeof search?.["filter"] === "string" ? search["filter"] : undefined,
      sale: search?.["sale"] === true || search?.["sale"] === "true" ? true : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shop Collections | Padmanabha Fabrics" },
      {
        name: "description",
        content:
          "Browse our curated collection of sarees, silks, fabrics, shirts, and festive apparel. Retail & wholesale available.",
      },
      { property: "og:title", content: "Shop Collections | Padmanabha Fabrics" },
      {
        property: "og:description",
        content:
          "Explore the curated edit of silks, cottons and occasion wear at Padmanabha Fabrics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const navigate = useNavigate();

  // Safely extract search params
  let searchParams: any = {};
  try {
    searchParams = Route.useSearch() || {};
  } catch {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      searchParams = {
        category: sp.get("category") || undefined,
        pattern: sp.get("pattern") || undefined,
        search: sp.get("search") || undefined,
        filter: sp.get("filter") || undefined,
        sale: sp.get("sale") === "true" || undefined,
      };
    }
  }

  const queryCategory = searchParams?.category;
  const queryPattern = searchParams?.pattern;
  const querySearch = searchParams?.search;
  const queryFilter = searchParams?.filter;
  const querySale = searchParams?.sale;

  const { filter, setFilter, activeProducts = [], categoriesList = [], deletedCategories = [] } = useStore();

  const normalize = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Collect distinct categories, avoiding duplicate variants, ALL, and deleted categories
  const distinctCategories = useMemo(() => {
    const map = new Map<string, string>(); // normKey -> DisplayName

    const isDeleted = (norm: string) => {
      return (
        Array.isArray(deletedCategories) &&
        deletedCategories.some(
          (d) => (d || "").toLowerCase().replace(/[^a-z0-9]/g, "") === norm,
        )
      );
    };

    const addCat = (c: any) => {
      if (!c || typeof c !== "string") return;
      const trimmed = c.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (lower === "all" || lower === "all categories" || lower === ALL.toLowerCase()) {
        return;
      }
      const norm = lower.replace(/[^a-z0-9]/g, "");
      if (!norm || isDeleted(norm)) {
        return;
      }
      if (!map.has(norm)) {
        const display =
          trimmed.includes("-") && !trimmed.includes(" ")
            ? trimmed
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            : trimmed;
        map.set(norm, display);
      }
    };

    // 1. Static base categories from catalog
    for (const c of categories) {
      addCat(c);
    }

    // 2. Dynamic categories from StoreContext
    if (Array.isArray(categoriesList)) {
      for (const c of categoriesList) {
        addCat(typeof c === "string" ? c : (c as any)?.name);
      }
    }

    // 3. Products categories from activeProducts
    if (Array.isArray(activeProducts)) {
      for (const p of activeProducts) {
        addCat(p.category);
        if ((p as any).categoryId) addCat((p as any).categoryId);
        if ((p as any).category_id) addCat((p as any).category_id);
      }
    }

    const seen = new Set<string>();
    const result: string[] = [];
    for (const display of map.values()) {
      const cleanKey = display.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seen.has(cleanKey)) {
        seen.add(cleanKey);
        result.push(display);
      }
    }
    return result;
  }, [categoriesList, activeProducts, deletedCategories]);

  // Pattern Filter state
  const [selectedPattern, setSelectedPattern] = useState<string | null>(queryPattern || null);

  const handleCategoryClick = (cat: string) => {
    setFilter(cat);
    navigate({
      to: "/shop",
      search: {
        category: cat !== ALL ? cat : undefined,
        pattern: selectedPattern || undefined,
        search: querySearch || undefined,
        filter: queryFilter || undefined,
      } as any,
    });
  };

  useEffect(() => {
    if (queryCategory) {
      const matched = distinctCategories.find((c) => normalize(c) === normalize(queryCategory));
      setFilter(matched || queryCategory);
    }
  }, [queryCategory, distinctCategories]);

  useEffect(() => {
    if (queryPattern) {
      setSelectedPattern(queryPattern);
    }
  }, [queryPattern]);

  const patternItem = selectedPattern ? PATTERNS_DATA.find((p) => p.slug === selectedPattern) : null;

  const visible = useMemo(() => {
    const rawFiltered = (activeProducts || []).filter((p) => {
      if (!p) return false;

      // Filter by new arrivals
      if (queryFilter === "new") {
        const b = typeof p.badge === "string" ? p.badge.toLowerCase() : (p.badge ? String(p.badge).toLowerCase() : "");
        const isNew = b.includes("new") || Boolean((p as any).isNew);
        if (p.badge && !isNew) return false;
      }

      // Filter by special offers / discounts
      if (querySale) {
        const hasDiscount = Boolean(
          (p.originalPrice && Number(p.originalPrice) > Number(p.price)) ||
          (p.discount && Number(p.discount) > 0) ||
          (p.badge && /sale|offer|deal|discount|save/i.test(String(p.badge)))
        );
        // Only exclude if there are products with discounts in the catalog
        const anyDiscountsExist = activeProducts.some(
          (prod) =>
            (prod.originalPrice && Number(prod.originalPrice) > Number(prod.price)) ||
            (prod.discount && Number(prod.discount) > 0) ||
            (prod.badge && /sale|offer|deal|discount|save/i.test(String(prod.badge)))
        );
        if (anyDiscountsExist && !hasDiscount) return false;
      }

      // Category match - case-insensitive and partial-match resilient
      const matchCategory =
        filter === ALL ||
        normalize(p.category) === normalize(filter) ||
        normalize(p.category).includes(normalize(filter)) ||
        normalize(filter).includes(normalize(p.category));

      if (!matchCategory) return false;

      // Search query match
      if (querySearch && querySearch.trim()) {
        const q = querySearch.trim().toLowerCase();
        const searchSpace = `${p.name || ""} ${p.description || ""} ${p.colour || ""} ${p.category || ""}`.toLowerCase();
        if (!searchSpace.includes(q)) return false;
      }

      if (!selectedPattern || !patternItem) return true;

      // Search keywords for pattern in name, description, colour, category
      const query = patternItem.name ? patternItem.name.toLowerCase() : "";
      const searchSpace = `${p.name || ""} ${p.description || ""} ${p.colour || ""} ${p.category || ""}`.toLowerCase();

      if (selectedPattern === "solids") {
        return searchSpace.includes("solid") || searchSpace.includes("plain") || searchSpace.includes("cotton") || searchSpace.includes("linen");
      }
      if (selectedPattern === "zari-brocade") {
        return searchSpace.includes("zari") || searchSpace.includes("brocade") || searchSpace.includes("silk") || searchSpace.includes("kanjivaram");
      }
      if (selectedPattern === "embroidery") {
        return searchSpace.includes("embroidery") || searchSpace.includes("embroidered") || searchSpace.includes("needlework") || searchSpace.includes("chudithar");
      }
      if (selectedPattern === "florals") {
        return searchSpace.includes("floral") || searchSpace.includes("flower") || searchSpace.includes("botanical") || searchSpace.includes("print");
      }
      if (selectedPattern === "embellished") {
        return searchSpace.includes("embellished") || searchSpace.includes("sequin") || searchSpace.includes("festive") || searchSpace.includes("lehenga");
      }
      if (selectedPattern === "prints") {
        return searchSpace.includes("print") || searchSpace.includes("printed") || searchSpace.includes("block") || searchSpace.includes("pattern");
      }
      if (selectedPattern === "checks-stripes") {
        return searchSpace.includes("check") || searchSpace.includes("stripe") || searchSpace.includes("textured") || searchSpace.includes("brocade");
      }

      return searchSpace.includes(query);
    });

    const seenIds = new Set<string>();
    const seenCards = new Set<string>();
    const deduped: typeof rawFiltered = [];

    for (const p of rawFiltered) {
      if (!p || !p.id || seenIds.has(p.id)) continue;
      const rawImg = p.image || p.imageUrl || (p as any).image_url || "";
      const imgKey = rawImg.replace(/v\d+\//, "").split("?")[0].split("/").pop() || "";
      const nameKey = (p.name || "").trim().toLowerCase();
      const cardKey = `${nameKey}:::${imgKey}`;

      if (imgKey && seenCards.has(cardKey)) {
        continue;
      }

      seenIds.add(p.id);
      if (imgKey) {
        seenCards.add(cardKey);
      }
      deduped.push(p);
    }

    return deduped;
  }, [activeProducts, queryFilter, querySale, filter, querySearch, selectedPattern, patternItem]);

  const clearPattern = () => {
    setSelectedPattern(null);
    navigate({
      to: "/shop",
      search: {
        category: filter !== ALL ? filter : undefined,
      } as any,
    });
  };

  const resetAllFilters = () => {
    setFilter(ALL);
    setSelectedPattern(null);
    navigate({
      to: "/shop",
      search: {} as any,
    });
  };

  return (
    <main className="bg-[#FAF6EE] text-[#0E0E0E] min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D15608] font-medium block mb-2">
              The Curated Edit
            </span>
            <h1 className="font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#0E0E0E]">
              Shop the Collection
            </h1>
          </div>
          <span className="text-xs text-[#0E0E0E]/60 uppercase tracking-wider font-light">
            Menambedu, Ambattur · Retail & Wholesale Meterage
          </span>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <Button
            variant="filter"
            data-active={filter === ALL || normalize(filter) === "all" || !filter}
            onClick={() => handleCategoryClick(ALL)}
          >
            All Categories ({(activeProducts || []).length})
          </Button>
          {distinctCategories.map((c) => {
            const count = (activeProducts || []).filter((p) => {
              const pNorm = normalize(p.category);
              const cNorm = normalize(c);
              return (
                pNorm === cNorm ||
                (pNorm.length > 2 && cNorm.length > 2 && (pNorm.includes(cNorm) || cNorm.includes(pNorm)))
              );
            }).length;

            return (
              <Button
                key={c}
                variant="filter"
                data-active={normalize(filter) === normalize(c)}
                onClick={() => handleCategoryClick(c)}
              >
                {c} {count > 0 && `(${count})`}
              </Button>
            );
          })}
        </div>

        {/* Pattern Filter Group */}
        <div className="py-3 px-4 rounded-2xl bg-white border border-[rgba(14,14,14,0.08)] shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#0E0E0E] shrink-0 mr-1">
              Pattern:
            </span>
            <button
              type="button"
              onClick={clearPattern}
              className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium transition-all ${
                !selectedPattern
                  ? "bg-[#0E0E0E] text-[#F4F0E8]"
                  : "bg-transparent text-[#0E0E0E]/70 hover:text-[#0E0E0E]"
              }`}
            >
              All Patterns
            </button>
            {PATTERNS_DATA.map((pat) => (
              <button
                key={pat.slug}
                type="button"
                onClick={() => {
                  setSelectedPattern(pat.slug);
                  navigate({
                    to: "/shop",
                    search: {
                      category: filter !== ALL ? filter : undefined,
                      pattern: pat.slug,
                    } as any,
                  });
                }}
                className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedPattern === pat.slug
                    ? "bg-[#0E0E0E] text-[#F4F0E8]"
                    : "bg-transparent text-[#0E0E0E]/70 hover:text-[#0E0E0E]"
                }`}
              >
                {pat.name}
              </button>
            ))}
          </div>

          {selectedPattern && patternItem && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#0E0E0E]/70">
                Active: <strong className="text-[#D15608]">{patternItem.name}</strong>
              </span>
              <button
                type="button"
                onClick={clearPattern}
                className="p-1 rounded-full hover:bg-black/5 text-[#0E0E0E]"
                title="Clear pattern filter"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Counter and Clear Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#0E0E0E]/60 mb-6">
          <span>
            Showing <strong>{visible.length}</strong> of {activeProducts.length} fabrics{" "}
            {filter !== ALL ? `in ${filter}` : ""}{" "}
            {selectedPattern && patternItem ? `with ${patternItem.name} pattern` : ""}
          </span>
          {(filter !== ALL || selectedPattern || queryFilter || querySearch) && (
            <button
              type="button"
              className="text-xs font-semibold text-[#D15608] hover:underline cursor-pointer self-start sm:self-auto"
              onClick={resetAllFilters}
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {visible.length === 0 ? (
          <div className="p-16 rounded-2xl bg-white border border-dashed border-[rgba(14,14,14,0.15)] shadow-xs text-center my-6">
            <h3 className="font-['Manrope'] text-lg font-medium text-[#0E0E0E]">
              {activeProducts.length === 0 ? "No products available in the catalog yet" : "No fabrics matching your selection"}
            </h3>
            <p className="text-xs text-[#0E0E0E]/60 mt-1 mb-4">
              {activeProducts.length === 0 ? "New arrivals will be listed here as soon as they are added in the Admin Panel." : "Try adjusting the pattern or category filters above."}
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-5 py-2 rounded-full bg-[#D15608] text-white text-xs uppercase tracking-wider font-medium cursor-pointer hover:bg-[#9F160A] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Contact & Wholesale Section */}
      <section className="bg-white border-t border-[rgba(14,14,14,0.08)] py-16" id="wholesale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D15608] font-medium block mb-1">
              Custom & Wholesale Orders
            </span>
            <h2 className="font-['Manrope'] text-2xl sm:text-3xl font-medium tracking-tight text-[#0E0E0E]">
              Need custom yardage or bulk orders?
            </h2>
            <p className="text-xs sm:text-sm font-light text-[#0E0E0E]/70 mt-2 max-w-xl">
              Preview fabric imagery and sample pricing. Our Ambattur Chennai depot team confirms exact meterage, wholesale pricing, and worldwide freight dispatch.
            </p>
          </div>
          <Button
            variant="whatsapp"
            size="lg"
            asChild
            className="w-full sm:w-auto shrink-0 touch-manipulation"
          >
            <a
              href="https://wa.me/919940145700?text=Hello%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20enquire%20about%20wholesale%20fabrics."
              target="_blank"
              rel="noreferrer"
            >
              <span>Enquire on WhatsApp</span>
              <ArrowUpRight className="size-4 ml-1.5" />
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}

export default ShopPage;
