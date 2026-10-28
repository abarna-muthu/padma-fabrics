import burgundy from "@/assets/burgundy-silk.jpg";
import sage from "@/assets/sage-fabric.jpg";
import ivory from "@/assets/ivory-brocade.jpg";
import hero from "@/assets/fabric-hero.jpg";
import shirt from "@/assets/mens-shirt.jpg";
import tee from "@/assets/tshirt.jpg";
import dress from "@/assets/womens-dress.jpg";
import kids from "@/assets/kids-dress.jpg";
import fallbackProductsRaw from "@/data/fallbackProducts.json";

export const ALL = "All";
export const categories = [
  ALL,
  "Saree",
  "Chudithar",
  "Coordset",
  "Maxi",
  "Nighty",
  "Chudithar Top",
  "2piece",
  "Combo Dresses",
  "palazzo",
  "Western Top",
] as const;

export const collections = [
  { name: "Saree", text: "Silk & handloom drapes", image: burgundy },
  { name: "Chudithar", text: "Elegant ethnic suits", image: dress },
  { name: "Coordset", text: "Modern stylish coordinates", image: sage },
  { name: "Maxi", text: "Graceful flowy silhouettes", image: hero },
  { name: "Nighty", text: "Pure comfort & soft cotton", image: ivory },
  { name: "Chudithar Top", text: "Everyday festive tunics", image: shirt },
  { name: "2piece", text: "Chic two-piece ensembles", image: tee },
  { name: "Combo Dresses", text: "Special curated sets", image: kids },
  { name: "Western Top", text: "Chic contemporary tops", image: shirt },
] as const;

export type ProductVariant = {
  id?: string;
  colour: string;
  colourHex?: string;
  price?: number;
  originalPrice?: number;
  stock?: number;
  sizes?: string[];
  sizeStock?: Record<string, number>;
  image?: string;
  images?: string[];
  imageUrl?: string;
  sku?: string;
};

export const COMMON_COLOUR_MAP: Record<string, string> = {
  "rani pink": "#D81B60",
  "teal blue": "#008080",
  "dusty pink": "#DCAE96",
  "mustard yellow": "#E1AD01",
  "bottle green": "#004225",
  "rust brown": "#8B3103",
  "lavender purple": "#967BB6",
  "wine red": "#722F37",
  "wine": "#722F37",
  "navy blue": "#000080",
  "royal blue": "#4169E1",
  "maroon": "#800000",
  "olive green": "#556B2F",
  "coral": "#FF7F50",
  "peach": "#FFE5B4",
  "emerald green": "#50C878",
  "golden yellow": "#EDBC3D",
  "deep red": "#9F160A",
  "black": "#1A1A1A",
  "white": "#FFFFFF",
  "cream": "#FAF6EE",
  "beige": "#F5F5DC",
  "grey": "#808080",
};

