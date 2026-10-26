import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/context/StoreContext";
import { money, type Order } from "@/lib/catalog";
import {
  AlertTriangle,
  XCircle,
  Clock,
  HelpCircle,
  PackageX,
  CreditCard,
  MapPin,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CancelOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (cancelledOrder: Order) => void;
}

const CANCELLATION_REASONS = [
  {
    id: "ordered_by_mistake",
    label: "Ordered by mistake / Duplicate order",
    icon: HelpCircle,
  },
  {
    id: "change_address",
    label: "Need to change delivery address or phone number",
    icon: MapPin,
  },
  {
    id: "delivery_time",
    label: "Delivery time is too long / Expected sooner",
    icon: Clock,
  },
  {
    id: "color_fabric_preference",
    label: "Changed fabric / color or design preference",
    icon: Sparkles,
  },
  {
    id: "found_better_price",
    label: "Found a better price or alternative elsewhere",
    icon: CreditCard,
  },
  {
    id: "other",
    label: "Other reason",
    icon: PackageX,
  },
];

export function CancelOrderModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: CancelOrderModalProps) {
  const { cancelOrder } = useStore();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!order) return null;

  const handleConfirmCancel = async () => {
    if (!selectedReason) {
      setError("Please select a reason for cancelling this order.");
      return;
    }

    const reasonObj = CANCELLATION_REASONS.find((r) => r.id === selectedReason);
    const reasonText = reasonObj ? reasonObj.label : selectedReason;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderIdentifier = order.id || (order as any).orderNumber;
      const res = await cancelOrder(orderIdentifier, reasonText, additionalNotes.trim());

      if (res.success) {
        toast.success(`Order #${order.id} has been cancelled successfully.`, {
          description: "Our admin portal and store inventory have been updated.",
        });
        onSuccess?.({
          ...order,
          status: "Cancelled",
          notes: order.notes
            ? `${order.notes}\n[Cancelled by Customer: ${reasonText}]`
            : `[Cancelled by Customer: ${reasonText}]`,
        });
        onClose();
      } else {
        setError(res.error || "Failed to cancel order. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while cancelling your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemsCount = () => {
    if (!order.items) return 0;
    if (Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    }
    return 1;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setError(null);
          setSelectedReason("");
          setAdditionalNotes("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md max-h-[85vh] p-0 flex flex-col overflow-hidden border border-border bg-card rounded-xl shadow-2xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)]">
        {/* Compact Header Banner */}
        <div className="bg-destructive/10 border-b border-destructive/20 p-4 sm:p-5 shrink-0 text-foreground">
          <DialogHeader className="text-left space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-semibold uppercase tracking-wider w-fit">
              <AlertTriangle className="size-3" />
              <span>Cancel Order</span>
            </div>
            <DialogTitle className="font-display text-lg sm:text-xl font-bold text-foreground">
              Cancel Order #{order.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a reason below to confirm order cancellation.
            </DialogDescription>
          </DialogHeader>

          {/* Mini Order Summary */}
          <div className="mt-2.5 p-2.5 bg-card/90 rounded-lg border border-border/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] text-muted-foreground block truncate">
                Placed on {order.date || (order.createdAt ? order.createdAt.split("T")[0] : "Recently")}
              </span>
              <span className="font-semibold text-foreground truncate block">
                {getItemsCount()} {getItemsCount() === 1 ? "Item" : "Items"} · {order.customerName}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-sans font-bold text-primary text-xs sm:text-sm block tabular-nums">
                {money(order.total)}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                {order.paymentStatus === "Paid" ? "Online Paid" : "Cash on Delivery"}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs flex items-start gap-2">
              <XCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Why would you like to cancel? <span className="text-destructive">*</span>
            </label>
            <div className="space-y-1.5">
              {CANCELLATION_REASONS.map((reason) => {
                const Icon = reason.icon;
                const isSelected = selectedReason === reason.id;
                return (
                  <label
                    key={reason.id}
                    onClick={() => {
                      setSelectedReason(reason.id);
                      setError(null);
                    }}
                    className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? "border-destructive bg-destructive/5 text-foreground ring-1 ring-destructive/40 font-medium"
                        : "border-border hover:border-border/80 hover:bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="text-destructive focus:ring-destructive accent-destructive cursor-pointer shrink-0"
                    />
                    <Icon className={`size-3.5 shrink-0 ${isSelected ? "text-destructive" : "text-muted-foreground"}`} />
                    <span className="flex-1 min-w-0 truncate">
                      {reason.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional Notes Textarea */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
              <span>Additional Comments (Optional)</span>
            </label>
            <Textarea
              placeholder="Any details or feedback you would like to share..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              className="text-xs resize-none rounded-lg h-14 min-h-[56px]"
            />
          </div>

          {/* Refund Notice & Information Box */}
          <div className="p-2.5 bg-secondary/50 border border-border/80 rounded-lg text-[10px] text-muted-foreground leading-relaxed">
            • Reserved products will be returned to stock immediately.
            <br />
            • If paid online, a full refund will be initiated to your source account.
          </div>
        </div>

        {/* ALWAYS VISIBLE STICKY FOOTER CONTROLS */}
        <div className="p-3 sm:p-4 bg-secondary/50 border-t border-border flex items-center justify-end gap-2 shrink-0 z-10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8.5 px-3.5 text-xs font-medium cursor-pointer"
          >
            Keep Order
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmCancel}
            disabled={isSubmitting || !selectedReason}
            className="h-8.5 px-4 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <XCircle className="size-3.5" />
                <span>Confirm Cancellation</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CancelOrderModal;
