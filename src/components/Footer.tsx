import { Link } from "@tanstack/react-router";
import { ArrowUp, ArrowRight, MapPin, Phone, Mail, MessageCircle, Clock, ShieldCheck, Heart } from "lucide-react";
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
    toast.success("Thank you for subscribing to Padmanabha Fabrics seasonal updates.");
    setEmail("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#141414] text-[#FAF6EE] border-t border-white/10 select-none">
      {/* 1. STORE LOCATOR PRE-FOOTER BANNER (W for Woman style "Find a store near you") */}
      <div className="bg-[#1D1B1B] border-b border-white/10 py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-full bg-[#9F160A] text-white flex items-center justify-center shrink-0 shadow-md">
              <MapPin className="size-6 text-[#EDBC3D]" />
            </div>
            <div>
              <h3 className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-bold tracking-tight text-white">
                Visit our Flagship Showroom in Chennai
              </h3>
              <p className="text-xs text-[#B5AC9E] mt-0.5">
                Menambedu, Ambattur, Chennai – 600053 · Experience our artisanal silks & ready-to-wear in person
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://maps.app.goo.gl/D3SYeK37eivDbbiA8"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-1.5"
            >
              <MapPin className="size-3.5" />
              <span>Find A Store Near You</span>
            </a>
            <a
              href="https://wa.me/919940145700?text=Hello%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20visit%20your%20Chennai%20showroom."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
            >
              <MessageCircle className="size-3.5 text-[#EDBC3D]" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER MULTI-COLUMN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                alt="Padmanabha Fabrics"
                className="size-11 rounded-lg object-contain bg-white p-0.5"
              />
              <div>
                <span className="font-['Cormorant_Garamond'] text-xl font-bold tracking-tight text-white block leading-none">
                  Padmanabha
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#EDBC3D] block mt-1">
                  Fabrics · Chennai
                </span>
              </div>
            </div>
            <p className="text-xs text-[#B5AC9E] leading-relaxed">
              Curating authentic Indian handloom silks, festive chudithar ensembles, and contemporary fusion silhouettes.
            </p>
            <div className="text-[11px] text-[#B5AC9E] space-y-1 pt-1">
              <p className="flex items-center gap-1.5">
                <Clock className="size-3 text-[#EDBC3D]" />
                <span>Mon – Sat: 10:00 AM – 8:30 PM</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="size-3 text-[#EDBC3D]" />
                <a href="tel:+919940145700" className="hover:text-white transition-colors">
                  +91 99401 45700
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: Category Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D]">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-[#B5AC9E]">
              <li>
                <Link to="/shop" search={{ category: "Saree" } as any} className="hover:text-white transition-colors">
                  Silk & Handloom Sarees
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ category: "Chudithar" } as any} className="hover:text-white transition-colors">
                  Kurta Sets & Chudithars
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ category: "Coordset" } as any} className="hover:text-white transition-colors">
                  Artisanal Co-ord Sets
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ category: "Maxi" } as any} className="hover:text-white transition-colors">
                  Tiered Maxi Dresses
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ category: "Chudithar Top" } as any} className="hover:text-white transition-colors">
                  Everyday Festive Tunics
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ category: "2piece" } as any} className="hover:text-white transition-colors">
                  2-Piece Bottomwear
                </Link>
              </li>
              <li>
                <Link to="/shop" search={{ search: "sale" } as any} className="text-[#EDBC3D] hover:underline font-semibold">
                  Clearance Sale (Up to 40% Off)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Account */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D]">
              My Account
            </h4>
            <ul className="space-y-2 text-xs text-[#B5AC9E]">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Order History & Invoices
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Customer Assistance
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Support & Policies */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D]">
              Support & Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#B5AC9E]">
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Returns & Exchange (7 Days)
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service & Privacy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us & Showroom Timings
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Padmanabha Fabrics
                </Link>
              </li>
              <li>
                <a href="https://maps.app.goo.gl/D3SYeK37eivDbbiA8" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  Store Locator (Chennai)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter & Contact Info */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDBC3D]">
              Newsletter
            </h4>
            <p className="text-xs text-[#B5AC9E]">
              Sign up for private updates on seasonal handloom releases & festive discounts.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#EDBC3D]"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-md bg-[#9F160A] hover:bg-[#7D1107] text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Join
              </button>
            </form>

            <div className="pt-2 text-xs text-[#B5AC9E] space-y-1">
              <p>
                Email:{" "}
                <a href="mailto:padmanabhafabrics@gmail.com" className="hover:text-white transition-colors">
                  padmanabhafabrics@gmail.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:+919940145700" className="hover:text-white transition-colors">
                  +91 99401 45700
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 3. COPYRIGHT & SCROLL TO TOP */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B5AC9E]">
          <div>
            © {new Date().getFullYear()} Padmanabha Fabrics. All rights reserved. Handcrafted Indian Weaves & Contemporary Ethnic Wear.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px]">Ambattur, Chennai, Tamil Nadu – 600053</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="size-8 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-all cursor-pointer"
              title="Scroll to top"
              aria-label="Scroll to top"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
