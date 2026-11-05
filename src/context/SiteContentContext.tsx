import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { contentApi } from "@/lib/api";

// Bundled high-res category imagery for authentic instant defaults
import sareeImg from "@/assets/silk-sarees-category.jpg";
import chuditharImg from "@/assets/chudithar-ensembles-category.jpg";
import coordsetImg from "@/assets/artisanal-coordsets-category.jpg";
import maxiImg from "@/assets/flowing-maxis-category.jpg";
import comboDressesImg from "@/assets/girls-party-frock.jpg";

export interface HeroBannerSlide {
  id: string | number;
  image: string; // Desktop Image (horizontal, 1920x800)
  desktopImage?: string; // Desktop Image alias
  mobileImage?: string; // Mobile Image (vertical, 1080x1350, 4:5 ratio)
  alt: string;
  href: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
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
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793339639/padma_banners/lxa5slzsltdjsufz3ihk.jpg",
    desktopImage: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793339639/padma_banners/lxa5slzsltdjsufz3ihk.jpg",
    mobileImage: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793601959/padma_banners/w0i1cra7fhpvwmrjuw6d.jpg",
    alt: "Padmanabha Fabrics - Timeless Elegance in Every Thread, Premium Sarees",
    href: "/shop",
    title: "",
    subtitle: "",
    buttonText: "",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793339404/padma_banners/noygpkbnsv0mwzlthjia.jpg",
    desktopImage: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793339404/padma_banners/noygpkbnsv0mwzlthjia.jpg",
    mobileImage: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793601969/padma_banners/sgy8luit0xj8wpxqlbf2.jpg",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Explore Collection",
    href: "/shop",
    title: "",
    subtitle: "",
    buttonText: "",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793339651/padma_banners/a8jq6ydq0qtsm8k3aa3y.jpg",
    desktopImage: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793339651/padma_banners/a8jq6ydq0qtsm8k3aa3y.jpg",
    mobileImage: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793601978/padma_banners/le45tyymfeykd90im4hv.jpg",
    alt: "Padmanabha Fabrics - Timeless Ethnic Elegance, Style Woven With Tradition",
    href: "/shop",
    title: "",
    subtitle: "",
    buttonText: "",
  },
];

export const DEFAULT_POPULAR_CATEGORIES: PopularCategoryItem[] = [
  {
    id: "saree",
    title: "SAREE",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793193144/padma_categories/h2rgzjwbgvbeax1g73wj.jpg",
    href: "/shop?category=Saree",
  },
  {
    id: "chudithar",
    title: "CHUDITHAR",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793598567/padma_categories/w1oqrtckuala2yotiwes.jpg",
    href: "/shop?category=Chudithar",
  },
  {
    id: "coordset",
    title: "COORDSET",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793193561/padma_categories/e6bjdubl2esoft73bdte.jpg",
    href: "/shop?category=Coordset",
  },
  {
    id: "maxi",
    title: "MAXI",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793193691/padma_categories/opvxrl5pd10gld0ijlgi.jpg",
    href: "/shop?category=Maxi",
  },
  {
    id: "nighty",
    title: "NIGHTY",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793601217/padma_categories/kgyjuuufjgwjtmvmrfy3.jpg",
    href: "/shop?category=Nighty",
  },
  {
    id: "chudithar-top",
    title: "CHUDITHAR TOP",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793599986/padma_categories/s7gjfipsvicjrc9bdqk3.jpg",
    href: "/shop?category=Chudithar Top",
  },
  {
    id: "2piece",
    title: "2 PIECE",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793194171/padma_categories/pj0efo2ggd9pqgsc3wvf.jpg",
    href: "/shop?category=2piece",
  },
  {
    id: "combo-dresses",
    title: "COMBO DRESSES",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793194442/padma_categories/tgrcd657czfnhlu2tcfq.jpg",
    href: "/shop?category=Combo Dresses",
  },
  {
    id: "palazzo",
    title: "PALAZZO",
    image: "https://res.cloudinary.com/ugzb1wup/image/upload/v1793609595/padma_categories/wnkcygsgyybcjdjackhx.jpg",
    href: "/shop?category=palazzo",
  },
];

