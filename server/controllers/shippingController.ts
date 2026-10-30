import { Request, Response } from "express";
import { getDb } from "../config/db";
import { DEFAULT_SHIPPING_RATES, INDIAN_STATES_AND_UTS, slugifyState } from "../data/shippingData";

// Helper to retrieve free shipping threshold from site_settings table
async function getFreeShippingThreshold(db: any): Promise<number> {
  try {
    const rows = await db.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'free_shipping_threshold'",
    );
    if (rows && rows.length > 0) {
      const val = Number(rows[0].setting_value);
      return isNaN(val) ? 0 : val;
    }
  } catch (err) {
    console.warn("[ShippingController] Error fetching free shipping threshold:", err);
  }
  return 0; // 0 means disabled / no minimum order threshold for free shipping
}

/**
 * Public API: GET /api/shipping-rate?state=<state>&subtotal=<subtotal>
 * Returns shipping charge for the selected state and calculates free shipping if applicable.
 */
export async function getShippingRate(req: Request, res: Response) {
  try {
    const stateParam = String(req.query["state"] || "").trim();
    const subtotalParam = Number(req.query["subtotal"]) || 0;

    if (!stateParam) {
      return res.status(400).json({
        success: false,
        error: "State query parameter is required (e.g. ?state=Tamil Nadu).",
      });
    }

    const db = await getDb();
    const threshold = await getFreeShippingThreshold(db);

    // Look up state (case-insensitive)
    const rows = await db.query(
      "SELECT id, state, charge, is_active FROM shipping_rates WHERE LOWER(state) = LOWER(?) OR LOWER(id) = LOWER(?)",
      [stateParam, slugifyState(stateParam)],
    );

    if (!rows || rows.length === 0) {
      // Fallback matching against default Indian states
      const fallback = DEFAULT_SHIPPING_RATES.find(
        (r) => r.state.toLowerCase() === stateParam.toLowerCase(),
      );
      if (fallback) {
        const baseCharge = Number(fallback.charge) || 0;
        const isFree = threshold > 0 && subtotalParam >= threshold;
        return res.status(200).json({
          success: true,
          state: fallback.state,
          charge: baseCharge,
          finalCharge: isFree ? 0 : baseCharge,
          isFreeShipping: isFree,
          freeShippingThreshold: threshold,
          isActive: true,
        });
      }

      return res.status(404).json({
        success: false,
        error: `Shipping is not configured for state '${stateParam}'.`,
      });
    }

    const record = rows[0];
    const baseCharge = Number(record.charge) || 0;
    const isActive = Boolean(record.is_active);
    const isFree = isActive && threshold > 0 && subtotalParam >= threshold;
    const finalCharge = isFree ? 0 : baseCharge;

    return res.status(200).json({
      success: true,
      state: record.state,
      charge: baseCharge,
      finalCharge,
      isFreeShipping: isFree,
      freeShippingThreshold: threshold,
      isActive,
    });
  } catch (err: any) {
    console.error("[ShippingController] getShippingRate error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to calculate shipping rate.",
    });
  }
}

/**
 * Public API: GET /api/shipping-rates
 * Returns all active state shipping rates and current free shipping threshold for checkout dropdown.
 */
export async function getPublicShippingRates(req: Request, res: Response) {
  try {
    const db = await getDb();
    const threshold = await getFreeShippingThreshold(db);

    let rates = await db.query(
      "SELECT id, state, charge, is_active FROM shipping_rates WHERE is_active = 1 ORDER BY state ASC",
    );

    if (!rates || rates.length === 0) {
      rates = DEFAULT_SHIPPING_RATES.map((r) => ({ ...r, charge: Number(r.charge) }));
    } else {
      rates = rates.map((r: any) => ({
        id: r.id,
        state: r.state,
        charge: Number(r.charge) || 0,
        isActive: Boolean(r.is_active),
      }));
    }

    return res.status(200).json({
      success: true,
      count: rates.length,
      rates,
      freeShippingThreshold: threshold,
    });
  } catch (err: any) {
    console.error("[ShippingController] getPublicShippingRates error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve shipping rates.",
    });
  }
}

/**
 * Admin API: GET /api/admin/shipping-rates
 * Returns all rates (both active and inactive) with metadata and free shipping settings.
 */
