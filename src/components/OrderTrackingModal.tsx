import { useState } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { money, type Order } from "@/lib/catalog";
import { computeOrderTracking } from "@/lib/orderTracking";
import { toast } from "sonner";

interface OrderTrackingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  clickedProduct?: {
    id?: string;
    name?: string;
    image?: string;
    price?: number;
    quantity?: number;
    unit?: string;
  } | null;
}

export function OrderTrackingModal({
  order,
  isOpen,
  onClose,
  clickedProduct,
}: OrderTrackingModalProps) {
  const [copiedAwb, setCopiedAwb] = useState(false);

  if (!order) return null;

  const tracking = computeOrderTracking(order);

  const handleCopyAwb = () => {
    if (tracking.trackingNumber) {
      navigator.clipboard.writeText(tracking.trackingNumber);
      setCopiedAwb(true);
      toast.success("Tracking number copied to clipboard!");
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

  const orderItemsList = Array.isArray(order.items)
    ? order.items
    : typeof order.items === "string"
      ? (() => {
          try {
            return JSON.parse(order.items);
          } catch {
            return [];
          }
        })()
      : [];
  const activeItem = clickedProduct || (orderItemsList.length > 0 ? orderItemsList[0] : null);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] p-0 overflow-hidden border border-border shadow-2xl bg-card rounded-lg flex flex-col">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#2B1B17] via-[#3D251E] to-[#1E1410] text-[#F8F5EE] p-5 sm:p-6 border-b border-[#D15608]/30">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#D15608]/25 border border-[#D15608]/40 text-[#EDBC3D] text-[11px] font-semibold uppercase tracking-wider">
                <Truck className="size-3.5" />
                <span>Live Shipment Tracking</span>
              </div>
              <h2 className="font-['Cormorant_Garamond'] text-2xl sm:text-3xl font-medium tracking-tight text-white">
                Order #{order.id}
              </h2>
              <p className="text-xs text-white/70">
                Placed on <strong className="text-white font-medium">{order.date || order.createdAt?.split("T")[0]}</strong> · Estimated Delivery in <strong className="text-[#EDBC3D] font-semibold">{tracking.totalDays} Days</strong>
              </p>
            </div>

            {/* Estimated Delivery Highlight Badge */}
            <div className="text-right shrink-0">
              {tracking.isCancelled ? (
                <div className="px-3 py-1.5 rounded-md bg-destructive/20 border border-destructive/40 text-destructive-foreground text-xs font-semibold">
                  Order Cancelled
                </div>
              ) : tracking.effectiveStatus === "Delivered" ? (
                <div className="px-3 py-1.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>Delivered</span>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-xs">
                  <span className="block text-[10px] text-white/60 uppercase tracking-wider font-sans">
                    Estimated Delivery
                  </span>
                  <span className="font-sans font-bold text-[#EDBC3D] text-sm block">
                    {tracking.estimatedDeliveryDate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Product Info Card (The product clicked by the user) */}
          {activeItem && (
            <div className="p-3.5 sm:p-4 rounded-md border border-border bg-secondary/30 flex items-center gap-4">
              <div className="size-16 rounded bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
                {activeItem.image ? (
                  <img
                    src={activeItem.image}
                    alt={activeItem.name || activeItem.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="size-8 text-gold/70" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {activeItem.name || activeItem.productName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground font-sans">
                  <span>Qty: <strong className="text-foreground">{activeItem.quantity}</strong></span>
                  {activeItem.unit && <span>· Unit: {activeItem.unit}</span>}
                  {activeItem.price && (
                    <span>· Price: <strong className="text-primary font-semibold">{money(activeItem.price)}</strong></span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-sans tabular-nums font-bold text-foreground block">
                  Total: {money(order.total)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {order.paymentStatus === "Paid" ? "Paid Online" : "Cash on Delivery"}
                </span>
              </div>
            </div>
          )}

          {/* Cancellation Alert if Cancelled */}
          {tracking.isCancelled && (
            <div className="p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="size-4 shrink-0" />
                <span>This order was cancelled</span>
              </div>
              <p className="text-destructive/80 pl-6">
                {order.notes || "This shipment has been cancelled by the administrator. Any online payment will be refunded to the source account."}
              </p>
            </div>
          )}

          {/* Meesho-Style Vertical Stepper Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Truck className="size-4 text-gold" />
                <span>Delivery & Tracking Milestones</span>
              </h3>
              <span className="text-xs text-muted-foreground font-sans">
                Day {tracking.elapsedDays} of {tracking.totalDays}
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="relative pl-6 sm:pl-8 space-y-6 pt-2">
              {/* Vertical connecting line */}
              <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-border -translate-x-1/2" />

              {tracking.milestones.map((m, idx) => {
                const isPassed = m.isCompleted;
                const isCurrent = m.isCurrent;

                return (
                  <div key={m.step} className="relative flex items-start gap-3 sm:gap-4 group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 size-5 sm:size-7 rounded-full flex items-center justify-center -translate-x-1/2 border-2 transition-all ${
                        isPassed
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                          : isCurrent
                            ? "bg-primary border-primary text-primary-foreground animate-pulse"
                            : "bg-background border-muted text-muted-foreground"
                      }`}
                    >
                      {isPassed ? (
                        <Check className="size-3 sm:size-4 stroke-[3]" />
                      ) : isCurrent ? (
                        <span className="size-2 sm:size-2.5 rounded-full bg-white" />
                      ) : (
                        <span className="size-1.5 sm:size-2 rounded-full bg-muted-foreground/40" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? "text-primary dark:text-[#EDBC3D] font-bold"
                              : isPassed
                                ? "text-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          {m.title}
                          {isCurrent && (
                            <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                              In Progress
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-sans tabular-nums text-muted-foreground">
                          {m.dateStr}
                        </span>
                      </div>

                      <p
                        className={`text-xs ${
                          isPassed || isCurrent
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {m.description}
                      </p>

                      {/* Courier & AWB Copy Box for Shipped step */}
                      {m.step === 3 && (isPassed || isCurrent) && (
                        <div className="mt-2.5 p-2.5 rounded bg-background border border-border/80 flex items-center justify-between gap-2 max-w-md">
                          <div className="text-xs font-mono space-y-0.5 min-w-0">
                            <span className="text-[10px] uppercase font-sans text-muted-foreground font-semibold block">
                              Courier Partner: {tracking.courierName}
                            </span>
                            <span className="font-bold text-foreground text-xs truncate block">
                              AWB: {tracking.trackingNumber}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyAwb}
                            className="h-7 px-2 text-xs flex items-center gap-1 shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            {copiedAwb ? (
                              <>
                                <Check className="size-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold text-[11px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="p-3.5 rounded-md border border-border bg-secondary/20 flex items-start gap-3 text-xs">
            <MapPin className="size-4 text-gold mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground">Delivery Destination:</span>
              <p className="text-muted-foreground leading-relaxed">
                {order.shippingAddress || "Showroom Pickup, Ambattur, Chennai"}
              </p>
              <div className="text-[11px] text-muted-foreground pt-1 flex flex-wrap gap-3">
                <span>Receiver: <strong className="text-foreground">{order.customerName}</strong></span>
                <span>Phone: <strong className="text-foreground">{order.customerPhone}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://wa.me/919940135700?text=Hi%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20track%20my%20order%20%23${encodeURIComponent(order.id)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#25D366] hover:underline"
          >
            <MessageCircle className="size-4" />
            <span>Need Help? Contact Showroom Support on WhatsApp</span>
          </a>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 px-4"
          >
            Close Tracking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
