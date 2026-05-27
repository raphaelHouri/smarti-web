import type { NavItem } from "../_components/NavDropdown";

/**
 * Primary marketing navigation. Shared between the desktop header dropdowns and
 * the mobile drawer so both surfaces stay in sync.
 */
export const marketingNavItems: NavItem[] = [
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

export type MarketingFooterSection = {
  title: string;
  links: { label: string; href: string }[];
};

/**
 * Footer navigation mirrors the header taxonomy. Repeating these full-page URLs
 * in a sitewide footer reinforces them as Google Sitelink candidates and gives
 * crawlers a second, anchor-free entry point to each canonical page.
 */
export const marketingFooterSections: MarketingFooterSection[] = [
  {
    title: "שלבי המבחן",
    links: [
      { label: "מבחן מחוננים שלב א׳", href: "/shlab-a" },
      { label: "מבחן מחוננים שלב ב׳", href: "/shlab-b" },
      { label: "כיתה ג׳ — שלב ב׳", href: "/kita-gimel" },
    ],
  },
  {
    title: "מדריכים ומידע",
    links: [
      { label: "שאלות ותשובות (FAQ)", href: "/faq" },
      { label: "מדריך הורים", href: "/madriche-holim" },
      { label: "שאלות לדוגמה", href: "/sheelot-dugma" },
      { label: "תרגול וסימולציה", href: "/tarugol-ve-simulatzia" },
      { label: "מחוננים ומצטיינים", href: "/mitztaynim" },
      { label: "אחרי המבחן", href: "/acharei-mevchan" },
      { label: "מקורות משרד החינוך", href: "/misgeret-mechonanim" },
    ],
  },
  {
    title: "המערכת והחנות",
    links: [
      { label: "הלומדה שלנו", href: "/lomda" },
      { label: "חוברות מבחנים", href: "/shop/book" },
      { label: "ערכת מערכת מלאה", href: "/shop/system" },
    ],
  },
];

/**
 * Flat list of top-level pages we want Google to consider as Sitelinks.
 * Used to emit `SiteNavigationElement` JSON-LD on every marketing page.
 * Anchors (`#section`) are intentionally omitted — Sitelinks point to full pages.
 */
export const marketingSiteNavLinks: { name: string; path: string }[] = [
  { name: "בית", path: "/" },
  { name: "מבחן מחוננים שלב א׳", path: "/shlab-a" },
  { name: "מבחן מחוננים שלב ב׳", path: "/shlab-b" },
  { name: "כיתה ג׳ — שלב ב׳", path: "/kita-gimel" },
  { name: "שאלות ותשובות", path: "/faq" },
  { name: "מדריך הורים", path: "/madriche-holim" },
  { name: "שאלות לדוגמה", path: "/sheelot-dugma" },
  { name: "תרגול וסימולציה", path: "/tarugol-ve-simulatzia" },
  { name: "מחוננים ומצטיינים", path: "/mitztaynim" },
  { name: "אחרי המבחן", path: "/acharei-mevchan" },
  { name: "מקורות משרד החינוך", path: "/misgeret-mechonanim" },
  { name: "הלומדה שלנו", path: "/lomda" },
  { name: "חנות", path: "/shop" },
  { name: "חוברות מבחנים", path: "/shop/book" },
  { name: "ערכת מערכת מלאה", path: "/shop/system" },
];
