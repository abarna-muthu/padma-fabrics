import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

dotenv.config();

// Default initial dev admin password hash
const INITIAL_ADMIN_EMAIL = "admin@gmail.com";
const INITIAL_ADMIN_PASS = "admin123";

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<any>;
  isMySQL: boolean;
}

export const INITIAL_CATEGORIES = [
  {
    id: "sarees",
    name: "Sarees",
    slug: "sarees",
    description: "Silk & handloom drapes",
    display_order: 1,
  },
  {
    id: "fabrics",
    name: "Fabrics",
    slug: "fabrics",
    description: "Beautiful by the metre",
    display_order: 2,
  },
  {
    id: "shirts",
    name: "Shirts",
    slug: "shirts",
    description: "Crisp linen & cotton",
    display_order: 3,
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Easy everyday comfort",
    display_order: 4,
  },
  {
    id: "womens-dresses",
    name: "Women's Dresses",
    slug: "womens-dresses",
    description: "Festive & daily wear",
    display_order: 5,
  },
  {
    id: "kids-wear",
    name: "Kids Wear",
    slug: "kids-wear",
    description: "Little celebrations",
    display_order: 6,
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: "wine-silk",
    sku: "PF-SAR-001",
    name: "The Wine Zari Silk Saree",
    slug: "the-wine-zari-silk-saree",
    category_id: "sarees",
    colour: "Wine & antique gold",
    price: 4250,
    original_price: 4800,
    unit: "piece",
    stock_quantity: 14,
    low_stock_threshold: 5,
    badge: "Editor's pick",
    description:
      "A rich wine palette and an ornate golden border, made for memorable occasions.",
    image_url: "/assets/burgundy-silk.jpg",
    is_active: 1,
    is_featured: 1,
    sizes: JSON.stringify(["Free Size"]),
    created_at: new Date().toISOString(),
  },
  {
    id: "heritage-silk",
    sku: "PF-SAR-002",
    name: "The Heritage Silk Saree",
    slug: "the-heritage-silk-saree",
    category_id: "sarees",
    colour: "Burgundy & gold",
    price: 5450,
    original_price: 6000,
    unit: "piece",
    stock_quantity: 8,
    low_stock_threshold: 5,
    badge: "Signature",
    description:
      "Dramatic burgundy folds and a detailed gold border in a timeless festive palette.",
    image_url: "/assets/fabric-hero.jpg",
    is_active: 1,
    is_featured: 1,
    sizes: JSON.stringify(["Free Size"]),
    created_at: new Date().toISOString(),
  },
  {
    id: "sage-cotton",
    sku: "PF-FAB-001",
    name: "The Sage Buti Cotton",
    slug: "the-sage-buti-cotton",
    category_id: "fabrics",
    colour: "Sage green",
    price: 650,
    original_price: 750,
    unit: "metre",
    stock_quantity: 4, // low stock!
    low_stock_threshold: 5,
    badge: "Everyday",
    description: "A soft sage palette with delicate woven motifs and a subtle golden border.",
    image_url: "/assets/sage-fabric.jpg",
    is_active: 1,
    is_featured: 1,
    sizes: JSON.stringify([]),
    created_at: new Date().toISOString(),
  },
  {
    id: "ivory-brocade",
    sku: "PF-FAB-002",
    name: "The Ivory Floral Brocade",
    slug: "the-ivory-floral-brocade",
    category_id: "fabrics",
    colour: "Ivory & gold",
    price: 980,
    original_price: 1100,
    unit: "metre",
    stock_quantity: 25,
    low_stock_threshold: 5,
    badge: "Occasion edit",
    description:
      "An intricate floral pattern in ivory and gold, with a beautifully textured finish.",
    image_url: "/assets/ivory-brocade.jpg",
    is_active: 1,
    is_featured: 1,
    sizes: JSON.stringify([]),
    created_at: new Date().toISOString(),
  },
  {
    id: "linen-shirt",
    sku: "PF-SHT-001",
    name: "The Classic Linen Shirt",
    slug: "the-classic-linen-shirt",
    category_id: "shirts",
    colour: "Pure white",
    price: 1499,
    original_price: 1799,
    unit: "piece",
    stock_quantity: 18,
    low_stock_threshold: 5,
    badge: "Men",
    description: "A breathable linen-cotton formal shirt with a clean, slim fit.",
    image_url: "/assets/mens-shirt.jpg",
    is_active: 1,
    is_featured: 0,
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    created_at: new Date().toISOString(),
  },
  {
    id: "navy-tee",
    sku: "PF-TEE-001",
    name: "The Everyday Cotton Tee",
    slug: "the-everyday-cotton-tee",
    category_id: "t-shirts",
    colour: "Navy blue",
    price: 599,
    original_price: 699,
    unit: "piece",
    stock_quantity: 35,
    low_stock_threshold: 5,
    badge: "Best seller",
    description: "Soft combed-cotton crew neck T-shirt for all-day comfort.",
    image_url: "/assets/tshirt.jpg",
    is_active: 1,
    is_featured: 0,
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    created_at: new Date().toISOString(),
  },
  {
    id: "maroon-anarkali",
    sku: "PF-DRS-001",
    name: "The Maroon Anarkali Dress",
    slug: "the-maroon-anarkali-dress",
    category_id: "womens-dresses",
    colour: "Maroon & gold",
    price: 3299,
    original_price: 3899,
    unit: "piece",
    stock_quantity: 2, // low stock!
    low_stock_threshold: 5,
    badge: "Women",
    description: "A flowing anarkali with gold embroidery and a matching dupatta.",
    image_url: "/assets/womens-dress.jpg",
    is_active: 1,
    is_featured: 0,
    sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
    created_at: new Date().toISOString(),
  },
  {
    id: "pattu-pavadai",
    sku: "PF-KID-001",
    name: "The Little Pattu Pavadai",
    slug: "the-little-pattu-pavadai",
    category_id: "kids-wear",
    colour: "Mustard & green",
    price: 1899,
    original_price: 2199,
    unit: "piece",
    stock_quantity: 11,
    low_stock_threshold: 5,
    badge: "Kids",
    description: "A traditional silk pavadai set with a peacock zari border.",
    image_url: "/assets/kids-dress.jpg",
    is_active: 1,
    is_featured: 0,
    sizes: JSON.stringify(["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"]),
    created_at: new Date().toISOString(),
  },
];

