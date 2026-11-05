const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function runCheck() {
  console.log("==========================================");
  console.log("Padma Fabrics - Database Diagnostic Check");
  console.log("==========================================");
  console.log("Timestamp:", new Date().toISOString());

  const host = process.env.DB_HOST || process.env.TIDB_HOST;
  const port = Number(process.env.DB_PORT || process.env.TIDB_PORT) || 4000;
  const user = process.env.DB_USER || process.env.TIDB_USER;
  const password = process.env.DB_PASSWORD || process.env.TIDB_PASSWORD;
  const database = process.env.DB_NAME || process.env.TIDB_DATABASE || "padmanabha";

  console.log(`Target: ${host}:${port}`);
  console.log(`Database: ${database}`);
  console.log(`User: ${user}`);

  const startTime = Date.now();
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      connectTimeout: 8000,
    });
    console.log(`[PASS] 1. Connection established successfully in ${Date.now() - startTime}ms.`);
  } catch (err) {
    console.error(`[FAIL] 1. Connection failed: ${err.message} (${err.code})`);
    process.exit(1);
  }

  try {
    const [ping] = await connection.query("SELECT 1 AS ping");
    console.log("[PASS] 2. Database ping query executed:", ping);

    const [countRows] = await connection.query("SELECT COUNT(*) AS total_products FROM products");
    const total = countRows[0]?.total_products;
    console.log(`[PASS] 3. Product count query executed. Total products found: ${total}`);

    const [products] = await connection.query(
      "SELECT id, sku, name, category_id, price, stock_quantity, is_active FROM products ORDER BY created_at DESC"
    );
    console.log("\n--- Product Records in TiDB Database ---");
    console.table(products);

    const [categories] = await connection.query("SELECT id, name, slug FROM categories ORDER BY display_order ASC");
    console.log("\n--- Categories in TiDB Database ---");
    console.table(categories);

  } catch (err) {
    console.error("[FAIL] Query execution error:", err.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\nConnection closed cleanly. No database records modified.");
    }
    console.log("==========================================");
  }
}

runCheck().catch((err) => {
  console.error("Diagnostic script error:", err);
  process.exit(1);
});

