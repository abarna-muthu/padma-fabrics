import { Router } from "express";
import { createCheckoutOrder, getOrderById, cancelOrder } from "../controllers/orderController";

const router = Router();

router.post("/checkout", createCheckoutOrder);
router.get("/:id", getOrderById);
router.post("/:id/cancel", cancelOrder);

export default router;

