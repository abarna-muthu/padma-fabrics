import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL, categories, collections, products } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => {
    return typeof search["category"] === "string" ? { category: search["category"] } : {};
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
  const { category: queryCategory } = Route.useSearch();
  const { filter, setFilter, activeProducts, categoriesList } = useStore();
  const activeCats = categoriesList && categoriesList.length > 0 ? categoriesList : (categories as readonly string[]);

  useEffect(() => {
    if (queryCategory && activeCats.includes(queryCategory)) {
      setFilter(queryCategory);
    }
  }, [queryCategory, setFilter, activeCats]);

  const visible = activeProducts.filter((p) => filter === ALL || p.category === filter);

  return (
    <main>
      <section className="page-width pt-12 pb-6">
        <div className="section-heading">
          <div>
            <p className="section-kicker">The curated edit</p>
            <h1 className="section-title">Shop the collection</h1>
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Preview collection · Sample prices
          </span>
        </div>

        <div className="category-grid mb-12">
          {collections.map((c) => (
            <button
              type="button"
              key={c.name}
              className={`category-card text-left cursor-pointer border-none p-0 bg-transparent transition-opacity ${
                filter === c.name ? "ring-1 ring-primary" : ""
              }`}
              onClick={() => setFilter(c.name)}
            >
              <img
                className="category-image"
                src={c.image}
                alt={`${c.name} collection`}
                width={768}
                height={1024}
                loading="lazy"
              />
              <div className="category-label">
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.text}</p>
                </div>
                <ArrowUpRight className="size-4 text-primary" />
              </div>
            </button>
          ))}
        </div>

        <div className="filter-tabs">
          {activeCats.map((c) => (
            <Button
              key={c}
              variant="filter"
              data-active={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground mb-6">
          <span>
            Showing {visible.length} of {activeProducts.length} fabrics{" "}
            {filter !== ALL ? `in ${filter}` : ""}
          </span>
          {filter !== ALL && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={() => setFilter(ALL)}
            >
              Clear filter
            </Button>
          )}
        </div>

        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="contact-section page-width border-t border-border mt-16" id="wholesale">
        <div>
          <p className="section-kicker">Custom & Wholesale Orders</p>
          <h2 className="section-title">Need custom yardage or bulk orders?</h2>
          <p className="text-xs text-muted-foreground mt-3">
            Preview fabric imagery and sample pricing. Our team confirms exact yardage, wholesale
            pricing, and worldwide delivery.
          </p>
        </div>
        <Button variant="whatsapp" className="h-11 px-6 text-xs uppercase tracking-wider font-semibold" asChild>
          <a
            href="https://wa.me/919940145700?text=Hello%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20enquire%20about%20wholesale%20fabrics."
            target="_blank"
            rel="noreferrer"
          >
            Enquire on WhatsApp <ArrowUpRight className="ml-4" />
          </a>
        </Button>
      </section>
    </main>
  );
}
