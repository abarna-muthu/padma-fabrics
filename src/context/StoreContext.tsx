import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ALL,
  products as staticProducts,
  initialOrders,
  initialStockLogs,
  money,
  bagTotal,
  type Product,
  type BagItem,
  type Order,
  type StockLog,
} from "@/lib/catalog";
import { productApi, orderApi, inventoryApi } from "@/lib/api";

interface StoreContextType {
  // Public storefront catalog
  filter: string;
  setFilter: (category: string) => void;
  panel: "bag" | "search" | "favorites" | "menu" | null;
  setPanel: (panel: "bag" | "search" | "favorites" | "menu" | null) => void;
  selected: Product | null;
  setSelected: (p: Product | null) => void;
  size: string;
  setSize: (size: string) => void;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  bag: BagItem[];
  favorites: string[];
  query: string;
  setQuery: (q: string) => void;
  count: number;
  toggleFavorite: (id: string) => void;
  openProduct: (p: Product) => void;
  addToBag: () => void;
  buyNow: (customProduct?: Product, customQty?: number) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  setBag: React.Dispatch<React.SetStateAction<BagItem[]>>;
  updateQuantity: (id: string, delta: number) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
  orderText: string;
  whatsappUrl: string;

  // Dynamic products list (Admin + Public Storefront sync)
  productsList: Product[];
  activeProducts: Product[];
  addProduct: (newP: Omit<Product, "id"> & { id?: string }) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;

  // Inventory & Stock adjustments
  adjustStock: (productId: string, newStock: number, reason: string) => void;
  stockLogs: StockLog[];

  // Orders & Sales management
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order["paymentStatus"]) => void;
  createCheckoutOrder: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress?: string;
    paymentMethod?: "cod" | "online";
  }) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
}

