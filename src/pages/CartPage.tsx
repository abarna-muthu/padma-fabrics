import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatters";
import { Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Truck,
  MessageCircle,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function CartPage() {
  const { cart, cartCount, subtotal, removeFromCart, updateQuantity, clearCart } = useCart();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "CHENNAI10" || code === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      toast.success("Coupon applied! 10% discount added.");
    } else if (code === "FESTIVE15") {
      const discount = Math.round(subtotal * 0.15);
      setAppliedDiscount(discount);
      toast.success("Festive offer applied! 15% discount added.");
    } else {
      setCouponError("Invalid coupon code. Try CHENNAI10");
    }
  };

  const finalTotal = Math.max(0, subtotal - appliedDiscount);

  // WhatsApp order text
  const whatsappItemsText = cart
    .map((item, i) => `${i + 1}. ${item.name} (${item.size || "Standard"}) x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join("\n");
  const whatsappUrl = `https://wa.me/919940135700?text=${encodeURIComponent(
    `Hello Padmanabha Fabrics! I want to order these items from my shopping bag:\n\n${whatsappItemsText}\n\nTotal: ${formatPrice(finalTotal)}\nPlease confirm availability and dispatch!`,
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          { label: "Shopping Bag" },
        ]}
        className="mb-6"
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5DAC4] dark:border-[#B8913A]/20">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B8913A]">
            Selected Weaves
          </span>
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mt-1">
            Your Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-1.5">
            Review your selected fabrics and silhouettes before proceeding to secure checkout.
          </p>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Empty your entire shopping bag?")) {
                clearCart();
                toast.info("Bag emptied");
              }
            }}
            className="text-xs font-semibold uppercase tracking-wider text-[#5C5549] dark:text-[#B5AC9E] hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="size-3.5" />
            <span>Clear Bag</span>
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="p-12 sm:p-16 border border-dashed border-[#B8913A]/40 rounded-xl bg-white dark:bg-[#1E191A] text-center my-10 max-w-lg mx-auto shadow-xs">
          <div className="size-16 rounded-full bg-[#FAF6EE] dark:bg-[#2A2425] flex items-center justify-center mx-auto mb-4 border border-[#B8913A]/25">
            <ShoppingBag className="size-8 text-[#B8913A]" strokeWidth={1.5} />
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
            Your Bag is Empty
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-2 mb-6 leading-relaxed">
            Discover authentic Kanchipuram silk sarees, designer coordsets, chudithar tops, and handlooms.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#6B1E2E] hover:bg-[#521623] text-white text-xs font-semibold uppercase tracking-widest shadow-md transition-all"
            >
              <span>Explore Collections</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/wishlist"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-[#B8913A] text-[#6B1E2E] dark:text-[#FAF6EE] text-xs font-semibold uppercase tracking-widest hover:bg-[#FAF6EE] dark:hover:bg-white/5 transition-all"
            >
              <span>View Saved Wishlist</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartItemId}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-[#E5DAC4] dark:border-[#B8913A]/25 bg-white dark:bg-[#1E191A] shadow-xs hover:border-[#B8913A]/40 transition-colors"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-24 object-cover rounded-lg border border-[#B8913A]/20 bg-[#FAF6EE] shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";
                  }}
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B8913A] block">
                    {item.category || "Exclusive Weave"}
                  </span>
                  <h4 className="font-semibold text-sm sm:text-base text-[#0E0E0E] dark:text-[#FAF6EE] truncate mt-0.5">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF6EE] dark:bg-white/10 text-[#5C5549] dark:text-[#FAF6EE] border border-[#E5DAC4] dark:border-white/10">
                      Size: {item.size || "Standard"}
                    </span>
                    {item.fabric && (
                      <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
                        · {item.fabric}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-base font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                      {formatPrice(item.price)}
                    </p>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-xs text-[#5C5549] dark:text-[#B5AC9E] line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DAC4]/60 dark:border-white/10">
                  <div className="flex items-center border border-[#E5DAC4] dark:border-white/20 rounded-md bg-[#FAF6EE] dark:bg-black/20">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, -1)}
                      className="size-9 sm:size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer touch-manipulation"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold px-3 tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId, 1)}
                      className="size-9 sm:size-8 flex items-center justify-center text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer touch-manipulation"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2.5 sm:p-2 text-rose-600 hover:text-white hover:bg-rose-500 rounded-lg transition-all cursor-pointer touch-manipulation"
                    title="Remove item from bag"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6B1E2E] dark:text-[#B8913A] hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right: Order Summary Box */}
          <div className="space-y-4">
            <div className="p-6 border border-[#B8913A]/30 rounded-xl bg-[#FAF6EE] dark:bg-[#1E191A] space-y-4 shadow-xs">
              <h4 className="font-['Playfair_Display'] text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                Order Summary ({cartCount} {cartCount === 1 ? "Item" : "Items"})
              </h4>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5C5549] dark:text-[#B5AC9E]">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-[#0E0E0E] dark:text-[#FAF6EE]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Code</span>
                    <span>-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#8A9A7B] font-semibold">
                  <span className="flex items-center gap-1">
                    <Truck className="size-3.5" />
                    <span>Domestic Shipping</span>
                  </span>
                  <span>FREE</span>
                </div>

                <div className="pt-3 border-t border-[#B8913A]/25 flex justify-between text-base font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                  <span>Total Payable</span>
                  <span className="text-xl">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-[#B8913A]/20">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 size-3.5 text-[#5C5549]" />
                    <input
                      type="text"
                      placeholder="Promo (e.g. CHENNAI10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-2 text-xs rounded border border-[#E5DAC4] dark:border-white/10 bg-white dark:bg-black/20 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[38px] px-3.5 py-2 bg-[#FAF6EE] dark:bg-white/10 hover:bg-[#B8913A] hover:text-white border border-[#B8913A]/40 rounded text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer touch-manipulation"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
              </form>

              {/* Direct Checkout Button */}
              <Link
                to="/checkout"
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#6B1E2E] hover:bg-[#521623] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="size-4" />
              </Link>

              {/* WhatsApp instant enquiry / buy button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs touch-manipulation"
              >
                <MessageCircle className="size-4" />
                <span>Order via WhatsApp</span>
              </a>

              {/* Security trust badge */}
              <div className="pt-3 border-t border-[#B8913A]/20 flex items-center justify-center gap-1.5 text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
                <ShieldCheck className="size-4 text-[#B8913A]" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>

            {/* Ambattur showroom dispatch note */}
            <div className="p-4 rounded-lg border border-[#E5DAC4] dark:border-[#B8913A]/20 bg-white dark:bg-[#1E191A] text-xs space-y-1.5 text-[#5C5549] dark:text-[#B5AC9E]">
              <div className="flex items-center gap-1.5 font-semibold text-[#0E0E0E] dark:text-[#FAF6EE]">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                <span>Chennai Showroom Quality Checked</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Every fabric is inspected for loom precision in Menambedu, Ambattur prior to dispatch.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
