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
import { idbSaveProducts, idbGetProducts, idbSaveSingleProduct, idbDeleteProduct, idbClearProducts } from "@/lib/indexedDb";
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
const STORAGE_CUSTOM_PRODUCTS_KEY = "pf_custom_user_products";
const STORAGE_PURGE_LEGACY_KEY = "pf_legacy_products_purged_v2";
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
  saree: "Saree",
  sarees: "Saree",
  Fabrics: "Coordset",
  coordset: "Coordset",
  coordsets: "Coordset",
  Shirts: "Chudithar Top",
  "Chudithar Top": "Chudithar Top",
  "chudithar-top": "Chudithar Top",
  "chudithar top": "Chudithar Top",
  "T-Shirts": "2piece",
  "2piece": "2piece",
  "2 piece": "2piece",
  "Women's Dresses": "Chudithar",
  chudithar: "Chudithar",
  Chudithar: "Chudithar",
  "Kids Wear": "Combo Dresses",
  "combo-dresses": "Combo Dresses",
  "Combo Dresses": "Combo Dresses",
  palazzo: "palazzo",
  Palazzo: "palazzo",
  nighty: "Nighty",
  Nighties: "Nighty",
  Nighty: "Nighty",
  maxi: "Maxi",
  Maxi: "Maxi",
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
  const [productsList, setProductsList] = useState<Product[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      // Purge legacy sample/demo products once as requested by user
      if (localStorage.getItem(STORAGE_PURGE_LEGACY_KEY) !== "true") {
        localStorage.removeItem(STORAGE_PRODUCTS_KEY);
        localStorage.removeItem(STORAGE_CUSTOM_PRODUCTS_KEY);
        localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
        localStorage.setItem(STORAGE_PURGE_LEGACY_KEY, "true");
        idbClearProducts().catch(() => {});
        return [];
      }

      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
      } catch {}

      const initialMap = new Map<string, Product>();

      // 1. Read custom user-added products (guaranteed persistence across refreshes)
      const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
      if (customStored) {
        const parsedCustom = JSON.parse(customStored);
        if (Array.isArray(parsedCustom)) {
          for (const cp of parsedCustom) {
            if (cp && cp.id && !deletedIds.includes(cp.id) && !isDemoProduct(cp)) {
              initialMap.set(cp.id, normalizeProduct(cp));
            }
          }
        }
      }

      // 2. Read full stored catalog if available
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (p && p.id && !deletedIds.includes(p.id) && !isDemoProduct(p)) {
              initialMap.set(p.id, normalizeProduct(p));
            }
          }
        }
      }

      return Array.from(initialMap.values());
    } catch {
      return [];
    }
  });

  // Orders & inventory
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [stockLogs, setStockLogs] = useState<StockLog[]>(initialStockLogs);

  // Initialize from storage on mount, listen for cross-tab updates, then synchronize with backend API
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;

    // 1. Comprehensive hydration: merge LocalStorage + Custom Store + IndexedDB
    const hydrateStorage = async () => {
      try {
        // Enforce purge of legacy sample/demo products
        if (localStorage.getItem(STORAGE_PURGE_LEGACY_KEY) !== "true") {
          localStorage.removeItem(STORAGE_PRODUCTS_KEY);
          localStorage.removeItem(STORAGE_CUSTOM_PRODUCTS_KEY);
          localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
          localStorage.setItem(STORAGE_PURGE_LEGACY_KEY, "true");
          await idbClearProducts().catch(() => {});
          if (!isCancelled) {
            setProductsList([]);
          }
          return;
        }

        let deletedIds: string[] = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
        } catch {}

        const unifiedMap = new Map<string, Product>();

        // Step A: Dedicated user custom products (always preserves newly uploaded items)
        try {
          const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
          if (customStored) {
            const parsed = JSON.parse(customStored);
            if (Array.isArray(parsed)) {
              for (const cp of parsed) {
                if (cp && cp.id && !deletedIds.includes(cp.id) && !isDemoProduct(cp)) {
                  unifiedMap.set(cp.id, normalizeProduct(cp));
                }
              }
            }
          }
        } catch {}

        // Step B: Catalog storage
        try {
          const storedCatalog = localStorage.getItem(STORAGE_PRODUCTS_KEY);
          if (storedCatalog) {
            const parsed = JSON.parse(storedCatalog);
            if (Array.isArray(parsed)) {
              for (const p of parsed) {
                if (p && p.id && !deletedIds.includes(p.id) && !isDemoProduct(p)) {
                  unifiedMap.set(p.id, normalizeProduct(p));
                }
              }
            }
          }
        } catch {}

        // Step C: IndexedDB products (contains full images without 5MB storage limits)
        try {
          const idbProds = await idbGetProducts();
          if (Array.isArray(idbProds) && idbProds.length > 0) {
            for (const ip of idbProds) {
              if (ip && ip.id && !deletedIds.includes(ip.id) && !isDemoProduct(ip)) {
                const norm = normalizeProduct(ip);
                const existing = unifiedMap.get(norm.id);
                if (!existing) {
                  unifiedMap.set(norm.id, norm);
                } else {
                  const hasBetterImg =
                    typeof norm.image === "string" &&
                    norm.image &&
                    norm.image !== "/placeholder.svg" &&
                    (!existing.image || existing.image === "/placeholder.svg" || existing.image.includes("/assets/"));
                  const hasMoreVariants = Array.isArray(norm.variants) && norm.variants.length > (existing.variants?.length || 0);
                  unifiedMap.set(norm.id, {
                    ...existing,
                    ...norm,
                    image: hasBetterImg ? norm.image : (existing.image || norm.image),
                    imageUrl: hasBetterImg ? norm.image : (existing.imageUrl || norm.imageUrl),
                    variants: hasMoreVariants ? norm.variants : existing.variants,
                  });
                }
              }
            }
          }
        } catch (idbErr) {
          console.warn("[IndexedDB Hydration Notice]", idbErr);
        }

        const merged = Array.from(unifiedMap.values());
        if (!isCancelled) {
          setProductsList(merged);
          saveProducts(merged);
        }
      } catch (err) {
        console.warn("[Storage Hydration Error]", err);
      }
    };

    hydrateStorage();

    const isDummyOrder = (o: any) =>
      o?.customerEmail?.includes("@example.com") ||
      o?.customerName === "Pooja Venkatesh" ||
      o?.customerName === "Karthik Subramanian" ||
      o?.id?.startsWith("PF-TEST-") ||
      ["PF-1081", "PF-1082", "PF-1083"].includes(o?.id);

    const storedOrders = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed)) {
          const cleanOrders = parsed.filter((o) => !isDummyOrder(o));
          setOrders(cleanOrders);
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(cleanOrders));
        }
      } catch {}
    }
    const storedLogs = localStorage.getItem(STORAGE_STOCK_LOGS_KEY);
    if (storedLogs) {
      try {
        const parsed = JSON.parse(storedLogs);
        if (Array.isArray(parsed)) setStockLogs(parsed);
      } catch {}
    }

    // 2. Real-time listeners for storage events and cross-tab communication
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === STORAGE_PRODUCTS_KEY || e.key === STORAGE_CUSTOM_PRODUCTS_KEY) && e.newValue) {
        hydrateStorage();
      }
      if (e.key === STORAGE_CATEGORIES_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setCategoriesList(parsed);
        } catch {}
      }
      if (e.key === STORAGE_ORDERS_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch {}
      }
    };

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

    // 3. Background fetch categories from database
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
        let deletedIds: string[] = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
        } catch {}

        // Read all current products including custom ones from local storage
        const currentLocal = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        let localList: Product[] = [];
        try {
          if (currentLocal) localList = JSON.parse(currentLocal);
        } catch {}

        // If user has custom products locally, auto-sync them to TiDB Cloud
        if (Array.isArray(localList) && localList.length > 0) {
          const hasUserAddedProducts = localList.some((p) => !isDemoProduct(p));
          if (hasUserAddedProducts) {
            try {
              console.log("[TiDB Auto-Sync] Safely syncing custom products to database...");
              await productApi.bulkSync(localList, false);
            } catch (syncErr) {
              console.warn("[TiDB Auto-Sync] Background sync notice:", syncErr);
            }
          }
        }

        const prodRes = await productApi.getAll();
        const serverProds = (prodRes as any).products || prodRes.data;
        if (prodRes.success && Array.isArray(serverProds)) {
          // Filter out deleted items and demo items from server response
          const activeServerProds = serverProds
            .filter((sp: any) => !deletedIds.includes(sp.id) && !DEMO_PRODUCT_IDS.has(sp.id))
            .map(normalizeProduct);

          setProductsList((currentList) => {
            const mergedMap = new Map<string, Product>();

            // 1. Overlay server products
            for (const sp of activeServerProds) {
              if (!deletedIds.includes(sp.id)) {
                mergedMap.set(sp.id, sp);
              }
            }

            // 2. Intelligently preserve current local user products (user uploaded products must NEVER be lost)
            for (const cl of currentList) {
              if (DEMO_PRODUCT_IDS.has(cl.id) || deletedIds.includes(cl.id)) continue;
              const sp = mergedMap.get(cl.id);
              if (!sp) {
                mergedMap.set(cl.id, cl);
              } else {
                const clTime = cl.updatedAt ? new Date(cl.updatedAt).getTime() : 0;
                const spTime =
                  (sp as any).updatedAt || (sp as any).updated_at
                    ? new Date((sp as any).updatedAt || (sp as any).updated_at).getTime()
                    : 0;
                if (clTime >= spTime) {
                  mergedMap.set(cl.id, { ...sp, ...cl });
                }
              }
            }

            // 3. Also check STORAGE_CUSTOM_PRODUCTS_KEY to ensure NO custom product is omitted
            try {
              const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
              if (customStored) {
                const parsed = JSON.parse(customStored);
                if (Array.isArray(parsed)) {
                  for (const cp of parsed) {
                    if (cp && cp.id && !deletedIds.includes(cp.id) && !mergedMap.has(cp.id)) {
                      mergedMap.set(cp.id, normalizeProduct(cp));
                    }
                  }
                }
              }
            } catch {}

            const merged = Array.from(mergedMap.values());
            saveProducts(merged);
            return merged;
          });
        }

        const ordersRes = await orderApi.getAll();
        const serverOrders = (ordersRes as any)?.orders || ordersRes.data;
        if (ordersRes.success && Array.isArray(serverOrders)) {
          const isDummyOrder = (o: any) =>
            o?.customerEmail?.includes("@example.com") ||
            o?.customerName === "Pooja Venkatesh" ||
            o?.customerName === "Karthik Subramanian" ||
            o?.id?.startsWith("PF-TEST-") ||
            ["PF-1081", "PF-1082", "PF-1083"].includes(o?.id);

          const cleanOrders = serverOrders.filter((o: any) => !isDummyOrder(o));
          setOrders(cleanOrders);
          localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(cleanOrders));
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
      isCancelled = true;
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pf_products_updated", handleCustomProductUpdate);
      window.removeEventListener("pf_categories_updated", handleCustomCategoryUpdate);
      window.removeEventListener("pf_orders_updated", handleCustomOrderUpdate);
    };
  }, []);

  const saveProducts = (updated: Product[]) => {
    // 1. Immediately update in-memory state
    setProductsList(updated);

    if (typeof window !== "undefined") {
      // 2. Always persist to IndexedDB (unlimited quota, preserves all full-res photos)
      idbSaveProducts(updated).catch(() => {});

      // 3. Keep dedicated custom products store updated (never lost on refresh)
      const customOnly = updated.filter((p) => !isDemoProduct(p));
      try {
        localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(customOnly));
      } catch (e) {
        try {
          const compactCustom = customOnly.map((p) => {
            const isBase64Img = typeof p.image === "string" && p.image.startsWith("data:");
            const isBase64Url = typeof p.imageUrl === "string" && p.imageUrl.startsWith("data:");
            return {
              ...p,
              image: isBase64Img ? "/placeholder.svg" : p.image,
              imageUrl: isBase64Url ? "/placeholder.svg" : p.imageUrl,
              images: Array.isArray(p.images)
                ? p.images.filter((img) => typeof img === "string" && !img.startsWith("data:"))
                : [],
            };
          });
          localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(compactCustom));
        } catch {}
      }

      // 4. Also save to localStorage catalog with quota overflow fallback
      try {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("localStorage quota full, saving compact catalog to localStorage:", err);
        try {
          const compact = updated.map((p) => {
            const isBase64Img = typeof p.image === "string" && p.image.startsWith("data:");
            const isBase64Url = typeof p.imageUrl === "string" && p.imageUrl.startsWith("data:");
            return {
              ...p,
              image: isBase64Img ? "/placeholder.svg" : p.image,
              imageUrl: isBase64Url ? "/placeholder.svg" : p.imageUrl,
              images: Array.isArray(p.images)
                ? p.images.filter((img) => typeof img === "string" && !img.startsWith("data:"))
                : [],
              variants: Array.isArray(p.variants)
                ? p.variants.map((v) => ({
                    ...v,
                    image: typeof v.image === "string" && v.image.startsWith("data:") ? "" : v.image,
                    images: Array.isArray(v.images)
                      ? v.images.filter((img: any) => typeof img === "string" && !img.startsWith("data:"))
                      : [],
                  }))
                : [],
            };
          });
          localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(compact));
        } catch {}
      }

      // 5. ALWAYS dispatch in-window and cross-tab update event
      try {
        window.dispatchEvent(new CustomEvent("pf_products_updated", { detail: updated }));
      } catch {}
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
    const product: Product = normalizeProduct({
      ...newP,
      id,
      isActive: true,
      status: "active",
      stock: parsedStock,
      sku: newP.sku || `PF-NEW-${Math.floor(100 + Math.random() * 900)}`,
      updatedAt: nowIso,
    });

    // 1. Immediately save to IndexedDB with full images and variants
    idbSaveSingleProduct(product).catch(() => {});

    // 2. Remove from deleted IDs
    try {
      const deletedIds: string[] = JSON.parse(
        localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]",
      );
      const filtered = deletedIds.filter((x) => x !== id);
      localStorage.setItem(STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(filtered));
    } catch {}

    // 3. Immediately save to dedicated custom user products store (guaranteed persistence on refresh)
    try {
      const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
      let customList: Product[] = [];
      if (customStored) {
        try {
          const parsed = JSON.parse(customStored);
          if (Array.isArray(parsed)) customList = parsed;
        } catch {}
      }
      customList = [product, ...customList.filter((p) => p.id !== id)];
      localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(customList));
    } catch (e) {
      console.warn("Custom product storage notice:", e);
    }

    // 4. Immediately update state using functional updater
    setProductsList((currentList) => {
      const updated = [product, ...currentList.filter((p) => p.id !== id)];
      saveProducts(updated);
      return updated;
    });

    // 5. Persist to backend database API
    try {
      const res = await productApi.create(product);
      if (res && res.success) {
        const serverProduct = (res as any).product || res.data;
        if (serverProduct && serverProduct.id) {
          const finalItem = normalizeProduct({
            ...product,
            ...serverProduct,
            isActive: true,
            status: "active",
            sizes: serverProduct.sizes || product.sizes,
          });
          setProductsList((currentList) => {
            const updated = [finalItem, ...currentList.filter((p) => p.id !== id && p.id !== finalItem.id)];
            saveProducts(updated);
            return updated;
          });
          return finalItem;
        }
      }
    } catch (err) {
      console.warn("Could not sync added product to backend API (saved locally):", err);
    }

    return product;
  };

  const syncCatalogToDatabase = async (clearDefaults: boolean = false) => {
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
    toast.info("Legacy sample products have been permanently cleared as requested. Please add your new products using '+ ADD PRODUCT'.");
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const nowIso = new Date().toISOString();
    let prevStock: number | undefined;
    let prevName: string | undefined;

    setProductsList((currentList) => {
      const found = currentList.find((p) => p.id === id);
      if (found) {
        prevStock = found.stock;
        prevName = found.name;
      }
      const updated = currentList.map((p) => {
        if (p.id === id) {
          const nextStatus = updates.status || p.status || "active";
          return normalizeProduct({
            ...p,
            ...updates,
            isActive: nextStatus !== "inactive" && nextStatus !== "archived",
            status: nextStatus,
            updatedAt: nowIso,
          });
        }
        return p;
      });
      saveProducts(updated);
      return updated;
    });

    // Also update in STORAGE_CUSTOM_PRODUCTS_KEY if present
    try {
      const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
      if (customStored) {
        const parsed = JSON.parse(customStored);
        if (Array.isArray(parsed) && parsed.some((p: any) => p.id === id)) {
          const updatedCustom = parsed.map((p: any) =>
            p.id === id ? { ...p, ...updates, updatedAt: nowIso } : p,
          );
          localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(updatedCustom));
        }
      }
    } catch {}

    // Also update in IndexedDB
    try {
      idbGetProducts().then((all) => {
        const target = all?.find((p: any) => p.id === id);
        if (target) {
          idbSaveSingleProduct({ ...target, ...updates, updatedAt: nowIso }).catch(() => {});
        }
      }).catch(() => {});
    } catch {}

    // If stock changed, record log
    if (updates.stock !== undefined && prevStock !== undefined && Number(updates.stock) !== prevStock) {
      const newLog: StockLog = {
        id: `LOG-${Date.now().toString(36)}`,
        productId: id,
        productName: updates.name || prevName || "Product",
        previousStock: prevStock,
        newStock: Number(updates.stock),
        change: Number(updates.stock) - prevStock,
        reason: "Manual admin inventory update",
        date: new Date().toISOString().split("T")[0] || "",
      };
      setStockLogs((currentLogs) => {
        const updated = [newLog, ...currentLogs];
        saveStockLogs(updated);
        return updated;
      });
    }

    // Persist to backend database API
    try {
      await productApi.update(id, { ...updates, updatedAt: nowIso });
    } catch (err) {
      console.warn("Could not sync updated product to backend API:", err);
    }
  };

  const deleteProduct = (id: string) => {
    // 1. Immediately remove from state
    setProductsList((currentList) => {
      const updated = currentList.filter((p) => p.id !== id);
      saveProducts(updated);
      return updated;
    });

    // 2. Explicitly remove from STORAGE_CUSTOM_PRODUCTS_KEY
    try {
      const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
      if (customStored) {
        const parsed = JSON.parse(customStored);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((p: any) => p.id !== id);
          localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(filtered));
        }
      }
    } catch {}

    // 3. Explicitly delete from IndexedDB
    idbDeleteProduct(id).catch(() => {});

    // 4. Mark as deleted in STORAGE_DELETED_PRODUCTS_KEY
    try {
      const deletedIds: string[] = JSON.parse(
        localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]",
      );
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(STORAGE_DELETED_PRODUCTS_KEY, JSON.stringify(deletedIds));
      }
    } catch {}

    // 5. Persist to backend database API
    productApi.delete(id).catch((err) => {
      console.warn("Could not sync deleted product to backend API:", err);
    });
  };

  const toggleProductStatus = (id: string) => {
    setProductsList((currentList) => {
      const updated = currentList.map((p) => {
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
      return updated;
    });

    // Persist to backend database API
    productApi.toggleStatus(id).catch((err) => {
      console.warn("Could not sync toggle status to backend API:", err);
    });
  };

  // Inventory actions
  const adjustStock = (productId: string, newStock: number, reason: string) => {
    let targetProd: Product | undefined;
    setProductsList((currentList) => {
      targetProd = currentList.find((p) => p.id === productId);
      if (!targetProd) return currentList;
      const updated = currentList.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
      saveProducts(updated);
      return updated;
    });

    if (targetProd) {
      const previousStock = targetProd.stock;
      const diff = newStock - previousStock;
      const log: StockLog = {
        id: `LOG-${Date.now().toString(36)}`,
        productId,
        productName: targetProd.name,
        previousStock,
        newStock,
        change: diff,
        reason: reason || "Manual stock adjustment",
        date: new Date().toISOString().split("T")[0] || "",
      };
      setStockLogs((currentLogs) => {
        const updated = [log, ...currentLogs];
        saveStockLogs(updated);
        return updated;
      });
    }

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
      const serverOrders = (ordersRes as any)?.orders || ordersRes.data;
      if (ordersRes.success && Array.isArray(serverOrders)) {
        const isDummyOrder = (o: any) =>
          o?.customerEmail?.includes("@example.com") ||
          o?.customerName === "Pooja Venkatesh" ||
          o?.customerName === "Karthik Subramanian" ||
          o?.id?.startsWith("PF-TEST-") ||
          ["PF-1081", "PF-1082", "PF-1083"].includes(o?.id);

        const cleanOrders = serverOrders.filter((o: any) => !isDummyOrder(o));
        setOrders(cleanOrders);
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(cleanOrders));
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
    paymentMethod?: "cod" | "online" | string;
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
        // Clear bag ONLY after successful server-side save in TiDB
        clearBag();

        const resolvedOrderId = orderPayload.orderId || orderPayload.id || `PF-${Date.now().toString().slice(-4)}`;
        const resolvedOrderNumber = orderPayload.orderNumber || orderPayload.id || resolvedOrderId;

        // Refresh orders list from backend immediately so admin and user portal see it
        await refreshOrders().catch(() => {});

        return {
          success: true,
          orderId: resolvedOrderId,
          orderNumber: resolvedOrderNumber,
        };
      }

      // Return server error to the user if it fails
      return {
        success: false,
        error: res.error || "Failed to process order in database. Please check your network and try again.",
      };
    } catch (err: any) {
      console.error("[StoreContext] Checkout error:", err);
      return {
        success: false,
        error: err.message || "An unexpected error occurred during order creation.",
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
