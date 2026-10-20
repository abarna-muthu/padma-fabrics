import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Flower2, Globe2, Layers3, MapPin, PackageCheck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import store from "@/assets/padmanabha-store.jpg";
import { useSiteContent } from "@/context/SiteContentContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Padmanabha Fabrics, Chennai" },
      {
        name: "description",
        content:
          "Rooted in Chennai, connected to the world. Learn more about Padmanabha Fabrics in Ambattur, Chennai — fine textiles for retail, wholesale and export.",
      },
      { property: "og:title", content: "About Us | Padmanabha Fabrics, Chennai" },
      {
        property: "og:description",
        content:
          "Rooted in Chennai, connected to the world. Learn more about Padmanabha Fabrics in Ambattur, Chennai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { content } = useSiteContent();

  return (
    <main>
      <section className="page-width pt-12 pb-8 border-b border-border">
        <p className="section-kicker">{content.about.headerKicker}</p>
        <h1 className="section-title">
          {content.about.headerTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl leading-relaxed">
          {content.about.headerDesc}
        </p>
      </section>

      <section className="story-section">
        <div className="story-grid page-width">
          <img
            className="store-photo"
            src={store}
            alt="Padmanabha Fabrics premises in Ambattur, Chennai"
            width={768}
            height={1024}
            loading="lazy"
          />
          <div className="story-copy">
            <p className="section-kicker">{content.about.storyKicker}</p>
            <h2 className="section-title">
              {content.about.storyTitle}
            </h2>
            <p>
              {content.about.storyParagraph1}
            </p>
            <p>
              {content.about.storyParagraph2}
            </p>
            <div className="pt-2">
              <Button
                variant="editorial"
                className="h-11 px-6 rounded-xs font-semibold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                asChild
              >
                <a
                  href="https://maps.google.com/?q=Indira+Nagar+Menambedu+Ambattur+Chennai+600053"
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit us in Chennai <ArrowUpRight className="size-4 ml-1.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="promise-strip page-width">
        {[
          { icon: Layers3, title: "A fabric for every vision", text: "From everyday to occasion" },
          {
            icon: Flower2,
            title: "Thoughtfully selected",
            text: "Beautiful details, considered choices",
          },
          { icon: PackageCheck, title: "Retail & wholesale", text: "For you and your business" },
          { icon: Globe2, title: "Beyond borders", text: "Import & export expertise" },
        ].map((p) => (
          <div className="promise" key={p.title}>
            <p.icon />
            <div>
              <strong>{p.title}</strong>
              <p>{p.text}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="page-width py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="border border-border p-8">
            <p className="section-kicker">Visit Our Store</p>
            <h2 className="font-display text-2xl font-medium mt-1 mb-4 text-primary">
              {content.about.storeAddressNote || "Ambattur Store & Showroom"}
            </h2>
            <p className="footer-text text-foreground/80 flex gap-3 text-xs leading-relaxed">
              <MapPin className="size-5 shrink-0 text-gold mt-0.5" />
              <span>{content.contact.showroomAddress}</span>
            </p>
            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2 text-xs">
              <a
                href={`tel:${content.contact.phonePrimary.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="size-3.5 text-gold" /> {content.contact.phonePrimary}
              </a>
              {content.contact.phoneSecondary && (
                <a
                  href={`tel:${content.contact.phoneSecondary.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors pl-5"
                >
                  {content.contact.phoneSecondary}
                </a>
              )}
            </div>
            {/* Embedded Google Map */}
            <div className="mt-6 rounded-xs border border-border overflow-hidden shadow-sm">
              <iframe
                title="Padmanabha Fabrics Store Location Map"
                src="https://maps.google.com/maps?q=Padmanabha%20Fabrics%2C%20No.%203%2C%20Ground%20floor%2C%207th%20Street%2C%20Indira%20Nagar%2C%20Menambedu%2C%20Ambattur%2C%20Chennai%20600053&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-56 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="border border-border p-8 bg-secondary/40">
            <p className="section-kicker">Wholesale & Export</p>
            <h2 className="font-display text-2xl font-medium mt-1 mb-4 text-primary">
              Tradition in every thread
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {content.contact.businessScope}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Connect with our experienced team in Chennai to discuss wholesale custom orders, fabric
              specifications, and international shipping options.
            </p>
            <Button variant="editorial" asChild>
              <Link to="/contact">
                Talk to our team <ArrowUpRight className="ml-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="contact-section page-width border-t border-border" id="wholesale">
        <div>
          <p className="section-kicker">{content.contact.headerKicker}</p>
          <h2 className="section-title">{content.contact.headerTitle}</h2>
          <p className="text-xs text-muted-foreground mt-3">
            {content.contact.headerDesc}
          </p>
        </div>
        <Button variant="editorial" asChild>
          <Link to="/contact">
            Talk to our team <ArrowUpRight className="ml-4" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
