import { Link } from "@tanstack/react-router";
import { SectionTitle } from "./SectionTitle";
import { ImageSkeleton } from "./ImageSkeleton";

interface Article {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "How to Style Ethnic Co-ord Sets for Women: 10 Summer Looks",
    date: "MAY 13, 2026",
    excerpt:
      "Discover how to style ethnic co-ord sets for women this summer. Explore 10 kurta-pant co-ord sets with fabric tips, occasion styling, and price points from Rs. 3,799.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&q=80",
  },
  {
    id: 2,
    title: "What to Wear for Haldi, Mehndi & Sangeet: A Complete Guide",
    date: "MAY 12, 2026",
    excerpt:
      "Discover what to wear for Haldi, Mehndi & Sangeet ceremonies in India. Shop yellow Haldi kurtas, green Mehndi sets & sequined Sangeet anarkalis.",
    image: "https://images.unsplash.com/photo-1596783049586-e414c54b2a84?w=700&q=80",
  },
  {
    id: 3,
    title: "Summer Ethnic Wear for Women: Complete Styling Guide 2026",
    date: "MAY 11, 2026",
    excerpt:
      "A complete 2026 styling guide for summer ethnic wear. Learn which fabrics, colors, and silhouettes keep you cool, plus occasion-based outfit ideas.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=80",
  },
];

export function TrendJournal() {
  return (
    <section className="relative block w-full bg-white py-12 md:py-16 px-4 select-none clear-both overflow-hidden">
      <SectionTitle>TREND JOURNAL</SectionTitle>

      {/* 3-column grid, 24px gap (2 columns tablet, 1 mobile), no borders */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ARTICLES.map((art) => (
          <article key={art.id} className="flex flex-col text-left group">
            {/* Landscape Image (~3:2, ~460x260, skeleton) */}
            <div className="w-full aspect-[3/2] overflow-hidden rounded-[14px] bg-[#EDEDED] mb-3 isolate">
              <div className="w-full h-full transition-transform duration-300 group-hover:scale-105 rounded-[inherit]">
                <ImageSkeleton
                  src={art.image}
                  alt={art.title}
                  aspectRatio="3/2"
                  className="w-full h-full rounded-[inherit]"
                />
              </div>
            </div>

            {/* Tiny UPPERCASE muted date */}
            <span className="font-['Poppins'] text-[10px] font-bold uppercase tracking-[0.12em] text-[#999999] mb-1">
              {art.date}
            </span>

            {/* Bold 13px title clamped to 1 line */}
            <h3 className="font-['Poppins'] font-bold text-[13px] text-[#111111] line-clamp-1 group-hover:text-[#D0202B] transition-colors mb-1.5">
              {art.title}
            </h3>

            {/* 3-line grey 12px excerpt */}
            <p className="font-['Poppins'] text-[12px] text-[#666666] line-clamp-3 leading-relaxed mb-2.5">
              {art.excerpt}
            </p>

            {/* Red "Read more" link (underline on hover) */}
            <Link
              to="/about"
              className="font-['Poppins'] text-[12px] font-semibold text-[#D0202B] hover:underline inline-flex items-center gap-1"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
