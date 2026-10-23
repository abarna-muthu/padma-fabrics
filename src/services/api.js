/**
 * Padmanabha Fabrics - Centralized API Service Wrapper
 * Uses VITE_API_URL or defaults to relative proxy (/api).
 * Interacts with backend Express + TiDB Cloud services.
 */

const BASE_URL = (
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  ""
).replace(/\/$/, "");

/**
 * Core fetch wrapper with JSON serialization, error handling, and auth token injection
 */
export async function apiClient(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("pf_admin_jwt_token") || sessionStorage.getItem("pf_admin_jwt_token")
      : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        error: errorMsg,
        status: response.status,
      };
    }

    return data || { success: true };
  } catch (err) {
    return {
      success: false,
      error: err?.message || "Network request failed. Please check your connection.",
    };
  }
}

// =========================================================================
// 1. PRODUCT & CATEGORY ENDPOINTS
// =========================================================================

export const productServices = {
  /**
   * Get all products with optional filters (category, search, featured)
   */
  async getAllProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== "ALL" && params.category !== "All") {
      query.set("category", params.category);
    }
    if (params.search) query.set("search", params.search);
    if (params.featured) query.set("featured", "true");
    if (params.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/products${qs ? `?${qs}` : ""}`;
    const res = await apiClient(endpoint);
    const products = res?.products || res?.data || [];
    return {
      success: res.success !== false,
      data: Array.isArray(products) ? products : [],
      count: res.count || (Array.isArray(products) ? products.length : 0),
    };
  },

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    return apiClient(`/api/products/${id}`);
  },

  /**
   * Get categories list
   */
  async getCategories() {
    return apiClient("/api/products/categories");
  },

  /**
   * Create new category
   */
  async createCategory(data) {
    return apiClient("/api/products/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Create new product (Admin)
   */
  async createProduct(data) {
    return apiClient("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing product (Admin)
   */
  async updateProduct(id, updates) {
    return apiClient(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id) {
    return apiClient(`/api/products/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Toggle product active/inactive status (Admin)
   */
  async toggleProductStatus(id) {
    return apiClient(`/api/products/${id}/toggle`, {
      method: "PATCH",
    });
  },

  /**
   * Bulk sync products into TiDB Cloud database
   */
  async bulkSync(products, clearDefaults = true) {
    return apiClient("/api/admin/products/bulk-sync", {
      method: "POST",
      body: JSON.stringify({ products, clearDefaults }),
    });
  },

  /**
   * Upload image to Cloudinary via backend
   */
  async uploadImage(imageData, folder = "padma_products") {
    return apiClient("/api/admin/products/upload-image", {
      method: "POST",
      body: JSON.stringify({ image: imageData, folder }),
    });
  },
};

// =========================================================================
// 2. ORDER & CHECKOUT ENDPOINTS
// =========================================================================

export const orderServices = {
  /**
   * Create customer checkout order
   */
  async createCheckoutOrder(orderData) {
    return apiClient("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify({
        ...orderData,
        customer_name: orderData.customerName || orderData.customer_name,
        customer_email: orderData.customerEmail || orderData.customer_email,
        customer_phone: orderData.customerPhone || orderData.customer_phone,
        shipping_address: orderData.shippingAddress || orderData.shipping_address,
        payment_method: (orderData.paymentMethod || "ONLINE").toUpperCase(),
      }),
    });
  },

  /**
   * Get single order by ID
   */
  async getOrderById(id) {
    return apiClient(`/api/orders/${id}`);
  },

  /**
   * List all orders (Admin)
   */
  async getAllOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.paymentStatus) query.set("paymentStatus", params.paymentStatus);
    if (params.search) query.set("search", params.search);

    const qs = query.toString();
    return apiClient(`/api/admin/orders${qs ? `?${qs}` : ""}`);
  },

  /**
   * Update order fulfillment status (Admin)
   */
  async updateOrderStatus(id, status) {
    return apiClient(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Update order payment status (Admin)
   */
  async updatePaymentStatus(id, paymentStatus) {
    return apiClient(`/api/admin/orders/${id}/payment`, {
      method: "PATCH",
      body: JSON.stringify({ paymentStatus }),
    });
  },

  /**
   * TODO: Missing backend endpoint for customer order tracking history.
   * Mock implementation below reads and filters from customer session / local orders.
   */
  async getCustomerOrders(customerEmail) {
    try {
      const res = await this.getAllOrders({ search: customerEmail });
      if (res && res.success && Array.isArray(res.data)) {
        return res;
      }
    } catch {}

    // Mock fallback when endpoint is unavailable or returns unauthorized
    const stored = typeof window !== "undefined" ? localStorage.getItem("pf_admin_orders") : null;
    const orders = stored ? JSON.parse(stored) : [];
    const customerOrders = orders.filter(
      (o) => o.customerEmail?.toLowerCase() === customerEmail?.toLowerCase(),
    );
    return {
      success: true,
      data: customerOrders,
      isMock: true,
    };
  },
};

// =========================================================================
// 3. AUTHENTICATION (ADMIN & CUSTOMER)
// =========================================================================

export const authServices = {
  /**
   * Admin Login
   */
  async adminLogin(email, password) {
    const res = await apiClient("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("pf_admin_jwt_token", res.data.token);
      }
    }
    return res;
  },

  /**
   * Get Admin Profile
   */
  async getAdminProfile() {
    return apiClient("/api/auth/admin/profile");
  },

  /**
   * Update Admin Credentials
   */
  async updateAdminCredentials(currentPassword, newEmail, newPassword) {
    return apiClient("/api/auth/admin/settings/credentials", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newEmail, newPassword }),
    });
  },

  /**
   * TODO: Missing backend endpoint for customer login (using JWT).
   * Backend currently only provisions admin in authRoutes.ts.
   * Mock implementation below validates session and saves to localStorage.
   */
  async customerLogin(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    // Mock customer token/session
    const mockUser = {
      id: `cust_${Date.now().toString(36)}`,
      email: cleanEmail,
      name: cleanEmail.split("@")[0].replace(/[._]/g, " "),
      role: "customer",
    };
    return {
      success: true,
      data: {
        token: `mock_customer_jwt_${Date.now()}`,
        user: mockUser,
      },
      isMock: true,
    };
  },

  /**
   * TODO: Missing backend endpoint for customer registration.
   * Mock implementation below registers customer session.
   */
  async customerRegister(name, email, phone, address) {
    return {
      success: true,
      data: {
        id: `cust_${Date.now().toString(36)}`,
        name,
        email: email.trim().toLowerCase(),
        phone,
        address,
      },
      isMock: true,
    };
  },

  /**
   * Logout Admin or Customer
   */
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pf_admin_jwt_token");
      sessionStorage.removeItem("pf_admin_jwt_token");
    }
  },
};

