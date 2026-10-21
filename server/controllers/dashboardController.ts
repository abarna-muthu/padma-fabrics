import { Request, Response } from "express";
import { getDb } from "../config/db";

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const db = await getDb();

    // Query products
    const products = await db.query("SELECT * FROM products");
    const activeProducts = products.filter((p) => p.is_active === 1 || p.is_active === true);
    const lowStockCount = products.filter(
      (p) =>
        Number(p.stock_quantity) > 0 && Number(p.stock_quantity) < (p.low_stock_threshold || 5),
    ).length;
    const outOfStockCount = products.filter((p) => Number(p.stock_quantity) === 0).length;

    // Query orders
    const orders = await db.query("SELECT * FROM orders ORDER BY created_at DESC");

    // Strictly count only verified Paid orders for revenue
    const paidOrders = orders.filter((o) => o.payment_status === "Paid");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const pendingOrdersCount = orders.filter((o) => o.order_status === "Pending").length;
    const deliveredOrdersCount = orders.filter((o) => o.order_status === "Delivered").length;
    const cancelledOrdersCount = orders.filter((o) => o.order_status === "Cancelled").length;

    // Recent orders formatted
    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      total: Number(o.total_amount),
      status: o.order_status,
      date: o.created_at
        ? typeof o.created_at === "string"
          ? o.created_at.split("T")[0] || o.created_at.split(" ")[0]
          : new Date(o.created_at).toISOString().split("T")[0]
        : "",
    }));

    return res.status(200).json({
      success: true,
      data: {
        revenue: {
          totalPaidRevenue: totalRevenue,
          paidOrdersCount: paidOrders.length,
          averageOrderValue:
            paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
        },
        orders: {
          total: orders.length,
          pending: pendingOrdersCount,
          delivered: deliveredOrdersCount,
          cancelled: cancelledOrdersCount,
          recent: recentOrders,
        },
        products: {
          total: products.length,
          active: activeProducts.length,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        },
      },
    });
  } catch (err: any) {
    console.error("[DashboardController] getDashboardStats error:", err);
    return res.status(500).json({ success: false, error: "Failed to compile dashboard metrics." });
  }
}
