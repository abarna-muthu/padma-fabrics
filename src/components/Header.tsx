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
  const { count, setPanel, setFilter } = useStore();
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
          <Link
            to={isAuthenticated ? "/admin" : "/admin/login"}
            className="inline-flex"
            title={isAuthenticated ? "Admin Portal" : "Sign In / Admin"}
            aria-label={isAuthenticated ? "Admin Portal" : "Sign In"}
          >
            <Button
              variant="ghost"
              size="icon"
              className="icon-control"
              aria-label="Sign In"
            >
              <User className="size-4" />
            </Button>
          </Link>
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
