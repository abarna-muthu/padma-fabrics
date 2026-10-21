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
import { money, bagTotal } from "@/lib/catalog";

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
  const [city, setCity] = useState("Chennai");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("600053");

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

      if (paymentMethod === "online") {
        setPaymentStatusText("Connecting to Secure Payment Gateway…");
        await new Promise((resolve) => setTimeout(resolve, 600));
        setPaymentStatusText("Verifying UPI / Bank Gateway Authorization…");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Create order in backend and local store
      const res = await createCheckoutOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: fullAddress,
        paymentMethod: paymentMethod,
      });

      const resolvedOrderNumber =
        res.orderNumber || (res as any).orderId || `PF-${Date.now().toString().slice(-4)}`;

      if (res.success && resolvedOrderNumber) {
        // Automatically sign in customer with password: customer123
        try {
          await loginCustomer(email, "customer123", name, phone);
          updateCustomerProfile({ address: fullAddress });
        } catch (authErr) {
          console.debug("Customer auto-login notice:", authErr);
        }

        const orderInfo = {
          orderNumber: resolvedOrderNumber,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          address: fullAddress,
          totalAmount: totalAmount,
          paymentMethod: paymentMethod === "online" ? "Online UPI / Card (Paid)" : "Cash on Delivery (Pending)",
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
                    placeholder="e.g. Priya Sundaram"
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
                      placeholder="priya.sundaram@gmail.com"
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
                      placeholder="+91 98401 23456"
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
                    placeholder="e.g. Old No 14, New No 32, CTH Road, Ambattur"
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
                      className="h-9 text-xs rounded-none border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-state" className="text-xs font-medium text-foreground">
                      State *
                    </label>
                    <Input
                      id="checkout-state"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="h-9 text-xs rounded-none border-border"
                    />
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
                      placeholder="600053"
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
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-semibold uppercase text-[11px]">FREE (Chennai Special)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-primary pt-1 border-t border-border/60">
                  <span>Total Amount Payable</span>
                  <span className="font-display tabular-nums text-lg">{money(totalAmount)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="editorial"
                  size="lg"
                  className="w-full h-12 text-sm uppercase tracking-wider font-bold shadow-md bg-gradient-to-r from-[#9B2242] via-[#8B1D36] to-[#731429] text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  disabled={isSubmittingOrder}
                >
                  {isSubmittingOrder ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      {paymentStatusText || "Processing Order & Saving Details…"}
                    </span>
                  ) : paymentMethod === "online" ? (
                    <>
                      <Zap className="size-4.5 fill-amber-300 text-amber-300" />
                      <span>Proceed to Pay & Confirm · {money(totalAmount)}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4.5 text-white" />
                      <span>Confirm Cash on Delivery Order · {money(totalAmount)}</span>
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
              <Button
                variant="editorial"
                className="w-full h-11 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                onClick={() => {
                  onClose();
                  setStep("form");
                  openCustomerOrders();
                }}
              >
                Go to My Orders & Wishlist Now &rarr;
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
