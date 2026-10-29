import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

export function LandingFooter() {
  const [showNotice, setShowNotice] = useState(true);

  const row1 = [
    { label: "SUPPORT", href: "/contact" },
    { label: "COMPANY", href: "/about" },
    { label: "REFUND POLICY", href: "/refund-policy" },
    { label: "PRIVACY POLICY", href: "/terms" },
    { label: "RETURNS & EXCHANGE POLICY", href: "/refund-policy" },
    { label: "FASHION AWARDS", href: "/about" },
  ];

  const row2 = [
    { label: "DELIVERY POLICY", href: "/terms" },
    { label: "CONTACT US", href: "/contact" },
    { label: "CAREERS", href: "/about" },
    { label: "SITEMAP", href: "/shop" },
    { label: "STORE LOCATOR", href: "/contact" },
    { label: "INVESTOR RELATIONS", href: "/about" },
    { label: "BLOGS", href: "/about" },
  ];

  return (
    <footer className="w-full bg-[#F2F2F2] text-[#222222] py-10 px-4 text-center font-['Poppins'] select-none border-t border-[#E6E6E6]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Link Rows UPPERCASE 11px dark, 24px gaps, centered */}
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111111]">
            {row1.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="hover:text-[#D0202B] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111111]">
            {row2.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="hover:text-[#D0202B] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Social Icons centered (black, 18-20px, 24px gaps) */}
        <div className="flex items-center justify-center gap-6 text-[#111111] pt-2">
          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="hover:text-[#D0202B] transition-colors"
          >
            <svg className="size-[20px] fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-[#D0202B] transition-colors"
          >
            <svg className="size-[20px] fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hover:text-[#D0202B] transition-colors"
          >
            <svg className="size-[20px] fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className="hover:text-[#D0202B] transition-colors"
          >
            <svg className="size-[18px] fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/919940135700"
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            className="hover:text-[#D0202B] transition-colors"
          >
            <svg className="size-[20px] fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
          </a>
        </div>

        {/* Contact Text centered 11px */}
        <p className="text-[11px] text-[#555555] leading-relaxed max-w-2xl mx-auto pt-2">
          Email Us - customercare@padmanabhafabrics.com or call us at +91 99401 35700 or WhatsApp at +91 99401 35700 (from 10 AM to 6 PM, Mon to Sun). We are closed on bank holidays.
        </p>

        {/* Copyright 10px grey */}
        <p className="text-[10px] text-[#888888]">
          © Copyright 2026 PADMANABHA FABRICS. All Rights Reserved. · Developed by Gen Z Neural-X
        </p>

        {/* Small dismissible notice */}
        {showNotice && (
          <div className="inline-flex items-center gap-2 bg-white border border-[#E6E6E6] rounded-[2px] px-3 py-1 text-[10px] text-[#555555]">
            <span>To shop outside India, visit our international shipping concierge.</span>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="text-[#999999] hover:text-[#111111]"
              aria-label="Dismiss notice"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
