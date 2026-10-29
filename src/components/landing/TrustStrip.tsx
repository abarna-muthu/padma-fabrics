export function TrustStrip() {
  const pillars = [
    {
      title: "Free Shipping",
      subtext: "On all orders",
      icon: (
        <svg
          className="size-7 stroke-[#D0202B]"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
      ),
    },
    {
      title: "Easy Returns",
      subtext: "Free returns until 7 days of delivery",
      icon: (
        <svg
          className="size-7 stroke-[#D0202B]"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      ),
    },
    {
      title: "Secure Payments",
      subtext: "Safe & hassle free checkout",
      icon: (
        <svg
          className="size-7 stroke-[#D0202B]"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-[#FAF6EE]/80 border-b border-[#E6E6E6] py-6 sm:py-8 select-none">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4 max-w-[290px] sm:max-w-[320px] md:max-w-none mx-auto">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-start md:justify-center gap-3.5 text-left"
            >
              <div className="shrink-0 size-8 flex items-center justify-center">{p.icon}</div>
              <div>
                <h4 className="font-['Poppins'] font-bold text-[13px] sm:text-[14px] text-[#111111] leading-tight">
                  {p.title}
                </h4>
                <p className="font-['Poppins'] text-[11px] sm:text-[12px] text-[#777777] mt-0.5">
                  {p.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
