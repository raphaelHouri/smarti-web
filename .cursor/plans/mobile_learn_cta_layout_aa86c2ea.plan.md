---
name: Mobile learn CTA layout
overview: Expose the same "כניסה ללומדה" entry point on the mobile header as on desktop, without crowding the bar, and optionally align hero + drawer copy for a cleaner, consistent CTA set.
todos:
  - id: mobile-header-cta
    content: Add compact LearnEntryButton (כניסה ללומדה) next to WhatsApp in header.tsx mobile row; responsive label if needed
    status: completed
  - id: nav-copy-consistency
    content: Choose nav/drawer label strategy (change navItems vs optional learnCtaLabel on NavItem) and apply
    status: completed
  - id: hero-copy-optional
    content: Optionally align hero LearnEntryButton text with כניסה ללומדה in page.tsx
    status: completed
  - id: drawer-footer-optional
    content: Optionally restyle MobileMarketingNav footer (auth + theme) for cleaner stacking on small screens
    status: completed
isProject: false
---

# Mobile "כניסה ללומדה" + cleaner CTAs

## Current behavior

- **Desktop** ([`app/(marketing)/header.tsx`](<app/(marketing)/header.tsx>)): Right cluster includes `LearnEntryButton` with label **כניסה ללומדה**, plus WhatsApp, `AuthButtons`, theme toggle.
- **Mobile bar** (same file, `lg:hidden`): Only hamburger ([`MobileMarketingNav`](<app/(marketing)/_components/MobileMarketingNav.tsx>)), centered logo, WhatsApp — **no learn CTA in the bar**.
- **Mobile drawer**: The `/learn` nav row uses [`navItems`](<app/(marketing)/header.tsx>) label **מערכת הלימוד** as the `LearnEntryButton` children ([`MobileMarketingNav.tsx`](<app/(marketing)/_components/MobileMarketingNav.tsx>) ~184–195), not "כניסה ללומדה".
- **Home hero** ([`app/(marketing)/page.tsx`](<app/(marketing)/page.tsx>) ~199–208): Primary CTA is `LearnEntryButton` with **התחל ללמוד**.

## Recommended approach

### 1. Add a compact learn CTA to the mobile header (main ask)

In [`app/(marketing)/header.tsx`](<app/(marketing)/header.tsx>), in the **mobile** row (`lg:hidden`):

- Wrap **WhatsApp** and a new **`LearnEntryButton`** in a single `flex items-center gap-2 shrink-0 z-10` group on the side opposite the hamburger (today: WhatsApp alone on the "left" in RTL layout).
- Use **`size="sm"`** and **`variant="secondary"`** (or `outline` if it reads cleaner next to the green circle) so it matches the desktop CTA family without dominating the bar.
- **Responsive label** to avoid overflow on very narrow screens: e.g. full **כניסה ללומדה** from `sm` up, shorter text (e.g. **לומדה**) only on the narrowest breakpoint via Tailwind (`max-sm:` / `sm:`), or icon + `aria-label` if text still clips.

`LearnEntryButton` already supports `onTriggerClick`; if the drawer is open, behavior is unchanged. No new client wrapper is required beyond the existing client boundary on `LearnEntryButton`.

### 2. Unify copy in the drawer (optional but "clean")

Pick one:

- **A (minimal):** Extend [`NavItem`](<app/(marketing)/_components/NavDropdown.tsx>) with an optional field e.g. `learnCtaLabel?: string` and set it only on the `/learn` item in [`header.tsx`](<app/(marketing)/header.tsx>) to **כניסה ללומדה**, while keeping **מערכת הלימוד** as `label` for desktop nav if you still want that wording in the top nav; **or**
- **B (simplest):** Change the `/learn` item’s `label` in `navItems` to **כניסה ללומדה** so desktop nav, mobile drawer, and mental model align (accepts that desktop drops "מערכת הלימוד" in the nav strip — you already have a second desktop-only **כניסה ללומדה** button, so review duplication).

Recommendation: **B** if you are fine retiring "מערכת הלימוד" in the nav strip; **A** if you want nav wording vs. CTA wording separated.

### 3. Hero primary CTA wording (optional)

If the product preference is one canonical phrase: change the hero `LearnEntryButton` children in [`app/(marketing)/page.tsx`](<app/(marketing)/page.tsx>) from **התחל ללמוד** to **כניסה ללומדה** (or use responsive copy: hero keeps **התחל ללמוד** as more "salesy" and bar uses **כניסה ללומדה**). This is a product copy decision, not a technical blocker.

### 4. "All buttons" tidy-up

- **Mobile drawer footer** ([`MobileMarketingNav.tsx`](<app/(marketing)/_components/MobileMarketingNav.tsx>) ~212–216): Today `AuthButtons` + `ModeToggle` sit `justify-between`. For a cleaner stack on narrow widths, consider `flex-col gap-3` with full-width auth actions and theme on a second row **or** `items-center justify-center gap-4` — only if the current footer feels cramped after user testing.

## Files to touch

| File                                                                                                                                           | Change                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`app/(marketing)/header.tsx`](<app/(marketing)/header.tsx>)                                                                                   | Mobile row: add `LearnEntryButton` + group with WhatsApp; `trackSource` e.g. `header_mobile`. |
| [`app/(marketing)/header.tsx`](<app/(marketing)/header.tsx>) (and possibly [`NavDropdown.tsx`](<app/(marketing)/_components/NavDropdown.tsx>)) | Optional: `navItems` / `NavItem` label split for drawer vs desktop.                           |
| [`app/(marketing)/page.tsx`](<app/(marketing)/page.tsx>)                                                                                       | Optional: hero CTA text alignment.                                                            |
| [`app/(marketing)/_components/MobileMarketingNav.tsx`](<app/(marketing)/_components/MobileMarketingNav.tsx>)                                   | Optional: footer layout refinement.                                                           |

## Verification

- Resize viewport: mobile bar shows learn CTA + WhatsApp without overlapping the centered logo.
- Tap **כניסה ללומדה**: step-selection dialog opens; `onTriggerClick` still closes drawer when opened from menu.
- No layout shift / hydration issues (header remains a server component with client children).
