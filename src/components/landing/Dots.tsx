interface DotsProps {
  count: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
  className?: string;
}

export function Dots({ count, activeIndex, onSelect, className = "" }: DotsProps) {
  if (count <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect?.(i)}
          aria-label={`Go to slide ${i + 1}`}
          className={`size-[7px] rounded-full transition-all duration-300 cursor-pointer ${
            i === activeIndex
              ? "bg-[#D0202B] scale-110"
              : "bg-[#CFCFCF] hover:bg-[#999999]"
          }`}
        />
      ))}
    </div>
  );
}