// In-Memory store for development when TiDB / MySQL is not connected
class MemoryDatabase {
  admin_users: any[] = [];
  customers: any[] = [];
  customer_addresses: any[] = [];
  categories: any[] = [];
  products: any[] = [];
  inventory_logs: any[] = [];
  carts: any[] = [];
  cart_items: any[] = [];
  orders: any[] = [];
  order_items: any[] = [];
  payments: any[] = [];
  contact_enquiries: any[] = [];

  constructor() {
    // Seed categories and products synchronously so they are always immediately available
    this.categories = [...INITIAL_CATEGORIES];
    this.products = [...INITIAL_PRODUCTS];
    this.initSeed();
  }

  async initSeed() {
    const hash = await bcrypt.hash(INITIAL_ADMIN_PASS, 10);
    this.admin_users.push({
      id: "adm-001",
      email: INITIAL_ADMIN_EMAIL,
      password_hash: hash,
      name: "Padmanabha Administrator",
      role: "admin",
      created_at: new Date().toISOString(),
    });

    // Initial development sample orders
    const o1 = {
      id: "PF-1081",
      order_number: "PF-1081",
      customer_id: null,
      customer_name: "Kavitha Natarajan",
      customer_email: "kavitha.n@gmail.com",
      customer_phone: "+91 98401 22819",
      shipping_address: "Flat 4B, Lotus Apartments, Anna Nagar, Chennai – 600040",
      subtotal: 5450,
      shipping_fee: 0,
      discount_amount: 0,
      total_amount: 5450,
      order_status: "Delivered",
      payment_method: "Razorpay",
      payment_status: "Paid",
      notes: "Delivered to door.",
      created_at: "2026-10-14 11:30:00",
    };
    this.orders.push(o1);
    this.order_items.push({
      id: "oi-101",
      order_id: "PF-1081",
      product_id: "heritage-silk",
      product_name: "The Heritage Silk Saree",
      product_sku: "PF-SAR-002",
      unit_price: 5450,
      quantity: 1,
      unit: "piece",
      size: "Free Size",
      total_price: 5450,
      created_at: "2026-10-14 11:30:00",
    });

    const o2 = {
      id: "PF-1082",
      order_number: "PF-1082",
      customer_id: null,
      customer_name: "Sundaramurthy Textiles",
      customer_email: "contact@smtextiles.co.in",
      customer_phone: "+91 94440 98112",
      shipping_address: "Boutique #12, Commercial Road, T. Nagar, Chennai – 600017",
      subtotal: 17600,
      shipping_fee: 0,
      discount_amount: 0,
      total_amount: 17600,
      order_status: "Processing",
      payment_method: "Bank Transfer",
      payment_status: "Paid",
      notes: "Wholesale consignment sample.",
      created_at: "2026-10-15 09:15:00",
    };
    this.orders.push(o2);
    this.order_items.push(
      {
        id: "oi-102",
        order_id: "PF-1082",
        product_id: "ivory-brocade",
        product_name: "The Ivory Floral Brocade",
        product_sku: "PF-FAB-002",
        unit_price: 980,
        quantity: 10,
        unit: "metre",
        size: "",
        total_price: 9800,
        created_at: "2026-10-15 09:15:00",
      },
      {
        id: "oi-103",
        order_id: "PF-1082",
        product_id: "sage-cotton",
        product_name: "The Sage Buti Cotton",
        product_sku: "PF-FAB-001",
        unit_price: 650,
        quantity: 12,
        unit: "metre",
        size: "",
        total_price: 7800,
        created_at: "2026-10-15 09:15:00",
      },
    );

    const o3 = {
      id: "PF-1083",
      order_number: "PF-1083",
      customer_id: null,
      customer_name: "Dr. Ananya Rao",
      customer_email: "ananya.rao@yahoo.com",
      customer_phone: "+91 97890 33451",
      shipping_address: "Villa 8, Orchid Enclave, ECR, Injambakkam, Chennai – 600115",
      subtotal: 3597,
      shipping_fee: 0,
      discount_amount: 0,
      total_amount: 3597,
      order_status: "Shipped",
      payment_method: "COD",
      payment_status: "Paid",
      notes: "Call prior to delivery.",
      created_at: "2026-10-15 14:00:00",
    };
    this.orders.push(o3);

    // Initial stock adjustment log
    this.inventory_logs.push(
      {
        id: "LOG-001",
        product_id: "ivory-brocade",
        previous_stock: 15,
        new_stock: 25,
        change_amount: 10,
        reason: "Loom shipment received at Ambattur warehouse",
        created_at: "2026-10-12 10:00:00",
      },
      {
        id: "LOG-002",
        product_id: "maroon-anarkali",
        previous_stock: 3,
        new_stock: 2,
        change_amount: -1,
        reason: "Boutique floor display allotment",
        created_at: "2026-10-14 16:30:00",
      },
    );

    // Initial contact enquiries
    this.contact_enquiries.push({
      id: "ENQ-001",
      name: "Meenakshi Sundaram",
      email: "meenakshi@gmail.com",
      phone: "+91 98410 55219",
      enquiry_type: "Wholesale Sourcing",
      message: "Interested in sourcing 50 metres of zari border silks for our boutique in Madurai.",
      status: "New",
      created_at: "2026-10-15 16:00:00",
    });
  }
}

