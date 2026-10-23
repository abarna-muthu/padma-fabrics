import { getDb } from "./config/db";

async function main() {
  console.log("Checking TiDB connection...");
  try {
    const db = await getDb();
    console.log("Database Mode: ", db.isMySQL ? "Connected to TiDB (MySQL Cloud)" : "In-Memory Fallback");

    const countResult = await db.query<any>("SELECT COUNT(*) AS total FROM products");
    console.log("Total Products in 'products' table:", countResult[0]?.total ?? countResult);

    const products = await db.query<any>(
      "SELECT id, sku, name, category_id, price, stock_quantity, is_active FROM products LIMIT 10"
    );
    console.log("\nSample Products from database:");
    console.table(products);

    const categoriesCount = await db.query<any>("SELECT COUNT(*) AS total FROM categories");
    console.log("\nTotal Categories:", categoriesCount[0]?.total ?? categoriesCount);
  } catch (error) {
    console.error("Error querying database:", error);
  }
  process.exit(0);
}

main();
