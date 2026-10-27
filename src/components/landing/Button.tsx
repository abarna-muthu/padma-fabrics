import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "hero" | "outline" | "ghost";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      fullWidth = false,
      className = "",
      ...props
    },
    ref
  ) => {
    let baseStyles =
      "inline-flex items-center justify-center font-['Poppins'] text-[12px] font-semibold uppercase tracking-[0.1em] h-[40px] md:h-[44px] px-6 rounded-[2px] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

    let variantStyles = "";
    if (variant === "primary") {
      variantStyles = "bg-[#D0202B] hover:bg-[#b01721] text-white shadow-xs active:scale-[0.99]";
    } else if (variant === "hero") {
      variantStyles =
        "border border-white bg-black/35 hover:bg-black/60 text-white backdrop-blur-xs active:scale-[0.99]";
    } else if (variant === "outline") {
      variantStyles =
        "border border-[#D0202B] text-[#D0202B] hover:bg-[#D0202B] hover:text-white active:scale-[0.99]";
    } else if (variant === "ghost") {
      variantStyles = "text-[#111111] hover:text-[#D0202B] hover:bg-black/5";
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "LandingButton";
