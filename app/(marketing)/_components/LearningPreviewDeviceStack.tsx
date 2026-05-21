"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

/**
 * Fan layout (LTR left→right): tablet (front left) → phone → monitor (back, largest) → laptop (front right).
 * Order in array = paint order: back first, front last.
 */
const PRODUCT_PREVIEW_LAYERS = [
  {
    src: "/iphone_devices/Untitled%20design%20(6).png",
    alt: "תצוגת מסך הלומדה במסך גדול",
    aspectClass: "aspect-[5/4] sm:aspect-[4/3]",
    className:
      "left-[34%] top-[-20%] w-[74%] max-w-[26rem] sm:left-[20%] sm:w-[98%] sm:max-w-[32rem] z-[10]",
    sizes: "(max-width: 640px) 78vw, min(98vw, 32rem)",
  },
  {
    src: "/iphone_devices/ipad.png",
    alt: "תצוגת מסך הלומדה בטאבלט",
    aspectClass: "aspect-[3/4]",
    className:
      "left-[12%] top-[14%] w-[36%] max-w-[10.5rem] sm:left-[14%] sm:w-[32%] sm:max-w-[12rem] z-[30]",
    sizes: "(max-width: 640px) 38vw, 12rem",
  },
  {
    src: "/iphone_devices/iphone.png",
    alt: "תצוגת מסך הלומדה בנייד",
    aspectClass: "aspect-[10/19]",
    className:
      "left-[28%] top-[29%] w-[22%] max-w-[5.5rem] sm:left-[40%] sm:w-[22%] sm:max-w-[6.25rem] z-[35]",
    sizes: "(max-width: 640px) 24vw, 6.25rem",
  },
  {
    src: "/iphone_devices/ipad%20pro.png",
    alt: "תצוגת מסך הלומדה במחשב נייד",
    aspectClass: "aspect-[16/10]",
    className:
      "left-[60%] top-[12%] w-[54%] max-w-[17rem] sm:left-[80%] sm:w-[100%] sm:max-w-[25rem] z-[40]",
    sizes: "(max-width: 640px) 58vw, 25rem",
  },
] as const;

/** Tighter fan for hero columns (~310–450px); slightly bigger for visual pop; same z-order and assets */
const HERO_LAYERS = [
  {
    src: "/iphone_devices/ipad.png",
    alt: "תצוגת מסך הלומדה בטאבלט",
    aspectClass: "aspect-[3/4]",
    className:
      "left-[4%] top-[10%] w-[32%] max-w-[7rem] sm:max-w-[8rem] z-[30]",
    sizes: "(max-width: 640px) 30vw, 8rem",
  },
  {
    src: "/iphone_devices/iphone.png",
    alt: "תצוגת מסך הלומדה בנייד",
    aspectClass: "aspect-[10/19]",
    className:
      "left-[23%] top-[23%] w-[14%] max-w-[3.5rem] sm:max-w-[4.25rem] z-[35]",
    sizes: "(max-width: 640px) 14vw, 4.25rem",
  },
  {
    src: "/iphone_devices/Untitled%20design%20(6).png",
    alt: "תצוגת מסך הלומדה במסך גדול",
    aspectClass: "aspect-[5/4] sm:aspect-[4/3]",
    className:
      "left-[17%] top-0 w-[98%] max-w-[18rem] sm:max-w-[21rem] z-[10]",
    sizes: "(max-width: 640px) 98vw, 21rem",
  },
  {
    src: "/iphone_devices/ipad%20pro.png",
    alt: "תצוגת מסך הלומדה במחשב נייד",
    aspectClass: "aspect-[16/10]",
    className:
      "left-[59%] top-[20%] w-[54%] max-w-[10.5rem] sm:max-w-[13rem] z-[40]",
    sizes: "(max-width: 640px) 54vw, 13rem",
  },
] as const;

const STAGGER_SEC = { hero: 0.11, productPreview: 0.12 } as const;
const FADE_DURATION = 0.38;

type StackVariant = "productPreview" | "hero";

interface LearningPreviewDeviceStackProps {
  variant?: StackVariant;
  className?: string;
}

export function LearningPreviewDeviceStack({
  variant = "productPreview",
  className = "",
}: LearningPreviewDeviceStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  /** Positive bottom margin = start slightly before the stack enters the viewport (below-the-fold). */
  const inViewIo = useInView(containerRef, {
    once: true,
    margin: "0px 0px 200px 0px",
  });
  const isInView = variant === "hero" || inViewIo;

  const layers = variant === "hero" ? HERO_LAYERS : PRODUCT_PREVIEW_LAYERS;
  const stagger = STAGGER_SEC[variant];

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-20 overflow-visible ${className}`}
      aria-hidden
    >
      {layers.map((layer, index) => (
        <motion.div
          key={`${variant}-${layer.src}`}
          className={`absolute ${layer.aspectClass} ${layer.className}`}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: FADE_DURATION,
            ease: "easeOut",
            delay: index * stagger,
          }}
        >
          <Image
            src={layer.src}
            alt={layer.alt}
            fill
            sizes={layer.sizes}
            quality={82}
            className="object-contain drop-shadow-2xl select-none [image-rendering:-webkit-optimize-contrast]"
          />
        </motion.div>
      ))}
    </div>
  );
}
