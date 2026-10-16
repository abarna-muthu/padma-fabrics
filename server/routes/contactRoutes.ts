import { Router } from "express";
import { submitEnquiry } from "../controllers/contactController";

const router = Router();

router.post("/", submitEnquiry);

export default router;
