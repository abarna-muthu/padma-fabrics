import { Router } from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  createCategory,
  getProductReviews,
  addProductReview,
} from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", addProductReview);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/toggle", toggleProductStatus);
router.patch("/:id/toggle-status", toggleProductStatus);

export default router;
