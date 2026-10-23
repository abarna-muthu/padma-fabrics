import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export function Header() {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn } = useCustomerAuth();

  // Scroll detection for sticky header refinement
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { search: searchQuery.trim() } as any });
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* 1. THIN ANNOUNCEMENT BAR */}
      <div className="bg-[#141414] text-[#F4F0E8] border-b border-black/10 text-[11px] font-medium uppercase tracking-[0.2em] py-2 px-4 select-none relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-center">
          <span className="hidden md:inline text-[#F4F0E8]/60">
            Chennai Showroom · Ambattur
          </span>
          <span className="w-full md:w-auto text-[#F4F0E8]/90 font-light">
            Complimentary domestic shipping on orders over ₹999 · Desk:{" "}
            <a href="tel:+919940135700" className="text-[#B8913A] hover:underline font-normal">
              +91 99401 35700
            </a>
          </span>
          <span className="hidden md:inline text-[#B8913A]">
            GST Invoicing Included
          </span>
        </div>
      </div>

      {/* 2. REFINED LIGHT STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF7F2]/95 backdrop-blur-md shadow-xs border-b border-[rgba(14,14,14,0.08)]"
            : "bg-[#FAF7F2] border-b border-[rgba(14,14,14,0.06)]"
        } text-[#0E0E0E]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* BRAND LOGO / WORDMARK */}
            <Link
              to="/"
              className="flex flex-col group select-none shrink-0"
              aria-label="Padmanabha Fabrics Home"
            >
              <span className="font-['Manrope'] text-xl sm:text-2xl font-semibold tracking-[0.25em] text-[#0E0E0E] group-hover:text-[#B8913A] transition-colors leading-none">
                PADMANABHA
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.35em] text-[#B8913A] mt-1.5 opacity-90">
                FABRICS · CHENNAI
              </span>
            </Link>

            {/* DESKTOP NAVIGATION: Home, Shop, About, Contact only */}
            <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.16em] font-medium text-[#0E0E0E]">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-[#B8913A] font-semibold" }}
                className="hover:text-[#B8913A] transition-colors py-2"
              >
                Home
              </Link>

              <Link
                to="/shop"
                activeProps={{ className: "text-[#B8913A] font-semibold" }}
                className="hover:text-[#B8913A] transition-colors py-2"
              >
                Shop
              </Link>

              <Link
                to="/about"
                activeProps={{ className: "text-[#B8913A] font-semibold" }}
                className="hover:text-[#B8913A] transition-colors py-2"
              >
                About
              </Link>

              <Link
                to="/contact"
                activeProps={{ className: "text-[#B8913A] font-semibold" }}
                className="hover:text-[#B8913A] transition-colors py-2"
              >
                Contact
              </Link>
            </nav>

            {/* RIGHT SIDE ICONS: SEARCH, WISHLIST, CART, ACCOUNT */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* SEARCH ICON */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-1.5 text-[#0E0E0E] hover:text-[#B8913A] transition-colors cursor-pointer"
                aria-label="Search"
                title="Search catalog"
              >
                <Search className="size-4" strokeWidth={1.5} />
              </button>

              {/* WISHLIST ICON WITH COUNT */}
              <Link
                to="/wishlist"
                className="relative p-1.5 text-[#0E0E0E] hover:text-[#B8913A] transition-colors"
                aria-label={`Wishlist, ${wishlistCount} items`}
                title="Saved Wishlist"
              >
                <Heart className="size-4" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#B8913A] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* SHOPPING CART ICON WITH LIVE ITEM COUNT */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-[rgba(14,14,14,0.12)] text-[#0E0E0E] transition-all cursor-pointer"
                aria-label={`Shopping bag, ${cartCount} items`}
                title="Shopping Bag"
              >
                <ShoppingBag className="size-3.5" strokeWidth={1.5} />
                <span className="text-xs font-semibold tabular-nums">{cartCount}</span>
              </button>

              {/* LOGIN / ACCOUNT OPTION */}
              <Link
                to={isLoggedIn ? "/orders" : "/login"}
                className="p-1.5 text-[#0E0E0E] hover:text-[#B8913A] transition-colors"
                aria-label="Account"
                title={isLoggedIn && customer ? `Account (${customer.name})` : "Sign In"}
              >
                <User className="size-4" strokeWidth={1.5} />
              </Link>

              {/* MOBILE HAMBURGER MENU */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-[#0E0E0E] hover:text-[#B8913A] transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* SEARCH OVERLAY INPUT */}
          {isSearchOpen && (
            <div className="pb-4 pt-1 animate-in fade-in duration-200">
              <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  placeholder="SEARCH SAREES, SILKS, COORDSETS, TOPS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[rgba(14,14,14,0.2)] rounded-full px-4 py-2.5 text-xs tracking-[0.14em] uppercase text-[#0E0E0E] placeholder:text-[#0E0E0E]/40 focus:outline-none focus:border-[#B8913A] shadow-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-[#B8913A] font-semibold hover:underline cursor-pointer"
                >
                  Search →
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* 3. MOBILE POLISHED HAMBURGER MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF7F2] text-[#0E0E0E] border-l border-[rgba(14,14,14,0.1)] p-6 flex flex-col z-50 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(14,14,14,0.08)]">
              <div>
                <span className="font-['Manrope'] text-lg font-semibold tracking-[0.2em] block">
                  PADMANABHA
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#B8913A]">
                  FABRICS · CHENNAI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#0E0E0E]/60 hover:text-[#0E0E0E]"
                aria-label="Close navigation menu"
              >
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-4 text-xs uppercase tracking-[0.16em] font-medium">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 hover:text-[#B8913A]"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 hover:text-[#B8913A]"
              >
                Shop
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 hover:text-[#B8913A]"
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1.5 hover:text-[#B8913A]"
              >
                Contact
              </Link>

              <div className="pt-4 border-t border-[rgba(14,14,14,0.08)] space-y-3">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 hover:text-[#B8913A]"
                >
                  <span>Wishlist</span>
                  <span className="text-[#B8913A] font-semibold">({wishlistCount})</span>
                </Link>
                <Link
                  to={isLoggedIn ? "/orders" : "/login"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-1 hover:text-[#B8913A]"
                >
                  {isLoggedIn ? "My Orders / Account" : "Sign In / Register"}
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(14,14,14,0.08)] text-[11px] text-[#0E0E0E]/60 space-y-1">
              <p>Ambattur, Chennai – 600053</p>
              <p className="text-[#B8913A] font-medium">+91 99401 35700</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Header;
