import { ArrowUpRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type Product } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, openProduct } = useStore();
  const isFavorite = favorites.includes(product.id);

  return (
    <article className="min-w-0">
      <div className="product-picture">
        <button
          type="button"
          className="w-full block text-left cursor-pointer border-none p-0 bg-transparent"
          onClick={() => openProduct(product)}
          aria-label={`View ${product.name}`}
        >
          <img
            src={product.image || "/assets/burgundy-silk.jpg"}
            alt={product.name}
            width={768}
            height={1024}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
            }}
          />
        </button>
        <span className="product-badge">{product.badge}</span>
        <Button
          variant="ghost"
          size="icon"
          className="favorite size-8 bg-white/95 dark:bg-card/95 hover:bg-rose-50 shadow-sm border border-border/40 transition-all hover:scale-105"
          title="Save fabric"
          aria-label={`Save ${product.name}`}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(product.id)}
        >
          <Heart
            className={`size-4 transition-colors ${
              isFavorite ? "fill-[#9B2242] text-[#9B2242]" : "text-muted-foreground hover:text-[#9B2242]"
            }`}
          />
        </Button>
      </div>
      <h3 className="product-name">
        <button
          type="button"
          className="text-left cursor-pointer hover:underline border-none p-0 bg-transparent text-inherit font-inherit"
          onClick={() => openProduct(product)}
        >
          {product.name}
        </button>
      </h3>
      <p className="product-type">{product.colour}</p>
      <div className="product-footer">
        <p className="product-price">
          {money(product.price)} <span>/ {product.unit}</span>
        </p>
        <Button
          size="sm"
          variant="editorial"
          className="h-8 px-3.5 text-xs rounded-full gap-1 shadow-sm font-medium tracking-normal capitalize"
          title="View fabric"
          aria-label={`Details for ${product.name}`}
          onClick={() => openProduct(product)}
        >
          View <ArrowUpRight className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}
