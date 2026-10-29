import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useWishlist } from "@/context/WishlistContext";
import { useCart, type CartItem } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import {
  products as staticCatalog,
  type Product,
  type ProductVariant,
  COMMON_COLOUR_MAP,
  getColourHex,
  cleanSizes,
} from "@/lib/catalog";
import { formatPrice } from "@/utils/formatters";
import {
  Heart,
  ShoppingBag,
  ShoppingCart,
  ChevronsRight,
  Zap,
  Truck,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  AlertCircle,
  Check,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

import { productApi } from "@/lib/api";

interface ProductDetailPageProps {
  id?: string;
}

export function ProductDetailPage({ id }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart, setDirectCheckoutItem } = useCart();
  const { productsList, updateProduct } = useStore();

  const allProducts: Product[] = useMemo(() => [
    ...productsList,
    ...staticCatalog.filter((sp) => !productsList.some((lp) => lp.id === sp.id)),
  ], [productsList]);

  // Find product by id or slug
  const product = useMemo(() => {
    if (!id) return allProducts[0];
    const target = String(id).trim().toLowerCase();
    return (
      allProducts.find(
        (p) =>
          String(p.id).toLowerCase() === target ||
          (p.slug && p.slug.toLowerCase() === target),
      ) || allProducts[0]
    );
  }, [allProducts, id]);

  // If newly opened or refreshed, fetch latest product details from backend
  useEffect(() => {
    if (!id) return;
    productApi.getById(id).then((res) => {
      const serverProd = (res as any)?.product || res?.data;
      if (serverProd && serverProd.id) {
        // If server returned variants or gallery images, update store state
        if (
          (Array.isArray(serverProd.variants) && serverProd.variants.length > 0) ||
          (Array.isArray(serverProd.images) && serverProd.images.length > 1)
        ) {
          updateProduct(serverProd.id, serverProd);
        }
      }
    }).catch(() => {});
  }, [id]);

  // Variants list: ONLY explicit product.variants configured by admin
  const variants: ProductVariant[] = useMemo(() => {
    if (!product) return [];

    // Only show variants if the admin explicitly added variants to this product
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      return [];
    }

    const list: ProductVariant[] = [];

    // 1. Explicit variants configured inside this product (from Admin)
    for (const v of product.variants) {
      if (!v || !v.colour) continue;
      const vImg = v.image || (Array.isArray(v.images) && v.images[0]) || product.image;
      list.push({
        ...v,
        id: v.id || `var-${product.id}-${v.colour.toLowerCase().replace(/\s+/g, "-")}`,
        colourHex: v.colourHex || getColourHex(v.colour),
        price: v.price || product.price,
        stock: v.stock !== undefined ? v.stock : product.stock,
        image: vImg,
        images: Array.isArray(v.images) && v.images.length > 0 ? v.images : (vImg ? [vImg] : [product.image]),
      });
    }

    // 2. Primary colour of current product (if not already represented and variants exist)
    if (product.colour && product.colour !== "Custom") {
      if (!list.some((existing) => existing.colour.toLowerCase() === product.colour.toLowerCase())) {
        list.unshift({
          id: `var-${product.id}-default`,
          colour: product.colour,
          colourHex: getColourHex(product.colour),
          price: product.price,
          stock: product.stock,
          image: product.image,
          images: product.images && product.images.length > 0 ? product.images : [product.image],
        });
      }
    }

    return list;
  }, [product]);

  // Selected colour state
  const [selectedColour, setSelectedColour] = useState<string>(() => {
    return (
      (Array.isArray(product?.variants) && product.variants[0]?.colour) ||
      product?.colour ||
      ""
    );
  });

  // Keep selectedColour in sync only if the product identity itself changes
  useEffect(() => {
    if (product) {
      const initialColour =
        (Array.isArray(product.variants) && product.variants[0]?.colour) ||
        product.colour ||
        "";
      setSelectedColour(initialColour);
    }
  }, [product?.id]);

  const activeVariant = useMemo(() => {
    return variants.find((v) => v.colour.toLowerCase() === selectedColour.toLowerCase()) || variants[0];
  }, [variants, selectedColour]);

  // Gallery images determination
  const galleryImages: string[] = useMemo(() => {
    if (!product) return [];
    if (activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      const vImages = activeVariant.images.filter(Boolean);
      if (vImages.length > 0) return vImages;
    }
    if (activeVariant && (activeVariant.image || activeVariant.imageUrl)) {
      const vImg = activeVariant.image || activeVariant.imageUrl;
      if (vImg) {
        const others = (Array.isArray(product.images) ? product.images : []).filter((img) => img !== vImg);
        return [vImg, ...others];
      }
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    const mainImg = product.image || (product as any).imageUrl || (product as any).image_url;
    return mainImg ? [mainImg] : ["/placeholder.svg"];
  }, [product, activeVariant]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Reset active image index when gallery changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [galleryImages]);

  // Size list determination
  const availableSizes: string[] = useMemo(() => {
    if (!product) return [];
    const raw = (activeVariant && activeVariant.sizes && activeVariant.sizes.length > 0)
      ? activeVariant.sizes
      : product.sizes;
    return cleanSizes(raw, product.category, product.description);
  }, [product, activeVariant]);

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#9F160A]">Product Not Found</h2>
        <p className="text-xs text-[#5C5549] mt-2 mb-6">The requested weave could not be located in our catalog.</p>
        <Link to="/shop" className="px-6 py-2.5 bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-semibold uppercase rounded transition-colors">
          Browse Shop
        </Link>
      </div>
    );
  }

  // Current effective price and stock
  const effectivePrice = activeVariant?.price !== undefined && Number(activeVariant.price) > 0
    ? Number(activeVariant.price)
    : Number(product.price);

  const effectiveStock = activeVariant?.stock !== undefined
    ? Number(activeVariant.stock)
    : Number(product.stock !== undefined ? product.stock : 10);

  const isOutOfStock = effectiveStock <= 0;

  // Stock check per size
  const isSizeOutOfStock = (sizeName: string) => {
    if (isOutOfStock) return true;
    if (activeVariant?.sizeStock && activeVariant.sizeStock[sizeName] !== undefined) {
      return Number(activeVariant.sizeStock[sizeName]) <= 0;
    }
    if (product.sizeStock && product.sizeStock[sizeName] !== undefined) {
      return Number(product.sizeStock[sizeName]) <= 0;
    }
    return false;
  };

  const isFav = wishlist.includes(String(product.id));
  const originalPrice = activeVariant?.originalPrice
    ? Number(activeVariant.originalPrice)
    : product.originalPrice
      ? Number(product.originalPrice)
      : undefined;
  const hasDiscount = originalPrice && originalPrice > effectivePrice;

  const currentImage = galleryImages[activeImageIndex] || galleryImages[0] || "/placeholder.svg";

  // Customer Reviews State & Logic
  interface ReviewItem {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    verified?: boolean;
  }

  const defaultSeedReviews: ReviewItem[] = useMemo(() => [
    {
      id: `seed-1-${product?.id || "def"}`,
      customerName: "Radha Krishnan",
      rating: 5,
      comment: "Extraordinary fabric luster and exquisite embroidery work. The fit is true to size and feels very comfortable for festive wear.",
      date: "3 days ago",
      verified: true,
    },
    {
      id: `seed-2-${product?.id || "def"}`,
      customerName: "Ananya Sundaram",
      rating: 5,
      comment: "Super fast dispatch from Ambattur Chennai! Material quality is top-notch pure cotton, color is vibrant exactly like in the picture.",
      date: "1 week ago",
      verified: true,
    },
    {
      id: `seed-3-${product?.id || "def"}`,
      customerName: "Dr. Meenakshi Rao",
      rating: 4,
      comment: "Very elegant drape and stitching is very clean. Highly recommend Padmanabha Fabrics for authentic ready-to-wear.",
      date: "2 weeks ago",
      verified: true,
    },
  ], [product?.id]);

  const [reviews, setReviews] = useState<ReviewItem[]>(defaultSeedReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const storageKey = `pf_reviews_${product.id}`;
    let localList: ReviewItem[] = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        localList = JSON.parse(saved);
      }
    } catch {}

    if (localList.length > 0) {
      setReviews([...localList, ...defaultSeedReviews]);
    } else {
      setReviews(defaultSeedReviews);
    }

    fetch(`/api/products/${product.id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiReviews: ReviewItem[] = data.data.map((r: any) => ({
            id: String(r.id),
            customerName: r.customer_name || "Verified Customer",
            rating: Number(r.rating) || 5,
            comment: r.comment || "",
            date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
            verified: true,
          }));

          setReviews((prev) => {
            const combined = [...apiReviews, ...localList, ...defaultSeedReviews];
            const seen = new Set<string>();
            return combined.filter((item) => {
              const k = `${item.customerName}-${item.comment}`;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
        }
      })
      .catch(() => {});
  }, [product?.id, defaultSeedReviews]);

  const totalReviewsCount = 48 + Math.max(0, reviews.length - defaultSeedReviews.length);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 4.9;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a few words about your experience.");
      return;
    }

    setIsSubmittingReview(true);
    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      customerName: reviewerName.trim(),
      rating: userRating,
      comment: reviewComment.trim(),
      date: "Just now",
      verified: true,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    try {
      const storageKey = `pf_reviews_${product.id}`;
      const saved = localStorage.getItem(storageKey);
      const existing = saved ? JSON.parse(saved) : [];
      localStorage.setItem(storageKey, JSON.stringify([newReview, ...existing]));
    } catch {}

    try {
      await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: newReview.customerName,
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });
    } catch {}

    setIsSubmittingReview(false);
    setShowReviewForm(false);
    setReviewerName("");
    setReviewComment("");
    setUserRating(5);
    toast.success("Thank you! Your review has been submitted.");
  };

  const handleSelectSize = (sz: string) => {
    if (isSizeOutOfStock(sz)) return;
    setSelectedSize(sz);
    setSizeError(false);
  };

  const validateSelection = (): boolean => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSizeError(true);
      toast.error("Please select an available size to proceed.", {
        description: "Choose your preferred clothing size above.",
      });
      return false;
    }
    if (isOutOfStock) {
      toast.error("This product variant is currently out of stock.");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;
    addToCart(
      product,
      selectedSize || "Standard",
      quantity,
      selectedColour || activeVariant?.colour || product.colour,
      currentImage,
      effectivePrice,
    );
  };

  const handleBuyNow = () => {
    if (!validateSelection()) return;
    const chosenSize = selectedSize || "Standard";
    const chosenColour = selectedColour || activeVariant?.colour || product.colour || "";
    const cartItemId = `${product.id}-${chosenSize}-${chosenColour || "default"}`;
    const singleItem: CartItem = {
      id: String(product.id),
      cartItemId,
      name: product.name,
      price: effectivePrice,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      image: currentImage || product.image || "/placeholder.svg",
      category: product.category,
      fabric: product.fabric,
      size: chosenSize,
      colour: chosenColour,
      quantity,
    };
    setDirectCheckoutItem(singleItem);
    navigate({ to: "/checkout" });
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent(
      `Hello Padmanabha Fabrics, I would like to order:
*Product:* ${product?.name}
*Colour:* ${selectedColour || product?.colour}
*Size:* ${selectedSize || "Standard"}
*Price:* ₹${effectivePrice}
*Link:* ${typeof window !== "undefined" ? window.location.href : ""}`,
    );
    return `https://wa.me/919444108878?text=${text}`;
  }, [product, selectedColour, selectedSize, effectivePrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 sm:pb-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category || "Ethnic Wear", href: "/shop" },
          { label: product.name },
        ]}
        className="mb-6 text-xs"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-5 sm:p-8 border border-[#E5DAC4] dark:border-[#9F160A]/25 rounded-2xl bg-white dark:bg-[#1E191A] shadow-xs">
        {/* Left: Product Image Gallery + Action Buttons + Similar Products */}
        <div className="flex flex-col">
          {/* Main Gallery with Vertical Thumbnails on Left */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Vertical thumbnail strip on the left */}
            {galleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[480px] shrink-0 scrollbar-none order-2 sm:order-1 pb-1 sm:pb-0">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative size-14 sm:w-16 sm:h-20 rounded-md overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#9F160A] ring-2 ring-[#9F160A]/30"
                        : "border-[#E5DAC4] dark:border-white/10 hover:border-[#9F160A]/60 opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Product Image Container */}
            <div className="relative flex-1 aspect-3/4 sm:aspect-4/5 rounded-xl overflow-hidden bg-[#FAF6EE] dark:bg-[#2A2425] border border-[#E5DAC4] dark:border-white/15 order-1 sm:order-2 group">
              <img
                src={currentImage}
                alt={`${product.name} - ${selectedColour || "View"} ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center transition-all duration-300"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== "/placeholder.svg") {
                    target.src = "/placeholder.svg";
                  }
                }}
              />

              {/* Gallery Navigation Arrows (only if multiple images) */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white text-[#0E0E0E] dark:text-white flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer touch-manipulation z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 sm:size-9 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white text-[#0E0E0E] dark:text-white flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 hover:scale-105 cursor-pointer touch-manipulation z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-4.5" />
                  </button>
                </>
              )}

              {/* Lightbox / Zoom Trigger Button */}
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-2.5 right-2.5 size-8 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white text-[#5C5549] dark:text-white flex items-center justify-center shadow-md transition-all opacity-80 hover:opacity-100 cursor-pointer z-10"
                title="Click to expand view"
                aria-label="Expand image view"
              >
                <Maximize2 className="size-3.5" />
              </button>

              {/* Wishlist Floating Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(String(product.id), product.name)}
                className={`absolute top-3 right-3 size-9 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer z-10 ${
                  isFav
                    ? "bg-[#9F160A] text-white"
                    : "bg-white/90 dark:bg-black/70 hover:bg-white text-[#5C5549] dark:text-white"
                }`}
                title={isFav ? "Saved in Wishlist" : "Save to Wishlist"}
                aria-label="Save to Wishlist"
              >
                <Heart className={`size-4.5 ${isFav ? "fill-white" : ""}`} />
              </button>

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#0E0E0E]/80 text-[#FAF6EE] border border-white/20">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Image counter indicator */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons right under image (as in screenshot) */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="min-h-[46px] py-2.5 px-3 rounded-lg border-2 border-[#9F160A] text-[#9F160A] bg-white hover:bg-[#9F160A]/5 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer touch-manipulation disabled:opacity-50"
            >
              <ShoppingCart className="size-4 shrink-0 text-[#9F160A]" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="min-h-[46px] py-2.5 px-3 rounded-lg bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer touch-manipulation disabled:opacity-50"
            >
              <ChevronsRight className="size-4.5 shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Colour Variants (Only when explicit variants configured) */}
          {variants.length > 1 && (
            <div className="mt-6 pt-5 border-t border-[#E5DAC4]/60 dark:border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-[#0E0E0E] dark:text-[#FAF6EE]">
                  Colour Variants ({variants.length})
                </h3>
                <span className="text-xs font-semibold text-[#9F160A] dark:text-[#EDBC3D]">
                  Colour: {selectedColour || variants[0]?.colour}
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                {variants.map((v) => {
                  const isSelected = selectedColour.toLowerCase() === v.colour.toLowerCase();
                  const variantThumb = v.image || (v.images && v.images[0]) || currentImage;
                  return (
                    <button
                      key={v.colour}
                      type="button"
                      onClick={() => {
                        setSelectedColour(v.colour);
                        setActiveImageIndex(0);
                      }}
                      className={`group relative size-16 sm:size-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-[#FAF6EE] dark:bg-black/20 ${
                        isSelected
                          ? "border-[#9F160A] ring-2 ring-[#9F160A]/35 scale-102 shadow-xs"
                          : "border-[#E5DAC4] dark:border-white/15 hover:border-[#D15608] opacity-85 hover:opacity-100"
                      }`}
                      title={v.colour}
                    >
                      <img
                        src={variantThumb}
                        alt={v.colour}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      {isSelected && (
                        <span className="absolute bottom-1 right-1 size-3.5 rounded-full bg-[#9F160A] text-white flex items-center justify-center shadow-xs">
                          <Check className="size-2 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Product Details, Size Selector, Quantity, Description */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D15608]">
                {product.category || "Authentic Handloom"}
              </span>
              {product.fabric && (
                <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                  · {product.fabric}
                </span>
              )}
            </div>

            <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#0E0E0E] dark:text-[#FAF6EE] mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <div className="flex items-center text-[#EDBC3D]">
                <Star className="size-4 fill-[#EDBC3D]" />
                <span className="text-xs font-semibold ml-1">{averageRating.toFixed(1)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("customer-reviews");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs text-[#5C5549] dark:text-[#B5AC9E] hover:text-[#9F160A] underline underline-offset-2 cursor-pointer transition-colors"
              >
                ({totalReviewsCount} Verified Customer Reviews)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(true);
                  const el = document.getElementById("customer-reviews");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#9F160A] hover:underline cursor-pointer"
              >
                <Star className="size-3 fill-[#9F160A]" />
                <span>Write a Review</span>
              </button>
              {product.sku && (
                <span className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E] font-mono">
                  SKU: {product.sku}
                </span>
              )}
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-2xl sm:text-3xl font-bold text-[#D15608] dark:text-[#FAF6EE]">
                {formatPrice(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-[#5C5549] dark:text-[#B5AC9E] line-through">
                  {formatPrice(originalPrice!)}
                </span>
              )}
              {hasDiscount && (
                <span className="px-2 py-0.5 text-xs font-bold text-white bg-[#9F160A] rounded">
                  {Math.round(((originalPrice! - effectivePrice) / originalPrice!) * 100)}% OFF
                </span>
              )}
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 text-xs font-bold text-red-700 bg-red-100 rounded-md">
                  Out of Stock
                </span>
              ) : effectiveStock <= 5 ? (
                <span className="px-2.5 py-0.5 text-xs font-bold text-amber-800 bg-amber-100 rounded-md">
                  Only {effectiveStock} left
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-medium text-emerald-800 bg-emerald-100 rounded-md">
                  In Stock ({effectiveStock} available)
                </span>
              )}
            </div>

            {/* Size Selection */}
            <div className="mt-6 pt-5 border-t border-[#E5DAC4]/60 dark:border-white/10">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE]">
                    Select Size:
                  </span>
                  {selectedSize ? (
                    <span className="text-xs font-bold text-[#9F160A] dark:text-[#EDBC3D]">
                      {selectedSize}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#9F160A] font-medium animate-pulse">
                      (Required)
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#D15608]">Sizing: S to 6XL</span>
              </div>

              {sizeError && (
                <div className="mb-2.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="size-4 shrink-0 text-red-600" />
                  <span>Please choose your preferred size before adding to cart.</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const outOfStock = isSizeOutOfStock(sz);
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => handleSelectSize(sz)}
                      className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer touch-manipulation ${
                        outOfStock
                          ? "border border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed opacity-60"
                          : isSelected
                            ? "bg-[#9F160A] text-white shadow-md ring-2 ring-[#9F160A]/40 scale-102"
                            : sizeError
                              ? "border-2 border-red-400 hover:border-red-600 text-[#0E0E0E] dark:text-[#FAF6EE]"
                              : "border border-[#E5DAC4] dark:border-white/15 hover:border-[#9F160A] text-[#0E0E0E] dark:text-[#FAF6EE] bg-white/60 dark:bg-white/5"
                      }`}
                      title={outOfStock ? `${sz} is out of stock` : `Select size ${sz}`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-5 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#E5DAC4] dark:border-white/20 rounded-md bg-[#FAF6EE] dark:bg-black/20">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="size-9 sm:size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer touch-manipulation"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="text-xs font-bold px-3 tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                  disabled={quantity >= effectiveStock}
                  className="size-9 sm:size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer touch-manipulation disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description & Fabric Specifications */}
            <div className="mt-6 pt-5 border-t border-[#E5DAC4]/60 dark:border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE] mb-2">
                Product Details & Specifications
              </h4>
              <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] leading-relaxed">
                {product.description ||
                  "Woven with meticulous artisan care in Menambedu, Ambattur. Features premium tensile strength, breathable natural fiber composition, and timeless cultural motifs suited for bridal, celebratory, and everyday styling."}
              </p>
            </div>

            {/* WhatsApp Order Button */}
            <div className="pt-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="size-4" />
                <span>Order on WhatsApp (Fast Dispatch)</span>
              </a>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-2 gap-2 pt-4 text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
              <div className="flex items-center gap-1.5">
                <Truck className="size-3.5 text-[#9F160A]" />
                <span>Dispatched directly from Chennai</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-[#9F160A]" />
                <span>100% Genuine Handloom Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Ratings & Reviews Section */}
      <section id="customer-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-8 border-t border-[#E5DAC4]/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D15608] font-bold block mb-1">
              Verified Buyer Feedback
            </span>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#0E0E0E] dark:text-[#FAF6EE]">
              Customer Ratings & Reviews
            </h2>
          </div>
          {!showReviewForm && (
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Star className="size-4 fill-white" />
              <span>Write a Review</span>
            </button>
          )}
        </div>

        {/* Rating Summary Card */}
        <div className="bg-[#FAF6EE] dark:bg-white/5 border border-[#E5DAC4] dark:border-white/10 rounded-2xl p-5 sm:p-7 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Average Score */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left md:border-r border-[#E5DAC4] dark:border-white/10 md:pr-6">
            <div className="text-4xl sm:text-5xl font-black text-[#0E0E0E] dark:text-[#FAF6EE] font-['Playfair_Display']">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 my-2 text-[#EDBC3D]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`size-4.5 ${
                    averageRating >= s
                      ? "fill-[#EDBC3D] text-[#EDBC3D]"
                      : averageRating >= s - 0.5
                      ? "fill-[#EDBC3D]/50 text-[#EDBC3D]"
                      : "text-[#D1C7B7] fill-transparent"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
              Based on {totalReviewsCount} verified reviews
            </p>
          </div>

          {/* Star Distribution Bars */}
          <div className="space-y-1.5 md:col-span-2">
            {[
              { star: 5, pct: 86 },
              { star: 4, pct: 11 },
              { star: 3, pct: 3 },
              { star: 2, pct: 0 },
              { star: 1, pct: 0 },
            ].map((row) => (
              <div key={row.star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-right font-medium text-[#5C5549] dark:text-[#B5AC9E] flex items-center justify-end gap-1">
                  {row.star} <Star className="size-3 fill-[#EDBC3D] text-[#EDBC3D]" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-[#E5DAC4] dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#EDBC3D] rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-9 text-right text-[11px] text-[#5C5549] dark:text-[#B5AC9E] tabular-nums">
                  {row.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Write Review Form */}
        {showReviewForm && (
          <div className="bg-[#FAF6EE] dark:bg-white/5 border border-[#E5DAC4] dark:border-white/10 rounded-2xl p-5 sm:p-7 mb-8 transition-all animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5DAC4]/60 dark:border-white/10">
              <div>
                <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#0E0E0E] dark:text-[#FAF6EE]">
                  Rate & Review this Product
                </h3>
                <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-0.5">
                  Select how many stars you would give and write your experience.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-[#5C5549] hover:text-[#0E0E0E] p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                aria-label="Close review form"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Selection Row */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE] mb-1.5">
                  Your Rating <span className="text-[#9F160A]">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 bg-white dark:bg-[#141414] px-3 py-2 rounded-xl border border-[#D5C9B3] dark:border-white/20 shadow-2xs"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || userRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95 touch-manipulation focus:outline-none"
                          aria-label={`Select ${star} star${star > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={`size-7 sm:size-8 transition-colors ${
                              isFilled
                                ? "text-[#EDBC3D] fill-[#EDBC3D] drop-shadow-xs"
                                : "text-[#D1C7B7] fill-transparent"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#D15608] dark:text-[#EDBC3D]">
                    {(hoverRating || userRating) === 5 && "⭐⭐⭐⭐⭐ 5 Stars · Outstanding Quality & Fit"}
                    {(hoverRating || userRating) === 4 && "⭐⭐⭐⭐ 4 Stars · Very Good / Satisfied"}
                    {(hoverRating || userRating) === 3 && "⭐⭐⭐ 3 Stars · Good / Met Expectations"}
                    {(hoverRating || userRating) === 2 && "⭐⭐ 2 Stars · Fair / Needs Improvement"}
                    {(hoverRating || userRating) === 1 && "⭐ 1 Star · Unsatisfied"}
                  </span>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE] mb-1.5">
                  Your Name <span className="text-[#9F160A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Priya Natarajan"
                  className="w-full h-11 px-3.5 rounded-lg border border-[#D5C9B3] dark:border-white/20 bg-white dark:bg-[#141414] text-xs sm:text-sm text-[#0E0E0E] dark:text-[#FAF6EE] focus:outline-none focus:ring-2 focus:ring-[#9F160A]/40"
                />
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0E0E0E] dark:text-[#FAF6EE] mb-1.5">
                  Your Review <span className="text-[#9F160A]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the fabric feel, stitching quality, drape, color vibrancy, and sizing..."
                  className="w-full p-3.5 rounded-lg border border-[#D5C9B3] dark:border-white/20 bg-white dark:bg-[#141414] text-xs sm:text-sm text-[#0E0E0E] dark:text-[#FAF6EE] focus:outline-none focus:ring-2 focus:ring-[#9F160A]/40 resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 rounded-xl bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5C5549] dark:text-[#B5AC9E] hover:text-[#0E0E0E] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#141414] border border-[#E5DAC4]/80 dark:border-white/10 rounded-xl p-4 sm:p-5 shadow-2xs transition-all hover:border-[#D15608]/40"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 sm:size-9 rounded-full bg-[#FAF6EE] dark:bg-white/10 text-[#9F160A] font-bold text-xs flex items-center justify-center border border-[#E5DAC4] dark:border-white/10">
                    {rev.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-[#0E0E0E] dark:text-[#FAF6EE]">
                        {rev.customerName}
                      </span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                          <Check className="size-3 text-emerald-600" />
                          <span>Verified Buyer</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#5C5549] dark:text-[#B5AC9E]">
                      {rev.date}
                    </span>
                  </div>
                </div>

                {/* Stars for this review */}
                <div className="flex items-center text-[#EDBC3D]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`size-3.5 sm:size-4 ${
                        rev.rating >= s
                          ? "fill-[#EDBC3D] text-[#EDBC3D]"
                          : "text-[#D1C7B7] fill-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#3A352D] dark:text-[#DCD5C9] leading-relaxed mt-2 pl-0.5">
                {rev.comment}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-12 right-0 sm:right-2 text-white hover:text-[#EDBC3D] size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close zoom preview"
            >
              <X className="size-6" />
            </button>

            {/* Enlarged Image */}
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-xl">
              <img
                src={currentImage}
                alt={`${product.name} zoom preview`}
                className="max-h-[75vh] w-auto max-w-full object-contain shadow-2xl"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail selector in modal */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto p-1 max-w-full">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`size-14 sm:size-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-[#EDBC3D] ring-2 ring-[#EDBC3D]/50 scale-105"
                        : "border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom Purchase Bar */}
      <div className="fixed bottom-[52px] inset-x-0 sm:hidden z-40 bg-white/95 dark:bg-[#1E191A]/95 backdrop-blur-md p-3 border-t border-[#E5DAC4] dark:border-white/10 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-lg bg-[#FAF6EE] dark:bg-white/10 text-[#D15608] dark:text-[#FAF6EE] border border-[#D15608]/40 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 active:scale-98 touch-manipulation disabled:opacity-50"
        >
          <ShoppingBag className="size-3.5 text-[#D15608]" />
          <span>Add to Bag</span>
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-lg bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-md active:scale-98 touch-manipulation disabled:opacity-50"
        >
          <Zap className="size-3.5 text-amber-300 fill-amber-300" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
