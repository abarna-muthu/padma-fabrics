import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Heart,
  ShoppingBag,
  Zap,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface LandingHeaderProps {
  onOpenLogin: () => void;
}

// Mega menu data definition
const MEGA_MENUS: Record<
  string,
  {
    columns: { title: string; items: string[] }[];
    promo: { title: string; image: string; tag: string };
  }
> = {
  WEDDING: {
    columns: [
      {
        title: "OCCASION WEAR",
        items: ["Wishful", "Haldi", "Mehndi", "Sangeet"],
      },
      {
        title: "WEDDING EDIT",
        items: ["Bridesmaid", "Stories", "Party Wear"],
      },
      {
        title: "FESTIVITIES",
        items: ["Light Festive", "Heavy Festive", "Online Exclusive"],
      },
      {
        title: "FEATURED",
        items: ["Silk Ensembles", "Embroidered Sets", "Brocade Weaves"],
      },
    ],
    promo: {
      title: "Wedding Couture 2026",
      tag: "ROYAL WEAVES",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    },
  },
  SETS: {
    columns: [
      {
        title: "KURTA SETS",
        items: ["View All", "2 pcs Kurta Sets", "3 pcs Kurta Sets"],
      },
      {
        title: "SILHOUETTES",
        items: ["Anarkali Sets", "A-line Sets", "Straight Suit Sets"],
      },
      {
        title: "TRENDING",
        items: ["Sharara Sets", "Coord Sets", "Plus Size Suit Sets"],
      },
      {
        title: "FABRICS",
        items: ["Pure Silk", "Chanderi", "Organza Sets"],
      },
    ],
    promo: {
      title: "Handcrafted Sets",
      tag: "NEW IN",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
    },
  },
  KURTAS: {
    columns: [
      {
        title: "POPULAR FITS",
        items: ["View All", "A-line Kurtas", "Straight Kurtas"],
      },
      {
        title: "CONTEMPORARY",
        items: ["Flared Kurtas", "Asymmetrical Kurtas"],
      },
      {
        title: "SPECIAL EDITIONS",
        items: ["Winter Kurtas", "Plus Size Kurtas", "Festive Tunics"],
      },
      {
        title: "COLOURS",
        items: ["Crimson Reds", "Ivory Creams", "Royal Gold"],
      },
    ],
    promo: {
      title: "Everyday Kurtas",
      tag: "MUST HAVES",
      image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=600&q=80",
    },
  },
  DRESSES: {
    columns: [
      {
        title: "ALL DRESSES",
        items: ["View All", "Gown and Dresses"],
      },
      {
        title: "DRAPES & SAREES",
        items: ["Sarees", "Kanchipuram Silks", "Banarasi Weaves"],
      },
      {
        title: "FUSION STYLES",
        items: ["Jumpsuits", "Indo-Western Maxis"],
      },
      {
        title: "OCCASION",
        items: ["Cocktail Ensembles", "Daylight Sundowners"],
      },
    ],
    promo: {
      title: "Fluid Silhouettes",
      tag: "ELEGANCE",
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
    },
  },
  BOTTOMS: {
    columns: [
      {
        title: "PANTS & TROUSERS",
        items: ["View All", "Leggings", "Trousers & Pants"],
      },
      {
        title: "ETHNIC BOTTOMS",
        items: ["Palazzos & Culottes", "Shararas and Salwars"],
      },
      {
        title: "MODERN FITS",
        items: ["Skirts", "Jeggings", "Plus Size Bottom"],
      },
      {
        title: "FABRICS",
        items: ["Cotton Chino", "Brocade Silk", "Rayon Stretch"],
      },
    ],
    promo: {
      title: "Perfect Pairings",
      tag: "COMFORT FIT",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    },
  },
};

