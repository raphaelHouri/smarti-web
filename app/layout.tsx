import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
// import {neobrutalism} from '@clerk/themes';
import { Toaster, toast } from 'sonner'
import { Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ExitModal from "@/components/modals/useExitModal";
import CoinsModal from "@/components/modals/useCoinsModal";
import PracticeModal from "@/components/modals/usePracticeModal";
import FinishLessonModal from "@/components/modals/useFinishLessonModal";
import RegisterModal from "@/components/modals/useRegisterModal";
import PremiumModal from "@/components/modals/usePremiumModal";
import { customHeIL } from '@/lib/clerk-localization'
import FeedbackModal from "@/components/modals/useFeedbacksModal";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const font = Poppins({ subsets: ["latin"], weight: ["500"] })

export const metadata: Metadata = {
  title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
  description:
    "סמרטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
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
      "סמרטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
    type: 'website',
    locale: 'he_IL',
    siteName: 'סמרטי',
  },
  twitter: {
    card: 'summary_large_image',
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description:
      "סמרטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
  },
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
      afterSignUpUrl="/courses"


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
        <body className={font.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
          >
            <Toaster richColors position="bottom-right" />
            <ExitModal />
            <CoinsModal />
            <PracticeModal />
            <FinishLessonModal />
            <FeedbackModal />
            <RegisterModal />
            <PremiumModal />
            <PWAInstallPrompt />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
