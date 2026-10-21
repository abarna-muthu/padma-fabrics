import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  FileText,
  Filter,
  History,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/padmanabha-logo.jpg";
import storeImg from "@/assets/padmanabha-store.jpg";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useStore } from "@/context/StoreContext";
import { useSiteContent } from "@/context/SiteContentContext";
import { ALL, categories, money, type Product, type Order } from "@/lib/catalog";
import { customerApi } from "@/lib/api";
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
] as const;

export const DUMMY_PRODUCT_IMAGES = [
  {
    name: "Wine Zari Silk Saree",
    url: "/assets/burgundy-silk.jpg",
    category: "Sarees",
  },
  {
    name: "Heritage Gold Silk Saree",
    url: "/assets/fabric-hero.jpg",
    category: "Sarees",
  },
  {
    name: "Sage Buti Cotton Fabric",
    url: "/assets/sage-fabric.jpg",
    category: "Fabrics",
  },
  {
    name: "Ivory Floral Brocade Fabric",
    url: "/assets/ivory-brocade.jpg",
    category: "Fabrics",
  },
  {
    name: "Classic Linen Formal Shirt",
    url: "/assets/mens-shirt.jpg",
    category: "Shirts",
  },
  {
    name: "Everyday Combed Cotton Tee",
    url: "/assets/tshirt.jpg",
    category: "T-Shirts",
  },
  {
    name: "Maroon Anarkali Festive Dress",
    url: "/assets/womens-dress.jpg",
    category: "Women's Dresses",
  },
  {
    name: "Royal Festive Party Lehenga",
    url: "/assets/girls-lehenga.jpg",
    category: "Women's Dresses",
  },
  {
    name: "Traditional Pattu Pavadai Set",
    url: "/assets/kids-dress.jpg",
    category: "Kids Wear",
  },
  {
    name: "Cotton Daily Girls Frock",
    url: "/assets/girls-daily-frock.jpg",
    category: "Kids Wear",
  },
  {
    name: "Celebration Party Frock",
    url: "/assets/girls-party-frock.jpg",
    category: "Kids Wear",
  },
  {
    name: "Festive Silk Kids Anarkali",
    url: "/assets/girls-hero.jpg",
    category: "Kids Wear",
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
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    adjustStock,
    stockLogs,
    orders,
    updateOrderStatus,
    updatePaymentStatus,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Customer management states
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");

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

  // Product form state
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<string>("Sarees");
  const [prodColour, setProdColour] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodUnit, setProdUnit] = useState("piece");
  const [prodStock, setProdStock] = useState("10");
  const [prodBadge, setProdBadge] = useState("New");
  const [prodDescription, setProdDescription] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodSizes, setProdSizes] = useState<string[]>([...AVAILABLE_SIZES]);
  const [prodImage, setProdImage] = useState("");

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

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        setIsUploadingImage(false);
        return;
      }

      // Automatically optimize/compress image to keep it lightweight and fast
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL("image/jpeg", 0.85);
          setProdImage(compressedUrl);
          setImageUploadStatus(`${file.name} (${(compressedUrl.length / 1024).toFixed(0)} KB)`);
        } else {
          setProdImage(result);
          setImageUploadStatus(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
        }
        setIsUploadingImage(false);
      };
      img.onerror = () => {
        setProdImage(result);
        setImageUploadStatus(`${file.name}`);
        setIsUploadingImage(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = "";
  };

  // Stock adjustment modal states
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState("");
  const [stockReason, setStockReason] = useState("");

  // Order detail view modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const [homeDraft, setHomeDraft] = useState(content.home);
  const [aboutDraft, setAboutDraft] = useState(content.about);
  const [contactDraft, setContactDraft] = useState(content.contact);
  const [contentStatusMsg, setContentStatusMsg] = useState<{
    page: "home" | "about" | "contact";
    text: string;
  } | null>(null);

  useEffect(() => {
    setHomeDraft(content.home);
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
    setProdCategory("Sarees");
    setProdColour("");
    setProdPrice("");
    setProdUnit("piece");
    setProdStock("10");
    setProdBadge("New arrival");
    setProdDescription("");
    setProdSku(`PF-${Math.floor(100 + Math.random() * 900)}`);
    setProdSizes([...AVAILABLE_SIZES]);
    setProdImage(DUMMY_PRODUCT_IMAGES[0]?.url || productsList[0]?.image || "");
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
    setImageUploadStatus("");
    setIsProductModalOpen(true);
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: prodName,
          category: prodCategory as (typeof categories)[number],
          colour: prodColour,
          price: Number(prodPrice),
          unit: prodUnit,
          stock: Number(prodStock),
          badge: prodBadge,
          description: prodDescription,
          sku: prodSku,
          sizes: prodSizes,
          image: prodImage || editingProduct.image,
          status: editingProduct.status || "active",
          isActive: true,
        });
        toast.success(`"${prodName}" updated successfully! Changes are live on customer storefront.`);
      } else {
        await addProduct({
          name: prodName,
          category: prodCategory as (typeof categories)[number],
          colour: prodColour,
          price: Number(prodPrice),
          unit: prodUnit,
          stock: Number(prodStock),
          badge: prodBadge,
          description: prodDescription,
          sku: prodSku,
          sizes: prodSizes,
          image: prodImage || productsList[0]?.image || "",
          status: "active",
          isActive: true,
        });
        toast.success(`"${prodName}" published to catalog and customer storefront!`);
      }
    } catch (err: any) {
      toast.error(`Failed to save product: ${err?.message || "Unknown error"}`);
    }

    setIsProductModalOpen(false);
  };

  // Handle stock adjustment submit
  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || newStockQty === "") return;
    adjustStock(stockModalProduct.id, Number(newStockQty), stockReason);
    setStockModalProduct(null);
    setStockReason("");
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
    <div className="min-h-screen bg-sand-50 dark:bg-background flex flex-col md:flex-row text-foreground">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-2.5">
          <img
            src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-display font-semibold text-lg text-primary">Padmanabha Admin</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-card border-r border-border md:min-h-screen flex flex-col shrink-0`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-border hidden md:flex items-center gap-3">
          <img
            src={typeof logo === "string" ? logo : (logo as any)?.url || "/padmanabha-logo.jpg"}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
            alt="Padmanabha"
          />
          <div>
            <div className="font-display font-semibold text-primary text-lg leading-tight">
              Padmanabha
            </div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Admin Portal
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="size-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("products");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "products"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="size-4 shrink-0" />
              <span>Products</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-sans font-medium tabular-nums ${
                activeTab === "products"
                  ? "bg-primary-foreground/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {productsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("inventory");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "inventory"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Boxes className="size-4 shrink-0" />
              <span>Inventory & Stock</span>
            </div>
            {lowStockCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold font-sans tabular-nums">
                {lowStockCount} low
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("orders");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="size-4 shrink-0" />
              <span>Orders</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-sans font-medium tabular-nums ${
                activeTab === "orders"
                  ? "bg-primary-foreground/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("customers");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "customers"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="size-4 shrink-0" />
              <span>Customers</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-sans font-medium tabular-nums ${
                activeTab === "customers"
                  ? "bg-primary-foreground/20 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {customersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sales");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "sales"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <TrendingUp className="size-4 shrink-0" />
            <span>Sales & Reports</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className="size-4 shrink-0" />
            <span>Admin Settings</span>
          </button>

          {/* Section: Page Content Management */}
          <div className="pt-4 pb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-gold" />
            <span>Page Content</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("home-content");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "home-content"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Globe className="size-4 shrink-0" />
            <span>Home Page</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("about-content");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "about-content"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <FileText className="size-4 shrink-0" />
            <span>About Page</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("contact-content");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors text-left cursor-pointer ${
              activeTab === "contact-content"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Phone className="size-4 shrink-0" />
            <span>Contact Page</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border space-y-3 bg-secondary/30">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
              <User className="size-4" />
            </div>
            <div className="overflow-hidden">
              <div className="font-medium text-foreground truncate">{user?.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs h-8" asChild>
              <Link to="/">
                <Home className="size-3 mr-1.5" /> Storefront
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Top bar info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gold font-medium mb-1">
              Administration Portal · Padmanabha Fabrics
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-medium text-foreground">
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
            <span className="text-[10px] px-2.5 py-1 bg-secondary text-muted-foreground rounded-full border border-border">
              Live Website Sync
            </span>
            <Button variant="outline" size="sm" asChild className="text-xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                  <div className="p-2 bg-primary/10 text-primary rounded-sm">
                    <TrendingUp className="size-4.5" />
                  </div>
                </div>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {money(totalRevenue)}
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  Strictly verified paid orders
                </span>
              </div>

              <div className="bg-card border border-border p-5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                  <div className="p-2 bg-primary/10 text-primary rounded-sm">
                    <ShoppingBag className="size-4.5" />
                  </div>
                </div>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {orders.length}
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  {orders.filter((o) => o.status === "Pending").length} pending processing
                </span>
              </div>

              <div className="bg-card border border-border p-5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Active Catalog</span>
                  <div className="p-2 bg-primary/10 text-primary rounded-sm">
                    <Package className="size-4.5" />
                  </div>
                </div>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {activeProductsCount}
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  of {productsList.length} total products
                </span>
              </div>

              <div className="bg-card border border-border p-5">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">Stock Alerts</span>
                  <div className="p-2 bg-amber-500/10 text-amber-600 rounded-sm">
                    <AlertTriangle className="size-4.5" />
                  </div>
                </div>
                <div className="font-sans font-bold text-3xl tracking-tight text-foreground mt-2 tabular-nums">
                  {lowStockCount}
                </div>
                <span className="text-xs text-amber-600 font-medium mt-1.5 block">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-72">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products, colours, SKU…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 text-sm h-10 rounded-none border-border"
                  />
                </div>
                {/* Category filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="h-10 px-3 text-sm bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === ALL ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="editorial" size="sm" className="h-10 text-sm font-medium" onClick={handleOpenAddProduct}>
                <Plus className="size-4 mr-1.5" /> Add Product
              </Button>
            </div>

            {/* Products Table */}
            <div className="bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
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
                    {filteredProducts.map((p) => (
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
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground inline-block font-medium">
                              {p.badge}
                            </span>
                            {p.sizes && p.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-1">
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
                          </div>
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
            <div className="bg-card border border-border p-6">
              <h2 className="font-display text-lg font-medium mb-1">Product Inventory Status</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Update stock levels, track buffer thresholds, and log changes
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Product</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Category</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">SKU</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Current Stock</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-right">Stock Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productsList.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5 font-medium text-foreground">{p.name}</td>
                        <td className="p-3.5 text-muted-foreground">{p.category}</td>
                        <td className="p-3.5 font-sans tabular-nums text-muted-foreground">{p.sku || "PF-N/A"}</td>
                        <td className="p-3.5 font-sans font-bold tabular-nums text-foreground">
                          {p.stock} {p.unit}s
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
                        <td className="p-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {
                              setStockModalProduct(p);
                              setNewStockQty(p.stock.toString());
                              setStockReason("");
                            }}
                          >
                            <SlidersHorizontal className="size-3.5 mr-1" /> Adjust Stock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock history logs */}
            <div className="bg-card border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="size-4 text-gold" />
                <h2 className="font-display text-lg font-medium">Stock Adjustment History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Log ID</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Product</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Adjustment</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Previous &rarr; New</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stockLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-secondary/20">
                        <td className="p-3.5 font-sans tabular-nums text-xs text-muted-foreground">
                          {log.id}
                        </td>
                        <td className="p-3.5 text-sm font-sans tabular-nums text-muted-foreground">{log.date}</td>
                        <td className="p-3.5 font-medium text-foreground">{log.productName}</td>
                        <td className="p-3.5 font-sans font-bold tabular-nums">
                          <span
                            className={log.change >= 0 ? "text-emerald-600" : "text-destructive"}
                          >
                            {log.change >= 0 ? `+${log.change}` : log.change}
                          </span>
                        </td>
                        <td className="p-3.5 font-sans tabular-nums text-muted-foreground">
                          {log.previousStock} &rarr; {log.newStock}
                        </td>
                        <td className="p-3.5 text-muted-foreground italic text-xs">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: ORDERS ----------------- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
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
              </div>

              <div className="text-xs text-muted-foreground">
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
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Items Summary</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Total Amount</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Payment</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider">Fulfillment</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5 font-sans font-bold text-sm tracking-tight text-foreground">{o.id}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-foreground">{o.customerName}</div>
                          <div className="text-xs font-sans tabular-nums text-muted-foreground mt-0.5">{o.customerPhone}</div>
                          <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                        </td>
                        <td className="p-3.5 font-sans tabular-nums text-sm text-muted-foreground">{o.date}</td>
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
                        <td className="p-3.5">
                          <select
                            value={o.status}
                            onChange={(e) =>
                              updateOrderStatus(o.id, e.target.value as Order["status"])
                            }
                            className="px-2.5 py-1 text-xs font-medium border border-border bg-background text-foreground focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setSelectedOrder(o)}
                          >
                            <Eye className="size-3.5 mr-1" /> View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">
                          No orders found matching the filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
                    {filteredCustomers.map((c) => (
                      <tr key={c.id || c.email} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {c.name ? c.name.charAt(0) : "C"}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{c.name}</div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 cursor-pointer"
                            onClick={() => {
                              setOrderSearch(c.email || c.name);
                              setActiveTab("orders");
                            }}
                          >
                            <Eye className="size-3.5 mr-1" /> View Orders
                          </Button>
                        </td>
                      </tr>
                    ))}
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
                  { name: "Sarees & Silks", share: "45%", revenue: 9700 },
                  { name: "Fabrics by Metre", share: "35%", revenue: 20540 },
                  { name: "Men's Linen & Shirts", share: "12%", revenue: 5096 },
                  { name: "Dresses & Kids", share: "8%", revenue: 5198 },
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
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-xl">
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
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setProdCategory(newCat);
                      if (!editingProduct) {
                        const match = DUMMY_PRODUCT_IMAGES.find((d) => d.category === newCat);
                        if (match) {
                          setProdImage(match.url);
                        }
                      }
                    }}
                    className="w-full h-10 px-3 text-sm bg-background border border-border"
                  >
                    {categories
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
                  <label className="text-sm font-medium">Stock Count</label>
                  <Input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="10"
                    className="rounded-none text-sm h-10 font-sans tabular-nums"
                  />
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

              {/* Product Size Options (S to 5XL) */}
              <div className="space-y-2.5 p-3.5 bg-secondary/15 border border-border rounded-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-border/50">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <span>Available Sizes (S to 5XL) *</span>
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
                      All (S-5XL)
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

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSelected = prodSizes.includes(sz) || (sz === "2XL" && prodSizes.includes("XXL"));
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`h-9 px-2 rounded-xs text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 border ${
                          isSelected
                            ? "bg-[#9B2242] text-white border-[#9B2242] shadow-xs ring-2 ring-[#9B2242]/30 font-bold scale-[1.02]"
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
                          {prodSizes.length} {prodSizes.length === 1 ? "size" : "sizes"} selected:
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

              {/* Product Image & Direct Device Upload */}
              <div className="space-y-3 p-3.5 bg-secondary/15 border border-border rounded-sm">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-primary" />
                    <span>Product Image *</span>
                  </label>
                  {prodImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setProdImage("");
                        setImageUploadStatus("");
                      }}
                      className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                {/* Direct Upload Box or Current Image Preview */}
                {prodImage ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3 bg-card border border-border rounded-xs shadow-xs">
                    <div className="relative w-20 h-24 bg-muted border border-border shrink-0 overflow-hidden rounded-xs group">
                      <img
                        src={prodImage}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-left w-full min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3.5" />
                        <span>Photo Attached</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">
                        {imageUploadStatus || (prodImage.startsWith("data:") ? "Uploaded from your computer/device" : prodImage)}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-medium cursor-pointer flex items-center gap-1"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          <Upload className="size-3 text-primary" />
                          <span>{isUploadingImage ? "Optimizing…" : "Upload Different Image"}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1 cursor-pointer"
                          onClick={() => {
                            setProdImage("");
                            setImageUploadStatus("");
                          }}
                        >
                          <Trash2 className="size-3" />
                          <span>Remove</span>
                        </Button>
                      </div>
                    </div>
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
                        Click here to Upload Dress / Fabric Photo Directly
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Select any photo from your computer or phone (JPG, PNG, WebP)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="editorial"
                      size="sm"
                      className="h-8 text-xs uppercase tracking-wider font-semibold pointer-events-none mt-1"
                    >
                      <Upload className="size-3.5 mr-1.5" /> Select Image from Device
                    </Button>
                  </div>
                )}

                {/* Optional URL input toggle */}
                <details className="text-xs text-muted-foreground group">
                  <summary className="cursor-pointer hover:text-foreground font-medium flex items-center gap-1 py-1">
                    <span>Or enter image URL path manually</span>
                  </summary>
                  <div className="mt-1.5 space-y-1">
                    <Input
                      value={prodImage}
                      onChange={(e) => {
                        setProdImage(e.target.value);
                        setImageUploadStatus("");
                      }}
                      placeholder="e.g. /assets/burgundy-silk.jpg or https://..."
                      className="rounded-none text-xs h-8 font-sans"
                    />
                  </div>
                </details>

                {/* Grid of sample / dummy images */}
                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">
                      Or pick from Sample Textile & Garment Images ({DUMMY_PRODUCT_IMAGES.length})
                    </span>
                    <span className="text-[10px] text-primary">Click to select</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 border border-border/60 bg-background rounded-xs">
                    {DUMMY_PRODUCT_IMAGES.map((dummy) => {
                      const isSelected = prodImage === dummy.url;
                      return (
                        <button
                          type="button"
                          key={dummy.url}
                          onClick={() => {
                            setProdImage(dummy.url);
                            setImageUploadStatus("");
                          }}
                          className={`group relative flex flex-col items-center border p-1 transition-all text-left bg-card cursor-pointer rounded-xs ${
                            isSelected
                              ? "border-primary ring-2 ring-primary/40 bg-primary/10"
                              : "border-border hover:border-foreground/50"
                          }`}
                          title={`${dummy.name} (${dummy.category})`}
                        >
                          <div className="relative w-full aspect-square overflow-hidden bg-muted rounded-xs">
                            <img
                              src={dummy.url}
                              alt={dummy.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-0.5 right-0.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow">
                                <Check className="size-2.5" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-medium truncate w-full mt-1 text-center text-foreground">
                            {dummy.name}
                          </span>
                          <span className="text-[8px] text-muted-foreground truncate w-full text-center">
                            {dummy.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
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

      {/* ----------------- MODAL: ADJUST STOCK ----------------- */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm p-6 shadow-xl">
            <h3 className="font-display text-lg font-medium mb-1">Adjust Inventory Stock</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {stockModalProduct.name} ({stockModalProduct.unit}s)
            </p>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Stock Quantity *</label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="rounded-none text-sm h-10 font-sans tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Reason for Adjustment</label>
                <Input
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="e.g. Loom consignment, damaged stock, audit"
                  className="rounded-none text-sm h-10"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStockModalProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="editorial" size="sm">
                  Update Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: VIEW ORDER DETAILS ----------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <div>
                <h3 className="font-sans font-bold text-lg tabular-nums tracking-tight">{selectedOrder.id}</h3>
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
              <div className="p-3.5 bg-secondary/40 border border-border space-y-1">
                <div className="font-medium text-foreground">{selectedOrder.customerName}</div>
                <div className="text-xs font-sans tabular-nums text-muted-foreground">{selectedOrder.customerPhone}</div>
                <div className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</div>
                <div className="text-xs text-muted-foreground pt-1">{selectedOrder.shippingAddress}</div>
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
                      updateOrderStatus(selectedOrder.id, updated);
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

              {selectedOrder.notes && (
                <div className="p-2.5 bg-secondary/30 text-[11px] text-muted-foreground border border-border">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
