import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  X,
  Filter,
  ChevronDown,
  ArrowUpDown,
  RotateCcw,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { ALL, categories, cleanSizes, COMMON_COLOUR_MAP, type Product } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/utils/formatters";

export const Route = createFileRoute("/shop")({
  validateSearch: (
    search: Record<string, unknown> = {},
  ): {
    category?: string | undefined;
    pattern?: string | undefined;
    search?: string | undefined;
    filter?: string | undefined;
    size?: string | undefined;
    sort?: string | undefined;
  } => {
    return {
      category: typeof search?.["category"] === "string" ? search["category"] : undefined,
      pattern: typeof search?.["pattern"] === "string" ? search["pattern"] : undefined,
      search: typeof search?.["search"] === "string" ? search["search"] : undefined,
      filter: typeof search?.["filter"] === "string" ? search["filter"] : undefined,
      size: typeof search?.["size"] === "string" ? search["size"] : undefined,
      sort: typeof search?.["sort"] === "string" ? search["sort"] : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Shop Women's Ethnic Collections | Padmanabha Fabrics" },
      {
        name: "description",
        content:
          "Browse our curated collection of sarees, silk suits, kurtas, coordsets, and festive apparel in Chennai.",
      },
    ],
  }),
  component: ShopPage,
});

const SIZES_LIST = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "Free Size"];
const PRICE_RANGES = [
  { label: "Under ₹1,500", min: 0, max: 1500 },
  { label: "₹1,500 - ₹3,000", min: 1500, max: 3000 },
  { label: "₹3,000 - ₹5,000", min: 3000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
];
const FABRICS_LIST = ["Silk", "Cotton", "Rayon", "Brocade", "Linen", "Chanderi", "Georgette"];
const DISCOUNT_OPTIONS = [
  { label: "10% and above", min: 10 },
  { label: "20% and above", min: 20 },
  { label: "30% and above", min: 30 },
];

function ShopPage() {
  const navigate = useNavigate();

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
        size: sp.get("size") || undefined,
        sort: sp.get("sort") || undefined,
      };
    }
  }

  const queryCategory = searchParams?.category;
  const querySearch = searchParams?.search;
  const queryFilter = searchParams?.filter;
  const querySize = searchParams?.size;

  const { activeProducts = [], categoriesList = [] } = useStore();
  const rawCats = categoriesList && categoriesList.length > 0 ? categoriesList : (categories as readonly string[]);

  // Collect distinct categories
  const distinctCategories = useMemo(() => {
    const list = rawCats.map((c: any) => (typeof c === "string" ? c : c?.name || String(c)));
    const productCats = (activeProducts || []).map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set([...list, ...productCats]));
    return combined.filter((c) => c && c.trim().toLowerCase() !== "all");
  }, [rawCats, activeProducts]);

  // Sidebar Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(queryCategory || ALL);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(querySize ? [querySize] : []);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");

  // Mobile filter drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
  }, [queryCategory]);

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz],
    );
    setCurrentPage(1);
  };

  const toggleColor = (c: string) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setSelectedCategory(ALL);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPriceRange(null);
    setSelectedFabric(null);
    setSelectedDiscount(null);
    setSortBy("featured");
    setCurrentPage(1);
    navigate({ to: "/shop", search: {} as any });
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return (activeProducts || []).filter((p) => {
      if (!p) return false;

      // 1. Category
      if (selectedCategory !== ALL) {
        const catNorm = selectedCategory.toLowerCase();
        const pCatNorm = (p.category || "").toLowerCase();
        if (catNorm !== pCatNorm && !pCatNorm.includes(catNorm) && !catNorm.includes(pCatNorm)) {
          return false;
        }
      }

      // 2. Search
      if (querySearch && querySearch.trim()) {
        const q = querySearch.trim().toLowerCase();
        const space = `${p.name} ${p.description || ""} ${p.colour || ""} ${p.category || ""}`.toLowerCase();
        if (!space.includes(q)) return false;
      }

      // 3. New Filter
      if (queryFilter === "new") {
        const b = (p.badge || "").toLowerCase();
        if (!b.includes("new")) return false;
      }

      // 4. Sizes
      if (selectedSizes.length > 0) {
        const pSizes = cleanSizes(p.sizes, p.category, p.description);
        const matchesAnySize = selectedSizes.some((s) => pSizes.includes(s));
        if (!matchesAnySize) return false;
      }

      // 5. Colors
      if (selectedColors.length > 0) {
        const pColour = (p.colour || "").toLowerCase();
        const matchesColour = selectedColors.some((c) => pColour.includes(c.toLowerCase()));
        if (!matchesColour) return false;
      }

      // 6. Price Range
      if (selectedPriceRange) {
        const price = Number(p.price) || 0;
        if (price < selectedPriceRange.min || price > selectedPriceRange.max) return false;
      }

      // 7. Fabric
      if (selectedFabric) {
        const space = `${p.name} ${p.description || ""} ${p.category || ""}`.toLowerCase();
        if (!space.includes(selectedFabric.toLowerCase())) return false;
      }

      // 8. Discount
      if (selectedDiscount) {
        const price = Number(p.price) || 0;
        const orig = Number(p.originalPrice || p.original_price) || 0;
        if (orig <= price) return false;
        const disc = Math.round(((orig - price) / orig) * 100);
        if (disc < selectedDiscount) return false;
      }

      return true;
    });
  }, [
    activeProducts,
    selectedCategory,
    querySearch,
    queryFilter,
    selectedSizes,
    selectedColors,
    selectedPriceRange,
    selectedFabric,
    selectedDiscount,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-low") {
      return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    if (sortBy === "discount") {
      return list.sort((a, b) => {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      });
    }
    if (sortBy === "newest") {
      return list.reverse();
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage]);

  const activeFiltersCount =
    (selectedCategory !== ALL ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (selectedPriceRange ? 1 : 0) +
    (selectedFabric ? 1 : 0) +
    (selectedDiscount ? 1 : 0);

  return (
    <main className="bg-[#FAF7F2] text-[#0E0E0E] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Breadcrumb & Title */}
        <div className="pb-6 border-b border-[#EBE6DC] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9F160A] font-bold">
              Collections
            </span>
            <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0E0E0E] mt-1">
              {selectedCategory === ALL ? "All Ethnic Ensembles" : selectedCategory}
            </h1>
            <p className="text-xs text-[#5C5549] mt-1 font-light">
              Showing {sortedProducts.length} handcrafted weaves & ready-to-wear pieces
            </p>
          </div>

          {/* Mobile Filter Button & Desktop Sort Dropdown */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E5DAC4] text-xs font-bold uppercase tracking-wider text-[#0E0E0E] shadow-xs cursor-pointer"
            >
              <SlidersHorizontal className="size-4 text-[#9F160A]" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#E5DAC4] shadow-xs">
              <ArrowUpDown className="size-3.5 text-[#5C5549]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#0E0E0E] focus:outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap py-3 border-b border-[#EBE6DC]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5549]">
              Active Filters:
            </span>
            {selectedCategory !== ALL && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DAC4] text-xs font-medium">
                Category: {selectedCategory}
                <X className="size-3 cursor-pointer" onClick={() => setSelectedCategory(ALL)} />
              </span>
            )}
            {selectedSizes.map((sz) => (
              <span key={sz} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DAC4] text-xs font-medium">
                Size: {sz}
                <X className="size-3 cursor-pointer" onClick={() => toggleSize(sz)} />
              </span>
            ))}
            {selectedColors.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DAC4] text-xs font-medium">
                Color: {c}
                <X className="size-3 cursor-pointer" onClick={() => toggleColor(c)} />
              </span>
            ))}
            {selectedPriceRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DAC4] text-xs font-medium">
                Price: ₹{selectedPriceRange.min} - {selectedPriceRange.max === Infinity ? "Above" : `₹${selectedPriceRange.max}`}
                <X className="size-3 cursor-pointer" onClick={() => setSelectedPriceRange(null)} />
              </span>
            )}
            {selectedFabric && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DAC4] text-xs font-medium">
                Fabric: {selectedFabric}
                <X className="size-3 cursor-pointer" onClick={() => setSelectedFabric(null)} />
              </span>
            )}
            {selectedDiscount && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5DAC4] text-xs font-medium">
                {selectedDiscount}%+ Off
                <X className="size-3 cursor-pointer" onClick={() => setSelectedDiscount(null)} />
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-[#9F160A] font-bold hover:underline cursor-pointer ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main 2-Column Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          {/* =========================================================
              DESKTOP LEFT FILTER SIDEBAR (W for Woman style)
          ========================================================== */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-[#E5DAC4] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE6DC]">
                <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#0E0E0E]">
                  Filters
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[11px] font-bold uppercase tracking-wider text-[#9F160A] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* 1. Category Filter */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2.5">
                  Category
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(ALL);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === ALL
                        ? "bg-[#9F160A] text-white font-bold"
                        : "text-[#5C5549] hover:bg-[#FAF6EE] hover:text-[#0E0E0E]"
                    }`}
                  >
                    <span>All Ensembles</span>
                    <span>{(activeProducts || []).length}</span>
                  </button>
                  {distinctCategories.map((c) => {
                    const count = (activeProducts || []).filter(
                      (p) => (p.category || "").toLowerCase() === c.toLowerCase(),
                    ).length;
                    const isSelected = selectedCategory.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(c);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#9F160A] text-white font-bold"
                            : "text-[#5C5549] hover:bg-[#FAF6EE] hover:text-[#0E0E0E]"
                        }`}
                      >
                        <span>{c}</span>
                        <span>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Size Filter */}
              <div className="pt-4 border-t border-[#EBE6DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2.5">
                  Size
                </h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {SIZES_LIST.map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`py-1.5 text-xs font-semibold uppercase rounded-md transition-all text-center border ${
                          isSelected
                            ? "bg-[#9F160A] text-white border-[#9F160A] shadow-xs"
                            : "bg-[#FAF6EE] text-[#5C5549] border-[#E5DAC4] hover:border-[#9F160A]"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Price Range Filter */}
              <div className="pt-4 border-t border-[#EBE6DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2.5">
                  Price
                </h4>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((r, idx) => {
                    const isSelected =
                      selectedPriceRange?.min === r.min && selectedPriceRange?.max === r.max;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPriceRange(isSelected ? null : { min: r.min, max: r.max });
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#9F160A] text-white font-bold"
                            : "text-[#5C5549] hover:bg-[#FAF6EE] hover:text-[#0E0E0E]"
                        }`}
                      >
                        <span>{r.label}</span>
                        {isSelected && <Check className="size-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Fabric / Craft Filter */}
              <div className="pt-4 border-t border-[#EBE6DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2.5">
                  Fabric
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {FABRICS_LIST.map((f) => {
                    const isSelected = selectedFabric === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setSelectedFabric(isSelected ? null : f);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                          isSelected
                            ? "bg-[#9F160A] text-white border-[#9F160A]"
                            : "bg-[#FAF6EE] text-[#5C5549] border-[#E5DAC4] hover:border-[#9F160A]"
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Discount Filter */}
              <div className="pt-4 border-t border-[#EBE6DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2.5">
                  Discount
                </h4>
                <div className="space-y-1.5">
                  {DISCOUNT_OPTIONS.map((d) => {
                    const isSelected = selectedDiscount === d.min;
                    return (
                      <button
                        key={d.min}
                        type="button"
                        onClick={() => {
                          setSelectedDiscount(isSelected ? null : d.min);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                          isSelected
                            ? "bg-[#9F160A] text-white font-bold"
                            : "text-[#5C5549] hover:bg-[#FAF6EE] hover:text-[#0E0E0E]"
                        }`}
                      >
                        <span>{d.label}</span>
                        {isSelected && <Check className="size-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* =========================================================
              PRODUCT GRID (3 Columns Desktop / 2 Columns Mobile)
          ========================================================== */}
          <div className="lg:col-span-3">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E5DAC4] p-8 space-y-4">
                <div className="size-16 rounded-full bg-[#FAF6EE] text-[#9F160A] flex items-center justify-center mx-auto">
                  <Filter className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0E0E0E]">
                  No matching weaves found
                </h3>
                <p className="text-xs text-[#5C5549] max-w-sm mx-auto">
                  Try adjusting your filters or search terms to explore our other artisanal collections.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 rounded-full bg-[#9F160A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7D1107] transition-all cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-lg border border-[#E5DAC4] bg-white text-xs font-semibold text-[#0E0E0E] disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 180, behavior: "smooth" });
                      }}
                      className={`size-9 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#9F160A] text-white shadow-xs"
                          : "bg-white text-[#5C5549] border border-[#E5DAC4] hover:bg-[#FAF6EE]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-lg border border-[#E5DAC4] bg-white text-xs font-semibold text-[#0E0E0E] disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MOBILE FILTER DRAWER (Slide-over from left)
      ========================================================== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden select-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white text-[#0E0E0E] shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">
            <div className="p-4 border-b border-[#EBE6DC] flex items-center justify-between bg-[#FAF6EE]">
              <h3 className="font-['Cormorant_Garamond'] text-xl font-bold">Filters</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-black/60 hover:text-black cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2">Category</h4>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(ALL)}
                    className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                      selectedCategory === ALL ? "bg-[#9F160A] text-white font-bold" : "text-[#5C5549]"
                    }`}
                  >
                    All Ensembles
                  </button>
                  {distinctCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCategory(c)}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                        selectedCategory === c ? "bg-[#9F160A] text-white font-bold" : "text-[#5C5549]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="pt-3 border-t border-[#EBE6DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2">Size</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {SIZES_LIST.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`py-1.5 text-xs font-bold rounded border ${
                        selectedSizes.includes(sz)
                          ? "bg-[#9F160A] text-white border-[#9F160A]"
                          : "bg-[#FAF6EE] text-[#5C5549] border-[#E5DAC4]"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-3 border-t border-[#EBE6DC]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9F160A] mb-2">Price</h4>
                <div className="space-y-1">
                  {PRICE_RANGES.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setSelectedPriceRange(
                          selectedPriceRange?.min === r.min ? null : { min: r.min, max: r.max },
                        )
                      }
                      className={`w-full text-left px-3 py-1.5 rounded text-xs ${
                        selectedPriceRange?.min === r.min ? "bg-[#9F160A] text-white font-bold" : "text-[#5C5549]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#EBE6DC] bg-[#FAF6EE] flex gap-2">
              <button
                type="button"
                onClick={resetAllFilters}
                className="w-1/2 py-2.5 rounded-lg border border-[#0E0E0E] text-xs font-bold uppercase tracking-wider text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 py-2.5 rounded-lg bg-[#9F160A] text-white text-xs font-bold uppercase tracking-wider text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ShopPage;
