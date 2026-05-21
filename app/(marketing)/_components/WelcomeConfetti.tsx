"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export function WelcomeConfetti() {
  const { width, height } = useWindowSize();
  const [isClient, setIsClient] = useState(false);
  const [recycle, setRecycle] = useState(true);
  const [show, setShow] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    const stopTimer = setTimeout(() => {
      setRecycle(false);
    }, 3000);
    
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 8000);

    return () => {
      clearTimeout(stopTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isClient || !show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <Confetti
        width={width}
        height={height}
        recycle={recycle}
        numberOfPieces={100}
        gravity={0.12}
        initialVelocityY={30}
        confettiSource={{
          x: 0,
          y: height + 10,
          w: width,
          h: 10
        }}
        colors={['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#6366f1', '#a855f7']}
      />
    </div>
  );
}
