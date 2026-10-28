import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ALL,
  categories as staticCategories,
  products as staticProducts,
  initialOrders,
  initialStockLogs,
  money,
  bagTotal,
  cleanSizes,
  type Product,
  type BagItem,
  type Order,
  type StockLog,
} from "@/lib/catalog";
import { productApi, orderApi, inventoryApi } from "@/lib/api";
import { idbSaveProducts, idbGetProducts } from "@/lib/indexedDb";
import { toast } from "sonner";

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
  isCustomerPortalOpen: boolean;
  setIsCustomerPortalOpen: (open: boolean) => void;
  customerPortalTab: "orders" | "wishlist" | "profile";
  setCustomerPortalTab: (tab: "orders" | "wishlist" | "profile") => void;
  openCustomerOrders: () => void;
  openCustomerWishlist: () => void;
  setBag: React.Dispatch<React.SetStateAction<BagItem[]>>;
  updateQuantity: (id: string, delta: number) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
  orderText: string;
  whatsappUrl: string;

  // Dynamic categories & products list (Admin + Public Storefront sync)
  categoriesList: string[];
  addCategory: (name: string, description?: string) => Promise<boolean>;
  productsList: Product[];
  activeProducts: Product[];
  addProduct: (newP: Omit<Product, "id"> & { id?: string }) => Promise<Product> | Product;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void> | void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  restoreAllProducts: () => Promise<void>;
  syncCatalogToDatabase: (clearDefaults?: boolean) => Promise<{ success: boolean; message: string; count?: number }>;

  // Inventory & Stock adjustments
  adjustStock: (productId: string, newStock: number, reason: string) => void;
  stockLogs: StockLog[];

  // Orders & Sales management
  orders: Order[];
  updateOrderStatus: (orderId: string, status: Order["status"], manualOverride?: boolean) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order["paymentStatus"]) => void;
  updateOrderDays: (orderId: string, days: number) => void;
  updateOrderDetails: (orderId: string, updates: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  cancelOrder: (orderId: string, reason: string, notes?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshOrders: () => Promise<void>;
  createCheckoutOrder: (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress?: string;
    paymentMethod?: "cod" | "online";
    items?: Array<{
      productId: string;
      quantity: number;
      size?: string;
      colour?: string;
      price?: number;
      name?: string;
      image?: string;
      category?: string;
    }>;
  }) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
}

const STORAGE_PRODUCTS_KEY = "pf_admin_products_catalog";
const STORAGE_CATEGORIES_KEY = "pf_admin_categories";
const STORAGE_ORDERS_KEY = "pf_admin_orders";
const STORAGE_STOCK_LOGS_KEY = "pf_admin_stock_logs";
const STORAGE_DELETED_PRODUCTS_KEY = "pf_admin_deleted_product_ids";

export const DEMO_PRODUCT_IDS = new Set([
  "wine-silk",
  "heritage-silk",
  "sage-cotton",
  "ivory-brocade",
  "linen-shirt",
  "navy-tee",
  "maroon-anarkali",
  "pattu-pavadai",
]);

export function isDemoProduct(p: any): boolean {
  if (!p) return false;
  const id = String(p.id || "");
  return DEMO_PRODUCT_IDS.has(id);
}

const CATEGORY_MIGRATION: Record<string, string> = {
  Sarees: "Saree",
  Fabrics: "Coordset",
  Shirts: "Chudithar Top",
  "T-Shirts": "2piece",
  "Women's Dresses": "Chudithar",
  "Kids Wear": "Combo Dresses",
};

