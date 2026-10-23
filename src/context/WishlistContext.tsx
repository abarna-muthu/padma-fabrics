import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const STORAGE_WISHLIST_KEY = "pf_wishlist_items_v2";

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_WISHLIST_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load wishlist from localStorage", e);
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist to localStorage", e);
      }
    }
  }, [wishlist]);

  const isInWishlist = (productId: string) => wishlist.includes(String(productId));

  const toggleWishlist = (productId: string, productName?: string) => {
    const idStr = String(productId);
    setWishlist((prev) => {
      const exists = prev.includes(idStr);
      if (exists) {
        toast.info(productName ? `Removed "${productName}" from wishlist` : "Removed from wishlist");
        return prev.filter((id) => id !== idStr);
      } else {
        toast.success(productName ? `Saved "${productName}" to wishlist` : "Saved to wishlist");
        return [...prev, idStr];
      }
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== String(productId)));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
