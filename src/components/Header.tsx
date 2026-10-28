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
import { useSiteContent } from "@/context/SiteContentContext";
import logo from "@/assets/padmanabha-logo.jpg";

export function Header() {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logoutCustomer } = useCustomerAuth();
  const { setIsCustomerPortalOpen } = useStore();
  const { content } = useSiteContent();

  const announcementText =
    content?.home?.announcementText?.trim() ||
    "Complimentary domestic shipping on orders over ₹999 · Desk: +91 99401 35700";

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

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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
      <div className="bg-[#9F160A] text-white border-b border-black/10 text-[11px] font-medium uppercase tracking-[0.2em] py-2 px-4 select-none relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-center">
          <span className="hidden md:inline text-white/80">
            Chennai Showroom · Ambattur
          </span>
          <span className="w-full md:w-auto text-white font-light">
            {announcementText.includes("+91 99401 35700") ? (
              <>
                {announcementText.replace("+91 99401 35700", "").trim()}{" "}
                <a href="tel:+919940135700" className="text-[#EDBC3D] hover:underline font-normal">
                  +91 99401 35700
                </a>
              </>
            ) : (
              announcementText
            )}
          </span>
          <span className="hidden md:inline text-[#EDBC3D]">
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
            {/* BRAND LOGO / WORDMARK */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3.5 group select-none shrink-0 min-w-0"
              aria-label="Padmanabha Fabrics Home"
            >
              <img
                src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                alt="Padmanabha Fabrics"
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[#D15608]/50 shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0"
                width={48}
                height={48}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-['Manrope'] text-sm sm:text-2xl font-semibold tracking-[0.16em] sm:tracking-[0.22em] text-[#0E0E0E] group-hover:text-[#D15608] transition-colors leading-none truncate">
                  PADMANABHA
                </span>
                <span className="text-[7.5px] sm:text-[9px] font-medium uppercase tracking-[0.26em] sm:tracking-[0.32em] text-[#D15608] mt-0.5 sm:mt-1.5 opacity-90 truncate">
                  FABRICS · CHENNAI
                </span>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION: Home, Shop, About, Contact only */}
            <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.16em] font-medium text-[#0E0E0E]">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-[#D15608] font-semibold after:!scale-x-100 after:!opacity-100" }}
                className="relative py-2 hover:text-[#D15608] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#D15608] after:rounded-full after:scale-x-0 after:opacity-0 hover:after:scale-x-75 hover:after:opacity-60 after:transition-all after:duration-200"
              >
                Home
              </Link>

              <Link
                to="/shop"
                activeProps={{ className: "text-[#D15608] font-semibold after:!scale-x-100 after:!opacity-100" }}
                className="relative py-2 hover:text-[#D15608] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#D15608] after:rounded-full after:scale-x-0 after:opacity-0 hover:after:scale-x-75 hover:after:opacity-60 after:transition-all after:duration-200"
              >
                Shop
              </Link>

              <Link
                to="/about"
                activeProps={{ className: "text-[#D15608] font-semibold after:!scale-x-100 after:!opacity-100" }}
                className="relative py-2 hover:text-[#D15608] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#D15608] after:rounded-full after:scale-x-0 after:opacity-0 hover:after:scale-x-75 hover:after:opacity-60 after:transition-all after:duration-200"
              >
                About
              </Link>

              <Link
                to="/contact"
                activeProps={{ className: "text-[#D15608] font-semibold after:!scale-x-100 after:!opacity-100" }}
                className="relative py-2 hover:text-[#D15608] transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#D15608] after:rounded-full after:scale-x-0 after:opacity-0 hover:after:scale-x-75 hover:after:opacity-60 after:transition-all after:duration-200"
              >
                Contact
              </Link>
            </nav>

            {/* RIGHT SIDE ICONS: SEARCH, WISHLIST, CART, ACCOUNT, ORDERS, HAMBURGER */}
            <div className="flex items-center gap-1 sm:gap-3 shrink-0">
              {/* SEARCH ICON */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-1.5 sm:p-2 text-[#0E0E0E] hover:text-[#D15608] transition-colors cursor-pointer shrink-0"
                aria-label="Search"
                title="Search catalog"
              >
                <Search className="size-4" strokeWidth={1.5} />
              </button>

              {/* WISHLIST ICON WITH COUNT */}
              <Link
                to="/wishlist"
                className="relative p-1.5 sm:p-2 text-[#0E0E0E] hover:text-[#D15608] transition-colors shrink-0"
                aria-label={`Wishlist, ${wishlistCount} items`}
                title="Saved Wishlist"
              >
                <Heart className="size-4" strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute 0 top-0.5 right-0.5 sm:-top-1 sm:-right-1 size-3.5 sm:size-4 rounded-full bg-[#D15608] text-white text-[8px] sm:text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* SHOPPING CART ICON WITH LIVE ITEM COUNT */}
              <Link
                to="/cart"
                className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-[rgba(14,14,14,0.12)] text-[#0E0E0E] transition-all cursor-pointer shrink-0"
                aria-label={`Shopping bag, ${cartCount} items`}
                title="Shopping Bag"
              >
                <ShoppingBag className="size-3.5" strokeWidth={1.5} />
                <span className="text-[11px] sm:text-xs font-semibold tabular-nums">{cartCount}</span>
              </Link>

              {/* CUSTOMER LOGIN / NAME DISPLAY (DESKTOP & TABLET ONLY) */}
              {isLoggedIn && customer ? (
                <div className="hidden md:block relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCustomerPortalOpen(true)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#FAF6EE] dark:bg-white/10 border border-[#D15608]/40 text-[#0E0E0E] dark:text-[#FAF6EE] hover:border-[#D15608] transition-all cursor-pointer text-xs font-semibold shadow-2xs"
                    title={`Logged in as ${customer.name}`}
                  >
                    <User className="size-3.5 text-[#D15608]" />
                    <span className="hidden sm:inline max-w-[110px] truncate">{customer.name}</span>
                  </button>

                  {/* Dropdown Menu on hover */}
                  <div className="absolute right-0 top-full mt-1.5 w-44 p-1.5 rounded-lg bg-white dark:bg-[#1E191A] border border-[#E5DAC4] dark:border-[#D15608]/30 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 text-xs">
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
                      className="w-full text-left px-3 py-2 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-[#9F160A] transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomerPortalOpen(true)}
                  className="hidden md:flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#0E0E0E] hover:text-[#D15608] transition-colors cursor-pointer text-xs font-medium shrink-0"
                  title="Sign In / Register"
                >
                  <User className="size-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* MY ORDERS BUTTON (DESKTOP & TABLET ONLY) */}
              <Link
                to="/orders"
                className="hidden md:flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#9F160A]/10 hover:bg-[#9F160A]/20 text-[#9F160A] dark:text-[#EDBC3D] border border-[#9F160A]/30 hover:border-[#9F160A] transition-all cursor-pointer text-xs font-semibold shadow-2xs shrink-0"
                title="My Orders & Live Shipment Tracking"
              >
                <Truck className="size-3.5 text-[#9F160A] dark:text-[#EDBC3D]" strokeWidth={1.8} />
                <span className="hidden sm:inline">My Orders</span>
              </Link>

              {/* MOBILE HAMBURGER MENU (3-Line Icon ☰ - PROMINENT ON MOBILE) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 text-[#0E0E0E] hover:text-[#D15608] transition-colors cursor-pointer rounded-lg hover:bg-black/5 active:bg-black/10 focus:outline-none focus:ring-1 focus:ring-[#D15608] shrink-0 flex items-center justify-center ml-0.5"
                aria-label="Open navigation menu"
                title="Open Navigation Menu"
              >
                <Menu className="size-5.5 sm:size-6" strokeWidth={2} />
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
                  className="w-full bg-white border border-[rgba(14,14,14,0.2)] rounded-full px-4 py-2.5 text-xs tracking-[0.14em] uppercase text-[#0E0E0E] placeholder:text-[#0E0E0E]/40 focus:outline-none focus:border-[#D15608] shadow-xs"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wider text-[#D15608] font-semibold hover:underline cursor-pointer"
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
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="fixed inset-y-0 right-0 max-w-[320px] w-[88vw] bg-[#FAF7F2] text-[#0E0E0E] border-l border-[rgba(14,14,14,0.1)] p-5 flex flex-col z-50 animate-in slide-in-from-right duration-300 shadow-2xl overflow-y-auto">
            {/* Drawer Header with Logo & Close */}
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(14,14,14,0.08)]">
              <div className="flex items-center gap-2.5">
                <img
                  src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                  alt="Padmanabha Fabrics"
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-[#D15608]/50 shrink-0"
                  width={36}
                  height={36}
                />
                <div>
                  <span className="font-['Manrope'] text-base font-semibold tracking-[0.2em] block leading-none">
                    PADMANABHA
                  </span>
                  <span className="text-[8.5px] font-medium uppercase tracking-[0.28em] text-[#D15608] mt-1 block">
                    FABRICS · CHENNAI
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-black/5 text-[#0E0E0E]/70 hover:text-[#0E0E0E] transition-colors cursor-pointer"
                aria-label="Close navigation menu"
                title="Close navigation menu"
              >
                <X className="size-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* Customer Account Pill (Top of Drawer) */}
            <div className="py-3 border-b border-[rgba(14,14,14,0.08)]">
              {isLoggedIn && customer ? (
                <div className="p-3 rounded-xl bg-white/70 border border-[#D15608]/30 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Signed in as</p>
                    <p className="font-bold text-xs text-[#0E0E0E] truncate">{customer.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logoutCustomer();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[11px] font-semibold text-[#9F160A] hover:underline shrink-0"
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
                  className="w-full min-h-[44px] p-2.5 rounded-xl bg-[#D15608] text-white hover:bg-[#9F160A] transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs cursor-pointer touch-manipulation"
                >
                  <User className="size-3.5" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 space-y-4 text-xs uppercase tracking-[0.16em] font-medium">
              <div className="space-y-1">
                <Link
                  to="/"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "text-[#D15608] font-semibold bg-[#D15608]/5 border-l-2 border-[#D15608]" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-black/5 hover:text-[#D15608] transition-colors border-l-2 border-transparent"
                >
                  <span>Home</span>
                </Link>
                <Link
                  to="/shop"
                  activeProps={{ className: "text-[#D15608] font-semibold bg-[#D15608]/5 border-l-2 border-[#D15608]" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-black/5 hover:text-[#D15608] transition-colors border-l-2 border-transparent"
                >
                  <span>Shop All Collections</span>
                </Link>

                {/* Categories quick chips */}
                <div className="pl-2.5 pr-1 py-1.5 flex flex-wrap gap-1.5">
                  {["Saree", "Chudithar", "Coordset", "Maxi", "Nighty", "Chudithar Top"].map((cat) => (
                    <Link
                      key={cat}
                      to="/shop"
                      search={{ category: cat } as any}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-sans font-medium tracking-normal capitalize bg-white/80 border border-border/80 hover:border-[#D15608] hover:text-[#9F160A] transition-colors"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>

                <Link
                  to="/about"
                  activeProps={{ className: "text-[#D15608] font-semibold bg-[#D15608]/5 border-l-2 border-[#D15608]" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-black/5 hover:text-[#D15608] transition-colors border-l-2 border-transparent"
                >
                  <span>About Us</span>
                </Link>
                <Link
                  to="/contact"
                  activeProps={{ className: "text-[#D15608] font-semibold bg-[#D15608]/5 border-l-2 border-[#D15608]" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-black/5 hover:text-[#D15608] transition-colors border-l-2 border-transparent"
                >
                  <span>Contact</span>
                </Link>
              </div>

              {/* Shopping & Orders Section */}
              <div className="pt-3 border-t border-[rgba(14,14,14,0.08)] space-y-1">
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-[#9F160A]/10 text-[#9F160A] dark:text-[#EDBC3D] font-semibold hover:bg-[#9F160A]/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="size-4 text-[#9F160A]" />
                    <span>My Orders & Tracking</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#9F160A] text-white">
                    Live
                  </span>
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-black/5 hover:text-[#D15608] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="size-4" />
                    <span>Shopping Bag</span>
                  </span>
                  <span className="text-[#D15608] font-semibold">({cartCount})</span>
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-black/5 hover:text-[#D15608] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="size-4" />
                    <span>Wishlist</span>
                  </span>
                  <span className="text-[#D15608] font-semibold">({wishlistCount})</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer with Showroom Address & Contact */}
            <div className="pt-4 border-t border-[rgba(14,14,14,0.08)] text-[11px] text-[#0E0E0E]/70 space-y-2 mt-auto">
              <p className="font-sans">
                <strong>Showroom:</strong> Menambedu, Ambattur, Chennai - 600053
              </p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="tel:+919940135700"
                  className="text-xs font-semibold text-[#D15608] hover:underline flex items-center gap-1"
                >
                  📞 +91 99401 35700
                </a>
                <span className="text-muted-foreground/40">·</span>
                <a
                  href="https://wa.me/919940135700"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#25D366] hover:underline"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Header;

