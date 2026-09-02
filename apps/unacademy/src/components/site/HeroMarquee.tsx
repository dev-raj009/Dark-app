import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Landmark, FlaskConical, Dna, Trophy, BookOpen } from "lucide-react";
import type { Course, Teacher } from "@/lib/uc";

export interface FeaturedCourseSlide {
  uid: string;
  name: string;
  thumbnail: string;
  categoryName: string;
  categoryEmoji: React.ReactNode;
  educatorName?: string;
  educatorAvatar?: string;
  itemCount?: number;
}

// Fallback high quality course banners if courses are loading
const DEFAULT_COURSE_SLIDES: FeaturedCourseSlide[] = [
  {
    uid: "M9WQ6SDA",
    name: "Mrunal’s Complete Economy for UPSC Prelims & Mains",
    thumbnail:
      "https://edge.uacdn.net/static/thumbnail/course/42826deef60d4b8e8f81014e7a6858e7.png?q=100&w=1080",
    categoryName: "UPSC CSE",
    categoryEmoji: <Landmark className="h-4 w-4" />,
    educatorName: "Mrunal Patel",
    itemCount: 85,
  },
  {
    uid: "1K4N72W8",
    name: "Complete Physics for JEE Main & Advanced",
    thumbnail:
      "https://edge.uacdn.net/static/thumbnail/course/b8d7ad45e69e4f55928fcf497b795240.png?q=100&w=1080",
    categoryName: "IIT JEE",
    categoryEmoji: <FlaskConical className="h-4 w-4" />,
    educatorName: "Namo Kaul",
    itemCount: 64,
  },
  {
    uid: "P3O4X5Y6",
    name: "Ultimate Biology Crash Course for NEET UG",
    thumbnail:
      "https://edge.uacdn.net/static/thumbnail/course/472b5efec82c40c39fbbbe665a5704a2.png?q=100&w=1080",
    categoryName: "NEET UG",
    categoryEmoji: <Dna className="h-4 w-4" />,
    educatorName: "Dr. Anand Mani",
    itemCount: 72,
  },
  {
    uid: "S9T8U7V6",
    name: "Complete Quantitative Aptitude & Reasoning for SSC",
    thumbnail:
      "https://edge.uacdn.net/static/thumbnail/course/55f4634f1ec5418b84cb18dafb759085.png?q=100&w=1080",
    categoryName: "SSC CGL",
    categoryEmoji: <Trophy className="h-4 w-4" />,
    educatorName: "Abhinay Sharma",
    itemCount: 92,
  },
];

interface HeroMarqueeProps {
  courses?: (Course & {
    categoryName?: string;
    categoryEmoji?: React.ReactNode;
    educator?: Teacher;
  })[];
}

export default function HeroMarquee({ courses = [] }: HeroMarqueeProps) {
  // Extract courses that have valid thumbnails
  const dynamicSlides: FeaturedCourseSlide[] = courses
    .filter((c) => Boolean(c.thumbnail || c.thumbnailV1))
    .slice(0, 8)
    .map((c) => ({
      uid: c.uid,
      name: c.name || "Featured Comprehensive Course",
      thumbnail: c.thumbnail || c.thumbnailV1 || "",
      categoryName: c.categoryName || "Featured Course",
      categoryEmoji: c.categoryEmoji || <BookOpen className="h-4 w-4" />,
      educatorName: c.educator?.first_name
        ? `${c.educator.first_name} ${c.educator.last_name || ""}`.trim()
        : undefined,
      educatorAvatar: c.educator?.avatar,
      itemCount: c.itemCount ?? c.item_count,
    }));

  const slides = dynamicSlides.length > 0 ? dynamicSlides : DEFAULT_COURSE_SLIDES;

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const activeSlide = slides[current] || slides[0];

  return (
    <div
      className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-md p-1"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="glass relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border/60 shadow-2xl sm:aspect-[21/9]">
        {/* Course Thumbnail Slides with left/right transition */}
        {slides.map((slide, idx) => {
          const isActive = idx === current;
          return (
            <Link
              key={`${slide.uid}-${idx}`}
              to="/course/$courseUid"
              params={{ courseUid: slide.uid }}
              search={{ t: slide.name }}
              className={`group absolute inset-0 block transition-all duration-700 ease-out ${
                isActive
                  ? "pointer-events-auto scale-100 opacity-100 translate-x-0"
                  : idx < current
                    ? "pointer-events-none scale-95 opacity-0 -translate-x-full"
                    : "pointer-events-none scale-95 opacity-0 translate-x-full"
              }`}
            >
              <img
                src={slide.thumbnail}
                alt={slide.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              {/* High contrast gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />

              {/* Course Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 text-white sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    <span>{slide.categoryEmoji}</span>
                    <span>{slide.categoryName}</span>
                  </span>
                  {typeof slide.itemCount === "number" && slide.itemCount > 0 && (
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                      {slide.itemCount} Lessons
                    </span>
                  )}
                  {slide.educatorName && (
                    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                      {slide.educatorAvatar && (
                        <img
                          src={slide.educatorAvatar}
                          alt=""
                          className="h-3.5 w-3.5 rounded-full object-cover"
                        />
                      )}
                      <span>By {slide.educatorName}</span>
                    </span>
                  )}
                </div>

                <h2 className="mt-2.5 line-clamp-2 font-display text-sm font-black tracking-tight text-white drop-shadow-md transition-colors group-hover:text-primary sm:text-2xl md:text-3xl">
                  {slide.name}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-primary sm:text-sm">
                  <span className="inline-flex items-center gap-1 underline underline-offset-4">
                    Course Dekhein & Seekhein →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous course"
          className="glass absolute left-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white transition-all hover:scale-110 hover:bg-white/25 active:scale-95 sm:left-4 sm:h-12 sm:w-12"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next course"
          className="glass absolute right-3 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white transition-all hover:scale-110 hover:bg-white/25 active:scale-95 sm:right-4 sm:h-12 sm:w-12"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 sm:bottom-5 sm:right-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrent(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? "w-7 bg-primary" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
