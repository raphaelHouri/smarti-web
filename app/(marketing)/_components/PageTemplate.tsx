import { KeywordCarousel, type CarouselSlide } from "./KeywordCarousel";
import { InfoSidePanel } from "./InfoSidePanel";

interface PageTemplateProps {
  carouselSlides: CarouselSlide[];
  heroSlot: React.ReactNode;
  children?: React.ReactNode;
  whatsappGroupUrl?: string | null;
}

export function PageTemplate({ carouselSlides, heroSlot, children, whatsappGroupUrl }: PageTemplateProps) {
  return (
    <div className="flex flex-col w-full min-w-0">
      {/* Hero — at least full viewport on lg; can grow taller so side panel content is not clipped */}
      <div className="flex flex-col lg:min-h-[calc(100svh-80px)] min-h-0 overflow-hidden lg:overflow-visible">
        <KeywordCarousel slides={carouselSlides} />

        {/* Two-panel section — row height follows tallest column (sidebar or hero) on lg */}
        <div className="w-full flex flex-col lg:flex-row flex-1 min-h-0 min-w-0 overflow-hidden lg:overflow-visible" dir="rtl">
          {/* Left 2/5 — info panel */}
          <div className="lg:w-1/3 min-h-0 overflow-hidden lg:overflow-visible">
            <InfoSidePanel whatsappGroupUrl={whatsappGroupUrl} />
          </div>

          {/* Right 3/5 — hero slot */}
          <div className="order-first lg:order-first flex-1 lg:w-3/5 min-h-0 min-w-0 flex flex-col justify-center overflow-hidden lg:overflow-visible px-4 lg:pl-4 lg:pr-16 xl:pr-24 2xl:pr-36 py-4 sm:py-6 [@media(max-height:760px)]:py-2 [@media(max-height:660px)]:py-1.5">
            <div className="min-h-0 w-full overflow-hidden lg:overflow-visible">{heroSlot}</div>
          </div>
        </div>
      </div>

      {/* Rest of page — below the fold */}
      {children}
    </div>
  );
}
