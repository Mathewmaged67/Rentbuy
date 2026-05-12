import headphones from "@/assets/p-headphones.jpg";
import camera from "@/assets/p-camera.jpg";
import drone from "@/assets/p-drone.jpg";
import watch from "@/assets/p-watch.jpg";
import laptop from "@/assets/p-laptop.jpg";
import speaker from "@/assets/p-speaker.jpg";
import vr from "@/assets/p-vr.jpg";
import console_ from "@/assets/p-console.jpg";

export type PurchaseMode = "buy" | "rent" | "both";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  brand: string;
  image: string;
  gallery: string[];
  price: number;
  rentPerDay: number;
  deposit: number;
  rating: number;
  reviews: number;
  mode: PurchaseMode;
  available: boolean;
  featured?: boolean;
  bestSelling?: boolean;
  isNew?: boolean;
  sellerId: string;
  sellerName: string;
}

export const CATEGORIES = [
  { slug: "audio", name: "Audio" },
  { slug: "cameras", name: "Cameras" },
  { slug: "drones", name: "Drones" },
  { slug: "wearables", name: "Wearables" },
  { slug: "computers", name: "Computers" },
  { slug: "gaming", name: "Gaming" },
  { slug: "vr", name: "VR & AR" },
];

export const PRODUCTS: Product[] = [
  {
    id: "p-001",
    name: "Aurora Pro Wireless Headphones",
    tagline: "Studio-grade ANC, 40h battery",
    description:
      "Reference-tuned drivers with adaptive noise cancellation. Spatial audio, multipoint Bluetooth, and a feather-light frame for all-day sessions.",
    category: "audio",
    brand: "Aurora",
    image: headphones,
    gallery: [headphones, headphones],
    price: 349,
    rentPerDay: 9,
    deposit: 80,
    rating: 4.8,
    reviews: 1248,
    mode: "both",
    available: true,
    featured: true,
    bestSelling: true,
    isNew: false,
    sellerId: "s-001",
    sellerName: "Aurora Audio Co.",
  },
  {
    id: "p-002",
    name: "Lumen X1 Mirrorless Camera",
    tagline: "26MP full-frame, 8K video",
    description:
      "Professional hybrid shooter built for travel and storytelling. In-body stabilization, weather sealing, and a stunning EVF.",
    category: "cameras",
    brand: "Lumen",
    image: camera,
    gallery: [camera],
    price: 1899,
    rentPerDay: 49,
    deposit: 400,
    rating: 4.9,
    reviews: 412,
    mode: "both",
    available: true,
    featured: true,
    isNew: true,
    sellerId: "s-002",
    sellerName: "Lumen Imaging",
  },
  {
    id: "p-003",
    name: "SkyHawk Mini Drone",
    tagline: "4K cinematic, 34min flight",
    description:
      "Compact, foldable drone with obstacle sensing and a 3-axis gimbal. Smart routes for cinematic capture in seconds.",
    category: "drones",
    brand: "SkyHawk",
    image: drone,
    gallery: [drone],
    price: 749,
    rentPerDay: 29,
    deposit: 200,
    rating: 4.6,
    reviews: 286,
    mode: "both",
    available: true,
    bestSelling: true,
    sellerId: "s-003",
    sellerName: "SkyHawk Aerials",
  },
  {
    id: "p-004",
    name: "Pulse Watch Series 5",
    tagline: "Health, fitness, focus",
    description:
      "Always-on retina display, ECG, blood-oxygen sensing, and 36h battery. Woven sport bands.",
    category: "wearables",
    brand: "Pulse",
    image: watch,
    gallery: [watch],
    price: 299,
    rentPerDay: 6,
    deposit: 60,
    rating: 4.5,
    reviews: 980,
    mode: "buy",
    available: true,
    isNew: true,
    sellerId: "s-004",
    sellerName: "Pulse Wear",
  },
  {
    id: "p-005",
    name: "Stratus Air 14",
    tagline: "Silent. Cool. Powerful.",
    description:
      "14-inch ultraportable with the new M-class chip. Fanless design, 22h battery, and a stunning XDR display.",
    category: "computers",
    brand: "Stratus",
    image: laptop,
    gallery: [laptop],
    price: 1499,
    rentPerDay: 39,
    deposit: 350,
    rating: 4.7,
    reviews: 524,
    mode: "both",
    available: true,
    featured: true,
    sellerId: "s-005",
    sellerName: "Stratus Computing",
  },
  {
    id: "p-006",
    name: "Boom Mini Bluetooth Speaker",
    tagline: "Big sound, tiny package",
    description:
      "360° sound with deep bass and 24h playback. Waterproof and ready to pair stereo with a friend.",
    category: "audio",
    brand: "Boom",
    image: speaker,
    gallery: [speaker],
    price: 129,
    rentPerDay: 4,
    deposit: 30,
    rating: 4.4,
    reviews: 1502,
    mode: "buy",
    available: true,
    bestSelling: true,
    sellerId: "s-001",
    sellerName: "Aurora Audio Co.",
  },
  {
    id: "p-007",
    name: "Mira VR Headset",
    tagline: "Cinematic immersive worlds",
    description:
      "Pancake lenses, 4K per eye, and full-room tracking. Comfortable for long sessions with adjustable IPD.",
    category: "vr",
    brand: "Mira",
    image: vr,
    gallery: [vr],
    price: 599,
    rentPerDay: 19,
    deposit: 150,
    rating: 4.6,
    reviews: 211,
    mode: "rent",
    available: true,
    isNew: true,
    sellerId: "s-006",
    sellerName: "Mira Reality",
  },
  {
    id: "p-008",
    name: "ArcadePro Console",
    tagline: "Next-gen gaming for everyone",
    description:
      "4K HDR gaming, ultra-fast SSD, and a controller redesigned around you. Pre-loaded with three blockbuster titles.",
    category: "gaming",
    brand: "Arcade",
    image: console_,
    gallery: [console_],
    price: 499,
    rentPerDay: 14,
    deposit: 120,
    rating: 4.7,
    reviews: 845,
    mode: "both",
    available: true,
    featured: true,
    bestSelling: true,
    sellerId: "s-007",
    sellerName: "Arcade Studios",
  },
];

/**
 * Find a product by ID.
 * Pass `products` from `state.products` to include backend-fetched products.
 * Falls back to the static PRODUCTS list if not found in the provided array.
 */
export function findProduct(id: string, products?: Product[]): Product | undefined {
  // Search the provided list first (e.g. live backend data in state.products)
  if (products) {
    const hit = products.find((p) => p.id === id);
    if (hit) return hit;
  }
  // Fall back to the bundled static list
  return PRODUCTS.find((p) => p.id === id);
}
