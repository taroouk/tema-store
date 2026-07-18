"use client";

import { useState } from "react";
import Image from "next/image";

import type { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({
  product,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[96px_1fr]">
      {/* Thumbnails */}

      <div className="hidden flex-col gap-4 lg:flex">
        {product.images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={`relative aspect-[3/4] overflow-hidden rounded-xl border transition-all ${
              selectedImage.id === image.id
                ? "border-black"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
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

      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-neutral-100">
        <Image
          key={selectedImage.id}
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          priority
          className="object-cover transition-all duration-500"
        />
      </div>
    </div>
  );
}