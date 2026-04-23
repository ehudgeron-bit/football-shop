"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  url: string;
  altText: string | null;
  position: number;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-12 bg-surface-secondary text-6xl">
        ⚽
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-12 bg-surface-secondary">
        <Image
          src={active.url}
          alt={active.altText ?? productName}
          fill
          priority
          sizes="(max-width: 960px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-8 border-2 transition-colors ${
                i === activeIndex
                  ? "border-brand-primary"
                  : "border-transparent hover:border-surface-tertiary"
              }`}
              aria-label={`תמונה ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `תמונה ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
