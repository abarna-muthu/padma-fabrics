import { Router } from "express";
import {
  createCheckoutOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  cancelOrder,
  downloadOrderInvoice,
} from "../controllers/orderController";

const router = Router();

router.get("/", getOrders);
router.post("/checkout", createCheckoutOrder);
router.get("/:id/invoice", downloadOrderInvoice);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment", updatePaymentStatus);
router.patch("/:id/payment-status", updatePaymentStatus);
router.delete("/:id", deleteOrder);
router.post("/:id/cancel", cancelOrder);

export default router;

