"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

import { cn, isStorageImage } from "@/lib/utils";

type SmartImageProps = ImageProps & {
  wrapperClassName?: string;
};

export function SmartImage({
  wrapperClassName,
  className,
  onLoad,
  priority,
  alt,
  ...props
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("ux-skeleton", loaded && "is-loaded", wrapperClassName)}>
      <Image
        {...props}
        unoptimized={props.unoptimized ?? isStorageImage(props.src)}
        alt={alt}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        className={cn("ux-img", loaded && "is-loaded", className)}
      />
    </div>
  );
}
