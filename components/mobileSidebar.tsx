"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger
}
  from "@/components/ui/sheet";
import { SideBar } from "./sideBar";
import { MenuIcon } from "lucide-react";
import { useSystemStepLabel } from "@/hooks/use-system-step";

export const MobileSideBar = () => {
  const [open, setOpen] = useState(false);
  // Automatically updates when systemStep changes via Next.js revalidation
  const systemStepLabel = useSystemStepLabel();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <MenuIcon className="text-white" />
      </SheetTrigger>
      <SheetContent className='p-0 z-[100]' side="right">
        <SideBar systemStepLabel={systemStepLabel} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}