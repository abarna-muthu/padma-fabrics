export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  message?: string;
  status?: number;
  isMock?: boolean;
}

export function apiClient<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;

export const productServices: {
  getAllProducts(params?: { category?: string; search?: string; featured?: boolean; limit?: number }): Promise<{
    success: boolean;
    data: any[];
    count: number;
  }>;
  getProductById(id: string): Promise<ApiResponse<any>>;
  getCategories(): Promise<ApiResponse<any[]>>;
  createCategory(data: { name: string; description?: string }): Promise<ApiResponse<any>>;
  createProduct(data: any): Promise<ApiResponse<any>>;
  updateProduct(id: string, updates: any): Promise<ApiResponse<any>>;
  deleteProduct(id: string): Promise<ApiResponse<any>>;
  toggleProductStatus(id: string): Promise<ApiResponse<any>>;
  bulkSync(products: any[], clearDefaults?: boolean): Promise<ApiResponse<any>>;
  uploadImage(imageData: string, folder?: string): Promise<ApiResponse<any>>;
};

export const orderServices: {
  createCheckoutOrder(orderData: any): Promise<ApiResponse<any>>;
  getOrderById(id: string): Promise<ApiResponse<any>>;
  getAllOrders(params?: { status?: string; paymentStatus?: string; search?: string }): Promise<ApiResponse<any[]>>;
  updateOrderStatus(id: string, status: string): Promise<ApiResponse<any>>;
  updatePaymentStatus(id: string, paymentStatus: string): Promise<ApiResponse<any>>;
  getCustomerOrders(customerEmail: string): Promise<ApiResponse<any[]>>;
};

export const authServices: {
  adminLogin(email: string, password?: string): Promise<ApiResponse<{ token: string; user: any }>>;
  getAdminProfile(): Promise<ApiResponse<any>>;
  updateAdminCredentials(currentPassword: string, newEmail: string, newPassword: string): Promise<ApiResponse<any>>;
  customerLogin(email: string, password?: string): Promise<ApiResponse<{ token: string; user: any }>>;
  customerRegister(name: string, email: string, phone: string, address?: string): Promise<ApiResponse<any>>;
  logout(): void;
};

export const contactServices: {
  submitEnquiry(enquiryData: { name: string; email: string; phone?: string; message: string; enquiryType?: string }): Promise<ApiResponse<any>>;
  getEnquiries(): Promise<ApiResponse<any[]>>;
};

export const contentServices: {
  getContent(): Promise<ApiResponse<any>>;
  updateHomeContent(data: any): Promise<ApiResponse<any>>;
  updateAboutContent(data: any): Promise<ApiResponse<any>>;
  updateContactContent(data: any): Promise<ApiResponse<any>>;
  resetContent(): Promise<ApiResponse<any>>;
};

export const adminServices: {
  getDashboardStats(): Promise<ApiResponse<any>>;
  getCustomers(): Promise<ApiResponse<any[]>>;
  getInventory(): Promise<ApiResponse<any>>;
  adjustStock(productId: string, newStock: number, reason: string): Promise<ApiResponse<any>>;
  getInventoryLogs(): Promise<ApiResponse<any[]>>;
};

export const deliveryServices: {
  checkPincode(pincode: string): Promise<{
    deliverable: boolean;
    city?: string;
    estimatedDays?: string;
    freeShippingEligible?: boolean;
    codAvailable?: boolean;
    error?: string;
    isMock?: boolean;
  }>;
};

export const reviewServices: {
  getProductReviews(productId: string): Promise<{
    success: boolean;
    data: any[];
    isMock?: boolean;
  }>;
};

declare const api: {
  client: typeof apiClient;
  products: typeof productServices;
  orders: typeof orderServices;
  auth: typeof authServices;
  contact: typeof contactServices;
  content: typeof contentServices;
  admin: typeof adminServices;
  delivery: typeof deliveryServices;
  reviews: typeof reviewServices;
};

export default api;
