import { Link } from "@tanstack/react-router";
import { ArrowUp, ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/padmanabha-logo.jpg";

export function Footer() {

  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thank you for subscribing to our private editorial updates.");
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0E0E0E] text-[#F4F0E8] pt-20 pb-12 border-t border-[rgba(244,240,232,0.1)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid: Newsletter & Wordmark */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[rgba(244,240,232,0.1)]">
          {/* Brand Wordmark & Mission */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                alt="Padmanabha Fabrics"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#D15608]/50 shadow-sm shrink-0"
                width={48}
                height={48}
              />
              <div>
                <span className="font-['Manrope'] text-2xl sm:text-3xl font-semibold tracking-[0.25em] text-[#F4F0E8] block leading-none">
                  PADMANABHA
                </span>
                <span className="text-[10px] font-light uppercase tracking-[0.35em] text-[#EDBC3D] block mt-1.5">
                  FABRICS · CHENNAI
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-light text-[#F4F0E8]/70 leading-relaxed max-w-sm pt-2">
              Artisanal South Indian textiles, handloom silks, and contemporary ready-to-wear silhouettes. Serving retail, bespoke ateliers, and international garment exporters.
            </p>
            <div className="pt-2 text-xs text-[#F4F0E8]/60 space-y-1">
              <p>No. 3, Ground floor, 7th Street, Indira Nagar,</p>
              <p>Menambedu, Ambattur, Chennai – 600053</p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://maps.app.goo.gl/D3SYeK37eivDbbiA8"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#D15608] hover:underline uppercase tracking-wider"
                >
                  <MapPin className="size-3" strokeWidth={1.5} />
                  <span>View on Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Links Column 1: Useful Links */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#EDBC3D] block mb-4">
              Explore
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-[0.12em] font-light list-none p-0 m-0">
              <li>
                <Link to="/" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Shop Fabrics
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Our Journal
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Contact & Looms
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Legal & Support */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#EDBC3D] block mb-4">
              Service
            </span>
            <ul className="space-y-2.5 text-xs uppercase tracking-[0.12em] font-light list-none p-0 m-0">
              <li>
                <Link to="/terms" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-[#F4F0E8]/70 hover:text-white transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <a href="tel:+919940135700" className="text-[#F4F0E8]/70 hover:text-[#D15608] transition-colors block">
                  +91 99401 35700
                </a>
              </li>
              <li>
                <a href="tel:+919940145700" className="text-[#F4F0E8]/70 hover:text-[#D15608] transition-colors block">
                  +91 99401 45700
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter with Underline Only (No Box) */}
          <div className="lg:col-span-3 space-y-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#EDBC3D] block">
              The Editorial Desk
            </span>
            <p className="text-xs font-light text-[#F4F0E8]/70 leading-relaxed">
              Receive private previews of new seasonal loom roll releases, bridal edits, and trade drops.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="relative pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL ADDRESS"
                className="w-full bg-transparent border-b border-[rgba(244,240,232,0.3)] pb-2 text-xs uppercase tracking-[0.15em] text-[#F4F0E8] placeholder:text-[#F4F0E8]/40 focus:outline-none focus:border-[#D15608] transition-colors pr-8"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-2 text-[#D15608] hover:text-white transition-colors cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </button>
            </form>

            <p className="text-[10px] text-[#F4F0E8]/40 pt-1">
              Direct from Ambattur Chennai depot. No spam, ever.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Circular Scroll to Top Button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-[#F4F0E8]/60">
          <div>
            © 2026 Padmanabha Fabrics. All rights reserved. Fine Indian Weaves & Ready-to-Wear.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="mailto:padmanabhafabrics@gmail.com"
              className="hover:text-white transition-colors lowercase"
            >
              padmanabhafabrics@gmail.com
            </a>

            {/* Circular Scroll-to-Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="size-9 rounded-full border border-[rgba(244,240,232,0.25)] hover:border-[#D15608] text-[#F4F0E8] hover:text-[#D15608] flex items-center justify-center transition-all cursor-pointer"
              title="Scroll to top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
