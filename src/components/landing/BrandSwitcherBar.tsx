import { useState } from "react";

export function BrandSwitcherBar() {
  const [activeBrand, setActiveBrand] = useState("BRAND");

  const brands = [
    { id: "BRAND", name: "PADMANABHA", isPrimary: true },
    { id: "aurelia", name: "AURELIA-LIKE", tint: "bg-[#FFF9F0]" },
    { id: "wishful", name: "WISHFUL-LIKE", tint: "bg-white" },
    { id: "elleven", name: "ELLEVEN-LIKE", tint: "bg-white" },
  ];

  return (
    <div className="w-full h-[28px] border-b border-[#E6E6E6] bg-white flex items-center select-none z-50 relative font-['Poppins']">
      <div className="grid grid-cols-4 w-full h-full text-center divide-x divide-[#E6E6E6]">
        {brands.map((b) => {
          const isActive = activeBrand === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBrand(b.id)}
              className={`h-full flex items-center justify-center text-[11px] md:text-[12px] font-bold tracking-[0.06em] transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#D0202B] text-white"
                  : `${b.tint || "bg-white"} text-[#222222] hover:text-[#D0202B]`
              }`}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
