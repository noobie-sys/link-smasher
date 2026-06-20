"use client";

import { useState, useEffect } from "react";

/**
 * A performant custom hook to track the window scroll direction.
 * Returns `true` if scrolling up (or at the top of the page), and `false` if scrolling down.
 * 
 * Uses `requestAnimationFrame` for performance and thresholding to avoid jitter.
 */
export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY;

      // Increase threshold to 15px to prevent accidental/jittery transitions
      if (Math.abs(delta) < 15) {
        ticking = false;
        return;
      }

      if (scrollY <= 50) {
        // Always show near the top of the page
        setIsVisible(true);
      } else if (delta > 0) {
        // Scrolling down (Y positive) -> hide
        setIsVisible(false);
      } else {
        // Scrolling up (Y negative) -> show
        setIsVisible(true);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return isVisible;
}
