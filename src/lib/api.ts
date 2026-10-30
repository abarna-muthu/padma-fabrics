/**
 * Padma Fabrics Frontend API Client
 * Provides robust type-safe methods to interact with the backend API.
 * Handles JWT tokens, centralized error handling, and transparent fallbacks.
 */

const TOKEN_KEY = "pf_admin_jwt_token";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string, persist: boolean = true): void {
  if (typeof window === "undefined") return;
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeAdminToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-fallback": "true",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const apiBase = ((import.meta as any).env?.VITE_API_URL || "").replace(/\/$/, "");
  const url = endpoint.startsWith("http")
    ? endpoint
    : apiBase
      ? `${apiBase}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
      : endpoint;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: data?.error || `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    return data || { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network request failed",
    };
  }
}

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export const authApi = {
  async adminLogin(email: string, pass: string) {
    const res = await apiRequest<{
      token: string;
      user: { id: string; email: string; name: string; role: string };
    }>("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    });

    if (res.success && res.data?.token) {
      setAdminToken(res.data.token, true);
    }
    return res;
  },

  async getProfile() {
    return apiRequest<{ id: string; email: string; name: string; role: string }>(
      "/api/auth/admin/profile",
    );
  },

  async updateCredentials(currentPassword: string, newEmail: string, newPassword: string) {
    const res = await apiRequest<{ token: string; user: { email: string; name: string } }>(
      "/api/auth/admin/settings/credentials",
      {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newEmail,
          newPassword,
        }),
      },
    );

    if (res.success && res.data?.token) {
      setAdminToken(res.data.token, true);
    }
    return res;
  },

  logout() {
    removeAdminToken();
  },
};