let mysqlPool: mysql.Pool | null = null;
let isConnectedToMySQL = false;
const memoryDb = new MemoryDatabase();

export async function initDatabase(): Promise<DatabaseAdapter> {
  const host = process.env["DB_HOST"] || process.env["TIDB_HOST"];
  const user = process.env["DB_USER"] || process.env["TIDB_USER"];
  const password = process.env["DB_PASSWORD"] || process.env["TIDB_PASSWORD"];
  const database = process.env["DB_NAME"] || process.env["TIDB_DATABASE"] || "padma_fabrics";
  const port = Number(process.env["DB_PORT"] || process.env["TIDB_PORT"]) || 4000;
  const ssl =
    process.env["DB_SSL"] === "true" || process.env["TIDB_SSL"] === "true"
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
      : undefined;

  if (host && user && password) {
    try {
      console.log(
        `[Database] Attempting connection to MySQL/TiDB at ${host}:${port}/${database}...`,
      );
      mysqlPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        ssl: ssl as any,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test connection
      const connection = await mysqlPool.getConnection();
      console.log("[Database] Successfully connected to MySQL / TiDB Cloud instance!");
      connection.release();
      isConnectedToMySQL = true;

      // Run schema initialization
      await runMigrations(mysqlPool);
    } catch (err: any) {
      console.warn(`[Database] MySQL/TiDB connection error: ${err.message}`);
      console.log("[Database] Falling back to high-performance local memory database engine.");
      isConnectedToMySQL = false;
      mysqlPool = null;
    }
  } else {
    console.log(
      "[Database] No external DB_HOST provided in environment. Initializing local database engine for development.",
    );
  }

  return {
    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      if (isConnectedToMySQL && mysqlPool) {
        const [rows] = await mysqlPool.query(sql, params);
        return rows as T[];
      }
      return executeMemoryQuery<T>(sql, params);
    },
    async execute(sql: string, params: any[] = []): Promise<any> {
      if (isConnectedToMySQL && mysqlPool) {
        const [result] = await mysqlPool.execute(sql, params);
        return result;
      }
      return executeMemoryCommand(sql, params);
    },
    get isMySQL() {
      return isConnectedToMySQL;
    },
  };
}