const STORAGE_PRODUCTS_KEY = "pf_admin_products_catalog";
const STORAGE_ORDERS_KEY = "pf_admin_orders";
const STORAGE_STOCK_LOGS_KEY = "pf_admin_stock_logs";

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Storefront UI state
  const [filter, setFilter] = useState<string>(ALL);
  const [panel, setPanel] = useState<"bag" | "search" | "favorites" | "menu" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [bag, setBag] = useState<BagItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Catalog products (shared with public storefront)
  const [productsList, setProductsList] = useState<Product[]>(staticProducts as Product[]);

  // Orders & inventory
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(initialStockLogs);

  // Initialize from storage on mount, listen for cross-tab updates, then synchronize with backend API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial read from localStorage
    try {
      const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProductsList(parsed);
        }
      }
      const storedOrders = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
      const storedLogs = localStorage.getItem(STORAGE_STOCK_LOGS_KEY);
      if (storedLogs) {
        const parsed = JSON.parse(storedLogs);
        if (Array.isArray(parsed)) {
          setStockLogs(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to load local store:", err);
    }

    // 2. Real-time listener for other open tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_PRODUCTS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProductsList(parsed);
          }
        } catch (err) {}
      }
      if (e.key === STORAGE_ORDERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        } catch (err) {}
      }
    };

    // 3. In-tab custom event listener
    const handleCustomProductUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProductsList(e.detail);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pf_products_updated", handleCustomProductUpdate);

    // 4. Background sync with database API
    const syncWithBackend = async () => {
      try {
        const prodRes = await productApi.getAll();
        const serverProds = (prodRes as any).products || prodRes.data;
        if (prodRes.success && Array.isArray(serverProds) && serverProds.length > 0) {
          const currentLocal = localStorage.getItem(STORAGE_PRODUCTS_KEY);
          let merged = serverProds;
          if (currentLocal) {
            try {
              const localList: Product[] = JSON.parse(currentLocal);
              if (Array.isArray(localList)) {
                // Keep local additions not yet in server
                const localOnly = localList.filter((lp) => !serverProds.some((sp: any) => sp.id === lp.id));
                merged = [...localOnly, ...serverProds];
                localOnly.forEach((p) => {
                  productApi.create(p).catch(() => {});
                });
              }
            } catch {}
          }
          setProductsList(merged);
          localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(merged));
        }

        const ordersRes = await orderApi.getAll();
        if (ordersRes.success && Array.isArray(ordersRes.data) && ordersRes.data.length > 0) {
          setOrders(ordersRes.data);
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(ordersRes.data));
        }

        const invRes = await inventoryApi.getAll();
        if (invRes.success && Array.isArray(invRes.data?.logs) && invRes.data.logs.length > 0) {
          setStockLogs(invRes.data.logs);
          localStorage.setItem(STORAGE_STOCK_LOGS_KEY, JSON.stringify(invRes.data.logs));
        }
      } catch (err) {
        console.debug("Backend API sync completed or standby:", err);
      }
    };

    syncWithBackend();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pf_products_updated", handleCustomProductUpdate);
    };
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProductsList(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("pf_products_updated", { detail: updated }));
      } catch (err) {
        console.warn("Could not save products to localStorage:", err);
      }
    }
  };

  const saveOrders = (updated: Order[]) => {
    setOrders(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("pf_orders_updated", { detail: updated }));
      } catch (err) {
        console.warn("Could not save orders to localStorage:", err);
      }
    }
  };

  const saveStockLogs = (updated: StockLog[]) => {
    setStockLogs(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_STOCK_LOGS_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save stock logs to localStorage:", err);
      }
    }
  };

  // Active products visible on the storefront
  const activeProducts = productsList.filter((p) => p.status === "active");

  const count = bag.reduce((n, item) => n + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((old) => (old.includes(id) ? old.filter((x) => x !== id) : [...old, id]));
  };

  const openProduct = (p: Product) => {
    setPanel(null);
    setSelected(p);
    setQuantity(1);
    setSize(p.sizes?.[2] ?? "");
  };

  const addToBag = () => {
    if (!selected) return;
    setBag((old) =>
      old.some((x) => x.id === selected.id)
        ? old.map((x) => (x.id === selected.id ? { ...x, quantity: x.quantity + quantity } : x))
        : [...old, { id: selected.id, quantity }],
    );
    setSelected(null);
    setPanel("bag");
  };

  const buyNow = (customProduct?: Product, customQty?: number) => {
    const targetProduct = customProduct || selected;
    const targetQty = customQty || quantity;
    if (!targetProduct) return;

    setBag([{ id: targetProduct.id, quantity: Math.max(1, targetQty) }]);
    setSelected(null);
    setPanel(null);
    setIsCheckoutOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setBag((old) =>
      old
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromBag = (id: string) => {
    setBag((old) => old.filter((i) => i.id !== id));
  };

  const clearBag = () => {
    setBag([]);
  };

  const orderText = `Hello Padmanabha Fabrics, I would like to enquire about these sample selections:\n${bag
    .map((item) => {
      const p = productsList.find((prod) => prod.id === item.id);
      return `${p?.name}: ${item.quantity} ${p?.unit}(s)`;
    })
    .join("\n")}\nPlease confirm availability and actual prices.`;

  const whatsappUrl = `https://wa.me/919940145700?text=${encodeURIComponent(orderText)}`;

  // Product management actions
  const addProduct = (newP: Omit<Product, "id"> & { id?: string }) => {
    const id = newP.id || `pf-${Date.now().toString(36)}`;
    const product: Product = {
      ...newP,
      id,
      stock: Number(newP.stock) || 0,
      status: newP.status || "active",
      sku: newP.sku || `PF-NEW-${Math.floor(100 + Math.random() * 900)}`,
    };
    const updated = [product, ...productsList];
    saveProducts(updated);

    // Initial stock log if stock > 0
    if (product.stock > 0) {
      const newLog: StockLog = {
        id: `LOG-${Date.now().toString(36)}`,
        productId: product.id,
        productName: product.name,
        previousStock: 0,
        newStock: product.stock,
        change: product.stock,
        reason: "Initial product inventory addition",
        date: new Date().toISOString().split("T")[0] || "",
      };
      saveStockLogs([newLog, ...stockLogs]);
    }

    // Persist to backend database API
    productApi.create(product).catch((err) => {
      console.warn("Could not sync added product to backend API:", err);
    });

    return product;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const previous = productsList.find((p) => p.id === id);
    const updated = productsList.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProducts(updated);

    // If stock changed, record log
    if (updates.stock !== undefined && previous && Number(updates.stock) !== previous.stock) {
      const newLog: StockLog = {
        id: `LOG-${Date.now().toString(36)}`,
        productId: id,
        productName: updates.name || previous.name,
        previousStock: previous.stock,
        newStock: Number(updates.stock),
        change: Number(updates.stock) - previous.stock,
        reason: "Manual admin inventory update",
        date: new Date().toISOString().split("T")[0] || "",
      };
      saveStockLogs([newLog, ...stockLogs]);
    }

    // Persist to backend database API
    productApi.update(id, updates).catch((err) => {
      console.warn("Could not sync updated product to backend API:", err);
    });
  };

  const deleteProduct = (id: string) => {
    const updated = productsList.filter((p) => p.id !== id);
    saveProducts(updated);

    // Persist to backend database API
    productApi.delete(id).catch((err) => {
      console.warn("Could not sync deleted product to backend API:", err);
    });
  };

  const toggleProductStatus = (id: string) => {
    const updated = productsList.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          status: p.status === "active" ? ("inactive" as const) : ("active" as const),
        };
      }
      return p;
    });
    saveProducts(updated);

    // Persist to backend database API
    productApi.toggleStatus(id).catch((err) => {
      console.warn("Could not sync toggle status to backend API:", err);
    });
  };

  // Inventory actions
  const adjustStock = (productId: string, newStock: number, reason: string) => {
    const target = productsList.find((p) => p.id === productId);
    if (!target) return;
    const previousStock = target.stock;
    const diff = newStock - previousStock;

    const updated = productsList.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
    saveProducts(updated);

    const log: StockLog = {
      id: `LOG-${Date.now().toString(36)}`,
      productId,
      productName: target.name,
      previousStock,
      newStock,
      change: diff,
      reason: reason || "Manual stock adjustment",
      date: new Date().toISOString().split("T")[0] || "",
    };
    saveStockLogs([log, ...stockLogs]);

    // Persist to backend database API
    inventoryApi.adjustStock(productId, newStock, reason).catch((err) => {
      console.warn("Could not sync stock adjustment to backend API:", err);
    });
  };

  // Orders actions
  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    saveOrders(updated);

    // Persist to backend database API
    orderApi.updateStatus(orderId, status).catch((err) => {
      console.warn("Could not sync order status to backend API:", err);
    });
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order["paymentStatus"]) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, paymentStatus } : o));
    saveOrders(updated);

    // Persist to backend database API
    orderApi.updatePaymentStatus(orderId, paymentStatus).catch((err) => {
      console.warn("Could not sync payment status to backend API:", err);
    });
  };

  // Checkout action with backend stock validation & order creation
  const createCheckoutOrder = async (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress?: string;
    paymentMethod?: "cod" | "online";
  }) => {
    if (bag.length === 0) {
      return { success: false, error: "Bag is empty" };
    }

    try {
      const items = bag.map((b) => ({
        productId: b.id,
        quantity: b.quantity,
      }));

      const res = await orderApi.checkout({
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        customerPhone: details.customerPhone,
        ...(details.shippingAddress ? { shippingAddress: details.shippingAddress } : {}),
        paymentMethod: details.paymentMethod || "cod",
        items,
      });

      if (res.success && res.data) {
        // Clear bag on successful server-side checkout
        clearBag();

        // Refresh orders list from backend
        const refreshedOrders = await orderApi.getAll();
        if (refreshedOrders.success && Array.isArray(refreshedOrders.data)) {
          saveOrders(refreshedOrders.data);
        }

        return {
          success: true,
          orderId: res.data.orderId,
          orderNumber: res.data.orderNumber,
        };
      }

      return {
        success: false,
        error: res.error || "Checkout failed. Please verify stock availability.",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to process order",
      };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        filter,
        setFilter,
        panel,
        setPanel,
        selected,
        setSelected,
        size,
        setSize,
        quantity,
        setQuantity,
        bag,
        favorites,
        query,
        setQuery,
        count,
        toggleFavorite,
        openProduct,
        addToBag,
        buyNow,
        isCheckoutOpen,
        setIsCheckoutOpen,
        setBag,
        updateQuantity,
        removeFromBag,
        clearBag,
        orderText,
        whatsappUrl,

        // Admin & dynamic catalog
        productsList,
        activeProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        adjustStock,
        stockLogs,
        orders,
        updateOrderStatus,
        updatePaymentStatus,
        createCheckoutOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
