interface BadgeProps {
  label: string;
  variant?: "red" | "dark" | "gold";
  className?: string;
}

export function Badge({ label, variant = "red", className = "" }: BadgeProps) {
  let variantStyles = "bg-[#D0202B] text-white";
  if (variant === "dark") {
    variantStyles = "bg-[#111111] text-white";
  } else if (variant === "gold") {
    variantStyles = "bg-[#C9922B] text-white";
  }

  return (
    <span
      className={`inline-block px-1.5 py-0.5 rounded-[5px] font-['Poppins'] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.06em] leading-tight select-none ${variantStyles} ${className}`}
    >
      {label}
    </span>
  );
}
