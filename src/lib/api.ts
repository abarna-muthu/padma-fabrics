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
    paymentMethod?: "cod" | "online";
    items: { productId: string; quantity: number; size?: string }[];
  }) {
    const body = {
      ...payload,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      shipping_address: payload.shippingAddress,
      payment_method: payload.paymentMethod?.toUpperCase() || "ONLINE",
    };
    return apiRequest<{
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
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
    return apiRequest<any>("/api/content");
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

