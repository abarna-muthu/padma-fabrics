import { useState, useMemo, useEffect } from "react";
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
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ALL, categories, products, money, bagTotal, cleanSizes, getColourHex, type Product, type ProductVariant } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

interface ColourOption {
  id: string;
  colour: string;
  colourHex?: string;
  price?: number;
  image?: string;
  stock?: number;
  isProductSwitch?: boolean;
  productRef?: Product;
}

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
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Always use the up-to-date product from productsList if available
  const currentProduct = useMemo(() => {
    if (!selected) return null;
    return (productsList && productsList.find((p) => String(p.id) === String(selected.id))) || selected;
  }, [selected, productsList]);

  // Colour options: ONLY explicit product variants configured by admin
  const colourOptions: ColourOption[] = useMemo(() => {
    if (!currentProduct) return [];

    // Only show variants if the admin explicitly added variants to this product
    if (!Array.isArray(currentProduct.variants) || currentProduct.variants.length === 0) {
      return [];
    }

    const options: ColourOption[] = [];

    // 1. Explicit variants configured inside this product (from Admin)
    for (const v of currentProduct.variants) {
      if (!v || !v.colour) continue;
      const vImg = v.image || (Array.isArray(v.images) && v.images[0]) || currentProduct.image;
      options.push({
        id: v.id || `var-${currentProduct.id}-${v.colour.toLowerCase().replace(/\s+/g, "-")}`,
        colour: v.colour,
        colourHex: v.colourHex || getColourHex(v.colour),
        price: v.price || currentProduct.price,
        image: vImg,
        stock: v.stock !== undefined ? v.stock : currentProduct.stock,
        isProductSwitch: false,
      });
    }

    // 2. Current product primary colour (if not already represented and variants exist)
    if (currentProduct.colour && currentProduct.colour !== "Custom") {
      if (!options.some((o) => o.colour.toLowerCase() === currentProduct.colour.toLowerCase())) {
        options.unshift({
          id: `prod-${currentProduct.id}`,
          colour: currentProduct.colour,
          colourHex: getColourHex(currentProduct.colour),
          price: currentProduct.price,
          image: currentProduct.image || currentProduct.imageUrl,
          stock: currentProduct.stock,
          isProductSwitch: false,
        });
      }
    }

    return options;
  }, [currentProduct]);

  // Active colour selection
  const [activeColour, setActiveColour] = useState<string>("");

  useEffect(() => {
    if (currentProduct) {
      setActiveColour(currentProduct.colour || (colourOptions[0]?.colour ?? ""));
    }
  }, [currentProduct?.id]);

  const selectedColourOption = useMemo(() => {
    return (
      colourOptions.find((o) => o.colour.toLowerCase() === activeColour.toLowerCase()) ||
      colourOptions[0]
    );
  }, [colourOptions, activeColour]);

  const activeDisplayImage =
    selectedColourOption?.image || currentProduct?.image || currentProduct?.imageUrl || "/placeholder.svg";

  const effectivePrice = selectedColourOption?.price || currentProduct?.price || 0;

  const handleSelectColour = (opt: ColourOption) => {
    if (opt.isProductSwitch && opt.productRef) {
      setSelected(opt.productRef);
      setActiveColour(opt.productRef.colour || opt.colour);
    } else {
      setActiveColour(opt.colour);
    }
  };

  // Clean clothing sizes (S, M, L, XL, 2XL, etc.)
  const availableSizes: string[] = useMemo(() => {
    if (!currentProduct) return [];
    return cleanSizes(currentProduct.sizes, currentProduct.category, currentProduct.description);
  }, [currentProduct]);

  useEffect(() => {
    if (availableSizes.length > 0) {
      if (!size || !availableSizes.includes(size)) {
        setSize(availableSizes.includes("M") ? "M" : availableSizes[0]!);
      }
    }
  }, [availableSizes]);

  const handleBuyNow = () => {
    if (!currentProduct) return;
    const chosenSize = size || (availableSizes[0] ?? "Standard");
    const chosenColour = activeColour || currentProduct.colour || "";
    addToCart(currentProduct, chosenSize, quantity, chosenColour, activeDisplayImage, effectivePrice);
    buyNow(currentProduct, quantity);
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;
    const chosenSize = size || (availableSizes[0] ?? "Standard");
    const chosenColour = activeColour || currentProduct.colour || "";
    addToCart(currentProduct, chosenSize, quantity, chosenColour, activeDisplayImage, effectivePrice);
    addToBag();
    toast.success(`Added ${currentProduct.name} (${chosenColour}, ${chosenSize}) to cart!`);
  };

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
          {currentProduct?.name ??
            (panel === "bag"
              ? `Your bag (${count})`
              : panel === "search"
                ? "Find your fabric"
                : panel === "favorites"
                  ? "Saved fabrics"
                  : "Padmanabha Fabrics")}
        </SheetTitle>
        <SheetDescription className="mt-2">
          {currentProduct
            ? selectedColourOption?.colour || currentProduct.colour
            : panel === "bag"
              ? "Your selected fabrics"
              : panel === "search"
                ? "The Padmanabha collection"
                : panel === "favorites"
                  ? "Your personal edit"
                  : "A world of beautiful fabrics"}
        </SheetDescription>

        {currentProduct && (
          <>
            <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden border border-[#E5DAC4]/60 bg-muted/20 mb-4 shadow-sm">
              <img
                className="w-full h-full object-cover transition-all duration-300"
                src={activeDisplayImage}
                alt={`${currentProduct.name} - ${selectedColourOption?.colour || "View"}`}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const fallback = currentProduct.imageUrl || (currentProduct as any).image_url;
                  if (fallback && target.src !== fallback) {
                    target.src = fallback;
                  } else {
                    target.src = "/placeholder.svg";
                  }
                }}
              />
              <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-semibold text-white">
                {selectedColourOption?.colour || currentProduct.colour}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{currentProduct.description}</p>
            <p className="text-xl font-bold text-primary mt-4">
              {money(effectivePrice)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {currentProduct.unit} · sample price
              </span>
            </p>

            {/* 1. Colour Variants & Multi-Colour Photos */}
            {colourOptions.length > 1 && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Colour: <span className="text-primary font-bold">{selectedColourOption?.colour || "Select Colour"}</span>
                  </span>
                  {colourOptions.length > 1 && (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {colourOptions.length} colours available
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {colourOptions.map((opt) => {
                    const isSelected = activeColour.toLowerCase() === opt.colour.toLowerCase();
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectColour(opt)}
                        className={`group relative flex items-center gap-2 p-1 pr-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#D15608] bg-[#D15608]/8 text-[#D15608] font-bold shadow-xs ring-2 ring-[#D15608]/20"
                            : "border-border hover:border-[#D15608] bg-card text-foreground"
                        }`}
                        title={opt.colour}
                      >
                        {opt.image ? (
                          <div className="relative size-8 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-muted">
                            <img
                              src={opt.image}
                              alt={opt.colour}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="size-3 text-white" />
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className="size-5 rounded-full border border-black/20 shadow-2xs shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: opt.colourHex || getColourHex(opt.colour) }}
                          >
                            {isSelected && <Check className="size-2.5 text-white" />}
                          </span>
                        )}
                        <span className="text-xs capitalize">{opt.colour}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Clothing Size Selection */}
            {availableSizes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Size: <span className="text-primary font-bold">{size || "Select Size"}</span>
                  </span>
                  <span className="text-[11px] text-[#D15608]">Sizing: S to 6XL</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => {
                    const isSelected = size === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSize(sz)}
                        className={`h-9 min-w-10 px-3 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#D15608] border-[#D15608] text-white shadow-sm ring-2 ring-[#D15608]/20"
                            : "bg-background border-border text-foreground hover:border-[#D15608] hover:text-[#D15608]"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-6 mb-5">
              <span className="text-xs">{currentProduct.unit === "metre" ? "Metres" : "Quantity"}</span>
              <div className="quantity-control">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  disabled={quantity === 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus />
                </Button>
                <span>{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
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
                <span>BUY NOW · {money(effectivePrice * quantity)}</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="!rounded-xl !h-auto min-h-[42px] py-2 px-2 text-xs font-semibold uppercase tracking-wider border-primary/30 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                  onClick={handleAddToCart}
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
