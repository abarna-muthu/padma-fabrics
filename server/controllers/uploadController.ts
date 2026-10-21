import { Request, Response } from "express";
import { uploadToCloudinary, getCloudinaryConfig } from "../services/cloudinaryService";
import crypto from "crypto";

export async function uploadImage(req: Request, res: Response) {
  try {
    const { image, file, folder } = req.body;
    const targetData = image || file;

    if (!targetData) {
      return res.status(400).json({
        success: false,
        error: "Image data (base64 string or image URL) is required.",
      });
    }

    const result = await uploadToCloudinary(targetData, folder);

    return res.status(200).json({
      success: true,
      message: "Image successfully uploaded to Cloudinary.",
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error("[UploadController] Cloudinary upload error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to upload image to Cloudinary.",
    });
  }
}

export async function getUploadSignature(req: Request, res: Response) {
  try {
    const { folder: customFolder } = req.query;
    const { cloudName, apiKey, apiSecret, folder: defaultFolder } = getCloudinaryConfig();
    const folder = (customFolder as string) || defaultFolder;
    const timestamp = Math.round(new Date().getTime() / 1000);

    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    return res.status(200).json({
      success: true,
      cloudName,
      apiKey,
      timestamp,
      folder,
      signature,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to generate upload signature.",
    });
  }
}
