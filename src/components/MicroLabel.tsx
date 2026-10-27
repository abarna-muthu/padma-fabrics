import type { ReactNode } from "react";

export interface MicroLabelProps {
  children: ReactNode;
  number?: string | undefined;
  className?: string | undefined;
  light?: boolean | undefined;
}

export function MicroLabel({ children, number, className = "", light = false }: MicroLabelProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] ${
        light ? "text-[#F4F0E8]/70" : "text-[#0E0E0E]/70"
      } ${className}`}
    >
      {number && <span className="text-[#D15608] font-semibold tracking-normal">{number}</span>}
      {number && <span className="w-3 h-[1px] bg-current opacity-40 inline-block" />}
      <span>{children}</span>
    </div>
  );
}

export default MicroLabel;
