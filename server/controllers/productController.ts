import { Request, Response } from "express";
import { getDb } from "../config/db";

const CATEGORY_ID_TO_NAME: Record<string, string> = {
  "sarees": "Sarees",
  "fabrics": "Fabrics",
  "shirts": "Shirts",
  "t-shirts": "T-Shirts",
  "womens-dresses": "Women's Dresses",
  "kids-wear": "Kids Wear",
};

const CATEGORY_NAME_TO_ID: Record<string, string> = {
  "Sarees": "sarees",
  "Fabrics": "fabrics",
  "Shirts": "shirts",
  "T-Shirts": "t-shirts",
  "Women's Dresses": "womens-dresses",
  "Kids Wear": "kids-wear",
};

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, search, featured, active_only = "true" } = req.query;
    const db = await getDb();

    let sql = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];

    if (active_only === "true") {
      sql += " AND is_active = 1";
    }

    if (featured === "true") {
      sql += " AND is_featured = 1";
    }

    if (category && category !== "All") {
      const catSlug = CATEGORY_NAME_TO_ID[category as string] || (category as string).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      sql += " AND category_id = ?";
      params.push(catSlug);
    }

    let products = await db.query(sql, params);

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.colour.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)),
      );
    }

    // Format products for frontend consumption
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      category: CATEGORY_ID_TO_NAME[p.category_id] || p.category_id,
      categoryId: p.category_id,
      colour: p.colour,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      unit: p.unit || "piece",
      stock: Number(p.stock_quantity),
      stockQuantity: Number(p.stock_quantity),
      lowStockThreshold: Number(p.low_stock_threshold),
      badge: p.badge || "",
      description: p.description || "",
      image: p.image_url,
      imageUrl: p.image_url,
      isActive: Boolean(p.is_active),
      status: p.is_active ? "active" : "inactive",
      isFeatured: Boolean(p.is_featured),
      sizes: typeof p.sizes === "string" ? JSON.parse(p.sizes || "[]") : p.sizes || [],
      createdAt: p.created_at,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      products: formatted,
    });
  } catch (err: any) {
    console.error("[ProductController] getProducts error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch products." });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const rows = await db.query("SELECT * FROM products WHERE id = ? OR slug = ?", [id, id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    const p = rows[0];
    const product = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      category: p.category_id,
      colour: p.colour,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      unit: p.unit || "piece",
      stock: Number(p.stock_quantity),
      badge: p.badge || "",
      description: p.description || "",
      image: p.image_url,
      isActive: Boolean(p.is_active),
      status: p.is_active ? "active" : "inactive",
      isFeatured: Boolean(p.is_featured),
      sizes: typeof p.sizes === "string" ? JSON.parse(p.sizes || "[]") : p.sizes || [],
    };

    return res.status(200).json({ success: true, product });
  } catch (err: any) {
    console.error("[ProductController] getProductById error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve product details." });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const db = await getDb();
    const categories = await db.query("SELECT * FROM categories ORDER BY display_order ASC");
    return res.status(200).json({ success: true, categories });
  } catch (err: any) {
    console.error("[ProductController] getCategories error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch product categories." });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const {
      id: customId,
      name,
      category,
      categoryId,
      colour,
      price,
      original_price,
      unit = "piece",
      stock = 0,
      badge = "New arrival",
      description = "",
      image_url,
      image,
      sku,
      is_featured = 0,
      sizes = [],
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: "Product name and price are required fields.",
      });
    }

    const db = await getDb();
    const id = customId || `pf-${Date.now().toString(36)}`;
    const productSku = sku || `PF-${Math.floor(100 + Math.random() * 900)}`;
    const productSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const rawCat = categoryId || category || "sarees";
    const finalCategory = CATEGORY_NAME_TO_ID[rawCat] || rawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const finalImage = image_url || image || "/assets/burgundy-silk.jpg";
    const sizesJson = JSON.stringify(sizes);

    await db.execute(
      `INSERT INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        productSku,
        name,
        productSlug,
        finalCategory,
        colour || "Custom",
        Number(price),
        original_price ? Number(original_price) : null,
        unit,
        Number(stock) || 0,
        5,
        badge,
        description,
        finalImage,
        1,
        is_featured ? 1 : 0,
        sizesJson,
      ],
    );

    // Record inventory log
    if (Number(stock) > 0) {
      await db.execute(
        `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `LOG-${Date.now().toString(36)}`,
          id,
          0,
          Number(stock),
          Number(stock),
          "Initial product catalog creation",
        ],
      );
    }

    const createdProduct = {
      id,
      sku: productSku,
      name,
      slug: productSlug,
      category: CATEGORY_ID_TO_NAME[finalCategory] || finalCategory,
      categoryId: finalCategory,
      colour: colour || "Custom",
      price: Number(price),
      unit,
      stock: Number(stock) || 0,
      badge,
      description,
      image: finalImage,
      isActive: true,
      status: "active",
    };

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: createdProduct,
    });
  } catch (err: any) {
    console.error("[ProductController] createProduct error:", err);
    return res.status(500).json({ success: false, error: "Failed to create product in catalog." });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      categoryId,
      colour,
      price,
      unit,
      stock,
      badge,
      description,
      image,
      image_url,
      is_active,
    } = req.body;

    const db = await getDb();
    const rows = await db.query("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    const previous = rows[0];
    const newStock = stock !== undefined ? Number(stock) : previous.stock_quantity;
    const finalImage = image_url || image || previous.image_url;
    const rawCat = categoryId || category || previous.category_id;
    const finalCategory = CATEGORY_NAME_TO_ID[rawCat] || rawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    await db.execute(
      `UPDATE products SET name = ?, category_id = ?, colour = ?, price = ?, unit = ?, stock_quantity = ?, badge = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?`,
      [
        name || previous.name,
        finalCategory,
        colour || previous.colour,
        price !== undefined ? Number(price) : previous.price,
        unit || previous.unit,
        newStock,
        badge !== undefined ? badge : previous.badge,
        description !== undefined ? description : previous.description,
        finalImage,
        is_active !== undefined ? (is_active ? 1 : 0) : previous.is_active,
        id,
      ],
    );

    // If stock changed, record log
    if (newStock !== previous.stock_quantity) {
      const diff = newStock - previous.stock_quantity;
      await db.execute(
        `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `LOG-${Date.now().toString(36)}`,
          id,
          previous.stock_quantity,
          newStock,
          diff,
          "Manual product update",
        ],
      );
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
    });
  } catch (err: any) {
    console.error("[ProductController] updateProduct error:", err);
    return res.status(500).json({ success: false, error: "Failed to update product details." });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Check if product belongs to any historical order
    const orderItems = await db.query("SELECT id FROM order_items WHERE product_id = ?", [id]);

    if (orderItems.length > 0) {
      // Deactivate/archive instead of destroying order history
      await db.execute("UPDATE products SET is_active = 0 WHERE id = ?", [id]);
      return res.status(200).json({
        success: true,
        message:
          "Product is associated with existing customer orders. It has been archived and removed from the active store to preserve order records.",
      });
    }

    await db.execute("DELETE FROM inventory_logs WHERE product_id = ?", [id]).catch(() => {});
    await db.execute("DELETE FROM product_images WHERE product_id = ?", [id]).catch(() => {});
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return res.status(200).json({
      success: true,
      message: "Product deleted from catalog successfully.",
    });
  } catch (err: any) {
    console.error("[ProductController] deleteProduct error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete product." });
  }
}

export async function toggleProductStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const rows = await db.query("SELECT is_active FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    const currentStatus = Boolean(rows[0].is_active);
    const newStatus = currentStatus ? 0 : 1;

    await db.execute("UPDATE products SET is_active = ? WHERE id = ?", [newStatus, id]);

    return res.status(200).json({
      success: true,
      status: newStatus === 1 ? "active" : "inactive",
      message: `Product is now ${newStatus === 1 ? "active" : "inactive"}.`,
    });
  } catch (err: any) {
    console.error("[ProductController] toggleProductStatus error:", err);
    return res.status(500).json({ success: false, error: "Failed to toggle product status." });
  }
}
