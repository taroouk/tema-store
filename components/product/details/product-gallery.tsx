"use client";

import { useRef, useState } from "react";
import { Search, ZoomOut } from "lucide-react";
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

  const toggleZoom = (event?: React.MouseEvent<HTMLDivElement>) => {
    if (event) handleMove(event);
    setZoom((z) => !z);
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
              "relative aspect-[4/5] overflow-hidden rounded-xl border bg-neutral-100 transition-all",
              selectedImage.id === image.id
                ? "border-foreground"
                : "border-neutral-200 hover:border-neutral-400"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="96px"
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {/* Main Image: shown whole (never cropped); click to zoom in, click again to zoom out */}

      <div
        ref={mainRef}
        onClick={(e) => toggleZoom(e)}
        onMouseMove={zoom ? handleMove : undefined}
        role="button"
        tabIndex={0}
        aria-label={zoom ? "Zoom out" : "Zoom in"}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleZoom())}
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100",
          zoom ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
      >
        <Image
          key={selectedImage.id}
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={cn("object-contain transition-transform duration-300", zoom && "scale-[2]")}
          style={zoom ? { transformOrigin: `${position.x}% ${position.y}%` } : undefined}
        />

        <span className="pointer-events-none absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white">
          {zoom ? <ZoomOut size={18} /> : <Search size={18} />}
        </span>
      </div>
    </div>
  );
}