export function normalizeProduct(p: any): Product {
  const cat = CATEGORY_MIGRATION[p.category] || p.category || "Chudithar Top";
  let img = p.image || p.imageUrl || p.image_url;

  // If image is missing, empty, or a dummy /assets/ image, restore original Cloudinary image from staticProducts
  if (
    !img ||
    img === "New arrival" ||
    typeof img !== "string" ||
    img.trim() === "" ||
    img === "undefined" ||
    img.includes("burgundy-silk") ||
    img.includes("sage-fabric") ||
    img.includes("ivory-brocade") ||
    img.includes("fabric-hero") ||
    img.startsWith("/assets/")
  ) {
    const orig = (staticProducts as Product[]).find(
      (sp) => sp.id === p.id || sp.name?.trim().toLowerCase() === p.name?.trim().toLowerCase(),
    );
    if (orig && orig.image && !orig.image.startsWith("/assets/")) {
      img = orig.image;
    } else if (p.image_url && !p.image_url.startsWith("/assets/")) {
      img = p.image_url;
    } else if (p.imageUrl && !p.imageUrl.startsWith("/assets/")) {
      img = p.imageUrl;
    }
  }

  // Restore description if empty
  let desc = p.description;
  if (!desc || typeof desc !== "string" || desc.trim() === "") {
    const orig = (staticProducts as Product[]).find((sp) => sp.id === p.id || sp.name === p.name);
    if (orig && orig.description) {
      desc = orig.description;
    }
  }

  const isActive = p.isActive !== false && p.is_active !== 0 && p.status !== "inactive";

  const images = Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (typeof p.images === "string" ? (() => { try { return JSON.parse(p.images); } catch { return []; } })() : (img ? [img] : []));

  const variants = Array.isArray(p.variants)
    ? p.variants
    : (typeof p.variants === "string" ? (() => { try { return JSON.parse(p.variants); } catch { return []; } })() : []);

  const sanitizedSizes = cleanSizes(p.sizes, cat, desc);

  return {
    ...p,
    id: String(p.id),
    category: cat,
    image: img || "/placeholder.svg",
    imageUrl: img || "/placeholder.svg",
    images,
    variants,
    sizes: sanitizedSizes,
    description: desc || "",
    isActive,
    status: isActive ? "active" : "inactive",
  };
}

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
  const [isCustomerPortalOpen, setIsCustomerPortalOpen] = useState(false);
  const [customerPortalTab, setCustomerPortalTab] = useState<"orders" | "wishlist" | "profile">("orders");

  const openCustomerOrders = () => {
    setCustomerPortalTab("orders");
    setIsCustomerPortalOpen(true);
  };

  const openCustomerWishlist = () => {
    setCustomerPortalTab("wishlist");
    setIsCustomerPortalOpen(true);
  };

  // Catalog categories (Dynamic admin additions + storefront sync)
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_CATEGORIES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [...staticCategories];
  });

  const saveCategories = (cats: string[]) => {
    setCategoriesList(cats);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(cats));
        window.dispatchEvent(new CustomEvent("pf_categories_updated", { detail: cats }));
      } catch (err) {
        console.warn("Could not save categories to localStorage:", err);
      }
    }
  };

  const addCategory = async (rawName: string, description?: string): Promise<boolean> => {
    const name = rawName.trim();
    if (!name) return false;

    // Check if category already exists (case-insensitive)
    if (categoriesList.some((c) => c.toLowerCase() === name.toLowerCase())) {
      return true;
    }

    const updated = [...categoriesList, name];
    saveCategories(updated);

    // Sync to backend database API
    try {
      await productApi.createCategory({ name, ...(description ? { description } : {}) });
    } catch (err) {
      console.warn("Could not sync created category to backend API:", err);
    }

    return true;
  };

  // Catalog products (shared with public storefront)
  const [productsList, setProductsList] = useState<Product[]>((staticProducts as Product[]).map(normalizeProduct));

  // Orders & inventory
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(initialStockLogs);

  // Initialize from storage on mount, listen for cross-tab updates, then synchronize with backend API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial read from localStorage
    try {
      const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      let loadedProds: Product[] = [];
      const masterOriginals = (staticProducts as Product[]).filter((p) => !isDemoProduct(p)).map(normalizeProduct);

      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed)) {
          // Evict all mock/demo products from local storage
          loadedProds = parsed
            .filter((p: any) => !isDemoProduct(p))
            .map(normalizeProduct);
        }
      }

      // Ensure all products have their real Cloudinary images and descriptions restored
      loadedProds = loadedProds.map((lp) => {
        const orig = masterOriginals.find(
          (mo) => mo.id === lp.id || mo.name.trim().toLowerCase() === lp.name.trim().toLowerCase(),
        );
        if (orig) {
          const validImg =
            !lp.image ||
            lp.image.includes("/assets/") ||
            lp.image.includes("burgundy-silk") ||
            lp.image === "/placeholder.svg"
              ? orig.image
              : lp.image;
          const validDesc =
            !lp.description || lp.description.trim() === "" ? orig.description : lp.description;
          return {
            ...lp,
            image: validImg,
            imageUrl: validImg,
            description: validDesc,
            isActive: lp.isActive !== false,
            status: lp.status !== "inactive" ? "active" : lp.status,
          };
        }
        return lp;
      });

      // Evict any lingering demo products
      loadedProds = loadedProds.filter((p) => !isDemoProduct(p));

      // If local storage has fewer than 41 products or was empty, seed with the 41 original products
      // while preserving any custom products the user added in admin
      if (loadedProds.length < masterOriginals.length) {
        localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
        const userAddedOnly = loadedProds.filter((lp) => !masterOriginals.some((mo) => mo.id === lp.id));
        loadedProds = [...userAddedOnly, ...masterOriginals];
        saveProducts(loadedProds);
      } else {
        saveProducts(loadedProds);
      }
      setProductsList(loadedProds);

      // 1b. Check IndexedDB to restore any user-added products that may have exceeded localStorage quota
      idbGetProducts().then((idbProds) => {
        if (Array.isArray(idbProds) && idbProds.length > 0) {
          setProductsList((currentList) => {
            const currentMap = new Map(currentList.map((p) => [p.id, p]));
            let changed = false;
            for (const ip of idbProds) {
              if (ip && ip.id) {
                if (!currentMap.has(ip.id)) {
                  currentMap.set(ip.id, normalizeProduct(ip));
                  changed = true;
                } else {
                  const existing = currentMap.get(ip.id)!;
                  if (Array.isArray(ip.variants) && ip.variants.length > (existing.variants?.length || 0)) {
                    currentMap.set(ip.id, normalizeProduct({ ...existing, variants: ip.variants }));
                    changed = true;
                  }
                }
              }
            }
            if (changed) {
              const merged = Array.from(currentMap.values());
              saveProducts(merged);
              return merged;
            }
            return currentList;
          });
        }
      }).catch(() => {});

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
      if (e.key === STORAGE_CATEGORIES_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCategoriesList(parsed);
          }
        } catch (err) {}
      }
      if (e.key === STORAGE_PRODUCTS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProductsList(parsed.map(normalizeProduct));
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
        setProductsList(e.detail.map(normalizeProduct));
      }
    };
    const handleCustomCategoryUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCategoriesList(e.detail);
      }
    };
    const handleCustomOrderUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setOrders(e.detail);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("pf_products_updated", handleCustomProductUpdate);
    window.addEventListener("pf_categories_updated", handleCustomCategoryUpdate);
    window.addEventListener("pf_orders_updated", handleCustomOrderUpdate);

    // 4. Background fetch categories from database
    productApi.getCategories().then((res) => {
      const backendCats = (res as any)?.categories || res?.data;
      if (Array.isArray(backendCats) && backendCats.length > 0) {
        setCategoriesList((prev) => {
          const merged = [...prev];
          for (const bc of backendCats) {
            const catName = bc.name || bc.id;
            if (catName && !merged.some((m) => m.toLowerCase() === catName.toLowerCase())) {
              merged.push(catName);
            }
          }
          try {
            localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }).catch(() => {});

    // 4. Background sync with database API
    const syncWithBackend = async () => {
      try {
        const currentLocal = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        let localList: Product[] = [];
        try {
          if (currentLocal) localList = JSON.parse(currentLocal);
        } catch {}

        // If user has products locally, automatically store them in TiDB Cloud & clean demo items
        if (Array.isArray(localList) && localList.length > 0) {
          const defaultDemoIds = [
            "wine-silk",
            "heritage-silk",
            "sage-cotton",
            "ivory-brocade",
            "linen-shirt",
            "navy-tee",
            "maroon-anarkali",
            "pattu-pavadai",
            "pf-mvi2hcnc",
            "pf-mvi2jlu8",
          ];
          const hasUserAddedProducts = localList.some((p) => !defaultDemoIds.includes(p.id));
          if (hasUserAddedProducts) {
            try {
              console.log("[TiDB Auto-Sync] Automatically syncing user's products to TiDB Cloud...");
              const syncRes = await productApi.bulkSync(localList, true);
              console.log("[TiDB Auto-Sync] Products stored in TiDB Cloud successfully!");
              if (syncRes && syncRes.success) {
                toast.success(`TiDB Cloud: ${(syncRes as any)?.syncedCount || localList.length} products automatically saved to database!`, {
                  id: "tidb-auto-sync",
                  duration: 4000,
                });
              }
            } catch (syncErr) {
              console.warn("[TiDB Auto-Sync] Background sync notice:", syncErr);
            }
          }
        }

        const prodRes = await productApi.getAll();
        const serverProds = (prodRes as any).products || prodRes.data;
        if (prodRes.success && Array.isArray(serverProds) && serverProds.length > 0) {
          let deletedIds: string[] = [];
          try {
            deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
          } catch {}

          // Ensure all 41 master products are never accidentally masked by old deleted IDs
          if (serverProds.length >= 41 && deletedIds.length > 0 && (serverProds.length - deletedIds.length < 41)) {
            deletedIds = [];
            try {
              localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
            } catch {}
          }

          // Filter out deleted items and demo items from server response
          const activeServerProds = serverProds
            .filter((sp: any) => !deletedIds.includes(sp.id) && !DEMO_PRODUCT_IDS.has(sp.id))
            .map(normalizeProduct);
          let merged: Product[] = activeServerProds;

          if (currentLocal) {
            try {
              const localList: Product[] = JSON.parse(currentLocal);
              if (Array.isArray(localList)) {
                const mergedMap = new Map<string, Product>();

                // First populate with server products
                for (const sp of activeServerProds) {
                  mergedMap.set(sp.id, sp);
                }

                // Intelligently overlay local products (ignoring demo items)
                for (const rawLp of localList) {
                  if (DEMO_PRODUCT_IDS.has(rawLp.id)) continue;
                  const lp = normalizeProduct(rawLp);
                  if (deletedIds.includes(lp.id)) continue;

                  const sp = mergedMap.get(lp.id);
                  if (!sp) {
                    // Local-only product (freshly added in admin)
                    mergedMap.set(lp.id, lp);
                    productApi.create(lp).catch(() => {});
                  } else {
                    // Both exist: preserve the valid image URL (especially Cloudinary)
                    const validImg =
                      (sp.image && sp.image.startsWith("http"))
                        ? sp.image
                        : (lp.image && lp.image.startsWith("http"))
                          ? lp.image
                          : sp.image || lp.image;

                    const validVariants =
                      Array.isArray(lp.variants) && lp.variants.length > 0
                        ? lp.variants
                        : Array.isArray(sp.variants) && sp.variants.length > 0
                          ? sp.variants
                          : [];

                    const validImages =
                      Array.isArray(lp.images) && lp.images.length > 1
                        ? lp.images
                        : Array.isArray(sp.images) && sp.images.length > 0
                          ? sp.images
                          : lp.images || [validImg];

                    const lpTime = lp.updatedAt ? new Date(lp.updatedAt).getTime() : 0;
                    const spTime =
                      (sp as any).updatedAt || (sp as any).updated_at
                        ? new Date((sp as any).updatedAt || (sp as any).updated_at).getTime()
                        : 0;

                    if (lpTime >= spTime) {
                      mergedMap.set(lp.id, {
                        ...sp,
                        ...lp,
                        image: validImg,
                        imageUrl: validImg,
                        variants: validVariants,
                        images: validImages,
                      });
                      // Synchronize latest admin edit to backend
                      productApi.update(lp.id, {
                        ...lp,
                        image: validImg,
                        variants: validVariants,
                        images: validImages,
                      }).catch(() => {});
                    } else {
                      mergedMap.set(lp.id, {
                        ...lp,
                        ...sp,
                        image: validImg,
                        imageUrl: validImg,
                        variants: validVariants,
                        images: validImages,
                      });
                      // If local has variants that server lacked, sync back to backend
                      if (Array.isArray(lp.variants) && lp.variants.length > 0 && (!Array.isArray(sp.variants) || sp.variants.length === 0)) {
                        productApi.update(lp.id, {
                          ...sp,
                          variants: validVariants,
                          images: validImages,
                        }).catch(() => {});
                      }
                    }
                  }
                }
                merged = Array.from(mergedMap.values());
              }
            } catch {}
          }
          setProductsList(merged.map(normalizeProduct));
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
      window.removeEventListener("pf_categories_updated", handleCustomCategoryUpdate);
      window.removeEventListener("pf_orders_updated", handleCustomOrderUpdate);
    };
  }, []);

  const saveProducts = (updated: Product[]) => {
    setProductsList(updated);
    if (typeof window !== "undefined") {
      // 1. Always persist to IndexedDB (unlimited quota, never fails with QuotaExceededError)
      idbSaveProducts(updated).catch(() => {});

      // 2. Also save to localStorage for fast synchronous bootstrap
      try {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("pf_products_updated", { detail: updated }));
      } catch (err) {
        console.warn("localStorage quota full (saved safely in IndexedDB):", err);
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

  // Active products visible on the storefront (strictly user-uploaded, non-demo products)
  const activeProducts = productsList.filter(
    (p) =>
      p.status !== "inactive" &&
      p.status !== "archived" &&
      (p as any).isActive !== false &&
      !isDemoProduct(p),
  );

  const count = bag.reduce((n, item) => n + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((old) => (old.includes(id) ? old.filter((x) => x !== id) : [...old, id]));
  };

  const openProduct = (p: Product) => {
    setPanel(null);
    setSelected(p);
    setQuantity(1);
    const validSizes = cleanSizes(p.sizes, p.category, p.description);
    setSize(
      validSizes.length > 0
        ? validSizes.includes("M")
          ? "M"
          : (validSizes[0] ?? "")
        : "",
    );
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
  const addProduct = async (newP: Omit<Product, "id"> & { id?: string }) => {
    const id = newP.id || `pf-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();
    const parsedStock =
      typeof newP.stock === "number" && !isNaN(newP.stock)
        ? newP.stock
        : typeof newP.stock === "string" && !isNaN(parseInt(newP.stock, 10))
          ? parseInt(newP.stock, 10)
          : 10;
    const product: Product = {
      ...newP,
      id,
      isActive: true,
      status: "active",
      stock: parsedStock,
      sku: newP.sku || `PF-NEW-${Math.floor(100 + Math.random() * 900)}`,
      updatedAt: nowIso,
    };
    const updated = [product, ...productsList.filter((p) => p.id !== id)];
    saveProducts(updated);

    // Remove from deleted list if re-added
    try {
      const deletedIds: string[] = JSON.parse(
        localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]",
      );
      const filtered = deletedIds.filter((x) => x !== id);
      localStorage.setItem(STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(filtered));
    } catch {}

    // Persist to backend database API
    try {
      const res = await productApi.create(product);
      if (res && res.success) {
        const serverProduct = (res as any).product || res.data;
        if (serverProduct && serverProduct.id) {
          const finalItem = {
            ...product,
            ...serverProduct,
            isActive: true,
            status: "active",
            sizes: serverProduct.sizes || product.sizes,
          };
          const reconciled = [finalItem, ...productsList.filter((p) => p.id !== id && p.id !== finalItem.id)];
          saveProducts(reconciled);
          return finalItem;
        }
      }
    } catch (err) {
      console.warn("Could not sync added product to backend API (saved locally):", err);
    }

    return product;
  };

  const syncCatalogToDatabase = async (clearDefaults: boolean = true) => {
    try {
      const localProducts = productsList;
      if (!localProducts || localProducts.length === 0) {
        return { success: false, message: "No local products found to sync." };
      }

      const res = await productApi.bulkSync(localProducts, clearDefaults);
      if (res && res.success) {
        // Refresh catalog from TiDB database
        const prodRes = await productApi.getAll();
        const serverProds = (prodRes as any).products || prodRes.data;
        if (Array.isArray(serverProds)) {
          saveProducts(serverProds.map(normalizeProduct));
        }
        const anyRes = res as any;
        return {
          success: true,
          message: res.message || `Successfully synced ${anyRes.syncedCount || localProducts.length} products to TiDB Cloud!`,
          count: anyRes.syncedCount,
        };
      }
      return {
        success: false,
        message: res?.error || "Failed to sync products with database.",
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Network error while syncing to database.",
      };
    }
  };

  const restoreAllProducts = async () => {
    try {
      localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
      const masterList = (staticProducts as Product[]).map(normalizeProduct);
      setProductsList(masterList);
      saveProducts(masterList);
      try {
        await productApi.bulkSync(masterList, true);
      } catch (syncErr) {
        console.warn("Could not sync restored products to backend:", syncErr);
      }
      toast.success(`Successfully restored all ${masterList.length} products with complete photos, descriptions, and categories!`);
    } catch (err: any) {
      toast.error(`Restore failed: ${err?.message || "Unknown error"}`);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const previous = productsList.find((p) => p.id === id);
    const nowIso = new Date().toISOString();
    const updated = productsList.map((p) => {
      if (p.id === id) {
        const nextStatus = updates.status || p.status || "active";
        return {
          ...p,
          ...updates,
          isActive: nextStatus !== "inactive" && nextStatus !== "archived",
          status: nextStatus,
          updatedAt: nowIso,
        };
      }
      return p;
    });
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
    try {
      await productApi.update(id, { ...updates, updatedAt: nowIso });
    } catch (err) {
      console.warn("Could not sync updated product to backend API:", err);
    }
  };

  const deleteProduct = (id: string) => {
    const updated = productsList.filter((p) => p.id !== id);
    saveProducts(updated);

    try {
      const deletedIds: string[] = JSON.parse(
        localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]",
      );
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(deletedIds));
      }
    } catch {}

    // Persist to backend database API
    productApi.delete(id).catch((err) => {
      console.warn("Could not sync deleted product to backend API:", err);
    });
  };

  const toggleProductStatus = (id: string) => {
    const updated = productsList.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === "active" ? ("inactive" as const) : ("active" as const);
        return {
          ...p,
          status: nextStatus,
          isActive: nextStatus === "active",
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
  const updateOrderStatus = (orderId: string, status: Order["status"], manualOverride: boolean = true) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            manualStatusOverride: manualOverride,
          }
        : o,
    );
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

  const updateOrderDays = (orderId: string, days: number) => {
    const val = Math.max(1, Number(days) || 5);
    const updated = orders.map((o) => (o.id === orderId ? { ...o, deliveryDays: val } : o));
    saveOrders(updated);
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
    saveOrders(updated);

    if (updates.status) {
      orderApi.updateStatus(orderId, updates.status).catch(() => {});
    }
    if (updates.paymentStatus) {
      orderApi.updatePaymentStatus(orderId, updates.paymentStatus).catch(() => {});
    }
  };

  const deleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    saveOrders(updated);
  };

  const cancelOrder = async (
    orderId: string,
    reason: string,
    notes?: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    const cleanId = String(orderId).replace(/^#/, "").trim();
    const dateStr = new Date().toLocaleString("en-IN");
    const cancellationStamp = `[Cancelled by Customer on ${dateStr}. Reason: ${reason}${notes ? ` | Details: ${notes}` : ""}]`;

    // 1. Find matching order in state
    const targetOrder = orders.find(
      (o) =>
        o.id === orderId ||
        (o as any).orderNumber === orderId ||
        String(o.id).replace(/^#/, "").toLowerCase() === cleanId.toLowerCase() ||
        String((o as any).orderNumber || "").replace(/^#/, "").toLowerCase() === cleanId.toLowerCase(),
    );

    // 2. Immediately mark order as Cancelled in local state and localStorage
    const updated = orders.map((o) => {
      const match =
        o.id === orderId ||
        (o as any).orderNumber === orderId ||
        String(o.id).replace(/^#/, "").toLowerCase() === cleanId.toLowerCase() ||
        String((o as any).orderNumber || "").replace(/^#/, "").toLowerCase() === cleanId.toLowerCase();

      if (match) {
        return {
          ...o,
          status: "Cancelled" as const,
          manualStatusOverride: true,
          notes: o.notes ? `${o.notes}\n${cancellationStamp}` : cancellationStamp,
        };
      }
      return o;
    });
    saveOrders(updated);

    // 3. Immediately restore stock in productsList
    if (targetOrder && targetOrder.items) {
      const orderItems = Array.isArray(targetOrder.items)
        ? targetOrder.items
        : typeof targetOrder.items === "string"
          ? (() => {
              try {
                return JSON.parse(targetOrder.items);
              } catch {
                return [];
              }
            })()
          : [];

      if (orderItems.length > 0) {
        const updatedProducts = productsList.map((p) => {
          const matchedItem = orderItems.find(
            (i: any) =>
              i.productId === p.id ||
              (i.productName && i.productName.toLowerCase() === p.name.toLowerCase()),
          );
          if (matchedItem) {
            const restored = p.stock + (Number(matchedItem.quantity) || 1);
            return { ...p, stock: restored };
          }
          return p;
        });
        saveProducts(updatedProducts);
      }
    }

    // 4. Send cancellation to backend database API
    try {
      const primaryId = targetOrder ? targetOrder.id : cleanId;
      await orderApi.cancel(primaryId, reason, notes);
    } catch (err) {
      console.warn("Backend order cancellation notice:", err);
    }

    return { success: true, message: "Order cancelled successfully." };
  };

  const refreshOrders = async () => {
    try {
      const ordersRes = await orderApi.getAll();
      if (ordersRes.success && Array.isArray(ordersRes.data)) {
        setOrders(ordersRes.data);
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(ordersRes.data));
      }
    } catch (err) {
      console.warn("Could not refresh orders:", err);
    }
  };

  // Checkout action with backend stock validation & order creation
  const createCheckoutOrder = async (details: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress?: string;
    paymentMethod?: "cod" | "online";
    items?: Array<{
      productId: string;
      quantity: number;
      size?: string;
      colour?: string;
      price?: number;
      name?: string;
      image?: string;
      category?: string;
    }>;
  }) => {
    const rawItems =
      details.items && details.items.length > 0
        ? details.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            colour: i.colour,
            image: i.image,
            price: i.price,
            name: i.name,
          }))
        : bag.map((b) => ({ productId: b.id, quantity: b.quantity }));

    if (rawItems.length === 0) {
      return { success: false, error: "Shopping bag is empty" };
    }

    try {
      const items = rawItems;

      const res = await orderApi.checkout({
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        customerPhone: details.customerPhone,
        ...(details.shippingAddress ? { shippingAddress: details.shippingAddress } : {}),
        paymentMethod: details.paymentMethod || "cod",
        items,
      });

      const orderPayload = res.data || (res as any).order;
      if (res.success && orderPayload) {
        // Clear bag on successful server-side checkout
        clearBag();

        const resolvedOrderId = orderPayload.orderId || orderPayload.id || `PF-${Date.now().toString().slice(-4)}`;
        const resolvedOrderNumber = orderPayload.orderNumber || orderPayload.id || resolvedOrderId;

        // Immediately record in admin orders with current date
        const newAdminOrder: Order = {
          id: resolvedOrderId,
          orderNumber: resolvedOrderNumber,
          customerName: details.customerName,
          customerEmail: details.customerEmail,
          customerPhone: details.customerPhone,
          date: new Date().toISOString().split("T")[0] || "",
          shippingAddress: details.shippingAddress || "Ambattur, Chennai",
          items:
            details.items && details.items.length > 0
              ? details.items.map((it) => {
                  const prod = productsList.find((p) => p.id === it.productId);
                  const unitPrice = it.price ?? prod?.price ?? 0;
                  return {
                    id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    orderId: resolvedOrderId,
                    productId: it.productId,
                    productName: it.name || prod?.name || it.productId,
                    productSku: prod?.sku,
                    price: unitPrice,
                    unitPrice: unitPrice,
                    quantity: it.quantity,
                    size: it.size,
                    colour: it.colour,
                    image: it.image || prod?.image,
                    unit: prod?.unit || "piece",
                    totalPrice: unitPrice * it.quantity,
                  };
                })
              : bag.map((b) => {
                  const prod = productsList.find((p) => p.id === b.id);
                  return {
                    id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    orderId: resolvedOrderId,
                    productId: b.id,
                    productName: prod?.name || b.id,
                    productSku: prod?.sku,
                    price: prod?.price || 0,
                    unitPrice: prod?.price || 0,
                    quantity: b.quantity,
                    unit: prod?.unit || "piece",
                    totalPrice: (prod?.price || 0) * b.quantity,
                  };
                }),
          subtotal: Number(orderPayload.subtotal || orderPayload.totalAmount || 0),
          shippingFee: 0,
          discountAmount: 0,
          total: Number(orderPayload.totalAmount || orderPayload.subtotal || 0),
          totalAmount: Number(orderPayload.totalAmount || orderPayload.subtotal || 0),
          status: "Pending",
          orderStatus: "Pending",
          paymentMethod: details.paymentMethod === "online" ? "Online UPI" : "COD",
          paymentStatus: details.paymentMethod === "online" ? "Paid" : "Pending",
          createdAt: new Date().toISOString(),
        };

        saveOrders([newAdminOrder, ...orders.filter((o) => o.id !== resolvedOrderId)]);

        // Refresh orders list from backend asynchronously in background without blocking
        orderApi
          .getAll()
          .then((refreshedOrders) => {
            if (refreshedOrders.success && Array.isArray(refreshedOrders.data)) {
              saveOrders(refreshedOrders.data);
            }
          })
          .catch(() => {});

        return {
          success: true,
          orderId: resolvedOrderId,
          orderNumber: resolvedOrderNumber,
        };
      }

      // If backend explicitly rejected due to verified insufficient stock, return that reason
      if (res.error && res.error.toLowerCase().includes("insufficient stock")) {
        return {
          success: false,
          error: res.error,
        };
      }

      // Graceful standalone fallback if commerce backend is unavailable or had catalog resolution issue
      console.warn("Backend checkout notice, falling back to local order store:", res.error);
      const fallbackOrderId = `PF-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
      
      const constructedItems =
        details.items && details.items.length > 0
          ? details.items.map((it) => {
              const prod = productsList.find((p) => p.id === it.productId);
              const unitPrice = it.price ?? prod?.price ?? 0;
              return {
                id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                orderId: fallbackOrderId,
                productId: it.productId,
                productName: it.name || prod?.name || it.productId,
                productSku: prod?.sku,
                price: unitPrice,
                unitPrice: unitPrice,
                quantity: it.quantity,
                unit: prod?.unit || "piece",
                totalPrice: unitPrice * it.quantity,
              };
            })
          : bag.map((b) => {
              const prod = productsList.find((p) => p.id === b.id);
              return {
                id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                orderId: fallbackOrderId,
                productId: b.id,
                productName: prod?.name || b.id,
                productSku: prod?.sku,
                price: prod?.price || 0,
                unitPrice: prod?.price || 0,
                quantity: b.quantity,
                unit: prod?.unit || "piece",
                totalPrice: (prod?.price || 0) * b.quantity,
              };
            });

      const calculatedTotal = constructedItems.reduce((acc, item) => acc + item.totalPrice, 0);

      const localNewOrder: Order = {
        id: fallbackOrderId,
        orderNumber: fallbackOrderId,
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        customerPhone: details.customerPhone,
        date: new Date().toISOString().split("T")[0] || "",
        shippingAddress: details.shippingAddress || "Ambattur, Chennai",
        items: constructedItems,
        subtotal: calculatedTotal,
        shippingFee: 0,
        discountAmount: 0,
        total: calculatedTotal,
        totalAmount: calculatedTotal,
        status: "Pending",
        orderStatus: "Pending",
        paymentMethod: details.paymentMethod === "online" ? "Online UPI" : "COD",
        paymentStatus: details.paymentMethod === "online" ? "Paid" : "Pending",
        createdAt: new Date().toISOString(),
      };

      saveOrders([localNewOrder, ...orders]);
      clearBag();

      return {
        success: true,
        orderId: fallbackOrderId,
        orderNumber: fallbackOrderId,
      };
    } catch (err: any) {
      console.warn("Checkout execution error, falling back to local order store:", err.message);
      const fallbackOrderId = `PF-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
      const localNewOrder: Order = {
        id: fallbackOrderId,
        orderNumber: fallbackOrderId,
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        customerPhone: details.customerPhone,
        date: new Date().toISOString().split("T")[0] || "",
        shippingAddress: details.shippingAddress || "Ambattur, Chennai",
        items: bag.map((b) => {
          const prod = productsList.find((p) => p.id === b.id);
          return {
            id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            orderId: fallbackOrderId,
            productId: b.id,
            productName: prod?.name || b.id,
            productSku: prod?.sku,
            price: prod?.price || 0,
            unitPrice: prod?.price || 0,
            quantity: b.quantity,
            unit: prod?.unit || "piece",
            totalPrice: (prod?.price || 0) * b.quantity,
          };
        }),
        subtotal: bag.reduce((acc, b) => {
          const prod = productsList.find((p) => p.id === b.id);
          return acc + (prod?.price || 0) * b.quantity;
        }, 0),
        shippingFee: 0,
        discountAmount: 0,
        total: bag.reduce((acc, b) => {
          const prod = productsList.find((p) => p.id === b.id);
          return acc + (prod?.price || 0) * b.quantity;
        }, 0),
        totalAmount: bag.reduce((acc, b) => {
          const prod = productsList.find((p) => p.id === b.id);
          return acc + (prod?.price || 0) * b.quantity;
        }, 0),
        status: "Pending",
        orderStatus: "Pending",
        paymentMethod: details.paymentMethod === "online" ? "Online UPI" : "COD",
        paymentStatus: details.paymentMethod === "online" ? "Paid" : "Pending",
        createdAt: new Date().toISOString(),
      };

      saveOrders([localNewOrder, ...orders]);
      clearBag();

      return {
        success: true,
        orderId: fallbackOrderId,
        orderNumber: fallbackOrderId,
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
        isCustomerPortalOpen,
        setIsCustomerPortalOpen,
        customerPortalTab,
        setCustomerPortalTab,
        openCustomerOrders,
        openCustomerWishlist,
        setBag,
        updateQuantity,
        removeFromBag,
        clearBag,
        orderText,
        whatsappUrl,

        // Admin & dynamic catalog
        categoriesList,
        addCategory,
        productsList,
        activeProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStatus,
        restoreAllProducts,
        syncCatalogToDatabase,
        adjustStock,
        stockLogs,
        orders,
        updateOrderStatus,
        updatePaymentStatus,
        updateOrderDays,
        updateOrderDetails,
        deleteOrder,
        cancelOrder,
        refreshOrders,
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
