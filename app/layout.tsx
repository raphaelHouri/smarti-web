import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
// import {neobrutalism} from '@clerk/themes';
import { Toaster, toast } from 'sonner'
import { Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ExitModal from "@/components/modals/useExitModal";
import HeartsModal from "@/components/modals/useHeartsModal";
import PracticeModal from "@/components/modals/usePracticeModal";
import FinishLessonModal from "@/components/modals/useFinishLessonModal";
import RegisterModal from "@/components/modals/useRegisterModal";
import PremiumModal from "@/components/modals/usePremiumModal";
import { heIL } from '@clerk/localizations'
import FeedbackModal from "@/components/modals/useFeedbacksModal";

const font = Poppins({ subsets: ["latin"], weight: ["500"] })

export const metadata: Metadata = {
  title: "Linguify",
  description: "AI based Language Learning App",
  icons: {
    icon: '/mascot.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={heIL}
      afterSignOutUrl="/"


    // appearance={{
    //   baseTheme:neobrutalism
    // }}
    >
      <html lang="he" dir="rtl" suppressHydrationWarning>
        {/* <head>
          <script src="https://beamanalytics.b-cdn.net/beam.min.js" data-token="8efceb49-2776-47f5-bb58-33fcc018acc9" async></script>
        </head> */}
        <body className={font.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
          >
            <Toaster richColors position="bottom-right" />
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            <FinishLessonModal />
            <FeedbackModal />
            <RegisterModal />
            <PremiumModal />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
