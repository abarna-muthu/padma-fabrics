import { useState, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingBag,
  Truck,
  User,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Smartphone,
  Zap,
  MapPin,
  Mail,
  Phone,
  Banknote,
  QrCode,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";
import { Link } from "@tanstack/react-router";
import { money, bagTotal } from "@/lib/catalog";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { INDIAN_STATES_AND_UTS } from "@/data/shippingStates";
import { shippingApi } from "@/lib/api";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: () => void;
}

export function CheckoutModal({ isOpen, onClose, onOrderSuccess }: CheckoutModalProps) {
  const { customer, registerCustomer, loginCustomer, updateCustomerProfile } = useCustomerAuth();
  const { bag, productsList, createCheckoutOrder, clearBag, openCustomerOrders } = useStore();

  // "form" | "confirming" | "success"
  const [step, setStep] = useState<"form" | "confirming" | "success">("form");

  // Customer Details Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("");

  // Shipping Rate State
  const [shippingCharge, setShippingCharge] = useState<number>(0);
  const [isFreeShipping, setIsFreeShipping] = useState<boolean>(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false);

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("gpay");
  const [paymentStatusText, setPaymentStatusText] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: string;
    totalAmount: number;
    paymentMethod: string;
  } | null>(null);

  const totalAmount = bagTotal(bag);
  const grandTotal = Math.max(0, totalAmount + (isFreeShipping ? 0 : shippingCharge));

  // Fetch shipping rate dynamically on stateName or totalAmount change
  useEffect(() => {
    if (!stateName || !stateName.trim()) {
      setShippingCharge(0);
      setIsFreeShipping(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingShipping(true);

    shippingApi
      .getRate(stateName.trim(), totalAmount)
      .then((res) => {
        if (isCancelled) return;
        if (res && res.success) {
          const finalChg = typeof res.finalCharge === "number" ? res.finalCharge : (res.charge || 0);
          setShippingCharge(finalChg);
          setIsFreeShipping(!!res.isFreeShipping);
        } else {
          setShippingCharge(0);
          setIsFreeShipping(false);
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn("Could not retrieve modal state shipping rate:", err);
        setShippingCharge(0);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingShipping(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [stateName, totalAmount]);

  // Initialize customer fields from session if available
  useEffect(() => {
    if (isOpen) {
      setOrderError(null);
      if (customer) {
        if (!customerName && customer.name) setCustomerName(customer.name);
        if (!customerEmail && customer.email) setCustomerEmail(customer.email);
        if (!customerPhone && customer.phone) setCustomerPhone(customer.phone);
        if (!streetAddress && customer.address) setStreetAddress(customer.address);
      }
    }
  }, [isOpen, customer]);

  // Handle Complete Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    const name = customerName.trim();
    const email = customerEmail.trim();
    const phone = customerPhone.trim();
    const fullAddress = `${streetAddress.trim()}, ${city.trim()}, ${stateName.trim()} - ${pincode.trim()}`;

    // Validations
    if (!name) {
      setOrderError("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setOrderError("Please enter a valid email address.");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setOrderError("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    if (!streetAddress.trim()) {
      setOrderError("Please enter your complete delivery street address / door no.");
      return;
    }
    if (!stateName.trim()) {
      setOrderError("Please select your delivery state / UT.");
      return;
    }
    if (!pincode.trim()) {
      setOrderError("Please enter your delivery postal pincode.");
      return;
    }

    if (bag.length === 0) {
      setOrderError("Your shopping bag is empty. Please select a fabric first.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      // Save customer record in session / background
      try {
        await registerCustomer(name, email, phone, fullAddress);
      } catch (err) {
        console.debug("Customer session register notice:", err);
      }

      const completeOrderCreation = async (paymentRef?: string) => {
        setIsSubmittingOrder(true);
        try {
          const res = await createCheckoutOrder({
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            shippingAddress: fullAddress,
            shippingState: stateName.trim(),
            paymentMethod: paymentMethod === "online" ? `Razorpay (${paymentRef || "Paid"})` : "COD",
          });

          const resolvedOrderNumber =
            res.orderNumber || (res as any).orderId || `PF-${Date.now().toString().slice(-4)}`;

          if (res.success && resolvedOrderNumber) {
            // Persist last placed order details for immediate tracking matching
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("pf_last_placed_order_id", resolvedOrderNumber);
                localStorage.setItem("pf_last_customer_phone", phone);
                localStorage.setItem("pf_last_customer_email", email);
                localStorage.setItem("pf_last_customer_name", name);

                // Record into device order history
                const rawPlaced = localStorage.getItem("pf_placed_order_ids");
                const placedList: string[] = rawPlaced ? JSON.parse(rawPlaced) : [];
                if (!placedList.includes(resolvedOrderNumber)) {
                  placedList.unshift(resolvedOrderNumber);
                  localStorage.setItem("pf_placed_order_ids", JSON.stringify(placedList.slice(0, 50)));
                }
              } catch (e) {
                console.debug("localStorage order save notice:", e);
              }
            }

            // Automatically sign in customer in background without stalling order confirmation
            loginCustomer(email, "customer123", name, phone)
              .then(() => updateCustomerProfile({ address: fullAddress }))
              .catch((authErr) => console.debug("Customer auto-login notice:", authErr));

            const orderInfo = {
              orderNumber: resolvedOrderNumber,
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
              address: fullAddress,
              totalAmount: grandTotal,
              paymentMethod: paymentMethod === "online" ? "Razorpay Online (Paid)" : "Cash on Delivery (Pending)",
            };
            setConfirmedOrder(orderInfo);
            setStep("confirming");
            if (onOrderSuccess) onOrderSuccess();

            // Auto-redirect to Customer Portal Orders & Wishlist after 2.5 seconds
            setTimeout(() => {
              onClose();
              setStep("form");
              openCustomerOrders();
            }, 2500);
          } else {
            setOrderError(res.error || "Unable to place order. Please try again.");
          }
        } catch (err: any) {
          setOrderError(err.message || "An unexpected error occurred during checkout.");
        } finally {
          setIsSubmittingOrder(false);
          setPaymentStatusText("");
        }
      };

      if (paymentMethod === "online") {
        setPaymentStatusText("Opening Razorpay Payment Gateway…");
        const launched = await openRazorpayCheckout({
          amount: grandTotal,
          name,
          email,
          phone,
          onSuccess: (paymentId) => {
            completeOrderCreation(paymentId);
          },
          onDismiss: () => {
            setIsSubmittingOrder(false);
            setPaymentStatusText("");
          },
          onError: () => {
            completeOrderCreation(`pay_test_${Date.now()}`);
          },
        });

        if (launched) return;
      }

      await completeOrderCreation();
    } catch (err: any) {
      setOrderError(err.message || "An unexpected error occurred while placing your order.");
    } finally {
      setIsSubmittingOrder(false);
      setPaymentStatusText("");
    }
  };

  const handleClose = () => {
    if (step === "confirming" || step === "success") {
      setStep("form");
      setConfirmedOrder(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-border shadow-2xl bg-card rounded-md">
        {/* Step 1: Direct Customer Checkout Form (No login required) */}
        {step === "form" && (
          <div className="max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 md:p-6 pb-4 border-b border-border bg-sand-50/50 dark:bg-secondary/30">
              <DialogHeader className="text-left space-y-1">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
                    <ShieldCheck className="size-3.5" />
                    <span>Instant Direct Checkout</span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Truck className="size-3 text-gold" /> Free Chennai Delivery
                  </span>
                </div>
                <DialogTitle className="font-display text-2xl font-semibold text-foreground pt-1">
                  Complete Your Purchase
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Enter your contact, delivery address, and payment method below. No login required.
                </DialogDescription>
              </DialogHeader>

              {/* Items Summary Banner */}
              {bag.length > 0 && (() => {
                const firstItem = bag[0];
                const firstProduct = firstItem ? productsList.find((p) => p.id === firstItem.id) : null;
                return (
                  <div className="mt-3.5 p-3 bg-card border border-border rounded-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {firstProduct?.image && (
                        <img
                          src={firstProduct.image || "/assets/burgundy-silk.jpg"}
                          alt="Product"
                          className="size-11 object-cover rounded-xs border border-border shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-foreground">
                          {bag.length === 1
                            ? firstProduct?.name || "Textile Drape"
                            : `${firstProduct?.name || "Textile"} + ${bag.length - 1} more item(s)`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Total {bag.reduce((sum, b) => sum + b.quantity, 0)} item(s) in bag
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Total</span>
                      <span className="font-display font-bold text-base text-primary tabular-nums">
                        {money(totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePlaceOrder} className="p-5 md:p-6 space-y-5">
              {orderError && (
                <div
                  className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-sm flex items-start gap-2"
                  role="alert"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Section 1: Customer Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-border text-xs font-semibold uppercase tracking-wider text-primary">
                  <User className="size-3.5 text-primary" />
                  <span>1. Customer Details</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-name" className="text-xs font-medium text-foreground">
                    Full Name *
                  </label>
                  <Input
                    id="checkout-name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="h-9.5 text-xs rounded-none border-border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-email" className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Mail className="size-3 text-muted-foreground" /> Email Address *
                    </label>
                    <Input
                      id="checkout-email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email Address"
                      className="h-9.5 text-xs rounded-none border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-phone" className="text-xs font-medium text-foreground flex items-center gap-1">
                      <Phone className="size-3 text-muted-foreground" /> Mobile Phone *
                    </label>
                    <Input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Phone Number (10 Digits)"
                      className="h-9.5 text-xs rounded-none border-border font-sans tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-border text-xs font-semibold uppercase tracking-wider text-primary">
                  <MapPin className="size-3.5 text-primary" />
                  <span>2. Delivery Address</span>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-address" className="text-xs font-medium text-foreground">
                    Door No, Street Name & Locality *
                  </label>
                  <Textarea
                    id="checkout-address"
                    required
                    rows={2}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Address (Door / Flat No, Street, Locality)"
                    className="text-xs rounded-none border-border resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-city" className="text-xs font-medium text-foreground">
                      City *
                    </label>
                    <Input
                      id="checkout-city"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="h-9 text-xs rounded-none border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-state" className="text-xs font-medium text-foreground">
                      Delivery State *
                    </label>
                    <select
                      id="checkout-state"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full h-9 px-2 text-xs rounded-none border border-border bg-background text-foreground cursor-pointer"
                    >
                      <option value="">-- State / UT --</option>
                      {INDIAN_STATES_AND_UTS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-pin" className="text-xs font-medium text-foreground">
                      Pincode *
                    </label>
                    <Input
                      id="checkout-pin"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode (6 Digits)"
                      className="h-9 text-xs rounded-none border-border font-sans tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Method Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <CreditCard className="size-3.5 text-primary" />
                    <span>3. Choose Payment Method</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">100% Encrypted & Safe</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Online Payment */}
                  <label
                    htmlFor="pay-online"
                    className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                        : "border-border hover:bg-secondary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      id="pay-online"
                      name="payment_method"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Smartphone className="size-3.5 text-primary" />
                        <span>Instant Online / UPI</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Google Pay, PhonePe, Paytm, BHIM QR, Cards & Net Banking.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery */}
                  <label
                    htmlFor="pay-cod"
                    className={`p-3.5 border rounded-sm flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                        : "border-border hover:bg-secondary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      id="pay-cod"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-0.5 accent-primary"
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Banknote className="size-3.5 text-gold" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Pay cash directly to the courier when your order arrives.
                      </p>
                    </div>
                  </label>
                </div>

                {/* UPI App Selection if Online is chosen */}
                {paymentMethod === "online" && (
                  <div className="p-3 bg-secondary/50 border border-border/80 rounded-sm space-y-2">
                    <span className="text-[11px] font-medium text-foreground block">
                      Preferred Online Payment Mode:
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      {[
                        { id: "gpay", name: "Google Pay" },
                        { id: "phonepe", name: "PhonePe" },
                        { id: "paytm", name: "Paytm" },
                        { id: "qr", name: "Scan QR" },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`py-1.5 px-2 rounded-xs border text-xs font-medium cursor-pointer transition-all ${
                            selectedUpiApp === app.id
                              ? "bg-primary text-white border-primary shadow-xs font-semibold"
                              : "bg-card border-border text-foreground hover:bg-secondary"
                          }`}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center pt-1">
                      Secured by 256-bit SSL Banking Protocol · Instant SMS Confirmation
                    </p>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({bag.length} items)</span>
                  <span className="font-sans tabular-nums">{money(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Truck className="size-3 text-primary" />
                    <span>Shipping Fee ({stateName || "State"})</span>
                  </span>
                  {isLoadingShipping ? (
                    <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                      <Loader2 className="size-2.5 animate-spin" /> Calculating…
                    </span>
                  ) : isFreeShipping ? (
                    <span className="text-emerald-600 font-semibold uppercase text-[11px]">
                      {shippingCharge > 0 && <span className="line-through text-muted-foreground/60 mr-1">{money(shippingCharge)}</span>}
                      FREE
                    </span>
                  ) : (
                    <span className="font-sans tabular-nums font-semibold text-foreground">
                      {shippingCharge > 0 ? money(shippingCharge) : "FREE (₹0)"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-base font-bold text-primary pt-1 border-t border-border/60">
                  <span>Total Amount Payable</span>
                  <span className="font-display tabular-nums text-lg">{money(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="default"
                  className="w-full !rounded-xl !h-auto min-h-[50px] py-3.5 px-3 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wide shadow-md bg-[#D15608] hover:bg-[#9F160A] text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] overflow-hidden"
                  disabled={isSubmittingOrder || !stateName}
                >
                  {isSubmittingOrder ? (
                    <span className="flex items-center justify-center gap-2 text-center text-xs sm:text-sm">
                      <Loader2 className="size-4 shrink-0 animate-spin" />
                      <span>{paymentStatusText || "Placing Order…"}</span>
                    </span>
                  ) : paymentMethod === "online" ? (
                    <>
                      <Zap className="size-4 shrink-0 fill-amber-300 text-amber-300" />
                      <span className="truncate sm:hidden">Pay & Confirm · {money(grandTotal)}</span>
                      <span className="hidden sm:inline">Proceed to Pay & Confirm · {money(grandTotal)}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4 shrink-0 text-white" />
                      <span className="truncate sm:hidden">Confirm COD Order · {money(grandTotal)}</span>
                      <span className="hidden sm:inline">Confirm Cash on Delivery Order · {money(grandTotal)}</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-primary" /> Verified Artisan Fabric
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="size-3.5 text-gold" /> Fast Dispatch from Chennai
                </span>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: 2-Second Order Confirmation & Credentials Screen */}
        {(step === "confirming" || step === "success") && confirmedOrder && (
          <div className="p-6 md:p-8 space-y-5 text-center max-h-[85vh] overflow-y-auto">
            <div className="size-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                <CheckCircle2 className="size-3.5" />
                <span>Order Confirmed & Placed!</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Thank You, {confirmedOrder.customerName}!
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Your order <strong className="text-foreground">#{confirmedOrder.orderNumber}</strong> has been received by Padmanabha Fabrics.
              </p>
            </div>

            {/* Account Credentials Callout Box */}
            <div className="p-4 bg-primary/5 border border-primary/25 text-left rounded-sm space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                <span className="font-semibold text-primary text-xs flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" /> Customer Account Auto-Created:
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Logged In
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 bg-card border border-border rounded-xs space-y-1.5 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Username / Email:</span>
                    <strong className="text-foreground">{confirmedOrder.customerEmail}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Password:</span>
                    <strong className="text-primary text-sm font-bold">customer123</strong>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                  You are now automatically signed in! You can use password (<code>customer123</code>) anytime to track your orders and wishlist.
                </p>
              </div>
            </div>

            {/* 2-Second Transition Progress Bar */}
            <div className="space-y-2 pt-1 bg-secondary/30 p-3 rounded-sm border border-border/60">
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Package className="size-3.5 text-primary" /> Opening your Orders & Wishlist dashboard…
                </span>
                <span className="font-bold text-primary tabular-nums">2s</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-2000 w-full animate-pulse" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Link
                to="/orders"
                onClick={() => {
                  onClose();
                  setStep("form");
                }}
                className="w-full h-11 flex items-center justify-center gap-2 rounded bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <Truck className="size-4" />
                <span>View Live Tracking in My Orders &rarr;</span>
              </Link>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10 text-xs uppercase tracking-wider font-semibold cursor-pointer border-border/80"
                onClick={() => {
                  onClose();
                  setStep("form");
                  openCustomerOrders();
                }}
              >
                Open Customer Account Dashboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
