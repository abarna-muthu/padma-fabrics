import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";

export function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Refund & Return Policy" }]} className="mb-6" />

      <SectionHeading
        kicker="Customer Trust"
        title="Refund & Return Policy"
        description="Our commitment to customer satisfaction and easy 7-day returns on eligible fabrics."
      />

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] space-y-4 p-6 border border-[#E5DAC4] dark:border-[#D15608]/25 rounded-lg bg-white dark:bg-[#262022]">
        <p>
          We pride ourselves on the finest material standards. If your order does not meet expectations, we provide a hassle-free 7-day inspection and exchange guarantee.
        </p>
        <h4 className="font-bold text-[#9F160A] dark:text-[#FAF6EE] text-base mt-4">1. Eligible Returns</h4>
        <p>
          Uncut fabric lengths, unstitched dress materials, and ready-to-wear items in original packaging with tags intact can be returned within 7 days of delivery.
        </p>
      </div>
    </div>
  );
}

export default RefundPolicyPage;
