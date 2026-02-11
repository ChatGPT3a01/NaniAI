"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BANNERS = [
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20241016.png",
    link: "https://shop.nani1953.com.tw/",
    alt: "南一購物網",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20240408.jpg",
    link: "https://naniedtor2.wixsite.com/reading",
    alt: "閱讀推廣",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20230811.jpg",
    link: "https://youtu.be/ECJdiR54T1U",
    alt: "影片介紹",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20230505.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=3&id1=98&id2=&year=112",
    alt: "書籍系列",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20230221.jpg",
    link: "https://www.c-spotlight.com/book/series.jsp?Grade=0&id2=%E8%A5%BF%E6%96%B9",
    alt: "聚光燈書系",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20220824.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=5&id1=4207&year=111",
    alt: "精選書籍",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20220531.jpg",
    link: "https://www.books.com.tw/products/0010925610",
    alt: "博客來推薦",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20220420.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=5&id2=%E9%88%94%E8%83%BD%E6%88%B0%E5%A3%AB",
    alt: "鈔能戰士",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20220325.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=5&id1=3427&year=111",
    alt: "書籍推薦",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20220107.jpg",
    link: "https://onebox2.oneclass.com.tw/",
    alt: "OneBox 2.0",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20211117.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=5&id1=3980&year=111",
    alt: "精選書籍",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20211109.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=3&id2=%E6%9C%83%E8%80%83%E6%94%BB%E7%95%A5",
    alt: "會考攻略",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20211102.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=5&id2=%E8%87%BA%E7%81%A3%E6%AD%B7%E5%8F%B2",
    alt: "臺灣歷史",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210929-1.jpg",
    link: "https://bit.ly/3CyCRMf",
    alt: "活動推廣",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210809.jpg",
    link: "https://bit.ly/3xBlFCm",
    alt: "活動推廣",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210803.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=1&id1=3808&year=110&utm_source=NaniWeb&utm_medium=banner&utm_id=%E5%B9%BC%E6%95%99",
    alt: "幼教書籍",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210602.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=1&id1=3593&year=110",
    alt: "書籍推薦",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210511-1.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=3&id2=108%E8%AA%B2%E7%B6%B1%E8%87%AA%E7%84%B6%E9%81%A9%E7%94%A8",
    alt: "108課綱自然",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210511-3.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=3&id2=108%E8%AA%B2%E7%B6%B1%E6%95%B8%E5%AD%B8%E9%81%A9%E7%94%A8",
    alt: "108課綱數學",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20210222-2.png",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=1&id1=3476&year=110",
    alt: "書籍推薦",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20201215.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=1&id1=3395&utm_source=NaniWeb&utm_medium=BN&utm_campaign=%E7%A6%AE%E7%89%A9",
    alt: "禮物推薦",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20201126.jpg",
    link: "https://shopping.nani.com.tw/book/only.jsp?seriesno=5&id1=3365&utm_source=NaniWeb&utm_medium=BN&utm_campaign=KIDO%E8%AE%80%E5%BF%83%E7%B6%93",
    alt: "KIDO讀心經",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20190704-1.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=3&id2=%E9%BB%9E%E7%B7%9A%E9%9D%A2&utm_source=NaniWeb&utm_medium=BN&utm_campaign=%E9%BB%9E%E7%B7%9A%E9%9D%A2%E5%85%A8%E6%96%B9%E4%BD%8D",
    alt: "點線面全方位",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20190531-3.jpg",
    link: "http://bit.ly/2ELtKvN",
    alt: "活動推廣",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20190528.jpg",
    link: "http://bit.ly/2EF4XcJ",
    alt: "活動推廣",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20190517.jpg",
    link: "https://shopping.nani.com.tw/book/series.jsp?seriesno=3&id2=%E5%AD%97%E5%BD%99&utm_source=NaniWeb&utm_medium=BN&utm_campaign=%E5%96%AE%E5%AD%97%E8%83%8C%E5%A4%9A%E5%88%86",
    alt: "單字背多分",
  },
  {
    image: "https://trans.nani.com.tw/NaniWeb/images/front-end/top/bn20190416.jpg",
    link: "http://bit.ly/2v8Kwj6",
    alt: "活動推廣",
  },
];

const LEN = BANNERS.length;

function idx(i: number) {
  return ((i % LEN) + LEN) % LEN;
}

