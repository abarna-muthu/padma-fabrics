import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  FolderPlus,
  Tag,
  RefreshCw,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  Globe,
  Phone,
  Mail,
  Sparkles,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Truck,
  Camera,
  Clipboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/padmanabha-logo.jpg";
import storeImg from "@/assets/padmanabha-store.jpg";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useStore } from "@/context/StoreContext";
import {
  useSiteContent,
  DEFAULT_HERO_BANNERS,
  DEFAULT_POPULAR_CATEGORIES,
  DEFAULT_BESTSELLER_TABS,
  type HeroBannerSlide,
  type PopularCategoryItem,
  type BestsellerCategoryTabItem,
} from "@/context/SiteContentContext";
import { ALL, categories, money, type Product, type ProductVariant, type Order } from "@/lib/catalog";
import { computeOrderTracking } from "@/lib/orderTracking";
import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import { customerApi, productApi } from "@/lib/api";
import { AdminLoginView } from "./login";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Padmanabha Fabrics" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

export const AVAILABLE_SIZES = [
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
] as const;

export const DUMMY_PRODUCT_IMAGES = [
  {
    name: "Wine Zari Silk Saree",
    url: "/assets/burgundy-silk.jpg",
    category: "Saree",
  },
  {
    name: "Heritage Gold Silk Saree",
    url: "/assets/fabric-hero.jpg",
    category: "Saree",
  },
  {
    name: "Maroon Chudithar Suit",
    url: "/assets/womens-dress.jpg",
    category: "Chudithar",
  },
  {
    name: "Sage Elegance Coordset",
    url: "/assets/sage-fabric.jpg",
    category: "Coordset",
  },
  {
    name: "Ivory Flowing Floral Maxi",
    url: "/assets/ivory-brocade.jpg",
    category: "Maxi",
  },
  {
    name: "Pure Soft Cotton Nighty",
    url: "/assets/girls-daily-frock.jpg",
    category: "Nighty",
  },
  {
    name: "Tailored Chudithar Top",
    url: "/assets/mens-shirt.jpg",
    category: "Chudithar Top",
  },
  {
    name: "Stylish 2piece Everyday Set",
    url: "/assets/tshirt.jpg",
    category: "2piece",
  },
  {
    name: "Festive Combo Dresses Set",
    url: "/assets/kids-dress.jpg",
    category: "Combo Dresses",
  },
];

type AdminTab =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "sales"
  | "home-content"
  | "about-content"
  | "contact-content"
  | "settings";

