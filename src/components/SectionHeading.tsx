import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MicroLabel } from "./MicroLabel";
import { ArrowRight } from "lucide-react";

export interface SectionHeadingProps {
  label?: string | undefined;
  kicker?: string | undefined;
  number?: string | undefined;
  title: string;
  italicPhrase?: string | undefined;
  description?: string | undefined;
  linkText?: string | undefined;
  linkHref?: string | undefined;
  light?: boolean | undefined;
  align?: "left" | "center" | "right" | undefined;
  actionHref?: string | undefined;
  actionText?: string | undefined;
  actionNode?: ReactNode | undefined;
  className?: string | undefined;
  children?: ReactNode | undefined;
}

export function SectionHeading({
  label,
  kicker,
  number,
  title,
  italicPhrase,
  description,
  linkText,
  linkHref,
  light = false,
  align = "left",
  actionHref,
  actionText,
  actionNode,
  className = "",
  children,
}: SectionHeadingProps) {
  const displayLabel = label || kicker;
  const href = linkHref || actionHref;
  const text = linkText || actionText;

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 ${className}`}>
      <div className="max-w-2xl">
        {displayLabel && (
          <MicroLabel number={number} light={light} className="mb-3">
            {displayLabel}
          </MicroLabel>
        )}
        <h2
          className={`font-['Manrope'] text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight leading-[1.08] ${
            light ? "text-[#F4F0E8]" : "text-[#0E0E0E]"
          }`}
        >
          {title}{" "}
          {italicPhrase && (
            <span className="font-['Cormorant_Garamond'] italic font-light text-opacity-90 tracking-normal block sm:inline">
              {italicPhrase}
            </span>
          )}
        </h2>
        {description && (
          <p
            className={`mt-3.5 text-sm sm:text-[15px] font-light leading-relaxed max-w-xl ${
              light ? "text-[#F4F0E8]/70" : "text-[#0E0E0E]/70"
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {(href && text) || children || actionNode ? (
        <div className="shrink-0 pt-2 md:pt-0">
          {actionNode ? (
            actionNode
          ) : children ? (
            children
          ) : (
            <Link
              to={href as any}
              className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium transition-all group pb-1 border-b ${
                light
                  ? "text-[#F4F0E8] border-[rgba(244,240,232,0.3)] hover:border-[#B8913A] hover:text-[#B8913A]"
                  : "text-[#0E0E0E] border-[rgba(14,14,14,0.25)] hover:border-[#B8913A] hover:text-[#B8913A]"
              }`}
            >
              <span>{text}</span>
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default SectionHeading;
