"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const mainRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = mainRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  const handleTap = () => {
    if (window.matchMedia("(hover: none)").matches) {
      setZoom((prev) => !prev);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[96px_1fr]">
      {/* Thumbnails */}

      <div className="hidden flex-col gap-4 lg:flex">
        {product.images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => {
              setSelectedImage(image);
              setZoom(false);
            }}
            className={cn(
              "relative aspect-[3/4] overflow-hidden rounded-xl border transition-all",
              selectedImage.id === image.id
                ? "border-black"
                : "border-neutral-200 hover:border-neutral-400"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}

      <div
        ref={mainRef}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMove}
        onClick={handleTap}
        className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-3xl bg-neutral-100"
      >
        <Image
          key={selectedImage.id}
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn(
            "object-cover transition-all duration-500",
            zoom &&
              "scale-150 md:[background-size:200%]"
          )}
          style={
            zoom
              ? {
                  transformOrigin: `${position.x}% ${position.y}%`,
                }
              : undefined
          }
        />

        {/* Mobile zoom hint */}

        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white lg:hidden">
          Tap to zoom
        </span>
      </div>
    </div>
  );
}
