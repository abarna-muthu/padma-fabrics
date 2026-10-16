import { Router } from "express";
import { adminLogin, getAdminProfile, adminUpdateCredentials } from "../controllers/authController";
import { authenticate, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.post("/admin/login", adminLogin);
router.get("/admin/profile", authenticate, requireAdmin, getAdminProfile);
router.put("/admin/settings/credentials", authenticate, requireAdmin, adminUpdateCredentials);

export default router;
