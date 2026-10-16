import { Request, Response } from "express";
import { getDb } from "../config/db";

export async function submitEnquiry(req: Request, res: Response) {
  try {
    const { name, email, phone, enquiry_type = "General", message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: "Name, email, phone number, and message are required fields.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid email address.",
      });
    }

    if (message.length < 5) {
      return res.status(400).json({
        success: false,
        error: "Please enter a detailed message regarding your fabric enquiry.",
      });
    }

    const db = await getDb();
    const id = `ENQ-${Date.now().toString(36)}`;

    await db.execute(
      `INSERT INTO contact_enquiries (id, name, email, phone, enquiry_type, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), cleanEmail, phone.trim(), enquiry_type, message.trim()],
    );

    return res.status(201).json({
      success: true,
      message: "Your message has been received. Our Ambattur team will contact you shortly.",
      enquiryId: id,
    });
  } catch (err: any) {
    console.error("[ContactController] submitEnquiry error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit enquiry. Please try again." });
  }
}

export async function getEnquiries(req: Request, res: Response) {
  try {
    const db = await getDb();
    const enquiries = await db.query("SELECT * FROM contact_enquiries ORDER BY created_at DESC");

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries: enquiries.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        enquiryType: e.enquiry_type,
        message: e.message,
        status: e.status,
        date: e.created_at ? e.created_at.split("T")[0] || e.created_at.split(" ")[0] : "",
      })),
    });
  } catch (err: any) {
    console.error("[ContactController] getEnquiries error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve enquiries." });
  }
}
