import { type ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  subtitle?: ReactNode;
}

export function SectionTitle({
  children,
  icon,
  className = "",
  subtitle,
}: SectionTitleProps) {
  return (
    <div className={`text-center mb-7 ${className}`}>
      <h2 className="font-['Poppins'] font-bold uppercase text-[18px] md:text-[24px] lg:text-[26px] text-[#111111] tracking-[0.04em] inline-flex items-center justify-center gap-2">
        <span>{children}</span>
        {icon}
      </h2>
      {subtitle && (
        <div className="mt-1 text-[12px] md:text-[13px] text-[#777777] font-normal tracking-normal max-w-xl mx-auto">
          {subtitle}
        </div>
      )}
    </div>
  );
}
