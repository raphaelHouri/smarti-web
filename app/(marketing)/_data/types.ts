export type MarketingFaqItem = {
  question: string;
  answer: string;
  href?: string;
};

export type NavSubItem = { label: string; href: string };

export type NavItem = {
  label: string;
  href: string;
  subItems?: NavSubItem[];
  /** Mobile drawer / compact CTA copy for `/learn`; desktop nav keeps `label`. */
  learnCtaLabel?: string;
};

export type MarketingFooterLink = { label: string; href: string };

export type MarketingFooterSection = {
  title: string;
  links: MarketingFooterLink[];
};

export type MarketingSiteNavLink = { name: string; path: string };
