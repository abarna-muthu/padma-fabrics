import { Request, Response } from "express";
import { getDb, getPool, INITIAL_PRODUCTS } from "../config/db";

function formatDate(val: any): string {
  if (!val) return new Date().toISOString().split("T")[0]!;
  if (val instanceof Date) return val.toISOString().split("T")[0]!;
  const str = String(val);
  return str.includes("T") ? str.split("T")[0]! : str.split(" ")[0]!;
}

export async function createCheckoutOrder(req: Request, res: Response) {
  console.log("[OrderController] createCheckoutOrder initiated. Payload:", {
    customer_name: req.body.customer_name || req.body.customerName,
    customer_phone: req.body.customer_phone || req.body.customerPhone,
    customer_email: req.body.customer_email || req.body.customerEmail,
    itemsCount: req.body.items?.length,
    payment_method: req.body.payment_method || req.body.paymentMethod,
  });

  try {
    const customer_name = (req.body.customer_name || req.body.customerName || "").trim();
    const customer_email = (req.body.customer_email || req.body.customerEmail || "").trim().toLowerCase();
    const customer_phone = (req.body.customer_phone || req.body.customerPhone || "").trim();
    const shipping_address = (req.body.shipping_address || req.body.shippingAddress || "").trim();
    const payment_method = req.body.payment_method || req.body.paymentMethod || "COD";
    const items = req.body.items;
    const notes = req.body.notes || "";

    if (!customer_name || !customer_email || !customer_phone || !shipping_address) {
      return res.status(400).json({
        success: false,
        error: "Customer name, email, phone number, and delivery address are required.",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one product item is required to complete an order.",
      });
    }

    const db = await getDb();
    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    // Server-side inventory and price re-verification
    for (const item of items) {
      const rawId = String(item.id || item.productId || "").trim();
      let rows = await db.query("SELECT * FROM products WHERE id = ?", [rawId]);
      if (rows.length === 0) {
        rows = await db.query("SELECT * FROM products WHERE LOWER(id) = ? OR LOWER(slug) = ?", [
          rawId.toLowerCase(),
          rawId.toLowerCase(),
        ]);
      }
      if (rows.length === 0 && (item.name || item.productName)) {
        rows = await db.query("SELECT * FROM products WHERE LOWER(name) = ?", [
          String(item.name || item.productName).trim().toLowerCase(),
        ]);
      }

      // Fallback to INITIAL_PRODUCTS catalog definition if DB does not have the row yet
      if (rows.length === 0) {
        const catalogMatch = INITIAL_PRODUCTS.find(
          (p) =>
            p.id.toLowerCase() === rawId.toLowerCase() ||
            p.slug.toLowerCase() === rawId.toLowerCase() ||
            (p.sku && p.sku.toLowerCase() === rawId.toLowerCase()),
        );
        if (catalogMatch) {
          if (db.isMySQL) {
            await db
              .execute(
                `INSERT IGNORE INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  catalogMatch.id,
                  catalogMatch.sku,
                  catalogMatch.name,
                  catalogMatch.slug,
                  catalogMatch.category_id,
                  catalogMatch.colour,
                  catalogMatch.price,
                  catalogMatch.original_price || null,
                  catalogMatch.unit || "piece",
                  catalogMatch.stock_quantity,
                  catalogMatch.low_stock_threshold || 5,
                  catalogMatch.badge || "",
                  catalogMatch.description || "",
                  catalogMatch.image_url,
                  catalogMatch.is_active ? 1 : 0,
                  catalogMatch.is_featured ? 1 : 0,
                  catalogMatch.sizes || "[]",
                ],
              )
              .catch(() => {});
          }
          rows = [catalogMatch];
        }
      }

      // Auto-create product row in TiDB if not exists so order is never dropped
      if (rows.length === 0 && (item.name || item.productName)) {
        const autoProd = {
          id: rawId || `pf-${Date.now().toString(36)}`,
          sku: `PF-${Math.floor(100 + Math.random() * 900)}`,
          name: String(item.name || item.productName || "Product"),
          slug: String(item.name || item.productName || rawId).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          category_id: "chudithar-top",
          colour: String(item.colour || item.color || ""),
          price: Number(item.price) || 350,
          original_price: null,
          unit: "piece",
          stock_quantity: 100,
          low_stock_threshold: 5,
          badge: "",
          description: "",
          image_url: String(item.image || item.imageUrl || ""),
          is_active: 1,
          is_featured: 0,
          sizes: "[]",
        };
        if (db.isMySQL) {
          await db
            .execute(
              `INSERT IGNORE INTO products (id, sku, name, slug, category_id, colour, price, original_price, unit, stock_quantity, low_stock_threshold, badge, description, image_url, is_active, is_featured, sizes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                autoProd.id,
                autoProd.sku,
                autoProd.name,
                autoProd.slug,
                autoProd.category_id,
                autoProd.colour,
                autoProd.price,
                autoProd.original_price,
                autoProd.unit,
                autoProd.stock_quantity,
                autoProd.low_stock_threshold,
                autoProd.badge,
                autoProd.description,
                autoProd.image_url,
                autoProd.is_active,
                autoProd.is_featured,
                autoProd.sizes,
              ],
            )
            .catch(() => {});
        }
        rows = [autoProd];
      }

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: `Product with ID '${item.id || item.productId}' could not be located in catalog.`,
        });
      }

      const product = rows[0];
      const requestedQty = Math.max(1, Number(item.quantity) || 1);
      const chosenSize = String(item.size || "").trim();
      const chosenColour = String(item.colour || item.color || "").trim();
      const chosenImage = String(item.image || item.imageUrl || item.image_url || product.image_url || "");

      let unitPrice = Number(product.price) || Number(item.price) || 0;
      let parsedVariants: any[] = [];
      try {
        if (typeof product.variants === "string") parsedVariants = JSON.parse(product.variants);
        else if (Array.isArray(product.variants)) parsedVariants = product.variants;
      } catch {}

      let matchedVariant: any = null;
      if (parsedVariants.length > 0 && chosenColour) {
        matchedVariant = parsedVariants.find(
          (v: any) => v.colour && v.colour.toLowerCase() === chosenColour.toLowerCase(),
        );
        if (matchedVariant) {
          if (matchedVariant.price && !isNaN(Number(matchedVariant.price)) && Number(matchedVariant.price) > 0) {
            unitPrice = Number(matchedVariant.price);
          }
        }
      }

      const lineTotal = unitPrice * requestedQty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product,
        quantity: requestedQty,
        unitPrice,
        lineTotal,
        size: chosenSize,
        colour: chosenColour || product.colour || "",
        image: chosenImage,
        parsedVariants,
        matchedVariant,
      });
    }

    const shippingFee = 0; // Free promotional delivery
    const discountAmount = 0;
    const totalAmount = calculatedSubtotal + shippingFee - discountAmount;

    const orderId = `PF-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const orderNumber = orderId;
    const paymentStatus = payment_method.toUpperCase().includes("COD") ? "Pending" : "Paid";

    // 1. Resolve Customer ID
    let customerId = "";
    const existingCust = await db.query("SELECT * FROM customers WHERE email = ?", [customer_email]);
    if (existingCust.length > 0) {
      customerId = existingCust[0].id;
    } else {
      customerId = `cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const pool = getPool();

    // 2. Execute within a strict MySQL/TiDB TRANSACTION when pool is available
    if (pool && db.isMySQL) {
      const connection = await pool.getConnection();
      try {
        console.log(`[OrderController] Starting TiDB database transaction for order ${orderId}...`);
        await connection.beginTransaction();

        // 2a. Upsert Customer Record FIRST to satisfy FOREIGN KEY constraint on orders(customer_id)
        if (existingCust.length > 0) {
          await connection.execute(
            "UPDATE customers SET name = ?, phone = ? WHERE id = ?",
            [customer_name, customer_phone, customerId],
          );
        } else {
          await connection.execute(
            "INSERT INTO customers (id, name, email, phone) VALUES (?, ?, ?, ?)",
            [customerId, customer_name, customer_email, customer_phone],
          );
        }

        // 2b. Insert Customer Address
        if (shipping_address) {
          const addrId = `addr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          await connection.execute(
            "INSERT INTO customer_addresses (id, customer_id, address_line1, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
              addrId,
              customerId,
              shipping_address,
              "Chennai",
              "Tamil Nadu",
              "600053",
              "India",
            ],
          ).catch(() => {});
        }

        // 2c. Insert Order Record
        await connection.execute(
          `INSERT INTO orders (
            id, order_number, user_id, customer_id, customer_name,
            phone, customer_phone, email, customer_email,
            address, shipping_address, subtotal, shipping_fee, discount_amount,
            total_amount, order_status, payment_method, payment_status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            orderNumber,
            customerId,
            customerId,
            customer_name,
            customer_phone,
            customer_phone,
            customer_email,
            customer_email,
            shipping_address,
            shipping_address,
            calculatedSubtotal,
            shippingFee,
            discountAmount,
            totalAmount,
            "Pending",
            payment_method,
            paymentStatus,
            notes,
          ],
        );

        // 2d. Insert Order Items and Update Stock
        for (const vItem of validatedItems) {
          const oiId = `oi-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
          await connection.execute(
            `INSERT INTO order_items (
              id, order_id, product_id, product_name, product_sku,
              image, image_url, size, color, colour,
              quantity, price, unit_price, unit, total_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              oiId,
              orderId,
              vItem.product.id,
              vItem.product.name,
              vItem.product.sku || "",
              vItem.image || "",
              vItem.image || "",
              vItem.size || "",
              vItem.colour || "",
              vItem.colour || "",
              vItem.quantity,
              vItem.unitPrice,
              vItem.unitPrice,
              vItem.product.unit || "piece",
              vItem.lineTotal,
            ],
          );

          const currentStock = Number(vItem.product.stock_quantity) || 10;
          const newStock = Math.max(0, currentStock - vItem.quantity);
          let updatedVariantsJson = null;
          if (vItem.matchedVariant && Array.isArray(vItem.parsedVariants)) {
            vItem.matchedVariant.stock = Math.max(
              0,
              (Number(vItem.matchedVariant.stock) || currentStock) - vItem.quantity,
            );
            updatedVariantsJson = JSON.stringify(vItem.parsedVariants);
          }

          if (updatedVariantsJson) {
            await connection.execute("UPDATE products SET stock_quantity = ?, variants = ? WHERE id = ?", [
              newStock,
              updatedVariantsJson,
              vItem.product.id,
            ]);
          } else {
            await connection.execute("UPDATE products SET stock_quantity = ? WHERE id = ?", [
              newStock,
              vItem.product.id,
            ]);
          }

          const logId = `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
          await connection.execute(
            `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              logId,
              vItem.product.id,
              currentStock,
              newStock,
              -vItem.quantity,
              `Order ${orderNumber} customer fulfillment deduction`,
            ],
          );
        }

        // Commit transaction
        await connection.commit();
        console.log(`[OrderController] Transaction COMMITTED successfully for order ${orderId} in TiDB!`);
      } catch (txErr: any) {
        console.error(`[OrderController] Transaction FAILED for order ${orderId}. Rolling back...`, txErr);
        await connection.rollback();
        throw txErr;
      } finally {
        connection.release();
      }
    } else {
      // Memory fallback for standalone development
      console.log(`[OrderController] Saving order ${orderId} in memory store...`);
      await db.execute(
        `INSERT INTO orders (id, order_number, customer_id, customer_name, customer_email, customer_phone, shipping_address, subtotal, shipping_fee, discount_amount, total_amount, order_status, payment_method, payment_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          orderNumber,
          customerId,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          calculatedSubtotal,
          shippingFee,
          discountAmount,
          totalAmount,
          "Pending",
          payment_method,
          paymentStatus,
          notes,
        ],
      );

      for (const vItem of validatedItems) {
        const oiId = `oi-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        await db.execute(
          `INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, unit_price, quantity, unit, size, colour, image_url, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            oiId,
            orderId,
            vItem.product.id,
            vItem.product.name,
            vItem.product.sku || "",
            vItem.unitPrice,
            vItem.quantity,
            vItem.product.unit || "piece",
            vItem.size,
            vItem.colour,
            vItem.image,
            vItem.lineTotal,
          ],
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      data: {
        orderId,
        orderNumber,
        totalAmount,
        subtotal: calculatedSubtotal,
        paymentStatus,
        orderStatus: "Pending",
        itemsCount: validatedItems.length,
      },
      order: {
        id: orderId,
        orderNumber,
        totalAmount,
        subtotal: calculatedSubtotal,
        paymentStatus,
        orderStatus: "Pending",
        itemsCount: validatedItems.length,
      },
    });
  } catch (err: any) {
    console.error("[OrderController] createCheckoutOrder critical error:", err);
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to process checkout and place order in database." });
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const { status, payment_status, search } = req.query;
    console.log("[OrderController] getOrders requested. Query params:", { status, payment_status, search });
    const db = await getDb();

    let orders = await db.query(`
      SELECT 
        o.id,
        o.order_number,
        COALESCE(o.user_id, o.customer_id) AS user_id,
        o.customer_name,
        COALESCE(o.phone, o.customer_phone) AS customer_phone,
        COALESCE(o.phone, o.customer_phone) AS phone,
        COALESCE(o.email, o.customer_email) AS customer_email,
        COALESCE(o.email, o.customer_email) AS email,
        COALESCE(o.address, o.shipping_address) AS shipping_address,
        COALESCE(o.address, o.shipping_address) AS address,
        o.subtotal,
        o.shipping_fee,
        o.discount_amount,
        o.total_amount,
        o.order_status,
        o.payment_method,
        o.payment_status,
        o.notes,
        o.created_at,
        o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    console.log(`[OrderController] Retrieved ${orders.length} orders from database.`);

    if (status && status !== "All") {
      orders = orders.filter((o) => (o.order_status || o.status) === status);
    }

    if (payment_status && payment_status !== "All") {
      orders = orders.filter((o) => (o.payment_status || o.paymentStatus) === payment_status);
    }

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          String(o.id || "").toLowerCase().includes(q) ||
          String(o.order_number || "").toLowerCase().includes(q) ||
          String(o.customer_name || "").toLowerCase().includes(q) ||
          String(o.phone || o.customer_phone || "").includes(q) ||
          String(o.email || o.customer_email || "").toLowerCase().includes(q),
      );
    }

    // Attach line items to each order
    const formattedOrders = await Promise.all(
      orders.map(async (o) => {
        let items: any[] = [];
        try {
          items = await db.query(
            `SELECT 
              id,
              order_id,
              product_id,
              product_name,
              product_sku,
              COALESCE(image, image_url) AS image,
              COALESCE(image_url, image) AS image_url,
              size,
              COALESCE(color, colour) AS color,
              COALESCE(colour, color) AS colour,
              quantity,
              COALESCE(price, unit_price) AS price,
              COALESCE(unit_price, price) AS unit_price,
              unit,
              total_price,
              created_at
            FROM order_items
            WHERE order_id = ?`,
            [o.id],
          );
        } catch (itemErr) {
          items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
        }

        const phoneVal = o.phone || o.customer_phone || "";
        const emailVal = o.email || o.customer_email || "";
        const addrVal = o.address || o.shipping_address || "";

        return {
          id: o.id,
          orderNumber: o.order_number || o.id,
          userId: o.user_id || o.customer_id || "",
          customerName: o.customer_name || "Customer",
          customerEmail: emailVal,
          email: emailVal,
          customerPhone: phoneVal,
          phone: phoneVal,
          shippingAddress: addrVal,
          address: addrVal,
          subtotal: Number(o.subtotal || o.total_amount || 0),
          total: Number(o.total_amount || o.subtotal || 0),
          totalAmount: Number(o.total_amount || o.subtotal || 0),
          status: o.order_status || "Pending",
          orderStatus: o.order_status || "Pending",
          paymentMethod: o.payment_method || "COD",
          paymentStatus: o.payment_status || "Pending",
          notes: o.notes || "",
          date: formatDate(o.created_at),
          createdAt: o.created_at instanceof Date ? o.created_at.toISOString() : String(o.created_at || ""),
          items: items.map((i) => ({
            id: i.id,
            productId: i.product_id,
            productName: i.product_name,
            sku: i.product_sku || "",
            quantity: Number(i.quantity) || 1,
            unit: i.unit || "piece",
            price: Number(i.price ?? i.unit_price ?? 0),
            unitPrice: Number(i.unit_price ?? i.price ?? 0),
            size: i.size || "",
            colour: i.colour || i.color || "",
            color: i.color || i.colour || "",
            image: i.image || i.image_url || "",
            imageUrl: i.image_url || i.image || "",
            lineTotal: Number(i.total_price || (Number(i.unit_price || i.price || 0) * (Number(i.quantity) || 1))),
            totalPrice: Number(i.total_price || (Number(i.unit_price || i.price || 0) * (Number(i.quantity) || 1))),
          })),
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (err: any) {
    console.error("[OrderController] getOrders error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve orders list." });
  }
}

export async function deleteOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    console.log(`[OrderController] Deleting order ${id}...`);
    const db = await getDb();
    await db.execute("DELETE FROM order_items WHERE order_id = ?", [id]);
    await db.execute("DELETE FROM orders WHERE id = ?", [id]);
    console.log(`[OrderController] Order ${id} deleted successfully.`);
    return res.status(200).json({ success: true, message: "Order deleted successfully." });
  } catch (err: any) {
    console.error("[OrderController] deleteOrder error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete order." });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await getDb();

    const orders = await db.query("SELECT * FROM orders WHERE id = ? OR order_number = ?", [
      id,
      id,
    ]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, error: "Order record not found." });
    }

    const o = orders[0];
    const items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [o.id]);

    return res.status(200).json({
      success: true,
      order: {
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        shippingAddress: o.shipping_address,
        subtotal: Number(o.subtotal),
        total: Number(o.total_amount),
        status: o.order_status,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        notes: o.notes,
        date: formatDate(o.created_at),
        createdAt: o.created_at instanceof Date ? o.created_at.toISOString() : String(o.created_at || ""),
        items: items.map((i) => ({
          productId: i.product_id,
          productName: i.product_name,
          sku: i.product_sku,
          quantity: Number(i.quantity),
          unit: i.unit,
          price: Number(i.unit_price),
          size: i.size,
          colour: i.colour || "",
          image: i.image_url || i.image || "",
          imageUrl: i.image_url || i.image || "",
          lineTotal: Number(i.total_price),
        })),
      },
    });
  } catch (err: any) {
    console.error("[OrderController] getOrderById error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve order details." });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const db = await getDb();
    const rows = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }

    const order = rows[0];
    const previousStatus = order.order_status;

    await db.execute("UPDATE orders SET order_status = ? WHERE id = ?", [status, id]);

    // If order was cancelled and previous status wasn't cancelled, restore stock!
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      const items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [id]);
      for (const item of items) {
        const prodRows = await db.query("SELECT stock_quantity, name FROM products WHERE id = ?", [
          item.product_id,
        ]);
        if (prodRows.length > 0) {
          const currentStock = prodRows[0].stock_quantity;
          const restoredStock = currentStock + Number(item.quantity);
          await db.execute("UPDATE products SET stock_quantity = ? WHERE id = ?", [
            restoredStock,
            item.product_id,
          ]);

          await db.execute(
            `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
              item.product_id,
              currentStock,
              restoredStock,
              Number(item.quantity),
              `Order ${order.order_number} cancellation stock restoration`,
            ],
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      status,
    });
  } catch (err: any) {
    console.error("[OrderController] updateOrderStatus error:", err);
    return res.status(500).json({ success: false, error: "Failed to update order status." });
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason, notes: customerNotes } = req.body;

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: "A valid cancellation reason is required.",
      });
    }

    const cleanId = String(id).replace(/^#/, "").trim();
    const db = await getDb();
    const rows = await db.query(
      "SELECT * FROM orders WHERE id = ? OR order_number = ? OR LOWER(id) = ? OR LOWER(order_number) = ? OR id = ? OR order_number = ?",
      [id, id, cleanId.toLowerCase(), cleanId.toLowerCase(), cleanId, cleanId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }

    const order = rows[0];

    if (order.order_status === "Cancelled") {
      return res.status(400).json({
        success: false,
        error: "This order is already cancelled.",
      });
    }

    if (order.order_status === "Delivered") {
      return res.status(400).json({
        success: false,
        error: "Delivered orders cannot be cancelled.",
      });
    }

    const trimmedReason = reason.trim();
    const extraDetails = customerNotes && typeof customerNotes === "string" ? customerNotes.trim() : "";
    const cancellationStamp = `[Cancelled by Customer on ${new Date().toLocaleString("en-IN")}. Reason: ${trimmedReason}${extraDetails ? ` | Details: ${extraDetails}` : ""}]`;
    const updatedNotes = order.notes ? `${order.notes}\n${cancellationStamp}` : cancellationStamp;

    // 1. Update order status to 'Cancelled' and save reason in notes
    await db.execute(
      "UPDATE orders SET order_status = 'Cancelled', notes = ? WHERE id = ?",
      [updatedNotes, order.id]
    );

    // 2. Restore stock quantity for all items in the order
    const items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
    for (const item of items) {
      const prodRows = await db.query("SELECT stock_quantity, name FROM products WHERE id = ?", [
        item.product_id,
      ]);
      if (prodRows.length > 0) {
        const currentStock = Number(prodRows[0].stock_quantity) || 0;
        const restoredStock = currentStock + Number(item.quantity);
        await db.execute("UPDATE products SET stock_quantity = ? WHERE id = ?", [
          restoredStock,
          item.product_id,
        ]);

        await db
          .execute(
            `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
              item.product_id,
              currentStock,
              restoredStock,
              Number(item.quantity),
              `Customer cancellation stock restoration (Order: ${order.order_number || order.id}) - Reason: ${trimmedReason}`,
            ],
          )
          .catch(() => {});
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: "Cancelled",
        notes: updatedNotes,
        cancellationReason: trimmedReason,
      },
    });
  } catch (err: any) {
    console.error("[OrderController] cancelOrder error:", err);
    return res.status(500).json({ success: false, error: "Failed to cancel order." });
  }
}

