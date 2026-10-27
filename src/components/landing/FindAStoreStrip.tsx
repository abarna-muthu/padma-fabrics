import { MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "./Button";

export function FindAStoreStrip() {
  return (
    <div className="w-full bg-[#FAF6EE] min-h-[100px] border-t-2 border-[#D0202B] border-b border-[#E8C77A] relative overflow-hidden select-none py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        {/* LEFT = Red map-pin icon + red UPPERCASE bold 15px "FIND A STORE NEAR YOU" */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#D0202B]/10 flex items-center justify-center shrink-0">
            <MapPin className="size-5 text-[#D0202B]" />
          </div>
          <div>
            <h3 className="font-['Poppins'] font-bold text-[15px] uppercase tracking-[0.08em] text-[#D0202B]">
              FIND A STORE NEAR YOU
            </h3>
            <p className="text-[11px] text-[#777777] hidden sm:block">
              Visit our Flagship Textile Showroom at Menambedu, Ambattur, Chennai
            </p>
          </div>
        </div>

        {/* CENTER-RIGHT = Solid red rectangular button "VIEW STORES" (~190x44, white UPPERCASE 12px) */}
        <div>
          <Link to="/contact">
            <Button
              variant="primary"
              className="w-[190px] h-[44px] text-[12px] font-bold"
            >
              VIEW STORES
            </Button>
          </Link>
        </div>
      </div>

      {/* FAR RIGHT = Large faint gold outlined monogram watermark (~160px, 20% opacity, cropped at the edge) */}
      <div
        className="absolute -right-6 -bottom-10 pointer-events-none select-none opacity-20"
        aria-hidden="true"
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#C9922B"
          strokeWidth="4"
        >
          <rect x="10" y="10" width="80" height="80" rx="8" />
          <path d="M35 75 V25 H55 C65 25 65 50 55 50 H35" />
        </svg>
      </div>
    </div>
  );
}
