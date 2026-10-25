import { useState } from "react";
import {
  Package,
  ShoppingBag,
  Heart,
  User,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  LogOut,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  X,
  Lock,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";
import { money, type Order } from "@/lib/catalog";
import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import { computeOrderTracking } from "@/lib/orderTracking";

export function CustomerPortalModal() {
  const {
    isCustomerPortalOpen,
    setIsCustomerPortalOpen,
    customerPortalTab,
    setCustomerPortalTab,
    orders,
    productsList,
    favorites,
    toggleFavorite,
    buyNow,
  } = useStore();

  const { customer, isLoggedIn, loginCustomer, logoutCustomer } = useCustomerAuth();

  // Sign In form states for non-logged-in customers
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("customer123");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live order tracking modal states
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);
  const [trackingModalProduct, setTrackingModalProduct] = useState<any | null>(null);

  // Filter orders for customer (session or recently placed)
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

  const customerOrders = (orders || []).filter((o) => {
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

  // Filter wishlisted products
  const wishlistProducts = productsList.filter((p) => favorites.includes(p.id));

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await loginCustomer(loginEmail, loginPassword);
      if (res.success) {
        setCustomerPortalTab("orders");
      } else {
        setLoginError(res.error || "Failed to sign in. Default password is: customer123");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return {
          label: "Delivered Successfully",
          bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
          icon: <CheckCircle2 className="size-3.5" />,
          step: 4,
        };
      case "Shipped":
        return {
          label: "Shipped · In Transit from Chennai",
          bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 font-semibold",
          icon: <Truck className="size-3.5 text-indigo-600 animate-pulse" />,
          step: 3,
        };
      case "Processing":
        return {
          label: "Processing · Packing Textiles",
          bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
          icon: <Clock className="size-3.5" />,
          step: 2,
        };
      default:
        return {
          label: "Order Confirmed & Received",
          bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
          icon: <CheckCircle2 className="size-3.5" />,
          step: 1,
        };
    }
  };

  return (
    <Dialog open={isCustomerPortalOpen} onOpenChange={setIsCustomerPortalOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border border-border shadow-2xl bg-card rounded-md">
        {/* If customer is NOT logged in: Show Customer Login Dialog */}
        {!isLoggedIn || !customer ? (
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="size-3.5" />
                <span>Customer Account Sign In</span>
              </div>
              <DialogTitle className="font-display text-2xl font-semibold">
                View My Orders & Wishlist
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter your email address and password to track your fabric orders and view your saved wishlist.
              </DialogDescription>
            </DialogHeader>

            {/* Password Hint Card */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm text-xs flex items-center justify-between text-foreground">
              <div className="space-y-0.5">
                <span className="font-semibold text-primary flex items-center gap-1">
                  <KeyRound className="size-3 text-primary" /> Customer Default Password:
                </span>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Default password for all buyers: <strong className="text-foreground">customer123</strong>
                </p>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-sm flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Your Email Address *</label>
                <Input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. priya.sundaram@gmail.com"
                  className="h-10 text-xs rounded-none border-border"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Password *</label>
                <Input
                  type="text"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="customer123"
                  className="h-10 text-xs rounded-none border-border font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Default customer password is <code>customer123</code>.
                </p>
              </div>

              <Button
                type="submit"
                variant="editorial"
                className="w-full h-11 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In to My Account"}
              </Button>
            </form>

            <div className="pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Are you a store administrator?</span>
              <a href="/admin" className="text-primary hover:underline font-medium">
                Admin Sign In (/admin) &rarr;
              </a>
            </div>
          </div>
        ) : (
          /* Customer IS Logged In: Full Customer Dashboard */
          <div className="max-h-[88vh] flex flex-col">
            {/* Top Customer Profile Banner */}
            <div className="p-5 md:p-6 pb-4 border-b border-border bg-sand-50/70 dark:bg-secondary/40 shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base uppercase shrink-0 shadow-xs">
                    {customer.name ? customer.name.charAt(0) : "C"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {customer.name || "Customer Account"}
                      </h2>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Signed In
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{customer.email}</span>
                      <span>•</span>
                      <span>{customer.phone}</span>
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive h-8 px-2.5 cursor-pointer"
                  onClick={() => {
                    logoutCustomer();
                    setIsCustomerPortalOpen(false);
                  }}
                >
                  <LogOut className="size-3.5 mr-1" /> Sign Out
                </Button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-5 border-b border-border/80 pb-0">
                <button
                  type="button"
                  onClick={() => setCustomerPortalTab("orders")}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    customerPortalTab === "orders"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Package className="size-3.5" />
                  <span>My Orders</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary font-bold font-sans tabular-nums">
                    {customerOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerPortalTab("wishlist")}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    customerPortalTab === "wishlist"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className="size-3.5" />
                  <span>My Wishlist</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary font-bold font-sans tabular-nums">
                    {wishlistProducts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerPortalTab("profile")}
                  className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    customerPortalTab === "profile"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="size-3.5" />
                  <span>Account & Password</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: MY ORDERS */}
              {customerPortalTab === "orders" && (
                <div className="space-y-4">
                  {customerOrders.length === 0 ? (
                    <div className="p-8 text-center bg-secondary/30 border border-dashed border-border rounded-sm space-y-3">
                      <ShoppingBag className="size-10 text-muted-foreground/60 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          No Orders Yet
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          When you purchase silk sarees or fabrics, your order tracking, invoice details, and dispatch status will show right here.
                        </p>
                      </div>
                      <Button
                        variant="editorial"
                        size="sm"
                        className="text-xs uppercase tracking-wider"
                        onClick={() => setIsCustomerPortalOpen(false)}
                      >
                        Explore Fabrics
                      </Button>
                    </div>
                  ) : (
                    customerOrders.map((order) => {
                      const badge = getStatusBadge(order.status);
                      return (
                        <div
                          key={order.id}
                          className="border border-border bg-card rounded-sm p-4.5 space-y-4 shadow-2xs hover:border-border/80 transition-colors"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-border">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm tracking-tight text-foreground font-sans tabular-nums">
                                  #{order.id}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${badge.bg}`}
                                >
                                  {badge.icon}
                                  <span>{badge.label}</span>
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground font-sans tabular-nums block mt-0.5">
                                Ordered on {order.date}
                              </span>
                            </div>

                            <div className="text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                              <span className="font-display font-bold text-base text-primary tabular-nums">
                                {money(order.total)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {order.paymentStatus === "Paid" ? "Payment: Paid (Online)" : "Payment: Cash on Delivery"}
                              </span>
                            </div>
                          </div>

                          {/* Live Visual Tracker */}
                          <div className="py-2 px-3 bg-secondary/40 border border-border/60 rounded-xs space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-medium text-foreground">
                              <span className="flex items-center gap-1">
                                <span className={`size-2 rounded-full ${badge.step >= 1 ? "bg-emerald-500" : "bg-muted"}`} />
                                Order Placed
                              </span>
                              <span className="flex items-center gap-1">
                                <span className={`size-2 rounded-full ${badge.step >= 2 ? "bg-emerald-500" : "bg-muted"}`} />
                                Packing
                              </span>
                              <span className="flex items-center gap-1">
                                <span className={`size-2 rounded-full ${badge.step >= 3 ? "bg-indigo-600 animate-ping" : "bg-muted"}`} />
                                <strong className={order.status === "Shipped" ? "text-indigo-600 dark:text-indigo-400" : ""}>
                                  Shipped (In Transit)
                                </strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className={`size-2 rounded-full ${badge.step >= 4 ? "bg-emerald-500" : "bg-muted"}`} />
                                Delivered
                              </span>
                            </div>

                            {/* Progress bar line */}
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-500"
                                style={{
                                  width:
                                    badge.step === 4
                                      ? "100%"
                                      : badge.step === 3
                                        ? "75%"
                                        : badge.step === 2
                                          ? "50%"
                                          : "25%",
                                }}
                              />
                            </div>
                          </div>

                          {/* Items List - Clickable for live tracking */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                Items Ordered:
                              </span>
                              <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                                <Truck className="size-3" /> Click item to view live shipment tracking
                              </span>
                            </div>
                            <div className="divide-y divide-border/60">
                              {getOrderItems(order).map((item, idx) => {
                                const matchedProd = productsList.find(
                                  (p) =>
                                    p.id === item.productId ||
                                    p.name.toLowerCase() === item.productName.toLowerCase(),
                                );
                                const prodImg = matchedProd?.images?.[0] || matchedProd?.image;

                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setTrackingModalOrder(order);
                                      setTrackingModalProduct({
                                        name: item.productName,
                                        quantity: item.quantity,
                                        unit: item.unit,
                                        price: item.price,
                                        image: prodImg,
                                      });
                                    }}
                                    className="py-2.5 px-2.5 -mx-1 rounded-sm hover:bg-primary/5 cursor-pointer transition-colors flex justify-between items-center group border border-transparent hover:border-primary/20"
                                    title="Click to view live tracking details"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="size-10 rounded bg-secondary/50 border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                        {prodImg ? (
                                          <img
                                            src={prodImg}
                                            alt={item.productName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                          />
                                        ) : (
                                          <Package className="size-5 text-gold/70" />
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold font-sans tabular-nums text-primary text-xs">
                                            {item.quantity}x
                                          </span>
                                          <span className="font-medium text-foreground text-xs group-hover:text-primary transition-colors truncate">
                                            {item.productName}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground block">
                                          {item.unit} · Click to track shipment
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0 flex items-center gap-2.5">
                                      <span className="font-sans tabular-nums font-semibold text-foreground text-xs">
                                        {money(item.price * item.quantity)}
                                      </span>
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <Truck className="size-3" /> Track
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Shipping address & Live Tracking / WhatsApp buttons */}
                          <div className="pt-2 border-t border-border/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div className="text-muted-foreground text-[11px] max-w-sm">
                              <span className="font-medium text-foreground">Delivery To: </span>
                              {order.shippingAddress || "Chennai, Tamil Nadu"}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5 cursor-pointer"
                                onClick={() => {
                                  setTrackingModalOrder(order);
                                  setTrackingModalProduct(null);
                                }}
                              >
                                <Truck className="size-3.5" />
                                <span>Track Shipment</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-[#25D366] hover:text-[#25D366] hover:bg-emerald-50 border-emerald-300 dark:border-emerald-800 shrink-0 cursor-pointer"
                                asChild
                              >
                                <a
                                  href={`https://wa.me/919940145700?text=${encodeURIComponent(
                                    `Hi Padmanabha Fabrics, I would like to check the tracking status of my Order #${order.id}. Current status shown: ${order.status}.`,
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <MessageCircle className="size-3.5 mr-1 text-[#25D366]" />
                                  WhatsApp
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: MY WISHLIST */}
              {customerPortalTab === "wishlist" && (
                <div className="space-y-4">
                  {wishlistProducts.length === 0 ? (
                    <div className="p-8 text-center bg-secondary/30 border border-dashed border-border rounded-sm space-y-3">
                      <Heart className="size-10 text-muted-foreground/60 stroke-1 mx-auto" />
                      <div className="space-y-1">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          Your Wishlist is Empty
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Tap the heart icon on any saree or fabric in our shop to save your favorite designs here for later.
                        </p>
                      </div>
                      <Button
                        variant="editorial"
                        size="sm"
                        className="text-xs uppercase tracking-wider"
                        onClick={() => setIsCustomerPortalOpen(false)}
                      >
                        Browse Shop
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {wishlistProducts.map((p) => (
                        <div
                          key={p.id}
                          className="border border-border bg-card rounded-sm p-3 flex gap-3 items-center justify-between shadow-2xs"
                        >
                          <img
                            src={p.image || "/assets/burgundy-silk.jpg"}
                            alt={p.name}
                            className="size-16 object-cover rounded-xs border border-border shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold truncate text-foreground">{p.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{p.colour}</p>
                            <p className="text-xs font-bold text-primary font-sans tabular-nums mt-1">
                              {money(p.price)} / {p.unit}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              variant="editorial"
                              className="h-7 text-[11px] px-2.5 cursor-pointer"
                              onClick={() => {
                                setIsCustomerPortalOpen(false);
                                buyNow(p, 1);
                              }}
                            >
                              Buy Now
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-[10px] text-muted-foreground hover:text-destructive cursor-pointer px-1"
                              onClick={() => toggleFavorite(p.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACCOUNT & PASSWORD */}
              {customerPortalTab === "profile" && (
                <div className="space-y-4 max-w-lg mx-auto">
                  {/* Credentials Reminder Card */}
                  <div className="p-4 bg-primary/5 border border-primary/25 rounded-sm space-y-2">
                    <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                      <KeyRound className="size-4" />
                      <span>Your Login Credentials</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You can use these details to sign in from any device to see your orders and wishlist:
                    </p>
                    <div className="p-2.5 bg-card border border-border rounded-xs text-xs font-mono space-y-1">
                      <div>
                        Username / Email: <strong className="text-foreground">{customer.email}</strong>
                      </div>
                      <div>
                        Password: <strong className="text-foreground">customer123</strong>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="p-4 bg-card border border-border rounded-sm space-y-3 text-xs">
                    <h3 className="font-semibold text-sm border-b border-border pb-2 text-foreground">
                      Customer Profile Information
                    </h3>

                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span>Full Name:</span>
                        <span className="font-medium text-foreground">{customer.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span>Email Address:</span>
                        <span className="font-medium text-foreground">{customer.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span>Phone Number:</span>
                        <span className="font-medium font-sans tabular-nums text-foreground">
                          {customer.phone}
                        </span>
                      </div>
                      <div className="py-1">
                        <span className="block mb-1 font-medium text-foreground">Saved Delivery Address:</span>
                        <p className="text-[11px] text-muted-foreground bg-secondary/50 p-2 border border-border/80 rounded-xs">
                          {customer.address || "No address saved yet. Address will be saved upon your first checkout."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
                    onClick={() => {
                      logoutCustomer();
                      setIsCustomerPortalOpen(false);
                    }}
                  >
                    <LogOut className="size-3.5 mr-1.5" /> Sign Out from This Device
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        order={trackingModalOrder}
        isOpen={!!trackingModalOrder}
        onClose={() => {
          setTrackingModalOrder(null);
          setTrackingModalProduct(null);
        }}
        clickedProduct={trackingModalProduct}
      />
    </Dialog>
  );
}
