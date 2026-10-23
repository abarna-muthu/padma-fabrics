import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export interface CategoryCardProps {
  number: string;
  name: string;
  count?: string;
  image: string;
  slug: string;
  onClick?: () => void;
}

export function CategoryCard({ number, name, count, image, slug, onClick }: CategoryCardProps) {
  return (
    <Link
      to="/shop"
      onClick={onClick}
      className="group relative aspect-3/4 w-full rounded-[2px] overflow-hidden bg-[#EBE6DC] border border-[rgba(14,14,14,0.08)] block select-none"
    >
      {/* Photo with subtle slow hover zoom (700ms, scale-104) */}
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-104"
      />

      {/* Dark gradient overlay at bottom only */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

      {/* Number Top-Right */}
      <div className="absolute top-4 right-4 z-10">
        <span className="font-mono text-xs font-medium text-white/90 tracking-wider">
          {number}
        </span>
      </div>

      {/* Name and "Shop Now →" Bottom-Left */}
      <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
        <h3 className="font-['Manrope'] text-xl sm:text-2xl font-medium tracking-tight leading-snug">
          {name}
        </h3>
        {count && (
          <span className="text-[11px] font-light text-white/70 block mt-0.5 tracking-wide">
            {count}
          </span>
        )}
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-medium text-[#B8913A] group-hover:text-white transition-colors">
          <span>Shop Now</span>
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;
