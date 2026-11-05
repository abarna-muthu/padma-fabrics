import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
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
  deleteCategory: (name: string) => Promise<boolean>;
  deletedCategories: string[];
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
    shippingState?: string;
    state?: string;
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
  }) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
}

const STORAGE_PRODUCTS_KEY = "pf_admin_products_catalog";
const STORAGE_CUSTOM_PRODUCTS_KEY = "pf_custom_user_products";
const STORAGE_PURGE_LEGACY_KEY = "pf_legacy_products_purged_v2";
const STORAGE_CATEGORIES_KEY = "pf_admin_categories";
const STORAGE_ORDERS_KEY = "pf_admin_orders";
const STORAGE_STOCK_LOGS_KEY = "pf_admin_stock_logs";
const STORAGE_DELETED_PRODUCTS_KEY = "pf_admin_deleted_product_ids";
const STORAGE_DELETED_CATEGORIES_KEY = "pf_admin_deleted_categories";
const STORAGE_DELETED_ORDERS_KEY = "pf_admin_deleted_orders";

export const DEMO_PRODUCT_IDS = new Set([
  "wine-silk",
  "heritage-silk",
  "sage-cotton",
  "ivory-brocade",
  "linen-shirt",
  "navy-tee",
  "maroon-anarkali",
  "pattu-pavadai",
  "pf-mvtfhbti",
]);

export const DUPLICATE_PRODUCT_IDS = new Set([
  "pf-mvyzhdva",
  "pf-mvyze70t",
  "pf-mvz6utzp",
]);