export async function updatePaymentStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validStatuses = ["Pending", "Paid", "Failed", "Refunded"];
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid payment status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const db = await getDb();
    const rows = await db.query("SELECT id FROM orders WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found." });
    }

    await db.execute("UPDATE orders SET payment_status = ? WHERE id = ?", [payment_status, id]);

    return res.status(200).json({
      success: true,
      message: `Payment status updated to '${payment_status}'.`,
      payment_status,
    });
  } catch (err: any) {
    console.error("[OrderController] updatePaymentStatus error:", err);
    return res.status(500).json({ success: false, error: "Failed to update payment status." });
  }
}

export async function getCustomers(req: Request, res: Response) {
  try {
    const db = await getDb();
    const customers = await db.query("SELECT * FROM customers");
    const orders = await db.query("SELECT * FROM orders");
    const addresses = await db.query("SELECT * FROM customer_addresses");

    const customerMap = new Map<string, any>();

    for (const c of customers) {
      if (!c.email) continue;
      customerMap.set(c.email.toLowerCase(), {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        address: "",
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: "",
        createdAt: formatDate(c.created_at),
      });
    }

    for (const o of orders) {
      const email = o.customer_email?.toLowerCase();
      if (!email) continue;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: o.customer_id || `cust-${Math.random().toString(36).substring(2, 8)}`,
          name: o.customer_name || "Customer",
          email: o.customer_email,
          phone: o.customer_phone || "",
          address: o.shipping_address || "",
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: "",
          createdAt: formatDate(o.created_at),
        });
      }
      const entry = customerMap.get(email);
      entry.ordersCount += 1;
      if (o.payment_status === "Paid") {
        entry.totalSpent += Number(o.total_amount || 0);
      }
      if (!entry.address && o.shipping_address) {
        entry.address = o.shipping_address;
      }
      const orderDate = formatDate(o.created_at);
      if (orderDate && (!entry.lastOrderDate || orderDate > entry.lastOrderDate)) {
        entry.lastOrderDate = orderDate;
      }
    }

    for (const addr of addresses) {
      for (const [_, entry] of customerMap) {
        if (entry.id === addr.customer_id && !entry.address) {
          entry.address = `${addr.address_line1}, ${addr.city}`;
        }
      }
    }

    const list = Array.from(customerMap.values()).sort(
      (a, b) => (b.ordersCount || 0) - (a.ordersCount || 0),
    );

    return res.status(200).json({
      success: true,
      customers: list,
      data: list,
    });
  } catch (err: any) {
    console.error("[OrderController] getCustomers error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve customers list." });
  }
}

