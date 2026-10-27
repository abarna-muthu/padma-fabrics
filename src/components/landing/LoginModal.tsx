import { X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "./Button";
import { useEffect } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white p-6 rounded-[14px] shadow-2xl text-center font-['Poppins']"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 text-[#777777] hover:text-[#111111] p-1 cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <h3 className="text-[18px] font-bold text-[#111111] mb-2">
          Please Login
        </h3>
        <p className="text-[13px] text-[#555555] mb-6">
          This feature requires you to log in first. Unlock personalized recommendations, order tracking, and member-exclusive offers.
        </p>

        <Link to="/login" onClick={onClose} className="block">
          <Button variant="primary" fullWidth>
            LOGIN / REGISTER
          </Button>
        </Link>
      </div>
    </div>
  );
}
