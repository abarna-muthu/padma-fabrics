import type { Order } from "@/lib/catalog";

export interface TrackingMilestone {
  step: number;
  title: string;
  description: string;
  dateStr: string;
  isCompleted: boolean;
  isCurrent: boolean;
  courier?: string;
  trackingId?: string;
}

export interface OrderTrackingInfo {
  totalDays: number;
  elapsedDays: number;
  effectiveStatus: Order["status"];
  currentStep: number; // 1: Confirmed, 2: Processing, 3: Shipped, 4: Out for Delivery, 5: Delivered
  estimatedDeliveryDate: string;
  isCancelled: boolean;
  milestones: TrackingMilestone[];
  courierName: string;
  trackingNumber: string;
}

/**
 * Computes live Meesho-style order tracking progress based on order date & deliveryDays.
 * Day 1: Pending (Order Confirmed)
 * Day 2: Processing (Quality Packed)
 * Day 3 to (totalDays - 1): Shipped (In Transit)
 * Day >= totalDays: Delivered
 * Cancelled: Admin explicit cancel
 */
export function computeOrderTracking(order: Order): OrderTrackingInfo {
  const totalDays = Math.max(1, Number(order.deliveryDays) || 5);
  const rawDate = order.date || (order.createdAt ? order.createdAt.split("T")[0] : "");
  const orderDate = rawDate ? new Date(rawDate + "T00:00:00") : new Date();

  const today = new Date();
  const diffMs = Math.max(0, today.getTime() - orderDate.getTime());
  const elapsedDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  const isCancelled = order.status === "Cancelled";

  // Auto-calculated step based on user specifications:
  // Day 1: Pending / Order Confirmed
  // Day 2: Processing
  // Day 3+: Shipped
  // Day >= totalDays: Delivered
  let autoStatus: Order["status"] = "Pending";
  if (elapsedDays === 1) {
    autoStatus = "Pending";
  } else if (elapsedDays === 2) {
    autoStatus = "Processing";
  } else if (elapsedDays >= 3 && elapsedDays < totalDays) {
    autoStatus = "Shipped";
  } else if (elapsedDays >= totalDays) {
    autoStatus = "Delivered";
  }

  // If status is Cancelled, it stays Cancelled.
  // If admin manually marked as Shipped or Delivered or has an override, honor admin's override.
  let effectiveStatus: Order["status"] = autoStatus;
  if (isCancelled) {
    effectiveStatus = "Cancelled";
  } else if (order.manualStatusOverride && order.status) {
    effectiveStatus = order.status;
  } else if (order.status === "Shipped" || order.status === "Delivered") {
    effectiveStatus = order.status;
  }

  // Determine current step index (1 to 5)
  let currentStep = 1;
  if (!isCancelled) {
    if (effectiveStatus === "Delivered") {
      currentStep = 5;
    } else if (effectiveStatus === "Shipped") {
      currentStep = elapsedDays >= totalDays - 1 ? 4 : 3;
    } else if (effectiveStatus === "Processing") {
      currentStep = 2;
    } else {
      currentStep = 1;
    }
  }

  const addDays = (d: Date, days: number) => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const courierName = order.courierName || "ST Courier / DTDC Express";
  const trackingNumber =
    order.trackingNumber || `PF-TRK-${order.id.replace(/[^a-zA-Z0-9]/g, "")}`;

  const estimatedDeliveryDate = addDays(orderDate, totalDays);

  const milestones: TrackingMilestone[] = [
    {
      step: 1,
      title: "Order Confirmed",
      description: "Order received & verified by Padmanabha Fabrics showroom, Ambattur, Chennai.",
      dateStr: addDays(orderDate, 0),
      isCompleted: currentStep >= 1 && !isCancelled,
      isCurrent: currentStep === 1 && !isCancelled,
    },
    {
      step: 2,
      title: "Processing & Quality Packed",
      description: "Textiles inspected, measured, ironed & packed with seal.",
      dateStr: addDays(orderDate, 1),
      isCompleted: currentStep >= 2 && !isCancelled,
      isCurrent: currentStep === 2 && !isCancelled,
    },
    {
      step: 3,
      title: "Shipped · In Transit",
      description: `Dispatched via ${courierName}. Waybill AWB: ${trackingNumber}`,
      dateStr: addDays(orderDate, 2),
      isCompleted: currentStep >= 3 && !isCancelled,
      isCurrent: currentStep === 3 && !isCancelled,
      courier: courierName,
      trackingId: trackingNumber,
    },
    {
      step: 4,
      title: "Out for Delivery",
      description: "Shipment reached destination distribution hub. Courier executive assigned.",
      dateStr: addDays(orderDate, Math.max(2, totalDays - 1)),
      isCompleted: currentStep >= 4 && !isCancelled,
      isCurrent: currentStep === 4 && !isCancelled,
    },
    {
      step: 5,
      title: "Delivered",
      description: `Package delivered to: ${order.shippingAddress || "Customer address"}`,
      dateStr: estimatedDeliveryDate,
      isCompleted: currentStep >= 5 && !isCancelled,
      isCurrent: currentStep === 5 && !isCancelled,
    },
  ];

  return {
    totalDays,
    elapsedDays,
    effectiveStatus,
    currentStep,
    estimatedDeliveryDate,
    isCancelled,
    milestones,
    courierName,
    trackingNumber,
  };
}
