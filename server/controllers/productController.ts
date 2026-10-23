import { Request, Response } from "express";
import { getDb } from "../config/db";

const CATEGORY_ID_TO_NAME: Record<string, string> = {
  "saree": "Saree",
  "chudithar": "Chudithar",
  "coordset": "Coordset",
  "maxi": "Maxi",
  "nighty": "Nighty",
  "chudithar-top": "Chudithar Top",
  "2piece": "2piece",
  "combo-dresses": "Combo Dresses",
  // Aliases for backward compatibility
  "sarees": "Saree",
  "fabrics": "Coordset",
  "shirts": "Chudithar Top",
  "t-shirts": "2piece",
  "womens-dresses": "Chudithar",
  "kids-wear": "Combo Dresses",
};

const CATEGORY_NAME_TO_ID: Record<string, string> = {
  "Saree": "saree",
  "Chudithar": "chudithar",
  "Coordset": "coordset",
  "Maxi": "maxi",
  "Nighty": "nighty",
  "Chudithar Top": "chudithar-top",
  "2piece": "2piece",
  "Combo Dresses": "combo-dresses",
  // Aliases for backward compatibility
  "Sarees": "saree",
  "Fabrics": "coordset",
  "Shirts": "chudithar-top",
  "T-Shirts": "2piece",
  "Women's Dresses": "chudithar",
  "Kids Wear": "combo-dresses",
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
      updatedAt: p.updated_at || p.created_at || "2026-10-10T00:00:00.000Z",
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

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description = "" } = req.body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, error: "Category name is required." });
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = slug || `cat-${Date.now().toString(36)}`;
    const db = await getDb();

    // Register in in-memory mapping
    CATEGORY_ID_TO_NAME[id] = trimmedName;
    CATEGORY_NAME_TO_ID[trimmedName] = id;

    // Check if category already exists
    const existing = await db.query(
      "SELECT * FROM categories WHERE id = ? OR LOWER(name) = LOWER(?)",
      [id, trimmedName],
    );
    if (existing && existing.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Category already exists.",
        category: existing[0],
      });
    }

    const countRes = await db.query("SELECT count(*) as count FROM categories");
    const nextOrder = Number(countRes[0]?.count || 0) + 1;

    await db.execute(
      "INSERT INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)",
      [id, trimmedName, slug, description, nextOrder],
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: {
        id,
        name: trimmedName,
        slug,
        description,
        display_order: nextOrder,
      },
    });
  } catch (err: any) {
    console.error("[ProductController] createCategory error:", err);
    return res.status(500).json({ success: false, error: "Failed to create product category." });
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

    if (!name || price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        error: "Product name and price are required fields.",
      });
    }

    const db = await getDb();
    const id = customId || `pf-${Date.now().toString(36)}`;
    const productSku = sku || `PF-${Math.floor(100 + Math.random() * 900)}`;
    let productSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingSlug = await db.query("SELECT id FROM products WHERE slug = ?", [productSlug]);
    if (existingSlug && existingSlug.length > 0) {
      productSlug = `${productSlug}-${Date.now().toString(36)}`;
    }
    const rawCat = categoryId || category || "sarees";
    const finalCategory = CATEGORY_NAME_TO_ID[rawCat] || rawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const finalImage = image_url || image || "/assets/burgundy-silk.jpg";
    const sizesJson = JSON.stringify(sizes);

    // Ensure category exists in categories table to satisfy FOREIGN KEY constraint
    const catCheck = await db.query("SELECT id FROM categories WHERE id = ?", [finalCategory]);
    if (!catCheck || catCheck.length === 0) {
      const catName = rawCat;
      await db.execute(
        "INSERT IGNORE INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)",
        [finalCategory, catName, finalCategory, `${catName} collection`, 99],
      ).catch(() => {});
    }

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
      sizes: Array.isArray(sizes) ? sizes : (typeof sizes === "string" ? JSON.parse(sizes || "[]") : []),
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
      original_price,
      originalPrice,
      unit,
      stock,
      stock_quantity,
      stockQuantity,
      badge,
      description,
      image,
      image_url,
      imageUrl,
      is_active,
      status,
      sizes,
      sku,
    } = req.body;

    const db = await getDb();
    const rows = await db.query("SELECT * FROM products WHERE id = ? OR slug = ?", [id, id]);

    const newStock =
      stock !== undefined
        ? Number(stock)
        : stock_quantity !== undefined
          ? Number(stock_quantity)
          : stockQuantity !== undefined
            ? Number(stockQuantity)
            : rows[0]?.stock_quantity ?? 10;

    const finalImage = image_url || image || imageUrl || rows[0]?.image_url || "/assets/burgundy-silk.jpg";
    const rawCat = categoryId || category || rows[0]?.category_id || "sarees";
    const finalCategory =
      CATEGORY_NAME_TO_ID[rawCat] || rawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const activeVal =
      is_active !== undefined
        ? is_active ? 1 : 0
        : status !== undefined
          ? status === "active" ? 1 : 0
          : rows[0]?.is_active ?? 1;

    if (rows.length === 0) {
      // Upsert: product does not yet exist in the DB, create it!
      const productSku = sku || `PF-${Math.floor(100 + Math.random() * 900)}`;
      const productSlug = (name || id)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await db.execute(
        `INSERT INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          productSku,
          name || "Product",
          productSlug,
          finalCategory,
          colour || "Custom",
          price !== undefined ? Number(price) : 0,
          original_price || originalPrice ? Number(original_price || originalPrice) : null,
          unit || "piece",
          newStock,
          5,
          badge || "New arrival",
          description || "",
          finalImage,
          activeVal,
          0,
          JSON.stringify(sizes || []),
        ],
      );
    } else {
      const previous = rows[0];
      const sizesToSave =
        sizes !== undefined
          ? JSON.stringify(sizes)
          : previous.sizes
            ? typeof previous.sizes === "string"
              ? previous.sizes
              : JSON.stringify(previous.sizes)
            : JSON.stringify([]);

      await db.execute(
        `UPDATE products SET name = ?, category_id = ?, colour = ?, price = ?, unit = ?, stock_quantity = ?, badge = ?, description = ?, image_url = ?, is_active = ?, sizes = ? WHERE id = ?`,
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
          activeVal,
          sizesToSave,
          previous.id,
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
            previous.id,
            previous.stock_quantity,
            newStock,
            diff,
            "Manual product update",
          ],
        ).catch(() => {});
      }
    }

    const resolvedSizes =
      sizes !== undefined
        ? Array.isArray(sizes)
          ? sizes
          : JSON.parse(sizes || "[]")
        : typeof rows[0]?.sizes === "string"
          ? JSON.parse(rows[0].sizes || "[]")
          : rows[0]?.sizes || [];

    const updatedProduct = {
      id,
      name: name || rows[0]?.name,
      category: CATEGORY_ID_TO_NAME[finalCategory] || finalCategory,
      categoryId: finalCategory,
      colour: colour || rows[0]?.colour || "Custom",
      price: price !== undefined ? Number(price) : rows[0]?.price,
      unit: unit || rows[0]?.unit || "piece",
      stock: newStock,
      stockQuantity: newStock,
      badge: badge !== undefined ? badge : rows[0]?.badge,
      description: description !== undefined ? description : rows[0]?.description,
      image: finalImage,
      imageUrl: finalImage,
      isActive: Boolean(activeVal),
      status: activeVal ? "active" : "inactive",
      sizes: resolvedSizes,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
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

export const DEFAULT_PRODUCT_IDS = [
  "wine-silk",
  "heritage-silk",
  "sage-cotton",
  "ivory-brocade",
  "linen-shirt",
  "navy-tee",
  "maroon-anarkali",
  "pattu-pavadai",
  "pf-mvi2hcnc",
  "pf-mvi2jlu8",
];

export async function removeDefaultProducts(req: Request, res: Response) {
  try {
    const db = await getDb();
    const placeholders = DEFAULT_PRODUCT_IDS.map(() => "?").join(",");

    // Remove foreign references in order items or inventory logs
    await db.execute(
      `DELETE FROM inventory_logs WHERE product_id IN (${placeholders})`,
      DEFAULT_PRODUCT_IDS,
    ).catch(() => {});

    await db.execute(
      `DELETE FROM product_images WHERE product_id IN (${placeholders})`,
      DEFAULT_PRODUCT_IDS,
    ).catch(() => {});

    await db.execute(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      DEFAULT_PRODUCT_IDS,
    );

    const countRes = await db.query("SELECT COUNT(*) as count FROM products");
    return res.status(200).json({
      success: true,
      message: "Default sample products removed from database successfully.",
      remainingProductsCount: countRes[0]?.count || 0,
    });
  } catch (err: any) {
    console.error("[ProductController] removeDefaultProducts error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to remove default products: " + err.message,
    });
  }
}

export async function bulkSyncProducts(req: Request, res: Response) {
  try {
    const { products, clearDefaults = true } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: "An array of products is required for bulk sync.",
      });
    }

    const db = await getDb();

    // Optionally remove default products first if requested
    if (clearDefaults) {
      const placeholders = DEFAULT_PRODUCT_IDS.map(() => "?").join(",");
      await db.execute(
        `DELETE FROM inventory_logs WHERE product_id IN (${placeholders})`,
        DEFAULT_PRODUCT_IDS,
      ).catch(() => {});
      await db.execute(
        `DELETE FROM product_images WHERE product_id IN (${placeholders})`,
        DEFAULT_PRODUCT_IDS,
      ).catch(() => {});
      await db.execute(
        `DELETE FROM products WHERE id IN (${placeholders})`,
        DEFAULT_PRODUCT_IDS,
      ).catch(() => {});
    }

    let syncedCount = 0;

    for (const p of products) {
      if (!p.name) continue;

      const rawCat = p.category || p.categoryId || "Saree";
      const catSlug =
        CATEGORY_NAME_TO_ID[rawCat] ||
        rawCat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") ||
        "saree";

      // Ensure category exists in categories table to satisfy FOREIGN KEY
      const catCheck = await db.query("SELECT id FROM categories WHERE id = ?", [catSlug]);
      if (!catCheck || catCheck.length === 0) {
        const catName = rawCat;
        await db.execute(
          "INSERT IGNORE INTO categories (id, name, slug, description, display_order) VALUES (?, ?, ?, ?, ?)",
          [catSlug, catName, catSlug, `${catName} collection`, 99],
        ).catch(() => {});
      }

      const id = p.id || `pf-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const sku = p.sku || `PF-${Math.floor(100 + Math.random() * 900)}`;
      const slug =
        (p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) +
        `-${id.slice(-6)}`;
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

      // Check if product with this ID or SKU exists
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
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ).catch(async (insertErr: any) => {
          // If duplicate SKU error, append random suffix and retry
          if (insertErr.code === "ER_DUP_ENTRY") {
            const fallbackSku = `${sku}-${Math.floor(Math.random() * 1000)}`;
            await db.execute(
              `INSERT INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                id,
                fallbackSku,
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
            );
          } else {
            throw insertErr;
          }
        });
      }

      syncedCount++;
    }

    const totalCountRes = await db.query("SELECT COUNT(*) as count FROM products");
    const totalInDb = totalCountRes[0]?.count || 0;

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${syncedCount} products to TiDB Cloud database!`,
      syncedCount,
      totalInDatabase: totalInDb,
    });
  } catch (err: any) {
    console.error("[ProductController] bulkSyncProducts error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to bulk sync products: " + err.message,
    });
  }
}

