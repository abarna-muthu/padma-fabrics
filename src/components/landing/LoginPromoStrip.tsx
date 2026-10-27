import { useCustomerAuth } from "@/context/CustomerAuthContext";

interface LoginPromoStripProps {
  onOpenLogin: () => void;
}

export function LoginPromoStrip({ onOpenLogin }: LoginPromoStripProps) {
  const { isLoggedIn } = useCustomerAuth();

  if (isLoggedIn) return null;

  return (
    <div
      onClick={onOpenLogin}
      className="w-full h-[32px] bg-[#D0202B] text-white flex items-center justify-center cursor-pointer select-none relative z-40 hover:bg-[#b01721] transition-colors"
    >
      <p className="font-['Poppins'] text-[13px] font-medium tracking-[0.02em] text-center">
        Login to unlock discounts!
      </p>
    </div>
  );
}
