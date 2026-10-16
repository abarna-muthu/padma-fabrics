import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = process.env["VERCEL"] === "1" || process.env["AWS_LAMBDA_FUNCTION_NAME"] !== undefined;
const DATA_DIR = isServerless ? "/tmp" : path.resolve(__dirname, "../data");
const CONTENT_FILE = path.join(DATA_DIR, "site_content.json");

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem fallback
}

export const DEFAULT_SITE_CONTENT = {
  home: {
    announcementText: "Beautiful fabrics. Beyond borders. | Retail · Wholesale · Import & Export",
    heroKicker: "The Padmanabha collection",
    heroTitle: "A world of beautiful fabrics.",
    heroSubtitle:
      "From everyday elegance to extraordinary occasions. Discover fabrics that bring your vision to life.",
    heroBottomText: "Woven with tradition. Chosen with care.",
    whyChooseTitle: "Why Choose Padma Fabrics?",
    whyChooseDesc:
      "Heritage craftsmanship, direct artisan sourcing, and wholesale excellence rooted in Chennai.",
    inspirationTitle: "Fabric Inspiration & Craft",
    inspirationDesc:
      "From royal Kanjivaram silk weaves to breathable organic cottons, discover how Chennai's finest textiles take shape.",
  },
  about: {
    headerKicker: "Our Story & Heritage",
    headerTitle: "Rooted in Chennai. Connected to the world.",
    headerDesc:
      "Welcome to Padmanabha Fabrics. From our home in Ambattur, Chennai, we connect a love for beautiful textiles with the needs of our retail and wholesale customers.",
    storyKicker: "Rooted in Chennai. Connected to the world.",
    storyTitle: "More than fabrics. A personal connection.",
    storyParagraph1:
      "Welcome to Padmanabha Fabrics. From our home in Ambattur, Chennai, we connect a love for beautiful textiles with the needs of our retail and wholesale customers.",
    storyParagraph2:
      "Whether you are choosing for yourself or sourcing for your business, we would love to help you find your fabric.",
    storeAddressNote: "Visit our showroom in Ambattur, Chennai",
  },
  contact: {
    headerKicker: "Get in touch",
    headerTitle: "Let's create something together.",
    headerDesc:
      "Wholesale sourcing, bulk enquiries and international partnerships. Visit our showroom in Ambattur, Chennai or get in touch with our team.",
    showroomName: "Padmanabha Fabrics",
    showroomAddress:
      "No. 3, Ground floor, 7th Street, Indira Nagar, Menambedu, Ambattur, Chennai – 600053. Tamil Nadu, India.",
    phonePrimary: "+91 99401 35700",
    phoneSecondary: "+91 99401 45700",
    email: "padmanabhafabrics@gmail.com",
    businessScope:
      "Your wholesale partner for quality & value. We cater to retail fabric connoisseurs, apparel brands, boutiques, and international importers.",
    mapsUrl: "https://maps.app.goo.gl/D3SYeK37eivDbbiA8",
  },
};

function readPersistedContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = fs.readFileSync(CONTENT_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        home: { ...DEFAULT_SITE_CONTENT.home, ...parsed.home },
        about: { ...DEFAULT_SITE_CONTENT.about, ...parsed.about },
        contact: { ...DEFAULT_SITE_CONTENT.contact, ...parsed.contact },
      };
    }
  } catch (err) {
    console.error("[ContentRoute] Error reading site content file:", err);
  }
  return DEFAULT_SITE_CONTENT;
}

function writePersistedContent(content: any) {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
  } catch (err) {
    console.error("[ContentRoute] Error writing site content file:", err);
  }
}

// GET /api/content
router.get("/", (req: Request, res: Response) => {
  const content = readPersistedContent();
  return res.status(200).json({
    success: true,
    data: content,
  });
});

// PUT /api/content
router.put("/", (req: Request, res: Response) => {
  const current = readPersistedContent();
  const updates = req.body || {};

  const updatedContent = {
    home: { ...current.home, ...(updates.home || {}) },
    about: { ...current.about, ...(updates.about || {}) },
    contact: { ...current.contact, ...(updates.contact || {}) },
  };

  writePersistedContent(updatedContent);

  return res.status(200).json({
    success: true,
    data: updatedContent,
  });
});

// POST /api/content/reset
router.post("/reset", (req: Request, res: Response) => {
  writePersistedContent(DEFAULT_SITE_CONTENT);
  return res.status(200).json({
    success: true,
    data: DEFAULT_SITE_CONTENT,
  });
});

export default router;