export const DEFAULT_BESTSELLER_TABS: BestsellerCategoryTabItem[] = [
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
];

const DEFAULT_HOME_CONTENT: HomeContent = {
  announcementText: "Beautiful fabrics. Beyond borders. | Wholesale and Retail",
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

const sanitizeHeroBanners = (banners: any[]): HeroBannerSlide[] => {
  if (!Array.isArray(banners) || banners.length === 0) return DEFAULT_HERO_BANNERS;
  return banners.map((b, idx) => {
    const fallbackBanner = DEFAULT_HERO_BANNERS[idx] || DEFAULT_HERO_BANNERS[0];
    const isOldLocalBanner = (url?: string) =>
      !url ||
      url.includes("/hero-banner-") ||
      url.includes("hero-banner-3") ||
      url.startsWith("/assets/");

    const desktopImg = isOldLocalBanner(b.desktopImage || b.image)
      ? fallbackBanner.desktopImage
      : (b.desktopImage || b.image);

    const mobImg =
      typeof b.mobileImage === "string" && !isOldLocalBanner(b.mobileImage) && b.mobileImage !== "/hero-banner-mobile.jpg"
        ? b.mobileImage
        : (fallbackBanner.mobileImage || desktopImg);

    return {
      id: b.id || fallbackBanner.id || `banner-${idx + 1}`,
      image: desktopImg,
      desktopImage: desktopImg,
      mobileImage: mobImg,
      alt: b.alt || fallbackBanner.alt || "Padmanabha Fabrics Banner",
      href: b.href || "/shop",
      title: b.title || "",
      subtitle: b.subtitle || "",
      buttonText: b.buttonText || "",
    };
  });
};

const sanitizeAnnouncementText = (text: any): string => {
  if (typeof text !== "string" || !text.trim()) {
    return DEFAULT_HOME_CONTENT.announcementText;
  }
  if (text.includes("Import & Export") || text.includes("Retail · Wholesale")) {
    return DEFAULT_HOME_CONTENT.announcementText;
  }
  return text.trim();
};

const mergeHomeContent = (rawHome: any): HomeContent => {
  return {
    ...DEFAULT_HOME_CONTENT,
    ...(rawHome || {}),
    announcementText: sanitizeAnnouncementText(rawHome?.announcementText),
    heroBanners:
      Array.isArray(rawHome?.heroBanners) && rawHome.heroBanners.length > 0
        ? sanitizeHeroBanners(rawHome.heroBanners)
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
  const [content, setContent] = useState<SiteContent>(() => {
    const defaults: SiteContent = {
      home: DEFAULT_HOME_CONTENT,
      about: DEFAULT_ABOUT_CONTENT,
      contact: DEFAULT_CONTACT_CONTENT,
    };
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          home: mergeHomeContent(parsed.home),
          about: { ...DEFAULT_ABOUT_CONTENT, ...(parsed.about || {}) },
          contact: { ...DEFAULT_CONTACT_CONTENT, ...(parsed.contact || {}) },
          updatedAt: Number(parsed.updatedAt) || 0,
        };
      }
    } catch {}
    return defaults;
  });

  // Load saved content from localStorage and server API
  useEffect(() => {
    if (typeof window === "undefined") return;

    let localUpdatedAt = 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        localUpdatedAt = Number(parsed.updatedAt) || 0;
      }
    } catch {}

    let isFetching = false;

    // Fetch the latest content from the server API to ensure mobile & desktop stay synced
    const fetchLatestFromServer = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const res = await contentApi.get();
        if (res && res.success && res.data) {
          const serverUpdated = Number(res.data.updatedAt) || 0;

          // Check current local saved timestamp
          let currentLocalTime = localUpdatedAt;
          let currentSavedObj: any = null;
          let currentSavedStr: string | null = null;
          try {
            currentSavedStr = localStorage.getItem(STORAGE_KEY);
            if (currentSavedStr) {
              currentSavedObj = JSON.parse(currentSavedStr);
              currentLocalTime = Number(currentSavedObj.updatedAt) || 0;
            }
          } catch {}

          // If local has newer edits that haven't reached server yet, auto-sync to server
          if (currentLocalTime > serverUpdated && currentSavedObj) {
            try {
              await contentApi.update(currentSavedObj);
            } catch (syncErr) {
              console.warn("Failed to auto-sync local edits to server:", syncErr);
            }
          } else {
            const serverStr = JSON.stringify(res.data);
            const isContentDifferent = !currentSavedStr || currentSavedStr !== serverStr;

            if (isContentDifferent || !currentLocalTime) {
              localUpdatedAt = serverUpdated;
              setContent({
                home: mergeHomeContent(res.data.home),
                about: { ...DEFAULT_ABOUT_CONTENT, ...(res.data.about || {}) },
                contact: { ...DEFAULT_CONTACT_CONTENT, ...(res.data.contact || {}) },
                updatedAt: serverUpdated,
              });
              try {
                localStorage.setItem(STORAGE_KEY, serverStr);
              } catch {}
            }
          }
        }
      } catch (err) {
        // Network unavailable or offline
      } finally {
        isFetching = false;
      }
    };

    // Always fetch latest on initial load
    fetchLatestFromServer();

    // 3. Revalidate when tab becomes visible or focused (critical for mobile switches)
    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchLatestFromServer();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchLatestFromServer);

    // 4. Background polling (every 10 seconds) to keep mobile view automatically in sync with admin
    const pollInterval = window.setInterval(fetchLatestFromServer, 10000);

    // 5. Cross-tab storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          localUpdatedAt = Number(parsed.updatedAt) || Date.now();
          setContent({
            home: mergeHomeContent(parsed.home),
            about: { ...DEFAULT_ABOUT_CONTENT, ...(parsed.about || {}) },
            contact: { ...DEFAULT_CONTACT_CONTENT, ...(parsed.contact || {}) },
            updatedAt: localUpdatedAt,
          });
        } catch (err) {}
      }
    };

    // 6. Custom event in same window
    const handleCustom = (e: any) => {
      if (e.detail) {
        localUpdatedAt = Number(e.detail.updatedAt) || Date.now();
        setContent({
          home: mergeHomeContent(e.detail.home),
          about: { ...DEFAULT_ABOUT_CONTENT, ...(e.detail.about || {}) },
          contact: { ...DEFAULT_CONTACT_CONTENT, ...(e.detail.contact || {}) },
          updatedAt: localUpdatedAt,
        });
      }
    };

    // 7. BroadcastChannel for instant cross-tab & cross-window updates
    let broadcast: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        broadcast = new BroadcastChannel("pf_site_content_sync");
        broadcast.onmessage = (event) => {
          if (event.data) {
            localUpdatedAt = Number(event.data.updatedAt) || Date.now();
            setContent({
              home: mergeHomeContent(event.data.home),
              about: { ...DEFAULT_ABOUT_CONTENT, ...(event.data.about || {}) },
              contact: { ...DEFAULT_CONTACT_CONTENT, ...(event.data.contact || {}) },
              updatedAt: localUpdatedAt,
            });
          }
        };
      }
    } catch {}

    window.addEventListener("storage", handleStorage);
    window.addEventListener("pf_site_content_updated", handleCustom);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchLatestFromServer);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pf_site_content_updated", handleCustom);
      window.clearInterval(pollInterval);
      if (broadcast) {
        broadcast.close();
      }
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
          if (typeof BroadcastChannel !== "undefined") {
            try {
              const ch = new BroadcastChannel("pf_site_content_sync");
              ch.postMessage(updated);
              ch.close();
            } catch {}
          }
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
