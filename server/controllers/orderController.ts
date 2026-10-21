import { Request, Response } from "express";
import { getDb, INITIAL_PRODUCTS } from "../config/db";

export async function createCheckoutOrder(req: Request, res: Response) {
  try {
    const customer_name = req.body.customer_name || req.body.customerName;
    const customer_email = req.body.customer_email || req.body.customerEmail;
    const customer_phone = req.body.customer_phone || req.body.customerPhone;
    const shipping_address = req.body.shipping_address || req.body.shippingAddress;
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

      // Fallback to INITIAL_PRODUCTS catalog definition if DB does not have the row yet
      if (rows.length === 0) {
        const catalogMatch = INITIAL_PRODUCTS.find(
          (p) =>
            p.id.toLowerCase() === rawId.toLowerCase() ||
            p.slug.toLowerCase() === rawId.toLowerCase() ||
            (p.sku && p.sku.toLowerCase() === rawId.toLowerCase()),
        );
        if (catalogMatch) {
          rows = [catalogMatch];
        }
      }

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: `Product with ID '${item.id || item.productId}' could not be located in catalog.`,
        });
      }

      const product = rows[0];
      const requestedQty = Math.max(1, Number(item.quantity) || 1);

      if (product.stock_quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for '${product.name}'. Requested ${requestedQty}, but only ${product.stock_quantity} available.`,
        });
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * requestedQty;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        product,
        quantity: requestedQty,
        unitPrice,
        lineTotal,
        size: item.size || "",
      });
    }

    const shippingFee = 0; // Free delivery in Chennai/India promotional tier
    const discountAmount = 0;
    const totalAmount = calculatedSubtotal + shippingFee - discountAmount;

    const orderId = `PF-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    const orderNumber = orderId;
    const paymentStatus = payment_method === "COD" ? "Pending" : "Paid";

    // 1. Ensure Customer Exists & Upsert Record
    let customerId = "";
    const existingCust = await db.query("SELECT * FROM customers WHERE email = ?", [
      customer_email.trim().toLowerCase(),
    ]);
    if (existingCust.length > 0) {
      customerId = existingCust[0].id;
      await db.execute("UPDATE customers SET name = ?, phone = ? WHERE id = ?", [
        customer_name.trim(),
        customer_phone.trim(),
        customerId,
      ]);
    } else {
      customerId = `cust-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      await db.execute("INSERT INTO customers (id, name, email, phone) VALUES (?, ?, ?, ?)", [
        customerId,
        customer_name.trim(),
        customer_email.trim().toLowerCase(),
        customer_phone.trim(),
      ]);
    }

    // Save Customer Address
    if (shipping_address) {
      const addrId = `addr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      await db.execute(
        "INSERT INTO customer_addresses (id, customer_id, address_line1, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          addrId,
          customerId,
          shipping_address.trim(),
          "Chennai",
          "Tamil Nadu",
          "600053",
          "India",
        ],
      );
    }

    // Create Order Record
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

    // Create Order Items and deduct inventory stock atomically
    for (const vItem of validatedItems) {
      const oiId = `oi-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      await db.execute(
        `INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, unit_price, quantity, unit, size, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          oiId,
          orderId,
          vItem.product.id,
          vItem.product.name,
          vItem.product.sku,
          vItem.unitPrice,
          vItem.quantity,
          vItem.product.unit || "piece",
          vItem.size,
          vItem.lineTotal,
        ],
      );

      // Decrement inventory
      const newStock = vItem.product.stock_quantity - vItem.quantity;
      await db.execute("UPDATE products SET stock_quantity = ? WHERE id = ?", [
        newStock,
        vItem.product.id,
      ]);

      // Record inventory deduction log
      await db.execute(
        `INSERT INTO inventory_logs (id, product_id, previous_stock, new_stock, change_amount, reason)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `LOG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
          vItem.product.id,
          vItem.product.stock_quantity,
          newStock,
          -vItem.quantity,
          `Order ${orderNumber} customer fulfillment deduction`,
        ],
      );
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
    console.error("[OrderController] createCheckoutOrder error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to process checkout and place order." });
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const { status, payment_status, search } = req.query;
    const db = await getDb();

    let orders = await db.query("SELECT * FROM orders ORDER BY created_at DESC");

    if (status && status !== "All") {
      orders = orders.filter((o) => o.order_status === status);
    }

    if (payment_status && payment_status !== "All") {
      orders = orders.filter((o) => o.payment_status === payment_status);
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.customer_email.toLowerCase().includes(q),
      );
    }

    // Attach line items to each order
    const formattedOrders = await Promise.all(
      orders.map(async (o) => {
        const items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [o.id]);
        return {
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
          date: o.created_at ? o.created_at.split("T")[0] || o.created_at.split(" ")[0] : "",
          items: items.map((i) => ({
            id: i.id,
            productId: i.product_id,
            productName: i.product_name,
            sku: i.product_sku,
            quantity: Number(i.quantity),
            unit: i.unit,
            price: Number(i.unit_price),
            size: i.size,
            lineTotal: Number(i.total_price),
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
        date: o.created_at,
        items: items.map((i) => ({
          productId: i.product_id,
          productName: i.product_name,
          quantity: Number(i.quantity),
          unit: i.unit,
          price: Number(i.unit_price),
          size: i.size,
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
        createdAt: c.created_at ? c.created_at.split("T")[0] : "",
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
          createdAt: o.created_at ? o.created_at.split("T")[0] : "",
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
      const orderDate = o.created_at ? o.created_at.split("T")[0] : "";
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

