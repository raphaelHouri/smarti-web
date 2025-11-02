"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // change the colors from green to royal blue tailwind
  const getColorByPercentage = (percentage: number = 0) => {
    if (percentage < 33) return "bg-green-300";
    if (percentage < 66) return "bg-green-500";
    return "bg-green-700";
  };
  const color = getColorByPercentage(value ?? 0);
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("bg-primary h-full transition-all", color)}
        style={{
          width: `${value || 0}%`,
          marginLeft: 'auto'
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
