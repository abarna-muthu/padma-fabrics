import fs from "fs";
import path from "path";
import os from "os";
import { getDb } from "./config/db";
import { DEFAULT_PRODUCT_IDS } from "./controllers/productController";

async function main() {
  console.log("====================================================");
  console.log(" Importing Products from Downloads to TiDB Cloud...");
  console.log("====================================================");

  const filePath = path.join(os.homedir(), "Downloads", "my_41_products.json");
  if (!fs.existsSync(filePath)) {
    console.error("File not found at:", filePath);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const products: any[] = JSON.parse(raw);
  console.log(`Loaded ${products.length} products from ${filePath}!`);

  const db = await getDb();
  console.log("Database Mode:", db.isMySQL ? "Connected to TiDB (MySQL Cloud)" : "In-Memory Engine");

  if (!db.isMySQL) {
    console.error("Error: Not connected to MySQL/TiDB. Check DB_HOST in .env");
    process.exit(1);
  }

  // 1. Delete default demo products
  console.log("\n1. Removing default 10 demo sample products from TiDB...");
  const placeholders = DEFAULT_PRODUCT_IDS.map(() => "?").join(",");
  await db.execute(`DELETE FROM inventory_logs WHERE product_id IN (${placeholders})`, DEFAULT_PRODUCT_IDS).catch(() => {});
  await db.execute(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, DEFAULT_PRODUCT_IDS).catch(() => {});
  await db.execute(`DELETE FROM products WHERE id IN (${placeholders})`, DEFAULT_PRODUCT_IDS).catch(() => {});
  console.log("   Default demo products removed successfully.");

  // 2. Insert all products
  console.log(`\n2. Inserting ${products.length} user products into TiDB Cloud...`);
  let successCount = 0;

  for (const p of products) {
    if (!p.name) continue;

    const rawCat = p.category || p.categoryId || "Saree";
    const catSlug = rawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "saree";

    // Ensure category exists
    await db.execute(
      "INSERT IGNORE INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)",
      [catSlug, rawCat, catSlug, `${rawCat} collection`, 99],
    ).catch(() => {});

    const id = p.id || `pf-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const sku = p.sku || `PF-${Math.floor(100 + Math.random() * 900)}`;
    let slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) slug = `prod-${id}`;

    const price = Number(p.price) || 0;
    const originalPrice = p.original_price ? Number(p.original_price) : null;
    const unit = p.unit || "piece";
    const stock = Number(p.stock !== undefined ? p.stock : p.stock_quantity) || 0;
    const badge = p.badge || "New arrival";
    const description = p.description || "";
    const image = p.image || p.image_url || "/assets/burgundy-silk.jpg";
    const isActive = p.status === "inactive" || p.isActive === false ? 0 : 1;
    const isFeatured = p.is_featured || p.isFeatured ? 1 : 0;
    const sizesJson = JSON.stringify(
      Array.isArray(p.sizes) ? p.sizes : typeof p.sizes === "string" ? JSON.parse(p.sizes) : [],
    );
    const colour = p.colour || "Custom";

    // Check if product exists
    const existing = await db.query("SELECT id FROM products WHERE id = ?", [id]);
    if (existing && existing.length > 0) {
      await db.execute(
        `UPDATE products SET 
          name = ?, category_id = ?, colour = ?, price = ?, original_price = ?,
          unit = ?, stock_quantity = ?, badge = ?, description = ?, image_url = ?,
          is_active = ?, is_featured = ?, sizes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          p.name,
          catSlug,
          colour,
          price,
          originalPrice,
          unit,
          stock,
          badge,
          description,
          image,
          isActive,
          isFeatured,
          sizesJson,
          id,
        ],
      );
    } else {
      await db.execute(
        `INSERT INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          name = VALUES(name), price = VALUES(price), stock_quantity = VALUES(stock_quantity), image_url = VALUES(image_url)`,
        [
          id,
          sku,
          p.name,
          slug,
          catSlug,
          colour,
          price,
          originalPrice,
          unit,
          stock,
          5,
          badge,
          description,
          image,
          isActive,
          isFeatured,
          sizesJson,
        ],
      ).catch(async (err: any) => {
        // If duplicate slug or sku, append id suffix
        const fallbackSlug = `${slug}-${id.slice(-6)}`;
        const fallbackSku = `${sku}-${Math.floor(Math.random() * 900)}`;
        await db.execute(
          `INSERT INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price)`,
          [
            id,
            fallbackSku,
            p.name,
            fallbackSlug,
            catSlug,
            colour,
            price,
            originalPrice,
            unit,
            stock,
            5,
            badge,
            description,
            image,
            isActive,
            isFeatured,
            sizesJson,
          ],
        );
      });
    }

    successCount++;
  }

  console.log(`\nSuccessfully processed ${successCount} products into TiDB Cloud!`);

  // Final verification
  const countRes = await db.query<any>("SELECT COUNT(*) as total FROM products");
  console.log("====================================================");
  console.log(`✅ FINAL TOTAL PRODUCTS IN TIDB CLOUD: ${countRes[0]?.total}`);
  console.log("====================================================");

  const sample = await db.query<any>(
    "SELECT id, sku, name, category_id, price, stock_quantity FROM products LIMIT 10"
  );
  console.log("\nSample Products now stored in TiDB Cloud:");
  console.table(sample);

  process.exit(0);
}

main();