export async function updateCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const db = await getDb();

    // 1. Update in customers table if exists
    await db
      .execute("UPDATE customers SET name = ?, phone = ? WHERE id = ? OR LOWER(email) = LOWER(?)", [
        (name || "").trim(),
        (phone || "").trim(),
        id,
        email || id,
      ])
      .catch(() => {});

    // 2. Update existing customer address if present
    if (address && address.trim()) {
      const existingAddr = await db.query(
        "SELECT * FROM customer_addresses WHERE customer_id = ? OR customer_id IN (SELECT id FROM customers WHERE LOWER(email) = LOWER(?))",
        [id, email || id],
      );
      if (existingAddr && existingAddr.length > 0) {
        await db
          .execute(
            "UPDATE customer_addresses SET address_line1 = ? WHERE id = ?",
            [address.trim(), existingAddr[0].id],
          )
          .catch(() => {});
      } else {
        const addrId = `addr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        await db
          .execute(
            "INSERT INTO customer_addresses (id, customer_id, address_line1, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [addrId, id, address.trim(), "Chennai", "Tamil Nadu", "600053", "India"],
          )
          .catch(() => {});
      }
    }

    // 3. Update orders linked to this customer
    if (name || phone || address) {
      await db
        .execute(
          `UPDATE orders SET 
            customer_name = COALESCE(NULLIF(?, ''), customer_name), 
            customer_phone = COALESCE(NULLIF(?, ''), customer_phone), 
            shipping_address = COALESCE(NULLIF(?, ''), shipping_address) 
           WHERE customer_id = ? OR LOWER(customer_email) = LOWER(?)`,
          [name || "", phone || "", address || "", id, email || id],
        )
        .catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
    });
  } catch (err: any) {
    console.error("[OrderController] updateCustomer error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update customer." });
  }
}

export async function deleteCustomer(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Remove from customers table
    await db.execute("DELETE FROM customers WHERE id = ? OR LOWER(email) = LOWER(?)", [id, id]).catch(() => {});
    // Remove linked addresses
    await db.execute("DELETE FROM customer_addresses WHERE customer_id = ?", [id]).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (err: any) {
    console.error("[OrderController] deleteCustomer error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to delete customer." });
  }
}

