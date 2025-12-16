import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const FooterPage = () => {
  return (
    <footer className="hidden lg:block border-t-2 border-slate-200 dark:border-slate-800 w-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-screen-lg mx-auto py-6 px-4">
        {/* Original footer style (no system step selector) */}

        {/* Privacy Policy Link */}
        <div className="w-full text-center">
          <Link
            href="/policy"
            className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline underline-offset-4 transition-all duration-200"
          >
            תנאי שימוש ופרטיות
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;
