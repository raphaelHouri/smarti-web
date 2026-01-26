"use client";

import dynamic from "next/dynamic";

// Dynamically import AndroidStoreHandler with SSR disabled to avoid hydration issues
// This wrapper is needed because ssr: false is not allowed in Server Components
const AndroidStoreHandler = dynamic(
  () => import("@/components/android-store-handler").then((mod) => ({ default: mod.AndroidStoreHandler })),
  { ssr: false }
);

export function AndroidStoreHandlerWrapper() {
  return <AndroidStoreHandler />;
}

