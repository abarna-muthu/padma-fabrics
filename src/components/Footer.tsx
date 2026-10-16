import { ExternalLink, MapPin, Phone } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

export function Footer() {
  const { content } = useSiteContent();

  return (
    <footer className="site-footer">
      <div className="page-width">
        <div className="footer-grid">
          <div>
            <div className="footer-heading">{content.contact.showroomName || "Padmanabha Fabrics"}</div>
            <p className="footer-text mt-3">
              Your wholesale partner for quality & value.
              <br />
              Retail · Wholesale · Import & Export
            </p>
          </div>
          <div>
            <h3 className="footer-label">Get in touch</h3>
            <div className="footer-text">
              <a
                href={`tel:${content.contact.phonePrimary.replace(/\s+/g, "")}`}
                className="flex gap-2 items-center hover:opacity-100 transition-opacity"
              >
                <Phone className="size-3" /> {content.contact.phonePrimary}
              </a>
              {content.contact.phoneSecondary && (
                <a
                  href={`tel:${content.contact.phoneSecondary.replace(/\s+/g, "")}`}
                  className="hover:opacity-100 transition-opacity"
                >
                  {content.contact.phoneSecondary}
                </a>
              )}
              <br />
              <a
                href={`mailto:${content.contact.email}`}
                className="hover:opacity-100 transition-opacity"
              >
                {content.contact.email}
              </a>
            </div>
          </div>
          <div>
            <h3 className="footer-label">Our home & location</h3>
            <p className="footer-text flex gap-2">
              <MapPin className="size-4 shrink-0 mt-1 text-gold" />
              <span>{content.contact.showroomAddress}</span>
            </p>
            {/* Location Map Embed (Footer Only) */}
            <div className="mt-4 rounded border border-white/10 overflow-hidden shadow-sm">
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
          <span>Tradition in every thread.</span>
        </div>
      </div>
    </footer>
  );
}
