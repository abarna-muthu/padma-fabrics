import { getDb } from "./config/db";

async function main() {
  console.log("Checking TiDB connection...");
  try {
    const db = await getDb();
    console.log("Database Mode: ", db.isMySQL ? "Connected to TiDB (MySQL Cloud)" : "In-Memory Fallback");

    const countResult = await db.query<any>("SELECT COUNT(*) AS total FROM products");
    console.log("Total Products in 'products' table:", countResult[0]?.total ?? countResult);

    const products = await db.query<any>(
      "SELECT id, sku, name, category_id, price, image_url, description, sizes FROM products"
    );
    console.log("\nProducts in database:");
    for (const p of products) {
      console.log(`- [${p.id}] ${p.name} | Cat: ${p.category_id} | Image: ${p.image_url ? p.image_url.slice(0, 60) : "NULL"} | Desc: ${p.description ? p.description.slice(0, 50) : "EMPTY"} | Sizes: ${p.sizes}`);
    }

    const categoriesCount = await db.query<any>("SELECT COUNT(*) AS total FROM categories");
    console.log("\nTotal Categories:", categoriesCount[0]?.total ?? categoriesCount);
  } catch (error) {
    console.error("Error querying database:", error);
  }
  process.exit(0);
}

main();
