import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const FooterPage = () => {
  return (
    <footer className="hidden lg:block border-t-2 border-slate-200 dark:border-slate-800 w-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
      <div className="max-w-screen-lg mx-auto py-6 px-4">
        {/* Language Buttons Section */}
        {/* <div className="flex items-center justify-center gap-2 mb-6">
          <Button variant="ghost" size="lg" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <Image
              src="/es.svg"
              alt="Spain"
              height={32}
              width={40}
              className="mr-3 rounded-md"
            />
            Spanish
          </Button>
          <Button variant="ghost" size="lg" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <Image
              src="/fr.svg"
              alt="France"
              height={32}
              width={40}
              className="mr-3 rounded-md"
            />
            French
          </Button>
          <Button variant="ghost" size="lg" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <Image
              src="/in.svg"
              alt="India"
              height={32}
              width={40}
              className="mr-3 rounded-md"
            />
            Indian
          </Button>
          <Button variant="ghost" size="lg" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <Image
              src="/it.svg"
              alt="Italian"
              height={32}
              width={40}
              className="mr-3 rounded-md"
            />
            Italian
          </Button>
          <Button variant="ghost" size="lg" className="flex-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
            <Image
              src="/jp.svg"
              alt="Japan"
              height={32}
              width={40}
              className="mr-3 rounded-md"
            />
            Japanese
          </Button>
        </div> */}

        {/* Separator */}
        {/* <div className="h-px bg-slate-200 dark:bg-slate-800 mb-6 mx-auto max-w-xs" /> */}

        {/* Privacy Policy Link */}
        <div className="w-full text-center">
          <Link
            href="/policy"
            className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline underline-offset-4 transition-all duration-200"
          >
            מדיניות פרטיות
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;
