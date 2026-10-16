import { Request, Response } from "express";
import { getDb } from "../config/db";

export async function getInventory(req: Request, res: Response) {
  try {
    const db = await getDb();
    const products = await db.query("SELECT * FROM products ORDER BY name ASC");

    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const inventory = products.map((p) => {
      const stock = Number(p.stock_quantity);
      totalUnits += stock;
      if (stock === 0) outOfStockCount++;
      else if (stock < (p.low_stock_threshold || 5)) lowStockCount++;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category_id,
        stock,
        unit: p.unit || "piece",
        threshold: p.low_stock_threshold || 5,
        status:
          stock === 0
            ? "Out of Stock"
            : stock < (p.low_stock_threshold || 5)
              ? "Low Stock"
              : "In Stock",
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalUnits,
        lowStockCount,
        outOfStockCount,
        totalProducts: products.length,
      },
      inventory,
    });
  } catch (err: any) {
    console.error("[InventoryController] getInventory error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve inventory." });
  }
}

export async function adjustStock(req: Request, res: Response) {
  try {
    const { productId, new_stock, reason } = req.body;

    if (!productId || new_stock === undefined) {
      return res.status(400).json({
        success: false,
        error: "Product ID and new stock quantity are required.",
      });
    }

    const stockNumber = Number(new_stock);
    if (isNaN(stockNumber) || stockNumber < 0) {
      return res.status(400).json({
        success: false,
        error: "New stock quantity must be a non-negative number.",
      });
    }

    const db = await getDb();
    const rows = await db.query("SELECT * FROM products WHERE id = ?", [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    const product = rows[0];
    const previousStock = product.stock_quantity;
    const diff = stockNumber - previousStock;

    await db.execute("UPDATE products SET stock_quantity = ? WHERE id = ?", [
      stockNumber,
      productId,
    ]);

    const logId = `LOG-${Date.now().toString(36)}`;
    await db.execute(
      `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [logId, productId, previousStock, stockNumber, diff, reason || "Manual inventory adjustment"],
    );

    return res.status(200).json({
      success: true,
      message: `Stock for '${product.name}' adjusted to ${stockNumber} ${product.unit}s.`,
      stock: stockNumber,
    });
  } catch (err: any) {
    console.error("[InventoryController] adjustStock error:", err);
    return res.status(500).json({ success: false, error: "Failed to adjust product stock." });
  }
}

export async function getInventoryLogs(req: Request, res: Response) {
  try {
    const db = await getDb();
    const logs = await db.query("SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 50");

    const formatted = await Promise.all(
      logs.map(async (l) => {
        const prod = await db.query("SELECT name FROM products WHERE id = ?", [l.product_id]);
        return {
          id: l.id,
          productId: l.product_id,
          productName: prod[0]?.name || l.product_id,
          previousStock: l.previous_stock,
          newStock: l.new_stock,
          change: l.change_amount,
          reason: l.reason,
          date: l.created_at ? l.created_at.split("T")[0] || l.created_at.split(" ")[0] : "",
        };
      }),
    );

    return res.status(200).json({ success: true, count: formatted.length, logs: formatted });
  } catch (err: any) {
    console.error("[InventoryController] getInventoryLogs error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch inventory movement logs." });
  }
}
