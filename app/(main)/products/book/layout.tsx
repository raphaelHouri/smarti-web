import type { Metadata } from "next";

export const metadata: Metadata = {
  verification: {
    google: "epxDzbgoP1_Rde7iiAWj8fi_bPUE10U9umuPqoBHqX0",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

