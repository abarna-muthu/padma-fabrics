import { useState } from "react";
import { X, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

interface PincodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onPincodeChange: (pin: string) => void;
}

export function PincodeModal({
  isOpen,
  onClose,
  currentPincode,
  onPincodeChange,
}: PincodeModalProps) {
  const [pinInput, setPinInput] = useState(currentPincode || "");
  const [result, setResult] = useState<{
    valid: boolean;
    city?: string;
    estimate?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setResult({ valid: false });
      return;
    }

    onPincodeChange(cleanPin);
    try {
      localStorage.setItem("pf_user_pincode", cleanPin);
    } catch {}

    // Estimation logic
    const firstDigit = cleanPin[0];
    let city = "Tamil Nadu & South Zone";
    let estimate = "Delivered within 2 - 3 Business Days";

    if (firstDigit === "6") {
      city = "Chennai & Tamil Nadu Metro";
      estimate = "Express 1 - 2 Business Days";
    } else if (firstDigit === "5") {
      city = "Andhra Pradesh / Telangana / Karnataka";
      estimate = "Delivered within 2 - 3 Business Days";
    } else {
      city = "All India Standard Delivery";
      estimate = "Delivered within 4 - 5 Business Days";
    }

    setResult({ valid: true, city, estimate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-[#0E0E0E] shadow-2xl border border-[#EBE6DC] space-y-4 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="size-4.5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-[#FAF6EE] text-[#9F160A] flex items-center justify-center shrink-0">
            <MapPin className="size-4.5" />
          </div>
          <div>
            <h3 className="font-['Cormorant_Garamond'] text-xl font-bold text-[#0E0E0E]">
              Check Delivery Pincode
            </h3>
            <p className="text-[11px] text-[#5C5549]">
              Enter your 6-digit PIN to check delivery speed & availability
            </p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="space-y-3 pt-1">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value.replace(/\D/g, ""));
                setResult(null);
              }}
              placeholder="e.g. 600053"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DAC4] text-sm tracking-wider font-mono focus:outline-none focus:border-[#9F160A] focus:ring-1 focus:ring-[#9F160A]"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-md bg-[#9F160A] hover:bg-[#7D1107] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Check
            </button>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                result.valid
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {result.valid ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900">{result.city}</p>
                    <p className="text-[11px] mt-0.5 text-emerald-800">{result.estimate}</p>
                    <p className="text-[10px] text-emerald-700 mt-1">Cash on Delivery & Prepaid Available</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Invalid Pincode</p>
                    <p className="text-[11px] mt-0.5">Please enter a valid 6-digit Indian Postal Code.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </form>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#5C5549] hover:text-[#0E0E0E] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default PincodeModal;
