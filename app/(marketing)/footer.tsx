import Link from "next/link";

import { marketingFooterSections } from "./_data/marketingNav";

const footerLinkClassName =
  "text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:underline underline-offset-4 transition-colors";

const FooterPage = () => {
  return (
    <footer
      className="block border-t-2 border-slate-200 dark:border-slate-800 w-full bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="max-w-screen-lg mx-auto py-8 px-4">
        <nav
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8"
          aria-label="ניווט תחתון"
        >
          {marketingFooterSections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLinkClassName}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex items-center justify-center border-t border-slate-200 dark:border-slate-800 pt-6">
          <Link href="/policy" className={footerLinkClassName}>
            תנאי שימוש ופרטיות
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterPage;
