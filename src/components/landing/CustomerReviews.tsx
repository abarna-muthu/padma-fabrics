import { useState } from "react";
import { SectionTitle } from "./SectionTitle";
import { CarouselShell } from "./CarouselShell";

interface Review {
  id: number;
  text: string;
  name: string;
  city: string;
  initial: string;
  avatarColor: string;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    text: "Very nice looking awesome",
    name: "BHAVYA",
    city: "Bangalore",
    initial: "B",
    avatarColor: "bg-fuchsia-600",
  },
  {
    id: 2,
    text: "Very comfortable top - if there were more colours in the same top, I would definitely buy",
    name: "PUNITA",
    city: "Mumbai",
    initial: "P",
    avatarColor: "bg-pink-600",
  },
  {
    id: 3,
    text: "Such a beautiful dress loved it.",
    name: "LAVANYA",
    city: "Delhi",
    initial: "L",
    avatarColor: "bg-rose-600",
  },
  {
    id: 4,
    text: "Purchased this kurta & it's perfect for Summers light breezy & lovely print.",
    name: "RAKSHA",
    city: "Bangalore",
    initial: "R",
    avatarColor: "bg-purple-600",
  },
  {
    id: 5,
    text: "It's so comfortable and I just loved the color.. so bright and beautiful!",
    name: "AKANKSHA",
    city: "Delhi",
    initial: "A",
    avatarColor: "bg-pink-700",
  },
];

export function CustomerReviews() {
  const [activeDot, setActiveDot] = useState(2); // 3rd active by default per spec

  return (
    <section className="w-full bg-white py-12 md:py-16 px-4 select-none">
      <SectionTitle>CUSTOMER REVIEWS</SectionTitle>

      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Carousel with 3 visible BLACK rounded cards (radius 12-14px, bg #0B0B0B, ~430x270, 16px gap, 28px padding) */}
        <CarouselShell
          showArrows={true}
          showDots={true}
          dotsCount={5}
          activeDotIndex={activeDot}
          onDotSelect={setActiveDot}
          ariaLabel="Customer Reviews Carousel"
        >
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="w-[300px] sm:w-[380px] md:w-[410px] lg:w-[430px] min-h-[270px] shrink-0 snap-start mr-4 bg-[#0B0B0B] text-white rounded-[16px] p-[28px] flex flex-col justify-between shadow-xl relative"
            >
              {/* Top Row: Large white opening quote mark + 5 small white stars */}
              <div className="flex items-center justify-between">
                <span className="font-serif text-[42px] leading-none text-white/90 select-none">
                  “
                </span>
                <div className="flex items-center gap-1 text-white text-[12px]">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>

              {/* Middle: white semibold 20-22px review text (max 4 lines) */}
              <p className="font-['Poppins'] font-semibold text-[17px] sm:text-[20px] md:text-[21px] text-white/95 leading-[1.3] line-clamp-4 my-auto">
                {rev.text}
              </p>

              {/* Bottom: 28px pink/magenta circular avatar with white initial + UPPERCASE bold white 12px name + small grey city */}
              <div className="flex items-center gap-3 pt-3">
                <div
                  className={`size-[28px] rounded-full ${rev.avatarColor} text-white font-bold text-[12px] flex items-center justify-center shrink-0`}
                >
                  {rev.initial}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['Poppins'] font-bold text-[12px] uppercase text-white tracking-[0.06em]">
                    {rev.name}
                  </span>
                  <span className="text-[11px] text-[#888888]">
                    , {rev.city}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CarouselShell>
      </div>
    </section>
  );
}
