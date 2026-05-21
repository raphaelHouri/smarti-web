import Image from "next/image";
import Link from "next/link";
import { LearnEntryButton } from "./_components/LearnEntryButton";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthButtons } from "@/components/auth-buttons";
import { NavDropdown, type NavItem } from "./_components/NavDropdown";
import { MobileMarketingNav } from "./_components/MobileMarketingNav";
import { MobileHeaderLogo } from "./_components/MobileHeaderLogo";

const WHATSAPP_URL =
  "https://wa.me/972586519423?text=" +
  encodeURIComponent("שלום, אשמח לקבל מידע על ההכנה למבחן מחוננים");

const navItems: NavItem[] = [
  {
    label: "שלב א׳",
    href: "/shlab-a",
    subItems: [
      { label: "מידע על שלב א׳", href: "/shlab-a#info" },
      { label: "שאלות לדוגמה שלב א׳", href: "/shlab-a#examples" },
      { label: "מבחן לדוגמא שלב א׳", href: "/shlab-a#practice" },
    ],
  },
  {
    label: "שלב ב׳",
    href: "/shlab-b",
    subItems: [
      { label: "מידע על שלב ב׳", href: "/shlab-b#info" },
      { label: "שאלות לדוגמה שלב ב׳", href: "/shlab-b#examples" },
      { label: "מבחן לדוגמא שלב ב׳", href: "/shlab-b#practice" },
    ],
  },
  {
    label: "כיתה ג׳ — שלב ב׳",
    href: "/kita-gimel",
    subItems: [
      { label: "מידע על כיתה ג׳", href: "/kita-gimel#info" },
      { label: "שאלות לדוגמה כיתה ג׳", href: "/kita-gimel#examples" },
      { label: "מבחן לדוגמא כיתה ג׳", href: "/kita-gimel#practice" },
    ],
  },
  {
    label: "מדריכים",
    href: "/madriche-holim",
    subItems: [
      { label: "שאלות ותשובות (FAQ)", href: "/faq" },
      { label: "מדריך הורים", href: "/madriche-holim" },
      { label: "תרגול וסימולציה", href: "/tarugol-ve-simulatzia" },
      { label: "שאלות לדוגמה", href: "/sheelot-dugma" },
      { label: "מחוננים ומצטיינים", href: "/mitztaynim" },
      { label: "אחרי המבחן", href: "/acharei-mevchan" },
      { label: "מקורות משרד החינוך", href: "/misgeret-mechonanim" },
    ],
  },
  {
    label: "חומרי לימוד",
    href: "/shop",
    subItems: [
      { label: "חוברות מבחנים", href: "/shop/book" },
      { label: "ערכת מערכת מלאה", href: "/shop/system" },
    ],
  },
  {
    label: "הלומדה שלנו",
    href: "/lomda",
  },
];

const HeaderPage = () => {
  return (
    <header
      className="w-full border-b-2 border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-background/95 backdrop-blur-sm sticky top-0 z-50 px-3 sm:px-4 max-sm:min-h-[5rem] max-sm:py-2 sm:h-20 lg:h-20"
      dir="rtl"
    >
      <div className="max-w-screen-xl mx-auto min-w-0 sm:h-full">
        {/* Mobile: שורה אחת — תפריט · לוגו · כניסה ללומדה (כפתור outline, טקסט בשתי שורות במסך צר) · וואטסאפ */}
        <div className="relative flex w-full items-center justify-between gap-1 min-h-11 sm:min-h-0 sm:h-full lg:hidden min-w-0">
          <div className="shrink-0 z-10">
            <MobileMarketingNav items={navItems} />
          </div>
          <MobileHeaderLogo />
          {/* Mobile right column: WhatsApp top, CTA below */}
          <div className="flex shrink-0 z-10 items-center max-sm:flex-col max-sm:items-center max-sm:gap-0.5 sm:flex-row sm:gap-2 min-w-0">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="צרו קשר בוואטסאפ"
              className="flex items-center justify-center rounded-lg text-green-600 dark:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors max-sm:w-8 max-sm:h-7 sm:min-h-10 sm:min-w-10"
            >
              <Image src="/whatsapp.svg" alt="" width={20} height={20} className="opacity-90" aria-hidden />
            </a>
            <LearnEntryButton
              variant="secondaryOutline"
              size="sm"
              className="normal-case rounded-lg border-2 border-emerald-600 dark:border-emerald-500 bg-white/80 dark:bg-transparent text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-bold shadow-sm whitespace-nowrap max-sm:text-[10px] max-sm:px-2 max-sm:h-7 max-sm:min-h-0 max-sm:leading-tight sm:h-9 sm:min-h-9 sm:px-3 sm:text-sm transition-colors"
              trackSource="header_mobile"
            >
              כניסה ללומדה
            </LearnEntryButton>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex h-full items-center justify-between gap-2 min-w-0">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/smartiLogo.webp"
              alt="סמארטי — הכנה למבחני מחוננים"
              width={130}
              height={36}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 flex-1 min-h-11 min-w-0 px-1"
            aria-label="ניווט ראשי"
          >
            {navItems.map((item) => (
              <NavDropdown key={item.href} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <LearnEntryButton variant="secondary" size="sm" className="normal-case" trackSource="header_desktop">
              כניסה ללומדה
            </LearnEntryButton>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="צרו קשר בוואטסאפ"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex-shrink-0"
            >
              <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
            </a>
            <AuthButtons />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderPage;
