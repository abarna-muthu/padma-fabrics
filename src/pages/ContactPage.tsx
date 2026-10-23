import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { MapPin, Phone, Mail } from "lucide-react";

export function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Contact Us" }]} className="mb-6" />

      <SectionHeading
        kicker="Direct Wholesale & Retail Desk"
        title="We Would Love to Hear from You"
        description="Reach out for custom bridal weaves, bulk trade discounts, or showroom visits."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div className="p-6 border border-[#B8913A]/30 rounded-lg bg-white dark:bg-[#262022]">
          <Phone className="size-6 text-[#B8913A] mb-3" />
          <h4 className="font-bold text-sm text-[#6B1E2E] dark:text-[#FAF6EE]">Call Us Directly</h4>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-1">+91 99401 35700</p>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E]">+91 99401 45700</p>
        </div>

        <div className="p-6 border border-[#B8913A]/30 rounded-lg bg-white dark:bg-[#262022]">
          <Mail className="size-6 text-[#B8913A] mb-3" />
          <h4 className="font-bold text-sm text-[#6B1E2E] dark:text-[#FAF6EE]">Email Enquiries</h4>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-1">padmanabhafabrics@gmail.com</p>
          <p className="text-[11px] text-[#8A9A7B] mt-1">Response within 24 hours</p>
        </div>

        <div className="p-6 border border-[#B8913A]/30 rounded-lg bg-white dark:bg-[#262022]">
          <MapPin className="size-6 text-[#B8913A] mb-3" />
          <h4 className="font-bold text-sm text-[#6B1E2E] dark:text-[#FAF6EE]">Visit Our Showroom</h4>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-1">
            No. 3, Ground floor, 7th Street, Indira Nagar, Menambedu, Ambattur, Chennai – 600053
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
