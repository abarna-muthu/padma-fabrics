import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactApi } from "@/lib/api";
import { useSiteContent } from "@/context/SiteContentContext";
import store from "@/assets/padmanabha-store.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Padmanabha Fabrics, Chennai" },
      {
        name: "description",
        content:
          "Get in touch with Padmanabha Fabrics in Ambattur, Chennai. Retail enquiries, wholesale orders, and international export support.",
      },
      { property: "og:title", content: "Contact Us | Padmanabha Fabrics, Chennai" },
      {
        property: "og:description",
        content:
          "Connect with Padmanabha Fabrics for retail enquiries, wholesale orders and export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { content } = useSiteContent();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [enquiryType, setEnquiryType] = useState("Wholesale Sourcing");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const generateWhatsAppUrl = () => {
    const textLines = [
      "Hello Padmanabha Fabrics,",
      "I would like to submit an enquiry regarding fabrics:",
      name ? `• Name: ${name}` : null,
      phone ? `• Phone / WhatsApp: ${phone}` : null,
      email ? `• Email: ${email}` : null,
      enquiryType ? `• Enquiry Type: ${enquiryType}` : null,
      message
        ? `• Requirements: ${message}`
        : "• Requirements: I would like to enquire about your fabric collections and wholesale prices.",
    ].filter(Boolean);

    return `https://wa.me/919940145700?text=${encodeURIComponent(textLines.join("\n"))}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !message) return;

    setIsSubmitting(true);
    setFormError(null);

    const waUrl = generateWhatsAppUrl();

    try {
      const res = await contactApi.submit({
        name,
        email,
        phone,
        enquiryType,
        message,
      });

      if (res.success) {
        setSubmitted(true);
        toast.success("Enquiry submitted! Opening WhatsApp to connect directly...");
        if (typeof window !== "undefined") {
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        toast.info("Connecting directly to WhatsApp with your enquiry...");
        if (typeof window !== "undefined") {
          window.open(waUrl, "_blank", "noopener,noreferrer");
        }
        setSubmitted(true);
      }
    } catch (err: any) {
      toast.info("Connecting directly to WhatsApp...");
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectWhatsAppClick = () => {
    // If the customer entered any details, record enquiry in backend in background
    if (name || phone || email || message) {
      contactApi
        .submit({
          name: name || "WhatsApp Visitor",
          email: email || "whatsapp@visitor.com",
          phone: phone || "Direct WhatsApp",
          enquiryType,
          message: message || "Direct WhatsApp Click",
        })
        .catch(() => {});
    }
  };

  return (
    <main>
      <section className="page-width pt-12 pb-8 border-b border-border">
        <p className="section-kicker">{content.contact.headerKicker}</p>
        <h1 className="section-title">
          {content.contact.headerTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl leading-relaxed">
          {content.contact.headerDesc}
        </p>
      </section>

      <section className="page-width py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="border border-border p-6 sm:p-8 bg-card">
              <div className="mb-6 overflow-hidden border border-border">
                <img
                  src={store}
                  alt="Padmanabha Fabrics Showroom Premises in Ambattur, Chennai"
                  className="w-full h-56 object-cover object-center"
                  loading="lazy"
                />
              </div>
              <p className="section-kicker">Our Showroom & Office</p>
              <h2 className="font-display text-2xl font-medium mt-1 mb-4 text-primary">
                {content.contact.showroomName}
              </h2>

              <div className="space-y-6 text-xs text-foreground/80 leading-relaxed">
                <div className="flex gap-3">
                  <MapPin className="size-5 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="block text-foreground text-sm mb-1 font-normal font-display">
                      Ambattur, Chennai
                    </strong>
                    <span>
                      {content.contact.showroomAddress}
                    </span>
                    <div className="mt-4 rounded-xs border border-border overflow-hidden shadow-xs">
                      <iframe
                        title="Padmanabha Fabrics Location Map"
                        src="https://maps.google.com/maps?q=Padmanabha%20Fabrics%2C%20No.%203%2C%20Ground%20floor%2C%207th%20Street%2C%20Indira%20Nagar%2C%20Menambedu%2C%20Ambattur%2C%20Chennai%20600053&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-44 border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex gap-3">
                  <Phone className="size-4 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="block text-foreground text-sm mb-1 font-normal font-display">
                      Phone & Call Enquiries
                    </strong>
                    <div className="space-y-1">
                      <a
                        href={`tel:${content.contact.phonePrimary.replace(/\s+/g, "")}`}
                        className="block hover:text-primary transition-colors"
                      >
                        {content.contact.phonePrimary}
                      </a>
                      <a
                        href={`tel:${content.contact.phoneSecondary.replace(/\s+/g, "")}`}
                        className="block hover:text-primary transition-colors"
                      >
                        {content.contact.phoneSecondary}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex gap-3">
                  <Mail className="size-4 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="block text-foreground text-sm mb-1 font-normal font-display">
                      Email
                    </strong>
                    <a
                      href={`mailto:${content.contact.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {content.contact.email}
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex gap-3">
                  <MessageCircle className="size-4 shrink-0 text-gold mt-0.5" />
                  <div>
                    <strong className="block text-foreground text-sm mb-1 font-normal font-display">
                      Direct WhatsApp
                    </strong>
                    <p className="text-muted-foreground mb-2">
                      Immediate enquiry response for wholesale & retail.
                    </p>
                    <a
                      href="https://wa.me/919940145700?text=Hello%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20enquire%20about%20fabrics."
                      target="_blank"
                      rel="noreferrer"
                      className="text-link text-[11px]"
                    >
                      Chat on WhatsApp (+91 99401 45700) <ArrowUpRight className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-border p-6 bg-secondary/30">
              <p className="section-kicker">Business Scope</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                Your wholesale partner for quality & value. We cater to retail fabric connoisseurs,
                apparel brands, boutiques, and international importers.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="border border-border p-8 md:p-10">
              <p className="section-kicker">Send An Enquiry</p>
              <h2 className="section-title text-2xl md:text-3xl mb-6">
                Tell us about your fabric requirements
              </h2>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="size-12 text-gold mx-auto" />
                  <h3 className="font-display text-2xl text-primary">
                    Thank you for reaching out!
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    We have received your enquiry. Our team in Chennai will review your request and
                    get back to you shortly.
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center gap-4">
                    <Button variant="whatsapp" className="h-11 px-6 text-xs uppercase tracking-wider font-semibold shadow-md" asChild>
                      <a href={generateWhatsAppUrl()} target="_blank" rel="noreferrer">
                        Continue on WhatsApp <ArrowUpRight className="ml-2" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-medium text-foreground">
                        Your Name *
                      </label>
                      <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="rounded-none border-border focus-visible:ring-primary text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs font-medium text-foreground">
                        Phone / WhatsApp *
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="rounded-none border-border focus-visible:ring-primary text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs font-medium text-foreground">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@example.com"
                        className="rounded-none border-border focus-visible:ring-primary text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="enquiryType" className="text-xs font-medium text-foreground">
                        Enquiry Type
                      </label>
                      <select
                        id="enquiryType"
                        value={enquiryType}
                        onChange={(e) => setEnquiryType(e.target.value)}
                        className="w-full h-9 rounded-none border border-border bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Wholesale Sourcing">Wholesale Sourcing</option>
                        <option value="Retail Selection">Retail Selection</option>
                        <option value="Export & International">Export & International</option>
                        <option value="Saree & Silk Inquiries">Saree & Silk Inquiries</option>
                        <option value="General Question">General Question</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-xs font-medium text-foreground">
                      Your Message or Fabric Requirements *
                    </label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please mention fabric types, estimated yardage, quantities, or specific occasion wear requirements..."
                      className="rounded-none border-border focus-visible:ring-primary text-xs resize-none"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      {formError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-border/60">
                    <Button
                      type="submit"
                      variant="editorial"
                      disabled={isSubmitting}
                      className="h-11 px-7 text-xs font-semibold uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all"
                    >
                      {isSubmitting ? "Sending..." : "Send Enquiry"} <ArrowRight className="ml-3 size-4" />
                    </Button>
                    <a
                      href={generateWhatsAppUrl()}
                      target="_blank"
                      rel="noreferrer"
                      onClick={handleDirectWhatsAppClick}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700/60 rounded-sm transition-all shadow-xs group cursor-pointer"
                    >
                      <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Or submit directly via WhatsApp</span>
                      <ArrowUpRight className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
