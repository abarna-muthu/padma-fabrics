import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatters";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";

export function CartPage() {
  const { cart, cartCount, subtotal, removeFromCart, updateQuantity } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Shopping Bag" }]} className="mb-6" />

      <SectionHeading
        kicker="Order Summary"
        title="Your Shopping Bag"
        description="Review selected weaves and quantities before proceeding to secure checkout."
      />

      {cart.length === 0 ? (
        <div className="p-12 border border-dashed border-[#B8913A]/40 rounded-lg bg-white dark:bg-[#262022] text-center my-8 max-w-lg mx-auto">
          <ShoppingBag className="size-12 text-[#B8913A] mx-auto mb-3 opacity-60" />
          <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
            Your Bag is Empty
          </h3>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-2 mb-6">
            Explore our curated ready-to-wear collections and authentic sarees to add your favorite styles.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#6B1E2E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#521623] shadow-xs"
          >
            <span>Explore Collections</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center gap-4 p-4 rounded-lg border border-[#E5DAC4] dark:border-[#B8913A]/25 bg-white dark:bg-[#262022]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="size-20 object-cover rounded-md border border-[#B8913A]/20"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                  <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-0.5">Size: {item.size || "Standard"}</p>
                  <p className="text-sm font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mt-1">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="size-7 rounded border border-[#E5DAC4] flex items-center justify-center text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-semibold px-2">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="size-7 rounded border border-[#E5DAC4] flex items-center justify-center text-xs"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-1.5 text-rose-600 hover:text-rose-800"
                  title="Remove item"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 border border-[#B8913A]/30 rounded-lg bg-[#FAF6EE] dark:bg-[#262022] h-fit space-y-4">
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
              Price Details ({cartCount} Items)
            </h4>
            <div className="flex justify-between text-xs text-[#5C5549] dark:text-[#B5AC9E]">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#8A9A7B] font-semibold">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="pt-3 border-t border-[#B8913A]/25 flex justify-between text-base font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
              <span>Total Payable</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full py-3 rounded-md bg-[#6B1E2E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#521623] flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
