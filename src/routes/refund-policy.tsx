import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Return Policy | Padmanabha Fabrics" },
      {
        name: "description",
        content: "Transparent return and refund guidelines for sarees, dress materials, cut yardage, and wholesale fabric orders.",
      },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
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
            <span>Fair Commerce & Buyer Protection</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
            Refund & Return Policy
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            Last Updated: October 2026 · Padmanabha Fabrics, Ambattur, Chennai
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-card border border-border p-6 sm:p-10 shadow-xs space-y-8 text-foreground leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <RefreshCw className="size-4 text-gold shrink-0" />
              1. Our Quality Assurance
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              At Padmanabha Fabrics, every meter of fabric and woven saree undergoes strict inspection at our Ambattur warehouse before packaging. We take pride in delivering premier handloom and mill textiles that meet authentic standards of yarn, weave, and luster.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="size-4 text-gold shrink-0" />
              2. Return Eligibility Window (7 Days)
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Customers may request an exchange or return within <strong>7 days</strong> of delivery under the following conditions:
            </p>
            <ul className="list-disc pl-5 text-muted-foreground text-xs space-y-1.5">
              <li>The item received has a noticeable weaving defect, manufacturing tear, or incorrect fabric dispatch.</li>
              <li>Sarees, unstitched drapes, and apparel must be unworn, unwashed, unaltered, and accompanied by original folds and tags.</li>
              <li>An unboxing photo or video showing the parcel upon receipt assists in rapid verification.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <RefreshCw className="size-4 text-gold shrink-0" />
              3. Custom Cut Yardage Notice
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              In accordance with textile industry practices, running fabric yardage custom-cut to specific customer measurements (e.g., 2.5m, 4m) cannot be returned unless delivered with a genuine physical defect or transit damage, as custom cuts cannot be reattached to the original roll.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <RefreshCw className="size-4 text-gold shrink-0" />
              4. Return Process & Pickup
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              To initiate a return:
            </p>
            <ol className="list-decimal pl-5 text-muted-foreground text-xs space-y-1.5">
              <li>Message our dispatch team on WhatsApp (+91 99401 45700) or email padmanabhafabrics@gmail.com with your Order Number and photos of the issue.</li>
              <li>Upon approval, we arrange a reverse pickup via our logistics partner or provide the return shipping address in Ambattur, Chennai.</li>
              <li>Once inspected at our facility, an exchange piece is dispatched immediately or a refund is initiated.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-primary flex items-center gap-2">
              <CheckCircle2 className="size-4 text-gold shrink-0" />
              5. Refund Timeline & Mode
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Approved refunds are processed within <strong>24 to 48 business hours</strong> of inspection. Online payments (UPI, Card, Net Banking) are refunded directly to the original payment source (takes 3 to 5 banking days). Cash on Delivery orders are refunded via direct UPI transfer or NEFT bank transfer as requested by the buyer.
            </p>
          </section>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-muted-foreground">
            <div>
              <strong>Need help with a return or exchange?</strong>
              <p>WhatsApp our team at +91 99401 45700 or call us anytime.</p>
            </div>
            <Button variant="editorial" size="sm" asChild>
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
