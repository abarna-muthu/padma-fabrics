import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Terms & Conditions" }]} className="mb-6" />

      <SectionHeading
        kicker="Legal & Transparency"
        title="Terms & Conditions"
        description="Guidelines governing purchases, orders, and wholesale agreements with Padmanabha Fabrics."
      />

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] space-y-4 p-6 border border-[#E5DAC4] dark:border-[#B8913A]/25 rounded-lg bg-white dark:bg-[#262022]">
        <p>
          Welcome to Padmanabha Fabrics. By browsing our catalog, placing orders, or engaging with our wholesale desk, you agree to comply with our commercial terms and quality assurances.
        </p>
        <h4 className="font-bold text-[#6B1E2E] dark:text-[#FAF6EE] text-base mt-4">1. Fabric Specifications & Variations</h4>
        <p>
          Handcrafted and handloom textiles carry inherent artisanal nuances in weave, slub texture, and shade variation. These characteristic markers authenticate human craftsmanship.
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
