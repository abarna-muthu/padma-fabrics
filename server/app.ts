import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import contactRoutes from "./routes/contactRoutes";
import adminRoutes from "./routes/adminRoutes";
import contentRoutes from "./routes/contentRoutes";
import shippingRoutes from "./routes/shippingRoutes";
import { getShippingRate } from "./controllers/shippingController";
import { getDb } from "./config/db";

export function createApp() {
  const app = express();

  // Basic CORS & parser setup
  app.use(
    cors({
      origin: process.env["CORS_ORIGIN"] || true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-admin-fallback"],
    }),
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Request logger in dev
  if (process.env["NODE_ENV"] !== "test") {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        if (req.originalUrl.startsWith("/api")) {
          console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        }
      });
      next();
    });
  }

  // Health check endpoint
  app.get("/api/health", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      return res.status(200).json({
        status: "healthy",
        service: "Padma Fabrics API",
        database: db.isMySQL ? "MySQL / TiDB Cloud" : "Local Database Engine",
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({
        status: "unhealthy",
        error: err.message,
      });
    }
  });

  // Mount API modules
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/shipping-rates", shippingRoutes);
  // Direct shortcut as requested: GET /api/shipping-rate?state=<state>
  app.get("/api/shipping-rate", getShippingRate);

  // 404 handler for unmatched API routes
  app.use("/api", (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route '${req.method} ${req.originalUrl}' was not found on this server.`,
    });
  });

  // Centralized Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("[ServerError]", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "An unexpected internal server error occurred.",
    });
  });

  return app;
}
