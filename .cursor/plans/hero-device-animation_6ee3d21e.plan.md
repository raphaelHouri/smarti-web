---
name: hero-device-animation
overview: Add the same staggered device-stack animation on large screens beside the hero copy on both `/` and `/temp`, entering from the physical left of the hero area, without changing outer hero width constraints (`max-w-screen-xl` and PageTemplate `2/5`/`3/5` split).
todos:
  - id: stack-variant
    content: Add variant="productPreview" | "hero" to LearningPreviewDeviceStack (HERO_LAYERS + stronger entrance x)
    status: completed
  - id: temp-hero
    content: Wire hero image column on temp/page.tsx + overflow fix on hero section
    status: completed
  - id: main-hero
    content: Add lg left column with hero.webp + stack in page.tsx heroSlot
    status: completed
  - id: page-template-overflow
    content: Adjust PageTemplate.tsx lg overflow so device fan is not clipped
    status: completed
  - id: verify
    content: Lint and quick visual check both routes at lg and mobile
    status: completed
isProject: false
---

# Hero device animation (lg+), both home pages

## Goals

- **Large screens only** (`lg` and up): show the device fan **to the left of** the headline block (same copy as your screenshot: ״הכנה רצינית…״ / ״התחל ללמוד״).
- **Entrance**: staggered slide-in **from the physical left** of the hero content area (`x` negative in Framer Motion, already the pattern in [`LearningPreviewDeviceStack.tsx`](<app/(marketing)/_components/LearningPreviewDeviceStack.tsx>)).
- **No rotation** (already removed).
- **Do not change hero width**: keep [`max-w-screen-xl`](<app/(marketing)/temp/page.tsx>) on temp; keep [`PageTemplate`](<app/(marketing)/_components/PageTemplate.tsx>) **`lg:w-2/5` + `lg:w-3/5`** and carousel layout unchanged. Only **split the inner** hero content into two columns on `lg`.

## 1. Extend `LearningPreviewDeviceStack`

**File:** [`app/(marketing)/_components/LearningPreviewDeviceStack.tsx`](<app/(marketing)/_components/LearningPreviewDeviceStack.tsx>)

- Add props, e.g. `variant?: "productPreview" | "hero"` (default `"productPreview"` for backward compatibility).
- **Data:** Keep today’s layer config as `PRODUCT_PREVIEW_LAYERS`. Add **`HERO_LAYERS`**: same four assets and z-order (monitor back → tablet → phone → laptop front), **tighter percentages / max widths** so the fan fits a **narrower column** (~260–340px on `/`, ~half grid on `/temp`) without overflowing the hero.
- **Motion:** For `variant === "hero"`, use a slightly stronger off-screen start (e.g. `x: -128`) so the motion reads clearly from the hero’s left edge.
- **Optional:** Add `className` passthrough on the root wrapper for fine-tuning from parents.

Existing **product preview** section keeps `variant="productPreview"` (or default).

## 2. `/temp` — overlay stack on the existing hero image column

**File:** [`app/(marketing)/temp/page.tsx`](<app/(marketing)/temp/page.tsx>)

- In **section 1 HERO**, inside the **image column** (`order-1 lg:order-2`), wrap the `aspect-[4/3]` **`hero.webp`** block the same way as **הצצה ללומדה**:
  - Outer: `relative … overflow-visible`
  - Inner: screenshot `Image` at `z-10`
  - **`LearningPreviewDeviceStack variant="hero"`** absolutely covering that box (`absolute inset-0`), **`hidden lg:block`** so mobile stays a single image.
- Relax hero **section** clipping so devices aren’t cut off: change root hero `<section className="… overflow-hidden">` to something like **`overflow-x-clip overflow-y-visible lg:overflow-visible`** (or equivalent) on that section only—verify the decorative blur blob still looks fine.

No change to **`grid-cols-1 lg:grid-cols-2`** or **`max-w-screen-xl`**.

## 3. `/` — new left column inside `heroSlot` only

**File:** [`app/(marketing)/page.tsx`](<app/(marketing)/page.tsx>)

- Today [`heroSlot`](<app/(marketing)/page.tsx>) uses a single `flex-1` text column; the “cards column” is empty (lines ~199–201). Replace with a **`lg:flex-row`** layout:
  - **Left (physical, `lg`):** fixed-width visual column, e.g. `hidden lg:block`, `flex-shrink-0`, `w-[min(42%,20rem)]` or similar—**only affects layout inside the existing `3/5` panel**, so total hero width is unchanged.
  - **`relative aspect-[4/3]`** (or match temp): **`hero.webp` + `LearningPreviewDeviceStack variant="hero"`** (same stacking as temp).
  - **Right:** existing text column wraps in `flex-1 min-w-0` so copy + CTAs unchanged.

**File:** [`app/(marketing)/_components/PageTemplate.tsx`](<app/(marketing)/_components/PageTemplate.tsx>)

- The hero panel uses nested **`overflow-hidden`** (wrapper around `heroSlot`). At **`lg`**, allow visibility for the device fan (e.g. `lg:overflow-visible` on the **`3/5`** column wrapper and the inner `min-h-0` wrapper around `heroSlot`), without removing **`min-h-0`** where flex shrink is required—test that the carousel + sidebar **do not** introduce scroll regressions on short viewports.

## 4. Verification

- **`/temp`**: At `lg+`, devices animate beside `hero.webp` left of the text grid; at `<lg`, only hero image (no stack).
- **`/`**: At `lg+`, devices + `hero.webp` in new left column; below `lg`, current vertical stack unchanged.
- **Lighthouse / visual**: No horizontal page scroll from the fan; if needed, cap device `max-width` or reduce `HERO_LAYERS` scale.
- **Lint** on touched files.

## Out of scope

- Redesigning carousel, sidebar, or changing `2/5` / `3/5` breakpoints.
- Adding devices on mobile (explicitly `hidden lg:block`).