// ----------------------------------------------------
// Products API
// ----------------------------------------------------
export const productApi = {
  async getAll(params?: { category?: string; search?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.featured) query.set("featured", "true");

    const qs = query.toString();
    const res = await apiRequest<any>(`/api/products${qs ? `?${qs}` : ""}`);
    const prods = (res as any)?.products || res.data;
    return {
      ...res,
      data: Array.isArray(prods) ? prods : [],
    };
  },

  async getCategories() {
    return apiRequest<
      { id: string; name: string; slug: string; description: string; image: string }[]
    >("/api/products/categories");
  },

  async createCategory(data: { name: string; description?: string }) {
    return apiRequest<any>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getById(id: string) {
    return apiRequest<any>(`/api/products/${id}`);
  },

  async create(data: any) {
    return apiRequest<any>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, updates: any) {
    return apiRequest<any>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string) {
    return apiRequest<any>(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
  },

  async toggleStatus(id: string) {
    return apiRequest<any>(`/api/admin/products/${id}/toggle`, {
      method: "PATCH",
    });
  },

  async uploadImage(imageData: string, folder = "padma_products"): Promise<{
    success: boolean;
    url: string;
    secure_url?: string;
    public_id?: string;
    error?: string;
  }> {
    const res = await apiRequest<any>("/api/admin/products/upload-image", {
      method: "POST",
      body: JSON.stringify({ image: imageData, folder }),
    });
    return res as any;
  },

  async bulkSync(products: any[], clearDefaults: boolean = true) {
    return apiRequest<any>("/api/admin/products/bulk-sync", {
      method: "POST",
      body: JSON.stringify({ products, clearDefaults }),
    });
  },

  async removeDefaults() {
    return apiRequest<any>("/api/admin/products/remove-defaults", {
      method: "POST",
    });
  },
};

// ----------------------------------------------------
// Inventory API
// ----------------------------------------------------
export const inventoryApi = {
  async getAll() {
    return apiRequest<any>("/api/admin/inventory");
  },

  async adjustStock(productId: string, newStock: number, reason: string) {
    return apiRequest<any>("/api/admin/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({ productId, newStock, reason }),
    });
  },
};

// ----------------------------------------------------
// Orders & Checkout API
// ----------------------------------------------------
export const orderApi = {
  async getAll(params?: { status?: string; paymentStatus?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.paymentStatus) query.set("paymentStatus", params.paymentStatus);
    if (params?.search) query.set("search", params.search);

    const qs = query.toString();
    return apiRequest<any[]>(`/api/orders${qs ? `?${qs}` : ""}`);
  },

  async getById(id: string) {
    return apiRequest<any>(`/api/orders/${id}`);
  },

  async checkout(payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress?: string;
    shippingState?: string;
    state?: string;
    paymentMethod?: string;
    items: { productId: string; quantity: number; size?: string; colour?: string; price?: number; name?: string; image?: string }[];
  }) {
    const body = {
      ...payload,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      shipping_address: payload.shippingAddress,
      shipping_state: payload.shippingState || payload.state,
      payment_method: payload.paymentMethod || "COD",
    };
    return apiRequest<{
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      subtotal?: number;
      shippingFee?: number;
      shippingCharge?: number;
      shippingState?: string;
      status: string;
      orderStatus?: string;
    }>("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateStatus(id: string, status: string) {
    return apiRequest<any>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async updatePaymentStatus(id: string, paymentStatus: string) {
    return apiRequest<any>(`/api/orders/${id}/payment-status`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    });
  },

  async delete(id: string) {
    return apiRequest<any>(`/api/orders/${id}`, {
      method: "DELETE",
    });
  },

  async cancel(id: string, reason: string, notes?: string) {
    return apiRequest<{
      success: boolean;
      message: string;
      order?: any;
      error?: string;
    }>(`/api/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason, notes }),
    });
  },

  async downloadInvoice(orderId: string, customerEmail?: string, customerPhone?: string): Promise<void> {
    const cleanId = String(orderId).replace(/^#/, "").trim();
    const token = getAdminToken();
    const headers: Record<string, string> = {
      "x-admin-fallback": "true",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (customerEmail) {
      headers["x-customer-email"] = customerEmail;
    }
    if (customerPhone) {
      headers["x-customer-phone"] = customerPhone;
    }

    const query = new URLSearchParams();
    if (customerEmail) query.set("customerEmail", customerEmail);
    if (customerPhone) query.set("customerPhone", customerPhone);
    if (token) query.set("token", token);
    const qs = query.toString();

    const apiBase = ((import.meta as any).env?.VITE_API_URL || "").replace(/\/$/, "");
    const endpoint = `/api/orders/${cleanId}/invoice${qs ? `?${qs}` : ""}`;
    const url = apiBase ? `${apiBase}${endpoint}` : endpoint;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      let errorMsg = "Failed to download invoice.";
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errJson.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const rawBlob = await response.blob();
    const blob = new Blob([rawBlob], { type: "application/pdf" });
    const contentDisposition = response.headers.get("content-disposition");
    let filename = `Invoice-${cleanId}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  },
};

// ----------------------------------------------------
// Admin Dashboard API
// ----------------------------------------------------
export const dashboardApi = {
  async getMetrics() {
    return apiRequest<any>("/api/admin/dashboard");
  },
};

// ----------------------------------------------------
// Customers API
// ----------------------------------------------------
export const customerApi = {
  async getAll() {
    return apiRequest<any[]>("/api/admin/customers");
  },
  async update(id: string, data: { name?: string; email?: string; phone?: string; address?: string }) {
    return apiRequest<any>(`/api/admin/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  async delete(id: string) {
    return apiRequest<any>(`/api/admin/customers/${id}`, {
      method: "DELETE",
    });
  },
};

// ----------------------------------------------------
// Contact Enquiries API
// ----------------------------------------------------
export const contactApi = {
  async submit(data: {
    name: string;
    email: string;
    phone?: string;
    enquiryType?: string;
    message: string;
  }) {
    return apiRequest<any>("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getAll() {
    return apiRequest<any[]>("/api/admin/contact-enquiries");
  },
};

// ----------------------------------------------------
// Site Content API (Home, About, Contact Pages)
// ----------------------------------------------------
export const contentApi = {
  async get() {
    return apiRequest<any>(`/api/content?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  },
  async update(updates: any) {
    return apiRequest<any>("/api/content", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },
  async reset() {
    return apiRequest<any>("/api/content/reset", {
      method: "POST",
    });
  },
};

// ----------------------------------------------------
// Shipping Rates API
// ----------------------------------------------------
export interface ShippingRateItem {
  id: string;
  state: string;
  charge: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const shippingApi = {
  // Public rate check for selected state and subtotal
  async getRate(state: string, subtotal?: number) {
    const qs = new URLSearchParams({ state });
    if (subtotal !== undefined) qs.set("subtotal", String(subtotal));
    return apiRequest<{
      success: boolean;
      state: string;
      charge: number;
      finalCharge: number;
      isFreeShipping: boolean;
      freeShippingThreshold: number;
      isActive: boolean;
      error?: string;
    }>(`/api/shipping-rate?${qs.toString()}`);
  },

  // Public list of active states & rates
  async getRates() {
    return apiRequest<{
      success: boolean;
      count: number;
      rates: ShippingRateItem[];
      freeShippingThreshold: number;
    }>("/api/shipping-rates");
  },

  // Admin list of all rates
  async getAdminRates() {
    return apiRequest<{
      success: boolean;
      count: number;
      rates: ShippingRateItem[];
      freeShippingThreshold: number;
    }>("/api/admin/shipping-rates");
  },

  // Admin update individual state rate
  async updateRate(id: string, data: { charge?: number; is_active?: boolean; isActive?: boolean }) {
    return apiRequest<{
      success: boolean;
      message: string;
      rate: ShippingRateItem;
    }>(`/api/admin/shipping-rates/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Admin bulk update
  async bulkUpdate(data: { charge?: number; is_active?: boolean; isActive?: boolean; rates?: any[] }) {
    return apiRequest<{
      success: boolean;
      message: string;
    }>("/api/admin/shipping-rates/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Admin update free shipping settings
  async updateSettings(data: { free_shipping_threshold: number }) {
    return apiRequest<{
      success: boolean;
      message: string;
      freeShippingThreshold: number;
    }>("/api/admin/shipping-rates/settings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