export async function getAdminShippingRates(req: Request, res: Response) {
  try {
    const db = await getDb();
    const threshold = await getFreeShippingThreshold(db);

    let rates = await db.query(
      "SELECT id, state, charge, is_active, created_at, updated_at FROM shipping_rates ORDER BY state ASC",
    );

    if (!rates || rates.length === 0) {
      rates = DEFAULT_SHIPPING_RATES.map((r) => ({ ...r, charge: Number(r.charge) }));
    } else {
      rates = rates.map((r: any) => ({
        id: r.id,
        state: r.state,
        charge: Number(r.charge) || 0,
        isActive: Boolean(r.is_active),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }

    return res.status(200).json({
      success: true,
      count: rates.length,
      rates,
      freeShippingThreshold: threshold,
    });
  } catch (err: any) {
    console.error("[ShippingController] getAdminShippingRates error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve administrative shipping rates.",
    });
  }
}

/**
 * Admin API: PUT /api/admin/shipping-rates/:id
 * Updates shipping rate for a single state.
 */
export async function updateShippingRate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { charge, is_active, isActive } = req.body;

    if (charge === undefined && is_active === undefined && isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: "At least one of charge or is_active must be provided for update.",
      });
    }

    const db = await getDb();
    const rows = await db.query(
      "SELECT * FROM shipping_rates WHERE id = ? OR LOWER(state) = LOWER(?)",
      [id, id],
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Shipping rate with ID or State '${id}' not found.`,
      });
    }

    const previous = rows[0];
    const newCharge = charge !== undefined ? Math.max(0, Number(charge) || 0) : Number(previous.charge);
    const newActive =
      is_active !== undefined
        ? is_active ? 1 : 0
        : isActive !== undefined
          ? isActive ? 1 : 0
          : previous.is_active ? 1 : 0;

    await db.execute(
      "UPDATE shipping_rates SET charge = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newCharge, newActive, previous.id],
    );

    return res.status(200).json({
      success: true,
      message: `Shipping rate for ${previous.state} updated to ₹${newCharge}.`,
      rate: {
        id: previous.id,
        state: previous.state,
        charge: newCharge,
        isActive: Boolean(newActive),
      },
    });
  } catch (err: any) {
    console.error("[ShippingController] updateShippingRate error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update shipping rate.",
    });
  }
}

/**
 * Admin API: POST /api/admin/shipping-rates/bulk
 * Bulk update shipping rates: set uniform charge for all states or update specific list.
 */
export async function bulkUpdateShippingRates(req: Request, res: Response) {
  try {
    const { charge, is_active, isActive, rates } = req.body;
    const db = await getDb();

    // Mode A: Set uniform charge for all states
    if (charge !== undefined) {
      const uniformCharge = Math.max(0, Number(charge) || 0);
      const activeVal =
        is_active !== undefined
          ? is_active ? 1 : 0
          : isActive !== undefined
            ? isActive ? 1 : 0
            : null;

      if (activeVal !== null) {
        await db.execute(
          "UPDATE shipping_rates SET charge = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP",
          [uniformCharge, activeVal],
        );
      } else {
        await db.execute(
          "UPDATE shipping_rates SET charge = ?, updated_at = CURRENT_TIMESTAMP",
          [uniformCharge],
        );
      }

      return res.status(200).json({
        success: true,
        message: `Set uniform shipping charge of ₹${uniformCharge} for all states.`,
      });
    }

    // Mode B: Update an array of rates
    if (Array.isArray(rates) && rates.length > 0) {
      for (const item of rates) {
        if (!item.id && !item.state) continue;
        const itemCharge = item.charge !== undefined ? Math.max(0, Number(item.charge) || 0) : 0;
        const itemActive = item.is_active !== undefined ? (item.is_active ? 1 : 0) : (item.isActive !== false ? 1 : 0);
        await db.execute(
          "UPDATE shipping_rates SET charge = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR LOWER(state) = LOWER(?)",
          [itemCharge, itemActive, item.id || slugifyState(item.state), item.state || item.id],
        );
      }

      return res.status(200).json({
        success: true,
        message: `Successfully bulk updated ${rates.length} shipping rates.`,
      });
    }

    return res.status(400).json({
      success: false,
      error: "Please provide either 'charge' for all states or an array of 'rates'.",
    });
  } catch (err: any) {
    console.error("[ShippingController] bulkUpdateShippingRates error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to apply bulk shipping rate updates.",
    });
  }
}

/**
 * Admin API: POST /api/admin/shipping-rates/settings
 * Updates free shipping threshold setting in site_settings table.
 */
export async function updateShippingSettings(req: Request, res: Response) {
  try {
    const { free_shipping_threshold, freeShippingThreshold } = req.body;
    const rawVal = free_shipping_threshold !== undefined ? free_shipping_threshold : freeShippingThreshold;

    if (rawVal === undefined) {
      return res.status(400).json({
        success: false,
        error: "free_shipping_threshold is required (e.g. 1000 or 0 to disable).",
      });
    }

    const threshold = Math.max(0, Number(rawVal) || 0);
    const db = await getDb();

    await db.execute(
      "INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES ('free_shipping_threshold', ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = ?",
      [String(threshold), Date.now(), String(threshold), Date.now()],
    );

    return res.status(200).json({
      success: true,
      message: threshold > 0 ? `Free shipping configured on orders above ₹${threshold}.` : "Free shipping threshold disabled.",
      freeShippingThreshold: threshold,
    });
  } catch (err: any) {
    console.error("[ShippingController] updateShippingSettings error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to save shipping settings.",
    });
  }
}

