"use client";

import dynamic from "next/dynamic";

const ExitModal = dynamic(() => import("@/components/modals/useExitModal"), { ssr: false });
const CoinsModal = dynamic(() => import("@/components/modals/useCoinsModal"), { ssr: false });
const PracticeModal = dynamic(() => import("@/components/modals/usePracticeModal"), { ssr: false });
const FinishLessonModal = dynamic(() => import("@/components/modals/useFinishLessonModal"), { ssr: false });
const RegisterModal = dynamic(() => import("@/components/modals/useRegisterModal"), { ssr: false });
const PremiumModal = dynamic(() => import("@/components/modals/usePremiumModal"), { ssr: false });
const FeedbackModal = dynamic(() => import("@/components/modals/useFeedbacksModal"), { ssr: false });
const PWAInstallPrompt = dynamic(
  () => import("@/components/pwa-install-prompt").then((m) => m.PWAInstallPrompt),
  { ssr: false }
);
const WebViewUserIdHandler = dynamic(
  () => import("@/components/webview-userid-handler").then((m) => m.WebViewUserIdHandler),
  { ssr: false }
);

export function ModalsProvider() {
  return (
    <>
      <WebViewUserIdHandler />
      <ExitModal />
      <CoinsModal />
      <PracticeModal />
      <FinishLessonModal />
      <FeedbackModal />
      <RegisterModal />
      <PremiumModal />
      <PWAInstallPrompt />
    </>
  );
}