async function runMigrations(pool: mysql.Pool) {
  try {
    const schemaPath = path.join(__dirname, "../migrations/schema.sql");
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await pool.query(statement);
      }
      console.log("[Database] Schema migrations applied successfully.");

      // Check if products and categories need initial seeding in MySQL / TiDB
      try {
        const [existingProducts]: any = await pool.query("SELECT COUNT(*) as count FROM products");
        if (existingProducts && existingProducts[0]?.count === 0) {
          console.log("[Database] Seeding initial products & categories to MySQL/TiDB...");
          for (const cat of INITIAL_CATEGORIES) {
            await pool.execute(
              "INSERT IGNORE INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)",
              [cat.id, cat.name, cat.slug, cat.description, cat.display_order],
            );
          }
          for (const prod of INITIAL_PRODUCTS) {
            await pool.execute(
              `INSERT IGNORE INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                prod.id,
                prod.sku,
                prod.name,
                prod.slug,
                prod.category_id,
                prod.colour,
                prod.price,
                prod.original_price,
                prod.unit,
                prod.stock_quantity,
                prod.low_stock_threshold,
                prod.badge,
                prod.description,
                prod.image_url,
                prod.is_active,
                prod.is_featured,
                prod.sizes,
              ],
            );
          }
          console.log("[Database] Initial products & categories seeded successfully.");
        }
      } catch (seedErr: any) {
        console.warn("[Database] Notice checking/seeding initial products:", seedErr.message);
      }
    }
  } catch (err: any) {
    console.error("[Database] Migration error:", err.message);
  }
}

// Memory query executor for standalone operation
function executeMemoryQuery<T = any>(sql: string, params: any[] = []): T[] {
  const normalized = sql.trim().toLowerCase();

  // Admin users lookup
  if (normalized.includes("from admin_users") && normalized.includes("where email =")) {
    const email = params[0]?.toLowerCase();
    return memoryDb.admin_users.filter((u) => u.email.toLowerCase() === email) as any;
  }
  if (normalized.includes("from admin_users") && normalized.includes("where id =")) {
    const id = params[0];
    return memoryDb.admin_users.filter((u) => u.id === id) as any;
  }
  if (normalized.includes("from admin_users")) {
    return memoryDb.admin_users as any;
  }

  // Categories
  if (normalized.includes("from categories")) {
    return [...memoryDb.categories].sort((a, b) => a.display_order - b.display_order) as any;
  }

  // Products
  if (
    normalized.includes("from products") &&
    (normalized.includes("where id =") ||
      normalized.includes("where lower(id) =") ||
      normalized.includes("where slug ="))
  ) {
    const target = String(params[0] || "").trim().toLowerCase();
    return memoryDb.products.filter(
      (p) =>
        p.id?.toLowerCase() === target ||
        p.slug?.toLowerCase() === target ||
        (p.sku && p.sku.toLowerCase() === target),
    ) as any;
  }
  if (normalized.includes("from products") && normalized.includes("is_featured = 1")) {
    return memoryDb.products.filter((p) => p.is_active && p.is_featured) as any;
  }
  if (normalized.includes("from products") && normalized.includes("category_id =")) {
    const cat = params[0];
    return memoryDb.products.filter((p) => p.is_active && p.category_id === cat) as any;
  }
  if (normalized.includes("from products")) {
    return memoryDb.products as any;
  }

  // Inventory logs
  if (normalized.includes("from inventory_logs")) {
    return [...memoryDb.inventory_logs].reverse() as any;
  }

  // Orders
  if (normalized.includes("from orders") && normalized.includes("where id =")) {
    const id = params[0];
    return memoryDb.orders.filter((o) => o.id === id) as any;
  }
  if (normalized.includes("from order_items") && normalized.includes("where order_id =")) {
    const orderId = params[0];
    return memoryDb.order_items.filter((item) => item.order_id === orderId) as any;
  }
  if (normalized.includes("from orders")) {
    return [...memoryDb.orders].reverse() as any;
  }

  // Contact enquiries
  if (normalized.includes("from contact_enquiries")) {
    return [...memoryDb.contact_enquiries].reverse() as any;
  }

  // Customers
  if (normalized.includes("from customers") && normalized.includes("where email =")) {
    const email = params[0]?.toLowerCase();
    return memoryDb.customers.filter((c) => c.email?.toLowerCase() === email) as any;
  }
  if (normalized.includes("from customers") && normalized.includes("where id =")) {
    const id = params[0];
    return memoryDb.customers.filter((c) => c.id === id) as any;
  }
  if (normalized.includes("from customers")) {
    return [...memoryDb.customers].reverse() as any;
  }

  // Customer addresses
  if (normalized.includes("from customer_addresses") && normalized.includes("where customer_id =")) {
    const cid = params[0];
    return memoryDb.customer_addresses.filter((a) => a.customer_id === cid) as any;
  }
  if (normalized.includes("from customer_addresses")) {
    return [...memoryDb.customer_addresses] as any;
  }

  return [] as any;
}

function executeMemoryCommand(sql: string, params: any[] = []): any {
  const normalized = sql.trim().toLowerCase();

  // Admin user update
  if (normalized.startsWith("update admin_users")) {
    // Expected: UPDATE admin_users SET email = ?, password_hash = ? WHERE id = ?
    const email = params[0];
    const passHash = params[1];
    const id = params[2];
    const user = memoryDb.admin_users.find((u) => u.id === id);
    if (user) {
      user.email = email;
      user.password_hash = passHash;
      user.updated_at = new Date().toISOString();
      return { affectedRows: 1 };
    }
  }

  // Product insert
  if (normalized.startsWith("insert into products")) {
    // id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes
    const newP = {
      id: params[0],
      sku: params[1],
      name: params[2],
      slug: params[3],
      category_id: params[4],
      colour: params[5],
      price: Number(params[6]),
      original_price: Number(params[7]),
      unit: params[8] || "piece",
      stock_quantity: Number(params[9]) || 0,
      low_stock_threshold: Number(params[10]) || 5,
      badge: params[11] || "",
      description: params[12] || "",
      image_url: params[13] || "",
      is_active: params[14] !== undefined ? params[14] : 1,
      is_featured: params[15] !== undefined ? params[15] : 0,
      sizes: typeof params[16] === "string" ? params[16] : JSON.stringify(params[16] || []),
      created_at: new Date().toISOString(),
    };
    memoryDb.products.unshift(newP);
    return { insertId: newP.id, affectedRows: 1 };
  }

  // Product update
  if (normalized.startsWith("update products")) {
    const id = params[params.length - 1];
    const prod = memoryDb.products.find((p) => p.id === id);
    if (prod) {
      // params mapping
      if (params.length >= 10) {
        prod.name = params[0];
        prod.category_id = params[1];
        prod.colour = params[2];
        prod.price = Number(params[3]);
        prod.unit = params[4];
        prod.stock_quantity = Number(params[5]);
        prod.badge = params[6];
        prod.description = params[7];
        prod.image_url = params[8];
        prod.is_active = params[9];
      }
      return { affectedRows: 1 };
    }
  }

  // Product delete
  if (normalized.startsWith("delete from products")) {
    const id = params[0];
    const idx = memoryDb.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      memoryDb.products.splice(idx, 1);
      return { affectedRows: 1 };
    }
  }

  // Inventory log insert
  if (normalized.startsWith("insert into inventory_logs")) {
    const log = {
      id: params[0],
      product_id: params[1],
      previous_stock: params[2],
      new_stock: params[3],
      change_amount: params[4],
      reason: params[5],
      created_at: new Date().toISOString(),
    };
    memoryDb.inventory_logs.push(log);
    return { affectedRows: 1 };
  }

  // Stock quantity update
  if (normalized.startsWith("update products set stock_quantity =")) {
    const newStock = Number(params[0]);
    const id = params[1];
    const prod = memoryDb.products.find((p) => p.id === id);
    if (prod) {
      prod.stock_quantity = newStock;
      return { affectedRows: 1 };
    }
  }

  // Orders insert
  if (normalized.startsWith("insert into orders")) {
    const order = {
      id: params[0],
      order_number: params[1],
      customer_id: params[2],
      customer_name: params[3],
      customer_email: params[4],
      customer_phone: params[5],
      shipping_address: params[6],
      subtotal: Number(params[7]),
      shipping_fee: Number(params[8]),
      discount_amount: Number(params[9]),
      total_amount: Number(params[10]),
      order_status: params[11],
      payment_method: params[12],
      payment_status: params[13],
      notes: params[14],
      created_at: new Date().toISOString(),
    };
    memoryDb.orders.unshift(order);
    return { insertId: order.id, affectedRows: 1 };
  }

  // Order items insert
  if (normalized.startsWith("insert into order_items")) {
    const item = {
      id: params[0],
      order_id: params[1],
      product_id: params[2],
      product_name: params[3],
      product_sku: params[4],
      unit_price: Number(params[5]),
      quantity: Number(params[6]),
      unit: params[7],
      size: params[8],
      total_price: Number(params[9]),
      created_at: new Date().toISOString(),
    };
    memoryDb.order_items.push(item);
    return { insertId: item.id, affectedRows: 1 };
  }

  // Order status update
  if (normalized.startsWith("update orders set order_status =")) {
    const status = params[0];
    const id = params[1];
    const ord = memoryDb.orders.find((o) => o.id === id);
    if (ord) {
      ord.order_status = status;
      return { affectedRows: 1 };
    }
  }

  // Order payment status update
  if (normalized.startsWith("update orders set payment_status =")) {
    const payStatus = params[0];
    const id = params[1];
    const ord = memoryDb.orders.find((o) => o.id === id);
    if (ord) {
      ord.payment_status = payStatus;
      return { affectedRows: 1 };
    }
  }

  // Contact enquiries insert
  if (normalized.startsWith("insert into contact_enquiries")) {
    const enq = {
      id: params[0],
      name: params[1],
      email: params[2],
      phone: params[3],
      enquiry_type: params[4],
      message: params[5],
      status: "New",
      created_at: new Date().toISOString(),
    };
    memoryDb.contact_enquiries.unshift(enq);
    return { insertId: enq.id, affectedRows: 1 };
  }

  // Cart insert/update
  if (normalized.startsWith("insert into carts")) {
    const cart = {
      id: params[0],
      customer_id: params[1],
      session_id: params[2],
      created_at: new Date().toISOString(),
    };
    memoryDb.carts.push(cart);
    return { affectedRows: 1 };
  }

  if (normalized.startsWith("insert into cart_items")) {
    const ci = {
      id: params[0],
      cart_id: params[1],
      product_id: params[2],
      size: params[3],
      quantity: Number(params[4]),
      created_at: new Date().toISOString(),
    };
    memoryDb.cart_items.push(ci);
    return { affectedRows: 1 };
  }

  if (normalized.startsWith("delete from cart_items where id =")) {
    const id = params[0];
    const idx = memoryDb.cart_items.findIndex((item) => item.id === id);
    if (idx !== -1) {
      memoryDb.cart_items.splice(idx, 1);
      return { affectedRows: 1 };
    }
  }

  // Customer insert/update
  if (normalized.startsWith("insert into customers")) {
    const cust = {
      id: params[0],
      name: params[1],
      email: params[2],
      phone: params[3],
      password_hash: params[4] || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryDb.customers.unshift(cust);
    return { insertId: cust.id, affectedRows: 1 };
  }

  if (normalized.startsWith("update customers set")) {
    const name = params[0];
    const phone = params[1];
    const id = params[2];
    const cust = memoryDb.customers.find((c) => c.id === id);
    if (cust) {
      if (name) cust.name = name;
      if (phone) cust.phone = phone;
      cust.updated_at = new Date().toISOString();
      return { affectedRows: 1 };
    }
  }

  // Customer addresses insert
  if (normalized.startsWith("insert into customer_addresses")) {
    const addr = {
      id: params[0],
      customer_id: params[1],
      address_line1: params[2],
      city: params[3] || "Chennai",
      state: params[4] || "Tamil Nadu",
      postal_code: params[5] || "600053",
      country: params[6] || "India",
      created_at: new Date().toISOString(),
    };
    memoryDb.customer_addresses.push(addr);
    return { insertId: addr.id, affectedRows: 1 };
  }

  return { affectedRows: 0 };
}

export let db: DatabaseAdapter;

// Lazy initialization wrapper
export async function getDb(): Promise<DatabaseAdapter> {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}