export function getColourHex(colourName: string = "", customHex?: string): string {
  if (customHex && /^#([0-9A-F]{3}){1,2}$/i.test(customHex)) {
    return customHex;
  }
  const clean = colourName.toLowerCase().trim();
  if (COMMON_COLOUR_MAP[clean]) {
    return COMMON_COLOUR_MAP[clean]!;
  }
  for (const [key, val] of Object.entries(COMMON_COLOUR_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }
  return "#D15608";
}

export type Item = {
  id: string;
  name: string;
  category: string;
  colour: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  variants?: ProductVariant[];
  badge: string;
  description: string;
  unit: string;
  sizes?: readonly string[];
  stock: number;
  sizeStock?: Record<string, number>;
  status: "active" | "inactive" | "archived";
  isActive?: boolean;
  sku?: string;
  updatedAt?: string;
};

export const CLOTHING_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"] as const;
const adult = CLOTHING_SIZES;
const child = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"] as const;

export function cleanSizes(raw: any, category?: string, description?: string): string[] {
  let list: string[] = [];
  if (Array.isArray(raw)) {
    list = raw.map((s) => String(s).trim());
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed.map((s) => String(s).trim());
    } catch {}
    if (list.length === 0 && raw.includes(",")) {
      list = raw.split(",").map((s) => s.trim());
    } else if (list.length === 0 && raw.trim()) {
      list = [raw.trim()];
    }
  }

  // Filter out invalid items like "1", "0", numbers
  const valid = list
    .filter((s) => s && s !== "1" && s !== "0" && !/^\d+$/.test(s))
    .map((s) => (s.toUpperCase() === "XXL" ? "2XL" : s));

  if (valid.length > 0) {
    return Array.from(new Set(valid));
  }

  // Try extracting from description: e.g. "Sizes Available: XL, XXL"
  if (description) {
    const match = description.match(/Sizes?\s*Available\s*:\s*([^.\n]+)/i);
    if (match && match[1]) {
      const extracted = match[1]
        .split(/[,/]/)
        .map((s) => s.trim().toUpperCase())
        .map((s) => (s === "XXL" ? "2XL" : s))
        .filter((s) => ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "FREE SIZE"].includes(s) || /^[A-Z0-9-]+$/.test(s));
      if (extracted.length > 0) {
        return Array.from(new Set(extracted));
      }
    }
  }

  if (category === "Saree") return ["Free Size"];
  return ["S", "M", "L", "XL", "2XL"];
}

const realCatalogProducts: Item[] = (fallbackProductsRaw as any[]).map((p) => ({
  id: String(p.id),
  name: p.name,
  category: p.category || "Chudithar Top",
  colour: p.colour || "Custom",
  price: Number(p.price) || 0,
  image: p.image || p.imageUrl || p.image_url || "/placeholder.svg",
  badge: p.badge || "New arrival",
  description: p.description || "",
  unit: p.unit || "piece",
  stock: Number(p.stock !== undefined ? p.stock : p.stockQuantity || p.stock_quantity) || 10,
  status: (p.status === "inactive" || p.isActive === false ? "inactive" : "active") as "active" | "inactive",
  sku: p.sku || `PF-${p.id}`,
  sizes: cleanSizes(p.sizes, p.category, p.description),
  images: Array.isArray(p.images)
    ? p.images
    : (p.imageUrl || p.image_url || p.image ? [p.imageUrl || p.image_url || p.image] : []),
  variants: Array.isArray(p.variants)
    ? p.variants
    : typeof p.variants === "string"
      ? (() => {
          try {
            return JSON.parse(p.variants);
          } catch {
            return [];
          }
        })()
      : [],
  isActive: p.isActive !== false,
}));

export const products: readonly Item[] = realCatalogProducts;

export type Product = Item;
export type BagItem = { id: string; quantity: number };

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  colour?: string;
  size?: string;
  image?: string;
};

export type Order = {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  createdAt?: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  totalAmount?: number;
  shippingFee?: number;
  discountAmount?: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  orderStatus?: string;
  paymentMethod?: string;
  paymentStatus: "Paid" | "Pending" | "Failed";
  shippingAddress: string;
  notes?: string;
  deliveryDays?: number; // e.g. 5 or 6 days
  manualStatusOverride?: boolean;
  courierName?: string;
  trackingNumber?: string;
};

export type StockLog = {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason: string;
  date: string;
};

