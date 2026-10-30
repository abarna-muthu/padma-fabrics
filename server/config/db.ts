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
  getConnection(): Promise<mysql.PoolConnection | null>;
  isMySQL: boolean;
}

export const INITIAL_CATEGORIES = [
  {
    id: "saree",
    name: "Saree",
    slug: "saree",
    description: "Silk & handloom drapes",
    display_order: 1,
  },
  {
    id: "chudithar",
    name: "Chudithar",
    slug: "chudithar",
    description: "Elegant ethnic suits",
    display_order: 2,
  },
  {
    id: "coordset",
    name: "Coordset",
    slug: "coordset",
    description: "Modern stylish coordinates",
    display_order: 3,
  },
  {
    id: "maxi",
    name: "Maxi",
    slug: "maxi",
    description: "Graceful flowy silhouettes",
    display_order: 4,
  },
  {
    id: "nighty",
    name: "Nighty",
    slug: "nighty",
    description: "Pure comfort & soft cotton",
    display_order: 5,
  },
  {
    id: "chudithar-top",
    name: "Chudithar Top",
    slug: "chudithar-top",
    description: "Everyday festive tunics",
    display_order: 6,
  },
  {
    id: "2piece",
    name: "2piece",
    slug: "2piece",
    description: "Chic two-piece ensembles",
    display_order: 7,
  },
  {
    id: "combo-dresses",
    name: "Combo Dresses",
    slug: "combo-dresses",
    description: "Special curated sets",
    display_order: 8,
  },
  {
    id: "western-top",
    name: "Western Top",
    slug: "western-top",
    description: "Chic contemporary western tops",
    display_order: 9,
  },
];

export const INITIAL_PRODUCTS: any[] = [];

const isServerless = process.env["VERCEL"] === "1" || process.env["AWS_LAMBDA_FUNCTION_NAME"] !== undefined;
const DATA_DIR = isServerless ? "/tmp" : path.resolve(process.cwd(), "server/data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

const DB_CAT_MIGRATION: Record<string, string> = {
  sarees: "saree",
  fabrics: "coordset",
  shirts: "chudithar-top",
  "t-shirts": "2piece",
  "womens-dresses": "chudithar",
  "kids-wear": "combo-dresses",
};

function normalizeDbProduct(p: any): any {
  if (!p) return p;
  const rawCat = p.category_id || p.categoryId || (p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "chudithar-top");
  const category_id = DB_CAT_MIGRATION[rawCat] || rawCat;
  const img = p.image_url || p.imageUrl || p.image || "";
  const is_active = p.is_active !== undefined ? (p.is_active ? 1 : 0) : (p.isActive !== false ? 1 : 0);
  const stock = Number(p.stock_quantity ?? p.stockQuantity ?? p.stock ?? 10);

  return {
    ...p,
    category_id,
    image_url: img,
    imageUrl: img,
    image: img,
    is_active,
    isActive: is_active === 1,
    stock_quantity: stock,
    description: p.description || "",
  };
}

export function loadPersistedProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeDbProduct);
      }
    }
    const fallbackSrc = path.resolve(process.cwd(), "server/data/products.json");
    if (fs.existsSync(fallbackSrc)) {
      const data = fs.readFileSync(fallbackSrc, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeDbProduct);
      }
    }
  } catch (err) {
    console.warn("[Database] Error loading persisted products:", err);
  }
  return [...INITIAL_PRODUCTS];
}

