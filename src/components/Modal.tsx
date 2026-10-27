import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  className = "",
}: ModalProps) {
  const maxWMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`bg-[#FAF6EE] dark:bg-[#1C1819] border border-[#D15608]/30 text-[#2A2A2A] dark:text-[#FAF6EE] rounded-lg shadow-2xl p-6 ${maxWMap[maxWidth]} ${className}`}
      >
        <DialogHeader className="border-b border-[#D15608]/20 pb-3">
          <DialogTitle className="font-['Playfair_Display'] text-xl font-bold text-[#9F160A] dark:text-[#FAF6EE]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-3 text-sm">{children}</div>

        {footer && <DialogFooter className="border-t border-[#D15608]/20 pt-3">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