// All positions use `left` so CSS can transition smoothly between any position.
// We render 7 slides (current ± 3). Positions -3/+3 are offscreen entry/exit points.
// React reuses DOM elements by banner-index key → CSS transition animates the movement.
function getSlideStyle(position: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    transition: "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
    top: "50%",
    height: "88%",
    width: "30%",
  };

  if (position <= -3) {
    return { ...base, left: "-30%", transform: "translateY(-50%) scale(0.7)", opacity: 0, zIndex: 0 };
  }
  if (position === -2) {
    return {
      ...base, left: "-15%",
      transform: "translateY(-50%) rotateY(30deg) scale(0.8)",
      transformOrigin: "right center", opacity: 0, zIndex: 0, filter: "brightness(0.4)",
    };
  }
  if (position === -1) {
    return {
      ...base, left: "1%",
      transform: "translateY(-50%) rotateY(30deg) scale(0.9)",
      transformOrigin: "right center", opacity: 1, zIndex: 1, filter: "brightness(0.6)",
    };
  }
  if (position === 0) {
    return {
      ...base, left: "21%", width: "58%", height: "92%",
      transform: "translateY(-50%) translateZ(50px)",
      opacity: 1, zIndex: 3, filter: "brightness(1)",
      boxShadow: "0 0 15px rgba(0,0,0,0.3), 4px 0 10px rgba(0,0,0,0.15), -4px 0 10px rgba(0,0,0,0.15)",
    };
  }
  if (position === 1) {
    return {
      ...base, left: "69%",
      transform: "translateY(-50%) rotateY(-30deg) scale(0.9)",
      transformOrigin: "left center", opacity: 1, zIndex: 1, filter: "brightness(0.6)",
    };
  }
  if (position === 2) {
    return {
      ...base, left: "85%",
      transform: "translateY(-50%) rotateY(-30deg) scale(0.8)",
      transformOrigin: "left center", opacity: 0, zIndex: 0, filter: "brightness(0.4)",
    };
  }
  // position >= 3
  return { ...base, left: "100%", transform: "translateY(-50%) scale(0.7)", opacity: 0, zIndex: 0 };
}

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent((prev) => idx(prev + dir));
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating]
  );

  const next = useCallback(() => navigate(1), [navigate]);
  const prev = useCallback(() => navigate(-1), [navigate]);

  const goTo = useCallback(
    (i: number) => {
      if (isAnimating || i === current) return;
      setIsAnimating(true);
      setCurrent(i);
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating, current]
  );

  // Auto-play every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Scroll thumbnail strip to keep active thumbnail visible
  useEffect(() => {
    if (thumbRef.current) {
      const activeThumb = thumbRef.current.children[current] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [current]);

  // Render 7 slides (current ± 3) — extra 2 are offscreen for entry/exit animation.
  // Key by banner index so React reuses DOM elements → CSS transitions animate smoothly.
  const visibleSlides = [-3, -2, -1, 0, 1, 2, 3].map((offset) => ({
    index: idx(current + offset),
    position: offset,
  }));

  return (
    <div className="mb-8">
      {/* Main carousel area */}
      <div
        className="group relative overflow-hidden"
        style={{ backgroundColor: "#c8c8d8" }}
      >
        <div
          className="relative h-[400px] w-full"
          style={{ perspective: "1200px" }}
        >
          {visibleSlides.map(({ index: i, position }) => {
            const banner = BANNERS[i];
            const style = getSlideStyle(position);
            const isCenter = position === 0;

            const content = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className={cn(
                    "pointer-events-none select-none",
                    isCenter
                      ? "max-h-full max-w-full object-contain"
                      : "h-full w-full object-cover"
                  )}
                />
              </>
            );

            if (isCenter) {
              return (
                <a
                  key={`slide-${i}`}
                  href={banner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center overflow-hidden"
                  style={style}
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={`slide-${i}`}
                className="cursor-pointer overflow-hidden"
                style={style}
                onClick={position < 0 ? prev : next}
              >
                {content}
              </div>
            );
          })}

          {/* Left arrow */}
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-7 -translate-y-1/2 items-center justify-center bg-black/30 text-white/80 transition-all hover:bg-black/50 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-7 -translate-y-1/2 items-center justify-center bg-black/30 text-white/80 transition-all hover:bg-black/50 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div
        className="relative px-8 py-2"
        style={{ backgroundColor: "#8a8a9a" }}
      >
        {/* Thumb left arrow */}
        <button
          onClick={prev}
          className="absolute left-0 top-0 z-10 flex h-full w-8 items-center justify-center text-white/70 transition-colors hover:text-white"
          style={{ backgroundColor: "#6a6a7a" }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Thumbnails */}
        <div
          ref={thumbRef}
          className="flex gap-1.5 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {BANNERS.map((banner, i) => (
            <a
              key={i}
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => goTo(i)}
              className={cn(
                "shrink-0 overflow-hidden border-2 transition-all duration-300 hover:scale-110 hover:z-10",
                i === current
                  ? "border-white opacity-100 scale-105"
                  : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image}
                alt={banner.alt}
                className="h-[48px] w-[85px] object-cover"
              />
            </a>
          ))}
        </div>

        {/* Thumb right arrow */}
        <button
          onClick={next}
          className="absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center text-white/70 transition-colors hover:text-white"
          style={{ backgroundColor: "#6a6a7a" }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
