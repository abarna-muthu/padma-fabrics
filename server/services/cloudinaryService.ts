import https from "https";
import crypto from "crypto";

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  created_at: string;
}

export function getCloudinaryConfig() {
  return {
    cloudName: process.env["CLOUDINARY_CLOUD_NAME"] || "ugzb1wup",
    apiKey: process.env["CLOUDINARY_API_KEY"] || "533229489928217",
    apiSecret: process.env["CLOUDINARY_API_SECRET"] || "-TBIKsMTQf0a6p1BYLBeVtHS6Fg",
    folder: process.env["CLOUDINARY_FOLDER"] || "padma_products",
  };
}

/**
 * Upload an image (base64 data URL, remote URL, or buffer) directly to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  customFolder?: string,
): Promise<CloudinaryUploadResult> {
  const { cloudName, apiKey, apiSecret, folder: defaultFolder } = getCloudinaryConfig();
  const folder = customFolder || defaultFolder;

  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Cloudinary signature must sort parameters alphabetically before appending apiSecret
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    const payload = JSON.stringify({
      file: fileData,
      api_key: apiKey,
      timestamp,
      folder,
      signature,
    });

    const options = {
      hostname: "api.cloudinary.com",
      port: 443,
      path: `/v1_1/${cloudName}/image/upload`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              url: parsed.url,
              secure_url: parsed.secure_url,
              public_id: parsed.public_id,
              format: parsed.format,
              bytes: parsed.bytes,
              width: parsed.width,
              height: parsed.height,
              created_at: parsed.created_at,
            });
          } else {
            const errMsg = parsed.error?.message || `Cloudinary upload failed with status ${res.statusCode}`;
            reject(new Error(errMsg));
          }
        } catch (err: any) {
          reject(new Error(`Failed to parse Cloudinary response: ${err.message}`));
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`Cloudinary network error: ${err.message}`));
    });

    req.write(payload);
    req.end();
  });
}
