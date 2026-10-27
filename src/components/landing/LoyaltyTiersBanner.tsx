import { Link } from "@tanstack/react-router";

export function LoyaltyTiersBanner() {
  const coins = [
    { label: "Platinum", color: "from-slate-200 to-slate-400", border: "border-slate-300", text: "text-slate-800" },
    { label: "Gold", color: "from-amber-200 to-amber-500", border: "border-amber-300", text: "text-amber-950" },
    { label: "Silver", color: "from-gray-100 to-gray-300", border: "border-gray-200", text: "text-gray-800" },
    { label: "Bronze", color: "from-orange-200 to-orange-400", border: "border-orange-300", text: "text-orange-950" },
  ];

  return (
    <Link
      to="/login"
      aria-label="Explore Loyalty Tiers"
      className="block w-full min-h-[170px] bg-gradient-to-r from-[#FBF6EE] via-[#F5EAD4] to-[#EBD7AF] border-y border-[#E6E6E6] relative overflow-hidden select-none hover:opacity-98 transition-opacity"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 h-full flex flex-col md:flex-row items-center justify-between gap-6">
        {/* LEFT ~30%: 4 Overlapping circular coin images (64px, shadow) */}
        <div className="w-full md:w-[30%] flex flex-col items-center md:items-start order-2 md:order-1">
          <div className="flex items-center -space-x-3">
            {coins.map((coin, idx) => (
              <div
                key={idx}
                className={`size-[56px] sm:size-[64px] rounded-full bg-gradient-to-br ${coin.color} border-2 ${coin.border} shadow-md flex items-center justify-center font-['Poppins'] font-bold text-[9px] uppercase tracking-wider ${coin.text} transition-transform hover:-translate-y-1`}
              >
                {coin.label}
              </div>
            ))}
          </div>
          <span className="font-['Poppins'] text-[10px] md:text-[11px] font-bold tracking-[0.14em] uppercase text-[#D0202B] mt-2.5">
            MORE REWARDS. MORE YOU.
          </span>
        </div>

        {/* CENTER ~40%: Heavy UPPERCASE gold-gradient "THE LOYALTY TIERS" ~34px */}
        <div className="w-full md:w-[40%] text-center order-1 md:order-2 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-[1px] w-6 bg-[#C9922B]" />
            <span className="font-['Poppins'] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9922B]">
              LEVEL UP YOUR SAVINGS
            </span>
            <span className="h-[1px] w-6 bg-[#C9922B]" />
          </div>

          <h3 className="font-['Poppins'] font-extrabold text-[26px] sm:text-[32px] md:text-[34px] uppercase tracking-[0.05em] leading-none bg-gradient-to-r from-[#9F160A] via-[#D0202B] to-[#C9922B] bg-clip-text text-transparent">
            THE LOYALTY TIERS
          </h3>
          <p className="font-['Cormorant_Garamond'] italic text-[20px] sm:text-[24px] text-[#222222] font-medium leading-none mt-1">
            are here!
          </p>
        </div>

        {/* RIGHT ~25%: Red gift-box illustration (inline SVG) with gold ribbon */}
        <div className="w-full md:w-[25%] flex items-center justify-center md:justify-end order-3">
          <div className="relative group">
            {/* Inline SVG Gift Box */}
            <svg
              className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg transform rotate-6 transition-transform group-hover:rotate-12 duration-300"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Box Base */}
              <rect x="20" y="38" width="60" height="50" rx="3" fill="#D0202B" />
              {/* Box Lid */}
              <rect x="15" y="28" width="70" height="14" rx="2" fill="#B01721" />
              {/* Vertical Gold Ribbon */}
              <rect x="44" y="28" width="12" height="60" fill="#E8C77A" />
              {/* Horizontal Gold Ribbon */}
              <rect x="20" y="58" width="60" height="10" fill="#E8C77A" />
              {/* Bow Left */}
              <ellipse cx="38" cy="22" rx="12" ry="7" fill="#E8C77A" transform="rotate(-25 38 22)" />
              {/* Bow Right */}
              <ellipse cx="62" cy="22" rx="12" ry="7" fill="#E8C77A" transform="rotate(25 62 22)" />
              {/* Bow Center Knot with Monogram */}
              <circle cx="50" cy="24" r="6" fill="#C9922B" />
              <text x="50" y="27" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                P
              </text>
            </svg>

            {/* Sparkles */}
            <span className="absolute -top-1 -left-2 text-amber-400 text-sm animate-pulse">✦</span>
            <span className="absolute -bottom-1 -right-2 text-amber-500 text-xs animate-pulse delay-150">✧</span>
            <span className="absolute top-2 right-0 text-amber-300 text-base animate-pulse delay-300">✦</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
