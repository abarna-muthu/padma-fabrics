import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "../config/db";

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
    heroBanners: [
      {
        id: 1,
        image: "/hero-banner-3.jpg",
        alt: "Padmanabha Fabrics - Timeless Elegance in Every Thread, Premium Sarees",
        href: "/shop",
      },
      {
        id: 2,
        image: "/hero-banner-2.png",
        alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Explore Collection",
        href: "/shop",
      },
      {
        id: 3,
        image: "/hero-banner-1.jpg",
        alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Style Woven With Tradition",
        href: "/shop",
      },
    ],
    popularCategories: [
      {
        id: "saree",
        title: "SAREE",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207105/padma_categories/p5pjfcwp74z22buj17zk.jpg",
        href: "/shop?category=Saree",
      },
      {
        id: "chudithar",
        title: "CHUDITHAR",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207146/padma_categories/hldl0tzbrvgdb05mjmpl.jpg",
        href: "/shop?category=Chudithar",
      },
      {
        id: "coordset",
        title: "COORDSET",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207181/padma_categories/o41bdu5v3onqbxh0o1sh.jpg",
        href: "/shop?category=Coordset",
      },
      {
        id: "maxi",
        title: "MAXI",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207257/padma_categories/la5hitoxfylu0xevoeqv.jpg",
        href: "/shop?category=Maxi",
      },
      {
        id: "nighty",
        title: "NIGHTY",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207301/padma_categories/bi6ccssdb2b8gblqmo03.jpg",
        href: "/shop?category=Nighty",
      },
      {
        id: "chudithar-top",
        title: "CHUDITHAR TOP",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207330/padma_categories/kwupakpq240fuhjbxvbx.jpg",
        href: "/shop?category=Chudithar Top",
      },
      {
        id: "2piece",
        title: "2 PIECE",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207410/padma_categories/yeavgte3wqqxiidrx921.jpg",
        href: "/shop?category=2piece",
      },
      {
        id: "combo-dresses",
        title: "COMBO DRESSES",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207440/padma_categories/tysvr2pz2dttrsnubnf7.jpg",
        href: "/shop?category=Combo Dresses",
      },
      {
        id: "palazzo",
        title: "PALAZZO",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207461/padma_categories/mdmtbankwfema3fcodrd.jpg",
        href: "/shop?category=palazzo",
      },
    ],
    bestsellerTabs: [
      {
        id: "chudithar-top",
        label: "CHUDITHAR TOP",
        categoryKey: "Chudithar Top",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207330/padma_categories/kwupakpq240fuhjbxvbx.jpg",
      },
      {
        id: "palazzo",
        label: "PALAZZO",
        categoryKey: "palazzo",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207461/padma_categories/mdmtbankwfema3fcodrd.jpg",
      },
      {
        id: "coordset",
        label: "COORDSET",
        categoryKey: "Coordset",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207181/padma_categories/o41bdu5v3onqbxh0o1sh.jpg",
      },
      {
        id: "2piece",
        label: "2 PIECE",
        categoryKey: "2piece",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207410/padma_categories/yeavgte3wqqxiidrx921.jpg",
      },
      {
        id: "chudithar",
        label: "CHUDITHAR",
        categoryKey: "Chudithar",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207146/padma_categories/hldl0tzbrvgdb05mjmpl.jpg",
      },
      {
        id: "saree",
        label: "SAREE",
        categoryKey: "Saree",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207105/padma_categories/p5pjfcwp74z22buj17zk.jpg",
      },
      {
        id: "maxi",
        label: "MAXI",
        categoryKey: "Maxi",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207257/padma_categories/la5hitoxfylu0xevoeqv.jpg",
      },
      {
        id: "nighty",
        label: "NIGHTY",
        categoryKey: "Nighty",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207301/padma_categories/bi6ccssdb2b8gblqmo03.jpg",
      },
      {
        id: "western-top",
        label: "WESTERN TOP",
        categoryKey: "Western Top",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207484/padma_categories/r5i5xo0ovi2ld3kuj5sn.jpg",
      },
      {
        id: "combo-dresses",
        label: "COMBO DRESSES",
        categoryKey: "Combo Dresses",
        image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793207440/padma_categories/tysvr2pz2dttrsnubnf7.jpg",
      },
    ],
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
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "October 2026 · Padmanabha Fabrics, Ambattur, Chennai",
    section1Title: "1. General Overview & Acceptance",
    section1Text:
      "Welcome to Padmanabha Fabrics (\"we\", \"our\", or \"us\"). By accessing our store, placing a retail enquiry, purchasing fabric yardage, or procuring wholesale textile inventory from our premises in Ambattur, Chennai or through our website, you agree to be bound by these Terms and Conditions.",
    section2Title: "2. Fabric Specifications, Colors & Dye Batches",
    section2Text:
      "Our textiles encompass handwoven silks, raw silks, brocades, linen, and artisanal cottons. Handloom weaves and traditional zari may feature subtle organic variations in weave tension, texture, and slub yarn. Such characteristics are the hallmark of authentic textile craftsmanship and are not considered manufacturing defects.\n\nWhile we capture photographs under balanced studio lighting, actual colors may slightly differ based on your device display settings and lighting conditions. For bulk and wholesale dye-lot consistency, we encourage ordering fabric swatches or visiting our Chennai showroom prior to high-volume cuts.",
    section3Title: "3. Ordering, Pricing & Payments",
    section3Text:
      "All prices displayed in our online showcase are sample catalog rates and inclusive of applicable GST unless explicitly stated otherwise. We accept secure UPI payments, credit/debit cards, net banking, and Cash on Delivery (COD) for eligible domestic destinations.\n\nOrders are confirmed upon receipt of authorized payment or confirmation of COD address verification by our customer support team.",
    section4Title: "4. Shipping & Delivery",
    section4Text:
      "Orders are packaged with protective moisture-barrier wrapping and dispatched directly from our Ambattur, Chennai facility via trusted courier partners. Standard domestic deliveries across India take 2 to 6 business days. Tracking numbers are shared via WhatsApp and email upon dispatch.",
    section5Title: "5. Governing Law & Jurisdiction",
    section5Text:
      "These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or claim arising out of transactions with Padmanabha Fabrics shall be subject to the exclusive jurisdiction of the competent courts in Chennai, Tamil Nadu, India.",
    supportNote: "Email us at padmanabhafabrics@gmail.com or call +91 99401 35700",
  },
  refund: {
    title: "Refund & Return Policy",
    lastUpdated: "October 2026 · Padmanabha Fabrics, Ambattur, Chennai",
    section1Title: "1. Our Quality Assurance",
    section1Text:
      "At Padmanabha Fabrics, every meter of fabric and woven saree undergoes strict inspection at our Ambattur warehouse before packaging. We take pride in delivering premier handloom and mill textiles that meet authentic standards of yarn, weave, and luster.",
    section2Title: "2. Return Eligibility Window (7 Days)",
    section2Text:
      "Customers may request an exchange or return within 7 days of delivery under the following conditions:\n• The item received has a noticeable weaving defect, manufacturing tear, or incorrect fabric dispatch.\n• Sarees, unstitched drapes, and apparel must be unworn, unwashed, unaltered, and accompanied by original folds and tags.\n• An unboxing photo or video showing the parcel upon receipt assists in rapid verification.",
    section3Title: "3. Custom Cut Yardage Notice",
    section3Text:
      "In accordance with textile industry practices, running fabric yardage custom-cut to specific customer measurements (e.g., 2.5m, 4m) cannot be returned unless delivered with a genuine physical defect or transit damage, as custom cuts cannot be reattached to the original roll.",
    section4Title: "4. Return Process & Pickup",
    section4Text:
      "To initiate a return:\n1. Message our dispatch team on WhatsApp (+91 99401 45700) or email padmanabhafabrics@gmail.com with your Order Number and photos of the issue.\n2. Upon approval, we arrange a reverse pickup via our logistics partner or provide the return shipping address in Ambattur, Chennai.\n3. Once inspected at our facility, an exchange piece is dispatched immediately or a refund is initiated.",
    section5Title: "5. Refund Timeline & Mode",
    section5Text:
      "Approved refunds are processed within 24 to 48 business hours of inspection. Online payments (UPI, Card, Net Banking) are refunded directly to the original payment source (takes 3 to 5 banking days). Cash on Delivery orders are refunded via direct UPI transfer or NEFT bank transfer as requested by the buyer.",
    supportNote: "WhatsApp our team at +91 99401 45700 or call us anytime.",
  },
};

function readPersistedContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = fs.readFileSync(CONTENT_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SITE_CONTENT,
        ...parsed,
        home: {
          ...DEFAULT_SITE_CONTENT.home,
          ...(parsed.home || {}),
          heroBanners:
            Array.isArray(parsed?.home?.heroBanners) && parsed.home.heroBanners.length > 0
              ? parsed.home.heroBanners
              : DEFAULT_SITE_CONTENT.home.heroBanners,
          popularCategories:
            Array.isArray(parsed?.home?.popularCategories) && parsed.home.popularCategories.length > 0
              ? parsed.home.popularCategories
              : DEFAULT_SITE_CONTENT.home.popularCategories,
          bestsellerTabs:
            Array.isArray(parsed?.home?.bestsellerTabs) && parsed.home.bestsellerTabs.length > 0
              ? parsed.home.bestsellerTabs
              : DEFAULT_SITE_CONTENT.home.bestsellerTabs,
        },
        about: { ...DEFAULT_SITE_CONTENT.about, ...(parsed.about || {}) },
        contact: { ...DEFAULT_SITE_CONTENT.contact, ...(parsed.contact || {}) },
        terms: { ...DEFAULT_SITE_CONTENT.terms, ...(parsed.terms || {}) },
        refund: { ...DEFAULT_SITE_CONTENT.refund, ...(parsed.refund || {}) },
        updatedAt: parsed.updatedAt || 0,
      };
    }
  } catch (err) {
    console.error("[ContentRoute] Error reading site content file:", err);
  }
  return { ...DEFAULT_SITE_CONTENT, updatedAt: 0 };
}

