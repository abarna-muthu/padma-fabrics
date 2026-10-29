/**
 * Razorpay Checkout SDK Helper for Padmanabha Fabrics
 */

export const RAZORPAY_KEY_ID =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_RAZORPAY_KEY_ID) ||
  "rzp_live_Ttjb3tAGOIsgWY";

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Could not load Razorpay checkout script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentOptions {
  amount: number; // in INR rupees
  name: string;
  email: string;
  phone: string;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
  onError?: (err: any) => void;
}

export async function openRazorpayCheckout({
  amount,
  name,
  email,
  phone,
  onSuccess,
  onDismiss,
  onError,
}: RazorpayPaymentOptions): Promise<boolean> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !(window as any).Razorpay) {
    if (onError) onError(new Error("Razorpay SDK not loaded"));
    return false;
  }

  try {
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      name: "Padmanabha Fabrics",
      description: "Fine Indian Weaves & Handcrafted Apparel",
      image: "/favicon.png",
      prefill: {
        name: name || "Customer",
        email: email || "customer@example.com",
        contact: phone || "9940145700",
      },
      theme: {
        color: "#9F160A", // Brand Crimson
      },
      handler: function (response: any) {
        if (response && response.razorpay_payment_id) {
          onSuccess(response.razorpay_payment_id);
        } else {
          onSuccess(`pay_test_${Date.now()}`);
        }
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (resp: any) {
      if (onError) onError(resp.error || new Error("Payment failed"));
    });
    rzp.open();
    return true;
  } catch (err) {
    console.warn("Razorpay checkout launch error:", err);
    if (onError) onError(err);
    return false;
  }
}

