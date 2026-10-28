import dotenv from "dotenv";
dotenv.config();

import { getDb } from "./config/db";
import fs from "fs";
import path from "path";

async function purgeLegacyProducts() {
  console.log("Purging all legacy products from database...");
  try {
    const db = await getDb();
    console.log("Database Mode:", db.isMySQL ? "Connected to TiDB (MySQL Cloud)" : "In-Memory / File Engine");

    // Clean dependent tables first
    await db.execute("DELETE FROM product_images").catch((err) => console.warn("product_images notice:", err.message));
    await db.execute("DELETE FROM inventory_logs").catch((err) => console.warn("inventory_logs notice:", err.message));
    await db.execute("DELETE FROM cart_items").catch((err) => console.warn("cart_items notice:", err.message));
    await db.execute("DELETE FROM order_items").catch((err) => console.warn("order_items notice:", err.message));
    await db.execute("DELETE FROM products").catch((err) => console.warn("products notice:", err.message));

    // Clear server/data/products.json
    const productsFile = path.resolve(process.cwd(), "server/data/products.json");
    fs.writeFileSync(productsFile, "[]", "utf-8");
    console.log("server/data/products.json reset to [].");

    const countResult = await db.query<any>("SELECT COUNT(*) AS total FROM products");
    console.log("Products in database after purge:", countResult[0]?.total ?? 0);
  } catch (error) {
    console.error("Error purging legacy products:", error);
  }
  process.exit(0);
}

purgeLegacyProducts();
