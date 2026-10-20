import { Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import logo from "@/assets/padmanabha-logo.jpg";

export function Footer() {
  const { content } = useSiteContent();
  const logoSrc = typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg";

  return (
    <footer className="site-footer">
      <div className="page-width">
        <div className="footer-grid">
          {/* Column 1: Brand with Logo */}
          <div>
            <Link to="/" className="inline-block mb-3.5 group" aria-label="Padmanabha Fabrics home">
              <img
                src={logoSrc}
                alt="Padmanabha Fabrics Logo"
                className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-white/30 group-hover:scale-105 transition-transform"
                width={56}
                height={56}
              />
            </Link>
            <div className="footer-heading">{content.contact.showroomName || "Padmanabha Fabrics"}</div>
            <p className="footer-text mt-3">
              Your wholesale partner for quality & value.
              <br />
              Retail · Wholesale · Import & Export
            </p>
          </div>

          {/* Column 2: Useful Links */}
          <div>
            <h3 className="footer-label">Useful Links</h3>
            <ul className="footer-text space-y-2 list-none p-0 m-0 text-xs">
              <li>
                <Link to="/" className="hover:text-gold transition-colors inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold transition-colors inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors inline-block">
                  Shop Fabrics
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-gold transition-colors inline-block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-gold transition-colors inline-block">
                  Refund & Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Get in Touch */}
          <div>
            <h3 className="footer-label">Get in touch</h3>
            <div className="footer-text space-y-1.5">
              <a
                href={`tel:${content.contact.phonePrimary.replace(/\s+/g, "")}`}
                className="flex gap-2 items-center hover:opacity-100 transition-opacity"
              >
                <Phone className="size-3 text-gold" /> {content.contact.phonePrimary}
              </a>
              {content.contact.phoneSecondary && (
                <a
                  href={`tel:${content.contact.phoneSecondary.replace(/\s+/g, "")}`}
                  className="block pl-5 hover:opacity-100 transition-opacity"
                >
                  {content.contact.phoneSecondary}
                </a>
              )}
              <div className="pt-2">
                <a
                  href={`mailto:${content.contact.email}`}
                  className="hover:opacity-100 transition-opacity"
                >
                  {content.contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Our home & location */}
          <div>
            <h3 className="footer-label">Our home & location</h3>
            <p className="footer-text flex gap-2">
              <MapPin className="size-4 shrink-0 mt-1 text-gold" />
              <span>{content.contact.showroomAddress}</span>
            </p>
            {/* Location Map Embed */}
            <div className="mt-4 rounded-xs border border-white/10 overflow-hidden shadow-sm">
              <iframe
                title="Padmanabha Fabrics Location Map"
                src="https://maps.google.com/maps?q=Padmanabha%20Fabrics%2C%20No.%203%2C%20Ground%20floor%2C%207th%20Street%2C%20Indira%20Nagar%2C%20Menambedu%2C%20Ambattur%2C%20Chennai%20600053&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-32 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-2.5">
              <a
                href={content.contact.mapsUrl || "https://maps.app.goo.gl/D3SYeK37eivDbbiA8"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-gold hover:underline font-medium"
              >
                <MapPin className="size-3" /> Open in Google Maps{" "}
                <ExternalLink className="size-2.5 opacity-80" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Padmanabha Fabrics. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:underline">
              Terms & Conditions
            </Link>
            <Link to="/refund-policy" className="hover:underline">
              Refund & Return Policy
            </Link>
            <span>Tradition in every thread.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
