import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/padmanabha-logo.jpg";
import { ALL } from "@/lib/catalog";
import { useStore } from "@/context/StoreContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export function Header() {
  const {
    count,
    setPanel,
    setFilter,
    openCustomerOrders,
    openCustomerWishlist,
    setIsCustomerPortalOpen,
  } = useStore();
  const { isAuthenticated } = useAdminAuth();
  const { content } = useSiteContent();
  const { customer, isLoggedIn } = useCustomerAuth();

  const logoSrc = typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg";

  return (
    <>
      <div className="announcement flex items-center justify-center gap-2 px-4 text-center">
        <span>{content.home.announcementText}</span>
      </div>
      <header className="brand-header page-width">
        <Link to="/" className="brand-link" aria-label="Padmanabha Fabrics home">
          <img
            src={logoSrc}
            className="brand-logo"
            alt="Padmanabha Fabrics emblem logo"
            width={64}
            height={64}
          />
          <div>
            <div className="brand-name">Padmanabha</div>
            <div className="brand-caption">Fabrics · Chennai</div>
          </div>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary font-semibold" }}
          >
            Home
          </Link>
          <Link
            to="/shop"
            activeProps={{ className: "text-primary font-semibold" }}
            onClick={() => setFilter(ALL)}
          >
            Shop
          </Link>
          <Link to="/about" activeProps={{ className: "text-primary font-semibold" }}>
            About Us
          </Link>
          <Link to="/contact" activeProps={{ className: "text-primary font-semibold" }}>
            Contact
          </Link>
        </nav>
        <div className="header-actions">
          <Button
            variant="ghost"
            size="icon"
            className="icon-control"
            title="Search"
            aria-label="Search fabrics"
            onClick={() => setPanel("search")}
          >
            <Search />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="icon-control hidden sm:inline-flex"
            title="Saved fabrics"
            aria-label="Saved fabrics"
            onClick={() => setPanel("favorites")}
          >
            <Heart />
          </Button>
          {/* Customer Account Button */}
          {isLoggedIn && customer ? (
            <button
              type="button"
              onClick={() => openCustomerOrders()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#9B2242]/10 hover:bg-[#9B2242]/20 border border-[#9B2242]/30 text-xs font-semibold text-primary transition-all cursor-pointer shadow-2xs"
              title="My Orders & Wishlist"
              aria-label="My Orders & Wishlist"
            >
              <div className="size-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                {customer.name ? customer.name.charAt(0) : "C"}
              </div>
              <span className="max-w-[80px] truncate hidden sm:inline-block">
                {customer.name ? customer.name.split(" ")[0] : "Account"}
              </span>
            </button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="icon-control cursor-pointer"
              title="Sign In / My Orders"
              aria-label="Sign In / My Orders"
              onClick={() => setIsCustomerPortalOpen(true)}
            >
              <User className="size-4" />
            </Button>
          )}

          {/* Quick Admin link if admin authenticated */}
          {isAuthenticated && (
            <Link
              to="/admin"
              className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-semibold uppercase tracking-wider hover:bg-amber-500/20 transition-all"
              title="Admin Portal"
            >
              <span>Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            className="icon-control px-2.5 py-1.5 rounded-full hover:bg-[#9B2242]/10 transition-colors"
            title="Shopping bag"
            aria-label={`Shopping bag, ${count} items`}
            onClick={() => setPanel("bag")}
          >
            <ShoppingBag className="size-4 text-foreground hover:text-[#9B2242]" />
            {count > 0 ? (
              <span className="text-[11px] font-bold px-1.5 py-0.2 bg-gradient-to-r from-[#9B2242] to-[#7B162E] text-white rounded-full shadow-xs">
                {count}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">({count})</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu"
            aria-label="Open menu"
            onClick={() => setPanel("menu")}
          >
            <Menu />
          </Button>
        </div>
      </header>
    </>
  );
}
