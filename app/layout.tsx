import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
// import {neobrutalism} from '@clerk/themes';
import { Toaster } from 'sonner'
import { ThemeProvider } from "@/components/theme-provider"
import { customHeIL } from '@/lib/clerk-localization'
import { PostHogProvider } from "@/components/posthog-provider";
import { ModalsProvider } from "@/components/modals-provider";

export const metadata: Metadata = {
  title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
  verification: {
    google: "epxDzbgoP1_Rde7iiAWj8fi_bPUE10U9umuPqoBHqX0",
  },
  description:
    "סמארטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "סמארטי",
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/icon-192x192.png',
  },
  keywords: [
    "מחוננים",
    "מצטיינים",
    "מבחני מחוננים",
    "תרגול אונליין",
    "סימולציות",
    "חוברות",
    "כיתה ב",
    "כיתה ג",
    "הדרכת הורים",
  ],
  openGraph: {
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description:
      "סמארטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
    type: 'website',
    locale: 'he_IL',
    siteName: 'סמארטי',
  },
  twitter: {
    card: 'summary_large_image',
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description:
      "סמארטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={customHeIL}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/"
    // appearance={{
    //   baseTheme:neobrutalism
    // }}
    >
      <html lang="he" dir="rtl" suppressHydrationWarning>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#22c55e" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="סמארטי" />
          <link rel="apple-touch-icon" href="/icon-192x192.png" />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
          >
            <PostHogProvider>
              <Toaster richColors position="bottom-right" />
              <ModalsProvider />
              {children}
            </PostHogProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