export function isDemoProduct(p: any): boolean {
  if (!p) return false;
  const id = String(p.id || "");
  const name = String(p.name || "").trim().toLowerCase();
  return (
    DEMO_PRODUCT_IDS.has(id) ||
    DUPLICATE_PRODUCT_IDS.has(id) ||
    name === "the royal indigo silk saree" ||
    id === "pf-mvtfhbti"
  );
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
  const rawCat = String(p.category || (p as any).categoryId || (p as any).category_id || "").trim();
  const cat =
    CATEGORY_MIGRATION[rawCat] ||
    (rawCat.includes("-") && !rawCat.includes(" ")
      ? rawCat.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      : rawCat) ||
    "Chudithar Top";
  const rawImages: string[] = Array.isArray(p.images) && p.images.length > 0
    ? p.images.filter(Boolean)
    : (typeof p.images === "string" ? (() => { try { const parsed = JSON.parse(p.images); return Array.isArray(parsed) ? parsed.filter(Boolean) : []; } catch { return []; } })() : []);

  let img = (rawImages.length > 0 ? rawImages[0] : null) || p.image || p.imageUrl || p.image_url;

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

  const images = rawImages.length > 0
    ? (img && !rawImages.includes(img) ? [img, ...rawImages] : (img && rawImages[0] !== img ? [img, ...rawImages.filter((x) => x !== img)] : rawImages))
    : (img ? [img] : []);

  const variants = Array.isArray(p.variants)
    ? p.variants
    : (typeof p.variants === "string" ? (() => { try { return JSON.parse(p.variants); } catch { return []; } })() : []);

  const sanitizedSizes = cleanSizes(p.sizes, cat, desc);
  const rawStock = p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : p.stock_quantity);
  const stock = rawStock !== undefined && rawStock !== null && !isNaN(Number(rawStock)) ? Number(rawStock) : 10;

  return {
    ...p,
    id: String(p.id),
    category: cat,
    image: img || "/placeholder.svg",
    imageUrl: img || "/placeholder.svg",
    image_url: img || "/placeholder.svg",
    images,
    variants,
    sizes: sanitizedSizes,
    description: desc || "",
    stock,
    stockQuantity: stock,
    stock_quantity: stock,
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

  // Deleted categories list
  const [deletedCategories, setDeletedCategories] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_DELETED_CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

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
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    // If previously deleted, un-delete it
    if (deletedCategories.some((d) => d.toLowerCase().replace(/[^a-z0-9]/g, "") === norm)) {
      const nextDeleted = deletedCategories.filter(
        (d) => d.toLowerCase().replace(/[^a-z0-9]/g, "") !== norm,
      );
      setDeletedCategories(nextDeleted);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_DELETED_CATEGORIES_KEY, JSON.stringify(nextDeleted));
        } catch {}
      }
    }

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

  const deleteCategory = async (rawName: string): Promise<boolean> => {
    const name = rawName.trim();
    if (!name) return false;
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    // 1. Add to deletedCategories
    const updatedDeleted = Array.from(new Set([...deletedCategories, norm, name.toLowerCase()]));
    setDeletedCategories(updatedDeleted);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_DELETED_CATEGORIES_KEY, JSON.stringify(updatedDeleted));
      } catch (err) {
        console.warn("Could not save deleted categories to localStorage:", err);
      }
    }

    // 2. Remove from categoriesList
    const updated = categoriesList.filter(
      (c) => c.trim().toLowerCase().replace(/[^a-z0-9]/g, "") !== norm,
    );
    saveCategories(updated);

    // 3. Reassign any active products using this category to "Saree"
    setProductsList((currentList) => {
      let changed = false;
      const next = currentList.map((p) => {
        const pNorm = String(p.category || (p as any).categoryId || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (pNorm === norm) {
          changed = true;
          return {
            ...p,
            category: "Saree",
            categoryId: "saree",
          };
        }
        return p;
      });
      if (changed) {
        saveProducts(next);
      }
      return next;
    });

    // 4. Sync deletion to backend API
    try {
      await productApi.deleteCategory(name);
    } catch (err) {
      console.warn("Could not sync deleted category to backend API:", err);
    }

    return true;
  };

  // Catalog products (shared with public storefront)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    if (typeof window === "undefined") {
      return (staticProducts as Product[]) || [];
    }
    try {
      // Purge legacy sample/demo products once as requested by user
      if (localStorage.getItem(STORAGE_PURGE_LEGACY_KEY) !== "true") {
        localStorage.removeItem(STORAGE_PRODUCTS_KEY);
        localStorage.removeItem(STORAGE_CUSTOM_PRODUCTS_KEY);
        localStorage.removeItem(STORAGE_DELETED_PRODUCTS_KEY);
        localStorage.setItem(STORAGE_PURGE_LEGACY_KEY, "true");
        idbClearProducts().catch(() => {});
        return (staticProducts as Product[]) || [];
      }

      let deletedIds: string[] = [];
      try {
        deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
      } catch {}

      const initialMap = new Map<string, Product>();
      const seenCards = new Set<string>();

      const addInitialItem = (raw: any) => {
        if (!raw || !raw.id || deletedIds.includes(raw.id) || isDemoProduct(raw)) return;
        const norm = normalizeProduct(raw);
        if (initialMap.has(norm.id)) return;
        const rawImg = norm.image || norm.imageUrl || (norm as any).image_url || "";
        const imgKey = rawImg.replace(/v\d+\//, "").split("?")[0].split("/").pop() || "";
        const nameKey = (norm.name || "").trim().toLowerCase();
        const cardKey = `${nameKey}:::${imgKey}`;
        if (imgKey && seenCards.has(cardKey)) return;
        initialMap.set(norm.id, norm);
        if (imgKey) seenCards.add(cardKey);
      };

      // 1. Read custom user-added products (guaranteed persistence across refreshes)
      const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
      if (customStored) {
        const parsedCustom = JSON.parse(customStored);
        if (Array.isArray(parsedCustom)) {
          for (const cp of parsedCustom) {
            addInitialItem(cp);
          }
        }
      }

      // 2. Read full stored catalog if available
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            addInitialItem(p);
          }
        }
      }

      // 3. Bundled real catalog fallback: Ensures mobile devices and fresh browsers get real products immediately
      if (initialMap.size === 0 && Array.isArray(staticProducts) && staticProducts.length > 0) {
        for (const sp of staticProducts) {
          addInitialItem(sp);
        }
      }

      return Array.from(initialMap.values());
    } catch {
      return (staticProducts as Product[]) || [];
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
            const bundled = (staticProducts as Product[]) || [];
            setProductsList(bundled);
            saveProducts(bundled);
          }
          return;
        }

        let deletedIds: string[] = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
        } catch {}

        const unifiedMap = new Map<string, Product>();
        const seenCards = new Set<string>();

        const addUnifiedItem = (raw: any) => {
          if (!raw || !raw.id || deletedIds.includes(raw.id) || isDemoProduct(raw)) return;
          const norm = normalizeProduct(raw);
          if (unifiedMap.has(norm.id)) return;
          const rawImg = norm.image || norm.imageUrl || (norm as any).image_url || "";
          const imgKey = rawImg.replace(/v\d+\//, "").split("?")[0].split("/").pop() || "";
          const nameKey = (norm.name || "").trim().toLowerCase();
          const cardKey = `${nameKey}:::${imgKey}`;
          if (imgKey && seenCards.has(cardKey)) return;
          unifiedMap.set(norm.id, norm);
          if (imgKey) seenCards.add(cardKey);
        };

        // Step A: Dedicated user custom products (always preserves newly uploaded items)
        try {
          const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
          if (customStored) {
            const parsed = JSON.parse(customStored);
            if (Array.isArray(parsed)) {
              for (const cp of parsed) {
                addUnifiedItem(cp);
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
                addUnifiedItem(p);
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
                  addUnifiedItem(norm);
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

        // Fallback to staticProducts if unifiedMap is empty
        if (unifiedMap.size === 0 && Array.isArray(staticProducts) && staticProducts.length > 0) {
          for (const sp of staticProducts) {
            addUnifiedItem(sp);
          }
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
            if (
              catName &&
              !merged.some(
                (m) =>
                  m.toLowerCase().replace(/[^a-z0-9]/g, "") ===
                  catName.toLowerCase().replace(/[^a-z0-9]/g, ""),
              )
            ) {
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

    // 4. Background sync with database API (Live sync: Admin edits on laptop instantly reflect on mobile)
    let isSyncingProducts = false;
    const syncWithBackend = async () => {
      if (isSyncingProducts) return;
      isSyncingProducts = true;
      try {
        let deletedIds: string[] = [];
        try {
          deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_PRODUCTS_KEY) || "[]");
        } catch {}

        const prodRes = await productApi.getAll();
        const serverProds = (prodRes as any).products || prodRes.data;
        if (prodRes.success && Array.isArray(serverProds) && serverProds.length > 0) {
          // Filter out deleted items and demo items from server response
          const activeServerProds = serverProds
            .filter((sp: any) => !deletedIds.includes(sp.id) && !isDemoProduct(sp))
            .map(normalizeProduct);

          setProductsList((prev = []) => {
            const mergedMap = new Map<string, Product>();
            const seenCards = new Set<string>();

            // 1. Overlay server products as authoritative live source (from Admin database)
            for (const sp of activeServerProds) {
              if (deletedIds.includes(sp.id) || isDemoProduct(sp)) continue;
              if (mergedMap.has(sp.id)) continue;

              const rawImg = sp.image || sp.imageUrl || (sp as any).image_url || "";
              const imgKey = rawImg.replace(/v\d+\//, "").split("?")[0].split("/").pop() || "";
              const nameKey = (sp.name || "").trim().toLowerCase();
              const cardKey = `${nameKey}:::${imgKey}`;

              if (imgKey && seenCards.has(cardKey)) {
                continue;
              }

              mergedMap.set(sp.id, sp);
              if (imgKey) {
                seenCards.add(cardKey);
              }
            }

            // 2. Only preserve unsynced offline custom additions that don't yet exist in the database
            try {
              const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
              if (customStored) {
                const parsed = JSON.parse(customStored);
                if (Array.isArray(parsed)) {
                  for (const cp of parsed) {
                    if (cp && cp.id && !deletedIds.includes(cp.id) && !isDemoProduct(cp) && !mergedMap.has(cp.id)) {
                      const norm = normalizeProduct(cp);
                      const rawImg = norm.image || norm.imageUrl || (norm as any).image_url || "";
                      const imgKey = rawImg.replace(/v\d+\//, "").split("?")[0].split("/").pop() || "";
                      const nameKey = (norm.name || "").trim().toLowerCase();
                      const cardKey = `${nameKey}:::${imgKey}`;

                      if (!imgKey || !seenCards.has(cardKey)) {
                        mergedMap.set(norm.id, norm);
                        if (imgKey) seenCards.add(cardKey);
                      }
                    }
                  }
                }
              }
            } catch {}

            const merged = Array.from(mergedMap.values());
            // Bail out if products haven't changed to avoid unnecessary re-render triggers
            if (
              Array.isArray(prev) &&
              prev.length === merged.length &&
              prev.every(
                (p, idx) =>
                  p.id === merged[idx]?.id &&
                  p.stock === merged[idx]?.stock &&
                  p.price === merged[idx]?.price &&
                  p.image === merged[idx]?.image,
              )
            ) {
              return prev;
            }
            if (typeof window !== "undefined") {
              idbSaveProducts(merged).catch(() => {});
            }
            return merged;
          });
        }

        const ordersRes = await orderApi.getAll();
        const serverOrders = (ordersRes as any)?.orders || ordersRes.data;
        if (ordersRes.success && Array.isArray(serverOrders)) {
          let deletedOrderIds: string[] = [];
          try {
            deletedOrderIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_ORDERS_KEY) || "[]");
          } catch {}

          const isDummyOrder = (o: any) =>
            o?.customerEmail?.includes("@example.com") ||
            o?.customerName === "Pooja Venkatesh" ||
            o?.customerName === "Karthik Subramanian" ||
            o?.id?.startsWith("PF-TEST-") ||
            ["PF-1081", "PF-1082", "PF-1083"].includes(o?.id);

          const cleanOrders = serverOrders
            .filter((o: any) => !isDummyOrder(o))
            .filter(
              (o: any) =>
                !deletedOrderIds.includes(String(o.id || "")) &&
                !deletedOrderIds.includes(String((o as any).orderNumber || "")),
            );
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

    // 5. Real-time background sync: Refresh when tab becomes visible or gains focus (mobile browser app switcher / tab switch)
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        syncWithBackend();
      }
    };
    window.addEventListener("focus", syncWithBackend);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 6. Polling interval: Auto-fetch live admin updates every 15 seconds
    const pollTimer = setInterval(syncWithBackend, 15000);

    return () => {
      isCancelled = true;
      clearInterval(pollTimer);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("pf_products_updated", handleCustomProductUpdate);
      window.removeEventListener("pf_categories_updated", handleCustomCategoryUpdate);
      window.removeEventListener("pf_orders_updated", handleCustomOrderUpdate);
      window.removeEventListener("focus", syncWithBackend);
      document.removeEventListener("visibilitychange", onVisibilityChange);
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

  // Active products visible on the storefront (strictly user-uploaded, non-demo products, guaranteed deduplicated)
  const activeProducts = useMemo(() => {
    const seenIds = new Set<string>();
    const seenCards = new Set<string>();
    const result: Product[] = [];

    for (const p of productsList) {
      if (!p || !p.id) continue;
      if (seenIds.has(p.id)) continue;
      if (p.status === "inactive" || p.status === "archived" || (p as any).isActive === false) continue;
      if (isDemoProduct(p) || DEMO_PRODUCT_IDS.has(p.id) || DUPLICATE_PRODUCT_IDS.has(p.id)) continue;

      const rawImg = p.image || p.imageUrl || (p as any).image_url || "";
      const imgKey = rawImg.replace(/v\d+\//, "").split("?")[0].split("/").pop() || "";
      const nameKey = (p.name || "").trim().toLowerCase();
      const cardKey = `${nameKey}:::${imgKey}`;

      if (imgKey && seenCards.has(cardKey)) {
        continue;
      }

      seenIds.add(p.id);
      if (imgKey) {
        seenCards.add(cardKey);
      }
      result.push(p);
    }

    return result;
  }, [productsList]);

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

    // Ensure category is registered in categoriesList
    if (product.category && typeof product.category === "string" && product.category.trim()) {
      const cTrim = product.category.trim();
      if (!categoriesList.some((c) => c.toLowerCase() === cTrim.toLowerCase())) {
        saveCategories([...categoriesList, cTrim]);
      }
    }

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

    const targetImages = Array.isArray(updates.images) && updates.images.length > 0
      ? updates.images.filter(Boolean)
      : updates.image ? [updates.image] : [];
    const targetImage = updates.image || (targetImages.length > 0 ? targetImages[0] : undefined);

    let nextList: Product[] = [];
    setProductsList((currentList) => {
      const found = currentList.find((p) => p.id === id);
      if (found) {
        prevStock = found.stock;
        prevName = found.name;
      }
      const updated = currentList.map((p) => {
        if (p.id === id) {
          const nextStatus = updates.status || p.status || "active";
          const chosenImage = targetImage || p.image;
          const chosenImages = targetImages.length > 0
            ? targetImages
            : (p.images && p.images.length > 0 ? p.images : (chosenImage ? [chosenImage] : []));
          return normalizeProduct({
            ...p,
            ...updates,
            image: chosenImage,
            imageUrl: chosenImage,
            image_url: chosenImage,
            images: chosenImages,
            isActive: nextStatus !== "inactive" && nextStatus !== "archived",
            status: nextStatus,
            updatedAt: nowIso,
          });
        }
        return p;
      });
      nextList = updated;
      return updated;
    });

    if (nextList.length > 0) {
      saveProducts(nextList);
    }

    // Ensure updated category is registered in categoriesList
    if (updates.category && typeof updates.category === "string" && updates.category.trim()) {
      const cTrim = updates.category.trim();
      if (!categoriesList.some((c) => c.toLowerCase() === cTrim.toLowerCase())) {
        saveCategories([...categoriesList, cTrim]);
      }
    }

    // Also update in STORAGE_CUSTOM_PRODUCTS_KEY if present
    try {
      const customStored = localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY);
      if (customStored) {
        const parsed = JSON.parse(customStored);
        if (Array.isArray(parsed) && parsed.some((p: any) => p.id === id)) {
          const updatedCustom = parsed.map((p: any) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  image: targetImage || p.image,
                  imageUrl: targetImage || p.imageUrl,
                  image_url: targetImage || p.image_url,
                  images: targetImages.length > 0 ? targetImages : p.images,
                  updatedAt: nowIso,
                }
              : p,
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
          idbSaveSingleProduct({
            ...target,
            ...updates,
            image: targetImage || target.image,
            imageUrl: targetImage || target.imageUrl,
            image_url: targetImage || target.image_url,
            images: targetImages.length > 0 ? targetImages : target.images,
            updatedAt: nowIso,
          }).catch(() => {});
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
      const apiRes = await productApi.update(id, {
        ...updates,
        image: targetImage,
        imageUrl: targetImage,
        image_url: targetImage,
        images: targetImages,
        updatedAt: nowIso,
      });
      if (apiRes && apiRes.success && apiRes.product) {
        const normalized = normalizeProduct(apiRes.product);
        setProductsList((currentList) => {
          const synced = currentList.map((p) => (p.id === id ? { ...p, ...normalized } : p));
          saveProducts(synced);
          return synced;
        });
      }
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
    const cleanId = String(orderId || "").replace(/^#/, "").trim();
    const updated = orders.map((o) =>
      o.id === orderId ||
      o.id === cleanId ||
      (o as any).orderNumber === orderId ||
      (o as any).orderNumber === cleanId
        ? {
            ...o,
            status,
            orderStatus: status,
            manualStatusOverride: manualOverride,
          }
        : o,
    );
    saveOrders(updated);

    // Persist to backend database API
    orderApi.updateStatus(cleanId, status).catch((err) => {
      console.warn("Could not sync order status to backend API:", err);
    });
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order["paymentStatus"]) => {
    const cleanId = String(orderId || "").replace(/^#/, "").trim();
    const updated = orders.map((o) =>
      o.id === orderId ||
      o.id === cleanId ||
      (o as any).orderNumber === orderId ||
      (o as any).orderNumber === cleanId
        ? { ...o, paymentStatus }
        : o,
    );
    saveOrders(updated);

    // Persist to backend database API
    orderApi.updatePaymentStatus(cleanId, paymentStatus).catch((err) => {
      console.warn("Could not sync payment status to backend API:", err);
    });
  };

  const updateOrderDays = (orderId: string, days: number) => {
    const val = Math.max(1, Number(days) || 5);
    const updated = orders.map((o) => (o.id === orderId ? { ...o, deliveryDays: val } : o));
    saveOrders(updated);
  };

  const updateOrderDetails = (orderId: string, updates: Partial<Order>) => {
    const cleanId = String(orderId || "").replace(/^#/, "").trim();
    const updated = orders.map((o) =>
      o.id === orderId ||
      o.id === cleanId ||
      (o as any).orderNumber === orderId ||
      (o as any).orderNumber === cleanId
        ? { ...o, ...updates }
        : o,
    );
    saveOrders(updated);

    if (updates.status) {
      orderApi.updateStatus(cleanId, updates.status).catch(() => {});
    }
    if (updates.paymentStatus) {
      orderApi.updatePaymentStatus(cleanId, updates.paymentStatus).catch(() => {});
    }
  };

  const deleteOrder = (orderId: string) => {
    const cleanId = String(orderId || "").replace(/^#/, "").trim();
    const updated = orders.filter(
      (o) =>
        o.id !== orderId &&
        o.id !== cleanId &&
        (o as any).orderNumber !== orderId &&
        (o as any).orderNumber !== cleanId,
    );
    saveOrders(updated);

    try {
      const existing: string[] = JSON.parse(
        localStorage.getItem(STORAGE_DELETED_ORDERS_KEY) || "[]",
      );
      if (!existing.includes(cleanId)) existing.push(cleanId);
      if (orderId && !existing.includes(orderId)) existing.push(orderId);
      localStorage.setItem(STORAGE_DELETED_ORDERS_KEY, JSON.stringify(existing));
    } catch {}

    orderApi.delete(cleanId).catch((err) => {
      console.warn("Could not delete order from backend API:", err);
    });
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
      let deletedOrderIds: string[] = [];
      try {
        deletedOrderIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_ORDERS_KEY) || "[]");
      } catch {}

      const ordersRes = await orderApi.getAll();
      const serverOrders = (ordersRes as any)?.orders || ordersRes.data;
      if (ordersRes.success && Array.isArray(serverOrders)) {
        const isDummyOrder = (o: any) =>
          o?.customerEmail?.includes("@example.com") ||
          o?.customerName === "Pooja Venkatesh" ||
          o?.customerName === "Karthik Subramanian" ||
          o?.id?.startsWith("PF-TEST-") ||
          ["PF-1081", "PF-1082", "PF-1083"].includes(o?.id);

        const cleanOrders = serverOrders
          .filter((o: any) => !isDummyOrder(o))
          .filter(
            (o: any) =>
              !deletedOrderIds.includes(String(o.id || "")) &&
              !deletedOrderIds.includes(String((o as any).orderNumber || "")),
          );
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
    shippingState?: string;
    state?: string;
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
        shippingState: details.shippingState || details.state,
        paymentMethod: details.paymentMethod || "online",
        items,
      });

      const orderPayload = res.data || (res as any).order;
      if (res.success && orderPayload) {
        // Clear bag ONLY after successful server-side save in TiDB
        clearBag();

        const resolvedOrderId = orderPayload.orderId || orderPayload.id || `PF-${Date.now().toString().slice(-4)}`;
        const resolvedOrderNumber = orderPayload.orderNumber || orderPayload.id || resolvedOrderId;

        // 1. Immediately deduct stock from productsList and persist
        setProductsList((currentList) => {
          const updated = currentList.map((p) => {
            const matched = items.find(
              (it) =>
                it.productId === p.id ||
                String(it.productId).toLowerCase() === String(p.id).toLowerCase() ||
                (it.name && it.name.trim().toLowerCase() === p.name.trim().toLowerCase()),
            );
            if (matched) {
              const deductQty = Math.max(1, Number(matched.quantity) || 1);
              const currentStock = Number(p.stock !== undefined ? p.stock : (p as any).stock_quantity ?? 10);
              const newStock = Math.max(0, currentStock - deductQty);

              let updatedVariants = p.variants;
              if (matched.colour && Array.isArray(p.variants)) {
                updatedVariants = p.variants.map((v) => {
                  if (v.colour && v.colour.toLowerCase() === matched.colour?.toLowerCase()) {
                    const vStock = Number(v.stock !== undefined ? v.stock : currentStock);
                    return { ...v, stock: Math.max(0, vStock - deductQty) };
                  }
                  return v;
                });
              }

              return {
                ...p,
                stock: newStock,
                stock_quantity: newStock,
                stockQuantity: newStock,
                variants: updatedVariants,
              };
            }
            return p;
          });

          saveProducts(updated);
          return updated;
        });

        // 2. Immediately record inventory deduction logs
        const newLogs: StockLog[] = [];
        for (const item of items) {
          const targetProd = productsList.find(
            (p) =>
              p.id === item.productId ||
              String(p.id).toLowerCase() === String(item.productId).toLowerCase() ||
              (item.name && item.name.trim().toLowerCase() === p.name.trim().toLowerCase()),
          );
          if (targetProd) {
            const deductQty = Math.max(1, Number(item.quantity) || 1);
            const currentStock = Number(targetProd.stock !== undefined ? targetProd.stock : (targetProd as any).stock_quantity ?? 10);
            const newStock = Math.max(0, currentStock - deductQty);
            newLogs.push({
              id: `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
              productId: targetProd.id,
              productName: targetProd.name,
              previousStock: currentStock,
              newStock,
              change: -deductQty,
              reason: `Order #${resolvedOrderNumber} customer sale deduction`,
              date: new Date().toISOString().split("T")[0] || "",
            });
          }
        }
        if (newLogs.length > 0) {
          setStockLogs((currentLogs) => {
            const updated = [...newLogs, ...currentLogs];
            saveStockLogs(updated);
            return updated;
          });
        }

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
        deleteCategory,
        deletedCategories,
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
