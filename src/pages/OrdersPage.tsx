import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";
import { money, type Order } from "@/lib/catalog";
import { computeOrderTracking } from "@/lib/orderTracking";
import { OrderTrackingModal } from "@/components/OrderTrackingModal";
import {
  Package,
  ArrowRight,
  Truck,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OrdersPage() {
  const { customer, isLoggedIn } = useCustomerAuth();
  const { orders, productsList, setIsCustomerPortalOpen, setCustomerPortalTab } = useStore();

  const [orderQuery, setOrderQuery] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackedProduct, setTrackedProduct] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  const customerOrders = matchedOrders.length > 0 ? matchedOrders : (orders || []).slice(0, 4);

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
        o.customerPhone.replace(/\D/g, "").includes(q.replace(/\D/g, "")),
    );

    if (found) {
      setTrackedOrder(found);
      setTrackedProduct(null);
    } else {
      setSearchError(`No order found matching "${orderQuery}". Please check your order ID.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumb items={[{ label: "My Orders & Tracking" }]} className="mb-2" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Fulfillment & Dispatch"
          title="My Orders & Live Tracking"
          description="Track your textile orders with live milestone progress from our Ambattur, Chennai showroom."
        />

        {!isLoggedIn && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setCustomerPortalTab("orders");
              setIsCustomerPortalOpen(true);
            }}
            className="text-xs h-9 font-semibold text-primary border-primary/40 hover:bg-primary/10 self-start md:self-auto"
          >
            Sign In to View All Your Orders &rarr;
          </Button>
        )}
      </div>

      {/* Instant Order Search / Tracking Lookup Bar */}
      <div className="p-6 rounded-lg bg-card border border-border shadow-xs max-w-2xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-gold" />
          <h3 className="font-display text-base font-semibold text-foreground">
            Quick Shipment Tracking
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter your Order ID (e.g. <strong className="text-foreground">PF-1081</strong>) or registered phone number to view live Meesho-style milestone delivery tracking.
        </p>

        <form onSubmit={handleSearchOrder} className="flex gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter Order ID (e.g. PF-1081)..."
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="pl-9 text-xs h-10 bg-background"
            />
          </div>
          <Button type="submit" className="h-10 px-5 text-xs bg-primary text-primary-foreground font-semibold">
            Track Now
          </Button>
        </form>

        {searchError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {isLoggedIn && customer ? `Orders for ${customer.name}` : "Recent Orders & Shipments"}
          </h3>
          <span className="text-xs text-muted-foreground font-sans">
            Showing {customerOrders.length} orders
          </span>
        </div>

        {customerOrders.length === 0 ? (
          <div className="p-10 text-center bg-card border border-dashed border-border rounded-lg space-y-3">
            <Package className="size-10 text-muted-foreground/60 mx-auto" />
            <h4 className="font-display text-base font-semibold">No Orders Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven't placed any orders yet, or they are associated with a different phone or email.
            </p>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/shop">Explore Collections</Link>
            </Button>
          </div>
        ) : (
          customerOrders.map((order) => {
            const tracking = computeOrderTracking(order);

            return (
              <div
                key={order.id}
                className="p-5 rounded-lg border border-border bg-card shadow-xs space-y-4 hover:border-gold/50 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm tracking-tight text-foreground font-sans">
                        #{order.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          tracking.isCancelled
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : tracking.effectiveStatus === "Delivered"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                              : tracking.effectiveStatus === "Shipped"
                                ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {tracking.isCancelled ? (
                          <span>Cancelled</span>
                        ) : tracking.effectiveStatus === "Delivered" ? (
                          <>
                            <CheckCircle2 className="size-3 text-emerald-600" />
                            <span>Delivered</span>
                          </>
                        ) : tracking.effectiveStatus === "Shipped" ? (
                          <>
                            <Truck className="size-3 text-indigo-600 animate-pulse" />
                            <span>Shipped · In Transit</span>
                          </>
                        ) : (
                          <>
                            <Clock className="size-3 text-amber-600" />
                            <span>{tracking.effectiveStatus}</span>
                          </>
                        )}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
                        {tracking.totalDays} Days Delivery
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground font-sans block">
                      Ordered on {order.date || order.createdAt?.split("T")[0]} · Expected by <strong className="text-foreground">{tracking.estimatedDeliveryDate}</strong>
                    </span>
                  </div>

                  <div className="text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="font-sans font-bold text-base text-primary tabular-nums">
                      {money(order.total)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-sans">
                      {order.paymentStatus === "Paid" ? "Paid (Online)" : "Cash on Delivery"}
                    </span>
                  </div>
                </div>

                {/* Items in order - Clickable */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Ordered Items:
                    </span>
                    <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                      <Truck className="size-3" /> Click product to view live tracking
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
                            setTrackedOrder(order);
                            setTrackedProduct({
                              name: item.productName,
                              quantity: item.quantity,
                              unit: item.unit,
                              price: item.price,
                              image: prodImg,
                            });
                          }}
                          className="py-3 px-3 my-1.5 rounded-lg bg-background/60 hover:bg-[#FAF6EE] dark:hover:bg-white/5 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group border border-border/80 hover:border-[#B8913A] shadow-2xs hover:shadow-xs"
                          title="Click to track this product shipment"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-12 rounded bg-secondary/50 border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
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
                              <span className="text-[10px] text-muted-foreground block mt-0.5">
                                {item.unit} · <strong className="text-[#6B1E2E] dark:text-[#E7C880]">Click to view live tracking</strong>
                              </span>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
                            <span className="font-sans tabular-nums font-semibold text-foreground text-xs">
                              {money(item.price * item.quantity)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#6B1E2E] text-white group-hover:bg-[#B8913A] transition-all shadow-2xs">
                              <Truck className="size-3" /> Track Shipment
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="text-muted-foreground text-[11px] max-w-sm">
                    <span className="font-medium text-foreground">Delivery To: </span>
                    {order.shippingAddress || "Showroom pickup, Ambattur, Chennai"}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setTrackedOrder(order);
                        setTrackedProduct(null);
                      }}
                      className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5"
                    >
                      <Truck className="size-3.5" />
                      <span>Track Shipment</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-[#25D366] hover:bg-emerald-50 border-emerald-300 dark:border-emerald-800"
                      asChild
                    >
                      <a
                        href={`https://wa.me/919940135700?text=${encodeURIComponent(
                          `Hi Padmanabha Fabrics, I would like to check the tracking status of my Order #${order.id}.`,
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
    </div>
  );
}

export default OrdersPage;
