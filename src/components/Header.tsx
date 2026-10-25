import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";
import logo from "@/assets/padmanabha-logo.jpg";

export function Header() {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logoutCustomer } = useCustomerAuth();
  const { setIsCustomerPortalOpen } = useStore();

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
              className="flex items-center gap-3 sm:gap-3.5 group select-none shrink-0"
              aria-label="Padmanabha Fabrics Home"
            >
              <img
                src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                alt="Padmanabha Fabrics"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[#B8913A]/50 shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0"
                width={48}
                height={48}
              />
              <div className="flex flex-col">
                <span className="font-['Manrope'] text-lg sm:text-2xl font-semibold tracking-[0.22em] text-[#0E0E0E] group-hover:text-[#B8913A] transition-colors leading-none">
                  PADMANABHA
                </span>
                <span className="text-[8.5px] sm:text-[9px] font-medium uppercase tracking-[0.32em] text-[#B8913A] mt-1 sm:mt-1.5 opacity-90">
                  FABRICS · CHENNAI
                </span>
              </div>
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
              <Link
                to="/cart"
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-[rgba(14,14,14,0.12)] text-[#0E0E0E] transition-all cursor-pointer"
                aria-label={`Shopping bag, ${cartCount} items`}
                title="Shopping Bag"
              >
                <ShoppingBag className="size-3.5" strokeWidth={1.5} />
                <span className="text-xs font-semibold tabular-nums">{cartCount}</span>
              </Link>

              {/* CUSTOMER LOGIN / NAME DISPLAY */}
              {isLoggedIn && customer ? (
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsCustomerPortalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6EE] dark:bg-white/10 border border-[#B8913A]/40 text-[#0E0E0E] dark:text-[#FAF6EE] hover:border-[#B8913A] transition-all cursor-pointer text-xs font-semibold shadow-2xs"
                    title={`Logged in as ${customer.name}`}
                  >
                    <User className="size-3.5 text-[#B8913A]" />
                    <span className="max-w-[110px] truncate">{customer.name}</span>
                  </button>

                  {/* Dropdown Menu on hover */}
                  <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 rounded-lg bg-white dark:bg-[#1E191A] border border-[#E5DAC4] dark:border-[#B8913A]/30 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[#E5DAC4]/60 dark:border-white/10">
                      <p className="font-semibold text-[#0E0E0E] dark:text-[#FAF6EE] truncate">{customer.name}</p>
                      <p className="text-[10px] text-[#5C5549] dark:text-[#B5AC9E] truncate">{customer.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="block w-full text-left px-3 py-2 rounded hover:bg-[#FAF6EE] dark:hover:bg-white/5 text-[#0E0E0E] dark:text-[#FAF6EE] transition-colors cursor-pointer font-medium"
                    >
                      My Orders & Tracking
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsCustomerPortalOpen(true)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-[#FAF6EE] dark:hover:bg-white/5 text-[#0E0E0E] dark:text-[#FAF6EE] transition-colors cursor-pointer"
                    >
                      Customer Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => logoutCustomer()}
                      className="w-full text-left px-3 py-2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomerPortalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#0E0E0E] hover:text-[#B8913A] transition-colors cursor-pointer text-xs font-medium"
                  title="Sign In / Register"
                >
                  <User className="size-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* MY ORDERS BUTTON (Visible right next to Profile) */}
              <Link
                to="/orders"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6B1E2E]/10 hover:bg-[#6B1E2E]/20 text-[#6B1E2E] dark:text-[#E7C880] border border-[#6B1E2E]/30 hover:border-[#6B1E2E] transition-all cursor-pointer text-xs font-semibold shadow-2xs"
                title="My Orders & Live Shipment Tracking"
              >
                <Truck className="size-3.5 text-[#6B1E2E] dark:text-[#B8913A]" strokeWidth={1.8} />
                <span className="inline">My Orders</span>
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
              <div className="flex items-center gap-2.5">
                <img
                  src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                  alt="Padmanabha Fabrics"
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-[#B8913A]/50 shrink-0"
                  width={36}
                  height={36}
                />
                <div>
                  <span className="font-['Manrope'] text-base font-semibold tracking-[0.2em] block leading-none">
                    PADMANABHA
                  </span>
                  <span className="text-[8.5px] font-medium uppercase tracking-[0.28em] text-[#B8913A] mt-1 block">
                    FABRICS · CHENNAI
                  </span>
                </div>
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
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 hover:text-[#B8913A]"
                >
                  <span>Shopping Bag</span>
                  <span className="text-[#B8913A] font-semibold">({cartCount})</span>
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 hover:text-[#B8913A]"
                >
                  <span>Wishlist</span>
                  <span className="text-[#B8913A] font-semibold">({wishlistCount})</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-1 text-[#6B1E2E] dark:text-[#E7C880] font-semibold hover:text-[#B8913A]"
                >
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-3.5 text-[#6B1E2E] dark:text-[#B8913A]" />
                    <span>My Orders & Tracking</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#6B1E2E]/10">
                    Live
                  </span>
                </Link>
                {isLoggedIn && customer ? (
                  <div className="pt-2 border-t border-[rgba(14,14,14,0.08)] flex items-center justify-between py-1">
                    <span className="font-semibold text-xs text-[#6B1E2E] dark:text-[#FAF6EE] truncate max-w-[180px]">
                      👤 {customer.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        logoutCustomer();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCustomerPortalOpen(true);
                    }}
                    className="block w-full text-left py-1 hover:text-[#B8913A] cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                )}
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
