import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ALL, categories, products, money, bagTotal } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";

export function ShopSheet() {
  const {
    selected,
    setSelected,
    panel,
    setPanel,
    count,
    size,
    setSize,
    quantity,
    setQuantity,
    addToBag,
    buyNow,
    isCheckoutOpen,
    setIsCheckoutOpen,
    bag,
    favorites,
    query,
    setQuery,
    openProduct,
    setFilter,
    updateQuantity,
    removeFromBag,
    whatsappUrl,
    activeProducts,
    productsList,
  } = useStore();

  const handleBuyNow = () => {
    if (!selected) return;
    buyNow(selected, quantity);
  };

  const navigate = useNavigate();

  const handleBrowse = (category: string) => {
    setFilter(category);
    setPanel(null);
    navigate({ to: "/shop" });
  };

  return (
    <Sheet
      open={selected !== null || panel !== null}
      onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
          setPanel(null);
        }
      }}
    >
      <SheetContent className="shop-sheet">
        <SheetTitle className="font-display text-3xl">
          {selected?.name ??
            (panel === "bag"
              ? `Your bag (${count})`
              : panel === "search"
                ? "Find your fabric"
                : panel === "favorites"
                  ? "Saved fabrics"
                  : "Padmanabha Fabrics")}
        </SheetTitle>
        <SheetDescription className="mt-2">
          {selected
            ? selected.colour
            : panel === "bag"
              ? "Your selected fabrics"
              : panel === "search"
                ? "The Padmanabha collection"
                : panel === "favorites"
                  ? "Your personal edit"
                  : "A world of beautiful fabrics"}
        </SheetDescription>

        {selected && (
          <>
            <img
              className="detail-image"
              src={selected.image || selected.imageUrl || (selected as any).image_url || "/placeholder.svg"}
              alt={selected.name}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                const fallback = selected.imageUrl || (selected as any).image_url;
                if (fallback && target.src !== fallback) {
                  target.src = fallback;
                }
              }}
            />
            <p className="text-sm text-muted-foreground leading-7">{selected.description}</p>
            <p className="text-xl text-primary mt-5">
              {money(selected.price)}{" "}
              <span className="text-xs text-muted-foreground">
                / {selected.unit} · sample price
              </span>
            </p>
            {selected.sizes && (
              <div className="mt-6">
                <span className="text-xs">Size</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selected.sizes.map((sz) => (
                    <Button
                      key={sz}
                      size="sm"
                      variant="filter"
                      data-active={size === sz}
                      onClick={() => setSize(sz)}
                    >
                      {sz}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mt-6 mb-5">
              <span className="text-xs">{selected.unit === "metre" ? "Metres" : "Quantity"}</span>
              <div className="quantity-control">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease metres"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus />
                </Button>
                <span>{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase metres"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus />
                </Button>
              </div>
            </div>
            {/* Direct Pay & Buy Action Buttons */}
            <div className="space-y-2.5">
              <Button
                variant="editorial"
                size="lg"
                className="w-full !rounded-xl !h-auto min-h-[48px] py-3 px-3 text-xs sm:text-sm uppercase tracking-wide font-bold shadow-md bg-[#D15608] hover:bg-[#9F160A] text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] touch-manipulation"
                onClick={handleBuyNow}
              >
                <Zap className="size-4.5 shrink-0 fill-amber-300 text-amber-300" />
                <span>BUY NOW · {money(selected.price * quantity)}</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="!rounded-xl !h-auto min-h-[42px] py-2 px-2 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                  onClick={addToBag}
                >
                  <ShoppingBag className="size-3.5 shrink-0" />
                  <span className="truncate">Add to Bag</span>
                </Button>
                <Button
                  variant="whatsapp"
                  className="!rounded-xl !h-auto min-h-[42px] py-2 px-2 text-xs font-semibold uppercase tracking-wider shadow-xs flex items-center justify-center gap-1 cursor-pointer touch-manipulation"
                  asChild
                >
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-3.5 shrink-0 mr-1" />
                    <span>WhatsApp</span>
                  </a>
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4 leading-5 text-center">
              Direct checkout with instant online payment & dispatch across India from Ambattur, Chennai.
            </p>
          </>
        )}

        {panel === "menu" && (
          <nav className="flex flex-col gap-5 mt-8 text-sm">
            <Link
              to="/"
              className="py-1 text-base font-medium transition-colors hover:text-primary"
              onClick={() => setPanel(null)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="py-1 text-base font-medium transition-colors hover:text-primary"
              onClick={() => {
                setFilter(ALL);
                setPanel(null);
              }}
            >
              Shop All
            </Link>
            <div className="pl-3 flex flex-col gap-3 border-l border-border/60 my-1">
              {categories
                .filter((c) => c !== ALL)
                .map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="text-left text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0"
                    onClick={() => handleBrowse(c)}
                  >
                    {c}
                  </button>
                ))}
            </div>
            <Link
              to="/about"
              className="py-1 text-base font-medium transition-colors hover:text-primary"
              onClick={() => setPanel(null)}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="py-1 text-base font-medium transition-colors hover:text-primary"
              onClick={() => setPanel(null)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={() => setPanel("favorites")}>
                <Heart /> Saved fabrics ({favorites.length})
              </Button>
            </div>
          </nav>
        )}

        {panel === "search" && (
          <>
            <input
              className="search-field"
              aria-label="Search collection"
              placeholder="Search sarees, shirts, kids wear…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {activeProducts
              .filter((p) =>
                `${p.name} ${p.category} ${p.colour}`.toLowerCase().includes(query.toLowerCase()),
              )
              .map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className="bag-row w-full text-left bg-transparent border-b border-border p-0 cursor-pointer"
                  onClick={() => openProduct(p)}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                    }}
                  />
                  <div>
                    <h3 className="text-sm mt-2 font-medium">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      {p.category} · {money(p.price)} / {p.unit}
                    </p>
                  </div>
                </button>
              ))}
            {!activeProducts.some((p) =>
              `${p.name} ${p.category} ${p.colour}`.toLowerCase().includes(query.toLowerCase()),
            ) && (
              <p className="text-sm text-muted-foreground mt-8">
                No fabrics found. Try another colour or fabric.
              </p>
            )}
          </>
        )}

        {panel === "favorites" && (
          <>
            {favorites.length === 0 ? (
              <div className="empty-bag">
                <Heart className="size-10 stroke-1 text-gold" />
                <p className="text-sm text-muted-foreground">Your personal edit is waiting.</p>
                <Button variant="editorial" onClick={() => handleBrowse(ALL)}>
                  Explore fabrics <ArrowRight />
                </Button>
              </div>
            ) : (
              <div className="product-grid mt-8">
                {activeProducts
                  .filter((p) => favorites.includes(p.id))
                  .map((p) => (
                    <ProductCard product={p} key={p.id} />
                  ))}
              </div>
            )}
          </>
        )}

        {panel === "bag" && (
          <>
            {bag.length === 0 ? (
              <div className="empty-bag">
                <ShoppingBag className="size-12 stroke-1 text-gold" />
                <p className="font-display text-2xl">Something beautiful awaits.</p>
                <Button variant="editorial" onClick={() => handleBrowse(ALL)}>
                  Discover the collection <ArrowRight />
                </Button>
              </div>
            ) : (
              <>
                {bag.map((item) => {
                  const p = productsList.find((prod) => prod.id === item.id);
                  if (!p) return null;
                  return (
                    <div key={item.id} className="bag-row">
                      <img
                        src={p.image}
                        alt={p.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                        }}
                      />
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs mt-1 font-medium">{p.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${p.name}`}
                            onClick={() => removeFromBag(p.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-3">
                          <div className="quantity-control">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Decrease ${p.name}`}
                              onClick={() => updateQuantity(p.id, -1)}
                            >
                              <Minus />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Increase ${p.name}`}
                              onClick={() => updateQuantity(p.id, 1)}
                            >
                              <Plus />
                            </Button>
                          </div>
                          <span className="text-xs">{money(p.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center text-sm mt-8 mb-4">
                  <span className="text-muted-foreground font-medium">Estimated total</span>
                  <strong className="text-primary font-display text-lg">{money(bagTotal(bag))}</strong>
                </div>

                <div className="space-y-2.5">
                  <Button
                    variant="editorial"
                    className="w-full h-11 text-xs uppercase tracking-wider font-semibold shadow-xs"
                    onClick={() => {
                      setPanel(null);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    <CreditCard className="size-4 mr-1.5" /> Proceed to Pay · {money(bagTotal(bag))}
                  </Button>

                  <Button variant="whatsapp" className="w-full text-xs h-10 shadow-sm" asChild>
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircle className="size-4 mr-1.5" /> Enquire & order on WhatsApp <ArrowUpRight className="size-3.5 ml-1" />
                    </a>
                  </Button>
                </div>

                <p className="text-[11px] leading-5 text-muted-foreground mt-3 text-center">
                  Secure checkout with instant order confirmation & dispatch from Chennai.
                </p>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
