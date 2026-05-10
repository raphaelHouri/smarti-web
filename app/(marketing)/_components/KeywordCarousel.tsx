"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export type CarouselSlide = {
  title: string;
  description: string;
  imageSrc: string;
};

type Props = { slides: CarouselSlide[] };

export function KeywordCarousel({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  return (
    <div
      className="relative w-full h-[230px] sm:h-[290px] overflow-hidden border-b border-emerald-100 dark:border-emerald-900/50"
      style={{
        background:
          "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 40%, #d1fae5 100%)",
      }}
    >
      {/* decorative blobs — kept inside the overflow-hidden container */}
      <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-emerald-200/30 dark:bg-emerald-800/10 blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-green-100/40 dark:bg-green-900/10 blur-2xl pointer-events-none translate-x-1/4 translate-y-1/4" />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction > 0 ? "6%" : "-6%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-6%" : "6%", opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center px-4 sm:px-8 overflow-hidden"
        >
          <div className="flex flex-row items-center gap-3 sm:gap-6 w-full max-w-screen-lg min-w-0">
            {/* Text — right side */}
            <div className="flex-1 flex flex-col gap-2.5 min-w-0 overflow-hidden">
              {/* step badge */}
              <span className="inline-flex self-start items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold tracking-wide">
                סמארטי
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-[1.8rem] font-extrabold text-emerald-900 dark:text-emerald-100 leading-tight break-words">
                {slides[current].title}
              </h2>
              <p className="text-sm sm:text-[0.95rem] text-emerald-800/70 dark:text-emerald-200/60 leading-relaxed max-w-md min-w-0">
                {slides[current].description}
              </p>
            </div>

            {/* Image — left side */}
            <div className="hidden sm:block relative w-[155px] md:w-[210px] h-[175px] md:h-[235px] flex-shrink-0 drop-shadow-md">
              <Image
                src={slides[current].imageSrc}
                alt={slides[current].title}
                fill
                className="object-contain"
                priority={current === 0}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`עבור לשקופית ${i + 1} מתוך ${slides.length}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "bg-emerald-500 w-6 h-2"
                : "bg-emerald-300/60 dark:bg-emerald-600/50 w-2 h-2 hover:bg-emerald-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
