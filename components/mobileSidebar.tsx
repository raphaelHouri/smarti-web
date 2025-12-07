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

export const MobileSideBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <MenuIcon className="text-white" />
      </SheetTrigger>
      <SheetContent className='p-0 z-[100]' side="right">
        <SideBar onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}