function writePersistedContent(content: any) {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf-8");
  } catch (err) {
    console.error("[ContentRoute] Error writing site content file:", err);
  }
}

// GET /api/content
router.get("/", async (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const database = await getDb();
    const rows: any = await database.query(
      "SELECT setting_value, updated_at FROM site_settings WHERE setting_key = 'site_content' LIMIT 1"
    );
    if (rows && rows.length > 0 && rows[0].setting_value) {
      const parsed = typeof rows[0].setting_value === "string" ? JSON.parse(rows[0].setting_value) : rows[0].setting_value;
      const dbUpdatedAt = Number(rows[0].updated_at) || parsed.updatedAt || 0;
      const merged = {
        ...DEFAULT_SITE_CONTENT,
        ...parsed,
        home: {
          ...DEFAULT_SITE_CONTENT.home,
          ...(parsed.home || {}),
          heroBanners:
            Array.isArray(parsed?.home?.heroBanners) && parsed.home.heroBanners.length > 0
              ? parsed.home.heroBanners
              : DEFAULT_SITE_CONTENT.home.heroBanners,
          popularCategories:
            Array.isArray(parsed?.home?.popularCategories) && parsed.home.popularCategories.length > 0
              ? parsed.home.popularCategories
              : DEFAULT_SITE_CONTENT.home.popularCategories,
          bestsellerTabs:
            Array.isArray(parsed?.home?.bestsellerTabs) && parsed.home.bestsellerTabs.length > 0
              ? parsed.home.bestsellerTabs
              : DEFAULT_SITE_CONTENT.home.bestsellerTabs,
        },
        about: { ...DEFAULT_SITE_CONTENT.about, ...(parsed.about || {}) },
        contact: { ...DEFAULT_SITE_CONTENT.contact, ...(parsed.contact || {}) },
        terms: { ...DEFAULT_SITE_CONTENT.terms, ...(parsed.terms || {}) },
        refund: { ...DEFAULT_SITE_CONTENT.refund, ...(parsed.refund || {}) },
        updatedAt: dbUpdatedAt,
      };
      return res.status(200).json({
        success: true,
        data: merged,
      });
    }
  } catch (dbErr) {
    console.warn("[ContentRoute] Database query failed, falling back to file/defaults:", dbErr);
  }

  const content = readPersistedContent();
  return res.status(200).json({
    success: true,
    data: content,
  });
});

// PUT /api/content
router.put("/", async (req: Request, res: Response) => {
  const current = readPersistedContent();
  const updates = req.body || {};
  const newUpdatedAt = updates.updatedAt || Date.now();

  const updatedContent = {
    ...current,
    home: {
      ...current.home,
      ...(updates.home || {}),
    },
    about: { ...current.about, ...(updates.about || {}) },
    contact: { ...current.contact, ...(updates.contact || {}) },
    terms: { ...current.terms, ...(updates.terms || {}) },
    refund: { ...current.refund, ...(updates.refund || {}) },
    updatedAt: newUpdatedAt,
  };

  writePersistedContent(updatedContent);

  try {
    const database = await getDb();
    await database.execute(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
       VALUES ('site_content', ?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)`,
      [JSON.stringify(updatedContent), newUpdatedAt]
    );
  } catch (dbErr) {
    console.warn("[ContentRoute] Error persisting content to database:", dbErr);
  }

  return res.status(200).json({
    success: true,
    data: updatedContent,
  });
});

// POST /api/content/reset
router.post("/reset", async (req: Request, res: Response) => {
  writePersistedContent(DEFAULT_SITE_CONTENT);

  try {
    const database = await getDb();
    await database.execute(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at) 
       VALUES ('site_content', ?, ?) 
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)`,
      [JSON.stringify(DEFAULT_SITE_CONTENT), Date.now()]
    );
  } catch (dbErr) {
    console.warn("[ContentRoute] Error resetting content in database:", dbErr);
  }

  return res.status(200).json({
    success: true,
    data: DEFAULT_SITE_CONTENT,
  });
});

export default router;
