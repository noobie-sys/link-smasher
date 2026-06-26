"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(155,239,28,${0.03 + i * 0.005})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 696 316"
      fill="none"
    >
      <title>Background Paths</title>
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          stroke={path.color}
          strokeWidth={path.width}
          strokeOpacity={0.1 + path.id * 0.03}
          initial={{ pathLength: 0.3, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: [0, 1, 0.5, 0],
            pathOffset: [0, 1],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  );
}

export function BackgroundPaths({
  title = "Save Links. Find Them Instantly.",
  subtitle,
  ctaLabel = "Join Waitlist",
  ctaHref = "#waitlist",
  children,
}: {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  children?: React.ReactNode;
}) {
  const words = title.split(" ");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0b051f]">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-10 rounded-full border border-[#9bef1c]/20 bg-[#9bef1c]/5 text-xs font-semibold text-[#9bef1c]"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9bef1c] animate-pulse" />
            100% Free &amp; Open Source
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tight">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={letterIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      ease: "easeOut",
                    }}
                    className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            {subtitle ||
              "The keyboard-first browser extension that saves, organizes, and retrieves your links — filtered to the exact site you're on."}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {children ? (
              children
            ) : (
              <a href={ctaHref}>
                <Button
                  size="lg"
                  className="
                    px-8 py-6 text-base font-bold rounded-2xl cursor-pointer
                    bg-[#9bef1c] hover:bg-[#86de12] text-[#0b051f]
                    shadow-[0_0_30px_rgba(155,239,28,0.25)]
                    hover:shadow-[0_0_45px_rgba(155,239,28,0.4)]
                    transition-all duration-300
                    hover:scale-[1.04] active:scale-[0.97]
                    border-0
                  "
                >
                  {ctaLabel}
                </Button>
              </a>
            )}

            <motion.a
              href="#features"
              whileHover={{ x: 4 }}
              className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-2"
            >
              See how it works
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="opacity-60"
              >
                <path
                  d="M3 8h10M8 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/30"
          >
            <span className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-[#9bef1c]"
              >
                <path
                  d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.895l-3.09 1.615L4.5 7.07 2 4.635l3.455-.505L7 1z"
                  fill="currentColor"
                />
              </svg>
              Loved by 12,000+ researchers &amp; developers
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <span>Chrome · Brave · Edge</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
            <span>Zero telemetry</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
