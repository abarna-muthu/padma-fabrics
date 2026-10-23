import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Package, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function OrdersPage() {
  const { customer, isLoggedIn } = useCustomerAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "My Orders & Tracking" }]} className="mb-6" />

      <SectionHeading
        kicker="Fulfillment & Tracking"
        title="Your Orders"
        description="Monitor status, invoices, and shipment tracking from our Ambattur, Chennai showroom."
      />

      <div className="p-10 border border-dashed border-[#B8913A]/40 rounded-lg bg-white dark:bg-[#262022] text-center my-6 max-w-xl mx-auto space-y-4">
        <Package className="size-12 text-[#B8913A] mx-auto opacity-70" />
        <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
          {isLoggedIn && customer ? `Welcome, ${customer.name}` : "Track Your Orders"}
        </h3>
        <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] max-w-md mx-auto">
          Customer orders are tied to your phone and email. For immediate dispatch assistance, contact our Ambattur showroom desk at +91 99401 35700.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[#6B1E2E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#521623]"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <a
            href="https://wa.me/919940135700?text=Hi%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20track%20my%20order"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md border border-[#B8913A] text-[#6B1E2E] dark:text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#B8913A]/10"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
