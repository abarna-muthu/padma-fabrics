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
  "Sarees",
  "Fabrics",
  "Shirts",
  "T-Shirts",
  "Women's Dresses",
  "Kids Wear",
] as const;

export const collections = [
  { name: "Sarees", text: "Silk & handloom drapes", image: burgundy },
  { name: "Shirts", text: "Crisp linen & cotton", image: shirt },
  { name: "T-Shirts", text: "Easy everyday comfort", image: tee },
  { name: "Women's Dresses", text: "Festive & daily wear", image: dress },
  { name: "Kids Wear", text: "Little celebrations", image: kids },
  { name: "Fabrics", text: "Beautiful by the metre", image: ivory },
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
    category: "Sarees",
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
    category: "Sarees",
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
    name: "The Sage Buti Cotton",
    category: "Fabrics",
    colour: "Sage green",
    price: 650,
    image: sage,
    badge: "Everyday",
    unit: "metre",
    stock: 4, // low stock alert!
    status: "active",
    sku: "PF-FAB-001",
    description: "A soft sage palette with delicate woven motifs and a subtle golden border.",
  },
  {
    id: "ivory-brocade",
    name: "The Ivory Floral Brocade",
    category: "Fabrics",
    colour: "Ivory & gold",
    price: 980,
    image: ivory,
    badge: "Occasion edit",
    unit: "metre",
    stock: 25,
    status: "active",
    sku: "PF-FAB-002",
    description:
      "An intricate floral pattern in ivory and gold, with a beautifully textured finish.",
  },
  {
    id: "linen-shirt",
    name: "The Classic Linen Shirt",
    category: "Shirts",
    colour: "Pure white",
    price: 1499,
    image: shirt,
    badge: "Men",
    unit: "piece",
    sizes: adult,
    stock: 18,
    status: "active",
    sku: "PF-SHT-001",
    description: "A breathable linen-cotton formal shirt with a clean, slim fit.",
  },
  {
    id: "navy-tee",
    name: "The Everyday Cotton Tee",
    category: "T-Shirts",
    colour: "Navy blue",
    price: 599,
    image: tee,
    badge: "Best seller",
    unit: "piece",
    sizes: adult,
    stock: 35,
    status: "active",
    sku: "PF-TEE-001",
    description: "Soft combed-cotton crew neck T-shirt for all-day comfort.",
  },
  {
    id: "maroon-anarkali",
    name: "The Maroon Anarkali Dress",
    category: "Women's Dresses",
    colour: "Maroon & gold",
    price: 3299,
    image: dress,
    badge: "Women",
    unit: "piece",
    sizes: adult,
    stock: 2, // low stock alert!
    status: "active",
    sku: "PF-DRS-001",
    description: "A flowing anarkali with gold embroidery and a matching dupatta.",
  },
  {
    id: "pattu-pavadai",
    name: "The Little Pattu Pavadai",
    category: "Kids Wear",
    colour: "Mustard & green",
    price: 1899,
    image: kids,
    badge: "Kids",
    unit: "piece",
    sizes: child,
    stock: 11,
    status: "active",
    sku: "PF-KID-001",
    description: "A traditional silk pavadai set with a peacock zari border.",
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
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
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
