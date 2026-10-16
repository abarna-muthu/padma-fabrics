import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { getDb } from "../config/db";

describe("Padma Fabrics Backend API Test Suite", () => {
  let app: any;
  let adminToken: string;

  beforeAll(async () => {
    await getDb();
    app = createApp();
  });

  describe("System Health & Public Endpoints", () => {
    it("GET /api/health returns 200 with system status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
      expect(res.body.service).toBe("Padma Fabrics API");
    });

    it("GET /api/products returns product catalog", async () => {
      const res = await request(app).get("/api/products");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it("GET /api/products/categories returns active categories", async () => {
      const res = await request(app).get("/api/products/categories");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.categories)).toBe(true);
    });
  });

  describe("Contact Enquiries API", () => {
    it("POST /api/contact validates required input fields", async () => {
      const res = await request(app).post("/api/contact").send({
        name: "",
        email: "not-an-email",
        phone: "",
        message: "",
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/contact creates valid enquiry in database", async () => {
      const res = await request(app).post("/api/contact").send({
        name: "Ramesh Sharma",
        email: "ramesh.sharma@example.com",
        phone: "+91 98840 12345",
        enquiry_type: "Wholesale Sourcing",
        message: "Requesting pricing for 40 metres of ivory brocade fabric.",
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.enquiryId).toBeDefined();
    });
  });

  describe("Admin Authentication & Role Authorization", () => {
    it("POST /api/auth/admin/login rejects invalid credentials with 401", async () => {
      const res = await request(app).post("/api/auth/admin/login").send({
        email: "admin@gmail.com",
        password: "wrong-password",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/auth/admin/login accepts initial credentials and issues JWT token", async () => {
      const res = await request(app).post("/api/auth/admin/login").send({
        email: "admin@gmail.com",
        password: "admin123",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe("admin");
      adminToken = res.body.token;
    });

    it("GET /api/admin/dashboard blocks unauthenticated requests with 401", async () => {
      const res = await request(app).get("/api/admin/dashboard");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/admin/dashboard permits authenticated admin access", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.revenue).toBeDefined();
      expect(res.body.data.products).toBeDefined();
      expect(res.body.data.orders).toBeDefined();
    });
  });

  describe("Admin Catalog & Inventory Operations", () => {
    let createdProdId: string;

    it("POST /api/admin/products creates a new product and records initial inventory log", async () => {
      const res = await request(app)
        .post("/api/admin/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "The Royal Indigo Silk Saree",
          category: "Sarees",
          colour: "Indigo & Silver",
          price: 4900,
          unit: "piece",
          stock: 12,
          badge: "Signature",
          description: "Fine indigo silk with handwoven silver zari motif border.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product.id).toBeDefined();
      createdProdId = res.body.product.id;
    });

    it("POST /api/admin/inventory/adjust updates stock quantity and logs movement", async () => {
      const res = await request(app)
        .post("/api/admin/inventory/adjust")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          productId: createdProdId,
          new_stock: 15,
          reason: "Received artisan batch",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stock).toBe(15);
    });

    it("GET /api/admin/inventory/logs returns audit records", async () => {
      const res = await request(app)
        .get("/api/admin/inventory/logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.logs.length).toBeGreaterThan(0);
    });
  });

  describe("Checkout & Stock Concurrency", () => {
    it("POST /api/orders/checkout prevents orders exceeding available stock", async () => {
      const res = await request(app)
        .post("/api/orders/checkout")
        .send({
          customer_name: "Test Customer",
          customer_email: "test@example.com",
          customer_phone: "+91 99999 88888",
          shipping_address: "123 Test Street, Chennai",
          items: [{ id: "sage-cotton", quantity: 99999 }], // Exceeds available stock (stock is 4)
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Insufficient stock");
    });

    it("POST /api/orders/checkout validates stock, creates order, and deducts inventory", async () => {
      const res = await request(app)
        .post("/api/orders/checkout")
        .send({
          customer_name: "Pooja Venkatesh",
          customer_email: "pooja.v@example.com",
          customer_phone: "+91 98409 77654",
          shipping_address: "Door 4, North Mada Street, Mylapore, Chennai – 600004",
          payment_method: "COD",
          items: [{ id: "wine-silk", quantity: 1 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order.orderNumber).toBeDefined();
    });
  });
});