function AdminDashboardPage() {
  const { isAuthenticated, user, logout, updateCredentials } = useAdminAuth();
  const navigate = useNavigate();

  const {
    productsList,
    categoriesList,
    addCategory,
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
    refreshOrders,
  } = useStore();

  const [isRestoring, setIsRestoring] = useState(false);
  const handleRestore41Products = async () => {
    setIsRestoring(true);
    toast.loading("Restoring all 41 products with photos & descriptions...", { id: "restore-prods" });
    try {
      await restoreAllProducts();
    } catch (err: any) {
      toast.error(err?.message || "Failed to restore products", { id: "restore-prods" });
    } finally {
      setIsRestoring(false);
    }
  };

  const [isSyncingDb, setIsSyncingDb] = useState(false);

  const handleSyncToTiDB = async (clearDefaults: boolean = true) => {
    setIsSyncingDb(true);
    toast.loading("Connecting to TiDB Cloud & syncing products...", { id: "tidb-sync" });
    try {
      const res = await syncCatalogToDatabase(clearDefaults);
      if (res.success) {
        toast.success(res.message || "All products synced to TiDB Cloud database successfully!", { id: "tidb-sync" });
      } else {
        toast.error(res.message || "Failed to sync to database. Ensure server is running (npm run dev).", { id: "tidb-sync" });
      }
    } catch (err: any) {
      toast.error(err?.message || "TiDB sync error", { id: "tidb-sync" });
    } finally {
      setIsSyncingDb(false);
    }
  };

  const activeCategoriesList =
    categoriesList && categoriesList.length > 0
      ? categoriesList
      : (categories as readonly string[]);

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Customer management states
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);

  // Customer Action Modals state (View, Edit, Delete)
  const [viewingCustomer, setViewingCustomer] = useState<any | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<any | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSavingCustomer(true);
    try {
      const targetId = editingCustomer.id || editingCustomer.email;
      await customerApi.update(targetId, editCustomerForm).catch(() => {});

      setCustomersList((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id || (c.email && c.email.toLowerCase() === editingCustomer.email?.toLowerCase())
            ? { ...c, ...editCustomerForm }
            : c,
        ),
      );

      toast.success("Customer details updated successfully!");
      setEditingCustomer(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update customer.");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsDeletingCustomer(true);
    try {
      const targetId = deletingCustomer.id || deletingCustomer.email;
      await customerApi.delete(targetId).catch(() => {});

      setCustomersList((prev) =>
        prev.filter(
          (c) =>
            c.id !== deletingCustomer.id &&
            (!c.email || c.email.toLowerCase() !== deletingCustomer.email?.toLowerCase()),
        ),
      );

      toast.success("Customer record removed successfully.");
      setDeletingCustomer(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete customer.");
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  // Auto-refresh orders whenever Admin navigates to Orders tab
  useEffect(() => {
    if (activeTab === "orders") {
      refreshOrders();
    }
  }, [activeTab]);

  const handleManualRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    try {
      await refreshOrders();
      toast.success("Orders synced with latest live database status!");
    } catch {
      toast.error("Failed to refresh orders.");
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  // Sync customers from backend API and orders
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCustomers = async () => {
      try {
        const res = await customerApi.getAll();
        const serverCustomers = (res as any)?.customers || res.data;
        if (res.success && Array.isArray(serverCustomers) && serverCustomers.length > 0) {
          setCustomersList(serverCustomers);
          return;
        }
      } catch (err) {
        console.debug("Customer API fetch standby:", err);
      }

      // Fallback: build customer list dynamically from orders
      const map = new Map<string, any>();
      for (const o of orders) {
        const email = o.customerEmail?.toLowerCase() || "";
        if (!email) continue;
        if (!map.has(email)) {
          map.set(email, {
            id: `cust-${email.replace(/[^a-z0-9]/g, "").slice(0, 8)}`,
            name: o.customerName || "Customer",
            email: o.customerEmail,
            phone: o.customerPhone || "",
            address: o.shippingAddress || "",
            ordersCount: 0,
            totalSpent: 0,
            lastOrderDate: o.date || "",
          });
        }
        const entry = map.get(email);
        entry.ordersCount += 1;
        if (o.paymentStatus === "Paid") {
          entry.totalSpent += Number(o.total || 0);
        }
        if (o.date && (!entry.lastOrderDate || o.date > entry.lastOrderDate)) {
          entry.lastOrderDate = o.date;
        }
        if (!entry.address && o.shippingAddress) {
          entry.address = o.shippingAddress;
        }
      }
      setCustomersList(Array.from(map.values()));
    };

    loadCustomers();
  }, [isAuthenticated, orders]);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Product management modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>(ALL);

  // Category management modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      toast.error("Please enter a category name");
      return;
    }

    if (activeCategoriesList.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already exists!`);
      return;
    }

    setIsSubmittingCategory(true);
    try {
      const ok = await addCategory(trimmed, newCatDesc.trim());
      if (ok) {
        toast.success(`Category "${trimmed}" added successfully!`);
        setProdCategory(trimmed);
        setNewCatName("");
        setNewCatDesc("");
        setIsCategoryModalOpen(false);
      } else {
        toast.error("Failed to add category");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add category");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Product form state
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<string>("Saree");
  const [prodColour, setProdColour] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodUnit, setProdUnit] = useState("piece");
  const [prodStock, setProdStock] = useState("0");
  const [prodBadge, setProdBadge] = useState("New");
  const [prodDescription, setProdDescription] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodSizes, setProdSizes] = useState<string[]>([...AVAILABLE_SIZES]);
  const [prodImage, setProdImage] = useState("");
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodVariants, setProdVariants] = useState<ProductVariant[]>([]);

  // Quick-adder states for colour variants
  const [variantColourInput, setVariantColourInput] = useState("");
  const [variantHexInput, setVariantHexInput] = useState("#9F160A");
  const [variantPriceInput, setVariantPriceInput] = useState("");
  const [variantStockInput, setVariantStockInput] = useState("10");
  const [variantImageInput, setVariantImageInput] = useState("");
  const [isUploadingVariantImage, setIsUploadingVariantImage] = useState(false);
  const variantFileInputRef = useRef<HTMLInputElement | null>(null);
  const variantRowFileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetVariantIndexForUpload, setTargetVariantIndexForUpload] = useState<number | null>(null);
  const [manualImageInput, setManualImageInput] = useState("");

  const handleUploadVariantImageFile = async (
    file: File,
    variantIndex?: number | null,
  ) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    setIsUploadingVariantImage(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsUploadingVariantImage(false);
        return;
      }
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const base64Data = ctx
          ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL("image/jpeg", 0.78))
          : result;

        try {
          const uploadRes = await productApi.uploadImage(base64Data, "padma_products");
          const finalUrl = uploadRes && uploadRes.success && (uploadRes.secure_url || uploadRes.url)
            ? (uploadRes.secure_url || uploadRes.url)
            : base64Data;

          if (variantIndex !== undefined && variantIndex !== null && variantIndex >= 0) {
            setProdVariants((prev) => {
              const copy = [...prev];
              if (copy[variantIndex]) {
                copy[variantIndex] = {
                  ...copy[variantIndex]!,
                  image: finalUrl,
                  images: [finalUrl],
                };
              }
              return copy;
            });
            toast.success("Colour variant photo updated!");
          } else {
            setVariantImageInput(finalUrl);
            toast.success("Colour variant photo uploaded!");
          }
          setProdImages((prev) => Array.from(new Set([...prev, finalUrl])));
        } catch (err) {
          console.warn("Upload fallback to local preview:", err);
          if (variantIndex !== undefined && variantIndex !== null && variantIndex >= 0) {
            setProdVariants((prev) => {
              const copy = [...prev];
              if (copy[variantIndex]) {
                copy[variantIndex] = {
                  ...copy[variantIndex]!,
                  image: base64Data,
                  images: [base64Data],
                };
              }
              return copy;
            });
          } else {
            setVariantImageInput(base64Data);
          }
          setProdImages((prev) => Array.from(new Set([...prev, base64Data])));
        } finally {
          setIsUploadingVariantImage(false);
          setTargetVariantIndexForUpload(null);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddColourVariant = () => {
    const trimmed = variantColourInput.trim();
    if (!trimmed) {
      toast.error("Please enter a colour name (e.g. Rani Pink, Teal Blue)");
      return;
    }
    const existingIndex = prodVariants.findIndex(
      (v) => v.colour.toLowerCase() === trimmed.toLowerCase(),
    );
    const chosenImage = variantImageInput.trim() || prodImage || "";
    const newVariant: ProductVariant = {
      id: `var-${Date.now().toString(36)}`,
      colour: trimmed,
      colourHex: variantHexInput || "#9F160A",
      price: variantPriceInput && Number(variantPriceInput) > 0 ? Number(variantPriceInput) : undefined,
      stock: variantStockInput && Number(variantStockInput) >= 0 ? Number(variantStockInput) : 10,
      image: chosenImage || undefined,
      images: chosenImage ? [chosenImage] : [],
    };

    if (existingIndex >= 0) {
      setProdVariants((prev) => {
        const copy = [...prev];
        copy[existingIndex] = newVariant;
        return copy;
      });
      toast.success(`Updated variant colour "${trimmed}"`);
    } else {
      setProdVariants((prev) => [...prev, newVariant]);
      toast.success(`Added colour variant "${trimmed}"`);
    }

    if (chosenImage) {
      setProdImages((prev) => Array.from(new Set([...prev, chosenImage])));
    }

    setVariantColourInput("");
    setVariantImageInput("");
    setVariantPriceInput("");
    setVariantStockInput("10");
  };

  const handleRemoveColourVariant = (indexToRemove: number, colourName?: string) => {
    setProdVariants((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    toast.success(colourName ? `Removed colour variant "${colourName}"` : "Colour variant removed");
  };

  const handleAddImageFromUrl = () => {
    const trimmed = manualImageInput.trim();
    if (!trimmed) return;
    setProdImages((prev) => Array.from(new Set([...prev, trimmed])));
    if (!prodImage) setProdImage(trimmed);
    setManualImageInput("");
    toast.success("Image URL added to gallery!");
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setProdImages((prev) => {
      const next = prev.filter((_, i) => i !== indexToRemove);
      if (prodImage === prev[indexToRemove]) {
        setProdImage(next[0] || "");
      }
      return next;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setProdImages((prev) => {
      if (index === 0 || !prev[index]) return prev;
      const target = prev[index]!;
      const rest = prev.filter((_, i) => i !== index);
      const next = [target, ...rest];
      setProdImage(target);
      return next;
    });
    toast.success("Primary cover image updated!");
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    setProdImages((prev) => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const copy = [...prev];
      const item = copy.splice(fromIndex, 1)[0]!;
      copy.splice(toIndex, 0, item);
      if (toIndex === 0) setProdImage(item);
      return copy;
    });
  };

  const toggleSize = (sz: string) => {
    setProdSizes((prev) => {
      const hasIt = prev.includes(sz) || (sz === "2XL" && prev.includes("XXL"));
      if (hasIt) {
        return prev.filter((s) => s !== sz && s !== (sz === "2XL" ? "XXL" : ""));
      } else {
        const next = [...prev.filter((s) => s !== (sz === "2XL" ? "XXL" : "")), sz];
        return AVAILABLE_SIZES.filter((s) => next.includes(s));
      }
    });
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const processAndUploadImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select or paste a valid image file (JPG, PNG, WebP).");
      return;
    }

    setIsUploadingImage(true);
    setImageUploadStatus("Optimizing photo for Cloudinary upload...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsUploadingImage(false);
        setImageUploadStatus("");
        return;
      }

      // Automatically optimize/compress image to keep it lightweight and fast
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        const base64Data = ctx
          ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL("image/jpeg", 0.80))
          : result;

        // Immediately upload to Cloudinary into padma_products folder
        setImageUploadStatus("Uploading to Cloudinary (folder: padma_products)...");
        try {
          const uploadRes = await productApi.uploadImage(base64Data, "padma_products");
          if (uploadRes && uploadRes.success && (uploadRes.secure_url || uploadRes.url)) {
            const cloudUrl = uploadRes.secure_url || uploadRes.url;
            setProdImage(cloudUrl);
            setProdImages((prev) => Array.from(new Set([...prev, cloudUrl])));
            setImageUploadStatus(`Cloudinary: ${file.name || "Pasted photo"} (uploaded)`);
            toast.success("Photo uploaded to Cloudinary (padma_products)!");
          } else {
            setProdImage(base64Data);
            setProdImages((prev) => Array.from(new Set([...prev, base64Data])));
            setImageUploadStatus(`${file.name || "Pasted photo"} (local preview)`);
          }
        } catch (uploadErr: any) {
          console.warn("Cloudinary upload fallback to local preview:", uploadErr);
          setProdImage(base64Data);
          setProdImages((prev) => Array.from(new Set([...prev, base64Data])));
          setImageUploadStatus(`${file.name || "Pasted photo"} (local preview)`);
        } finally {
          setIsUploadingImage(false);
        }
      };
      img.onerror = () => {
        setProdImage(result);
        setProdImages((prev) => Array.from(new Set([...prev, result])));
        setImageUploadStatus(`${file.name || "Pasted photo"}`);
        setIsUploadingImage(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      setImageUploadStatus("");
      toast.error("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAndUploadImageFile(file);
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handlePasteImageFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const ext = imageType.split("/")[1] || "png";
            const file = new File([blob], `pasted-photo-${Date.now()}.${ext}`, {
              type: imageType,
            });
            toast.info("Pasting copied image...");
            processAndUploadImageFile(file);
            return;
          }
        }
        toast.error("No copied image found in clipboard. Copy an image first, then click paste.");
      } else {
        toast.info("Please press Ctrl+V on your keyboard to paste the copied image.");
      }
    } catch (err: any) {
      console.warn("Clipboard read error, fallback to Ctrl+V hint:", err);
      toast.info("Please press Ctrl+V on your keyboard to paste your copied image.");
    }
  };

  const handleGalleryPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items || items.length === 0) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const ext = blob.type.split("/")[1] || "png";
          const file = new File([blob], `pasted-photo-${Date.now()}.${ext}`, {
            type: blob.type,
          });
          toast.info("Pasted image detected. Uploading...");
          processAndUploadImageFile(file);
          return;
        }
      }
    }
  };

  // Stock adjustment modal states
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState("");
  const [stockReason, setStockReason] = useState("");

  // Inventory filtering & check states (Search, Month-wise, Date-wise)
  const [invSearch, setInvSearch] = useState("");
  const [invFilterMode, setInvFilterMode] = useState<"all" | "date" | "month" | "low" | "out">("all");
  const [invSelectedDate, setInvSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [invSelectedMonth, setInvSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [invStrictActivityFilter, setInvStrictActivityFilter] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [invCurrentPage, setInvCurrentPage] = useState(1);
  const invItemsPerPage = 10;

  // View Stock Details Modal
  const [viewStockProduct, setViewStockProduct] = useState<Product | null>(null);

  // Delete / Reset Stock Modal
  const [deleteStockModalProduct, setDeleteStockModalProduct] = useState<Product | null>(null);

  // Order detail view modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<Order | null>(null);
  const [trackingOrderModal, setTrackingOrderModal] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  // Settings form states
  const [currentPass, setCurrentPass] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [settingsMessage, setSettingsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Site Content State for editing Home, About, Contact
  const {
    content,
    updateHomeContent,
    updateAboutContent,
    updateContactContent,
    resetToDefaults,
  } = useSiteContent();

  const [homeDraft, setHomeDraft] = useState(() => ({
    ...content.home,
    heroBanners: content.home.heroBanners || DEFAULT_HERO_BANNERS,
    popularCategories: content.home.popularCategories || DEFAULT_POPULAR_CATEGORIES,
    bestsellerTabs: content.home.bestsellerTabs || DEFAULT_BESTSELLER_TABS,
  }));
  const [aboutDraft, setAboutDraft] = useState(content.about);
  const [contactDraft, setContactDraft] = useState(content.contact);
  const [contentStatusMsg, setContentStatusMsg] = useState<{
    page: "home" | "about" | "contact";
    text: string;
  } | null>(null);

  const [isUploadingHomeMedia, setIsUploadingHomeMedia] = useState(false);

  const handleUploadHomeMedia = async (
    file: File | undefined,
    folder: string,
    onSuccess: (url: string) => void,
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setIsUploadingHomeMedia(true);
    toast.info("Uploading image to Cloudinary...", { id: "home-upload" });

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsUploadingHomeMedia(false);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          const maxDim = folder === "padma_banners" ? 1200 : 500;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          const base64Data = ctx
            ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL("image/jpeg", 0.78))
            : result;

          const res = await productApi.uploadImage(base64Data, folder);
          const cloudUrl =
            res && res.success && (res.secure_url || res.url)
              ? res.secure_url || res.url
              : base64Data;

          onSuccess(cloudUrl);
          toast.success("Image updated and saved live!", { id: "home-upload" });
        } catch (err) {
          console.warn("Upload error, using local data:", err);
          onSuccess(result);
          toast.success("Image updated and saved live!", { id: "home-upload" });
        } finally {
          setIsUploadingHomeMedia(false);
        }
      };
      img.onerror = () => {
        onSuccess(result);
        setIsUploadingHomeMedia(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setHomeDraft({
      ...content.home,
      heroBanners: content.home.heroBanners || DEFAULT_HERO_BANNERS,
      popularCategories: content.home.popularCategories || DEFAULT_POPULAR_CATEGORIES,
      bestsellerTabs: content.home.bestsellerTabs || DEFAULT_BESTSELLER_TABS,
    });
  }, [content.home]);

  useEffect(() => {
    setAboutDraft(content.about);
  }, [content.about]);

  useEffect(() => {
    setContactDraft(content.contact);
  }, [content.contact]);

  const handleSaveHomeContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomeContent(homeDraft);
    toast.success("Home page content updated successfully and synced to live website!");
    setContentStatusMsg({ page: "home", text: "Home page content updated successfully!" });
    setTimeout(() => setContentStatusMsg(null), 3500);
  };

  const handleSaveAboutContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutContent(aboutDraft);
    setContentStatusMsg({ page: "about", text: "About page content updated successfully!" });
    setTimeout(() => setContentStatusMsg(null), 3500);
  };

  const handleSaveContactContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactContent(contactDraft);
    setContentStatusMsg({ page: "contact", text: "Contact page content updated successfully!" });
    setTimeout(() => setContentStatusMsg(null), 3500);
  };

  const handleResetContent = () => {
    if (window.confirm("Reset all page contents back to default Padmanabha Fabrics values?")) {
      resetToDefaults();
      setContentStatusMsg({ page: "home", text: "Content successfully restored to defaults." });
      setTimeout(() => setContentStatusMsg(null), 3500);
    }
  };

  // Metrics calculations
  const totalRevenue = useMemo(() => {
    // Only count completed paid orders as revenue
    return orders.filter((o) => o.paymentStatus === "Paid").reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return productsList.filter((p) => p.stock < 5).length;
  }, [productsList]);

  const activeProductsCount = useMemo(() => {
    return productsList.filter((p) => p.status === "active").length;
  }, [productsList]);

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdName("");
    setProdCategory("Saree");
    setProdColour("");
    setProdPrice("");
    setProdUnit("piece");
    setProdStock("10");
    setProdBadge("New arrival");
    setProdDescription("");
    setProdSku(`PF-${Math.floor(100 + Math.random() * 900)}`);
    setProdSizes([...AVAILABLE_SIZES]);
    setProdImage("");
    setProdImages([]);
    setProdVariants([]);
    setVariantColourInput("");
    setVariantHexInput("#9F160A");
    setVariantPriceInput("");
    setVariantStockInput("10");
    setVariantImageInput("");
    setManualImageInput("");
    setImageUploadStatus("");
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdColour(p.colour);
    setProdPrice(p.price.toString());
    setProdUnit(p.unit);
    setProdStock(p.stock.toString());
    setProdBadge(p.badge);
    setProdDescription(p.description);
    setProdSku(p.sku || "");
    setProdSizes(
      p.sizes && p.sizes.length > 0
        ? p.sizes.map((s) => (s === "XXL" ? "2XL" : s))
        : [],
    );
    setProdImage(p.image);
    const existingImages = Array.isArray((p as any).images) && (p as any).images.length > 0
      ? (p as any).images
      : p.image
        ? [p.image]
        : [];
    setProdImages(existingImages);
    setProdVariants(Array.isArray((p as any).variants) ? (p as any).variants : []);
    setVariantColourInput("");
    setVariantHexInput("#9F160A");
    setVariantPriceInput("");
    setVariantStockInput("10");
    setVariantImageInput("");
    setManualImageInput("");
    setImageUploadStatus("");
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    // If image is still a base64 string, upload to Cloudinary now
    let finalImage = prodImage || (editingProduct ? editingProduct.image : productsList[0]?.image || "");
    if (finalImage && finalImage.startsWith("data:")) {
      try {
        toast.loading("Saving photo to Cloudinary...", { id: "cloud-save" });
        const cloudRes = await productApi.uploadImage(finalImage, "padma_products");
        if (cloudRes && cloudRes.success && (cloudRes.secure_url || cloudRes.url)) {
          finalImage = cloudRes.secure_url || cloudRes.url;
          setProdImage(finalImage);
          toast.success("Photo uploaded to Cloudinary (padma_products)!", { id: "cloud-save" });
        } else {
          toast.dismiss("cloud-save");
        }
      } catch (uploadErr) {
        console.warn("Could not upload to Cloudinary on save:", uploadErr);
        toast.dismiss("cloud-save");
      }
    }

    // Process prodVariants: upload any pending base64 variant images to Cloudinary
    const processedVariants: ProductVariant[] = [];
    for (const v of prodVariants) {
      let vImg = v.image;
      if (vImg && vImg.startsWith("data:")) {
        try {
          const vCloudRes = await productApi.uploadImage(vImg, "padma_products");
          if (vCloudRes && vCloudRes.success && (vCloudRes.secure_url || vCloudRes.url)) {
            vImg = vCloudRes.secure_url || vCloudRes.url;
          }
        } catch (err) {
          console.warn("Could not upload variant image to Cloudinary:", err);
        }
      }
      processedVariants.push({
        ...v,
        image: vImg,
        images: vImg ? [vImg] : (Array.isArray(v.images) ? v.images : []),
      });
    }

    const cleanProdImages = prodImages.map((img) => (img.startsWith("data:") && finalImage.startsWith("http") ? finalImage : img));
    const variantImages = processedVariants.map((v) => v.image).filter(Boolean) as string[];
    const galleryToSave = Array.from(new Set([finalImage, ...cleanProdImages, ...variantImages])).filter(Boolean);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: prodName,
          category: prodCategory,
          colour: prodColour,
          price: Number(prodPrice),
          unit: prodUnit,
          stock: Number(prodStock),
          badge: prodBadge,
          description: prodDescription,
          sku: prodSku,
          sizes: prodSizes,
          image: finalImage,
          images: galleryToSave,
          variants: processedVariants,
          status: editingProduct.status || "active",
          isActive: true,
        });
        toast.success(`"${prodName}" updated successfully! Changes are live on customer storefront.`);
      } else {
        const initialPieces = Math.max(0, parseInt(prodStock || "0", 10));
        await addProduct({
          name: prodName,
          category: prodCategory,
          colour: prodColour,
          price: Number(prodPrice),
          unit: prodUnit,
          stock: initialPieces,
          badge: prodBadge,
          description: prodDescription,
          sku: prodSku,
          sizes: prodSizes,
          image: finalImage,
          images: galleryToSave,
          variants: processedVariants,
          status: "active",
          isActive: true,
        });
        toast.success(`"${prodName}" added successfully with ${initialPieces} pieces in stock!`);
      }
    } catch (err: any) {
      toast.error(`Failed to save product: ${err?.message || "Unknown error"}`);
    }

    setIsProductModalOpen(false);
  };

  // Stock adjustment modal controls
  const handleOpenAddStock = (product?: Product) => {
    const target = product || productsList[0] || null;
    setStockModalProduct(target);
    setNewStockQty(target ? target.stock.toString() : "0");
    setStockReason("");
  };

  const handleSelectStockProduct = (productId: string) => {
    const found = productsList.find((p) => p.id === productId);
    if (found) {
      setStockModalProduct(found);
      setNewStockQty(found.stock.toString());
    }
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || newStockQty === "") return;
    const qty = Number(newStockQty);
    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid stock quantity (0 or greater).");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const reasonText = stockReason.trim() || "Manual inventory adjustment";
    adjustStock(stockModalProduct.id, qty, reasonText);
    toast.success(
      `Stock for "${stockModalProduct.name}" updated to ${qty} ${stockModalProduct.unit}s! (Logged on: ${today})`
    );
    setStockModalProduct(null);
    setStockReason("");
  };

  // Stock logs map for fast lookup: productId -> list of logs
  const stockLogsByProduct = useMemo(() => {
    const map = new Map<string, typeof stockLogs>();
    for (const log of stockLogs) {
      const list = map.get(log.productId) || [];
      list.push(log);
      map.set(log.productId, list);
    }
    return map;
  }, [stockLogs]);

  // Filtered products list for inventory status table
  const filteredInventoryProducts = useMemo(() => {
    return productsList.filter((p) => {
      // 1. Text Search: name, category, sku, status
      if (invSearch.trim()) {
        const q = invSearch.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesSku = (p.sku || "").toLowerCase().includes(q);
        const statusStr = p.stock === 0 ? "out of stock" : p.stock < 5 ? "low stock" : "in stock";
        const matchesStatus = statusStr.includes(q);
        if (!matchesName && !matchesCat && !matchesSku && !matchesStatus) {
          return false;
        }
      }

      // 2. Filter mode logic
      if (invFilterMode === "low") {
        return p.stock > 0 && p.stock < 5;
      }
      if (invFilterMode === "out") {
        return p.stock === 0;
      }
      if (invFilterMode === "date" && invSelectedDate) {
        const prodLogs = stockLogsByProduct.get(p.id) || [];
        const hasLogOnDate = prodLogs.some((l) => l.date === invSelectedDate);
        if (invStrictActivityFilter) {
          return hasLogOnDate;
        }
      }
      if (invFilterMode === "month" && invSelectedMonth) {
        const prodLogs = stockLogsByProduct.get(p.id) || [];
        const hasLogInMonth = prodLogs.some((l) => l.date && l.date.startsWith(invSelectedMonth));
        if (invStrictActivityFilter) {
          return hasLogInMonth;
        }
      }

      return true;
    });
  }, [
    productsList,
    invSearch,
    invFilterMode,
    invSelectedDate,
    invSelectedMonth,
    invStrictActivityFilter,
    stockLogsByProduct,
  ]);

  // Reset pagination to page 1 whenever inventory filters or search change
  useEffect(() => {
    setInvCurrentPage(1);
  }, [invSearch, invFilterMode, invSelectedDate, invSelectedMonth, invStrictActivityFilter]);

  const totalInvPages = Math.max(1, Math.ceil(filteredInventoryProducts.length / invItemsPerPage));

  // Paginated products list (exactly 10 items per page)
  const paginatedInventoryProducts = useMemo(() => {
    const validPage = Math.min(Math.max(1, invCurrentPage), totalInvPages);
    const start = (validPage - 1) * invItemsPerPage;
    return filteredInventoryProducts.slice(start, start + invItemsPerPage);
  }, [filteredInventoryProducts, invCurrentPage, invItemsPerPage, totalInvPages]);

  // Logs matching selected date or month
  const matchingDateLogs = useMemo(() => {
    if (invFilterMode === "date" && invSelectedDate) {
      return stockLogs.filter((l) => l.date === invSelectedDate);
    }
    if (invFilterMode === "month" && invSelectedMonth) {
      return stockLogs.filter((l) => l.date && l.date.startsWith(invSelectedMonth));
    }
    return stockLogs;
  }, [stockLogs, invFilterMode, invSelectedDate, invSelectedMonth]);

  // Reset stock to 0 handler
  const handleResetStock = (product: Product) => {
    const today = new Date().toISOString().split("T")[0];
    adjustStock(product.id, 0, "Stock cleared / reset to 0 (Admin action)");
    toast.success(`Stock for "${product.name}" reset to 0 ${product.unit}s. Logged on ${today}.`);
    setDeleteStockModalProduct(null);
  };

  // Delete product completely from inventory
  const handleDeleteProductCompletely = (product: Product) => {
    deleteProduct(product.id);
    toast.success(`Product "${product.name}" permanently deleted from store.`);
    setDeleteStockModalProduct(null);
  };

  // Download stock report to Excel (.csv format with UTF-8 BOM)
  const handleExportExcel = (type: "filtered" | "all" | "logs") => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      let csvRows: string[][] = [];
      let filename = `padma_inventory_${todayStr}.csv`;

      if (type === "logs") {
        filename = `padma_stock_history_logs_${todayStr}.csv`;
        csvRows.push([
          "Log ID",
          "Date",
          "Product Name",
          "Product ID",
          "Previous Stock",
          "New Stock",
          "Stock Change",
          "Reason / Notes",
        ]);
        const targetLogs = (invFilterMode === "date" || invFilterMode === "month") ? matchingDateLogs : stockLogs;
        for (const l of targetLogs) {
          csvRows.push([
            l.id,
            l.date,
            `"${(l.productName || "").replace(/"/g, '""')}"`,
            l.productId,
            String(l.previousStock),
            String(l.newStock),
            l.change >= 0 ? `+${l.change}` : String(l.change),
            `"${(l.reason || "").replace(/"/g, '""')}"`,
          ]);
        }
      } else {
        const prodsToExport = type === "filtered" ? filteredInventoryProducts : productsList;
        const isDateFiltered = invFilterMode === "date" && invSelectedDate;
        const isMonthFiltered = invFilterMode === "month" && invSelectedMonth;

        filename = type === "filtered"
          ? isDateFiltered
            ? `padma_stock_date_${invSelectedDate}.csv`
            : isMonthFiltered
              ? `padma_stock_month_${invSelectedMonth}.csv`
              : `padma_stock_filtered_${todayStr}.csv`
          : `padma_full_inventory_${todayStr}.csv`;

        csvRows.push([
          "Product ID",
          "Product Name",
          "Category",
          "SKU",
          "Current Stock",
          "Unit",
          "Status",
          "Price (INR)",
          "Selected Period Activity",
          "Latest Adjustment Date",
          "Latest Adjustment Reason",
        ]);

        for (const p of prodsToExport) {
          const logs = stockLogsByProduct.get(p.id) || [];
          const latestLog = logs[0];
          let periodActivity = "None";
          if (isDateFiltered) {
            const dateLog = logs.find((l) => l.date === invSelectedDate);
            periodActivity = dateLog
              ? `${dateLog.change >= 0 ? '+' : ''}${dateLog.change} (${dateLog.previousStock} -> ${dateLog.newStock})`
              : "No update on this date";
          } else if (isMonthFiltered) {
            const mLogs = logs.filter((l) => l.date && l.date.startsWith(invSelectedMonth));
            const netChange = mLogs.reduce((acc, l) => acc + l.change, 0);
            periodActivity = mLogs.length > 0
              ? `${mLogs.length} updates (Net: ${netChange >= 0 ? '+' : ''}${netChange})`
              : "No update in this month";
          }

          const statusStr = p.stock === 0 ? "Out of Stock" : p.stock < 5 ? "Low Stock" : "In Stock";

          csvRows.push([
            p.id,
            `"${(p.name || "").replace(/"/g, '""')}"`,
            `"${p.category || ""}"`,
            p.sku || "PF-N/A",
            String(p.stock),
            p.unit || "piece",
            statusStr,
            String(p.price),
            `"${periodActivity}"`,
            latestLog ? latestLog.date : (p.updatedAt ? p.updatedAt.split("T")[0] : todayStr),
            `"${(latestLog?.reason || "Catalog product").replace(/"/g, '""')}"`,
          ]);
        }
      }

      const csvContent = "\uFEFF" + csvRows.map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsExportMenuOpen(false);
      toast.success(`Exported ${csvRows.length - 1} records to "${filename}" for Microsoft Excel!`);
    } catch (err: any) {
      toast.error(`Export failed: ${err?.message || "Unknown error"}`);
    }
  };

  // Handle Admin Credentials update
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsMessage(null);

    if (newPass !== confirmPass) {
      setSettingsMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    try {
      const res = await updateCredentials(currentPass, newEmail || user?.email || "", newPass);
      if (res.success) {
        setSettingsMessage({
          type: "success",
          text: "Admin credentials successfully updated. Use your new password for subsequent logins.",
        });
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
      } else {
        setSettingsMessage({ type: "error", text: res.error || "Failed to update credentials." });
      }
    } catch (err: any) {
      setSettingsMessage({ type: "error", text: err.message || "Failed to update credentials." });
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchCategory = productCategoryFilter === ALL || p.category === productCategoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.colour.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [productsList, productCategoryFilter, productSearch]);

  // Pagination for Products (10 items per page)
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const productItemsPerPage = 10;

  useEffect(() => {
    setProductCurrentPage(1);
  }, [productSearch, productCategoryFilter]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productItemsPerPage));

  const paginatedProducts = useMemo(() => {
    const validPage = Math.min(Math.max(1, productCurrentPage), totalProductPages);
    const start = (validPage - 1) * productItemsPerPage;
    return filteredProducts.slice(start, start + productItemsPerPage);
  }, [filteredProducts, productCurrentPage, productItemsPerPage, totalProductPages]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
      const matchSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.includes(orderSearch);
      return matchStatus && matchSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Pagination for Orders (10 items per page)
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const orderItemsPerPage = 10;

  useEffect(() => {
    setOrderCurrentPage(1);
  }, [orderSearch, orderStatusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / orderItemsPerPage));

  const paginatedOrders = useMemo(() => {
    const validPage = Math.min(Math.max(1, orderCurrentPage), totalOrderPages);
    const start = (validPage - 1) * orderItemsPerPage;
    return filteredOrders.slice(start, start + orderItemsPerPage);
  }, [filteredOrders, orderCurrentPage, orderItemsPerPage, totalOrderPages]);

  // Download single order receipt / invoice (HTML format)
  const handleDownloadSingleOrder = (order: Order) => {
    const tracking = computeOrderTracking(order);
    const dateStr = order.date || (order.createdAt ? order.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]);
    const itemsHtml = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${it.productName || "Product"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.size || "Standard"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(it.price || 0).toLocaleString("en-IN")}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${((it.price || 0) * it.quantity).toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${order.id} - Padmanabha Fabrics</title>
  <style>
    body { font-family: 'Poppins', Arial, sans-serif; margin: 0; padding: 20px; background: #fff; color: #111; }
    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D15608; padding-bottom: 15px; margin-bottom: 25px; }
    .title { font-size: 24px; font-weight: bold; color: #9F160A; letter-spacing: 2px; }
    .subtitle { font-size: 11px; color: #EDBC3D; letter-spacing: 1px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; font-size: 13px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
    .table th { background: #FAF7F2; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
    .total-box { text-align: right; margin-top: 15px; font-size: 15px; }
    .total-amount { font-size: 20px; color: #9F160A; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
    @media print { body { padding: 0; } .invoice-box { border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <div class="title">PADMANABHA FABRICS</div>
        <div class="subtitle">CHENNAI · RETAIL & WHOLESALE</div>
      </div>
      <div style="text-align: right;">
        <h2 style="margin: 0; font-size: 18px; color: #333;">ORDER INVOICE</h2>
        <div style="font-size: 13px; color: #666;">Order #${order.id}</div>
        <div style="font-size: 12px; color: #888;">Date: ${dateStr}</div>
      </div>
    </div>

    <div class="info-grid">
      <div>
        <strong>Customer Details:</strong><br />
        ${order.customerName}<br />
        Phone: ${order.customerPhone}<br />
        Email: ${order.customerEmail || "N/A"}<br />
        Address: ${order.shippingAddress || "Menambedu, Ambattur, Chennai"}
      </div>
      <div style="text-align: right;">
        <strong>Order Summary:</strong><br />
        Fulfillment Status: <span style="font-weight: bold; color: #9F160A;">${tracking.effectiveStatus}</span><br />
        Estimated Delivery: ${order.deliveryDays || 5} Days<br />
        Payment Status: ${order.paymentStatus || "Paid"}<br />
        Payment Method: ${order.paymentMethod || "Online / COD"}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Size</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total-box">
      <div>Subtotal: ₹${order.total.toLocaleString("en-IN")}</div>
      <div>Delivery: ₹0 (Free Delivery)</div>
      <div style="margin-top: 8px;">
        Grand Total: <span class="total-amount">₹${order.total.toLocaleString("en-IN")}</span>
      </div>
    </div>

    <div class="footer">
      Padmanabha Fabrics · Menambedu, Ambattur, Chennai - 600053 · Phone: +91 99401 35700<br />
      Thank you for your order! Handcrafted Weaves & Fine Indian Apparel.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${order.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Invoice for #${order.id} downloaded!`);
  };

  // Export / Download all orders as CSV
  const handleExportAllOrders = () => {
    const listToExport = filteredOrders.length > 0 ? filteredOrders : orders;
    if (listToExport.length === 0) {
      toast.error("No orders found to download.");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Delivery Days",
      "Customer Name",
      "Phone",
      "Email",
      "Shipping Address",
      "Items Count",
      "Items Breakdown",
      "Total (INR)",
      "Payment Status",
      "Fulfillment Status",
    ];

    const escapeCsv = (str: string | number | undefined) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = listToExport.map((o) => {
      const tracking = computeOrderTracking(o);
      const dateStr = o.date || (o.createdAt ? o.createdAt.split("T")[0] : "");
      const itemsSummary = o.items.map((it) => `${it.quantity}x ${it.productName} (${it.size || "Standard"})`).join("; ");
      const totalQty = o.items.reduce((sum, it) => sum + (it.quantity || 1), 0);

      return [
        escapeCsv(o.id),
        escapeCsv(dateStr),
        escapeCsv(`${o.deliveryDays || 5} days`),
        escapeCsv(o.customerName),
        escapeCsv(o.customerPhone),
        escapeCsv(o.customerEmail || ""),
        escapeCsv(o.shippingAddress || ""),
        escapeCsv(totalQty),
        escapeCsv(itemsSummary),
        escapeCsv(o.total),
        escapeCsv(o.paymentStatus),
        escapeCsv(tracking.effectiveStatus),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `Padmanabha-Orders-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${listToExport.length} orders to CSV successfully!`);
  };

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customersList.filter((c) => {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    });
  }, [customersList, customerSearch]);

  if (!isAuthenticated) {
    return <AdminLoginView onLoginSuccess={() => setActiveTab("dashboard")} />;
  }

  return (
    <div className="admin-portal h-screen w-full bg-[#FAF7F2] flex flex-col md:flex-row text-[#0E0E0E] overflow-hidden select-none font-['Poppins',sans-serif]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[rgba(14,14,14,0.08)] shrink-0 z-30 text-[#0E0E0E]">
        <div className="flex items-center gap-2.5">
          <img
            src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#D15608]/50 shadow-xs"
          />
          <span className="font-['Cormorant_Garamond'] font-semibold text-lg text-[#0E0E0E] tracking-tight">
            Padmanabha Admin
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#0E0E0E] hover:bg-black/5">
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "fixed inset-0 top-[65px] z-40 bg-white flex" : "hidden"
        } md:static md:flex w-full md:w-64 bg-white border-r border-[rgba(14,14,14,0.08)] h-[calc(100vh-65px)] md:h-screen flex-col shrink-0 overflow-hidden z-20 shadow-xs`}
      >
        {/* Brand header */}
        <div className="p-5 sm:p-6 border-b border-[rgba(14,14,14,0.08)] flex items-center gap-3 shrink-0 bg-white">
          <img
            src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#D15608]/50 shadow-xs"
            alt="Padmanabha"
          />
          <div>
            <div className="font-['Cormorant_Garamond'] font-bold text-[#0E0E0E] text-lg sm:text-xl leading-tight tracking-tight">
              Padmanabha
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#D15608] font-bold">
              Admin Portal
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto overscroll-contain bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <LayoutDashboard className={`size-4 shrink-0 ${activeTab === "dashboard" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "dashboard" ? "text-white" : "text-[#0E0E0E]"}>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("products");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "products"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <Package className={`size-4 shrink-0 ${activeTab === "products" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "products" ? "text-white" : "text-[#0E0E0E]"}>Products</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("inventory");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "inventory"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <Boxes className={`size-4 shrink-0 ${activeTab === "inventory" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "inventory" ? "text-white" : "text-[#0E0E0E]"}>Inventory & Stock</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "orders"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <ShoppingBag className={`size-4 shrink-0 ${activeTab === "orders" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "orders" ? "text-white" : "text-[#0E0E0E]"}>Orders</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("customers");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "customers"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <Users className={`size-4 shrink-0 ${activeTab === "customers" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "customers" ? "text-white" : "text-[#0E0E0E]"}>Customers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sales");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "sales"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <TrendingUp className={`size-4 shrink-0 ${activeTab === "sales" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "sales" ? "text-white" : "text-[#0E0E0E]"}>Sales & Reports</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <Settings className={`size-4 shrink-0 ${activeTab === "settings" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "settings" ? "text-white" : "text-[#0E0E0E]"}>Admin Settings</span>
          </button>

          {/* Section: Page Content Management */}
          <div className="pt-4 pb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-[#9F160A] flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-[#D15608]" />
            <span>Page Content</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("home-content");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "home-content"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <Globe className={`size-4 shrink-0 ${activeTab === "home-content" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "home-content" ? "text-white" : "text-[#0E0E0E]"}>Home Page</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("about-content");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "about-content"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <FileText className={`size-4 shrink-0 ${activeTab === "about-content" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "about-content" ? "text-white" : "text-[#0E0E0E]"}>About Page</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("contact-content");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
              activeTab === "contact-content"
                ? "bg-[#D15608] text-white font-semibold shadow-xs"
                : "text-[#0E0E0E] hover:bg-[#FAF7F2] hover:text-black"
            }`}
          >
            <Phone className={`size-4 shrink-0 ${activeTab === "contact-content" ? "text-white" : "text-[#D15608]"}`} />
            <span className={activeTab === "contact-content" ? "text-white" : "text-[#0E0E0E]"}>Contact Page</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[rgba(14,14,14,0.08)] space-y-3 bg-[#FAF7F2]/60 shrink-0">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-full bg-[#D15608]/10 text-[#D15608] border border-[#D15608]/30 flex items-center justify-center font-semibold shrink-0">
              <User className="size-4" />
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-[#0E0E0E] tracking-wide truncate">{user?.name || "Padmanabha Administrator"}</div>
              <div className="text-[11px] text-[#D15608] font-medium truncate">{user?.email || "admin@padmanabhafabrics.com"}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8 bg-white text-[#0E0E0E] border-[rgba(14,14,14,0.15)] hover:bg-[#FAF7F2] hover:text-[#D15608] rounded-lg" asChild>
              <Link to="/">
                <Home className="size-3 mr-1.5 text-[#D15608]" /> Storefront
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-[#9F160A] hover:bg-rose-50 hover:text-rose-700 rounded-lg"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 h-full md:h-screen p-4 sm:p-6 md:p-8 overflow-y-auto overscroll-contain">
        {/* Top bar info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(14,14,14,0.08)] mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#EDBC3D] font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="size-3 text-[#EDBC3D]" />
              <span>Administration Portal · Padmanabha Fabrics</span>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl md:text-4xl font-normal text-[#0E0E0E] tracking-tight">
              {activeTab === "dashboard"
                ? "Overview Dashboard"
                : activeTab === "products"
                  ? "Product Catalog Management"
                  : activeTab === "inventory"
                    ? "Inventory & Stock Tracking"
                    : activeTab === "orders"
                      ? "Customer Orders"
                      : activeTab === "sales"
                        ? "Sales Overview & Analytics"
                        : activeTab === "home-content"
                          ? "Home Page Content Editor"
                          : activeTab === "about-content"
                            ? "About Page Content Editor"
                            : activeTab === "contact-content"
                              ? "Contact Page Content Editor"
                              : "Account & Portal Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-wider px-3 py-1 bg-white border border-[#D15608]/30 text-[#0E0E0E] rounded-full shadow-2xs font-medium">
              Live Website Sync
            </span>
            <Button variant="outline" size="sm" asChild className="text-xs rounded-full border-[rgba(14,14,14,0.18)] bg-white text-[#0E0E0E] hover:border-[#D15608] hover:bg-[#FAF7F2] shadow-2xs">
              <Link
                to={
                  activeTab === "home-content"
                    ? "/"
                    : activeTab === "about-content"
                      ? "/about"
                      : activeTab === "contact-content"
                        ? "/contact"
                        : "/shop"
                }
                target="_blank"
              >
                {activeTab === "home-content"
                  ? "View Home Page"
                  : activeTab === "about-content"
                    ? "View About Page"
                    : activeTab === "contact-content"
                      ? "View Contact Page"
                      : "View Public Shop"}{" "}
                <ArrowUpRight className="size-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* ----------------- TAB 1: DASHBOARD ----------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="relative bg-white border border-[rgba(14,14,14,0.08)] rounded-2xl p-6 shadow-xs overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[#D15608]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E0E0E]/60">Total Revenue</span>
                  <div className="p-2.5 bg-[#FAF7F2] text-[#D15608] border border-[#D15608]/20 rounded-xl">
                    <TrendingUp className="size-4" />
                  </div>
                </div>
                <div className="font-['Manrope'] font-bold text-3xl sm:text-4xl tracking-tight text-[#0E0E0E] mt-3 tabular-nums">
                  {money(totalRevenue)}
                </div>
                <span className="text-[11px] text-[#0E0E0E]/50 mt-1.5 block font-light">
                  Strictly verified paid orders
                </span>
              </div>

              <div className="relative bg-white border border-[rgba(14,14,14,0.08)] rounded-2xl p-6 shadow-xs overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[#0E0E0E]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E0E0E]/60">Total Orders</span>
                  <div className="p-2.5 bg-[#FAF7F2] text-[#0E0E0E] border border-[rgba(14,14,14,0.1)] rounded-xl">
                    <ShoppingBag className="size-4" />
                  </div>
                </div>
                <div className="font-['Manrope'] font-bold text-3xl sm:text-4xl tracking-tight text-[#0E0E0E] mt-3 tabular-nums">
                  {orders.length}
                </div>
                <span className="text-[11px] text-[#0E0E0E]/50 mt-1.5 block font-light">
                  {orders.filter((o) => o.status === "Pending").length} pending processing
                </span>
              </div>

              <div className="relative bg-white border border-[rgba(14,14,14,0.08)] rounded-2xl p-6 shadow-xs overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[#9F160A]">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E0E0E]/60">Active Catalog</span>
                  <div className="p-2.5 bg-[#FAF7F2] text-[#9F160A] border border-[#9F160A]/20 rounded-xl">
                    <Package className="size-4" />
                  </div>
                </div>
                <div className="font-['Manrope'] font-bold text-3xl sm:text-4xl tracking-tight text-[#0E0E0E] mt-3 tabular-nums">
                  {activeProductsCount}
                </div>
                <span className="text-[11px] text-[#0E0E0E]/50 mt-1.5 block font-light">
                  of {productsList.length} total products
                </span>
              </div>

              <div className="relative bg-white border border-[rgba(14,14,14,0.08)] rounded-2xl p-6 shadow-xs overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-amber-600">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0E0E0E]/60">Stock Alerts</span>
                  <div className="p-2.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="size-4" />
                  </div>
                </div>
                <div className="font-['Manrope'] font-bold text-3xl sm:text-4xl tracking-tight text-[#0E0E0E] mt-3 tabular-nums">
                  {lowStockCount}
                </div>
                <span className="text-[11px] text-amber-700 font-medium mt-1.5 block">
                  Products below 5 units
                </span>
              </div>
            </div>

            {/* Quick Actions & Low-stock alert */}
            {lowStockCount > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="size-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Low Stock Warning:</strong> {lowStockCount} product(s) have fallen below
                    the inventory reorder threshold.
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-medium border-amber-600/40 text-amber-800 dark:text-amber-200 h-9"
                  onClick={() => setActiveTab("inventory")}
                >
                  Manage Stock
                </Button>
              </div>
            )}

            {/* Recent Orders Overview */}
            <div className="bg-card border border-border p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="font-display text-lg font-medium">Recent Customer Orders</h2>
                  <p className="text-xs text-muted-foreground">
                    Latest transactions and order status
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => setActiveTab("orders")}
                >
                  View All Orders <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Order ID</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Customer</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Items</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Total</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Payment</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 4).map((o) => (
                      <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5 font-sans font-bold text-sm tracking-tight text-foreground">{o.id}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-foreground">{o.customerName}</div>
                          <div className="text-xs font-sans tabular-nums text-muted-foreground">{o.customerPhone}</div>
                        </td>
                        <td className="p-3.5 text-sm font-sans tabular-nums text-muted-foreground">{o.date}</td>
                        <td className="p-3.5 text-sm text-muted-foreground">
                          {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                        </td>
                        <td className="p-3.5 font-sans font-bold tabular-nums text-sm text-primary">{money(o.total)}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              o.paymentStatus === "Paid"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : o.paymentStatus === "Pending"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded text-xs font-medium bg-secondary text-foreground">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: PRODUCTS ----------------- */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Top Toolbar: Search, Category, New Category, Add Product - Single Clean Line */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 sm:w-80 min-w-[200px]">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0E0E0E]/40" />
                  <Input
                    placeholder="Search products, colours, SKU…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9.5 text-xs h-10 rounded-full border-[rgba(14,14,14,0.15)] bg-white focus-visible:ring-1 focus-visible:ring-[#D15608] focus-visible:border-[#D15608] w-full"
                  />
                </div>
                {/* Category filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="h-10 px-4 text-xs rounded-full bg-white border border-[rgba(14,14,14,0.15)] text-[#0E0E0E] focus:outline-none focus:ring-1 focus:ring-[#D15608] focus:border-[#D15608] shrink-0"
                >
                  {activeCategoriesList.map((c) => (
                    <option key={c} value={c}>
                      {c === ALL ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-medium rounded-full border-[rgba(14,14,14,0.18)] bg-white text-[#0E0E0E] hover:border-[#D15608] hover:bg-[#FAF7F2] shadow-2xs px-4 whitespace-nowrap"
                  onClick={() => {
                    setNewCatName("");
                    setNewCatDesc("");
                    setIsCategoryModalOpen(true);
                  }}
                >
                  <FolderPlus className="size-3.5 mr-1.5 text-[#D15608]" /> New Category
                </Button>
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="h-10 px-5 text-xs font-medium uppercase tracking-[0.14em] rounded-full bg-[#D15608] hover:bg-[#9F160A] text-[#F4F0E8] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <Plus className="size-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[rgba(14,14,14,0.08)] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[760px]">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 w-16 text-xs font-semibold uppercase tracking-wider">Preview</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Product Name & SKU</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Category</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Colour</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Price</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Stock</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-16 object-cover border border-border"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                            }}
                          />
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="text-xs text-muted-foreground font-sans tabular-nums mt-0.5">
                            {p.sku || "PF-GEN"}
                          </div>
                          {p.badge && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] bg-secondary text-muted-foreground inline-block font-medium">
                              {p.badge}
                            </span>
                          )}
                          {p.sizes && p.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.sizes.map((s) => (
                                <span
                                  key={s}
                                  className="text-[9px] px-1 py-0.2 bg-primary/10 text-primary border border-primary/20 rounded-xs font-semibold font-mono"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-sm">{p.category}</td>
                        <td className="p-3.5 text-sm text-muted-foreground">{p.colour}</td>
                        <td className="p-3.5 font-sans font-bold tabular-nums text-sm text-primary">
                          {money(p.price)}{" "}
                          <span className="text-xs text-muted-foreground font-normal">/{p.unit}</span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-semibold font-sans tabular-nums ${
                              p.stock === 0
                                ? "bg-destructive/10 text-destructive"
                                : p.stock < 5
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-emerald-500/10 text-emerald-600"
                            }`}
                          >
                            {p.stock} {p.unit}s
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => toggleProductStatus(p.id)}
                            className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-opacity ${
                              p.status === "active"
                                ? "bg-emerald-500/10 text-emerald-600 hover:opacity-80"
                                : "bg-secondary text-muted-foreground hover:opacity-80"
                            }`}
                            title="Click to toggle status"
                          >
                            {p.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-600 hover:text-white border border-blue-500/20 transition-all rounded-sm shadow-xs"
                            onClick={() => handleOpenEditProduct(p)}
                            title="Edit Product"
                          >
                            <Edit className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-600 hover:text-white border border-rose-500/20 transition-all rounded-sm shadow-xs"
                            onClick={() => setDeleteConfirmId(p.id)}
                            title="Delete Product"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">
                          No products found matching your search or filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls (10 products per page) */}
              {filteredProducts.length > 0 && (
                <div className="p-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-muted-foreground">
                    Showing{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {(productCurrentPage - 1) * productItemsPerPage + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {Math.min(productCurrentPage * productItemsPerPage, filteredProducts.length)}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {filteredProducts.length}
                    </strong>{" "}
                    products (10 per page)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={productCurrentPage <= 1}
                      onClick={() => setProductCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="h-8 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5" /> Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalProductPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          totalProductPages > 7 &&
                          Math.abs(pageNum - productCurrentPage) > 2 &&
                          pageNum !== 1 &&
                          pageNum !== totalProductPages
                        ) {
                          if (pageNum === 2 || pageNum === totalProductPages - 1) {
                            return (
                              <span key={pageNum} className="px-1 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setProductCurrentPage(pageNum)}
                            className={`size-8 text-xs font-sans tabular-nums rounded border transition-colors ${
                              productCurrentPage === pageNum
                                ? "bg-gold border-gold text-primary-foreground font-bold shadow-xs"
                                : "bg-background border-border text-foreground hover:bg-secondary"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={productCurrentPage >= totalProductPages}
                      onClick={() => setProductCurrentPage((prev) => Math.min(totalProductPages, prev + 1))}
                      className="h-8 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: INVENTORY ----------------- */}
        {activeTab === "inventory" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-5">
                <span className="text-sm font-medium text-muted-foreground">Total In-Stock Units</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {productsList.reduce((acc, p) => acc + p.stock, 0)}
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  Across all product lines
                </span>
              </div>
              <div className="bg-card border border-border p-5">
                <span className="text-sm font-medium text-muted-foreground">Low Stock Threshold (&lt;5)</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-amber-600 mt-2 tabular-nums">
                  {lowStockCount} items
                </div>
                <span className="text-xs text-amber-600 font-medium mt-1.5 block">
                  Needs loom/supplier reorder
                </span>
              </div>
              <div className="bg-card border border-border p-5">
                <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-destructive mt-2 tabular-nums">
                  {productsList.filter((p) => p.stock === 0).length}
                </div>
                <span className="text-xs text-destructive font-medium mt-1.5 block">
                  Zero inventory available
                </span>
              </div>
            </div>

            {/* Stock adjustment table */}
            <div className="bg-card border border-border p-6 space-y-5">
              {/* Section Header with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-medium mb-1">Product Inventory Status</h2>
                  <p className="text-xs text-muted-foreground">
                    Search products, filter by date or month, check stock movements, and export Excel reports
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
                  {/* EXCEL DOWNLOAD MENU */}
                  <div className="relative shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsExportMenuOpen((prev) => !prev)}
                      className="text-xs h-9 border-border hover:border-gold hover:text-gold inline-flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="size-4 text-emerald-600" />
                      <span>Download Excel</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </Button>

                    {isExportMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsExportMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-1.5 z-50 w-72 bg-card border border-border shadow-xl p-2 rounded-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                            Export Stock Reports (Excel .csv)
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExportExcel("filtered")}
                            className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-secondary flex items-start gap-2 text-foreground transition-colors"
                          >
                            <Download className="size-4 text-gold mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">
                                Download Filtered Report ({filteredInventoryProducts.length} items)
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {invFilterMode === "date"
                                  ? `Stock data filtered by date: ${invSelectedDate}`
                                  : invFilterMode === "month"
                                    ? `Stock data filtered by month: ${invSelectedMonth}`
                                    : "Active view with search & status filters"}
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportExcel("all")}
                            className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-secondary flex items-start gap-2 text-foreground transition-colors"
                          >
                            <FileSpreadsheet className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">
                                Download Full Catalog ({productsList.length} products)
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Complete inventory list with prices, SKU, units & status
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportExcel("logs")}
                            className="w-full text-left px-2.5 py-2 text-xs rounded hover:bg-secondary flex items-start gap-2 text-foreground transition-colors"
                          >
                            <History className="size-4 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium">
                                Download Stock History Logs ({matchingDateLogs.length} logs)
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                Date-wise stock change history with previous & new stock
                              </div>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ADD STOCK BUTTON */}
                  <Button
                    onClick={() => handleOpenAddStock()}
                    className="bg-gold hover:bg-gold/90 text-primary-foreground font-medium text-xs px-4 py-2 h-9 inline-flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus className="size-4" /> Add Stock
                  </Button>
                </div>
              </div>

              {/* SEARCH & DATE/MONTH FILTER CONTROLS */}
              <div className="bg-secondary/30 border border-border p-4 rounded-xs space-y-3.5">
                {/* Search Bar & Quick Mode Pills */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by product name, category, SKU, or status (e.g. In Stock)..."
                      value={invSearch}
                      onChange={(e) => setInvSearch(e.target.value)}
                      className="pl-9 pr-8 text-xs h-9 bg-background rounded-none border-border"
                    />
                    {invSearch && (
                      <button
                        type="button"
                        onClick={() => setInvSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Mode Selector Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInvFilterMode("all")}
                      className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                        invFilterMode === "all"
                          ? "bg-gold text-primary-foreground shadow-xs"
                          : "bg-background border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All Products ({productsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvFilterMode("date")}
                      className={`px-3 py-1.5 text-xs rounded font-medium inline-flex items-center gap-1 transition-colors ${
                        invFilterMode === "date"
                          ? "bg-gold text-primary-foreground shadow-xs"
                          : "bg-background border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <CalendarDays className="size-3.5" /> Date-wise
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvFilterMode("month")}
                      className={`px-3 py-1.5 text-xs rounded font-medium inline-flex items-center gap-1 transition-colors ${
                        invFilterMode === "month"
                          ? "bg-gold text-primary-foreground shadow-xs"
                          : "bg-background border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Calendar className="size-3.5" /> Month-wise
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvFilterMode("low")}
                      className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                        invFilterMode === "low"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-background border border-border text-amber-600 hover:bg-amber-50"
                      }`}
                    >
                      Low Stock (&lt;5)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvFilterMode("out")}
                      className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                        invFilterMode === "out"
                          ? "bg-destructive text-destructive-foreground shadow-xs"
                          : "bg-background border border-border text-destructive hover:bg-destructive/10"
                      }`}
                    >
                      Out of Stock (0)
                    </button>
                  </div>
                </div>

                {/* Date or Month Picker Row */}
                {invFilterMode === "date" && (
                  <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-gold" /> Choose Date:
                      </span>
                      <Input
                        type="date"
                        value={invSelectedDate}
                        onChange={(e) => setInvSelectedDate(e.target.value)}
                        className="h-8 w-40 text-xs bg-background border-border font-sans tabular-nums rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setInvSelectedDate(new Date().toISOString().split("T")[0])}
                        className="px-2.5 py-1 bg-background border border-border hover:bg-gold/15 hover:text-gold rounded text-xs transition-colors"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const y = new Date();
                          y.setDate(y.getDate() - 1);
                          setInvSelectedDate(y.toISOString().split("T")[0]);
                        }}
                        className="px-2.5 py-1 bg-background border border-border hover:bg-secondary rounded text-xs text-muted-foreground transition-colors"
                      >
                        Yesterday
                      </button>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={invStrictActivityFilter}
                        onChange={(e) => setInvStrictActivityFilter(e.target.checked)}
                        className="accent-gold rounded size-3.5"
                      />
                      <span>Only show products updated on this date ({matchingDateLogs.length} updates)</span>
                    </label>
                  </div>
                )}

                {invFilterMode === "month" && (
                  <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar className="size-4 text-gold" /> Choose Month:
                      </span>
                      <Input
                        type="month"
                        value={invSelectedMonth}
                        onChange={(e) => setInvSelectedMonth(e.target.value)}
                        className="h-8 w-44 text-xs bg-background border-border font-sans tabular-nums rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setInvSelectedMonth(new Date().toISOString().slice(0, 7))}
                        className="px-2.5 py-1 bg-background border border-border hover:bg-gold/15 hover:text-gold rounded text-xs transition-colors"
                      >
                        This Month
                      </button>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={invStrictActivityFilter}
                        onChange={(e) => setInvStrictActivityFilter(e.target.checked)}
                        className="accent-gold rounded size-3.5"
                      />
                      <span>Only show products updated in this month ({matchingDateLogs.length} updates)</span>
                    </label>
                  </div>
                )}

                {/* Filter Status & Active Tag Banner */}
                {(invSearch || invFilterMode !== "all") && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Showing:</span>
                      <span className="font-bold text-foreground font-sans tabular-nums">
                        {filteredInventoryProducts.length} of {productsList.length} products
                      </span>
                      {invFilterMode === "date" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold/15 text-gold font-medium font-sans tabular-nums">
                          📅 {invSelectedDate} · {matchingDateLogs.length} logs
                        </span>
                      )}
                      {invFilterMode === "month" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold/15 text-gold font-medium font-sans tabular-nums">
                          🗓️ {invSelectedMonth} · {matchingDateLogs.length} logs
                        </span>
                      )}
                      {invSearch && (
                        <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                          Query: "{invSearch}"
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportExcel("filtered")}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                      >
                        <Download className="size-3.5" /> Download Filtered Excel
                      </button>
                      <span className="text-border">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setInvFilterMode("all");
                          setInvSearch("");
                          setInvStrictActivityFilter(false);
                        }}
                        className="text-destructive hover:underline"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table of Products */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Product</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Category</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">SKU</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Current Stock</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInventoryProducts.length > 0 ? (
                      paginatedInventoryProducts.map((p) => {
                        const logs = stockLogsByProduct.get(p.id) || [];
                        const dateLog = invFilterMode === "date"
                          ? logs.find((l) => l.date === invSelectedDate)
                          : null;
                        const monthLogs = invFilterMode === "month"
                          ? logs.filter((l) => l.date && l.date.startsWith(invSelectedMonth))
                          : [];
                        const latestLog = logs[0];
                        const displayDate = dateLog
                          ? dateLog.date
                          : latestLog
                            ? latestLog.date
                            : p.updatedAt
                              ? p.updatedAt.split("T")[0]
                              : new Date().toISOString().split("T")[0];

                        return (
                          <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="size-9 object-cover border border-border shrink-0 bg-background"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                                  }}
                                />
                                <div>
                                  <div className="font-medium text-foreground">{p.name}</div>
                                  <div className="text-[11px] text-muted-foreground font-sans tabular-nums">
                                    ₹{p.price}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-muted-foreground">{p.category}</td>
                            <td className="p-3.5 font-sans tabular-nums text-muted-foreground">{p.sku || "PF-N/A"}</td>
                            <td className="p-3.5">
                              <div className="font-sans font-bold tabular-nums text-foreground">
                                {p.stock} {p.unit}s
                              </div>
                              {dateLog && (
                                <div className="text-[10px] text-emerald-600 font-sans tabular-nums mt-0.5">
                                  Updated on {invSelectedDate}: {dateLog.change >= 0 ? `+${dateLog.change}` : dateLog.change}
                                </div>
                              )}
                              {!dateLog && monthLogs.length > 0 && (
                                <div className="text-[10px] text-gold font-sans tabular-nums mt-0.5">
                                  {monthLogs.length} updates in {invSelectedMonth}
                                </div>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-1 rounded text-xs font-semibold font-sans tabular-nums ${
                                  p.stock === 0
                                    ? "bg-destructive/10 text-destructive"
                                    : p.stock < 5
                                      ? "bg-amber-500/10 text-amber-600"
                                      : "bg-emerald-500/10 text-emerald-600"
                                }`}
                              >
                                {p.stock === 0
                                  ? "Out of Stock"
                                  : p.stock < 5
                                    ? "Low Stock"
                                    : "In Stock"}
                              </span>
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="font-sans font-medium text-xs text-foreground tabular-nums flex items-center gap-1.5">
                                <Calendar className="size-3 text-gold" />
                                <span>{displayDate}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {dateLog ? "Filter match" : latestLog ? "Last update" : "Catalog item"}
                              </div>
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* EDIT STOCK ICON BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddStock(p)}
                                  className="size-8 rounded flex items-center justify-center border border-border bg-background hover:border-gold hover:bg-gold/15 text-gold transition-colors"
                                  title="Edit Stock Quantity"
                                  aria-label="Edit Stock"
                                >
                                  <Edit className="size-3.5" />
                                </button>
                                {/* VIEW STOCK DETAILS ICON BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => setViewStockProduct(p)}
                                  className="size-8 rounded flex items-center justify-center border border-border bg-background hover:bg-secondary text-foreground hover:text-primary transition-colors"
                                  title="View Stock History & Details"
                                  aria-label="View Stock"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                                {/* DELETE / RESET STOCK ICON BUTTON */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteStockModalProduct(p)}
                                  className="size-8 rounded flex items-center justify-center border border-border bg-background hover:border-destructive/40 hover:bg-destructive/10 text-destructive transition-colors"
                                  title="Delete Product or Reset Stock"
                                  aria-label="Delete Stock"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm space-y-2">
                          <p>No products match your search or date filter.</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setInvFilterMode("all");
                              setInvSearch("");
                              setInvStrictActivityFilter(false);
                            }}
                            className="text-xs"
                          >
                            Reset All Filters
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls (10 stocks per page) */}
              {filteredInventoryProducts.length > 0 && (
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-muted-foreground">
                    Showing{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {(invCurrentPage - 1) * invItemsPerPage + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {Math.min(invCurrentPage * invItemsPerPage, filteredInventoryProducts.length)}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {filteredInventoryProducts.length}
                    </strong>{" "}
                    products (10 per page)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={invCurrentPage <= 1}
                      onClick={() => setInvCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="h-8 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5" /> Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalInvPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          totalInvPages > 7 &&
                          Math.abs(pageNum - invCurrentPage) > 2 &&
                          pageNum !== 1 &&
                          pageNum !== totalInvPages
                        ) {
                          if (pageNum === 2 || pageNum === totalInvPages - 1) {
                            return (
                              <span key={pageNum} className="px-1 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setInvCurrentPage(pageNum)}
                            className={`size-8 text-xs font-sans tabular-nums rounded border transition-colors ${
                              invCurrentPage === pageNum
                                ? "bg-gold border-gold text-primary-foreground font-bold shadow-xs"
                                : "bg-background border-border text-foreground hover:bg-secondary"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={invCurrentPage >= totalInvPages}
                      onClick={() => setInvCurrentPage((prev) => Math.min(totalInvPages, prev + 1))}
                      className="h-8 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------- TAB 4: ORDERS ----------------- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64 min-w-[180px]">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, customer, phone…"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8 text-xs h-9 rounded-none border-border"
                  />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="h-9 px-3 text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportAllOrders}
                  className="h-9 text-xs border-border hover:border-gold hover:text-gold inline-flex items-center gap-1.5 shrink-0"
                  title="Download / Export all orders to CSV"
                >
                  <Download className="size-3.5 text-gold" />
                  <span>Download All Orders</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefreshOrders}
                  disabled={isRefreshingOrders}
                  className="h-9 text-xs border-border hover:border-gold hover:text-gold inline-flex items-center gap-1.5 shrink-0"
                  title="Refresh orders from live database"
                >
                  <RefreshCw className={`size-3.5 ${isRefreshingOrders ? "animate-spin text-gold" : "text-muted-foreground"}`} />
                  <span>Refresh Orders</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground shrink-0">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Order ID</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Customer Details</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Days</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Items Summary</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Total Amount</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Payment</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Fulfillment</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedOrders.map((o) => {
                      const tracking = computeOrderTracking(o);
                      const currentDays = o.deliveryDays || 5;

                      return (
                        <tr
                          key={o.id}
                          className={
                            o.status === "Cancelled"
                              ? "bg-red-500/10 dark:bg-red-950/35 border-l-4 border-l-red-600 hover:bg-red-500/20 transition-colors"
                              : "hover:bg-secondary/20 transition-colors"
                          }
                        >
                          <td className="p-3.5 font-sans font-bold text-sm tracking-tight text-foreground">
                            <div className={o.status === "Cancelled" ? "text-red-700 dark:text-red-400 font-bold" : ""}>
                              {o.id}
                            </div>
                          </td>
                          <td className="p-3.5">
                            {o.status === "Cancelled" ? (
                              <div className="p-2.5 rounded-md bg-red-500/15 border border-red-500/35 text-red-700 dark:text-red-300 space-y-1 shadow-2xs">
                                <div className="font-bold text-sm text-red-700 dark:text-red-300 flex items-center justify-between gap-1.5">
                                  <span className="truncate">{o.customerName}</span>
                                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] bg-red-600 text-white font-extrabold uppercase tracking-wide">
                                    Cancelled
                                  </span>
                                </div>
                                <div className="text-xs font-sans tabular-nums text-red-600/95 dark:text-red-300/90 font-medium">
                                  {o.customerPhone}
                                </div>
                                <div className="text-xs text-red-600/90 dark:text-red-300/90 truncate">
                                  {o.customerEmail}
                                </div>
                                {o.notes && (
                                  <div
                                    className="text-[10px] text-red-800 dark:text-red-200 font-mono pt-1 border-t border-red-500/20 line-clamp-2"
                                    title={o.notes}
                                  >
                                    {o.notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                <div className="font-medium text-foreground">{o.customerName}</div>
                                <div className="text-xs font-sans tabular-nums text-muted-foreground mt-0.5">{o.customerPhone}</div>
                                <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                              </>
                            )}
                          </td>
                          <td className="p-3.5 font-sans tabular-nums text-xs font-semibold text-foreground">
                            {o.date || (o.createdAt ? o.createdAt.split("T")[0] : new Date().toISOString().split("T")[0])}
                          </td>

                          {/* DAYS COLUMN: Editable delivery duration (e.g. 5, 6 days) */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 bg-background border border-border px-2 py-1 rounded shadow-2xs">
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={currentDays}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val > 0) {
                                    updateOrderDays(o.id, val);
                                  }
                                }}
                                className="w-10 h-6 text-xs text-center font-bold font-sans tabular-nums bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                                title="Set Delivery Days (e.g. 5, 6)"
                              />
                              <span className="text-[11px] font-sans text-muted-foreground">days</span>
                            </div>
                          </td>

                          <td className="p-3.5 text-sm text-muted-foreground">
                            {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                          </td>
                          <td className="p-3.5 font-sans font-bold tabular-nums text-sm text-primary">{money(o.total)}</td>
                          <td className="p-3.5">
                            <select
                              value={o.paymentStatus}
                              onChange={(e) =>
                                updatePaymentStatus(o.id, e.target.value as Order["paymentStatus"])
                              }
                              className={`px-2.5 py-1 text-xs font-medium border border-border focus:outline-none ${
                                o.paymentStatus === "Paid"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  : o.paymentStatus === "Pending"
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                    : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              <option value="Paid">Paid</option>
                              <option value="Pending">Pending</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </td>

                          {/* FULFILLMENT COLUMN: Automatic step progression unless admin overrides */}
                          <td className="p-3.5">
                            <select
                              value={tracking.effectiveStatus}
                              onChange={(e) =>
                                updateOrderStatus(o.id, e.target.value as Order["status"], true)
                              }
                              className={`px-2.5 py-1 text-xs font-medium border border-border focus:outline-none ${
                                tracking.effectiveStatus === "Delivered"
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                  : tracking.effectiveStatus === "Shipped"
                                    ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold"
                                    : tracking.effectiveStatus === "Processing"
                                      ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                                      : tracking.effectiveStatus === "Cancelled"
                                        ? "bg-destructive/15 text-destructive border-destructive/30"
                                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              }`}
                            >
                              <option value="Pending">Pending (Day 1)</option>
                              <option value="Processing">Processing (Day 2)</option>
                              <option value="Shipped">Shipped (Day 3+)</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>

                          {/* ACTION COLUMN: ICON BUTTONS (DOWNLOAD INVOICE, EDIT, VIEW, DELETE) */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* DOWNLOAD INVOICE ICON BUTTON */}
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleOrder(o)}
                                className="size-8 rounded flex items-center justify-center border border-border bg-background hover:border-gold hover:bg-gold/15 text-gold transition-colors"
                                title="Download Order Invoice (HTML)"
                                aria-label="Download Order Invoice"
                              >
                                <Download className="size-3.5" />
                              </button>

                              {/* EDIT ORDER ICON BUTTON */}
                              <button
                                type="button"
                                onClick={() => setEditingOrder(o)}
                                className="size-8 rounded flex items-center justify-center border border-border bg-background hover:border-gold hover:bg-gold/15 text-gold transition-colors"
                                title="Edit Order & Delivery Days"
                                aria-label="Edit Order"
                              >
                                <Edit className="size-3.5" />
                              </button>

                              {/* VIEW ORDER ICON BUTTON */}
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                className="size-8 rounded flex items-center justify-center border border-border bg-background hover:bg-secondary text-foreground hover:text-primary transition-colors"
                                title="View Order Details & Tracking"
                                aria-label="View Order"
                              >
                                <Eye className="size-3.5" />
                              </button>

                              {/* DELETE ORDER ICON BUTTON */}
                              <button
                                type="button"
                                onClick={() => setDeleteOrderConfirm(o)}
                                className="size-8 rounded flex items-center justify-center border border-border bg-background hover:border-destructive/40 hover:bg-destructive/10 text-destructive transition-colors"
                                title="Delete Order"
                                aria-label="Delete Order"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">
                          No orders found matching the filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls (10 orders per page) */}
              {filteredOrders.length > 0 && (
                <div className="p-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-muted-foreground">
                    Showing{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {(orderCurrentPage - 1) * orderItemsPerPage + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {Math.min(orderCurrentPage * orderItemsPerPage, filteredOrders.length)}
                    </strong>{" "}
                    of{" "}
                    <strong className="text-foreground font-sans tabular-nums">
                      {filteredOrders.length}
                    </strong>{" "}
                    orders (10 per page)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={orderCurrentPage <= 1}
                      onClick={() => setOrderCurrentPage((prev) => Math.max(1, prev - 1))}
                      className="h-8 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5" /> Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          totalOrderPages > 7 &&
                          Math.abs(pageNum - orderCurrentPage) > 2 &&
                          pageNum !== 1 &&
                          pageNum !== totalOrderPages
                        ) {
                          if (pageNum === 2 || pageNum === totalOrderPages - 1) {
                            return (
                              <span key={pageNum} className="px-1 text-muted-foreground">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setOrderCurrentPage(pageNum)}
                            className={`size-8 text-xs font-sans tabular-nums rounded border transition-colors ${
                              orderCurrentPage === pageNum
                                ? "bg-gold border-gold text-primary-foreground font-bold shadow-xs"
                                : "bg-background border-border text-foreground hover:bg-secondary"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={orderCurrentPage >= totalOrderPages}
                      onClick={() => setOrderCurrentPage((prev) => Math.min(totalOrderPages, prev + 1))}
                      className="h-8 px-2.5 text-xs inline-flex items-center gap-1 disabled:opacity-40"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- TAB: CUSTOMERS ----------------- */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            {/* Header + Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-5">
                <span className="text-sm font-medium text-muted-foreground">Total Customers</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {customersList.length}
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  Buyer accounts recorded from orders
                </span>
              </div>
              <div className="bg-card border border-border p-5">
                <span className="text-sm font-medium text-muted-foreground">Total Orders Placed</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-primary mt-2 tabular-nums">
                  {orders.length} orders
                </div>
                <span className="text-xs text-primary font-medium mt-1.5 block">
                  Across all customer profiles
                </span>
              </div>
              <div className="bg-card border border-border p-5">
                <span className="text-sm font-medium text-muted-foreground">Customer Lifetime Value</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-gold mt-2 tabular-nums">
                  {money(totalRevenue)}
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  Total revenue collected from buyers
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, phone, city…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-8 text-xs h-9 rounded-none border-border"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Showing {filteredCustomers.length} of {customersList.length} customer records
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Customer Name</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Contact Info</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Delivery Address</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Total Orders</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Total Spent</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Last Order Date</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomers.map((c) => {
                      const hasCancelled = orders.some(
                        (o) =>
                          (o.customerEmail?.toLowerCase() === c.email?.toLowerCase() ||
                            (c.phone &&
                              o.customerPhone &&
                              o.customerPhone.replace(/\D/g, "") === c.phone.replace(/\D/g, ""))) &&
                          o.status === "Cancelled",
                      );

                      return (
                        <tr
                          key={c.id || c.email}
                          className={
                            hasCancelled
                              ? "bg-red-500/10 dark:bg-red-950/35 border-l-4 border-l-red-600 hover:bg-red-500/15 transition-colors"
                              : "hover:bg-secondary/20 transition-colors"
                          }
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`size-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                  hasCancelled ? "bg-red-600 text-white" : "bg-primary/10 text-primary"
                                }`}
                              >
                                {c.name ? c.name.charAt(0) : "C"}
                              </div>
                              <div>
                                <div
                                  className={`font-medium flex items-center gap-1.5 ${
                                    hasCancelled ? "text-red-700 dark:text-red-300 font-bold" : "text-foreground"
                                  }`}
                                >
                                  <span>{c.name}</span>
                                  {hasCancelled && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-600 text-white font-bold uppercase tracking-wide">
                                      Cancelled Order
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {c.id || "CUST-ACT"}
                                </span>
                              </div>
                            </div>
                          </td>
                        <td className="p-3.5">
                          <div className="text-xs text-foreground flex items-center gap-1">
                            <Mail className="size-3 text-muted-foreground shrink-0" />
                            <span>{c.email}</span>
                          </div>
                          <div className="text-xs font-sans tabular-nums text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground shrink-0" />
                            <span>{c.phone || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 max-w-xs text-xs text-muted-foreground">
                          <p className="line-clamp-2 leading-relaxed">
                            {c.address || "Chennai, Tamil Nadu"}
                          </p>
                        </td>
                        <td className="p-3.5 font-sans font-bold tabular-nums text-sm text-foreground">
                          {c.ordersCount || 1} order(s)
                        </td>
                        <td className="p-3.5 font-sans font-bold tabular-nums text-sm text-primary">
                          {money(c.totalSpent || 0)}
                        </td>
                        <td className="p-3.5 font-sans tabular-nums text-xs text-muted-foreground">
                          {c.lastOrderDate || "Recent"}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Customer Details */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              title="View Customer Profile & Orders"
                              className="h-8 px-2.5 text-xs text-foreground hover:text-primary hover:border-primary/40 cursor-pointer"
                              onClick={() => setViewingCustomer(c)}
                            >
                              <Eye className="size-3.5 mr-1 text-[#D15608]" /> View
                            </Button>

                            {/* Edit Customer */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              title="Edit Customer"
                              className="h-8 px-2.5 text-xs text-foreground hover:text-amber-600 hover:border-amber-500/40 cursor-pointer"
                              onClick={() => {
                                setEditingCustomer(c);
                                setEditCustomerForm({
                                  name: c.name || "",
                                  email: c.email || "",
                                  phone: c.phone || "",
                                  address: c.address || "",
                                });
                              }}
                            >
                              <Edit className="size-3.5 mr-1 text-amber-600" /> Edit
                            </Button>

                            {/* Delete Customer */}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              title="Delete Customer"
                              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:border-destructive/40 cursor-pointer"
                              onClick={() => setDeletingCustomer(c)}
                            >
                              <Trash2 className="size-3.5 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                          No customer records found matching your search. Customer details will appear automatically when orders are placed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: SALES & REPORTS ----------------- */}
        {activeTab === "sales" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border p-6">
                <span className="text-sm font-medium text-muted-foreground">Completed Revenue (Paid)</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-primary mt-2 tabular-nums">
                  {money(totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Strict accounting rule: only verified, paid orders are counted toward revenue.
                </p>
              </div>

              <div className="bg-card border border-border p-6">
                <span className="text-sm font-medium text-muted-foreground">Paid Order Count</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {orders.filter((o) => o.paymentStatus === "Paid").length}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Out of {orders.length} total orders recorded.
                </p>
              </div>

              <div className="bg-card border border-border p-6">
                <span className="text-sm font-medium text-muted-foreground">Average Order Value</span>
                <div className="font-sans font-bold text-3xl tracking-tight text-gold mt-2 tabular-nums">
                  {money(
                    Math.round(
                      totalRevenue / (orders.filter((o) => o.paymentStatus === "Paid").length || 1),
                    ),
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Average spend per completed transaction.
                </p>
              </div>
            </div>

            {/* Category sales contribution */}
            <div className="bg-card border border-border p-6">
              <h2 className="font-display text-lg font-medium mb-1">
                Product Category Performance
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                Overview of product performance across major textile categories
              </p>

              <div className="space-y-4">
                {[
                  { name: "Saree & Silk Edit", share: "40%", revenue: 9700 },
                  { name: "Chudithar & Sets", share: "25%", revenue: 6540 },
                  { name: "Coordset & 2piece", share: "20%", revenue: 5096 },
                  { name: "Maxi, Nighty & Combo Dresses", share: "15%", revenue: 4198 },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="font-sans tabular-nums text-muted-foreground">
                        {money(cat.revenue)} ({cat.share})
                      </span>
                    </div>
                    <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: cat.share }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-secondary/60 border border-border text-xs text-muted-foreground space-y-1">
              <div className="font-medium text-foreground">Stage A Analytics Notice:</div>
              <p>
                Sales metrics above reflect active development sample orders. When Stage B connects
                to the server-side commerce service, real-time Stripe/Razorpay webhook updates and
                SQL date-aggregations will feed directly into these reports.
              </p>
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: SETTINGS ----------------- */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-8">
            <div className="bg-card border border-border p-6 sm:p-8">
              <h2 className="font-display text-xl font-medium mb-1">Administrator Credentials</h2>
              <p className="text-xs text-muted-foreground mb-6">
                Update your portal login email address and master password.
              </p>

              {settingsMessage && (
                <div
                  className={`mb-6 p-3.5 text-xs flex items-start gap-2.5 ${
                    settingsMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-destructive/10 border border-destructive/20 text-destructive"
                  }`}
                >
                  {settingsMessage.type === "success" ? (
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                  )}
                  <span>{settingsMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSettingsSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="curr-pass" className="text-xs font-medium text-foreground">
                    Current Password *
                  </label>
                  <Input
                    id="curr-pass"
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Enter current password to authorize changes"
                    className="rounded-none border-border text-xs h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Required before any security modifications can be made.
                  </p>
                </div>

                <div className="pt-2 border-t border-border space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="new-email" className="text-xs font-medium text-foreground">
                      New Admin Email Address
                    </label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder={user?.email || "admin@gmail.com"}
                      className="rounded-none border-border text-xs h-9"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Current login email:{" "}
                      <strong className="text-foreground">{user?.email}</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="new-pass" className="text-xs font-medium text-foreground">
                        New Password *
                      </label>
                      <Input
                        id="new-pass"
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="rounded-none border-border text-xs h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirm-pass" className="text-xs font-medium text-foreground">
                        Confirm New Password *
                      </label>
                      <Input
                        id="confirm-pass"
                        type="password"
                        required
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        className="rounded-none border-border text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button type="submit" variant="editorial">
                    Save New Credentials
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-3.5 mr-1.5" /> Sign Out
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ----------------- TAB: HOME PAGE CONTENT ----------------- */}
        {activeTab === "home-content" && (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border">
              <div>
                <h2 className="font-display text-xl font-semibold">Home Page Content Management</h2>
                <p className="text-xs text-muted-foreground">
                  Update headlines, hero typography, announcement bar, and craft storytelling on the homepage.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={handleResetContent}
                >
                  <RotateCcw className="size-3.5 mr-1.5" /> Reset Defaults
                </Button>
                <Button
                  type="submit"
                  form="home-content-form"
                  variant="editorial"
                  size="sm"
                  className="text-xs"
                >
                  Save Home Content
                </Button>
              </div>
            </div>

            {contentStatusMsg?.page === "home" && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{contentStatusMsg.text}</span>
              </div>
            )}

            <form id="home-content-form" onSubmit={handleSaveHomeContent} className="space-y-6">
              {/* Card 1: Top Announcement Bar */}
              <div className="bg-card border border-border p-5 space-y-3">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                    <Sparkles className="size-4 text-gold" /> Announcement Bar
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    The top thin announcement banner shown on all pages.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Banner Text</label>
                  <Input
                    required
                    value={homeDraft.announcementText}
                    onChange={(e) => setHomeDraft({ ...homeDraft, announcementText: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Card: Hero Carousel Banners */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                      <ImageIcon className="size-4 text-primary" /> Hero Carousel Banner Slides
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Upload and manage the full-width banners in the top carousel. You can add new promotional banners or replace existing slides.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentBanners = homeDraft.heroBanners || DEFAULT_HERO_BANNERS;
                      const newBanner: HeroBannerSlide = {
                        id: `banner-${Date.now()}`,
                        image: "/hero-banner-1.jpg",
                        alt: "Padmanabha Fabrics - New Collection Banner",
                        href: "/shop",
                      };
                      const newHome = {
                        ...homeDraft,
                        heroBanners: [...currentBanners, newBanner],
                      };
                      setHomeDraft(newHome);
                      updateHomeContent(newHome);
                      toast.success("New banner slide added and synced live!");
                    }}
                    className="text-xs h-8 gap-1.5 shrink-0"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Banner Slide</span>
                  </Button>
                </div>

                <div className="space-y-3.5">
                  {(homeDraft.heroBanners || DEFAULT_HERO_BANNERS).map((banner, index) => (
                    <div
                      key={banner.id || index}
                      className="p-3.5 border border-border rounded-lg bg-background/50 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                      <div className="relative w-full sm:w-44 aspect-[2/1] rounded overflow-hidden border border-border shrink-0 bg-muted/40">
                        <img
                          src={banner.image}
                          alt={banner.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-medium text-[11px] text-muted-foreground">
                            Banner Description / Alt Text
                          </label>
                          <Input
                            value={banner.alt}
                            onChange={(e) => {
                              const updated = [...(homeDraft.heroBanners || DEFAULT_HERO_BANNERS)];
                              updated[index] = { ...updated[index], alt: e.target.value };
                              const newHome = { ...homeDraft, heroBanners: updated };
                              setHomeDraft(newHome);
                              updateHomeContent(newHome);
                            }}
                            placeholder="Banner title or description"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-medium text-[11px] text-muted-foreground">
                            Redirect Link on Click
                          </label>
                          <Input
                            value={banner.href}
                            onChange={(e) => {
                              const updated = [...(homeDraft.heroBanners || DEFAULT_HERO_BANNERS)];
                              updated[index] = { ...updated[index], href: e.target.value };
                              const newHome = { ...homeDraft, heroBanners: updated };
                              setHomeDraft(newHome);
                              updateHomeContent(newHome);
                            }}
                            placeholder="/shop or /shop?category=Saree"
                            className="text-xs h-8"
                          />
                        </div>

                        <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border hover:bg-muted text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs">
                            <Upload className="size-3 text-primary" />
                            <span>{isUploadingHomeMedia ? "Uploading..." : "Upload New Banner Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingHomeMedia}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUploadHomeMedia(file, "padma_banners", (url) => {
                                    const updated = [...(homeDraft.heroBanners || DEFAULT_HERO_BANNERS)];
                                    updated[index] = { ...updated[index], image: url };
                                    const newHome = { ...homeDraft, heroBanners: updated };
                                    setHomeDraft(newHome);
                                    updateHomeContent(newHome);
                                  });
                                }
                              }}
                            />
                          </label>

                          <span className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={banner.image}>
                            {banner.image}
                          </span>

                          {(homeDraft.heroBanners || DEFAULT_HERO_BANNERS).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = (homeDraft.heroBanners || DEFAULT_HERO_BANNERS).filter((_, i) => i !== index);
                                const newHome = { ...homeDraft, heroBanners: updated };
                                setHomeDraft(newHome);
                                updateHomeContent(newHome);
                                toast.success("Banner slide removed!");
                              }}
                              className="ml-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 text-xs px-2"
                            >
                              <Trash2 className="size-3 mr-1" />
                              <span>Remove Slide</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Popular Categories Section */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                      <Sparkles className="size-4 text-gold" /> Popular Categories (Home Section 6)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Change the category name and photo for each tile shown in the Popular Categories section.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentCats = homeDraft.popularCategories || DEFAULT_POPULAR_CATEGORIES;
                      const newCat: PopularCategoryItem = {
                        id: `cat-${Date.now()}`,
                        title: "NEW CATEGORY",
                        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
                        href: "/shop",
                      };
                      const newHome = {
                        ...homeDraft,
                        popularCategories: [...currentCats, newCat],
                      };
                      setHomeDraft(newHome);
                      updateHomeContent(newHome);
                      toast.success("New category added and synced live!");
                    }}
                    className="text-xs h-8 gap-1.5 shrink-0"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Category</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(homeDraft.popularCategories || DEFAULT_POPULAR_CATEGORIES).map((cat, index) => (
                    <div
                      key={cat.id || index}
                      className="p-3 border border-border rounded-lg bg-background/50 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Category Name
                          </label>
                          <Input
                            value={cat.title}
                            onChange={(e) => {
                              const updated = [...(homeDraft.popularCategories || DEFAULT_POPULAR_CATEGORIES)];
                              const upper = e.target.value.toUpperCase();
                              updated[index] = {
                                ...updated[index],
                                title: upper,
                                href: `/shop?category=${encodeURIComponent(upper)}`,
                              };
                              const newHome = { ...homeDraft, popularCategories: updated };
                              setHomeDraft(newHome);
                              updateHomeContent(newHome);
                            }}
                            placeholder="e.g. SAREE"
                            className="text-xs h-8 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-muted text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs">
                          <Upload className="size-3 text-primary" />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingHomeMedia}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadHomeMedia(file, "padma_categories", (url) => {
                                  const updated = [...(homeDraft.popularCategories || DEFAULT_POPULAR_CATEGORIES)];
                                  updated[index] = { ...updated[index], image: url };
                                  const newHome = { ...homeDraft, popularCategories: updated };
                                  setHomeDraft(newHome);
                                  updateHomeContent(newHome);
                                });
                              }
                            }}
                          />
                        </label>

                        {(homeDraft.popularCategories || DEFAULT_POPULAR_CATEGORIES).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (homeDraft.popularCategories || DEFAULT_POPULAR_CATEGORIES).filter((_, i) => i !== index);
                              const newHome = { ...homeDraft, popularCategories: updated };
                              setHomeDraft(newHome);
                              updateHomeContent(newHome);
                              toast.success("Category removed!");
                            }}
                            className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card: Our Bestsellers Round Category Strip */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                      <Sparkles className="size-4 text-gold" /> Our Bestsellers Category Strip (Home Section 7)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Change the round circular thumbnail photo and label name for each category in the Bestseller bar.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentTabs = homeDraft.bestsellerTabs || DEFAULT_BESTSELLER_TABS;
                      const newTab: BestsellerCategoryTabItem = {
                        id: `tab-${Date.now()}`,
                        label: "NEW CATEGORY",
                        categoryKey: "New Category",
                        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
                      };
                      const newHome = {
                        ...homeDraft,
                        bestsellerTabs: [...currentTabs, newTab],
                      };
                      setHomeDraft(newHome);
                      updateHomeContent(newHome);
                      toast.success("New bestseller category tab added and synced live!");
                    }}
                    className="text-xs h-8 gap-1.5 shrink-0"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Category Tab</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(homeDraft.bestsellerTabs || DEFAULT_BESTSELLER_TABS).map((tab, index) => (
                    <div
                      key={tab.id || index}
                      className="p-3 border border-border rounded-lg bg-background/50 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-16 rounded-full overflow-hidden border-2 border-[#D0202B]/60 p-0.5 shrink-0 bg-muted">
                          <img
                            src={tab.image}
                            alt={tab.label}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                            Tab Label Name
                          </label>
                          <Input
                            value={tab.label}
                            onChange={(e) => {
                              const updated = [...(homeDraft.bestsellerTabs || DEFAULT_BESTSELLER_TABS)];
                              const val = e.target.value.toUpperCase();
                              updated[index] = { ...updated[index], label: val, categoryKey: val };
                              const newHome = { ...homeDraft, bestsellerTabs: updated };
                              setHomeDraft(newHome);
                              updateHomeContent(newHome);
                            }}
                            placeholder="e.g. CHUDITHAR TOP"
                            className="text-xs h-8 font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:bg-muted text-[11px] font-semibold cursor-pointer transition-colors shadow-2xs">
                          <Upload className="size-3 text-primary" />
                          <span>Change Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingHomeMedia}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadHomeMedia(file, "padma_categories", (url) => {
                                  const updated = [...(homeDraft.bestsellerTabs || DEFAULT_BESTSELLER_TABS)];
                                  updated[index] = { ...updated[index], image: url };
                                  const newHome = { ...homeDraft, bestsellerTabs: updated };
                                  setHomeDraft(newHome);
                                  updateHomeContent(newHome);
                                });
                              }
                            }}
                          />
                        </label>

                        {(homeDraft.bestsellerTabs || DEFAULT_BESTSELLER_TABS).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (homeDraft.bestsellerTabs || DEFAULT_BESTSELLER_TABS).filter((_, i) => i !== index);
                              const newHome = { ...homeDraft, bestsellerTabs: updated };
                              setHomeDraft(newHome);
                              updateHomeContent(newHome);
                              toast.success("Category tab removed!");
                            }}
                            className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                            title="Delete Tab"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Hero Section */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                    <Globe className="size-4 text-primary" /> Hero Banner & Main Headings
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Primary welcoming statement and introductory copy on the homepage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Hero Kicker / Sub-badge</label>
                    <Input
                      value={homeDraft.heroKicker}
                      onChange={(e) => setHomeDraft({ ...homeDraft, heroKicker: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Hero Bottom Tagline</label>
                    <Input
                      value={homeDraft.heroBottomText}
                      onChange={(e) => setHomeDraft({ ...homeDraft, heroBottomText: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Main Hero Headline (H1)</label>
                  <Input
                    required
                    value={homeDraft.heroTitle}
                    onChange={(e) => setHomeDraft({ ...homeDraft, heroTitle: e.target.value })}
                    className="text-xs h-9 font-display text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Hero Subtitle Paragraph</label>
                  <Textarea
                    rows={3}
                    value={homeDraft.heroSubtitle}
                    onChange={(e) => setHomeDraft({ ...homeDraft, heroSubtitle: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              {/* Card 3: Why Choose Section */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground">
                    "Why Choose Us" Section
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Highlights the brand's heritage craftsmanship and sourcing value.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Section Title</label>
                  <Input
                    value={homeDraft.whyChooseTitle}
                    onChange={(e) => setHomeDraft({ ...homeDraft, whyChooseTitle: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Section Description</label>
                  <Textarea
                    rows={2}
                    value={homeDraft.whyChooseDesc}
                    onChange={(e) => setHomeDraft({ ...homeDraft, whyChooseDesc: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              {/* Card 4: Inspiration Section */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground">
                    Fabric Inspiration & Craft Section
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Text above the craft inspiration gallery.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Section Title</label>
                  <Input
                    value={homeDraft.inspirationTitle}
                    onChange={(e) => setHomeDraft({ ...homeDraft, inspirationTitle: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Section Description</label>
                  <Textarea
                    rows={2}
                    value={homeDraft.inspirationDesc}
                    onChange={(e) => setHomeDraft({ ...homeDraft, inspirationDesc: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="editorial">
                  Save Changes to Home Page
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------- TAB: ABOUT PAGE CONTENT ----------------- */}
        {activeTab === "about-content" && (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border">
              <div>
                <h2 className="font-display text-xl font-semibold">About Page Content Management</h2>
                <p className="text-xs text-muted-foreground">
                  Update brand history, showroom narrative, and textile heritage story.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={handleResetContent}
                >
                  <RotateCcw className="size-3.5 mr-1.5" /> Reset Defaults
                </Button>
                <Button
                  type="submit"
                  form="about-content-form"
                  variant="editorial"
                  size="sm"
                  className="text-xs"
                >
                  Save About Content
                </Button>
              </div>
            </div>

            {contentStatusMsg?.page === "about" && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{contentStatusMsg.text}</span>
              </div>
            )}

            <form id="about-content-form" onSubmit={handleSaveAboutContent} className="space-y-6">
              {/* Card 1: Page Header */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-primary" /> About Header Section
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Top banner title and introduction of the About page.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Header Kicker / Tag</label>
                  <Input
                    value={aboutDraft.headerKicker}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, headerKicker: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Header Main Title</label>
                  <Input
                    required
                    value={aboutDraft.headerTitle}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, headerTitle: e.target.value })}
                    className="text-xs h-9 font-display text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Header Description</label>
                  <Textarea
                    rows={3}
                    value={aboutDraft.headerDesc}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, headerDesc: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              {/* Card 2: Story Section */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground">
                    The Story & Textile Connection
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Narrative detailing Chennai roots, personal touch, and customer care.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Story Kicker</label>
                    <Input
                      value={aboutDraft.storyKicker}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, storyKicker: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Story Title</label>
                    <Input
                      value={aboutDraft.storyTitle}
                      onChange={(e) => setAboutDraft({ ...aboutDraft, storyTitle: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Story Paragraph 1</label>
                  <Textarea
                    rows={3}
                    value={aboutDraft.storyParagraph1}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, storyParagraph1: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Story Paragraph 2</label>
                  <Textarea
                    rows={3}
                    value={aboutDraft.storyParagraph2}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, storyParagraph2: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Showroom Location Note</label>
                  <Input
                    value={aboutDraft.storeAddressNote}
                    onChange={(e) => setAboutDraft({ ...aboutDraft, storeAddressNote: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                {/* Physical Store Photo Verification */}
                <div className="p-3.5 bg-secondary/30 border border-border flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={storeImg}
                    alt="Padmanabha Fabrics Store Ambattur"
                    className="w-36 h-24 object-cover border border-border shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      Official Physical Storefront
                    </span>
                    <h4 className="text-sm font-medium text-foreground mt-0.5">
                      Padmanabha Fabrics Showroom — Ambattur, Chennai
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      This verified physical store building photograph is displayed live across your website’s Home, About, and Contact pages, giving customers authentic confidence in your brick-and-mortar presence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="editorial">
                  Save Changes to About Page
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------- TAB: CONTACT PAGE CONTENT ----------------- */}
        {activeTab === "contact-content" && (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card border border-border">
              <div>
                <h2 className="font-display text-xl font-semibold">Contact Page Content Management</h2>
                <p className="text-xs text-muted-foreground">
                  Update showroom location, telephone lines, email address, and Google Maps link.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={handleResetContent}
                >
                  <RotateCcw className="size-3.5 mr-1.5" /> Reset Defaults
                </Button>
                <Button
                  type="submit"
                  form="contact-content-form"
                  variant="editorial"
                  size="sm"
                  className="text-xs"
                >
                  Save Contact Content
                </Button>
              </div>
            </div>

            {contentStatusMsg?.page === "contact" && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{contentStatusMsg.text}</span>
              </div>
            )}

            <form id="contact-content-form" onSubmit={handleSaveContactContent} className="space-y-6">
              {/* Card 1: Page Header */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                    <Phone className="size-4 text-primary" /> Contact Header Section
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Introductory header for customer and wholesale enquiries.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Header Kicker</label>
                    <Input
                      value={contactDraft.headerKicker}
                      onChange={(e) => setContactDraft({ ...contactDraft, headerKicker: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Header Title</label>
                    <Input
                      required
                      value={contactDraft.headerTitle}
                      onChange={(e) => setContactDraft({ ...contactDraft, headerTitle: e.target.value })}
                      className="text-xs h-9 font-display text-base"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Header Description</label>
                  <Textarea
                    rows={2}
                    value={contactDraft.headerDesc}
                    onChange={(e) => setContactDraft({ ...contactDraft, headerDesc: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              {/* Card 2: Showroom & Contact Information */}
              <div className="bg-card border border-border p-5 space-y-4">
                <div className="border-b border-border pb-2.5">
                  <h3 className="font-medium text-sm text-foreground">
                    Ambattur Showroom Details & Communication Lines
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Physical location, direct phones, email and Google Maps link.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Showroom / Business Name</label>
                  <Input
                    required
                    value={contactDraft.showroomName}
                    onChange={(e) => setContactDraft({ ...contactDraft, showroomName: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Showroom Address</label>
                  <Textarea
                    rows={2}
                    required
                    value={contactDraft.showroomAddress}
                    onChange={(e) => setContactDraft({ ...contactDraft, showroomAddress: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Primary Phone Number</label>
                    <Input
                      required
                      value={contactDraft.phonePrimary}
                      onChange={(e) => setContactDraft({ ...contactDraft, phonePrimary: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Secondary / WhatsApp Phone Number</label>
                    <Input
                      value={contactDraft.phoneSecondary}
                      onChange={(e) => setContactDraft({ ...contactDraft, phoneSecondary: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Contact Email</label>
                    <Input
                      type="email"
                      required
                      value={contactDraft.email}
                      onChange={(e) => setContactDraft({ ...contactDraft, email: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Google Maps Link</label>
                    <Input
                      value={contactDraft.mapsUrl}
                      onChange={(e) => setContactDraft({ ...contactDraft, mapsUrl: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Business Scope & Wholesale Notice</label>
                  <Textarea
                    rows={2}
                    value={contactDraft.businessScope}
                    onChange={(e) => setContactDraft({ ...contactDraft, businessScope: e.target.value })}
                    className="text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="editorial">
                  Save Changes to Contact Page
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ----------------- MODAL: ADD / EDIT PRODUCT ----------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h2 className="font-display text-xl font-medium">
                {editingProduct ? "Edit Product Details" : "Add New Catalog Fabric / Apparel"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setIsProductModalOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Royal Blue Zari Silk Saree"
                  className="rounded-none text-sm h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Category</label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCatName("");
                        setNewCatDesc("");
                        setIsCategoryModalOpen(true);
                      }}
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5"
                    >
                      <Plus className="size-3" /> New
                    </button>
                  </div>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-background border border-border"
                  >
                    {activeCategoriesList
                      .filter((c) => c !== ALL)
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Colour</label>
                  <Input
                    required
                    value={prodColour}
                    onChange={(e) => setProdColour(e.target.value)}
                    placeholder="e.g. Royal Blue & Gold"
                    className="rounded-none text-sm h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Price (₹) *</label>
                  <Input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="4500"
                    className="rounded-none text-sm h-10 font-sans tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-background border border-border"
                  >
                    <option value="piece">piece</option>
                    <option value="metre">metre</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Pieces in Stock *</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="e.g. 10"
                    className="rounded-none text-sm h-10 font-sans tabular-nums"
                  />
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Enter number of pieces in stock
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Badge Label</label>
                  <Input
                    value={prodBadge}
                    onChange={(e) => setProdBadge(e.target.value)}
                    placeholder="Signature, Occasion edit…"
                    className="rounded-none text-sm h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">SKU Code</label>
                  <Input
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="PF-SAR-009"
                    className="rounded-none text-sm h-10 font-sans tabular-nums"
                  />
                </div>
              </div>

              {/* 1. Product Size Options (S to 6XL) */}
              <div className="space-y-2.5 p-3.5 bg-secondary/15 border border-border rounded-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-border/50">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <span>Available Sizes (S to 6XL) *</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Select which garment sizes are available in stock
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setProdSizes([...AVAILABLE_SIZES])}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      All (S-6XL)
                    </button>
                    <span className="text-muted-foreground/40">·</span>
                    <button
                      type="button"
                      onClick={() => setProdSizes(["S", "M", "L", "XL", "2XL"])}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      S to 2XL
                    </button>
                    <span className="text-muted-foreground/40">·</span>
                    <button
                      type="button"
                      onClick={() => setProdSizes([])}
                      className="text-[11px] font-medium text-destructive hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-1">
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSelected = prodSizes.includes(sz) || (sz === "2XL" && prodSizes.includes("XXL"));
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`h-9 px-1 rounded-xs text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-0.5 border ${
                          isSelected
                            ? "bg-[#D15608] text-white border-[#D15608] shadow-xs ring-2 ring-[#D15608]/30 font-bold scale-[1.02]"
                            : "bg-background text-foreground/80 border-border hover:border-foreground/40 hover:bg-muted/40"
                        }`}
                        title={isSelected ? `Size ${sz} (Selected - click to remove)` : `Size ${sz} (Click to select)`}
                      >
                        {isSelected && <Check className="size-3 stroke-[2.5]" />}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>
                    {prodSizes.length > 0 ? (
                      <>
                        <span className="text-foreground font-semibold">
                          {prodSizes.length} {prodSizes.length === 1 ? "size" : "sizes"} enabled:
                        </span>{" "}
                        <span className="font-mono text-primary font-bold">
                          {prodSizes.join(", ")}
                        </span>
                      </>
                    ) : (
                      <span className="italic text-muted-foreground/80">
                        No sizes selected (sold as free size drape or metre-cut fabric)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* 2. Colour Variants Management Section */}
              <div className="space-y-3 p-3.5 bg-secondary/15 border border-border rounded-sm">
                {/* Hidden file input for quick-add colour variant photo */}
                <input
                  type="file"
                  ref={variantFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadVariantImageFile(f, null);
                    e.target.value = "";
                  }}
                  className="hidden"
                />

                {/* Hidden file input for existing variant row photo upload */}
                <input
                  type="file"
                  ref={variantRowFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadVariantImageFile(f, targetVariantIndexForUpload);
                    e.target.value = "";
                  }}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <span>Colour Variants & Variant Stock</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Add multiple colours (Rani Pink, Teal Blue, Bottle Green, etc.) with custom price, stock & photo
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {prodVariants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Remove all colour variants?")) {
                            setProdVariants([]);
                            toast.success("All variants removed");
                          }
                        }}
                        className="text-[11px] text-destructive hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {prodVariants.length} {prodVariants.length === 1 ? "variant" : "variants"}
                    </span>
                  </div>
                </div>

                {/* Variant Quick-Add Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 bg-card border border-border rounded-xs items-end">
                  {/* Colour Name: 3 cols */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-medium text-foreground">Colour Name</label>
                    <Input
                      value={variantColourInput}
                      onChange={(e) => setVariantColourInput(e.target.value)}
                      placeholder="e.g. Rani Pink"
                      className="h-8 text-xs rounded-none"
                    />
                  </div>

                  {/* Swatch Colour: 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-foreground">Swatch Colour</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={variantHexInput}
                        onChange={(e) => setVariantHexInput(e.target.value)}
                        className="size-8 p-0 border border-border rounded cursor-pointer shrink-0"
                        title="Pick swatch colour"
                      />
                      <Input
                        value={variantHexInput}
                        onChange={(e) => setVariantHexInput(e.target.value)}
                        className="h-8 text-xs font-mono rounded-none uppercase"
                        placeholder="#D81B60"
                      />
                    </div>
                  </div>

                  {/* Price Override: 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-foreground">Price Override (₹)</label>
                    <Input
                      type="number"
                      value={variantPriceInput}
                      onChange={(e) => setVariantPriceInput(e.target.value)}
                      placeholder={prodPrice || "Default"}
                      className="h-8 text-xs rounded-none tabular-nums"
                    />
                  </div>

                  {/* Stock Qty: 2 cols */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-medium text-foreground">Stock Qty</label>
                    <Input
                      type="number"
                      min="0"
                      value={variantStockInput}
                      onChange={(e) => setVariantStockInput(Math.max(0, parseInt(e.target.value || "0", 10)).toString())}
                      placeholder="10"
                      className="h-8 text-xs rounded-none tabular-nums"
                    />
                  </div>

                  {/* Variant Photo & Add Button: 3 cols */}
                  <div className="sm:col-span-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-foreground">Colour Photo</label>
                      {variantImageInput && (
                        <button
                          type="button"
                          onClick={() => setVariantImageInput("")}
                          className="text-[10px] text-destructive hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {variantImageInput ? (
                        <div className="relative size-8 rounded overflow-hidden border border-border shrink-0 bg-muted">
                          <img src={variantImageInput} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingVariantImage}
                        onClick={() => variantFileInputRef.current?.click()}
                        className="h-8 text-xs px-2 flex-1 border-dashed hover:border-primary truncate cursor-pointer"
                        title="Upload photo for this colour variant"
                      >
                        <Upload className="size-3 mr-1 shrink-0" />
                        <span className="truncate">
                          {isUploadingVariantImage ? "Uploading..." : variantImageInput ? "Change" : "Add Photo"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddColourVariant}
                        size="sm"
                        variant="editorial"
                        className="h-8 text-xs px-3 shrink-0"
                      >
                        <Plus className="size-3.5 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Configured Variants Table */}
                {prodVariants.length > 0 ? (
                  <div className="border border-border rounded-xs overflow-hidden bg-card">
                    <div className="divide-y divide-border/60">
                      {prodVariants.map((v, vIdx) => {
                        const variantPhoto = v.image || v.images?.[0];
                        return (
                          <div key={vIdx} className="flex flex-wrap items-center justify-between p-2.5 text-xs hover:bg-muted/30 gap-2">
                            <div className="flex items-center gap-2.5">
                              {/* Variant Image Thumbnail */}
                              {variantPhoto ? (
                                <div className="relative group size-9 rounded overflow-hidden border border-border shrink-0 bg-muted">
                                  <img
                                    src={variantPhoto}
                                    alt={v.colour}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTargetVariantIndexForUpload(vIdx);
                                      variantRowFileInputRef.current?.click();
                                    }}
                                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] cursor-pointer"
                                    title="Change image for this colour"
                                  >
                                    <Camera className="size-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTargetVariantIndexForUpload(vIdx);
                                    variantRowFileInputRef.current?.click();
                                  }}
                                  className="size-9 rounded border border-dashed border-border hover:border-primary flex flex-col items-center justify-center text-[9px] text-muted-foreground hover:text-primary transition-colors shrink-0 bg-background cursor-pointer"
                                  title="Upload photo for this colour variant"
                                >
                                  <Upload className="size-3" />
                                  <span>Photo</span>
                                </button>
                              )}

                              <span
                                className="size-4 rounded-full border border-black/20 shadow-2xs shrink-0"
                                style={{ backgroundColor: v.colourHex || "#9F160A" }}
                              />
                              <div>
                                <span className="font-semibold text-foreground block">{v.colour}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {v.colourHex}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-muted-foreground">
                                Price: <span className="font-semibold text-foreground">{v.price ? `₹${v.price}` : "Default"}</span>
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Stock: <span className="font-semibold text-foreground">{v.stock ?? 10} pcs</span>
                              </span>

                              {/* Upload/Change Photo Button */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] px-2.5 py-0 border-border text-foreground hover:bg-muted cursor-pointer font-medium"
                                onClick={() => {
                                  setTargetVariantIndexForUpload(vIdx);
                                  variantRowFileInputRef.current?.click();
                                }}
                                title="Upload or change image for this colour"
                              >
                                <ImageIcon className="size-3 mr-1 text-primary" />
                                {variantPhoto ? "Change Photo" : "+ Add Photo"}
                              </Button>

                              {/* Delete Variant Button with clear label and icon */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] px-2.5 py-0 border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-colors cursor-pointer font-medium shadow-2xs"
                                onClick={() => handleRemoveColourVariant(vIdx, v.colour)}
                                title={`Delete "${v.colour}" variant`}
                              >
                                <Trash2 className="size-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground italic">
                    No extra colour variants added yet. Product will use the primary colour above ({prodColour || "Custom"}).
                  </p>
                )}
              </div>

              {/* 3. Product Gallery & Multi-Angle Photos */}
              <div
                className="space-y-3 p-3.5 bg-secondary/15 border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-[#D15608]/40"
                tabIndex={0}
                onPaste={handleGalleryPaste}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <ImageIcon className="size-3.5 text-primary" />
                      <span>Product Gallery & Angles (Front, Back, Side, Close-up)</span>
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Upload or paste (Ctrl+V) multi-angle photos. First image is used as the primary cover.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1.5 border-dashed border-[#D15608]/70 text-[#D15608] hover:bg-[#D15608]/10 cursor-pointer"
                      onClick={handlePasteImageFromClipboard}
                      disabled={isUploadingImage}
                      title="Paste image directly from clipboard (Ctrl+V)"
                    >
                      <Clipboard className="size-3.5" />
                      <span>Paste Image (Ctrl+V)</span>
                    </Button>
                    <Button
                      type="button"
                      variant="editorial"
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1.5 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      <Upload className="size-3.5" />
                      <span>{isUploadingImage ? "Optimizing…" : "Upload Photo"}</span>
                    </Button>
                  </div>
                </div>

                {/* Gallery Cards Grid */}
                {prodImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {prodImages.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className={`relative group bg-card border rounded-xs overflow-hidden shadow-2xs ${
                          imgIdx === 0
                            ? "border-[#D15608] ring-2 ring-[#D15608]/30"
                            : "border-border"
                        }`}
                      >
                        <div className="aspect-3/4 w-full bg-muted overflow-hidden relative">
                          <img
                            src={imgUrl}
                            alt={`Product Angle ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />

                          {/* Cover Badge or Set As Cover button */}
                          <div className="absolute top-1.5 left-1.5">
                            {imgIdx === 0 ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#D15608] text-white rounded shadow-xs">
                                Cover
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgIdx)}
                                className="px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-black/70 hover:bg-black text-white rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                Set Cover
                              </button>
                            )}
                          </div>

                          {/* Remove photo */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(imgIdx)}
                            className="absolute top-1.5 right-1.5 size-6 rounded bg-black/70 hover:bg-destructive text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="size-3" />
                          </button>

                          {/* Rearrange order controls */}
                          <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              disabled={imgIdx === 0}
                              onClick={() => handleMoveImage(imgIdx, imgIdx - 1)}
                              className="size-6 rounded bg-black/70 hover:bg-black text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                              title="Move photo left"
                            >
                              <ChevronLeft className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={imgIdx === prodImages.length - 1}
                              onClick={() => handleMoveImage(imgIdx, imgIdx + 1)}
                              className="size-6 rounded bg-black/70 hover:bg-black text-white flex items-center justify-center disabled:opacity-20 cursor-pointer"
                              title="Move photo right"
                            >
                              <ChevronRight className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-1 text-center bg-card text-[10px] text-muted-foreground truncate">
                          Photo {imgIdx + 1} {imgIdx === 0 ? "(Primary)" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all rounded-sm p-5 text-center cursor-pointer space-y-2 group"
                  >
                    <div className="size-10 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                      <Upload className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Click to Upload Photo, or Paste (Ctrl+V) Copied Image
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Add front view, back view, side angle shots (JPG, PNG, WebP) · Copy any image and click Paste Image or press Ctrl+V
                      </p>
                    </div>
                  </div>
                )}

                {/* Add Photo by URL */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    value={manualImageInput}
                    onChange={(e) => setManualImageInput(e.target.value)}
                    placeholder="Or enter image URL path (e.g. /assets/fabric-hero.jpg or https://...)"
                    className="h-8 text-xs rounded-none font-sans"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0 cursor-pointer"
                    onClick={handleAddImageFromUrl}
                  >
                    <Plus className="size-3 mr-1" /> Add URL
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Product Description</label>
                <Textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Fabric details, weave type, occasion recommendation…"
                  className="rounded-none text-sm resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-border">
                {editingProduct ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-xs font-medium cursor-pointer"
                    onClick={() => {
                      const toDelete = editingProduct;
                      setIsProductModalOpen(false);
                      setDeleteConfirmId(toDelete.id);
                    }}
                  >
                    <Trash2 className="size-3.5 mr-1.5" />
                    Delete Dress from Store
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProductModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="editorial">
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: ADD NEW CATEGORY ----------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded">
                  <FolderPlus className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Add New Category
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Create a new apparel or fabric category
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Category Name *
                </label>
                <Input
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Kurtis, Lehengas, Silk Dupattas…"
                  className="rounded-none text-sm h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Description / Subtitle <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </label>
                <Input
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Pure handwoven dupattas and stoles"
                  className="rounded-none text-sm h-10"
                />
              </div>

              {/* Current Active Categories Preview */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Existing Categories ({activeCategoriesList.filter((c) => c !== ALL).length})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-secondary/20 border border-border rounded text-xs">
                  {activeCategoriesList
                    .filter((c) => c !== ALL)
                    .map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 bg-background border border-border rounded text-[11px] text-muted-foreground font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCategoryModalOpen(false)}
                  disabled={isSubmittingCategory}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="editorial"
                  disabled={isSubmittingCategory || !newCatName.trim()}
                >
                  {isSubmittingCategory ? "Adding Category..." : "+ Add Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: DELETE CONFIRMATION ----------------- */}
      {deleteConfirmId && (() => {
        const prod = productsList.find((p) => p.id === deleteConfirmId);
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-sm p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <Trash2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-foreground">
                    Delete Product?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Remove this dress from sale
                  </p>
                </div>
              </div>

              {prod && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 border border-border/80 rounded-xs">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-14 object-cover border border-border shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                    }}
                  />
                  <div className="text-xs min-w-0">
                    <p className="font-semibold text-foreground truncate">{prod.name}</p>
                    <p className="text-muted-foreground">{prod.category} · {money(prod.price)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {prod.sku || "PF-GEN"}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete this dress? It will be immediately removed from both the admin portal and the public shop.
              </p>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteProduct(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                >
                  Yes, Delete Dress
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ----------------- MODAL: ADJUST / ADD STOCK ----------------- */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded bg-gold/15 text-gold flex items-center justify-center">
                    <Boxes className="size-4" />
                  </div>
                  <h3 className="font-display text-lg font-medium">Add & Adjust Product Stock</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Select any product from your catalog, update its stock count, and log date automatically.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => setStockModalProduct(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 pt-4">
              {/* Automatic Today's Date Banner */}
              <div className="bg-secondary/40 border border-border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      Automatic Date Record
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      {new Date().toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-bold bg-emerald-500/15 text-emerald-600 tabular-nums">
                    {new Date().toISOString().split("T")[0]} (Today)
                  </span>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Auto-saved to history</span>
                </div>
              </div>

              {/* Product Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Product * ({productsList.length} products in catalog)
                </label>
                <select
                  value={stockModalProduct.id}
                  onChange={(e) => handleSelectStockProduct(e.target.value)}
                  className="w-full h-10 px-3 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-gold font-medium text-foreground cursor-pointer"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — [{p.category}] — Current: {p.stock} {p.unit}s
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Quick Info Card */}
              <div className="flex items-center gap-3 p-3 bg-secondary/30 border border-border">
                <img
                  src={stockModalProduct.image}
                  alt={stockModalProduct.name}
                  className="size-12 object-cover border border-border shrink-0 bg-background"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {stockModalProduct.name}
                  </h4>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{stockModalProduct.category}</span>
                    <span>•</span>
                    <span className="font-sans tabular-nums">{stockModalProduct.sku || "PF-N/A"}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase text-muted-foreground">Current Stock</div>
                  <div className="text-sm font-bold font-sans tabular-nums text-foreground">
                    {stockModalProduct.stock} {stockModalProduct.unit}s
                  </div>
                </div>
              </div>

              {/* Stock Quantity Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Stock Quantity *
                  </label>
                  <span className="text-[11px] text-muted-foreground font-sans tabular-nums">
                    Change:{" "}
                    <span
                      className={
                        Number(newStockQty || 0) >= stockModalProduct.stock
                          ? "text-emerald-600 font-bold"
                          : "text-destructive font-bold"
                      }
                    >
                      {Number(newStockQty || 0) - stockModalProduct.stock >= 0 ? "+" : ""}
                      {Number(newStockQty || 0) - stockModalProduct.stock} units
                    </span>
                  </span>
                </div>
                <Input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="rounded-none text-base h-11 font-sans tabular-nums font-bold"
                  placeholder="Enter total stock quantity"
                />
                {/* Quick Add Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground mr-1">
                    Quick Add:
                  </span>
                  {[5, 10, 25, 50, 100].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        const current = Number(newStockQty) || stockModalProduct.stock || 0;
                        setNewStockQty(String(current + inc));
                      }}
                      className="px-2 py-0.5 text-xs font-sans tabular-nums bg-secondary hover:bg-gold/20 hover:text-gold border border-border rounded transition-colors"
                    >
                      +{inc}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewStockQty(String(stockModalProduct.stock))}
                    className="px-2 py-0.5 text-xs font-sans bg-secondary hover:bg-secondary/80 border border-border rounded transition-colors text-muted-foreground ml-auto"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Reason for Adjustment */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Reason for Adjustment
                </label>
                <Input
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="e.g. Loom consignment, restock, audit"
                  className="rounded-none text-xs h-10"
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    "Fresh Loom Batch",
                    "Supplier Restock",
                    "Physical Stock Audit",
                    "Damaged / Defect",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setStockReason(r)}
                      className="text-[10px] px-2 py-0.5 bg-secondary/60 hover:bg-secondary border border-border rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStockModalProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="editorial" size="sm" className="bg-gold hover:bg-gold/90 text-primary-foreground">
                  <Check className="size-4 mr-1.5" /> Save Stock Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: VIEW STOCK DETAILS & HISTORY ----------------- */}
      {viewStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium">Product Stock Details & Movement History</h3>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive inventory status, current threshold, and historical adjustments
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => setViewStockProduct(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Product Overview Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-secondary/30 border border-border">
              <img
                src={viewStockProduct.image}
                alt={viewStockProduct.name}
                className="size-20 object-cover border border-border shrink-0 bg-background"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                }}
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-gold/15 text-gold">
                    {viewStockProduct.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      viewStockProduct.stock === 0
                        ? "bg-destructive/10 text-destructive"
                        : viewStockProduct.stock < 5
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {viewStockProduct.stock === 0 ? "Out of Stock" : viewStockProduct.stock < 5 ? "Low Stock" : "In Stock"}
                  </span>
                </div>
                <h4 className="font-display text-base font-semibold text-foreground truncate">
                  {viewStockProduct.name}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-sans tabular-nums">
                  <span>SKU: <strong className="text-foreground">{viewStockProduct.sku || "PF-N/A"}</strong></span>
                  <span>•</span>
                  <span>Price: <strong className="text-foreground">{money(viewStockProduct.price)}</strong></span>
                  <span>•</span>
                  <span>Unit: <strong className="text-foreground">{viewStockProduct.unit}s</strong></span>
                </div>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-secondary/20 border border-border">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Current Stock</div>
                <div className="text-2xl font-bold font-sans tabular-nums text-foreground mt-1">
                  {viewStockProduct.stock} {viewStockProduct.unit}s
                </div>
              </div>
              <div className="p-3 bg-secondary/20 border border-border">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Low Stock Threshold</div>
                <div className="text-2xl font-bold font-sans tabular-nums text-amber-600 mt-1">
                  5 pieces
                </div>
              </div>
              <div className="p-3 bg-secondary/20 border border-border">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Adjustment Logs</div>
                <div className="text-2xl font-bold font-sans tabular-nums text-foreground mt-1">
                  {(stockLogsByProduct.get(viewStockProduct.id) || []).length} logs
                </div>
              </div>
            </div>

            {/* Historical Logs Table for This Product */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <History className="size-4 text-gold" />
                <h5 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                  Date-wise Stock Movement History ({viewStockProduct.name})
                </h5>
              </div>

              {(() => {
                const logs = stockLogsByProduct.get(viewStockProduct.id) || [];
                if (logs.length === 0) {
                  return (
                    <div className="p-6 text-center text-xs text-muted-foreground bg-secondary/20 border border-border">
                      No stock movement logs recorded yet for this product.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-2.5 font-semibold">Date</th>
                          <th className="p-2.5 font-semibold">Movement</th>
                          <th className="p-2.5 font-semibold">Previous &rarr; New</th>
                          <th className="p-2.5 font-semibold">Reason / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-secondary/20">
                            <td className="p-2.5 font-sans tabular-nums font-medium text-foreground">{log.date}</td>
                            <td className="p-2.5 font-sans font-bold tabular-nums">
                              <span className={log.change >= 0 ? "text-emerald-600" : "text-destructive"}>
                                {log.change >= 0 ? `+${log.change}` : log.change} units
                              </span>
                            </td>
                            <td className="p-2.5 font-sans tabular-nums text-muted-foreground">
                              {log.previousStock} &rarr; {log.newStock}
                            </td>
                            <td className="p-2.5 text-muted-foreground italic">{log.reason || "Stock update"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex justify-end gap-2.5 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewStockProduct(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="editorial"
                size="sm"
                className="bg-gold hover:bg-gold/90 text-primary-foreground"
                onClick={() => {
                  const target = viewStockProduct;
                  setViewStockProduct(null);
                  handleOpenAddStock(target);
                }}
              >
                <Edit className="size-3.5 mr-1" /> Adjust Stock Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: DELETE / RESET PRODUCT STOCK ----------------- */}
      {deleteStockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-foreground">
                  Stock Actions & Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose to reset stock to zero or remove product
                </p>
              </div>
            </div>

            {/* Product Card */}
            <div className="flex items-center gap-3 p-3 bg-secondary/30 border border-border rounded-xs">
              <img
                src={deleteStockModalProduct.image}
                alt={deleteStockModalProduct.name}
                className="w-12 h-14 object-cover border border-border shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                }}
              />
              <div className="text-xs min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{deleteStockModalProduct.name}</p>
                <p className="text-muted-foreground">{deleteStockModalProduct.category} · {money(deleteStockModalProduct.price)}</p>
                <p className="text-[11px] font-sans font-bold tabular-nums text-foreground mt-0.5">
                  Current Stock: {deleteStockModalProduct.stock} {deleteStockModalProduct.unit}s
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              What action would you like to perform for <strong>"{deleteStockModalProduct.name}"</strong>?
            </p>

            {/* Action 1: Reset Stock to 0 */}
            <div className="p-3 bg-secondary/20 border border-border rounded flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-foreground">Reset Stock to 0</div>
                <div className="text-[11px] text-muted-foreground">
                  Keeps product in store, marks as "Out of Stock" & logs today's date.
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs shrink-0 text-amber-600 border-amber-300 hover:bg-amber-50"
                onClick={() => handleResetStock(deleteStockModalProduct)}
              >
                Reset to 0
              </Button>
            </div>

            {/* Action 2: Delete Product Completely */}
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-destructive">Delete Product Permanently</div>
                <div className="text-[11px] text-muted-foreground">
                  Removes product entirely from inventory, admin portal, and store.
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => handleDeleteProductCompletely(deleteStockModalProduct)}
              >
                Delete
              </Button>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteStockModalProduct(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: VIEW ORDER DETAILS ----------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl rounded-md">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-lg tabular-nums tracking-tight">{selectedOrder.id}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                    {selectedOrder.deliveryDays || 5} Days Delivery
                  </span>
                </div>
                <span className="text-xs font-sans tabular-nums text-muted-foreground">{selectedOrder.date}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setSelectedOrder(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 mt-4 text-sm">
              <div
                className={
                  selectedOrder.status === "Cancelled"
                    ? "p-3.5 bg-red-500/15 border-2 border-red-500/40 rounded space-y-1.5"
                    : "p-3.5 bg-secondary/40 border border-border space-y-1"
                }
              >
                <div className="flex items-center justify-between">
                  <div
                    className={
                      selectedOrder.status === "Cancelled"
                        ? "font-bold text-base text-red-700 dark:text-red-300 flex items-center gap-2"
                        : "font-medium text-foreground"
                    }
                  >
                    {selectedOrder.status === "Cancelled" && (
                      <span className="size-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  {selectedOrder.status === "Cancelled" && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold uppercase tracking-wider">
                      Cancelled Customer
                    </span>
                  )}
                </div>
                <div
                  className={
                    selectedOrder.status === "Cancelled"
                      ? "text-xs font-sans tabular-nums text-red-600 dark:text-red-300 font-semibold"
                      : "text-xs font-sans tabular-nums text-muted-foreground"
                  }
                >
                  {selectedOrder.customerPhone}
                </div>
                <div
                  className={
                    selectedOrder.status === "Cancelled"
                      ? "text-xs text-red-600 dark:text-red-300 font-medium"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {selectedOrder.customerEmail}
                </div>
                <div
                  className={
                    selectedOrder.status === "Cancelled"
                      ? "text-xs text-red-700/90 dark:text-red-300/90 pt-1 border-t border-red-500/25"
                      : "text-xs text-muted-foreground pt-1"
                  }
                >
                  {selectedOrder.shippingAddress}
                </div>
              </div>

              {/* Live Tracking Quick Action */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Truck className="size-3.5 text-primary" />
                    <span>Meesho-Style Live Stepper Tracking</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground font-sans">
                    View customer tracking progress, courier AWB & milestones
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTrackingOrderModal(selectedOrder);
                  }}
                  className="text-xs h-7 px-3 shrink-0 border-primary/40 hover:bg-primary/10 text-primary font-semibold"
                >
                  Open Tracker &rarr;
                </Button>
              </div>

              <div>
                <div className="font-medium mb-2 text-sm">Order Items:</div>
                <div className="space-y-2 border-y border-border py-2 text-sm">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>
                        <span className="font-sans tabular-nums font-semibold">{item.quantity}</span>x {item.productName} ({item.unit})
                      </span>
                      <span className="font-sans font-bold tabular-nums">{money(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-base pt-2 text-primary font-sans tabular-nums">
                  <span>Total Amount</span>
                  <span>{money(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-medium block mb-1">Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => {
                      const updated = e.target.value as Order["paymentStatus"];
                      updatePaymentStatus(selectedOrder.id, updated);
                      setSelectedOrder({ ...selectedOrder, paymentStatus: updated });
                    }}
                    className="w-full h-9 px-2.5 text-xs bg-background border border-border"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">Fulfillment Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const updated = e.target.value as Order["status"];
                      updateOrderStatus(selectedOrder.id, updated, true);
                      setSelectedOrder({ ...selectedOrder, status: updated });
                    }}
                    className="w-full h-9 px-2.5 text-xs bg-background border border-border"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {selectedOrder.status === "Cancelled" && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Order Cancelled</span>
                  </div>
                  {selectedOrder.notes && (
                    <p className="text-[11px] text-destructive/90 pl-5.5 leading-relaxed font-mono whitespace-pre-line">
                      {selectedOrder.notes}
                    </p>
                  )}
                </div>
              )}

              {selectedOrder.notes && selectedOrder.status !== "Cancelled" && (
                <div className="p-2.5 bg-secondary/30 text-[11px] text-muted-foreground border border-border">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-border flex flex-wrap justify-between items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const target = selectedOrder;
                    setSelectedOrder(null);
                    setEditingOrder(target);
                  }}
                  className="text-xs h-8"
                >
                  <Edit className="size-3.5 mr-1" /> Edit Order Details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSingleOrder(selectedOrder)}
                  className="text-xs h-8 border-gold/40 text-gold hover:bg-gold/10 inline-flex items-center gap-1"
                >
                  <Download className="size-3.5" /> Download Invoice
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: EDIT ORDER & DELIVERY DAYS ----------------- */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl rounded-md">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-semibold text-lg">Edit Order #{editingOrder.id}</h3>
                <span className="text-xs text-muted-foreground font-sans">
                  Update estimated delivery days, fulfillment status & courier tracking
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setEditingOrder(null)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const days = parseInt(formData.get("deliveryDays") as string, 10) || 5;
                const status = formData.get("status") as Order["status"];
                const paymentStatus = formData.get("paymentStatus") as Order["paymentStatus"];
                const courierName = (formData.get("courierName") as string) || "ST Courier / DTDC Express";
                const trackingNumber = (formData.get("trackingNumber") as string) || `PF-TRK-${editingOrder.id}`;
                const shippingAddress = formData.get("shippingAddress") as string;
                const notes = formData.get("notes") as string;

                updateOrderDetails(editingOrder.id, {
                  deliveryDays: days,
                  status,
                  paymentStatus,
                  courierName,
                  trackingNumber,
                  shippingAddress,
                  notes,
                  manualStatusOverride: true,
                });
                toast.success(`Order #${editingOrder.id} updated successfully!`);
                setEditingOrder(null);
              }}
              className="space-y-4 mt-4 text-xs"
            >
              {/* Delivery Days Field */}
              <div className="space-y-1.5 p-3.5 rounded bg-primary/5 border border-primary/20">
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    <span>Estimated Delivery Days (e.g. 5, 6 Days):</span>
                  </span>
                  <span className="text-primary font-mono font-bold">Auto-advances step</span>
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    name="deliveryDays"
                    type="number"
                    min="1"
                    max="30"
                    defaultValue={editingOrder.deliveryDays || 5}
                    required
                    className="h-9 font-bold font-sans text-sm w-32"
                  />
                  <span className="text-muted-foreground text-xs">
                    Days (Day 1: Pending &rarr; Day 2: Processing &rarr; Day 3: Shipped &rarr; Day {editingOrder.deliveryDays || 5}: Delivered)
                  </span>
                </div>
              </div>

              {/* Status and Payment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Fulfillment Status</label>
                  <select
                    name="status"
                    defaultValue={editingOrder.status}
                    className="w-full h-9 px-2.5 bg-background border border-border text-foreground"
                  >
                    <option value="Pending">Pending (Order Placed)</option>
                    <option value="Processing">Processing (Packing)</option>
                    <option value="Shipped">Shipped (In Transit)</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground">Payment Status</label>
                  <select
                    name="paymentStatus"
                    defaultValue={editingOrder.paymentStatus}
                    className="w-full h-9 px-2.5 bg-background border border-border text-foreground"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Courier Partner & Tracking Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Courier Partner</label>
                  <Input
                    name="courierName"
                    defaultValue={editingOrder.courierName || "ST Courier / DTDC Express"}
                    placeholder="e.g. ST Courier, DTDC, BlueDart"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Tracking AWB ID</label>
                  <Input
                    name="trackingNumber"
                    defaultValue={editingOrder.trackingNumber || `PF-TRK-${editingOrder.id}`}
                    placeholder="e.g. ST123456789IN"
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-1">
                <label className="font-medium text-foreground">Shipping / Delivery Address</label>
                <Textarea
                  name="shippingAddress"
                  defaultValue={editingOrder.shippingAddress}
                  rows={2}
                  className="text-xs"
                />
              </div>

              {/* Internal Notes */}
              <div className="space-y-1">
                <label className="font-medium text-foreground">Admin / Order Notes</label>
                <Input
                  name="notes"
                  defaultValue={editingOrder.notes || ""}
                  placeholder="e.g. Special packing request, gift wrap, etc."
                  className="h-9"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingOrder(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold">
                  Save Order Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: DELETE ORDER CONFIRMATION ----------------- */}
      {deleteOrderConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/30 w-full max-w-sm p-6 shadow-xl rounded-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center shrink-0 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-foreground">Delete Order?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete order <strong className="text-foreground">#{deleteOrderConfirm.id}</strong> for <strong className="text-foreground">{deleteOrderConfirm.customerName}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteOrderConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  deleteOrder(deleteOrderConfirm.id);
                  toast.success(`Order #${deleteOrderConfirm.id} has been deleted.`);
                  setDeleteOrderConfirm(null);
                }}
              >
                Delete Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: VIEW CUSTOMER DETAILS ----------------- */}
      {viewingCustomer && (() => {
        const customerOrders = orders.filter(
          (o) =>
            (viewingCustomer.email && o.customerEmail?.toLowerCase() === viewingCustomer.email.toLowerCase()) ||
            (viewingCustomer.name && o.customerName?.toLowerCase() === viewingCustomer.name.toLowerCase()),
        );

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border w-full max-w-2xl p-6 shadow-xl rounded-lg space-y-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-base">
                    {viewingCustomer.name ? viewingCustomer.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {viewingCustomer.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {viewingCustomer.id || "CUST-VERIFIED"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCustomer(null)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Customer Contact & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md bg-secondary/30 border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Email Address</span>
                  <p className="text-foreground font-medium mt-0.5 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-primary shrink-0" />
                    <span>{viewingCustomer.email || "No email"}</span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Mobile Phone</span>
                  <p className="text-foreground font-medium mt-0.5 flex items-center gap-1.5">
                    <Phone className="size-3.5 text-primary shrink-0" />
                    <span>{viewingCustomer.phone || "No phone"}</span>
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-[11px] uppercase font-semibold">Delivery Address</span>
                  <p className="text-foreground font-medium mt-0.5 leading-relaxed">
                    {viewingCustomer.address || "Chennai, Tamil Nadu"}
                  </p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded border border-border bg-card">
                  <span className="text-[11px] text-muted-foreground uppercase">Total Orders</span>
                  <p className="text-base font-bold text-foreground mt-0.5">{viewingCustomer.ordersCount || customerOrders.length || 0}</p>
                </div>
                <div className="p-3 rounded border border-border bg-card">
                  <span className="text-[11px] text-muted-foreground uppercase">Total Spent</span>
                  <p className="text-base font-bold text-primary mt-0.5">{money(viewingCustomer.totalSpent || 0)}</p>
                </div>
                <div className="p-3 rounded border border-border bg-card">
                  <span className="text-[11px] text-muted-foreground uppercase">Last Order</span>
                  <p className="text-xs font-semibold text-foreground mt-1">{viewingCustomer.lastOrderDate || "Recent"}</p>
                </div>
              </div>

              {/* Customer Orders History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Order History ({customerOrders.length})
                  </h4>
                  {customerOrders.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:underline h-auto p-0 cursor-pointer"
                      onClick={() => {
                        setOrderSearch(viewingCustomer.email || viewingCustomer.name);
                        setActiveTab("orders");
                        setViewingCustomer(null);
                      }}
                    >
                      View in Orders Tab &rarr;
                    </Button>
                  )}
                </div>

                {customerOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-4 text-center border border-dashed border-border rounded">
                    No orders recorded for this customer yet.
                  </p>
                ) : (
                  <div className="border border-border rounded-md overflow-hidden text-xs">
                    <div className="max-h-48 overflow-y-auto divide-y divide-border">
                      {customerOrders.map((o) => (
                        <div key={o.id} className="p-3 flex items-center justify-between hover:bg-secondary/20">
                          <div>
                            <span className="font-mono font-bold text-foreground">#{o.id}</span>
                            <span className="text-muted-foreground ml-2">({o.date || "Recent"})</span>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {o.items?.length || 1} item(s) · {o.paymentMethod || "COD"} ({o.paymentStatus || "Pending"})
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary block">{money(o.total || 0)}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              o.status === "Delivered"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : o.status === "Cancelled"
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-amber-500/10 text-amber-600"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingCustomer(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-primary text-white"
                  onClick={() => {
                    setEditingCustomer(viewingCustomer);
                    setEditCustomerForm({
                      name: viewingCustomer.name || "",
                      email: viewingCustomer.email || "",
                      phone: viewingCustomer.phone || "",
                      address: viewingCustomer.address || "",
                    });
                    setViewingCustomer(null);
                  }}
                >
                  <Edit className="size-3.5 mr-1" /> Edit Customer
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ----------------- MODAL: EDIT CUSTOMER DETAILS ----------------- */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-md p-6 shadow-xl rounded-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Edit className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Edit Customer</h3>
                  <p className="text-[11px] text-muted-foreground">Update customer profile & delivery details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Full Name *</label>
                <Input
                  required
                  value={editCustomerForm.name}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                  placeholder="Customer Full Name"
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={editCustomerForm.email}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="h-9.5 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Phone Number</label>
                <Input
                  type="tel"
                  value={editCustomerForm.phone}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                  placeholder="+91 99401 35700"
                  className="h-9.5 text-xs font-sans tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Delivery Street Address</label>
                <Textarea
                  rows={3}
                  value={editCustomerForm.address}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, address: e.target.value })}
                  placeholder="Door No, Street Name, City, Pincode"
                  className="text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCustomer(null)}
                  disabled={isSavingCustomer}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingCustomer}
                  className="bg-primary text-white"
                >
                  {isSavingCustomer ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: DELETE CUSTOMER CONFIRMATION ----------------- */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/30 w-full max-w-sm p-6 shadow-xl rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center shrink-0 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-foreground">Delete Customer?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete customer <strong className="text-foreground">{deletingCustomer.name}</strong> ({deletingCustomer.email})? This customer record will be removed from admin records.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingCustomer(null)}
                disabled={isDeletingCustomer}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeletingCustomer}
                onClick={handleDeleteCustomer}
              >
                {isDeletingCustomer ? "Deleting..." : "Delete Customer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: MEESHO-STYLE ORDER TRACKING MODAL ----------------- */}
      <OrderTrackingModal
        order={trackingOrderModal}
        isOpen={!!trackingOrderModal}
        onClose={() => setTrackingOrderModal(null)}
      />
    </div>
  );
}
