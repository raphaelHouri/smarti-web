import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthButtons } from "@/components/auth-buttons";
import { Button } from "@/components/ui/button";
import { NavDropdown, type NavItem } from "./_components/NavDropdown";
import { MobileMarketingNav } from "./_components/MobileMarketingNav";

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
    label: "מערכת הלימוד",
    href: "/learn",
  },
];

const HeaderPage = () => {
  return (
    <header
      className="h-16 sm:h-20 w-full border-b-2 border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-background/95 backdrop-blur-sm sticky top-0 z-50 px-3 sm:px-4"
      dir="rtl"
    >
      <div className="h-full max-w-screen-xl mx-auto flex items-center justify-between gap-2 min-w-0">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/smartiLogo.png"
            alt="סמארטי — הכנה למבחני מחוננים"
            width={130}
            height={36}
            priority
            className="h-8 sm:h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden lg:flex flex-wrap items-center justify-center gap-x-1 gap-y-2 flex-1 min-h-11 min-w-0 px-1"
          aria-label="ניווט ראשי"
        >
          {navItems.map((item) => (
            <NavDropdown key={item.href} item={item} />
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* כניסה ללומדה — desktop */}
          <Button variant="secondary" size="sm" asChild className="hidden sm:flex">
            <Link href="/learn">כניסה ללומדה</Link>
          </Button>

          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="צרו קשר בוואטסאפ"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 transition-colors flex-shrink-0"
          >
            <Image src="/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
          </a>

          {/* Auth */}
          <AuthButtons />

          {/* Theme toggle */}
          <ModeToggle />

          {/* Mobile hamburger */}
          <div className="lg:hidden">
            <MobileMarketingNav items={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderPage;
