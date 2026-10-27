import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  MapPin,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";
import { PincodeModal } from "@/components/PincodeModal";
import logo from "@/assets/padmanabha-logo.jpg";

interface MegaSubItem {
  name: string;
  category?: string;
  search?: string;
}

interface MegaColumn {
  heading: string;
  items: MegaSubItem[];
}

interface NavCategory {
  name: string;
  tag?: string;
  categoryParam?: string;
  searchParam?: string;
  columns?: MegaColumn[];
  bannerImage?: string;
  bannerTitle?: string;
  bannerLink?: string;
}

const NAVIGATION_ITEMS: NavCategory[] = [
  {
    name: "New In",
    tag: "NEW",
    searchParam: "new",
    bannerImage: "/hero-banner-1.jpg",
    bannerTitle: "The New Festive Edit",
    bannerLink: "/shop?search=new",
    columns: [
      {
        heading: "What's Hot",
        items: [
          { name: "Latest Arrivals", search: "new" },
          { name: "Silk & Handloom Edit", category: "Saree" },
          { name: "Festive Kurta Sets", category: "Chudithar" },
          { name: "Artisanal Coordinates", category: "Coordset" },
          { name: "View All New In", search: "new" },
        ],
      },
      {
        heading: "Curated Edits",
        items: [
          { name: "Editor's Choice", search: "editor" },
          { name: "Modern Elegance", category: "Maxi" },
          { name: "Celebration Tunics", category: "Chudithar Top" },
          { name: "Contemporary 2-Piece", category: "2piece" },
        ],
      },
    ],
  },
  {
    name: "Wedding",
    tag: "FESTIVE",
    searchParam: "wedding",
    bannerImage: "/hero-banner-2.png",
    bannerTitle: "Opulent Heritage Silks",
    bannerLink: "/shop?category=Saree",
    columns: [
      {
        heading: "By Function",
        items: [
          { name: "Haldi & Mehndi Yellows", search: "yellow" },
          { name: "Sangeet Glamour", search: "silk" },
          { name: "Bridal Drapes", category: "Saree" },
          { name: "Reception Ready", category: "Chudithar" },
          { name: "Bridesmaid Ensembles", category: "Combo Dresses" },
        ],
      },
      {
        heading: "Trending Weaves",
        items: [
          { name: "Kanchipuram Silk Sarees", category: "Saree" },
          { name: "Antique Zari Brocades", search: "zari" },
          { name: "Rich Wine & Golds", search: "wine" },
          { name: "Royal Indigo Cottons", search: "indigo" },
          { name: "View All Wedding Wear", search: "wedding" },
        ],
      },
    ],
  },
  {
    name: "Sets",
    categoryParam: "Chudithar",
    bannerImage: "/hero-banner-3.jpg",
    bannerTitle: "Bespoke Ethnic Coordinates",
    bannerLink: "/shop?category=Chudithar",
    columns: [
      {
        heading: "By Silhouette",
        items: [
          { name: "2 pcs Kurta Sets", category: "2piece" },
          { name: "3 pcs Festive Suit Sets", category: "Chudithar" },
          { name: "Anarkali Silhouette Sets", search: "anarkali" },
          { name: "A-Line Flared Sets", category: "Chudithar" },
          { name: "Sharara & Palazzo Sets", search: "palazzo" },
        ],
      },
      {
        heading: "Modern Formats",
        items: [
          { name: "Artisanal Co-ord Sets", category: "Coordset" },
          { name: "Plus Size Fits (2XL - 6XL)", search: "plus" },
          { name: "Pure Cotton Daily Sets", category: "Chudithar" },
          { name: "View All Sets", category: "Chudithar" },
        ],
      },
    ],
  },
  {
    name: "Kurtas",
    categoryParam: "Chudithar Top",
    columns: [
      {
        heading: "Styles",
        items: [
          { name: "Everyday Work Kurtas", category: "Chudithar Top" },
          { name: "Festive Embroidered Tunics", search: "embroidery" },
          { name: "Printed Cotton Kurtas", category: "Chudithar Top" },
          { name: "Short Tunics & Tops", category: "Chudithar Top" },
          { name: "View All Kurtas", category: "Chudithar Top" },
        ],
      },
      {
        heading: "Fabrics",
        items: [
          { name: "Pure Breathable Cotton", search: "cotton" },
          { name: "Chanderi Silk Finish", search: "silk" },
          { name: "Linen Blends", search: "linen" },
          { name: "Soft Rayon Drapes", category: "Chudithar Top" },
        ],
      },
    ],
  },
  {
    name: "Dresses",
    categoryParam: "Maxi",
    columns: [
      {
        heading: "Categories",
        items: [
          { name: "Tiered Maxi Dresses", category: "Maxi" },
          { name: "Ethnic Fusion Dresses", category: "Maxi" },
          { name: "Relaxed Day Dresses", category: "Maxi" },
          { name: "Combo Dress Sets", category: "Combo Dresses" },
          { name: "View All Dresses", category: "Maxi" },
        ],
      },
    ],
  },
  {
    name: "Sarees",
    categoryParam: "Saree",
    bannerImage: "/hero-banner-1.jpg",
    bannerTitle: "Handwoven Drapes",
    bannerLink: "/shop?category=Saree",
    columns: [
      {
        heading: "Silk & Traditional",
        items: [
          { name: "Traditional Silk Sarees", category: "Saree" },
          { name: "Banarasi & Brocade Borders", search: "brocade" },
          { name: "Handloom Weaves", category: "Saree" },
          { name: "Zari Embellished", search: "zari" },
        ],
      },
      {
        heading: "Everyday Weaves",
        items: [
          { name: "Soft Mulmul Cotton", search: "cotton" },
          { name: "Printed Daily Drapes", category: "Saree" },
          { name: "Loom Heritage Edit", category: "Saree" },
          { name: "View All Sarees", category: "Saree" },
        ],
      },
    ],
  },
  {
    name: "Bottoms",
    categoryParam: "2piece",
    columns: [
      {
        heading: "Bottomwear",
        items: [
          { name: "Cotton Straight Pants", category: "2piece" },
          { name: "Flared Palazzos", search: "palazzo" },
          { name: "Salwars & Churidars", category: "Chudithar" },
          { name: "Co-ord Bottoms", category: "Coordset" },
          { name: "View All Bottoms", category: "2piece" },
        ],
      },
    ],
  },
  {
    name: "Sale",
    tag: "UP TO 40% OFF",
    searchParam: "sale",
    columns: [
      {
        heading: "Steal Deals",
        items: [
          { name: "Special Festive Offers", search: "sale" },
          { name: "Under ₹1999", search: "sale" },
          { name: "Last Pieces Clearance", search: "sale" },
          { name: "View All Sale", search: "sale" },
        ],
      },
    ],
  },
];

