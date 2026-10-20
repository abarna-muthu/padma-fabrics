import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Flower2,
  Globe2,
  Layers3,
  PackageCheck,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/fabric-hero.jpg";
import store from "@/assets/padmanabha-store.jpg";
import burgundy from "@/assets/burgundy-silk.jpg";
import ivory from "@/assets/ivory-brocade.jpg";
import shirt from "@/assets/mens-shirt.jpg";
import kids from "@/assets/kids-dress.jpg";
import { ALL, collections, categories } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Padmanabha Fabrics | A World of Beautiful Fabrics" },
      {
        name: "description",
        content:
          "Explore silks, cottons and occasion fabrics at Padmanabha Fabrics, Chennai. Discover our collections and enquire about wholesale orders.",
      },
      { property: "og:title", content: "Padmanabha Fabrics | A World of Beautiful Fabrics" },
      {
        property: "og:description",
        content:
          "Beautiful fabrics, thoughtfully selected. Explore the Padmanabha Fabrics collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { filter, setFilter, activeProducts } = useStore();
  const { content } = useSiteContent();
  const visible = activeProducts.filter((p) => filter === ALL || p.category === filter);

  return (
    <main>
      {/* Hero Banner (Existing) */}
      <section className="hero" aria-label="Padmanabha fabric collection">
        <img
          src={hero}
          className="hero-image"
          alt="Burgundy silk with intricate gold zari over sage fabric"
          width={1920}
          height={1024}
          fetchPriority="high"
        />
        <div className="hero-inner page-width">
          <div className="hero-copy">
            <div className="eyebrow">{content.home.heroKicker}</div>
            <h1>
              {content.home.heroTitle}
            </h1>
            <p className="hero-description">
              {content.home.heroSubtitle}
            </p>
            <Button variant="editorial" asChild>
              <Link to="/shop" onClick={() => setFilter(ALL)}>
                Explore the collection <ArrowRight className="ml-4" />
              </Link>
            </Button>
            <div className="hero-meta">
              <Flower2 className="size-3 text-gold" /> Thoughtfully selected. Beautifully yours.
            </div>
          </div>
        </div>
        <div className="hero-pagination" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-bottom">{content.home.heroBottomText}</div>
      </section>

      {/* Promise Strip (Existing) */}
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

      {/* 1. Shop by Collection */}
      <section className="collection-section page-width" id="collections">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Find your inspiration</p>
            <h2 className="section-title">Shop by Collection</h2>
          </div>
          <Link to="/shop" className="text-link" onClick={() => setFilter(ALL)}>
            View all collections <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="category-grid">
          {collections.map((c) => (
            <Link
              to="/shop"
              key={c.name}
              className="category-card"
              onClick={() => setFilter(c.name)}
            >
              <img
                className="category-image"
                src={c.image}
                alt={`${c.name} collection`}
                width={768}
                height={1024}
                loading="lazy"
              />
              <div className="category-label">
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.text}</p>
                </div>
                <ArrowUpRight className="size-4 text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. Featured Fabrics */}
      <section className="product-section page-width" id="shop">
        <div className="section-heading">
          <div>
            <p className="section-kicker">The curated edit</p>
            <h2 className="section-title">Featured Fabrics</h2>
          </div>
          <span className="text-[9px] text-muted-foreground">
            Preview collection · Sample prices
          </span>
        </div>
        <div className="filter-tabs">
          {categories.map((c) => (
            <Button
              key={c}
              variant="filter"
              data-active={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </Button>
          ))}
        </div>
        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="editorial" asChild>
            <Link to="/shop" onClick={() => setFilter(ALL)}>
              View all fabrics in Shop <ArrowRight className="ml-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 3. Why Choose Padma Fabrics? */}
      {/* 3. Why Choose Padma Fabrics */}
      <section className="page-width py-14 border-t border-border">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Heritage & Commitment</p>
            <h2 className="section-title">{content.home.whyChooseTitle}</h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-xl">{content.home.whyChooseDesc}</p>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
            Retail · Wholesale · Chennai to the World
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Thoughtfully Curated Silks",
              desc: "Handpicked sarees, fine brocades, and combed cottons chosen for drape, colour vibrancy, and festive elegance.",
            },
            {
              icon: Scissors,
              title: "Tailored by the Metre",
              desc: "Purchase exact yardage for bespoke tailoring or bulk bolts for fashion labels, boutiques, and occasion wear.",
            },
            {
              icon: ShieldCheck,
              title: "Authentic Loom Sourcing",
              desc: "Transparent sample pricing with genuine weave details sourced directly through reputable artisan weaver partnerships.",
            },
            {
              icon: Globe2,
              title: "Import & Export Expertise",
              desc: "Reliable distribution from our Ambattur, Chennai showroom to patrons across India and international destinations.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 border border-border bg-card flex flex-col justify-between"
            >
              <div>
                <item.icon className="size-6 text-gold mb-4 stroke-1" />
                <h3 className="font-display text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Fabric Inspiration */}
      <section className="page-width py-14 border-t border-border">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Style & Draping Ideas</p>
            <h2 className="section-title">{content.home.inspirationTitle}</h2>
            <p className="text-xs text-muted-foreground mt-2 max-w-xl">{content.home.inspirationDesc}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xs text-xs font-semibold gap-1.5" asChild>
            <Link to="/shop" onClick={() => setFilter(ALL)}>
              Explore all fabrics <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Heirloom Festive Drapes",
              category: "Sarees",
              desc: "Rich wine and gold zari borders for auspicious weddings and celebratory moments.",
              image: burgundy,
            },
            {
              title: "Bespoke Occasion Brocades",
              category: "Fabrics",
              desc: "Intricate metallic florals and textured brocade yardage for lehengas and tailored blouses.",
              image: ivory,
            },
            {
              title: "Little Celebrations",
              category: "Kids Wear",
              desc: "Traditional silk pavadai sets with peacock zari borders tailored for little ones.",
              image: kids,
            },
            {
              title: "Effortless Tailored Linen",
              category: "Shirts",
              desc: "Crisp white linen and combed cottons designed for breathable all-day comfort.",
              image: shirt,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden border border-border bg-card flex flex-col justify-between"
            >
              <div>
                <div className="overflow-hidden aspect-[3/4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    width={768}
                    height={1024}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 pb-3">
                  <span className="text-[9px] uppercase tracking-wider text-gold font-medium block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-display text-xl font-medium mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="p-5 pt-0 mt-3">
                <Button
                  size="sm"
                  variant="editorial"
                  className="w-full h-9 text-xs uppercase tracking-wider font-semibold rounded-xs shadow-sm bg-gradient-to-r from-[#9B2242] to-[#7B162E] hover:from-[#851933] hover:to-[#681125] text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  asChild
                >
                  <Link to="/shop" onClick={() => setFilter(item.category)}>
                    Shop {item.category} <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section (Existing) */}
      <section className="story-section" id="story">
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
            <div className="flex flex-wrap gap-3.5 items-center pt-2">
              <Button
                variant="editorial"
                size="default"
                className="h-11 px-6 rounded-xs font-semibold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                asChild
              >
                <Link to="/about">
                  Read our story <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                className="h-11 px-6 rounded-xs font-semibold text-xs uppercase tracking-wider border-2 border-[#9B2242] text-[#9B2242] hover:bg-[#9B2242] hover:text-white transition-all shadow-xs"
                asChild
              >
                <a
                  href={content.contact.mapsUrl || "https://maps.app.goo.gl/D3SYeK37eivDbbiA8"}
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

      {/* Contact Section */}
      <section className="contact-section page-width" id="wholesale">
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
