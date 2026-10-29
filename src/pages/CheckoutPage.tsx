import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Truck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
  CreditCard,
  Banknote,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  PackageCheck,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SectionHeading } from "@/components/SectionHeading";
import { useCart, type CartItem } from "@/context/CartContext";
import { useStore } from "@/context/StoreContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/utils/formatters";
import { toast } from "sonner";
import { openRazorpayCheckout } from "@/lib/razorpay";

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    subtotal,
    clearCart,
    removeFromCart,
    directCheckoutItem,
    clearDirectCheckout,
  } = useCart();
  const { createCheckoutOrder } = useStore();
  const { customer, registerCustomer, loginCustomer, updateCustomerProfile } = useCustomerAuth();

  // Allow selecting only a single product to buy if multiple exist
  const [selectedSingleItemId, setSelectedSingleItemId] = useState<string | null>(null);

  // Active items being ordered
  const checkoutItems: CartItem[] = useMemo(() => {
    // 1. Direct single product checkout initiated via "Buy Now" or "Buy This Item"
    if (directCheckoutItem) {
      return [directCheckoutItem];
    }
    // 2. User clicked a specific item in the Order Summary list
    if (selectedSingleItemId) {
      const match = cart.find((i) => i.cartItemId === selectedSingleItemId);
      if (match) return [match];
    }
    // 3. Fallback: all items in cart
    return cart;
  }, [directCheckoutItem, selectedSingleItemId, cart]);

  const checkoutCount = useMemo(() => {
    return checkoutItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [checkoutItems]);

  const checkoutSubtotal = useMemo(() => {
    return checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [checkoutItems]);

  // Customer form fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Chennai");
  const [stateName, setStateName] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("600053");
  const [orderNotes, setOrderNotes] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>("gpay");

  // State flow
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    address: string;
    totalAmount: number;
    paymentMethod: string;
    date: string;
    itemsCount: number;
  } | null>(null);

  // Pre-fill from customer profile if logged in
  useEffect(() => {
    if (customer) {
      if (!customerName && customer.name) setCustomerName(customer.name);
      if (!customerEmail && customer.email) setCustomerEmail(customer.email);
      if (!customerPhone && customer.phone) setCustomerPhone(customer.phone);
      if (!streetAddress && customer.address) setStreetAddress(customer.address);
    }
  }, [customer]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const name = customerName.trim();
    const email = customerEmail.trim();
    const phone = customerPhone.trim();
    const street = streetAddress.trim();
    const pin = pincode.trim();

    if (!name) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!street) {
      setErrorMsg("Please enter your delivery street address / door number.");
      return;
    }
    if (!pin || pin.length < 6) {
      setErrorMsg("Please enter a valid 6-digit postal pincode.");
      return;
    }

    if (checkoutItems.length === 0) {
      setErrorMsg("No items selected for checkout. Please select a product to buy.");
      return;
    }

    setIsSubmitting(true);

    const fullAddress = `${street}, ${city.trim()}, ${stateName.trim()} - ${pin}${orderNotes.trim() ? ` (Notes: ${orderNotes.trim()})` : ""}`;

    try {
      // 1. Register customer in background
      try {
        await registerCustomer(name, email, phone, fullAddress);
      } catch (err) {
        console.debug("Background registration note:", err);
      }

      // 2. Prepare items payload from active checkoutItems
      const orderItems = checkoutItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        size: item.size,
        colour: item.colour,
        price: item.price,
        name: item.name,
        image: item.image,
        category: item.category,
      }));

      const completeOrderCreation = async (paymentRef?: string) => {
        setIsSubmitting(true);
        try {
          const res = await createCheckoutOrder({
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            shippingAddress: fullAddress,
            paymentMethod: paymentMethod === "online" ? `Razorpay (${paymentRef || selectedUpiApp.toUpperCase()})` : "COD",
            items: orderItems,
          });

          if (res && res.success) {
            const orderNum = res.orderNumber || res.orderId || `PF-${Date.now().toString().slice(-4)}`;

            // Auto-login customer
            try {
              await loginCustomer(email, "customer123", name, phone);
              updateCustomerProfile({ address: fullAddress });
            } catch (e) {}

            const successRecord = {
              orderNumber: orderNum,
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
              address: fullAddress,
              totalAmount: checkoutSubtotal,
              paymentMethod: paymentMethod === "online" ? `Razorpay Online (${paymentRef || selectedUpiApp.toUpperCase()})` : "Cash on Delivery (COD)",
              date: new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              itemsCount: checkoutCount,
            };

            setConfirmedOrder(successRecord);

            // Remove ONLY the purchased items from bag, preserving others
            if (directCheckoutItem) {
              removeFromCart(directCheckoutItem.cartItemId);
              clearDirectCheckout();
            } else if (selectedSingleItemId) {
              removeFromCart(selectedSingleItemId);
              setSelectedSingleItemId(null);
            } else {
              clearCart();
            }
            toast.success(`Order #${orderNum} confirmed! Dispatching from Chennai showroom.`);
          } else {
            setErrorMsg(res?.error || "Could not place order. Please try again or order via WhatsApp.");
          }
        } catch (err: any) {
          setErrorMsg(err.message || "An unexpected error occurred during checkout.");
        } finally {
          setIsSubmitting(false);
        }
      };

      if (paymentMethod === "online") {
        const launched = await openRazorpayCheckout({
          amount: checkoutSubtotal,
          name,
          email,
          phone,
          onSuccess: (paymentId) => {
            completeOrderCreation(paymentId);
          },
          onDismiss: () => {
            setIsSubmitting(false);
          },
          onError: () => {
            completeOrderCreation(`pay_test_${Date.now()}`);
          },
        });

        if (launched) return;
      }

      await completeOrderCreation();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during checkout.");
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW: CONFIRMED ORDER SUCCESS SCREEN
  // -------------------------------------------------------------
  if (confirmedOrder) {
    const whatsappOrderUrl = `https://wa.me/919940135700?text=${encodeURIComponent(
      `Hello Padmanabha Fabrics! I placed Order #${confirmedOrder.orderNumber} for ${confirmedOrder.itemsCount} items (Total: ${formatPrice(
        confirmedOrder.totalAmount,
      )}).\nName: ${confirmedOrder.customerName}\nPhone: ${confirmedOrder.customerPhone}\nPayment: ${confirmedOrder.paymentMethod}\nPlease confirm dispatch from Ambattur showroom!`,
    )}`;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 sm:p-12 border border-[#D15608]/30 rounded-2xl bg-white dark:bg-[#1E191A] shadow-xl text-center">
          {/* Animated Green Badge */}
          <div className="size-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D15608]">
            Order Successfully Confirmed
          </span>
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#9F160A] dark:text-[#FAF6EE] mt-1.5">
            Vanakkam, {confirmedOrder.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5549] dark:text-[#B5AC9E] mt-2 max-w-lg mx-auto">
            Your authentic weaves have been reserved and will be handcrafted & dispatched from our Ambattur, Chennai showroom.
          </p>

          {/* Order Details Receipt Box */}
          <div className="my-8 p-6 rounded-xl border border-[#E5DAC4] dark:border-[#D15608]/25 bg-[#FAF6EE] dark:bg-black/30 text-left space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5DAC4] dark:border-white/10">
              <span className="text-[#5C5549] dark:text-[#B5AC9E]">Order Reference Number</span>
              <span className="font-mono text-sm font-bold text-[#9F160A] dark:text-[#EDBC3D] px-2.5 py-0.5 rounded bg-white dark:bg-white/10 border border-[#D15608]/30">
                #{confirmedOrder.orderNumber}
              </span>
            </div>

            <div className="flex justify-between text-[#5C5549] dark:text-[#B5AC9E]">
              <span>Order Date</span>
              <span className="font-medium text-[#0E0E0E] dark:text-[#FAF6EE]">{confirmedOrder.date}</span>
            </div>

            <div className="flex justify-between text-[#5C5549] dark:text-[#B5AC9E]">
              <span>Payment Mode</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{confirmedOrder.paymentMethod}</span>
            </div>

            <div className="flex justify-between text-[#5C5549] dark:text-[#B5AC9E]">
              <span>Delivery Destination</span>
              <span className="font-medium text-[#0E0E0E] dark:text-[#FAF6EE] max-w-xs text-right truncate">
                {confirmedOrder.address}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E5DAC4] dark:border-white/10 flex justify-between text-sm font-bold text-[#9F160A] dark:text-[#FAF6EE]">
              <span>Total Paid / Payable</span>
              <span className="text-base">{formatPrice(confirmedOrder.totalAmount)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={whatsappOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider shadow-md transition-all"
            >
              <MessageCircle className="size-4" />
              <span>Track on WhatsApp</span>
            </a>

            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-semibold uppercase tracking-wider shadow-md transition-all"
            >
              <span>View My Orders</span>
              <ArrowRight className="size-3.5" />
            </Link>

            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#D15608] text-[#D15608] dark:text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF6EE] dark:hover:bg-white/5 transition-all"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: EMPTY BAG PROMPT
  // -------------------------------------------------------------
  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
          className="mb-6"
        />

        <div className="p-12 border border-dashed border-[#D15608]/40 rounded-xl bg-white dark:bg-[#1E191A] text-center max-w-md mx-auto shadow-xs">
          <ShoppingBag className="size-12 text-[#D15608] mx-auto mb-3 opacity-60" />
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#9F160A] dark:text-[#FAF6EE]">
            No Items in Checkout
          </h2>
          <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-2 mb-6">
            Please add an artisan fabric or silhouette to your shopping bag before completing checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#D15608] hover:bg-[#9F160A] text-white text-xs font-semibold uppercase tracking-wider shadow-xs"
            >
              <span>Browse Shop</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/wishlist"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md border border-[#D15608] text-[#D15608] dark:text-[#FAF6EE] text-xs font-semibold uppercase tracking-wider"
            >
              <span>View Wishlist</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: CHECKOUT FORM & PURCHASE
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: "Shop", href: "/shop" },
          { label: "Shopping Bag", href: "/cart" },
          { label: "Secure Checkout" },
        ]}
        className="mb-6"
      />

      <SectionHeading
        kicker="Direct Artisan Dispatch"
        title="Complete Your Order"
        description="Ambattur, Chennai Showroom Fulfillment · Fast Express Domestic Shipping."
      />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        {/* Left 2 Cols: Shipping Details & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. SHIPPING ADDRESS */}
          <div className="p-6 border border-[#E5DAC4] dark:border-[#D15608]/25 rounded-xl bg-white dark:bg-[#1E191A] shadow-xs space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#9F160A] dark:text-[#FAF6EE] flex items-center gap-2">
              <Truck className="size-4 text-[#D15608]" />
              <span>1. Delivery Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 size-3.5 text-[#5C5549]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abarna Muthu"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-3.5 text-[#5C5549]" />
                  <input
                    type="tel"
                    required
                    placeholder="99401 35700"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-3.5 text-[#5C5549]" />
                  <input
                    type="email"
                    required
                    placeholder="abarna@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  Complete Street Address & Door / Flat No. *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-3.5 text-[#5C5549]" />
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. No. 14, Menambedu Road, Near Showroom, Ambattur"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  Postal Pincode (6 Digits) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="600053"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden"
                />
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#5C5549] dark:text-[#B5AC9E] mb-1">
                  Special Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery / Near Ambattur OT"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DAC4] dark:border-white/10 bg-[#FAF6EE] dark:bg-black/20 text-[#0E0E0E] dark:text-[#FAF6EE] focus:border-[#D15608] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. PAYMENT METHOD */}
          <div className="p-6 border border-[#E5DAC4] dark:border-[#D15608]/25 rounded-xl bg-white dark:bg-[#1E191A] shadow-xs space-y-4">
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#9F160A] dark:text-[#FAF6EE] flex items-center gap-2">
              <CreditCard className="size-4 text-[#D15608]" />
              <span>2. Choose Payment Mode</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Online UPI / Cards */}
              <label
                className={`p-4 rounded-xl border-2 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                  paymentMethod === "online"
                    ? "border-[#D15608] bg-[#FAF6EE] dark:bg-white/10"
                    : "border-[#E5DAC4] dark:border-white/10 hover:border-[#D15608]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="accent-[#D15608]"
                    />
                    <span className="font-semibold text-xs text-[#0E0E0E] dark:text-[#FAF6EE]">
                      Online Payment / UPI
                    </span>
                  </div>
                  <Smartphone className="size-4 text-[#D15608]" />
                </div>
                <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
                  Google Pay, PhonePe, Paytm, QR, NetBanking & Cards with Instant Confirmation.
                </p>

                {paymentMethod === "online" && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#E5DAC4] dark:border-white/10">
                    {["gpay", "phonepe", "paytm"].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedUpiApp(app);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          selectedUpiApp === app
                            ? "bg-[#D15608] text-white"
                            : "bg-white dark:bg-black/30 text-[#5C5549] dark:text-[#FAF6EE] border border-[#E5DAC4]"
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                )}
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-xl border-2 flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#D15608] bg-[#FAF6EE] dark:bg-white/10"
                    : "border-[#E5DAC4] dark:border-white/10 hover:border-[#D15608]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-[#D15608]"
                    />
                    <span className="font-semibold text-xs text-[#0E0E0E] dark:text-[#FAF6EE]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <Banknote className="size-4 text-[#D15608]" />
                </div>
                <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
                  Pay cash at your doorstep when your authentic saree or handloom fabric arrives.
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ✓ Available for all pincodes
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Order Summary & Place Order Button */}
        <div className="space-y-4">
          <div className="p-6 border border-[#D15608]/30 rounded-xl bg-[#FAF6EE] dark:bg-[#1E191A] shadow-xs space-y-4">
            <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#9F160A] dark:text-[#FAF6EE] flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-sans text-[#D15608]">
                {checkoutCount} {checkoutCount === 1 ? "Item" : "Items"}
              </span>
            </h4>

            {/* Direct purchase indicator if buying only 1 product */}
            {(directCheckoutItem || selectedSingleItemId) && cart.length > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-black/20 p-2.5 rounded-lg border border-[#D15608]/30 text-xs">
                <span className="text-[#0E0E0E] dark:text-[#FAF6EE] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>Buying only this 1 product</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearDirectCheckout();
                    setSelectedSingleItemId(null);
                  }}
                  className="text-[11px] font-bold text-[#D15608] hover:underline cursor-pointer"
                >
                  View all {cart.length} items
                </button>
              </div>
            )}

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1 divide-y divide-[#E5DAC4]/60 dark:divide-white/10">
              {(directCheckoutItem ? [directCheckoutItem] : cart).map((item) => {
                const isSelected = checkoutItems.some((ci) => ci.cartItemId === item.cartItemId);
                const canSelectOnlyThis = !directCheckoutItem && cart.length > 1;

                return (
                  <div
                    key={item.cartItemId}
                    onClick={() => {
                      if (canSelectOnlyThis) {
                        setSelectedSingleItemId(item.cartItemId);
                      }
                    }}
                    className={`pt-2.5 first:pt-0 flex items-center gap-3 transition-all rounded-lg p-1.5 ${
                      isSelected
                        ? "bg-white/80 dark:bg-white/5 border border-[#D15608]/40"
                        : "opacity-60 hover:opacity-100"
                    } ${canSelectOnlyThis ? "cursor-pointer" : ""}`}
                    title={canSelectOnlyThis ? "Click to buy only this product" : undefined}
                  >
                    {canSelectOnlyThis && (
                      <div
                        className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[#D15608] bg-[#D15608] text-white"
                            : "border-[#999999] bg-white"
                        }`}
                      >
                        {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                      </div>
                    )}

                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-12 object-cover rounded border border-[#D15608]/20 shrink-0 bg-white"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <h5 className="font-medium truncate text-[#0E0E0E] dark:text-[#FAF6EE]">
                        {item.name}
                      </h5>
                      <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E]">
                        {item.colour ? `Colour: ${item.colour} · ` : ""}Size: {item.size || "Standard"} · Qty: {item.quantity}
                      </p>
                      {canSelectOnlyThis && !isSelected && (
                        <span className="text-[10px] text-[#D15608] font-semibold hover:underline">
                          Click to buy only this
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#9F160A] dark:text-[#FAF6EE] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#D15608]/25 space-y-2 text-xs">
              <div className="flex justify-between text-[#5C5549] dark:text-[#B5AC9E]">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#0E0E0E] dark:text-[#FAF6EE]">
                  {formatPrice(checkoutSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#8A9A7B] font-semibold">
                <span>Direct Showroom Shipping</span>
                <span>FREE</span>
              </div>
              <div className="pt-2 border-t border-[#D15608]/20 flex justify-between text-base font-bold text-[#9F160A] dark:text-[#FAF6EE]">
                <span>Total Amount</span>
                <span className="text-xl">{formatPrice(checkoutSubtotal)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#D15608] hover:bg-[#9F160A] disabled:opacity-50 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing Order…</span>
                </>
              ) : (
                <>
                  <Lock className="size-3.5" />
                  <span>Place Order · {formatPrice(checkoutSubtotal)}</span>
                </>
              )}
            </button>

            {/* Security Promise */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5C5549] dark:text-[#B5AC9E] pt-1">
              <ShieldCheck className="size-3.5 text-[#D15608]" />
              <span>100% Guaranteed Safe Checkout</span>
            </div>

            <Link
              to="/cart"
              className="block text-center text-xs text-[#D15608] dark:text-[#EDBC3D] hover:underline pt-1"
            >
              ← Edit Bag Items
            </Link>
          </div>

          <div className="p-4 rounded-xl border border-[#E5DAC4] dark:border-[#D15608]/20 bg-white dark:bg-[#1E191A] text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#0E0E0E] dark:text-[#FAF6EE]">
              <PackageCheck className="size-4 text-[#D15608]" />
              <span>Need Assistance with your Order?</span>
            </div>
            <p className="text-[11px] text-[#5C5549] dark:text-[#B5AC9E] leading-relaxed">
              Our Chennai showroom team is available at{" "}
              <a href="tel:+919940135700" className="text-[#D15608] font-semibold hover:underline">
                +91 99401 35700
              </a>{" "}
              for sizing inquiries, bulk weaves, or custom borders.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
