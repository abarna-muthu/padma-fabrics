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
    label: "Need to change delivery address or contact number",
    icon: MapPin,
  },
  {
    id: "delivery_time",
    label: "Delivery time is too long / Expected delivery sooner",
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
    label: "Other reason (please describe below)",
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
      const res = await cancelOrder(order.id, reasonText, additionalNotes.trim());

      if (res.success) {
        toast.success(`Order #${order.id} has been cancelled successfully.`, {
          description: "Our Chennai fulfillment center and inventory have been updated.",
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
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border bg-card rounded-xl shadow-2xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)]">
        {/* Header Banner */}
        <div className="bg-destructive/10 border-b border-destructive/20 p-5 sm:p-6 text-foreground">
          <DialogHeader className="text-left space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-destructive/15 text-destructive text-[11px] font-semibold uppercase tracking-wider w-fit">
              <AlertTriangle className="size-3.5" />
              <span>Cancel Order Request</span>
            </div>
            <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
              Cancel Order #{order.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please let us know why you wish to cancel this order so we can improve our service.
            </DialogDescription>
          </DialogHeader>

          {/* Mini Order Summary Card */}
          <div className="mt-4 p-3 bg-card/80 backdrop-blur-xs rounded-lg border border-border/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground block">
                Placed on {order.date || (order.createdAt ? order.createdAt.split("T")[0] : "Recently")}
              </span>
              <span className="font-semibold text-foreground">
                {getItemsCount()} {getItemsCount() === 1 ? "Item" : "Items"} · {order.customerName}
              </span>
            </div>
            <div className="text-right">
              <span className="font-sans font-bold text-primary text-sm block tabular-nums">
                {money(order.total)}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {order.paymentStatus === "Paid" ? "Online Paid" : "Cash on Delivery"}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-xs flex items-start gap-2">
              <XCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-foreground block">
              Reason for Cancellation <span className="text-destructive">*</span>
            </label>
            <div className="space-y-2">
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
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? "border-destructive bg-destructive/5 text-foreground ring-1 ring-destructive/40"
                        : "border-border hover:border-border/80 hover:bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 text-destructive focus:ring-destructive accent-destructive cursor-pointer"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className={`size-3.5 shrink-0 ${isSelected ? "text-destructive" : "text-muted-foreground"}`} />
                      <span className={isSelected ? "font-semibold text-foreground" : "font-normal text-foreground/80"}>
                        {reason.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Additional Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Additional Comments / Feedback</span>
              <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Textarea
              placeholder="Provide any additional comments or reason details..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="text-xs resize-none rounded-lg"
            />
          </div>

          {/* Refund Notice & Information Box */}
          <div className="p-3 bg-secondary/50 border border-border/80 rounded-lg text-[11px] text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <span>Notice:</span>
            </div>
            <p>
              • If paid online, our accounts team will initiate a 100% refund to your original payment method.
            </p>
            <p>
              • All reserved textiles in this order will be restored to store inventory immediately.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-secondary/30 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-9 text-xs"
          >
            Keep Order
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmCancel}
            disabled={isSubmitting || !selectedReason}
            className="w-full sm:w-auto h-9 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Cancelling Order...</span>
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