export function Header() {
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logoutCustomer } = useCustomerAuth();
  const { setIsCustomerPortalOpen } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // User dropdown menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Pincode check
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [userPincode, setUserPincode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("pf_user_pincode") || "";
      } catch {}
    }
    return "";
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Lock body scroll when mobile menu is open
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

  const handleNavClick = (categoryParam?: string, searchParam?: string) => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    if (categoryParam) {
      navigate({ to: "/shop", search: { category: categoryParam } as any });
    } else if (searchParam) {
      navigate({ to: "/shop", search: { search: searchParam } as any });
    } else {
      navigate({ to: "/shop" });
    }
  };

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT BAR (W for Woman style, sticky top banner) */}
      <div className="bg-[#141414] text-[#FAF6EE] text-[11px] font-medium tracking-[0.18em] uppercase py-2 px-4 select-none relative z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-center">
          <div className="hidden lg:flex items-center gap-2 text-white/70">
            <Sparkles className="size-3 text-[#EDBC3D]" />
            <span>Chennai Flagship Showroom · Ambattur</span>
          </div>
          <div className="w-full lg:w-auto font-light text-center">
            Complimentary Shipping on Domestic Orders · Use Code: <strong className="text-[#EDBC3D] font-bold">PADMA10</strong> for 10% Off
          </div>
          <div className="hidden lg:flex items-center gap-3 text-white/80">
            <a href="tel:+919940145700" className="hover:text-white transition-colors">
              Help: +91 99401 45700
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-200 border-b ${
          isScrolled
            ? "border-[#E5DAC4] shadow-sm"
            : "border-[#EBE6DC]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-2 sm:gap-6">
            {/* Left: Mobile Hamburger + Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1.5 rounded-md text-[#0E0E0E] hover:bg-black/5 cursor-pointer touch-manipulation"
                aria-label="Open navigation menu"
              >
                <Menu className="size-6" />
              </button>

              <Link
                to="/"
                className="flex items-center gap-2.5 sm:gap-3 group select-none shrink-0"
                aria-label="Padmanabha Fabrics Home"
              >
                <img
                  src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                  alt="Padmanabha Fabrics"
                  className="h-10 sm:h-12 w-auto object-contain rounded-md shadow-xs group-hover:scale-102 transition-transform duration-300"
                />
                <div className="flex flex-col">
                  <span className="font-['Cormorant_Garamond'] text-lg sm:text-2xl font-bold tracking-tight text-[#0E0E0E] uppercase leading-none">
                    Padmanabha
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.28em] text-[#9F160A] uppercase mt-0.5">
                    Fabrics · Chennai
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation with MEGA MENU on Hover */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-2 h-full"
              onMouseLeave={() => setActiveMegaMenu(null)}
            >
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = activeMegaMenu === item.name;
                const isSale = item.name === "Sale";
                return (
                  <div
                    key={item.name}
                    className="h-full flex items-center relative"
                    onMouseEnter={() => setActiveMegaMenu(item.name)}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.categoryParam, item.searchParam)}
                      className={`h-full px-2.5 xl:px-3 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors relative flex items-center gap-1 cursor-pointer ${
                        isSale
                          ? "text-[#9F160A] hover:text-[#7D1107]"
                          : isActive
                          ? "text-[#9F160A]"
                          : "text-[#0E0E0E] hover:text-[#9F160A]"
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.tag && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                            isSale ? "bg-[#9F160A] text-white" : "bg-[#EDBC3D] text-[#0E0E0E]"
                          }`}
                        >
                          {item.tag}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 inset-x-2.5 h-[2.5px] bg-[#9F160A] transition-all" />
                      )}
                    </button>

                    {/* Mega Menu Dropdown */}
                    {isActive && item.columns && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] xl:w-[840px] bg-white text-[#0E0E0E] shadow-2xl border border-[#E5DAC4] rounded-b-2xl p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                        {item.columns.map((col, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9F160A] pb-1.5 border-b border-[#E5DAC4]/60">
                              {col.heading}
                            </h4>
                            <ul className="space-y-2">
                              {col.items.map((subItem, sIdx) => (
                                <li key={sIdx}>
                                  <button
                                    type="button"
                                    onClick={() => handleNavClick(subItem.category, subItem.search)}
                                    className="text-xs text-[#5C5549] hover:text-[#9F160A] hover:translate-x-1 transition-all text-left flex items-center gap-1 cursor-pointer font-medium"
                                  >
                                    <span>{subItem.name}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {/* Visual Card / Banner inside Mega Menu */}
                        {item.bannerImage && (
                          <div
                            onClick={() => {
                              setActiveMegaMenu(null);
                              if (item.bannerLink) navigate({ to: item.bannerLink as any });
                            }}
                            className="relative aspect-4/5 rounded-xl overflow-hidden group/card cursor-pointer shadow-md border border-[#E5DAC4]"
                          >
                            <img
                              src={item.bannerImage}
                              alt={item.bannerTitle || "Collection"}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#EDBC3D]">
                                Featured
                              </span>
                              <h5 className="font-['Cormorant_Garamond'] text-lg font-bold leading-tight mt-0.5">
                                {item.bannerTitle}
                              </h5>
                              <span className="text-[11px] font-semibold text-white/90 underline mt-1">
                                Shop Collection →
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Side: Pincode Check, Search, Account, Wishlist, Cart */}
            <div className="flex items-center gap-2 sm:gap-3.5">
              {/* Pincode Check Input / Button */}
              <button
                type="button"
                onClick={() => setIsPincodeModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5DAC4] text-[11px] font-medium text-[#5C5549] hover:border-[#9F160A] hover:text-[#9F160A] transition-colors cursor-pointer bg-[#FAF6EE]/50"
                title="Check delivery availability"
              >
                <MapPin className="size-3.5 text-[#9F160A]" />
                <span>{userPincode ? `Deliver: ${userPincode}` : "Check Pincode"}</span>
              </button>

              {/* Expandable Search Bar */}
              <div className="relative">
                {isSearchOpen ? (
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center bg-[#FAF6EE] border border-[#9F160A] rounded-full px-3 py-1 shadow-xs animate-in fade-in duration-150"
                  >
                    <Search className="size-4 text-[#9F160A] shrink-0 mr-1.5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sarees, kurtas, sets..."
                      className="bg-transparent text-xs text-[#0E0E0E] focus:outline-none w-36 sm:w-56"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="p-1 text-black/50 hover:text-black cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-[#0E0E0E] hover:text-[#9F160A] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                    aria-label="Open search"
                  >
                    <Search className="size-5" strokeWidth={1.75} />
                  </button>
                )}
              </div>

              {/* Account Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="p-2 text-[#0E0E0E] hover:text-[#9F160A] hover:bg-black/5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                  aria-label="Customer account"
                >
                  <User className="size-5" strokeWidth={1.75} />
                  {isLoggedIn && (
                    <span className="hidden xl:inline text-xs font-semibold max-w-[70px] truncate">
                      {customer?.name?.split(" ")[0]}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white text-[#0E0E0E] shadow-xl border border-[#E5DAC4] rounded-xl p-2 animate-in fade-in zoom-in-95 duration-150 z-50">
                    {isLoggedIn ? (
                      <>
                        <div className="px-3 py-2 border-b border-[#E5DAC4]/60">
                          <p className="text-xs font-bold text-[#0E0E0E] truncate">
                            {customer?.name || "Customer"}
                          </p>
                          <p className="text-[10px] text-[#5C5549] truncate mt-0.5">
                            {customer?.email}
                          </p>
                        </div>
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsCustomerPortalOpen(true);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#FAF6EE] rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Package className="size-3.5 text-[#9F160A]" />
                            <span>My Orders & Portal</span>
                          </button>
                          <Link
                            to="/wishlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#FAF6EE] rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Heart className="size-3.5 text-[#9F160A]" />
                            <span>Saved Wishlist ({wishlistCount})</span>
                          </Link>
                        </div>
                        <div className="pt-1 border-t border-[#E5DAC4]/60">
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logoutCustomer();
                            }}
                            className="w-full px-3 py-1.5 text-xs text-left text-red-700 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2 cursor-pointer font-medium"
                          >
                            <LogOut className="size-3.5" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-2 space-y-2 text-center">
                        <p className="text-xs text-[#5C5549]">
                          Welcome to Padmanabha Fabrics
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsCustomerPortalOpen(true);
                          }}
                          className="w-full py-2 rounded-lg bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                        >
                          Log In / Register
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Icon with Count Badge */}
              <Link
                to="/wishlist"
                className="relative p-2 text-[#0E0E0E] hover:text-[#9F160A] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="size-5" strokeWidth={1.75} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 size-4 rounded-full bg-[#9F160A] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon with Count Badge (Triggers right-sliding drawer) */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#0E0E0E] hover:text-[#9F160A] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                aria-label={`Shopping Cart with ${cartCount} items`}
              >
                <ShoppingBag className="size-5" strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 size-4 rounded-full bg-[#9F160A] text-white text-[9px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-150">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. MOBILE ACCORDION NAVIGATION DRAWER (Slide-over from left) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden select-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white text-[#0E0E0E] shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#EBE6DC] flex items-center justify-between bg-[#FAF6EE]">
              <div className="flex items-center gap-2">
                <img
                  src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
                  alt="Padmanabha Fabrics"
                  className="size-8 object-contain rounded"
                />
                <span className="font-['Cormorant_Garamond'] text-lg font-bold text-[#0E0E0E] uppercase">
                  Menu
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-black/60 hover:text-black cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Mobile Pincode Indicator */}
            <div className="px-4 py-2.5 bg-[#FAF7F2] border-b border-[#EBE6DC] flex items-center justify-between text-xs">
              <span className="text-[#5C5549] flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[#9F160A]" />
                {userPincode ? `PIN: ${userPincode}` : "Delivery Pincode"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPincodeModalOpen(true);
                }}
                className="text-[#9F160A] font-semibold uppercase tracking-wider text-[10px]"
              >
                {userPincode ? "Change" : "Check PIN"}
              </button>
            </div>

            {/* Drawer Accordion Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {NAVIGATION_ITEMS.map((item) => {
                const isExpanded = expandedMobileCategory === item.name;
                const hasSub = item.columns && item.columns.length > 0;
                return (
                  <div key={item.name} className="border-b border-[#EBE6DC]/60 pb-1">
                    <div className="flex items-center justify-between py-2.5">
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.categoryParam, item.searchParam)}
                        className="text-xs font-bold uppercase tracking-wider text-[#0E0E0E] hover:text-[#9F160A] text-left flex items-center gap-1.5"
                      >
                        <span>{item.name}</span>
                        {item.tag && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EDBC3D] text-[#0E0E0E] font-bold">
                            {item.tag}
                          </span>
                        )}
                      </button>

                      {hasSub && (
                        <button
                          type="button"
                          onClick={() => setExpandedMobileCategory(isExpanded ? null : item.name)}
                          className="p-1 text-black/50 hover:text-black cursor-pointer"
                        >
                          <ChevronDown
                            className={`size-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-[#9F160A]" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub-items accordion */}
                    {isExpanded && hasSub && (
                      <div className="pl-3 pb-2 space-y-2 animate-in fade-in duration-150">
                        {item.columns!.map((col, cIdx) => (
                          <div key={cIdx} className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9F160A]">
                              {col.heading}
                            </span>
                            <ul className="space-y-1.5 pl-2">
                              {col.items.map((sub, sIdx) => (
                                <li key={sIdx}>
                                  <button
                                    type="button"
                                    onClick={() => handleNavClick(sub.category, sub.search)}
                                    className="text-xs text-[#5C5549] hover:text-[#9F160A] text-left"
                                  >
                                    {sub.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Extra Mobile Links */}
              <div className="pt-4 space-y-2 text-xs">
                <Link
                  to="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-[#0E0E0E] font-semibold uppercase tracking-wider hover:text-[#9F160A]"
                >
                  All Collections
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-[#5C5549] hover:text-[#0E0E0E]"
                >
                  Our Heritage & Weaves
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-[#5C5549] hover:text-[#0E0E0E]"
                >
                  Store Locator & Contact
                </Link>
              </div>
            </div>

            {/* Mobile Footer Auth Button */}
            <div className="p-4 border-t border-[#EBE6DC] bg-[#FAF6EE]">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0E0E0E]">{customer?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logoutCustomer();
                      }}
                      className="text-red-700 font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCustomerPortalOpen(true);
                    }}
                    className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-[#0E0E0E] text-white rounded-lg text-center"
                  >
                    My Orders
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCustomerPortalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#9F160A] text-white text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Log In / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pincode Verification Modal */}
      <PincodeModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        currentPincode={userPincode}
        onPincodeChange={(pin) => setUserPincode(pin)}
      />
    </>
  );
}

export default Header;
