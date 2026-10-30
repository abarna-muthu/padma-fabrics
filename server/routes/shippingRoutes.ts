import { Router } from "express";
import { getShippingRate, getPublicShippingRates } from "../controllers/shippingController";

const router = Router();

// GET /api/shipping-rates -> list all active rates & free shipping settings
router.get("/", getPublicShippingRates);

// GET /api/shipping-rates/rate?state=Tamil Nadu
router.get("/rate", getShippingRate);

export default router;