export const initialOrders: Order[] = [
  {
    id: "PF-1081",
    customerName: "Kavitha Natarajan",
    customerEmail: "kavitha.n@gmail.com",
    customerPhone: "+91 98401 22819",
    date: "2026-10-14",
    deliveryDays: 5,
    items: [
      {
        productId: "heritage-silk",
        productName: "The Heritage Silk Saree",
        quantity: 1,
        unit: "piece",
        price: 5450,
      },
    ],
    total: 5450,
    status: "Delivered",
    paymentStatus: "Paid",
    shippingAddress: "Flat 4B, Lotus Apartments, Anna Nagar, Chennai – 600040",
  },
  {
    id: "PF-1082",
    customerName: "Sundaramurthy Textiles",
    customerEmail: "contact@smtextiles.co.in",
    customerPhone: "+91 94440 98112",
    date: "2026-10-15",
    deliveryDays: 6,
    items: [
      {
        productId: "ivory-brocade",
        productName: "The Ivory Floral Brocade",
        quantity: 10,
        unit: "metre",
        price: 980,
      },
      {
        productId: "sage-cotton",
        productName: "The Sage Buti Cotton",
        quantity: 12,
        unit: "metre",
        price: 650,
      },
    ],
    total: 17600,
    status: "Processing",
    paymentStatus: "Paid",
    shippingAddress: "Boutique #12, Commercial Road, T. Nagar, Chennai – 600017",
    notes: "Wholesale sample consignment for festive window display.",
  },
  {
    id: "PF-1083",
    customerName: "Dr. Ananya Rao",
    customerEmail: "ananya.rao@yahoo.com",
    customerPhone: "+91 97890 33451",
    date: "2026-10-15",
    deliveryDays: 5,
    items: [
      {
        productId: "linen-shirt",
        productName: "The Classic Linen Shirt",
        quantity: 2,
        unit: "piece",
        price: 1499,
      },
      {
        productId: "navy-tee",
        productName: "The Everyday Cotton Tee",
        quantity: 1,
        unit: "piece",
        price: 599,
      },
    ],
    total: 3597,
    status: "Shipped",
    paymentStatus: "Paid",
    shippingAddress: "Villa 8, Orchid Enclave, ECR, Injambakkam, Chennai – 600115",
  },
  {
    id: "PF-1084",
    customerName: "Rajesh Sivasankaran",
    customerEmail: "rajesh.siva@outlook.com",
    customerPhone: "+91 99620 44102",
    date: "2026-10-15",
    deliveryDays: 5,
    items: [
      {
        productId: "wine-silk",
        productName: "The Wine Zari Silk Saree",
        quantity: 1,
        unit: "piece",
        price: 4250,
      },
    ],
    total: 4250,
    status: "Pending",
    paymentStatus: "Pending",
    shippingAddress: "Door 22, 3rd Cross Street, Velachery, Chennai – 600042",
    notes: "Customer awaiting confirmation on delivery timeframe.",
  },
  {
    id: "PF-1085",
    customerName: "Priya Balakrishnan",
    customerEmail: "priya.bala@gmail.com",
    customerPhone: "+91 98840 77123",
    date: "2026-10-13",
    deliveryDays: 6,
    items: [
      {
        productId: "maroon-anarkali",
        productName: "The Maroon Anarkali Dress",
        quantity: 1,
        unit: "piece",
        price: 3299,
      },
    ],
    total: 3299,
    status: "Cancelled",
    paymentStatus: "Failed",
    shippingAddress: "14/2 Gandhi Road, Adyar, Chennai – 600020",
    notes: "Payment gateway timeout; order marked cancelled.",
  },
];

export const initialStockLogs: StockLog[] = [
  {
    id: "LOG-001",
    productId: "ivory-brocade",
    productName: "The Ivory Floral Brocade",
    previousStock: 15,
    newStock: 25,
    change: 10,
    reason: "New roll delivery received from weaving loom",
    date: "2026-10-12",
  },
  {
    id: "LOG-002",
    productId: "maroon-anarkali",
    productName: "The Maroon Anarkali Dress",
    previousStock: 3,
    newStock: 2,
    change: -1,
    reason: "Stock audit discrepancy correction",
    date: "2026-10-14",
  },
];

export const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export function bagTotal(bag: BagItem[], currentProducts: Product[] = products as Product[]) {
  return bag.reduce(
    (sum, item) =>
      sum + (currentProducts.find((p) => p.id === item.id)?.price ?? 0) * item.quantity,
    0,
  );
}
