"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Zap,
  Keyboard,
  Shield,
  Link2,
  Folder,
  Tag,
  Star,
  ExternalLink,
  History,
  Sparkles,
  Plus,
  Settings,
  ChevronRight,
} from "lucide-react";

// ─── Avatar Stack (mock social proof) ──────────────────────────────────────
const AVATARS = [
  "https://i.pravatar.cc/40?img=1",
  "https://i.pravatar.cc/40?img=2",
  "https://i.pravatar.cc/40?img=3",
  "https://i.pravatar.cc/40?img=4",
  "https://i.pravatar.cc/40?img=5",
];

// ─── Background Shapes ───────────────────────────────────────────────────────
function BackgroundShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <Image
        src="/PUumUbREZYBmHp59xpu05KuD3g.jpg"
        alt="Background Pattern"
        fill
        sizes="100vw"
        className="object-cover object-center"
        priority
      />
    </div>
  );
}

// ─── Bento Visual: Folders / Categories List ──────────────────────────────
function FoldersVisual() {
  const folders = [
    { name: "Development", count: 2, color: "#7950F7" },
    { name: "Social Media", count: 2, color: "#d946ef" },
    { name: "Productivity", count: 1, color: "#06b6d4" },
    { name: "Entertainment", count: 0, color: "#f97316" },
    { name: "Custom Categories", count: 0, color: "#6b7280" },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col gap-2 mt-2 justify-center w-full">
      {folders.map((folder, i) => (
        <div
          key={i}
          className="bg-white border border-[#ebebeb] rounded-xl px-3 py-2 flex items-center justify-between shadow-sm hover:border-[#7950F7]/30 transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: folder.color }}
            />
            <span className="text-xs font-semibold text-[#0a0a0a]">
              {folder.name}
            </span>
          </div>
          <span className="text-[10px] text-[#6b6b6b] font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">
            {folder.count} link{folder.count !== 1 ? "s" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Bento Visual: Domain filter ────────────────────────────────────────────
function DomainVisual() {
  const dots = [
    { cx: 100, cy: 100, r: 96, opacity: 0.02 },
    { cx: 100, cy: 100, r: 80, opacity: 0.04 },
    { cx: 100, cy: 100, r: 64, opacity: 0.07 },
    { cx: 100, cy: 100, r: 48, opacity: 0.12 },
    { cx: 100, cy: 100, r: 32, opacity: 0.22 },
    { cx: 100, cy: 100, r: 18, opacity: 1 },
  ];
  return (
    <div className="flex items-center justify-center h-full relative w-full overflow-hidden select-none">
      {/* Outer concentric pulsing indicator lines */}
      <div className="absolute w-64 h-64 rounded-full border border-[#7950F7]/10 animate-ping duration-1000 opacity-20 pointer-events-none" />

      <svg
        viewBox="0 0 200 200"
        className="w-[320px] h-[320px] overflow-visible drop-shadow-[0_4px_20px_rgba(121,80,247,0.2)] relative z-0"
      >
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="#7950F7"
            fillOpacity={d.opacity}
            className={i < 5 ? "animate-pulse" : ""}
            style={
              i < 5
                ? { animationDelay: `${i * 200}ms`, animationDuration: "3s" }
                : undefined
            }
          />
        ))}
        <text
          x="100"
          y="104"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill="white"
          fontFamily="monospace"
          className="tracking-tight"
        >
          lync
        </text>
      </svg>

      {/* Floating site chips - positioned in 4 quadrants */}
      <div className="absolute top-12 left-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7]" />
        github.com
      </div>
      <div className="absolute top-15 right-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d946ef]" />
        claude.ai
      </div>
      <div className="absolute bottom-10 right-5 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
        arxiv.org
      </div>
      <div className="absolute bottom-4 left-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 text-[9px] font-semibold text-[#0a0a0a] shadow-sm flex items-center gap-1.5 hover:scale-105 hover:border-[#7950F7]/30 transition-all duration-200 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
        reddit.com
      </div>
    </div>
  );
}

// ─── Bento Visual: Dashboard Mockup ──────────────────────────────────────────
function DashboardVisual() {
  const links = [
    {
      title: "Instagram",
      url: "instagram.com",
      date: "6/20/2026",
      color: "#d946ef",
    },
    {
      title: "Any gud movies or web series suggestions pls : r/delhi",
      url: "reddit.com",
      date: "6/16/2026",
      color: "#f97316",
    },
    {
      title: "How jobcopilot works - Claude",
      url: "claude.ai",
      date: "6/16/2026",
      color: "#a78bfa",
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-2 w-full mt-2 select-none">
      {links.map((link, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#ebebeb] rounded-xl p-2.5 shadow-sm hover:border-[#7950F7]/30 transition-all duration-200 flex flex-col gap-1 w-full text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#7950F7] bg-[#7950F7]/5 px-2 py-0.5 rounded-md">
              {link.url}
            </span>
            <span className="text-[9px] text-[#9ca3af] font-mono">
              {link.date}
            </span>
          </div>
          <p className="text-[10px] font-extrabold text-[#0a0a0a] truncate w-[90%]">
            {link.title}
          </p>
          <div className="flex items-center justify-between text-[9px] text-[#9ca3af] mt-0.5 border-t border-[#f5f5f7] pt-1">
            <span className="font-mono">
              ID:{" "}
              {idx === 0
                ? "7d5df8d..."
                : idx === 1
                  ? "fd74256..."
                  : "41c7f40..."}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: link.color }}
              />
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bento Section ───────────────────────────────────────────────────────────
function BentoSection() {
  return (
    <section className="w-full bg-white py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7950F7]/25 bg-[#7950F7]/5 text-xs font-semibold text-[#7950F7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7] animate-pulse" />
            Product Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight font-display">
            A Powerful Workflow,
            <br />
            <span className="text-[#7950F7]">Beautifully</span> Structured
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Detailed Activity & Source Analytics (spans 2 cols on desktop) */}
          <div className="md:col-span-2 bg-[#fafafa] border border-[#ebebeb] rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/25 hover:shadow-[0_12px_40px_rgba(121,80,247,0.06)] hover:translate-y-[-2px] transition-all duration-300 min-h-[460px]">
            <div className="mb-4 p-6 md:p-8 pb-0 md:pb-0 ">
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Curation Insights
              </span>
              <h3 className="text-xl font-bold text-[#0a0a0a] font-display">
                Detailed Activity & Source Analytics
              </h3>
              <p className="text-sm text-[#6b6b6b] max-w-xl mt-1">
                Monitor your collection habits. Review saving trends, track
                weekly resource collection metrics, and see which platforms you
                reference most.
              </p>
            </div>

            {/* Floating dashboard mockup sliding container */}
            <div className="relative w-full flex-1 rounded-t-2xl overflow-hidden min-h-[300px]">
              <Image
                src="/analytics.png"
                alt="Detailed Activity and Source Analytics Dashboard"
                fill
                sizes="(max-width: 768px) 100vw, 680px"
                className="object-cover  "
                priority
              />
            </div>
          </div>

          {/* Card 2 — Top Sources & Metrics (spans 1 col on desktop) */}
          <div className="md:col-span-1 bg-[#fafafa] border border-[#ebebeb] rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/25 hover:shadow-[0_12px_40px_rgba(121,80,247,0.06)] hover:translate-y-[-2px] transition-all duration-300 min-h-[460px]">
            <div className="mb-4 p-4 md:p-6 pb-0 md:pb-0">
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Source Metrics
              </span>
              <h3 className="text-xl font-bold text-[#0a0a0a] font-display">
                Top Sources & Metrics
              </h3>
              <p className="text-sm text-[#6b6b6b] mt-1">
                View which platforms you save from most and track overall saving
                benchmarks.
              </p>
            </div>

            {/* Floating stats breakdown sliding container */}
            <div className="relative w-full flex-1 rounded-t-2xl overflow-hidden min-h-[280px]">
              <Image
                src="/stats.jpeg"
                alt="Stats Overview Breakdown"
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                className="object-cover rounded-t-2xl object-left"
                priority
              />
            </div>
          </div>

          {/* Card 3 — Organized Vaults (spans 1 col) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/25 hover:shadow-[0_12px_40px_rgba(121,80,247,0.06)] hover:translate-y-[-2px] transition-all duration-300 min-h-[340px] md:h-[410px]">
            <div className="p-6 pb-0">
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Custom Categories
              </span>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1 font-display">
                Organized Vaults
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Sort your links into dedicated folders with custom theme colors
                to keep your research structured.
              </p>
            </div>
            <FoldersVisual />
          </div>

          {/* Card 4 — Smart Filtering (spans 1 col) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/25 hover:shadow-[0_12px_40px_rgba(121,80,247,0.06)] hover:translate-y-[-2px] transition-all duration-300 min-h-[340px] md:h-[410px]">
            <div>
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Context-Aware Views
              </span>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1 font-display">
                Smart Filtering
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Automatically filters your vault to show links matching the
                website you are currently browsing.
              </p>
            </div>
            <DomainVisual />
          </div>

          {/* Card 5 — Link Vault Dashboard (spans 1 col) */}
          <div className="bg-[#fafafa] border border-[#ebebeb] rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative group hover:border-[#7950F7]/25 hover:shadow-[0_12px_40px_rgba(121,80,247,0.06)] hover:translate-y-[-2px] transition-all duration-300 min-h-[340px] md:h-[410px]">
            <div>
              <span className="text-[10px] text-[#7950F7] uppercase font-bold tracking-wider mb-1 block">
                Vault Repository
              </span>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1 font-display">
                Link Vault
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Your secure repository for everything you save. Easily browse,
                search, and manage your collection from a clean web dashboard.
              </p>
            </div>

            <div className="my-2 w-full">
              <DashboardVisual />
            </div>

            <div className="flex gap-2 flex-wrap mt-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                Searchable
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#7950F7]/8 text-[#7950F7] border border-[#7950F7]/15 font-medium">
                Vault
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      {/* ── Hero / Waitlist ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <BackgroundShapes />
        <main className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-2xl mx-auto py-16">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Image
              src="/lnkr.png"
              alt="LyncFlow Logo"
              width={64}
              height={64}
              className="rounded-2xl"
              priority
            />
            <span className="text-[#7950F7] font-bold text-2xl tracking-tight font-display">
              LyncFlow
            </span>
          </div>

          {/* Coming Soon badge */}
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7950F7] text-white text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Coming Soon
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight mb-4 font-display">
            Streamline how you save and organize the web.
          </h1>

          {/* Subtext */}
          <p className="text-[#6b6b6b] text-base sm:text-lg mb-10 max-w-xl leading-relaxed">
            LyncFlow helps developers, researchers, and creators save web
            resources instantly, group them into theme-colored vaults, and track
            collection trends over time.
          </p>

          {/* Waitlist Form */}
          <div className="w-full max-w-md mb-8">
            <WaitlistForm />
          </div>

          {/* Social proof */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-[#6b6b6b]">
              Join with{" "}
              <span className="font-semibold text-[#0a0a0a]">15+</span> others
              on waitlist
            </p>
            <div className="flex items-center -space-x-2">
              {AVATARS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`User ${i + 1}`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ── Bento Features Section ── */}
      <BentoSection />

      {/* ── Extension Feature Section ── */}
      <ExtensionSection />

      {/* ── FAQ Section ── */}
      <FAQSection />

      {/* ── CTA Section ── */}
      <CTASection />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

function ExtensionSection() {
  return (
    <section
      className="relative w-full overflow-hidden border-t border-[#ebebeb] py-28 px-4 sm:px-6 lg:px-8 select-none"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, #ffffff 15%, #f5f0ff 60%, #e8ddff 100%)",
      }}
    >
      {/* Background radial grid glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(121,80,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(121,80,247,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Split Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-12 lg:gap-16 items-center mb-20">
          {/* Left Side: Title & Subtitle */}
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7950F7]/25 bg-[#7950F7]/5 text-xs font-semibold text-[#7950F7] select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7] animate-pulse" />
              Chrome Extension
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-[#0a0a0a] font-display">
              Save the web while you are still in flow.
            </h2>
            <p className="text-[#6b6b6b] text-sm sm:text-base leading-relaxed max-w-2xl">
              The LyncFlow extension is the fast capture layer for your browser.
              Save a tab, route it to the right vault, add context, and get back
              to reading without opening another app.
            </p>
          </div>

          {/* Right Side: The Box (Chrome Web Store download card) */}
          <div className="relative group/box w-full max-w-sm mx-auto lg:mr-0">
            <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-[#7950F7]/15 via-[#06b6d4]/10 to-transparent blur-2xl group-hover/box:scale-105 transition-all duration-500" />
            <div className="relative border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_16px_50px_rgba(15,23,42,0.06)] rounded-3xl p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:border-[#7950F7]/25 hover:shadow-[0_20px_60px_rgba(121,80,247,0.1)]">
              <div className="space-y-3">
                {/* Brand Header */}
                <div className="flex items-center gap-3">
                  {/* LyncFlow Actual Logo */}
                  <Image
                    src="/lnkr.png"
                    alt="LyncFlow Logo"
                    width={40}
                    height={40}
                    className="rounded-xl shrink-0"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-[#0a0a0a]">
                      LyncFlow for Chrome
                    </h4>
                    <p className="text-[10px] text-[#8a8a8f] mt-0.5">
                      Offered by lyncflow.com
                    </p>
                  </div>
                </div>

                {/* Ratings & Users */}
                <div className="flex items-center gap-4 py-1.5 px-3 bg-black/[0.02] rounded-xl border border-black/[0.02] text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                    <span>4.9</span>
                    <div className="flex text-[10px]">★★★★★</div>
                  </div>
                  <div className="w-px h-3 bg-black/10" />
                  <span className="text-[#6b6b6b] font-semibold">
                    2,450+ users
                  </span>
                </div>
              </div>

              {/* Install Button CTA */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="w-full bg-[#7950F7] text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#683ded] shadow-[0_8px_22px_rgba(121,80,247,0.3)] font-extrabold text-sm transition-all duration-300 active:scale-95 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Add to Chrome
              </a>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid (matching the design in the second reference) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Fast Capture */}
          <div className="group bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.03)] hover:shadow-[0_24px_60px_rgba(121,80,247,0.08)] hover:border-[#7950F7]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Visual Box on top */}
            <div className="w-full aspect-[16/10] bg-[#faf9ff]/80 border border-[#eeeaff] rounded-2xl overflow-hidden mb-6 flex flex-col justify-between p-4 relative shadow-inner">
              {/* Mock Browser Header */}
              <div className="flex items-center justify-between border-b border-black/[0.04] pb-2 w-full">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 max-w-[120px] mx-2 h-5 rounded-md border border-black/[0.04] bg-white px-2 flex items-center text-[9px] text-[#8a8a8f] truncate font-mono">
                  nextjs.org/docs
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#7950F7]/10 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7]" />
                </div>
              </div>

              {/* Saved Success Popup */}
              <div className="flex-1 flex flex-col items-center justify-center py-2 space-y-3">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#7950F7]/15 shadow-[0_8px_20px_rgba(121,80,247,0.06)] group-hover:scale-105 transition-all duration-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-[#0a0a0a]">
                    Saved to LyncFlow
                  </span>
                </div>

                {/* Keycap Shortcuts */}
                <div className="flex items-center gap-1 text-[10px] text-[#8a8a8f] font-medium">
                  <span>Press</span>
                  <kbd className="px-1.5 py-0.5 rounded border border-black/[0.08] bg-white shadow-sm font-sans font-bold text-[#444] text-[9px]">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded border border-black/[0.08] bg-white shadow-sm font-sans font-bold text-[#444] text-[9px]">
                    ⌥
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded border border-black/[0.08] bg-white shadow-sm font-sans font-bold text-[#444] text-[9px]">
                    S
                  </kbd>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#0a0a0a]">
                One-Click Save
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Capture the current page with title, URL, domain, and timestamp
                pre-filled automatically in a fraction of a second.
              </p>
            </div>
          </div>

          {/* Card 2: Smart Organization */}
          <div className="group bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.03)] hover:shadow-[0_24px_60px_rgba(121,80,247,0.08)] hover:border-[#7950F7]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Visual Box on top */}
            <div className="w-full aspect-[16/10] bg-[#faf9ff]/80 border border-[#eeeaff] rounded-2xl overflow-hidden mb-6 flex flex-col justify-center p-4 relative shadow-inner space-y-3">
              {/* Mock Dropdown Selector */}
              <div className="bg-white rounded-xl border border-[#7950F7]/15 p-2 shadow-sm space-y-1.5">
                <div className="text-[8px] uppercase tracking-wider font-extrabold text-[#8a8a8f] px-1">
                  Select Vault
                </div>
                <div className="flex items-center justify-between bg-[#7950F7]/5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#7950F7]">
                  <span className="flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5" />
                    Research & Dev
                  </span>
                  <svg
                    className="w-3 h-3 text-[#7950F7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Interactive Tag Bubbles */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    label: "nextjs",
                    color: "text-[#7950F7] bg-[#7950F7]/8 border-[#7950F7]/15",
                  },
                  {
                    label: "learning",
                    color: "text-[#06b6d4] bg-[#06b6d4]/8 border-[#06b6d4]/15",
                  },
                  {
                    label: "reference",
                    color: "text-[#d946ef] bg-[#d946ef]/8 border-[#d946ef]/15",
                  },
                ].map((tag, idx) => (
                  <span
                    key={tag.label}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold transition-all duration-300 group-hover:scale-105 ${tag.color}`}
                    style={{ transitionDelay: `${idx * 75}ms` }}
                  >
                    <Tag className="w-2.5 h-2.5" />#{tag.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#0a0a0a]">
                Direct Routing
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Choose a vault, add tags, and favorite important resources right
                from the extension popup without opening the web dashboard.
              </p>
            </div>
          </div>

          {/* Card 3: Interactive Command Palette */}
          <div className="group bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.03)] hover:shadow-[0_24px_60px_rgba(121,80,247,0.08)] hover:border-[#7950F7]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">
            {/* Visual Box on top */}
            <div className="w-full aspect-[16/10] bg-[#faf9ff]/80 border border-[#eeeaff] rounded-2xl overflow-hidden mb-6 flex flex-col justify-center p-4 relative shadow-inner">
              {/* Command Palette Mockup */}
              <div className="bg-white rounded-xl border border-black/[0.06] shadow-md p-3.5 space-y-2.5 w-full">
                {/* Search Bar */}
                <div className="flex items-center gap-2 border-b border-black/[0.04] pb-2 text-[9px] text-[#8a8a8f]">
                  <svg
                    className="w-3 h-3 text-[#9ca3af]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Search commands...</span>
                </div>

                {/* Commands list */}
                <div className="space-y-1">
                  {/* Active Row */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#7950F7]/5 border-l-2 border-[#7950F7] text-[#7950F7]">
                    <span className="text-[10px] font-extrabold flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      Save current tab
                    </span>
                    <kbd className="text-[8px] bg-white border border-[#7950F7]/20 text-[#7950F7] px-1 rounded shadow-2xs font-mono font-bold">
                      Enter
                    </kbd>
                  </div>

                  {/* Vault command */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-zinc-700 hover:bg-black/[0.02]">
                    <span className="text-[10px] font-bold flex items-center gap-1.5">
                      <Folder className="w-3 h-3 text-zinc-400" />
                      Route to Vault...
                    </span>
                    <kbd className="text-[8px] bg-black/[0.02] border border-black/[0.08] text-zinc-500 px-1 rounded shadow-2xs font-mono font-bold">
                      ⌥ V
                    </kbd>
                  </div>

                  {/* Tags command */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-zinc-700 hover:bg-black/[0.02]">
                    <span className="text-[10px] font-bold flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-zinc-400" />
                      Add Custom Tags...
                    </span>
                    <kbd className="text-[8px] bg-black/[0.02] border border-black/[0.08] text-zinc-500 px-1 rounded shadow-2xs font-mono font-bold">
                      ⌥ T
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-[#0a0a0a]">
                Interactive Command Palette
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Manage your captures entirely via keyboard shortcuts. Search,
                tag, or route links to different vaults without lifting your
                hands.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Waitlist Form ──────────────────────────────────────────────────────────
function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Something went wrong.");
      setStatus("success");
      setMessage(data.message || "You're on the list! We'll be in touch.");
      setEmail("");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full rounded-2xl border border-[#e5e5e5] bg-white shadow-[0_2px_24px_rgba(121,80,247,0.08)] overflow-hidden pr-1.5 pl-4 py-1.5 gap-2"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading" || status === "success"}
          className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder-[#9ca3af] focus:outline-none disabled:opacity-50 min-w-0"
        />

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={cn(
            "shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200",
            "bg-[#7950F7] hover:bg-[#6a3de8] active:scale-95",
            "shadow-[0_2px_12px_rgba(121,80,247,0.35)] hover:shadow-[0_4px_20px_rgba(121,80,247,0.5)]",
            "disabled:opacity-60 disabled:pointer-events-none cursor-pointer",
          )}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Joining...
            </span>
          ) : status === "success" ? (
            "Joined! 🎉"
          ) : (
            "Join Now"
          )}
        </button>
      </form>

      <div className="h-[2px] w-full rounded-b-2xl bg-gradient-to-r from-transparent via-[#7950F7]/40 to-transparent mt-0" />
      <span className="text-xs text-[#7950F7] font-[600] text-shadow-2xs">
        Join the waitlist for updates and early access
      </span>

      {message && (
        <p
          className={cn(
            "mt-3 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 duration-300",
            status === "success" ? "text-[#7950F7]" : "text-rose-500",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// ─── CTA Section ────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 mb-8">
      <div
        className="max-w-6xl mx-auto rounded-[2.5rem] border border-black/[0.04] py-20 px-6 sm:px-12 flex flex-col items-center text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
        style={{
          background: "linear-gradient(180deg, #fbfbfe 0%, #f4efff 100%)",
        }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(121,80,247,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(121,80,247,0.012)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Actual Logo Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/[0.05] bg-white text-xs font-bold text-[#0a0a0a] shadow-sm mb-6 select-none relative z-10">
          <Image
            src="/lnkr.png"
            alt="LyncFlow Logo"
            width={20}
            height={20}
            className="rounded-md shrink-0"
          />
          <span>LyncFlow</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] max-w-2xl leading-tight mb-4 relative z-10 font-display">
          Join the waitlist today!
        </h2>

        {/* Description */}
        <p className="text-[#6b6b6b] text-sm sm:text-base mb-10 max-w-xl leading-relaxed relative z-10">
          Managing your bookmarks shouldn't be a chore. Skip browser clutter,
          organize your research into theme-colored vaults, and keep your flow
          unbroken.
        </p>

        {/* Waitlist Form */}
        <div className="w-full max-w-md relative z-10 mb-6">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Section ────────────────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does LyncFlow organize my links?",
      answer:
        "LyncFlow groups your saved links into theme-colored vaults. You can add custom tags and descriptions to search and filter them easily from your dashboard or extension.",
    },
    {
      question: "Is the Chrome extension free to use?",
      answer:
        "Yes, the Chrome extension is completely free. It serves as a rapid-capture layer, allowing you to save resources, select vaults, and add tags directly from your active browser tab.",
    },
    {
      question: "Can I query my links offline?",
      answer:
        "LyncFlow caches your search history and index locally within the extension database, enabling quick keyboard-first searches even when you lose internet connection.",
    },
    {
      question: "Does LyncFlow support custom keyboard shortcuts?",
      answer:
        "Absolutely. You can open LyncFlow using customizable global hotkeys, save with a single click, and navigate the entire popup interface using keyboard shortcuts without touch inputs.",
    },
  ];

  return (
    <section className="w-full bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-[#ebebeb]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side: Generated Desk Setup Image */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden border border-black/[0.04] shadow-[0_16px_50px_rgba(15,23,42,0.06)] group">
            <Image
              src="/faq_desk.png"
              alt="Workspace Desk Setup"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Right Side: FAQ Accordion */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7950F7]">
                FAQ's
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] font-display mt-2">
                Looking for answer?
              </h2>
              <p className="text-[#6b6b6b] text-sm sm:text-base leading-relaxed mt-4">
                Find answers to commonly asked questions about LyncFlow, link
                organization, and setting up keyboard-first workflows.
              </p>
            </div>

            <div className="divide-y divide-[#efeff2] border-t border-b border-[#efeff2] mt-8">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[#0a0a0a] hover:text-[#7950F7] transition-colors py-2 cursor-pointer group"
                  >
                    <span>{faq.question}</span>
                    <svg
                      className={cn(
                        "w-4.5 h-4.5 text-[#8a8a8f] shrink-0 transition-transform duration-300 group-hover:text-[#7950F7]",
                        openIndex === idx && "rotate-180 text-[#7950F7]",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out text-xs sm:text-sm text-[#6b6b6b] leading-relaxed",
                      openIndex === idx
                        ? "max-h-40 mt-2 opacity-100"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    <p className="pb-2">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer Section ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="w-full border-t border-black/[0.04] bg-[#fafafa]/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a8a8f]">
        <div className="flex items-center gap-2">
          <Image
            src="/lnkr.png"
            alt="LyncFlow Logo"
            width={16}
            height={16}
            className="rounded-md opacity-80"
          />
          <span className="font-bold text-zinc-700">LyncFlow</span>
          <span className="text-zinc-400">|</span>
          <span>
            © {new Date().getFullYear()} LyncFlow. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-[#7950F7] transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-[#7950F7] transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-[#7950F7] transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
