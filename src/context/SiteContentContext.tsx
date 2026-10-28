import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { contentApi } from "@/lib/api";

export interface HeroBannerSlide {
  id: string | number;
  image: string;
  alt: string;
  href: string;
}

export interface PopularCategoryItem {
  id: string;
  title: string;
  image: string;
  href?: string;
}

export interface BestsellerCategoryTabItem {
  id: string;
  label: string;
  image: string;
  categoryKey?: string;
}

export interface HomeContent {
  announcementText: string;
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBottomText: string;
  whyChooseTitle: string;
  whyChooseDesc: string;
  inspirationTitle: string;
  inspirationDesc: string;
  heroBanners?: HeroBannerSlide[];
  popularCategories?: PopularCategoryItem[];
  bestsellerTabs?: BestsellerCategoryTabItem[];
}

export interface AboutContent {
  headerKicker: string;
  headerTitle: string;
  headerDesc: string;
  storyKicker: string;
  storyTitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storeAddressNote: string;
}

export interface ContactContent {
  headerKicker: string;
  headerTitle: string;
  headerDesc: string;
  showroomName: string;
  showroomAddress: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  businessScope: string;
  mapsUrl: string;
}

export interface SiteContent {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  updatedAt?: number;
}

export const DEFAULT_HERO_BANNERS: HeroBannerSlide[] = [
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
];

export const DEFAULT_POPULAR_CATEGORIES: PopularCategoryItem[] = [
  {
    id: "saree",
    title: "SAREE",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=Saree",
  },
  {
    id: "chudithar",
    title: "CHUDITHAR",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792662337/padma_products/lb5ccdoexcapbuhze89r.jpg",
    href: "/shop?category=Chudithar",
  },
  {
    id: "coordset",
    title: "COORDSET",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792659785/padma_products/ikle3vv4bhgmbv1aj3pu.jpg",
    href: "/shop?category=Coordset",
  },
  {
    id: "maxi",
    title: "MAXI",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=Maxi",
  },
  {
    id: "nighty",
    title: "NIGHTY",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=Nighty",
  },
  {
    id: "chudithar-top",
    title: "CHUDITHAR TOP",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
    href: "/shop?category=Chudithar Top",
  },
  {
    id: "2piece",
    title: "2 PIECE",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792647721/padma_products/xkgskhhlfb7jhekh9rq6.jpg",
    href: "/shop?category=2piece",
  },
  {
    id: "combo-dresses",
    title: "COMBO DRESSES",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
    href: "/shop?category=Combo Dresses",
  },
  {
    id: "palazzo",
    title: "PALAZZO",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792664369/padma_products/nb32h1yqb7bhl2xuvsr5.jpg",
    href: "/shop?category=palazzo",
  },
];

export const DEFAULT_BESTSELLER_TABS: BestsellerCategoryTabItem[] = [
  {
    id: "chudithar-top",
    label: "CHUDITHAR TOP",
    categoryKey: "Chudithar Top",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
  },
  {
    id: "palazzo",
    label: "PALAZZO",
    categoryKey: "palazzo",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792664369/padma_products/nb32h1yqb7bhl2xuvsr5.jpg",
  },
  {
    id: "coordset",
    label: "COORDSET",
    categoryKey: "Coordset",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792659785/padma_products/ikle3vv4bhgmbv1aj3pu.jpg",
  },
  {
    id: "2piece",
    label: "2 PIECE",
    categoryKey: "2piece",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792647721/padma_products/xkgskhhlfb7jhekh9rq6.jpg",
  },
  {
    id: "chudithar",
    label: "CHUDITHAR",
    categoryKey: "Chudithar",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792662337/padma_products/lb5ccdoexcapbuhze89r.jpg",
  },
  {
    id: "saree",
    label: "SAREE",
    categoryKey: "Saree",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "maxi",
    label: "MAXI",
    categoryKey: "Maxi",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "nighty",
    label: "NIGHTY",
    categoryKey: "Nighty",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "western-top",
    label: "WESTERN TOP",
    categoryKey: "Western Top",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1792584958/padma_products/v9quby0cest8zrupfzqc.jpg",
  },
  {
    id: "combo-dresses",
    label: "COMBO DRESSES",
    categoryKey: "Combo Dresses",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
  },
];

const DEFAULT_HOME_CONTENT: HomeContent = {
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
  heroBanners: DEFAULT_HERO_BANNERS,
  popularCategories: DEFAULT_POPULAR_CATEGORIES,
  bestsellerTabs: DEFAULT_BESTSELLER_TABS,
};

const DEFAULT_ABOUT_CONTENT: AboutContent = {
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
};

const DEFAULT_CONTACT_CONTENT: ContactContent = {
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
};

