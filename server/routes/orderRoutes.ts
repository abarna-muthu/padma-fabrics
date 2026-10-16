import { Router } from "express";
import { createCheckoutOrder, getOrderById } from "../controllers/orderController";

const router = Router();

router.post("/checkout", createCheckoutOrder);
router.get("/:id", getOrderById);

export default router;
