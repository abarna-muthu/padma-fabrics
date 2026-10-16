import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        editorial:
          "bg-gradient-to-r from-[#9B2242] via-[#8B1D36] to-[#731429] text-white shadow-md hover:shadow-lg hover:from-[#881A36] hover:to-[#5E0F21] active:scale-[0.98] border border-[#B32D50]/50 rounded-sm h-11 px-6 text-xs uppercase tracking-wider font-semibold transition-all duration-200",
        filter:
          "bg-background text-foreground/80 hover:text-[#9B2242] hover:bg-[#9B2242]/10 rounded-full border border-border data-[active=true]:border-[#9B2242] data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#9B2242] data-[active=true]:to-[#7A152E] data-[active=true]:text-white data-[active=true]:shadow-sm shadow-none text-xs px-4 py-1.5 font-medium transition-all",
        default:
          "bg-gradient-to-r from-[#9B2242] to-[#7B162E] text-white shadow hover:from-[#851933] hover:to-[#681125] hover:shadow-md font-medium rounded-sm transition-all",
        destructive:
          "bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-sm hover:from-rose-700 hover:to-red-800 font-medium rounded-sm transition-all",
        outline:
          "border-2 border-[#9B2242]/70 text-[#9B2242] bg-[#9B2242]/5 shadow-xs hover:bg-[#9B2242] hover:text-white hover:border-[#9B2242] font-medium rounded-sm transition-all",
        secondary:
          "bg-gradient-to-r from-amber-100 to-amber-200/90 text-amber-950 border border-amber-300 shadow-xs hover:from-amber-200 hover:to-amber-300 hover:text-amber-950 font-medium rounded-sm dark:from-amber-950/40 dark:to-amber-900/40 dark:text-amber-200 dark:border-amber-700/60",
        gold:
          "bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#A07810] text-slate-950 font-semibold shadow-md hover:from-[#C59B27] hover:to-[#8E6A0B] hover:text-white hover:shadow-lg transition-all rounded-sm",
        whatsapp:
          "bg-gradient-to-r from-[#25D366] to-[#1EBE5D] text-white font-semibold shadow-md hover:from-[#1EBE5D] hover:to-[#179B4A] hover:shadow-lg transition-all rounded-sm",
        ghost: "hover:bg-[#9B2242]/10 hover:text-[#9B2242] text-foreground transition-colors",
        link: "text-[#9B2242] underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
