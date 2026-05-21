"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function MobileHeaderLogo() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href="/"
      className="absolute left-[55%] top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
    >
      <Image
        src="/smartiLogo.webp"
        alt="סמארטי — הכנה למבחני מחוננים"
        width={130}
        height={36}
        priority
        className={[
          "w-auto transition-all duration-300 ease-out",
          scrolled ? "h-9" : "h-12",
        ].join(" ")}
      />
    </Link>
  );
}
