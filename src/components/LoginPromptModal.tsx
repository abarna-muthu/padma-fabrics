import { useState, useEffect } from "react";
import { X, Lock, Heart, ShoppingBag, Bell, ArrowRight } from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useStore } from "@/context/StoreContext";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionText?: string;
  actionType?: "wishlist" | "cart" | "notify" | "account";
}

export function LoginPromptModal({
  isOpen,
  onClose,
  actionText = "Please login to your Padmanabha Fabrics account to continue.",
  actionType = "account",
}: LoginPromptModalProps) {
  const { isLoggedIn } = useCustomerAuth();
  const { setIsCustomerPortalOpen } = useStore();

  useEffect(() => {
    if (isLoggedIn && isOpen) {
      onClose();
    }
  }, [isLoggedIn, isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenLogin = () => {
    onClose();
    setIsCustomerPortalOpen(true);
  };

  const getIcon = () => {
    switch (actionType) {
      case "wishlist":
        return <Heart className="size-7 text-[#9F160A] fill-[#9F160A]/10" />;
      case "cart":
        return <ShoppingBag className="size-7 text-[#9F160A]" />;
      case "notify":
        return <Bell className="size-7 text-[#9F160A]" />;
      default:
        return <Lock className="size-7 text-[#9F160A]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-[#0E0E0E] shadow-2xl border border-[#EBE6DC] text-center space-y-4 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-4.5" />
        </button>

        <div className="size-14 rounded-full bg-[#FAF6EE] border border-[#EBE6DC] flex items-center justify-center mx-auto">
          {getIcon()}
        </div>

        <div>
          <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0E0E0E]">
            Sign in to Continue
          </h3>
          <p className="text-xs text-[#5C5549] mt-1.5 leading-relaxed">
            {actionText}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleOpenLogin}
            className="w-full py-2.5 rounded-lg bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Log In / Register</span>
            <ArrowRight className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-[#5C5549] hover:text-[#0E0E0E] transition-colors cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPromptModal;
