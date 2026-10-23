import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/utils/formatters";
import { ShieldCheck, Truck, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CheckoutPage() {
  const { subtotal, cartCount } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
        className="mb-6"
      />

      <SectionHeading
        kicker="Direct Artisan Dispatch"
        title="Secure Checkout"
        description="Ambattur, Chennai Showroom Fulfillment · Fast Domestic & Global Shipping."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 border border-[#E5DAC4] dark:border-[#B8913A]/25 rounded-lg bg-white dark:bg-[#262022] space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#6B1E2E] dark:text-[#FAF6EE] flex items-center gap-2">
              <Truck className="size-4 text-[#B8913A]" />
              Shipping Information (Placeholder)
            </h3>
            <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">
              Connect with existing <code>orderServices.createCheckoutOrder</code> backend endpoint.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                className="col-span-2 p-2.5 rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20"
                disabled
              />
              <input
                type="email"
                placeholder="Email Address"
                className="p-2.5 rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20"
                disabled
              />
              <input
                type="tel"
                placeholder="Phone (+91)"
                className="p-2.5 rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20"
                disabled
              />
              <textarea
                placeholder="Complete Address (Street, Menambedu, Ambattur, PIN)"
                className="col-span-2 p-2.5 rounded border border-[#E5DAC4] bg-[#FAF6EE] dark:bg-black/20 h-20"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="p-6 border border-[#B8913A]/30 rounded-lg bg-[#FAF6EE] dark:bg-[#262022] space-y-4 h-fit">
          <h4 className="font-['Playfair_Display'] text-base font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
            Order Total ({cartCount} items)
          </h4>
          <div className="text-2xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
            {formatPrice(subtotal)}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8A9A7B] font-semibold">
            <ShieldCheck className="size-4 text-[#B8913A]" />
            <span>256-Bit Encrypted Payment</span>
          </div>
          <div className="p-3 bg-white/60 dark:bg-black/20 rounded border border-[#B8913A]/20 text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
            Checkout page foundation initialized. You can also use the integrated Checkout Modal anytime.
          </div>
          <Link
            to="/cart"
            className="block text-center text-xs text-[#6B1E2E] dark:text-[#B8913A] hover:underline"
          >
            ← Return to Bag
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
