import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { contentApi } from "@/lib/api";

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
}

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

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>({
    home: DEFAULT_HOME_CONTENT,
    about: DEFAULT_ABOUT_CONTENT,
    contact: DEFAULT_CONTACT_CONTENT,
  });

  // Load saved content from localStorage and server API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial immediate load from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setContent({
          home: { ...DEFAULT_HOME_CONTENT, ...(parsed.home || {}) },
          about: { ...DEFAULT_ABOUT_CONTENT, ...(parsed.about || {}) },
          contact: { ...DEFAULT_CONTACT_CONTENT, ...(parsed.contact || {}) },
        });
      }
    } catch (err) {
      console.warn("Failed to load site content from localStorage:", err);
    }

    // 2. Fetch server persisted content
    contentApi.get().then((res) => {
      if (res.success && res.data) {
        setContent({
          home: { ...DEFAULT_HOME_CONTENT, ...(res.data.home || {}) },
          about: { ...DEFAULT_ABOUT_CONTENT, ...(res.data.about || {}) },
          contact: { ...DEFAULT_CONTACT_CONTENT, ...(res.data.contact || {}) },
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
      }
    }).catch(() => {
      // Backend offline or fallback to localStorage
    });

    // 3. Listen for changes in other open tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setContent({
            home: { ...DEFAULT_HOME_CONTENT, ...(parsed.home || {}) },
            about: { ...DEFAULT_ABOUT_CONTENT, ...(parsed.about || {}) },
            contact: { ...DEFAULT_CONTACT_CONTENT, ...(parsed.contact || {}) },
          });
        } catch (err) {}
      }
    };

    // 4. Custom event for instantaneous updates in same window
    const handleCustom = (e: any) => {
      if (e.detail) {
        setContent(e.detail);
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
      const updated = updater(prev);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent("pf_site_content_updated", { detail: updated }));
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
