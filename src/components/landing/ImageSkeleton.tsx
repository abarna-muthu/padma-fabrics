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
  loading = "eager",
  style,
  ...props
}: ImageSkeletonProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#EDEDED] rounded-[inherit] isolate ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        src={currentSrc || "/placeholder.svg"}
        alt={alt || "Product image"}
        loading={loading}
        decoding="async"
        onError={() => {
          if (!hasError) {
            setHasError(true);
            if (src && src.startsWith("http")) {
              setCurrentSrc("/placeholder.svg");
            } else {
              const filename = src ? src.split("/").pop()?.split("?")[0] : "";
              if (filename && !filename.includes("placeholder")) {
                const baseName = filename.replace(/-[A-Za-z0-9_-]{8,}\.(jpg|png|webp|svg)$/, ".$1");
                setCurrentSrc(`/assets/${baseName}`);
              } else {
                setCurrentSrc("/placeholder.svg");
              }
            }
          }
        }}
        style={{
          objectPosition: style?.objectPosition || "top center",
          ...style,
        }}
        className="w-full h-full object-cover rounded-[inherit] block opacity-100"
        {...props}
      />
    </div>
  );
}
