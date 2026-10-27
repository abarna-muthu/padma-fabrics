import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { money, type Order } from "@/lib/catalog";
import { computeOrderTracking } from "@/lib/orderTracking";
import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import {
  Package,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  RotateCw,
  Eye,
  Star,
  X,
  ChevronDown,
  Download,
  AlertCircle,
  FileText,
  XCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CancelOrderModal } from "@/components/CancelOrderModal";

export function OrdersPage() {
  const { customer, isLoggedIn } = useCustomerAuth();
  const { orders, productsList, setIsCustomerPortalOpen, setCustomerPortalTab } = useStore();
  const { addToCart, setIsCartOpen } = useCart();

  const [orderQuery, setOrderQuery] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackedProduct, setTrackedProduct] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);

  // Tab & Timeframe state matching reference UI
  const [orderTab, setOrderTab] = useState<"all" | "not-shipped" | "cancelled">("all");
  const [timeframe, setTimeframe] = useState<"1-year" | "6-months" | "3-months" | "all">("1-year");
  const [dismissedBanners, setDismissedBanners] = useState<Record<string, boolean>>({});

  // Match orders for customer via:
  // 1. Logged in customer email / phone
  // 2. localStorage last placed order ID, phone, or email
  // 3. Fallback to recent store orders
  const lastPlacedOrderId = typeof window !== "undefined" ? localStorage.getItem("pf_last_placed_order_id") : null;
  const lastPlacedPhone = typeof window !== "undefined" ? localStorage.getItem("pf_last_customer_phone") : null;
  const lastPlacedEmail = typeof window !== "undefined" ? localStorage.getItem("pf_last_customer_email") : null;

  const normalizePhone = (p?: string) => (p ? String(p).replace(/\D/g, "").slice(-10) : "");

  const getOrderItems = (o: any): any[] => {
    if (!o || !o.items) return [];
    if (Array.isArray(o.items)) return o.items;
    if (typeof o.items === "string") {
      try {
        const parsed = JSON.parse(o.items);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const matchedOrders = (orders || []).filter((o) => {
    if (!o) return false;
    try {
      if (customer) {
        if (customer.email && o.customerEmail && typeof o.customerEmail === "string" && o.customerEmail.trim().toLowerCase() === customer.email.trim().toLowerCase()) return true;
        if (customer.phone && o.customerPhone && typeof o.customerPhone === "string" && normalizePhone(o.customerPhone) === normalizePhone(customer.phone)) return true;
      }
      if (lastPlacedOrderId && (o.id === lastPlacedOrderId || (o as any).orderNumber === lastPlacedOrderId)) return true;
      if (lastPlacedPhone && o.customerPhone && typeof o.customerPhone === "string" && normalizePhone(o.customerPhone) === normalizePhone(lastPlacedPhone)) return true;
      if (lastPlacedEmail && o.customerEmail && typeof o.customerEmail === "string" && o.customerEmail.trim().toLowerCase() === lastPlacedEmail.trim().toLowerCase()) return true;
    } catch {
      return false;
    }
    return false;
  });

  const baseOrders = matchedOrders.length > 0 ? matchedOrders : (orders || []).slice(0, 6);

  // Apply tab & timeframe filters
  const filteredOrders = baseOrders.filter((order) => {
    const tracking = computeOrderTracking(order);

    if (orderTab === "not-shipped") {
      if (tracking.effectiveStatus === "Delivered" || tracking.isCancelled) return false;
    } else if (orderTab === "cancelled") {
      if (!tracking.isCancelled && order.status !== "Cancelled") return false;
    }

    if (timeframe !== "all") {
      const orderDate = new Date(order.date || order.createdAt || Date.now()).getTime();
      const now = Date.now();
      const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (timeframe === "3-months" && daysDiff > 90) return false;
      if (timeframe === "6-months" && daysDiff > 180) return false;
      if (timeframe === "1-year" && daysDiff > 365) return false;
    }

    return true;
  });

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const q = orderQuery.trim().toLowerCase();
    if (!q) return;

    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === q ||
        o.id.toLowerCase().includes(q) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.replace(/\D/g, "").includes(q.replace(/\D/g, ""))),
    );

    if (found) {
      setTrackedOrder(found);
      setTrackedProduct(null);
    } else {
      setSearchError(`No order found matching "${orderQuery}". Please check your order ID.`);
    }
  };

  const handleDownloadInvoice = (order: Order) => {
    const tracking = computeOrderTracking(order);
    const dateStr = order.date || (order.createdAt ? order.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]);
    const items = getOrderItems(order);
    const itemsHtml = items
      .map(
        (it: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${it.productName || it.name || "Product"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.size || "Standard"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity || 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(it.price || 0).toLocaleString("en-IN")}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${((it.price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}</td>
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
        ${order.customerName || "Customer"}<br />
        Phone: ${order.customerPhone || "N/A"}<br />
        Email: ${order.customerEmail || "N/A"}<br />
        Address: ${order.shippingAddress || "Ambattur, Chennai"}
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
      <div>Subtotal: ₹${Number(order.total || 0).toLocaleString("en-IN")}</div>
      <div>Delivery: ₹0 (Free Delivery)</div>
      <div style="margin-top: 8px;">
        Grand Total: <span class="total-amount">₹${Number(order.total || 0).toLocaleString("en-IN")}</span>
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

  const handleBuyAgain = (item: any, matchedProd: any) => {
    const prod = matchedProd || {
      id: item.productId || `prod-${Date.now()}`,
      name: item.productName,
      price: item.price || 999,
      image: item.image || item.imageUrl || "/images/placeholder.jpg",
      category: "Fabrics",
      colour: item.colour || "Custom",
    };
    addToCart(prod, item.size || "Standard", 1, item.colour, item.image || item.imageUrl, item.price);
    setIsCartOpen(true);
    toast.success(`Added "${item.productName}" back to your bag!`);
  };

  const formatOrderDate = (dateVal?: string) => {
    if (!dateVal) return "Recent";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return dateVal;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatDeliveryDisplay = (tracking: any, orderDate?: string) => {
    if (tracking.isCancelled) return "Order Cancelled";
    if (tracking.effectiveStatus === "Delivered") {
      return `Delivered ${tracking.estimatedDeliveryDate || "May 10"}`;
    }
    if (tracking.effectiveStatus === "Shipped") {
      return `Expected Delivery by ${tracking.estimatedDeliveryDate || "May 10"}`;
    }
    return `Arriving by ${tracking.estimatedDeliveryDate || "in 3-5 days"}`;
  };

  const formatEligibleDate = (dateVal?: string) => {
    const d = dateVal ? new Date(dateVal) : new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumb items={[{ label: "Your Orders" }]} className="mb-1" />

      {/* Page Title & Search Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Your Orders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            View orders, download invoices, and track live deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowSearchBox(!showSearchBox)}
            className="text-xs h-9 border-border/80 hover:bg-muted/40 font-medium flex items-center gap-1.5"
          >
            <Search className="size-3.5" />
            <span>Search Order ID</span>
          </Button>

          {!isLoggedIn && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomerPortalTab("orders");
                setIsCustomerPortalOpen(true);
              }}
              className="text-xs h-9 font-semibold text-primary border-primary/40 hover:bg-primary/10"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Optional Search / Lookup Box */}
      {showSearchBox && (
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-3 transition-all animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-gold" />
              <h3 className="font-display text-sm font-semibold text-foreground">
                Quick Order Lookup
              </h3>
            </div>
            <button
              onClick={() => setShowSearchBox(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="size-4" />
            </button>
          </div>
          <form onSubmit={handleSearchOrder} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter Order ID (e.g. PF-1081) or phone number..."
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-background"
              />
            </div>
            <Button type="submit" size="sm" className="h-9 px-4 text-xs bg-primary text-primary-foreground font-semibold">
              Track
            </Button>
          </form>
          {searchError && (
            <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs & Timeframe Dropdown (Matches Screenshot Exactly) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-b border-border/80">
        {/* Left Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setOrderTab("all")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              orderTab === "all"
                ? "bg-[#D15608]/10 text-[#D15608] dark:bg-white/10 dark:text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
            }`}
          >
            Order
          </button>
          <button
            type="button"
            onClick={() => setOrderTab("not-shipped")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              orderTab === "not-shipped"
                ? "bg-[#D15608]/10 text-[#D15608] dark:bg-white/10 dark:text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
            }`}
          >
            Not Yet Shipped
          </button>
          <button
            type="button"
            onClick={() => setOrderTab("cancelled")}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              orderTab === "cancelled"
                ? "bg-[#D15608]/10 text-[#D15608] dark:bg-white/10 dark:text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
            }`}
          >
            Cancelled Orders
          </button>
        </div>

        {/* Right Dropdown */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="appearance-none bg-card text-foreground border border-border/80 rounded-lg pl-3 pr-8 py-1.5 text-xs sm:text-sm font-medium hover:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
            >
              <option value="1-year">Past 1 Years</option>
              <option value="6-months">Past 6 Months</option>
              <option value="3-months">Past 3 Months</option>
              <option value="all">All Orders</option>
            </select>
            <ChevronDown className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-6 pt-2">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-card border border-dashed border-border rounded-2xl space-y-4">
            <Package className="size-12 text-muted-foreground/50 mx-auto" />
            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
              No orders found
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {orderTab === "cancelled"
                ? "You have no cancelled orders."
                : orderTab === "not-shipped"
                  ? "All your placed orders have already been shipped or delivered."
                  : "You have not placed any orders yet or they belong to another account."}
            </p>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/shop">Explore Collections</Link>
            </Button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const tracking = computeOrderTracking(order);
            const items = getOrderItems(order);
            const deliveryHeading = formatDeliveryDisplay(tracking, order.date || order.createdAt);
            const orderDateStr = formatOrderDate(order.date || order.createdAt);
            const shippingDest = order.shippingAddress
              ? order.shippingAddress.split(",").slice(-2).join(",").trim() || order.shippingAddress
              : order.customerName
                ? `${order.customerName}, India`
                : "Chennai, India";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-border/80 dark:border-white/10 bg-card overflow-hidden shadow-xs hover:border-gold/40 transition-colors"
              >
                {/* 1. Header Strip (Matches Screenshot) */}
                <div className="bg-[#FAF7F2] dark:bg-[#1A1617] border-b border-border/70 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Column Group: Order Date, Total Amount, Ship To */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 items-start">
                    <div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">
                        Order Date :
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground block mt-0.5">
                        {orderDateStr}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">
                        Total Amount :
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground block mt-0.5">
                        {money(order.total)}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[11px] sm:text-xs text-muted-foreground block font-medium">
                        Ship To :
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-foreground block mt-0.5 truncate max-w-[200px]" title={shippingDest}>
                        {shippingDest}
                      </span>
                    </div>
                  </div>

                  {/* Right Column Group: Order #, View Invoice, View Order */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                    <div className="text-left sm:text-right">
                      <span className="text-xs sm:text-sm font-normal text-muted-foreground">Order : </span>
                      <strong className="text-xs sm:text-sm font-bold text-foreground font-mono">
                        #{order.id}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status !== "Cancelled" && order.status !== "Delivered" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCancellingOrder(order)}
                          className="h-8 px-3 text-xs font-semibold rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors shadow-2xs"
                        >
                          <XCircle className="size-3.5 mr-1" />
                          Cancel Order
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order)}
                        className="h-8 px-3.5 text-xs font-semibold rounded-lg border-border/80 bg-background hover:bg-muted/50 text-foreground transition-colors shadow-2xs"
                      >
                        <FileText className="size-3.5 mr-1 text-muted-foreground" />
                        View Invoice
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setTrackedOrder(order);
                          setTrackedProduct(null);
                        }}
                        className="h-8 px-4 text-xs font-semibold rounded-lg bg-[#D15608] hover:bg-[#9F160A] text-white shadow-2xs transition-colors"
                      >
                        View Order
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. Optional Experience Rating Banner (Matches Yellow Strip in Screenshot) */}
                {!dismissedBanners[order.id] && (
                  <div className="bg-[#FFFBEB] dark:bg-amber-950/25 border-b border-amber-200/50 dark:border-amber-900/40 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <Star className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
                      <span className="font-medium text-[11px] sm:text-xs">
                        Please rate your experience with Padmanabha Fabrics
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDismissedBanners((prev) => ({ ...prev, [order.id]: true }))}
                      className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 p-0.5 rounded transition-colors"
                      aria-label="Dismiss rating banner"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}

                {/* 3. Card Body: Delivery Status & Product Item Rows */}
                <div className="p-4 sm:p-6 space-y-6 bg-card">
                  {/* Delivery Status Title */}
                  <div className="flex items-center gap-2">
                    {tracking.effectiveStatus === "Delivered" && (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {tracking.effectiveStatus === "Shipped" && (
                      <Truck className="size-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                    )}
                    {tracking.isCancelled && (
                      <AlertCircle className="size-4 text-destructive" />
                    )}
                    <h3 className="font-display text-sm sm:text-base font-bold text-foreground">
                      {deliveryHeading}
                    </h3>
                  </div>

                  {/* Product Rows */}
                  <div className="divide-y divide-border/60">
                    {items.map((item: any, idx: number) => {
                      const matchedProd = productsList.find(
                        (p) =>
                          p.id === item.productId ||
                          p.name.toLowerCase() === (item.productName || item.name || "").toLowerCase(),
                      );
                      const prodImg = matchedProd?.images?.[0] || matchedProd?.image || item.image;
                      const prodName = item.productName || item.name || "Handcrafted Fabric / Apparel";
                      const colourStr = item.colour ? ` · Colour: ${item.colour}` : "";
                      const sizeStr = item.size ? ` · Size: ${item.size}` : "";
                      const qtyStr = item.quantity ? ` · Qty: ${item.quantity}` : "";
                      const eligibleDate = formatEligibleDate(order.date || order.createdAt);

                      return (
                        <div
                          key={idx}
                          className="pt-4 first:pt-0 pb-4 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
                        >
                          {/* Left: Square Thumbnail */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-border/80 bg-[#FAF7F2] dark:bg-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {prodImg ? (
                              <img
                                src={prodImg}
                                alt={prodName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <Package className="size-8 text-gold/70" />
                            )}
                          </div>

                          {/* Right: Details & Action Links */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <h4 className="font-display text-xs sm:text-sm font-semibold text-foreground line-clamp-2">
                              {prodName}
                              <span className="text-muted-foreground font-normal text-xs font-sans">
                                {colourStr}
                                {sizeStr}
                                {qtyStr}
                              </span>
                            </h4>

                            <p className="text-[11px] sm:text-xs text-muted-foreground font-sans">
                              Return or Replace items : Eligible through {eligibleDate}
                            </p>

                            {/* Action Links Row (Matches Screenshot: Buy it again | View Product) */}
                            <div className="flex items-center gap-3 pt-1 text-xs">
                              <button
                                type="button"
                                onClick={() => handleBuyAgain(item, matchedProd)}
                                className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                              >
                                <RotateCw className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                <span>Buy it again</span>
                              </button>

                              <span className="text-muted-foreground/40 font-light">|</span>

                              <Link
                                to="/shop"
                                search={matchedProd?.id ? { product: matchedProd.id } : { search: prodName }}
                                className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
                              >
                                <Eye className="size-3.5 text-muted-foreground" />
                                <span>View Product</span>
                              </Link>

                              <span className="text-muted-foreground/40 font-light">|</span>

                              <button
                                type="button"
                                onClick={() => {
                                  setTrackedOrder(order);
                                  setTrackedProduct({
                                    name: prodName,
                                    quantity: item.quantity || 1,
                                    unit: item.unit,
                                    price: item.price,
                                    image: prodImg,
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 font-semibold text-[#D15608] dark:text-[#EDBC3D] hover:underline transition-colors cursor-pointer"
                              >
                                <Truck className="size-3.5" />
                                <span>Track Shipment</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Meesho-Style Order Tracking Modal */}
      <OrderTrackingModal
        order={trackedOrder}
        isOpen={!!trackedOrder}
        onClose={() => {
          setTrackedOrder(null);
          setTrackedProduct(null);
        }}
        clickedProduct={trackedProduct}
      />

      {/* Cancel Order Reason & Confirmation Modal */}
      <CancelOrderModal
        order={cancellingOrder}
        isOpen={!!cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onSuccess={(cancelledOrder) => {
          if (
            trackedOrder &&
            (trackedOrder.id === cancelledOrder.id ||
              (trackedOrder as any).orderNumber === cancelledOrder.id)
          ) {
            setTrackedOrder(cancelledOrder);
          }
          setCancellingOrder(null);
        }}
      />
    </div>
  );
}

export default OrdersPage;

