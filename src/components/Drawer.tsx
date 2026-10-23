import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  position?: "right" | "left" | "bottom";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  position = "right",
  children,
  footer,
  className = "",
}: DrawerProps) {
  if (!isOpen) return null;

  const positionClasses = {
    right: "inset-y-0 right-0 max-w-md w-full animate-in slide-in-from-right duration-300 border-l",
    left: "inset-y-0 left-0 max-w-md w-full animate-in slide-in-from-left duration-300 border-r",
    bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full animate-in slide-in-from-bottom duration-300 border-t rounded-t-xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed bg-[#FAF6EE] dark:bg-[#1C1819] border-[#B8913A]/30 text-[#2A2A2A] dark:text-[#FAF6EE] shadow-2xl flex flex-col z-50 ${positionClasses[position]} ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(Boolean(title) || Boolean(onClose)) && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#B8913A]/25">
            <div>
              {title && (
                <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#6B1E2E] dark:text-[#FAF6EE]">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#5C5549] dark:text-[#B5AC9E] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-8 hover:bg-[#B8913A]/10 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              aria-label="Close drawer"
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-[#B8913A]/25 bg-[#FAF6EE]/90 dark:bg-[#1C1819]/90">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}

export default Drawer;
