import { Link } from "@tanstack/react-router";
import { Home, Grid, ShoppingBag, Zap, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface MobileBottomNavProps {
  onOpenLogin: () => void;
}

export function MobileBottomNav({ onOpenLogin }: MobileBottomNavProps) {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E6E6E6] py-2 px-4 flex items-center justify-around md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)] font-['Poppins']">
      {/* Home */}
      <Link
        to="/"
        className="flex flex-col items-center text-[#D0202B] text-[9px] font-bold uppercase tracking-wider"
      >
        <Home className="size-5 mb-0.5" />
        <span>Home</span>
      </Link>

      {/* Categories */}
      <Link
        to="/shop"
        className="flex flex-col items-center text-[#555555] hover:text-[#D0202B] text-[9px] font-bold uppercase tracking-wider"
      >
        <Grid className="size-5 mb-0.5" />
        <span>Categories</span>
      </Link>

      {/* Cart with badge */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className="flex flex-col items-center text-[#555555] hover:text-[#D0202B] text-[9px] font-bold uppercase tracking-wider relative"
      >
        <div className="relative">
          <ShoppingBag className="size-5 mb-0.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-[#D0202B] text-white text-[8px] font-bold rounded-full size-3.5 flex items-center justify-center">
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
        className="flex flex-col items-center text-[#C9922B] text-[9px] font-bold uppercase tracking-wider"
      >
        <Zap className="size-5 mb-0.5 fill-[#C9922B]" />
        <span>Offers</span>
      </Link>

      {/* Account */}
      <button
        type="button"
        onClick={onOpenLogin}
        className="flex flex-col items-center text-[#555555] hover:text-[#D0202B] text-[9px] font-bold uppercase tracking-wider"
      >
        <User className="size-5 mb-0.5" />
        <span>Account</span>
      </button>
    </div>
  );
}
