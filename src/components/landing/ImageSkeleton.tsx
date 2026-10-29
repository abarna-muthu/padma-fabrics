import { useState, useEffect, useRef } from "react";

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
  loading = "eager",
  style,
  ...props
}: ImageSkeletonProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    if (
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth > 0 &&
      (imgRef.current.currentSrc === src || imgRef.current.src.includes(src))
    ) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#EDEDED] rounded-[inherit] isolate ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#EDEDED] animate-pulse rounded-[inherit] pointer-events-none z-[1]" />
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            if (src.startsWith("http")) {
              setCurrentSrc("/placeholder.svg");
            } else {
              const filename = src.split("/").pop()?.split("?")[0];
              if (filename && !filename.includes("placeholder")) {
                const baseName = filename.replace(/-[A-Za-z0-9_-]{8,}\.(jpg|png|webp|svg)$/, ".$1");
                setCurrentSrc(`/assets/${baseName}`);
              } else {
                setCurrentSrc("/placeholder.svg");
              }
            }
          } else {
            setIsLoaded(true);
          }
        }}
        style={{
          objectPosition: style?.objectPosition || "top center",
          ...style,
        }}
        className={`w-full h-full object-cover transition-opacity duration-300 rounded-[inherit] ${
          isLoaded ? "opacity-100" : "opacity-90"
        }`}
        {...props}
      />
    </div>
  );
}
