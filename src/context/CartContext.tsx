import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { toast } from "sonner";

export interface CartItem {
  id: string; // product ID
  cartItemId: string; // unique item id (productId + size + colour)
  name: string;
  price: number;
  originalPrice?: number | undefined;
  image: string;
  category?: string | undefined;
  fabric?: string | undefined;
  size?: string | undefined;
  colour?: string | undefined;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product | any,
    size?: string,
    quantity?: number,
    colour?: string,
    customImage?: string,
    customPrice?: number,
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  directCheckoutItem: CartItem | null;
  setDirectCheckoutItem: (item: CartItem | null) => void;
  clearDirectCheckout: () => void;
}

const STORAGE_CART_KEY = "pf_cart_items_v2";
const STORAGE_DIRECT_CHECKOUT_KEY = "pf_direct_checkout_item";

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_CART_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error("Failed to load cart from localStorage", e);
      }
    }
    return [];
  });

  const [directCheckoutItem, setDirectCheckoutItemState] = useState<CartItem | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(STORAGE_DIRECT_CHECKOUT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object" && parsed.id) return parsed;
        }
      } catch (e) {
        console.error("Failed to load direct checkout item", e);
      }
    }
    return null;
  });

  const setDirectCheckoutItem = (item: CartItem | null) => {
    setDirectCheckoutItemState(item);
    if (typeof window !== "undefined") {
      try {
        if (item) {
          sessionStorage.setItem(STORAGE_DIRECT_CHECKOUT_KEY, JSON.stringify(item));
        } else {
          sessionStorage.removeItem(STORAGE_DIRECT_CHECKOUT_KEY);
        }
      } catch (e) {
        console.error("Failed to persist direct checkout item", e);
      }
    }
  };

  const clearDirectCheckout = () => {
    setDirectCheckoutItem(null);
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [cart]);

  const addToCart = (
    product: Product | any,
    size: string = "Standard",
    quantity: number = 1,
    colour?: string,
    customImage?: string,
    customPrice?: number,
  ) => {
    if (!product || !product.id) return;
    const chosenSize = size || "Standard";
    const chosenColour = colour || product.colour || "";
    const cartItemId = `${product.id}-${chosenSize}-${chosenColour || "default"}`;
    const itemPrice = customPrice !== undefined && Number(customPrice) > 0 ? Number(customPrice) : (Number(product.price) || 0);
    const itemImage = customImage || product.image || "/placeholder.svg";

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex]!;
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + quantity,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: String(product.id),
        cartItemId,
        name: product.name,
        price: itemPrice,
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
        image: itemImage,
        category: product.category,
        fabric: product.fabric,
        size: chosenSize,
        colour: chosenColour,
        quantity,
      };

      return [...prev, newItem];
    });

    const variantLabel = [chosenColour, chosenSize && chosenSize !== "Standard" ? `Size: ${chosenSize}` : ""].filter(Boolean).join(" - ");
    toast.success(`Added "${product.name}"${variantLabel ? ` (${variantLabel})` : ""} to your bag`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    toast.info("Item removed from bag");
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        directCheckoutItem,
        setDirectCheckoutItem,
        clearDirectCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
