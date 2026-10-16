import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/dashboardController";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "../controllers/productController";
import { getInventory, adjustStock, getInventoryLogs } from "../controllers/inventoryController";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/orderController";
import { getEnquiries } from "../controllers/contactController";
import { adminUpdateCredentials, getAdminProfile } from "../controllers/authController";

const router = Router();

// Apply administrative authentication & authorization to all routes in this router
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Products catalog management
router.get("/products", (req, res) => {
  // Admin sees all products (including inactive)
  req.query.active_only = "false";
  return getProducts(req, res);
});
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/toggle", toggleProductStatus);
router.patch("/products/:id/toggle-status", toggleProductStatus);

// Inventory
router.get("/inventory", getInventory);
router.post("/inventory/adjust", adjustStock);
router.get("/inventory/logs", getInventoryLogs);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/payment", updatePaymentStatus);

// Enquiries
router.get("/enquiries", getEnquiries);

// Settings
router.get("/settings/profile", getAdminProfile);
router.put("/settings/credentials", adminUpdateCredentials);

export default router;
