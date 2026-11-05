export function FloatingWhatsApp() {
  const whatsappUrl =
    "https://wa.me/919940135700?text=Hi%20Padmanabha%20Fabrics%2C%20I%20would%20like%20to%20enquire%20about%20your%20products.";

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative flex items-center justify-center size-13 md:size-14 rounded-full bg-[#25D366] text-white shadow-[0_4px_18px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.65)] hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        {/* Subtle pulsating animation ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none group-hover:opacity-0"
          aria-hidden="true"
        />

        {/* Official WhatsApp Logo SVG */}
        <svg
          viewBox="0 0 24 24"
          className="size-7 md:size-8 fill-current relative z-10"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.477-.15-.678.15-.2.301-.778.979-.954 1.18-.175.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.488-.893-.796-1.496-1.78-1.672-2.08-.176-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.587-.494-.508-.678-.517-.176-.01-.376-.01-.577-.01s-.527.075-.803.376c-.276.301-1.054 1.03-1.054 2.511s1.079 2.912 1.23 3.113c.15.201 2.124 3.242 5.145 4.547.719.31 1.28.496 1.718.636.722.23 1.378.197 1.9.12.58-.087 1.78-.727 2.032-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.2-.577-.35zM12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.435 5.172L2 22l4.957-1.301A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.174c-1.597 0-3.084-.46-4.348-1.258l-.312-.195-2.937.771.784-2.862-.213-.339A8.136 8.136 0 0 1 3.826 12c0-4.507 3.667-8.174 8.174-8.174 4.507 0 8.174 3.667 8.174 8.174 0 4.507-3.667 8.174-8.174 8.174z" />
        </svg>

        {/* Hover Tooltip (Desktop) */}
        <span className="hidden md:group-hover:flex items-center absolute right-full mr-3.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-medium tracking-wide whitespace-nowrap shadow-xl pointer-events-none transition-all">
          Chat on WhatsApp
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#111111]" />
        </span>
      </a>
    </aside>
  );
}
