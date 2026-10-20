import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Padmanabha Fabrics" },
      {
        name: "description",
        content: "Terms and conditions for Padmanabha Fabrics retail, wholesale, and online sample orders.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-sand-50/50 dark:bg-background py-10 md:py-16">
      <div className="page-width max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Button variant="outline" size="sm" className="rounded-xs gap-1.5 text-xs" asChild>
            <Link to="/">
              <ArrowLeft className="size-3.5" /> Return to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-primary rounded-full text-xs font-medium mb-3">
            <ShieldCheck className="size-3.5 text-gold" />
            <span>Legal & Store Policies</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
            Terms & Conditions
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            Last Updated: October 2026 · Padmanabha Fabrics, Ambattur, Chennai
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-card border border-border p-6 sm:p-10 shadow-xs space-y-8 text-foreground leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <FileText className="size-4 text-gold shrink-0" />
              1. General Overview & Acceptance
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Welcome to Padmanabha Fabrics ("we", "our", or "us"). By accessing our store, placing a retail enquiry, purchasing fabric yardage, or procuring wholesale textile inventory from our premises in Ambattur, Chennai or through our website, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <FileText className="size-4 text-gold shrink-0" />
              2. Fabric Specifications, Colors & Dye Batches
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Our textiles encompass handwoven silks, raw silks, brocades, linen, and artisanal cottons. Handloom weaves and traditional zari may feature subtle organic variations in weave tension, texture, and slub yarn. Such characteristics are the hallmark of authentic textile craftsmanship and are not considered manufacturing defects.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              While we capture photographs under balanced studio lighting, actual colors may slightly differ based on your device display settings and lighting conditions. For bulk and wholesale dye-lot consistency, we encourage ordering fabric swatches or visiting our Chennai showroom prior to high-volume cuts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <FileText className="size-4 text-gold shrink-0" />
              3. Ordering, Pricing & Payments
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              All prices displayed in our online showcase are sample catalog rates and inclusive of applicable GST unless explicitly stated otherwise. We accept secure UPI payments, credit/debit cards, net banking, and Cash on Delivery (COD) for eligible domestic destinations.
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Orders are confirmed upon receipt of authorized payment or confirmation of COD address verification by our customer support team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <FileText className="size-4 text-gold shrink-0" />
              4. Shipping & Delivery
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Orders are packaged with protective moisture-barrier wrapping and dispatched directly from our Ambattur, Chennai facility via trusted courier partners. Standard domestic deliveries across India take 2 to 6 business days. Tracking numbers are shared via WhatsApp and email upon dispatch.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <FileText className="size-4 text-gold shrink-0" />
              5. Governing Law & Jurisdiction
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or claim arising out of transactions with Padmanabha Fabrics shall be subject to the exclusive jurisdiction of the competent courts in Chennai, Tamil Nadu, India.
            </p>
          </section>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted-foreground">
            <div>
              <strong>Questions regarding our terms?</strong>
              <p>Email us at padmanabhafabrics@gmail.com or call +91 99401 35700</p>
            </div>
            <Button variant="editorial" size="sm" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
