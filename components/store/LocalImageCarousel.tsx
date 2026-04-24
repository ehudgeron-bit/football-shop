"use client";

import Image from "next/image";
import Link from "next/link";
import type { LocalImage } from "@/lib/local-images";

interface LocalImageCarouselProps {
  images: LocalImage[];
  title?: string;
  linkBase?: string;
}

export function LocalImageCarousel({ images, title, linkBase = "/products" }: LocalImageCarouselProps) {
  if (images.length === 0) return null;

  return (
    <section className="py-10" dir="rtl">
      <div className="mx-auto max-w-screen-lg px-4 sm:px-6">
        {title && (
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">{title}</h2>
            <Link href={linkBase} className="flex items-center gap-1 text-sm font-medium text-[#FF5000] hover:underline">
              לכל המוצרים
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.293 8L6.146 3.854a.5.5 0 1 1 .708-.708l4.5 4.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 1 1-.708-.708L10.293 8z" />
              </svg>
            </Link>
          </div>
        )}

        {/* Horizontal scroll container */}
        <div
          className="flex gap-4 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
        >
          {images.map((image) => (
            <Link
              key={image.id}
              href={`${linkBase}?q=${encodeURIComponent(image.name)}`}
              className="group relative flex-shrink-0 overflow-hidden rounded-12 bg-surface-secondary"
              style={{ width: 220, height: 280, scrollSnapAlign: "start" }}
            >
              <Image
                src={image.src}
                alt={image.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="220px"
              />
              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-6">
                <p className="text-sm font-semibold capitalize text-white">{image.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
