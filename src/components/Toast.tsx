import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";

export const Toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      className: "border border-[#8A9A7B]/40 bg-[#FAF6EE] text-[#2A2A2A] shadow-md",
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      className: "border border-rose-300 bg-white text-rose-900 shadow-md",
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      className: "border border-[#B8913A]/40 bg-[#FAF6EE] text-[#2A2A2A] shadow-md",
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      className: "border border-amber-300 bg-[#FAF6EE] text-amber-950 shadow-md",
    });
  },
  custom: sonnerToast,
};

export { SonnerToaster as Toaster };
export default Toast;