// =========================================================================
// 4. CONTACT & WHOLESALE ENQUIRIES
// =========================================================================

export const contactServices = {
  /**
   * Submit Contact / Wholesale / Export Enquiry
   */
  async submitEnquiry(enquiryData) {
    return apiClient("/api/contact", {
      method: "POST",
      body: JSON.stringify(enquiryData),
    });
  },

  /**
   * Get all enquiries (Admin)
   */
  async getEnquiries() {
    return apiClient("/api/admin/enquiries");
  },
};

// =========================================================================
// 5. SITE CONTENT (CMS)
// =========================================================================

export const contentServices = {
  /**
   * Get all site content
   */
  async getContent() {
    return apiClient("/api/content/all");
  },

  /**
   * Update home content
   */
  async updateHomeContent(data) {
    return apiClient("/api/content/home", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update about content
   */
  async updateAboutContent(data) {
    return apiClient("/api/content/about", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update contact content
   */
  async updateContactContent(data) {
    return apiClient("/api/content/contact", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset site content to defaults
   */
  async resetContent() {
    return apiClient("/api/content/reset", {
      method: "POST",
    });
  },
};

// =========================================================================
// 6. ADMIN DASHBOARD & INVENTORY
// =========================================================================

export const adminServices = {
  async getDashboardStats() {
    return apiClient("/api/admin/dashboard");
  },

  async getCustomers() {
    return apiClient("/api/admin/customers");
  },

  async getInventory() {
    return apiClient("/api/admin/inventory");
  },

  async adjustStock(productId, newStock, reason) {
    return apiClient("/api/admin/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({ productId, newStock, reason }),
    });
  },

  async getInventoryLogs() {
    return apiClient("/api/admin/inventory/logs");
  },
};

// =========================================================================
// 7. MOCK SERVICES (TODO Backend Endpoints)
// =========================================================================

/**
 * TODO: Missing backend endpoint for delivery pincode validation.
 * Real service can be integrated with India Post API or Delhivery/Shiprocket.
 */
export const deliveryServices = {
  async checkPincode(pincode) {
    const cleanPin = (pincode || "").trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return {
        deliverable: false,
        error: "Please enter a valid 6-digit Indian PIN code.",
      };
    }

    // Chennai & Tamil Nadu pincodes (600xxx to 643xxx) have Express 24-48 hr delivery
    const isChennaiOrTN = cleanPin.startsWith("60") || cleanPin.startsWith("61") || cleanPin.startsWith("62") || cleanPin.startsWith("63") || cleanPin.startsWith("64");

    return {
      deliverable: true,
      city: isChennaiOrTN ? "Chennai / Tamil Nadu" : "India (Domestic Delivery)",
      estimatedDays: isChennaiOrTN ? "1–2 business days (Local Ambattur dispatch)" : "3–5 business days",
      freeShippingEligible: true,
      codAvailable: true,
      isMock: true,
    };
  },
};

/**
 * TODO: Missing backend endpoint for product reviews & ratings.
 * Mock implementation returns verified buyer reviews.
 */
export const reviewServices = {
  async getProductReviews(productId) {
    return {
      success: true,
      data: [
        {
          id: `rev_1_${productId}`,
          author: "Radha Krishnan",
          rating: 5,
          date: "2026-02-14",
          verified: true,
          comment: "Authentic weave and extraordinary fabric texture. Color matches the pictures perfectly!",
        },
        {
          id: `rev_2_${productId}`,
          author: "Ananya Sundaram",
          rating: 5,
          date: "2026-03-01",
          verified: true,
          comment: "Excellent drape and very soft finish. Prompt delivery from Ambattur Chennai.",
        },
      ],
      isMock: true,
    };
  },
};

export default {
  client: apiClient,
  products: productServices,
  orders: orderServices,
  auth: authServices,
  contact: contactServices,
  content: contentServices,
  admin: adminServices,
  delivery: deliveryServices,
  reviews: reviewServices,
};