interface SiteContentContextType {
  content: SiteContent;
  updateHomeContent: (updates: Partial<HomeContent>) => void;
  updateAboutContent: (updates: Partial<AboutContent>) => void;
  updateContactContent: (updates: Partial<ContactContent>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = "pf_site_content_v1";

const SiteContentContext = createContext<SiteContentContextType | null>(null);

const mergeHomeContent = (rawHome: any): HomeContent => {
  return {
    ...DEFAULT_HOME_CONTENT,
    ...(rawHome || {}),
    heroBanners:
      Array.isArray(rawHome?.heroBanners) && rawHome.heroBanners.length > 0
        ? rawHome.heroBanners
        : DEFAULT_HERO_BANNERS,
    popularCategories:
      Array.isArray(rawHome?.popularCategories) && rawHome.popularCategories.length > 0
        ? rawHome.popularCategories
        : DEFAULT_POPULAR_CATEGORIES,
    bestsellerTabs:
      Array.isArray(rawHome?.bestsellerTabs) && rawHome.bestsellerTabs.length > 0
        ? rawHome.bestsellerTabs
        : DEFAULT_BESTSELLER_TABS,
  };
};

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>({
    home: DEFAULT_HOME_CONTENT,
    about: DEFAULT_ABOUT_CONTENT,
    contact: DEFAULT_CONTACT_CONTENT,
  });

  // Load saved content from localStorage and server API
  useEffect(() => {
    if (typeof window === "undefined") return;

    let localUpdatedAt = 0;
    let localSavedParsed: any = null;

    // 1. Initial immediate load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        localSavedParsed = parsed;
        localUpdatedAt = parsed.updatedAt || 0;
        setContent({
          home: mergeHomeContent(parsed.home),
          about: { ...DEFAULT_ABOUT_CONTENT, ...(parsed.about || {}) },
          contact: { ...DEFAULT_CONTACT_CONTENT, ...(parsed.contact || {}) },
          updatedAt: localUpdatedAt,
        });
      }
    } catch (err) {
      console.warn("Failed to load site content from localStorage:", err);
    }

    // 2. Fetch server persisted content
    contentApi
      .get()
      .then((res) => {
        if (res.success && res.data) {
          const serverUpdatedAt = res.data.updatedAt || 0;

          // If local has newer edits that haven't synced to server yet, push local to server!
          if (localUpdatedAt > 0 && serverUpdatedAt < localUpdatedAt && localSavedParsed) {
            contentApi.update(localSavedParsed).catch(() => {});
            return;
          }

          setContent({
            home: mergeHomeContent(res.data.home),
            about: { ...DEFAULT_ABOUT_CONTENT, ...(res.data.about || {}) },
            contact: { ...DEFAULT_CONTACT_CONTENT, ...(res.data.contact || {}) },
            updatedAt: serverUpdatedAt,
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        }
      })
      .catch(() => {
        // Backend offline or fallback to localStorage
      });

    // 3. Listen for changes in other open tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setContent({
            home: mergeHomeContent(parsed.home),
            about: { ...DEFAULT_ABOUT_CONTENT, ...(parsed.about || {}) },
            contact: { ...DEFAULT_CONTACT_CONTENT, ...(parsed.contact || {}) },
            updatedAt: parsed.updatedAt,
          });
        } catch (err) {}
      }
    };

    // 4. Custom event for instantaneous updates in same window
    const handleCustom = (e: any) => {
      if (e.detail) {
        setContent({
          home: mergeHomeContent(e.detail.home),
          about: { ...DEFAULT_ABOUT_CONTENT, ...(e.detail.about || {}) },
          contact: { ...DEFAULT_CONTACT_CONTENT, ...(e.detail.contact || {}) },
          updatedAt: e.detail.updatedAt,
        });
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pf_site_content_updated", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pf_site_content_updated", handleCustom);
    };
  }, []);

  const saveContent = (updater: (prev: SiteContent) => SiteContent) => {
    setContent((prev) => {
      const updated = {
        ...updater(prev),
        updatedAt: Date.now(),
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent("pf_site_content_updated", { detail: updated }));
          window.dispatchEvent(new Event("storage"));
        } catch (err) {
          console.warn("Could not save to localStorage:", err);
        }
      }
      // Sync to backend database API
      contentApi.update(updated).catch((err) => {
        console.warn("Could not sync content to backend API:", err);
      });
      return updated;
    });
  };

  const updateHomeContent = (updates: Partial<HomeContent>) => {
    saveContent((prev) => ({
      ...prev,
      home: { ...prev.home, ...updates },
    }));
  };

  const updateAboutContent = (updates: Partial<AboutContent>) => {
    saveContent((prev) => ({
      ...prev,
      about: { ...prev.about, ...updates },
    }));
  };

  const updateContactContent = (updates: Partial<ContactContent>) => {
    saveContent((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...updates },
    }));
  };

  const resetToDefaults = () => {
    saveContent(() => ({
      home: DEFAULT_HOME_CONTENT,
      about: DEFAULT_ABOUT_CONTENT,
      contact: DEFAULT_CONTACT_CONTENT,
    }));
    contentApi.reset().catch(() => {});
  };

  return (
    <SiteContentContext.Provider
      value={{
        content,
        updateHomeContent,
        updateAboutContent,
        updateContactContent,
        resetToDefaults,
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a SiteContentProvider");
  }
  return context;
}
