import { Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "../config/db";
import { generateToken, AuthRequest } from "../middleware/authMiddleware";

export async function adminLogin(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide both email address and password.",
      });
    }

    const db = await getDb();
    const rows = await db.query(
      "SELECT id, email, password_hash, name, role FROM admin_users WHERE email = ?",
      [email.trim().toLowerCase()],
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please verify your credentials.",
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error("[AuthController] adminLogin error:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error occurred during authentication.",
    });
  }
}

export async function getAdminProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = await getDb();
    const rows = await db.query(
      "SELECT id, email, name, role, created_at FROM admin_users WHERE id = ?",
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Admin user record not found." });
    }

    return res.status(200).json({
      success: true,
      user: rows[0],
    });
  } catch (err: any) {
    console.error("[AuthController] getAdminProfile error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve administrator profile.",
    });
  }
}

export async function adminUpdateCredentials(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { current_password, new_email, new_password } = req.body;

    if (!current_password) {
      return res.status(400).json({
        success: false,
        error: "Current password is required to authorize credential changes.",
      });
    }

    const db = await getDb();
    const rows = await db.query(
      "SELECT id, email, password_hash, name, role FROM admin_users WHERE id = ?",
      [req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Admin account not found." });
    }

    const admin = rows[0];
    const isCurrentValid = await bcrypt.compare(current_password, admin.password_hash);

    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: "The current password entered is incorrect.",
      });
    }

    let targetEmail = admin.email;
    if (new_email && new_email.trim()) {
      const cleanEmail = new_email.trim().toLowerCase();
      if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        return res.status(400).json({
          success: false,
          error: "Please provide a valid email address.",
        });
      }
      targetEmail = cleanEmail;
    }

    let targetPasswordHash = admin.password_hash;
    if (new_password) {
      if (new_password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 6 characters in length.",
        });
      }
      targetPasswordHash = await bcrypt.hash(new_password, 10);
    }

    await db.execute("UPDATE admin_users SET email = ?, password_hash = ? WHERE id = ?", [
      targetEmail,
      targetPasswordHash,
      admin.id,
    ]);

    // Generate rotated token
    const newToken = generateToken({
      id: admin.id,
      email: targetEmail,
      name: admin.name,
      role: admin.role,
    });

    return res.status(200).json({
      success: true,
      message: "Administrator credentials updated successfully.",
      token: newToken,
      user: {
        id: admin.id,
        email: targetEmail,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error("[AuthController] adminUpdateCredentials error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update administrator credentials.",
    });
  }
}
