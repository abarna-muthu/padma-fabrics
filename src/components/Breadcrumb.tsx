import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-[#5C5549] dark:text-[#B5AC9E] ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-[#D15608] dark:hover:text-[#EDBC3D] transition-colors"
            title="Home"
          >
            <Home className="size-3.5 text-[#D15608]" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 text-[#D15608]/60 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-[#D15608] dark:text-[#FAF6EE] max-w-[180px] sm:max-w-xs truncate">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href as any}
                  className="hover:text-[#D15608] dark:hover:text-[#EDBC3D] transition-colors max-w-[140px] truncate"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
