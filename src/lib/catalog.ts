import burgundy from "@/assets/burgundy-silk.jpg";
import sage from "@/assets/sage-fabric.jpg";
import ivory from "@/assets/ivory-brocade.jpg";
import hero from "@/assets/fabric-hero.jpg";
import shirt from "@/assets/mens-shirt.jpg";
import tee from "@/assets/tshirt.jpg";
import dress from "@/assets/womens-dress.jpg";
import kids from "@/assets/kids-dress.jpg";

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
] as const;

export type Item = {
  id: string;
  name: string;
  category: (typeof categories)[number];
  colour: string;
  price: number;
  image: string;
  badge: string;
  description: string;
  unit: string;
  sizes?: readonly string[];
  stock: number;
  status: "active" | "inactive" | "archived";
  sku?: string;
  updatedAt?: string;
};

const adult = ["S", "M", "L", "XL", "XXL"] as const;
const child = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"] as const;

export const products: readonly Item[] = [
  {
    id: "wine-silk",
    name: "The Wine Zari Silk Saree",
    category: "Saree",
    colour: "Wine & antique gold",
    price: 4250,
    image: burgundy,
    badge: "Editor's pick",
    unit: "piece",
    stock: 14,
    status: "active",
    sku: "PF-SAR-001",
    description: "A rich wine palette and an ornate golden border, made for memorable occasions.",
  },
  {
    id: "heritage-silk",
    name: "The Heritage Silk Saree",
    category: "Saree",
    colour: "Burgundy & gold",
    price: 5450,
    image: hero,
    badge: "Signature",
    unit: "piece",
    stock: 8,
    status: "active",
    sku: "PF-SAR-002",
    description:
      "Dramatic burgundy folds and a detailed gold border in a timeless festive palette.",
  },
  {
    id: "sage-cotton",
    name: "The Sage Buti Coordset",
    category: "Coordset",
    colour: "Sage green",
    price: 1650,
    image: sage,
    badge: "Trending",
    unit: "piece",
    stock: 8,
    status: "active",
    sku: "PF-CRD-001",
    description: "A soft sage coordinates set with delicate woven patterns.",
  },
  {
    id: "ivory-brocade",
    name: "The Ivory Floral Maxi",
    category: "Maxi",
    colour: "Ivory & gold",
    price: 2450,
    image: ivory,
    badge: "Occasion edit",
    unit: "piece",
    stock: 15,
    status: "active",
    sku: "PF-MAX-001",
    description:
      "An intricate floral pattern in ivory and gold, with a beautifully textured flowing finish.",
  },
  {
    id: "linen-shirt",
    name: "The Classic Chudithar Top",
    category: "Chudithar Top",
    colour: "Pure white",
    price: 1499,
    image: shirt,
    badge: "Daily wear",
    unit: "piece",
    sizes: adult,
    stock: 18,
    status: "active",
    sku: "PF-CTP-001",
    description: "A breathable premium cotton chudithar top with fine tailored stitching.",
  },
  {
    id: "navy-tee",
    name: "The Everyday 2piece Set",
    category: "2piece",
    colour: "Navy blue",
    price: 1599,
    image: tee,
    badge: "Best seller",
    unit: "piece",
    sizes: adult,
    stock: 25,
    status: "active",
    sku: "PF-2PC-001",
    description: "Comfortable stylish 2-piece set for everyday modern elegance.",
  },
  {
    id: "maroon-anarkali",
    name: "The Maroon Chudithar Suit",
    category: "Chudithar",
    colour: "Maroon & gold",
    price: 3299,
    image: dress,
    badge: "Festive edit",
    unit: "piece",
    sizes: adult,
    stock: 6,
    status: "active",
    sku: "PF-CHU-001",
    description: "A flowing festive chudithar suit with gold embroidery and a matching dupatta.",
  },
  {
    id: "pattu-pavadai",
    name: "Celebration Combo Dresses Set",
    category: "Combo Dresses",
    colour: "Mustard & green",
    price: 2899,
    image: kids,
    badge: "Special Combo",
    unit: "piece",
    sizes: child,
    stock: 11,
    status: "active",
    sku: "PF-CMB-001",
    description: "Curated celebration combo dress pairing for festive and wedding seasons.",
  },
];

export type Product = Item;
export type BagItem = { id: string; quantity: number };

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
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
