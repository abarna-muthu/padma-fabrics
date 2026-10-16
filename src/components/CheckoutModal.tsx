import { useState, useEffect } from "react";
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  ShoppingBag,
  Truck,
  User,
  X,
  AlertCircle,
  Loader2,
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
  const { customer, isLoggedIn, loginCustomer, registerCustomer, logoutCustomer } =
    useCustomerAuth();
  const { bag, productsList, createCheckoutOrder } = useStore();

  // "auth" | "payment" | "success"
  const [step, setStep] = useState<"auth" | "payment" | "success">("payment");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Auth form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Payment form states
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string | null>(null);

  const totalAmount = bagTotal(bag);

  // Whenever modal opens or login state changes, determine the correct initial step
  useEffect(() => {
    if (isOpen) {
      setAuthError(null);
      setOrderError(null);
      if (!isLoggedIn) {
        setStep("auth");
      } else {
        setStep("payment");
        if (customer) {
          setShippingAddress(customer.address || "");
          setCustomerPhone(customer.phone || "");
        }
      }
    }
  }, [isOpen, isLoggedIn, customer]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await loginCustomer(authEmail, authPassword);
      if (res.success) {
        // Logged in! Immediately proceed straight to payment step as requested
        setStep("payment");
      } else {
        setAuthError(res.error || "Login failed. Please check your email.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await registerCustomer(regName, regEmail, regPhone, regAddress);
      if (res.success) {
        setShippingAddress(regAddress);
        setCustomerPhone(regPhone);
        // Registered! Immediately proceed straight to payment step as requested
        setStep("payment");
      } else {
        setAuthError(res.error || "Registration failed. Please complete all fields.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to register");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Pay & Place Order
  const handleCompletePaymentAndOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!customer) {
      setStep("auth");
      return;
    }

    if (!shippingAddress.trim()) {
      setOrderError("Please enter your delivery address to proceed.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const res = await createCheckoutOrder({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customerPhone || customer.phone || "+91 99401 45700",
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
      });

      if (res.success && res.orderNumber) {
        setConfirmedOrderNumber(res.orderNumber);
        setStep("success");
        if (onOrderSuccess) onOrderSuccess();
      } else {
        setOrderError(res.error || "Unable to place order. Please try again.");
      }
    } catch (err: any) {
      setOrderError(err.message || "An unexpected error occurred during payment processing.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleClose = () => {
    if (step === "success") {
      setStep("payment");
      setConfirmedOrderNumber(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border shadow-2xl bg-card">
        {/* Step 1: Customer Auth Popup (Shown if not logged in before paying) */}
        {step === "auth" && (
          <div className="p-6 md:p-8 space-y-6">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                <Lock className="size-3.5" />
                <span>Customer Checkout</span>
              </div>
              <DialogTitle className="font-display text-2xl font-semibold">
                Sign in to proceed to Payment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Please sign in to your account or register your delivery details. Once signed in, you will proceed directly to complete your purchase.
              </DialogDescription>
            </DialogHeader>

            {/* Toggle Login / Register */}
            <div className="grid grid-cols-2 p-1 bg-secondary rounded-sm text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
                className={`py-2 rounded-sm transition-all cursor-pointer ${
                  authMode === "login"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`py-2 rounded-sm transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                New Customer
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-sm flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="e.g. priya.chennai@gmail.com"
                    className="h-10 text-xs rounded-none"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium">Password (Optional)</label>
                    <span className="text-[10px] text-muted-foreground">Quick passwordless sign-in enabled</span>
                  </div>
                  <Input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 text-xs rounded-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="editorial"
                    className="w-full h-11 text-xs uppercase tracking-wider font-semibold"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Verifying…
                      </span>
                    ) : (
                      `Sign In & Continue to Pay · ${money(totalAmount)}`
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError(null);
                    }}
                    className="text-primary underline font-medium cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Full Name *</label>
                  <Input
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ananya Sundaram"
                    className="h-9 text-xs rounded-none"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Email Address *</label>
                    <Input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ananya@gmail.com"
                      className="h-9 text-xs rounded-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Phone Number *</label>
                    <Input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98401 23456"
                      className="h-9 text-xs rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Delivery Address</label>
                  <Textarea
                    rows={2}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Door No, Street, Landmark, Chennai - 600001"
                    className="text-xs rounded-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="editorial"
                    className="w-full h-11 text-xs uppercase tracking-wider font-semibold"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> Registering…
                      </span>
                    ) : (
                      `Save & Proceed to Pay · ${money(totalAmount)}`
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-center text-muted-foreground">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError(null);
                    }}
                    className="text-primary underline font-medium cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {/* Step 2: Payment & Order Confirmation (Direct when already logged in, or right after login) */}
        {step === "payment" && (
          <div className="p-6 md:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-primary text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="size-3.5" />
                  Checkout & Payment
                </span>
                {customer && (
                  <button
                    type="button"
                    onClick={() => {
                      logoutCustomer();
                      setStep("auth");
                    }}
                    className="text-[10px] text-muted-foreground hover:text-primary underline cursor-pointer"
                  >
                    Switch User
                  </button>
                )}
              </div>
              <DialogTitle className="font-display text-2xl font-semibold">
                Complete Your Fabric Purchase
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Review your items and select your payment method.
              </DialogDescription>
            </DialogHeader>

            {/* Customer Session Badge */}
            {customer && (
              <div className="p-3 bg-secondary/50 border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                    {customer.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{customer.name}</div>
                    <div className="text-[11px] text-muted-foreground">{customer.email}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-semibold rounded">
                  Logged In
                </span>
              </div>
            )}

            {/* Items Summary */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Selected Fabrics ({bag.length})</span>
                <span className="text-muted-foreground font-normal">Sample Catalog Pricing</span>
              </div>
              <div className="border border-border divide-y divide-border/60 max-h-40 overflow-y-auto bg-card">
                {bag.map((item) => {
                  const p = productsList.find((prod) => prod.id === item.id);
                  if (!p) return null;
                  return (
                    <div key={item.id} className="p-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-xs border border-border shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/assets/burgundy-silk.jpg";
                          }}
                        />
                        <div className="truncate">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {item.quantity} {p.unit} · {money(p.price)} / {p.unit}
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-primary shrink-0">
                        {money(p.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {orderError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-sm flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}

            <form onSubmit={handleCompletePaymentAndOrder} className="space-y-4">
              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <Truck className="size-3.5 text-primary" /> Delivery Address *
                </label>
                <Textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter complete shipping address in Chennai or across India..."
                  className="text-xs rounded-none resize-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-primary" /> Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex flex-col p-3 border cursor-pointer transition-all ${
                      paymentMethod === "online"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border hover:bg-secondary/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Online Payment</span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="accent-primary"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      UPI, GPay, PhonePe, Cards, NetBanking
                    </span>
                  </label>

                  <label
                    className={`flex flex-col p-3 border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                        : "border-border hover:bg-secondary/40 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Cash on Delivery</span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-primary"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Pay upon delivery at your doorstep
                    </span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-3 bg-secondary/30 border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{money(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Shipping</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-semibold text-sm pt-2 border-t border-border text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary font-display text-lg">{money(totalAmount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 text-xs"
                  disabled={isSubmittingOrder}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="editorial"
                  className="flex-2 h-11 text-xs uppercase tracking-wider font-semibold"
                  disabled={isSubmittingOrder}
                >
                  {isSubmittingOrder ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" /> Processing Payment…
                    </span>
                  ) : (
                    `Pay ${money(totalAmount)} & Confirm`
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-500/5">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                Payment & Order Confirmed
              </span>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Thank You for Choosing Padmanabha Fabrics!
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your order <strong className="text-primary font-mono">{confirmedOrderNumber}</strong> has been successfully placed and logged in our system.
              </p>
            </div>

            <div className="p-4 bg-secondary/50 border border-border text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery To:</span>
                <span className="font-medium truncate max-w-[200px]">{shippingAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Mode:</span>
                <span className="font-medium uppercase">{paymentMethod === "online" ? "Online Paid" : "Cash on Delivery"}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Our Ambattur, Chennai dispatch team will package your order with utmost care. You will receive WhatsApp updates on shipment dispatch.
            </p>

            <Button
              type="button"
              variant="editorial"
              className="w-full h-11 text-xs uppercase tracking-wider font-semibold"
              onClick={handleClose}
            >
              Continue Exploring Fabrics
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
