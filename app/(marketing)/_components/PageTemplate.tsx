import { KeywordCarousel, type CarouselSlide } from "./KeywordCarousel";
import { InfoSidePanel } from "./InfoSidePanel";

interface PageTemplateProps {
  carouselSlides: CarouselSlide[];
  heroSlot: React.ReactNode;
  children?: React.ReactNode;
}

export function PageTemplate({ carouselSlides, heroSlot, children }: PageTemplateProps) {
  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Hero Carousel — full width */}
      <KeywordCarousel slides={carouselSlides} />

      {/* Two-panel section */}
      <div className="w-full flex flex-col lg:flex-row flex-1 min-w-0" dir="rtl">
        {/* Right 2/3 — hero slot. Shown first on mobile via order */}
        <div className="order-first lg:order-last flex-1 lg:w-2/3 min-w-0 flex flex-col items-center justify-center px-4 py-5 sm:py-6">
          {heroSlot}
        </div>

        {/* Left 1/3 — info panel */}
        <div className="order-last lg:order-first lg:w-1/3 min-h-[180px] min-w-0">
          <InfoSidePanel />
        </div>
      </div>

      {children}
    </div>
  );
}