export function LandingHeader({ onOpenLogin }: LandingHeaderProps) {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { isLoggedIn, customer } = useCustomerAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Pincode popover state
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [isExpressEnabled, setIsExpressEnabled] = useState(false);

  // Mobile menu drawer
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(key);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { search: searchQuery.trim() } as any });
      setIsSearchOpen(false);
    }
  };

  const checkPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode)) {
      setPincodeStatus("valid");
    } else {
      setPincodeStatus("invalid");
    }
  };

  const navItems = [
    { label: "NEW IN", href: "/shop?sort=newest" },
    { label: "WEDDING", href: "/shop?category=Wedding", hasMega: true },
    { label: "ONLINE EXCLUSIVE", href: "/shop?exclusive=true" },
    { label: "SETS", href: "/shop?category=Kurta Sets", hasMega: true },
    { label: "KURTAS", href: "/shop?category=Kurtas", hasMega: true },
    { label: "DRESSES", href: "/shop?category=Dresses", hasMega: true },
    { label: "BOTTOMS", href: "/shop?category=Bottoms", hasMega: true },
    { label: "FOLKSONG", href: "/shop?collection=folksong" },
    { label: "SALE", href: "/shop?sale=true", isRed: true },
    { label: "MANAGE ORDER", href: isLoggedIn ? "/orders" : "#", isOrder: true },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 font-['Poppins'] ${
        isScrolled
          ? "bg-white text-[#111111] shadow-md border-b border-[#E6E6E6]"
          : "bg-transparent text-white border-none shadow-none"
      }`}
      style={
        !isScrolled
          ? {
              backgroundColor: "transparent",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              boxShadow: "none",
              border: "none",
            }
          : undefined
      }
    >
      <div className="w-full px-4 lg:px-8 h-[64px] flex items-center justify-between relative">
        {/* Mobile: Hamburger on left */}
        <div className="flex items-center gap-3 xl:hidden">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open navigation menu"
            className="p-1 cursor-pointer"
          >
            <Menu className="size-6" />
          </button>
        </div>

        {/* Left: Red square logo with white monogram */}
        <div className="flex items-center shrink-0 mr-4 xl:mr-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 group select-none whitespace-nowrap shrink-0"
            aria-label="Brand Home"
          >
            {/* 44px red square with white monogram */}
            <div className="size-[44px] shrink-0 bg-[#D0202B] rounded-[2px] flex items-center justify-center text-white font-bold text-[22px] tracking-tight shadow-xs transition-transform group-hover:scale-105">
              <span>P</span>
            </div>
            <div className="flex flex-col whitespace-nowrap shrink-0">
              <span
                className={`font-['Poppins'] text-[14px] md:text-[16px] font-bold tracking-[0.12em] leading-tight whitespace-nowrap ${
                  isScrolled ? "text-[#111111]" : "text-white drop-shadow-xs"
                }`}
              >
                PADMANABHA
              </span>
              <span
                className={`text-[8px] font-semibold tracking-[0.24em] uppercase whitespace-nowrap ${
                  isScrolled ? "text-[#D0202B]" : "text-[#EDBC3D]"
                }`}
              >
                FABRICS · CHENNAI
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar with Mega Menu */}
        <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-[0.06em] 2xl:tracking-[0.08em] h-full shrink-0">
          {navItems.map((item) => {
            const hasMega = item.hasMega && MEGA_MENUS[item.label];
            const isRed = item.isRed;

            return (
              <div
                key={item.label}
                className="relative h-full flex items-center shrink-0"
                onMouseEnter={() => hasMega && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={item.href}
                  onClick={(e) => {
                    if (item.isOrder && !isLoggedIn) {
                      e.preventDefault();
                      onOpenLogin();
                    }
                  }}
                  className={`h-full flex items-center relative transition-colors duration-200 group py-4 whitespace-nowrap shrink-0 ${
                    isRed
                      ? "text-[#D0202B] font-extrabold"
                      : isScrolled
                      ? "text-[#111111] hover:text-[#D0202B]"
                      : "text-white drop-shadow-xs hover:text-[#FAF6EE]"
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  {/* Red underline indicator on hover */}
                  <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#D0202B] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Right Cluster: Pincode Toggle, Search, Gold Lightning, Wishlist, Cart, Loyalty Badge */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Pincode trigger */}
          <div className="hidden xl:flex flex-col items-end relative text-right">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider opacity-80">
                Express
              </span>
              <button
                type="button"
                onClick={() => setIsExpressEnabled(!isExpressEnabled)}
                className={`w-7 h-3.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isExpressEnabled ? "bg-[#D0202B]" : "bg-neutral-400"
                }`}
              >
                <div
                  className={`size-2.5 rounded-full bg-white transition-transform ${
                    isExpressEnabled ? "translate-x-3.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsPincodeOpen(!isPincodeOpen)}
              className="text-[10px] underline hover:text-[#D0202B] transition-colors cursor-pointer opacity-90 leading-tight mt-0.5"
            >
              Enter your pincode
            </button>

            {/* Pincode Popover */}
            {isPincodeOpen && (
              <div
                className="absolute top-12 right-0 z-50 w-64 bg-white text-[#111111] p-3.5 rounded-[2px] shadow-xl border border-[#E6E6E6] text-left animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Check Delivery Pincode
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPincodeOpen(false)}
                    className="text-[#777777] hover:text-[#111111]"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <form onSubmit={checkPincode} className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ""));
                      setPincodeStatus("idle");
                    }}
                    placeholder="6-digit PIN"
                    className="flex-1 border border-[#E6E6E6] rounded-[2px] px-2 py-1 text-xs font-mono outline-none focus:border-[#D0202B]"
                  />
                  <button
                    type="submit"
                    className="bg-[#D0202B] text-white px-2.5 py-1 text-[11px] font-bold uppercase rounded-[2px]"
                  >
                    Check
                  </button>
                </form>
                {pincodeStatus === "valid" && (
                  <p className="mt-2 text-[10px] font-semibold text-emerald-600">
                    ✓ Delivery available for {pincode}
                  </p>
                )}
                {pincodeStatus === "invalid" && (
                  <p className="mt-2 text-[10px] font-semibold text-[#D0202B]">
                    ✕ Invalid pincode. Please enter 6 digits.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Search Bar / Icon */}
          <div className="relative">
            {isSearchOpen ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-white text-[#111111] border border-[#E6E6E6] rounded-[2px] px-2.5 py-1 shadow-lg w-48 sm:w-64 animate-in fade-in"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Search our site"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[12px] bg-transparent outline-none pr-1"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[#777777] hover:text-[#111111] mr-1"
                  >
                    <X className="size-3" />
                  </button>
                )}
                <button type="submit" aria-label="Submit search">
                  <Search className="size-4 text-[#D0202B]" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-1.5 text-xs text-[#777777]"
                >
                  <X className="size-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="p-1 hover:text-[#D0202B] transition-colors cursor-pointer"
              >
                <Search className="size-5" />
              </button>
            )}
          </div>

          {/* Small gold lightning / offer icon */}
          <Link
            to="/shop?sale=true"
            aria-label="Exclusive Offers"
            className="p-1 text-[#C9922B] hover:scale-110 transition-transform cursor-pointer hidden sm:block"
          >
            <Zap className="size-5 fill-[#C9922B]" />
          </Link>

          {/* Wishlist heart with tiny red dot */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative p-1 hover:text-[#D0202B] transition-colors cursor-pointer"
          >
            <Heart className="size-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-[#D0202B]" />
            )}
          </Link>

          {/* Cart Bag with count badge */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative p-1 hover:text-[#D0202B] transition-colors cursor-pointer"
          >
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D0202B] text-white text-[9px] font-bold rounded-full size-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Far-right small rounded-square red loyalty badge */}
          <button
            type="button"
            onClick={onOpenLogin}
            title={isLoggedIn ? `Welcome, ${customer?.name || "Member"}` : "Loyalty Rewards"}
            className="size-[28px] bg-[#D0202B] hover:bg-[#b01721] text-white rounded-[4px] flex items-center justify-center shadow-xs cursor-pointer select-none transition-transform hover:scale-105"
          >
            <span className="font-bold text-[11px] tracking-tight">★</span>
          </button>
        </div>
      </div>

      {/* FULL-WIDTH MEGA-MENU ON HOVER */}
      {activeMegaMenu && MEGA_MENUS[activeMegaMenu] && (
        <div
          className="absolute top-full inset-x-0 bg-white text-[#111111] border-b border-[#E6E6E6] shadow-2xl transition-all duration-200 z-50 animate-in fade-in"
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-5 gap-8">
            {/* 4 Link Columns */}
            {MEGA_MENUS[activeMegaMenu].columns.map((col, idx) => (
              <div key={idx} className="flex flex-col text-left">
                <h4 className="font-['Poppins'] text-[11px] font-bold uppercase tracking-[0.1em] text-[#D0202B] pb-2 border-b border-[#E6E6E6] mb-3">
                  {col.title}
                </h4>
                <ul className="space-y-2">
                  {col.items.map((subItem, sIdx) => (
                    <li key={sIdx}>
                      <Link
                        to="/shop"
                        search={{ category: subItem } as any}
                        onClick={() => setActiveMegaMenu(null)}
                        className="text-[12px] text-[#555555] hover:text-[#D0202B] hover:translate-x-1 inline-block transition-all"
                      >
                        {subItem}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* 1 Promo Image on the Right */}
            <div className="flex flex-col justify-center">
              <div className="relative rounded-[2px] overflow-hidden aspect-[4/5] bg-[#EDEDED] shadow-sm group">
                <img
                  src={MEGA_MENUS[activeMegaMenu].promo.image}
                  alt={MEGA_MENUS[activeMegaMenu].promo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#EDBC3D]">
                    {MEGA_MENUS[activeMegaMenu].promo.tag}
                  </span>
                  <p className="text-[13px] font-bold leading-tight mt-0.5">
                    {MEGA_MENUS[activeMegaMenu].promo.title}
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setActiveMegaMenu(null)}
                    className="mt-2 text-[10px] font-semibold uppercase tracking-wider underline hover:text-[#EDBC3D]"
                  >
                    SHOP NOW →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE SLIDE-IN LEFT DRAWER */}
      {isMobileDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 xl:hidden bg-black/60 backdrop-blur-xs flex animate-in fade-in"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="w-[82%] max-w-sm h-full bg-white text-[#111111] p-5 overflow-y-auto flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E6E6]">
                <div className="flex items-center gap-2">
                  <div className="size-8 bg-[#D0202B] rounded-[2px] flex items-center justify-center text-white font-bold text-[16px]">
                    P
                  </div>
                  <span className="font-bold text-[14px] tracking-wider text-[#111111]">
                    PADMANABHA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-1 text-[#777777]"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Pincode Input */}
              <div className="py-4 border-b border-[#E6E6E6]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777777] block mb-1.5">
                  DELIVERY PINCODE
                </span>
                <form onSubmit={checkPincode} className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit Pincode"
                    className="flex-1 border border-[#E6E6E6] rounded-[2px] px-2.5 py-1.5 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-[#D0202B] text-white px-3 py-1.5 text-[11px] font-bold uppercase rounded-[2px]"
                  >
                    Check
                  </button>
                </form>
                {pincodeStatus === "valid" && (
                  <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                    ✓ Available for delivery
                  </p>
                )}
              </div>

              {/* Accordion Menu */}
              <div className="py-4 space-y-1">
                {navItems.map((item) => {
                  const hasSub = item.hasMega && MEGA_MENUS[item.label];
                  const isOpen = openMobileAccordion === item.label;

                  return (
                    <div key={item.label} className="border-b border-[#E6E6E6]/60 pb-1">
                      {hasSub ? (
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMobileAccordion(isOpen ? null : item.label)
                            }
                            className="w-full flex items-center justify-between py-2 text-[12px] font-bold uppercase tracking-wider text-[#111111]"
                          >
                            <span className={item.isRed ? "text-[#D0202B]" : ""}>
                              {item.label}
                            </span>
                            <ChevronDown
                              className={`size-4 transition-transform duration-200 ${
                                isOpen ? "rotate-180 text-[#D0202B]" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="pl-3 pb-2 space-y-2 text-[12px] text-[#555555]">
                              {MEGA_MENUS[item.label].columns.flatMap((c) => c.items).slice(0, 8).map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  to="/shop"
                                  search={{ category: sub } as any}
                                  onClick={() => setIsMobileDrawerOpen(false)}
                                  className="block py-1 hover:text-[#D0202B]"
                                >
                                  {sub}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className={`block py-2 text-[12px] font-bold uppercase tracking-wider ${
                            item.isRed ? "text-[#D0202B]" : "text-[#111111]"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Login / Account Link */}
            <div className="pt-4 border-t border-[#E6E6E6]">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#111111]">
                    Hello, {customer?.name || "Member"}
                  </p>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="block text-xs text-[#D0202B] underline"
                  >
                    My Orders
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full h-10 bg-[#D0202B] text-white text-xs font-bold uppercase tracking-wider rounded-[2px]"
                >
                  LOGIN / REGISTER
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
