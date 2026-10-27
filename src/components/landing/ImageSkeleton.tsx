import { useState, useEffect } from "react";

interface ImageSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g. "3/4", "1/1", "16/9"
}

export function ImageSkeleton({
  src,
  alt,
  className = "",
  aspectRatio,
  ...props
}: ImageSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#EDEDED] rounded-[inherit] isolate ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#EDEDED] animate-pulse rounded-[inherit]" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setCurrentSrc("/placeholder.svg");
          } else {
            setIsLoaded(true);
          }
        }}
        style={{ color: "transparent", fontSize: 0, ...(props.style || {}) }}
        className={`w-full h-full object-cover transition-opacity duration-300 rounded-[inherit] ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        {...props}
      />
    </div>
  );
}
