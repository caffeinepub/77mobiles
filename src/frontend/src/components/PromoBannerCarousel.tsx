import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BANNER_SLIDES } from "../data/bannerSlides";

export default function PromoBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const navigate = useNavigate();

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 50) next();
      else if (diff < -50) prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setPaused(false);
  };

  const handleCtaClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Internal routes start with /
    if (url.startsWith("/")) {
      navigate({ to: url as any });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const slide = BANNER_SLIDES[current];

  return (
    <div className="mb-5" data-ocid="promo.panel">
      {/* Banner Container */}
      <section
        className="relative rounded-2xl overflow-hidden shadow-md select-none"
        style={{
          background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})`,
          minHeight: "160px",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={slide.title}
      >
        {/* SVG Decorative Shapes */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="circuits"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M10 30 L20 30 L20 10 L40 10"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M40 30 L50 30"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="40" cy="10" r="2.5" fill="white" />
              <circle cx="50" cy="30" r="2" fill="white" />
              <path
                d="M5 50 L15 40 L25 50"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuits)" />
        </svg>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            className="relative flex items-stretch h-full min-h-[160px]"
          >
            {/* Text Side */}
            <div className="flex-1 flex flex-col justify-center p-5 sm:p-6 z-10">
              <h2 className="font-bold text-white text-xl sm:text-2xl leading-tight mb-1">
                {slide.title}
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mb-3 max-w-[200px] sm:max-w-xs">
                {slide.subtitle}
              </p>
              <button
                type="button"
                onClick={(e) => handleCtaClick(e, slide.ctaUrl)}
                className="self-start px-4 py-2 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105"
                style={{
                  backgroundColor: "white",
                  color: slide.accentColor,
                }}
                data-ocid="promo.primary_button"
              >
                {slide.ctaText}
              </button>
            </div>

            {/* Image Side */}
            <div className="w-[40%] sm:w-[45%] relative overflow-hidden flex items-center justify-end">
              <img
                src={slide.productImage}
                alt={slide.title}
                className="h-full w-full object-cover object-left"
                style={{ maxHeight: "180px" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Pagination Dots */}
      <div
        className="flex justify-center gap-2 mt-3"
        role="tablist"
        aria-label="Slides"
      >
        {BANNER_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={idx === current}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => goTo(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === current ? "w-5 h-2 bg-gray-700" : "w-2 h-2 bg-gray-400"
            }`}
            data-ocid={`promo.item.${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