export function savePersistedProducts(prods: any[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(prods, null, 2), "utf-8");
    const srcFile = path.resolve(process.cwd(), "server/data/products.json");
    if (srcFile !== PRODUCTS_FILE) {
      try {
        fs.writeFileSync(srcFile, JSON.stringify(prods, null, 2), "utf-8");
      } catch {}
    }
  } catch (err) {
    console.warn("[Database] Error saving persisted products:", err);
  }
}

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
  site_settings: any[] = [];
  product_reviews: any[] = [];

  constructor() {
    // Seed categories and load persisted products so catalog additions are permanent
    this.categories = [...INITIAL_CATEGORIES];
    this.products = loadPersistedProducts();
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

    // Orders are kept clean with zero dummy/sample data
    // Real orders are created strictly by users during checkout

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

export function getPool(): mysql.Pool | null {
  return mysqlPool;
}

export async function initDatabase(): Promise<DatabaseAdapter> {
  let host = process.env["DB_HOST"] || process.env["TIDB_HOST"];
  let user = process.env["DB_USER"] || process.env["TIDB_USER"];
  let password = process.env["DB_PASSWORD"] || process.env["TIDB_PASSWORD"];
  let database = process.env["DB_NAME"] || process.env["TIDB_DATABASE"] || "padmanabha_fabrics";
  let port = Number(process.env["DB_PORT"] || process.env["TIDB_PORT"]) || 4000;
  let ssl =
    process.env["DB_SSL"] === "true" || process.env["TIDB_SSL"] === "true"
      ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
      : undefined;

  // Support direct connection string (e.g. copied from TiDB Cloud Connection String tab)
  const rawUrl = (process.env["DATABASE_URL"] || process.env["TIDB_URL"] || "").trim();
  const connectionUrl = rawUrl.replace(/^["']|["']$/g, "");
  if (connectionUrl) {
    try {
      const cleanUrl = connectionUrl.replace(/^mysql:\/\//, "http://");
      const parsed = new URL(cleanUrl);
      host = host || parsed.hostname;
      if (parsed.port) port = Number(parsed.port);
      if (parsed.username) user = user || decodeURIComponent(parsed.username);
      if (parsed.password) password = password || decodeURIComponent(parsed.password);
      const pathname = parsed.pathname.replace(/^\//, "");
      if (pathname) database = pathname;
      ssl = { minVersion: "TLSv1.2", rejectUnauthorized: true };
    } catch (err) {
      console.warn("[Database] Could not parse DATABASE_URL string, falling back to parameters:", err);
    }
  }

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
    async getConnection(): Promise<mysql.PoolConnection | null> {
      if (isConnectedToMySQL && mysqlPool) {
        return await mysqlPool.getConnection();
      }
      return null;
    },
    get isMySQL() {
      return isConnectedToMySQL;
    },
  };
}

async function runMigrations(pool: mysql.Pool) {
  try {
    const possibleSchemaPaths = [
      path.resolve(process.cwd(), "server/migrations/schema.sql"),
      path.resolve(process.cwd(), "migrations/schema.sql"),
    ];
    const schemaPath = possibleSchemaPaths.find((p) => fs.existsSync(p));

    if (schemaPath && fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, "utf-8");
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await pool.query(statement);
      }

      // Safely ensure image_url columns can handle larger Base64 photo uploads
      await pool.query("ALTER TABLE products MODIFY COLUMN image_url LONGTEXT").catch(() => {});
      await pool.query("ALTER TABLE product_images MODIFY COLUMN image_url LONGTEXT").catch(() => {});

      // Safely ensure variant and gallery columns exist in TiDB / MySQL
      await pool.query("ALTER TABLE products ADD COLUMN variants JSON").catch(() => {});
      await pool.query("ALTER TABLE products ADD COLUMN images JSON").catch(() => {});
      await pool.query("ALTER TABLE product_images ADD COLUMN colour VARCHAR(100)").catch(() => {});
      await pool.query("ALTER TABLE order_items ADD COLUMN colour VARCHAR(100)").catch(() => {});
      await pool.query("ALTER TABLE order_items ADD COLUMN image_url TEXT").catch(() => {});
      await pool.query("ALTER TABLE orders ADD COLUMN user_id VARCHAR(50)").catch(() => {});
      await pool.query("ALTER TABLE orders ADD COLUMN phone VARCHAR(50)").catch(() => {});
      await pool.query("ALTER TABLE orders ADD COLUMN email VARCHAR(255)").catch(() => {});
      await pool.query("ALTER TABLE orders ADD COLUMN address TEXT").catch(() => {});
      await pool.query("ALTER TABLE order_items ADD COLUMN image TEXT").catch(() => {});
      await pool.query("ALTER TABLE order_items ADD COLUMN color VARCHAR(100)").catch(() => {});
      await pool.query("ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2)").catch(() => {});
      await pool.query("ALTER TABLE cart_items ADD COLUMN colour VARCHAR(100)").catch(() => {});
      await pool.query("ALTER TABLE cart_items ADD COLUMN image_url TEXT").catch(() => {});
      await pool.query("CREATE TABLE IF NOT EXISTS site_settings (setting_key VARCHAR(50) PRIMARY KEY, setting_value LONGTEXT NOT NULL, updated_at BIGINT NOT NULL)").catch(() => {});
      await pool.query("CREATE TABLE IF NOT EXISTS product_reviews (id VARCHAR(36) PRIMARY KEY, product_id VARCHAR(50) NOT NULL, customer_name VARCHAR(150) NOT NULL, rating INT NOT NULL DEFAULT 5, comment TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_review_product (product_id))").catch(() => {});

      console.log("[Database] Schema migrations applied successfully.");

      // Check if admin user needs initial seeding
      try {
        const [adminUsers]: any = await pool.query("SELECT COUNT(*) as count FROM admin_users");
        if (adminUsers && adminUsers[0]?.count === 0) {
          console.log("[Database] Seeding initial admin user to MySQL/TiDB...");
          const hash = await bcrypt.hash(INITIAL_ADMIN_PASS, 10);
          await pool.execute(
            "INSERT INTO admin_users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)",
            ["adm-001", INITIAL_ADMIN_EMAIL, hash, "Padmanabha Administrator", "admin"],
          );
          console.log("[Database] Initial admin user seeded successfully.");
        }
      } catch (adminErr: any) {
        console.warn("[Database] Notice checking/seeding admin user:", adminErr.message);
      }

      // Ensure categories exist in MySQL / TiDB
      try {
        for (const cat of INITIAL_CATEGORIES) {
          await pool.execute(
            "INSERT IGNORE INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)",
            [cat.id, cat.name, cat.slug, cat.description, cat.display_order],
          );
        }
      } catch (catErr: any) {
        console.warn("[Database] Notice ensuring categories:", catErr.message);
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
    return memoryDb.products.filter((p) => (p.is_active === 1 || p.is_active === true) && p.is_featured) as any;
  }
  if (normalized.includes("from products") && normalized.includes("category_id =")) {
    const cat = params[params.length - 1] || params[0];
    return memoryDb.products.filter((p) => p.category_id === cat) as any;
  }
  if (normalized.includes("from products")) {
    let list = [...memoryDb.products];
    if (normalized.includes("is_active = 1")) {
      list = list.filter((p) => p.is_active === 1 || p.is_active === true || p.status === "active");
    }
    if (normalized.includes("category_id =") && params.length > 0) {
      const cat = params[params.length - 1];
      list = list.filter((p) => p.category_id === cat);
    }
    return list as any;
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

  // site_settings
  if (normalized.includes("from site_settings")) {
    if (normalized.includes("setting_key = 'site_content'") || normalized.includes("setting_key = ?")) {
      const targetKey = normalized.includes("setting_key = ?") ? params[0] : "site_content";
      const item = memoryDb.site_settings.find((s) => s.setting_key === targetKey);
      return (item ? [item] : []) as any;
    }
    return [...memoryDb.site_settings] as any;
  }

  // product_reviews
  if (normalized.includes("from product_reviews")) {
    if (normalized.includes("product_id =")) {
      const targetPid = String(params[0] || "").toLowerCase();
      return memoryDb.product_reviews
        .filter((r) => String(r.product_id).toLowerCase() === targetPid)
        .reverse() as any;
    }
    return [...memoryDb.product_reviews].reverse() as any;
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
    const newP: any = {
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
      variants: params[17] !== undefined ? (typeof params[17] === "string" ? params[17] : JSON.stringify(params[17])) : JSON.stringify([]),
      images: params[18] !== undefined ? (typeof params[18] === "string" ? params[18] : JSON.stringify(params[18])) : JSON.stringify([]),
      created_at: new Date().toISOString(),
    };
    memoryDb.products = [newP, ...memoryDb.products.filter((p) => p.id !== newP.id)];
    savePersistedProducts(memoryDb.products);
    return { insertId: newP.id, affectedRows: 1 };
  }

  // Product update
  if (normalized.startsWith("update products set is_active =")) {
    const newStatus = Number(params[0]);
    const id = String(params[1] || "");
    const prod = memoryDb.products.find((p) => p.id === id || p.slug === id);
    if (prod) {
      prod.is_active = newStatus;
      prod.status = newStatus === 1 ? "active" : "inactive";
      prod.updated_at = new Date().toISOString();
      savePersistedProducts(memoryDb.products);
      return { affectedRows: 1 };
    }
  }

  if (normalized.startsWith("update products")) {
    const id = String(params[params.length - 1] || "");
    const prod = memoryDb.products.find(
      (p) =>
        p.id === id ||
        p.id.toLowerCase() === id.toLowerCase() ||
        p.slug === id ||
        p.slug.toLowerCase() === id.toLowerCase(),
    );
    if (prod) {
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
        prod.is_active = params[9] ? 1 : 0;
        if (params.length >= 11 && params[10] !== undefined) {
          prod.sizes = typeof params[10] === "string" ? params[10] : JSON.stringify(params[10] || []);
        }
        if (params.length >= 12 && params[11] !== undefined) {
          prod.variants = typeof params[11] === "string" ? params[11] : JSON.stringify(params[11] || []);
        }
        if (params.length >= 13 && params[12] !== undefined) {
          prod.images = typeof params[12] === "string" ? params[12] : JSON.stringify(params[12] || []);
        }
        prod.updated_at = new Date().toISOString();
      }
      savePersistedProducts(memoryDb.products);
      return { affectedRows: 1 };
    } else {
      // Upsert into memory DB if not found
      if (params.length >= 10) {
        const newP: any = {
          id,
          sku: `PF-${Math.floor(100 + Math.random() * 900)}`,
          name: params[0],
          slug: (params[0] || id).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category_id: params[1],
          colour: params[2],
          price: Number(params[3]),
          unit: params[4],
          stock_quantity: Number(params[5]),
          low_stock_threshold: 5,
          badge: params[6],
          description: params[7],
          image_url: params[8],
          is_active: params[9] ? 1 : 0,
          is_featured: 0,
          sizes: params.length >= 11 && params[10] !== undefined ? (typeof params[10] === "string" ? params[10] : JSON.stringify(params[10])) : JSON.stringify([]),
          variants: params.length >= 12 && params[11] !== undefined ? (typeof params[11] === "string" ? params[11] : JSON.stringify(params[11])) : JSON.stringify([]),
          images: params.length >= 13 && params[12] !== undefined ? (typeof params[12] === "string" ? params[12] : JSON.stringify(params[12])) : JSON.stringify([params[8]]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        memoryDb.products = [newP, ...memoryDb.products.filter((p) => p.id !== newP.id)];
        savePersistedProducts(memoryDb.products);
        return { insertId: newP.id, affectedRows: 1 };
      }
    }
  }

  // Product delete
  if (normalized.startsWith("delete from products")) {
    const id = String(params[0] || "");
    const idx = memoryDb.products.findIndex(
      (p) =>
        p.id === id ||
        p.id.toLowerCase() === id.toLowerCase() ||
        p.slug === id ||
        p.slug.toLowerCase() === id.toLowerCase(),
    );
    if (idx !== -1) {
      memoryDb.products.splice(idx, 1);
      savePersistedProducts(memoryDb.products);
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
      prod.updated_at = new Date().toISOString();
      savePersistedProducts(memoryDb.products);
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
    const item: any = {
      id: params[0],
      order_id: params[1],
      product_id: params[2],
      product_name: params[3],
      product_sku: params[4],
      unit_price: Number(params[5]),
      quantity: Number(params[6]),
      unit: params[7],
      size: params[8],
      total_price: Number(params[params.length - 1]),
      created_at: new Date().toISOString(),
    };
    if (params.length >= 12) {
      item.colour = params[9];
      item.image_url = params[10];
    }
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
    const email = params[3] || id;
    const cust = memoryDb.customers.find(
      (c) => c.id === id || (c.email && c.email.toLowerCase() === String(email).toLowerCase()),
    );
    if (cust) {
      if (name) cust.name = name;
      if (phone) cust.phone = phone;
      cust.updated_at = new Date().toISOString();
      return { affectedRows: 1 };
    }
  }

  if (normalized.startsWith("delete from customers")) {
    const id = params[0];
    const initialLen = memoryDb.customers.length;
    memoryDb.customers = memoryDb.customers.filter(
      (c) => c.id !== id && c.email?.toLowerCase() !== String(id).toLowerCase(),
    );
    return { affectedRows: initialLen - memoryDb.customers.length };
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

  // Site settings insert/update
  if (normalized.startsWith("insert into site_settings")) {
    const key = params[0];
    const val = params[1];
    const updated = Number(params[2]) || Date.now();
    const existing = memoryDb.site_settings.find((s) => s.setting_key === key);
    if (existing) {
      existing.setting_value = val;
      existing.updated_at = updated;
    } else {
      memoryDb.site_settings.push({
        setting_key: key,
        setting_value: val,
        updated_at: updated,
      });
    }
    return { affectedRows: 1 };
  }

  if (normalized.startsWith("delete from site_settings")) {
    const key = params[0];
    if (key) {
      memoryDb.site_settings = memoryDb.site_settings.filter((s) => s.setting_key !== key);
    } else {
      memoryDb.site_settings = [];
    }
    return { affectedRows: 1 };
  }

  // Product reviews insert
  if (normalized.startsWith("insert into product_reviews")) {
    const rev = {
      id: params[0],
      product_id: params[1],
      customer_name: params[2],
      rating: Number(params[3]) || 5,
      comment: params[4] || "",
      created_at: new Date().toISOString(),
    };
    memoryDb.product_reviews.unshift(rev);
    return { insertId: rev.id, affectedRows: 1 };
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
