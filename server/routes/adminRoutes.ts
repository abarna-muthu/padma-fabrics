import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/dashboardController";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  createCategory,
  bulkSyncProducts,
  removeDefaultProducts,
} from "../controllers/productController";
import { getInventory, adjustStock, getInventoryLogs } from "../controllers/inventoryController";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controllers/orderController";
import { getEnquiries } from "../controllers/contactController";
import { adminUpdateCredentials, getAdminProfile } from "../controllers/authController";
import { uploadImage, getUploadSignature } from "../controllers/uploadController";

const router = Router();

// Apply administrative authentication & authorization to all routes in this router
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Customers
router.get("/customers", getCustomers);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

// Products catalog management
router.get("/products", (req, res) => {
  // Admin sees all products (including inactive)
  req.query["active_only"] = "false";
  return getProducts(req, res);
});
router.post("/products", createProduct);
router.post("/products/bulk-sync", bulkSyncProducts);
router.post("/products/remove-defaults", removeDefaultProducts);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/toggle", toggleProductStatus);
router.patch("/products/:id/toggle-status", toggleProductStatus);
router.post("/categories", createCategory);
router.post("/products/categories", createCategory);
router.post("/upload", uploadImage);
router.post("/products/upload-image", uploadImage);
router.get("/upload/signature", getUploadSignature);

// Inventory
router.get("/inventory", getInventory);
router.post("/inventory/adjust", adjustStock);
router.get("/inventory/logs", getInventoryLogs);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/payment", updatePaymentStatus);
router.delete("/orders/:id", deleteOrder);

// Enquiries
router.get("/enquiries", getEnquiries);

// Settings
router.get("/settings/profile", getAdminProfile);
router.put("/settings/credentials", adminUpdateCredentials);

export default router;
