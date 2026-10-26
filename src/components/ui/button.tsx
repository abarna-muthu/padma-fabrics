import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-normal sm:whitespace-nowrap text-center text-xs font-medium uppercase tracking-[0.06em] sm:tracking-[0.12em] leading-tight cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 select-none touch-manipulation max-w-full active:scale-[0.99]",
  {
    variants: {
      variant: {
        // Primary solid dark/ink pill
        primary:
          "bg-[#0E0E0E] text-[#F4F0E8] hover:bg-[#2A2A2A] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent shadow-none hover:translate-y-[-1px]",
        // Primary solid ivory pill (for dark hero/sections)
        ivory:
          "bg-[#F4F0E8] text-[#0E0E0E] hover:bg-[#FFFFFF] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent shadow-none hover:translate-y-[-1px]",
        // Secondary outlined pill with arrow
        secondary:
          "bg-transparent text-inherit border border-current rounded-full px-4 sm:px-6 py-2.5 sm:py-3 hover:bg-black/5 dark:hover:bg-white/10 hover:translate-y-[-1px]",
        // Outlined pill with gold/wine accent
        outline:
          "bg-transparent border border-[rgba(14,14,14,0.2)] dark:border-[rgba(244,240,232,0.25)] rounded-full px-4 sm:px-5 py-2 sm:py-2.5 hover:border-[#B8913A] hover:text-[#B8913A]",
        // Pill filter chip
        filter:
          "rounded-full px-3.5 sm:px-4 py-1.5 text-[11px] tracking-wider whitespace-nowrap shrink-0 border border-[rgba(14,14,14,0.15)] dark:border-[rgba(244,240,232,0.2)] data-[active=true]:bg-[#0E0E0E] data-[active=true]:text-[#F4F0E8] dark:data-[active=true]:bg-[#F4F0E8] dark:data-[active=true]:text-[#0E0E0E] data-[active=true]:border-transparent transition-colors",
        ghost:
          "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 rounded-full px-3 py-2",
        link:
          "underline-offset-4 hover:underline p-0 h-auto tracking-[0.1em]",
        default:
          "bg-[#0E0E0E] text-[#F4F0E8] hover:bg-[#2A2A2A] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent",
        destructive:
          "bg-rose-900 text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5",
        editorial:
          "bg-[#0E0E0E] text-[#F4F0E8] dark:bg-[#F4F0E8] dark:text-[#0E0E0E] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 hover:opacity-90",
        gold:
          "bg-[#B8913A] text-[#0E0E0E] rounded-full px-4 sm:px-6 py-2.5 sm:py-3 font-semibold hover:bg-[#A07B28]",
        whatsapp:
          "bg-emerald-800 text-white rounded-full px-4 sm:px-5 py-2.5",
      },
      size: {
        default: "min-h-10 h-auto px-4 sm:px-6 py-2.5 text-xs",
        sm: "min-h-8 h-auto px-3 sm:px-4 py-1.5 text-[11px]",
        lg: "min-h-11 sm:min-h-12 h-auto px-4 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm",
        icon: "size-9 p-0 rounded-full shrink-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
