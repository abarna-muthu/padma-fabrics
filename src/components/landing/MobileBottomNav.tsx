import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Grid, ShoppingBag, Zap, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";

interface MobileBottomNavProps {
  onOpenLogin?: () => void;
}

export function MobileBottomNav({ onOpenLogin }: MobileBottomNavProps = {}) {
  const { cartCount, setIsCartOpen } = useCart();
  const { setIsCustomerPortalOpen, isCustomerPortalOpen } = useStore();

  const { pathname, search } = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      search: (s.location.search || {}) as any,
    }),
  });

  const isHomeActive = pathname === "/";
  const isOffersActive = Boolean(search?.sale) || pathname === "/offers";
  const isCategoriesActive = (pathname === "/shop" || pathname.startsWith("/product/")) && !isOffersActive;
  const isCartActive = pathname === "/cart";
  const isAccountActive = pathname === "/orders" || pathname === "/login" || isCustomerPortalOpen;

  const handleAccountClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      setIsCustomerPortalOpen(true);
    }
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#1A1617] border-t border-[#E6E6E6] dark:border-white/10 py-2 px-4 flex items-center justify-around md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)] font-['Poppins'] touch-manipulation select-none"
    >
      {/* Home */}
      <Link
        to="/"
        className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider transition-colors ${
          isHomeActive ? "text-[#D0202B]" : "text-[#555555] hover:text-[#D0202B]"
        }`}
      >
        <Home className={`size-5 mb-0.5 ${isHomeActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
        <span>Home</span>
      </Link>

      {/* Categories */}
      <Link
        to="/shop"
        className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider transition-colors ${
          isCategoriesActive ? "text-[#D0202B]" : "text-[#555555] hover:text-[#D0202B]"
        }`}
      >
        <Grid className={`size-5 mb-0.5 ${isCategoriesActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
        <span>Categories</span>
      </Link>

      {/* Cart with badge */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
          isCartActive ? "text-[#D0202B]" : "text-[#555555] hover:text-[#D0202B]"
        }`}
        aria-label="Open Shopping Bag"
      >
        <div className="relative">
          <ShoppingBag className={`size-5 mb-0.5 ${isCartActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#D0202B] text-white text-[8px] font-bold rounded-full size-3.5 flex items-center justify-center animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>

      {/* Offers */}
      <Link
        to="/shop"
        search={{ sale: true } as any}
        className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider transition-colors ${
          isOffersActive ? "text-[#C9922B]" : "text-[#C9922B]/80 hover:text-[#C9922B]"
        }`}
      >
        <Zap className="size-5 mb-0.5 fill-[#C9922B]" />
        <span>Offers</span>
      </Link>

      {/* Account */}
      <button
        type="button"
        onClick={handleAccountClick}
        className={`flex flex-col items-center text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
          isAccountActive ? "text-[#D0202B]" : "text-[#555555] hover:text-[#D0202B]"
        }`}
        aria-label="Open Account Portal"
      >
        <User className={`size-5 mb-0.5 ${isAccountActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
        <span>Account</span>
      </button>
    </nav>
  );
}
