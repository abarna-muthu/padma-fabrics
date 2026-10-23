import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "About Us" }]} className="mb-6" />

      <SectionHeading
        kicker="Our Story & Heritage"
        title="Rooted in Chennai. Connected to the World."
        description="Crafting and curating authentic Indian textiles, handloom weaves, and ready-to-wear silhouettes."
      />

      <div className="p-8 border border-dashed border-[#B8913A]/40 rounded-lg bg-white dark:bg-[#262022] my-6">
        <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE] mb-2">
          Heritage & Mission
        </h3>
        <p className="text-sm text-[#5C5549] dark:text-[#B5AC9E] leading-relaxed max-w-3xl">
          Based in Menambedu, Ambattur, Chennai, Padmanabha Fabrics stands at the intersection of generational handloom tradition and modern ready-to-wear fashion. Serving retail shoppers, boutique designers, and export partners worldwide.
        </p>
      </div>
    </div>
  );
}

export default AboutPage;
