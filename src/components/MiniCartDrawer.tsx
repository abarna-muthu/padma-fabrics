import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/utils/formatters";
import { Link } from "@tanstack/react-router";

export function MiniCartDrawer() {
  const { cart, cartCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const { setIsCheckoutOpen } = useStore();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-[#0E0E0E] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EBE6DC] flex items-center justify-between bg-[#FAF6EE]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-[#9F160A]" />
              <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0E0E0E]">
                Shopping Bag ({cartCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-5 py-3 bg-[#FAF7F2] border-b border-[#EBE6DC] text-xs">
            {subtotal >= 999 ? (
              <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span>🎉</span> You unlocked <strong>FREE Standard Shipping</strong>!
              </p>
            ) : (
              <div>
                <p className="text-[#5C5549]">
                  Add <strong>{formatPrice(999 - subtotal)}</strong> more to get <strong>Free Shipping</strong>
                </p>
                <div className="w-full bg-[#E5DAC4] h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-[#9F160A] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="size-16 rounded-full bg-[#FAF6EE] text-[#9F160A] flex items-center justify-center mx-auto">
                  <ShoppingBag className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-2xl font-semibold">Your bag is empty</h3>
                <p className="text-xs text-[#5C5549] max-w-xs mx-auto">
                  Discover handcrafted weaves, silks, coordsets, and everyday tunics in our collection.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block mt-4 px-6 py-2.5 rounded-full bg-[#9F160A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#7D1107] transition-all"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3.5 pb-4 border-b border-[#EBE6DC] last:border-b-0"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="size-20 sm:size-24 rounded-lg object-cover bg-[#FAF6EE] shrink-0 border border-[#EBE6DC]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#0E0E0E] line-clamp-1 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-black/40 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#5C5549]">
                        {item.size && (
                          <span className="px-2 py-0.5 rounded bg-[#FAF6EE] border border-[#EBE6DC] font-medium text-[#0E0E0E]">
                            Size: {item.size}
                          </span>
                        )}
                        {item.colour && (
                          <span>· {item.colour}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#EBE6DC] rounded-md overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="p-1.5 hover:bg-[#FAF6EE] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="p-1.5 hover:bg-[#FAF6EE] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      <span className="font-['Manrope'] font-bold text-sm text-[#9F160A]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#EBE6DC] bg-[#FAF6EE] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5C5549]">Subtotal</span>
                <span className="font-['Manrope'] font-bold text-base text-[#0E0E0E]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#5C5549]">
                Taxes included. Delivery calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 rounded-lg border border-[#0E0E0E] text-[#0E0E0E] hover:bg-black/5 text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer"
                >
                  View Bag
                </Link>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-lg bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                >
                  <span>Checkout</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MiniCartDrawer;
