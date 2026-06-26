"use client";

import { useState, useEffect } from "react";
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
    </div>
  );
}

function ExtensionSection() {
  const extensionFeatures = [
    {
      title: "Save the active tab",
      description: "Capture the current page with title, URL, domain, and timestamp already filled in.",
      icon: Zap,
    },
    {
      title: "Organize before it lands",
      description: "Choose a vault, add tags, and favorite important resources without opening the dashboard.",
      icon: Folder,
    },
    {
      title: "Keyboard-first capture",
      description: "Use a shortcut-driven flow when you are researching fast and do not want to break focus.",
      icon: Keyboard,
    },
    {
      title: "Private by design",
      description: "The extension sends saved links to your account through the secured app API.",
      icon: Shield,
    },
  ];

  const currentSiteLinks = [
    { title: "Prisma relation queries", source: "prisma.io", tag: "Development" },
    { title: "Next.js route handlers", source: "nextjs.org", tag: "Reference" },
    { title: "Supabase RLS policies", source: "supabase.com", tag: "Security" },
  ];

  return (
    <section className="w-full bg-[#fafafa] border-t border-[#ebebeb] py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7950F7]/25 bg-[#7950F7]/5 text-xs font-semibold text-[#7950F7] select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7] animate-pulse" />
                Chrome Extension
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-[#0a0a0a] font-display">
                Save the web while you are still in flow.
              </h2>
              <p className="text-[#6b6b6b] text-sm sm:text-base leading-relaxed max-w-xl">
                The LyncFlow extension is the fast capture layer for your browser.
                Save a tab, route it to the right vault, add context, and get back
                to reading without opening another app.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extensionFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white border border-[#ebebeb] rounded-2xl p-4 shadow-sm hover:border-[#7950F7]/25 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#7950F7]/10 text-[#7950F7] flex items-center justify-center mb-3">
                    <feature.icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0a0a0a]">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#6b6b6b] leading-relaxed mt-1.5">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {["One-click save", "Site-aware recall", "Tags and vaults", "Dashboard sync"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#7950F7]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#7950F7]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7950F7]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative select-none">
            <div className="relative rounded-3xl border border-[#e6e6e9] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.10)] overflow-hidden">
              <div className="h-12 bg-[#f7f7f8] border-b border-[#e6e6e9] px-4 flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 min-w-0 h-8 rounded-xl border border-[#e2e2e5] bg-white px-3 flex items-center gap-2 text-xs text-[#6b6b6b]">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">https://docs.example.com/research</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#7950F7] text-white flex items-center justify-center text-[10px] font-black shadow-[0_4px_14px_rgba(121,80,247,0.35)]">
                  lf
                </div>
              </div>

              <div className="relative bg-[#fbfbfc] p-5 sm:p-6 lg:p-8 min-h-[560px]">
                <div className="max-w-[520px] space-y-4 pr-0 lg:pr-28">
                  <div className="h-8 w-56 rounded-lg bg-[#e9e9ed]" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded-full bg-[#ededf1]" />
                    <div className="h-3 w-11/12 rounded-full bg-[#ededf1]" />
                    <div className="h-3 w-2/3 rounded-full bg-[#ededf1]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <div className="rounded-2xl border border-[#e8e8ec] bg-white p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a]">
                        <Link2 className="w-4 h-4 text-[#7950F7]" />
                        Matching links
                      </div>
                      <p className="text-[11px] text-[#6b6b6b] mt-2 leading-relaxed">
                        See related saves for the site you are already browsing.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#e8e8ec] bg-white p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0a0a0a]">
                        <History className="w-4 h-4 text-[#06b6d4]" />
                        Recent captures
                      </div>
                      <p className="text-[11px] text-[#6b6b6b] mt-2 leading-relaxed">
                        Every saved page appears in the dashboard automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative lg:absolute lg:top-8 lg:right-8 mt-6 lg:mt-0 w-full lg:w-[330px] rounded-3xl border border-[#dedee4] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#efeff2] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#7950F7] text-white flex items-center justify-center text-[10px] font-black">
                        lf
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#0a0a0a] leading-none">
                          LyncFlow
                        </p>
                        <p className="text-[10px] text-[#8a8a8f] mt-1">
                          Browser extension
                        </p>
                      </div>
                    </div>
                    <Settings className="w-4 h-4 text-[#8a8a8f]" />
                  </div>

                  <div className="p-4 space-y-4">
                    <button className="w-full rounded-2xl bg-[#7950F7] text-white px-4 py-3 flex items-center justify-between text-sm font-bold shadow-[0_8px_22px_rgba(121,80,247,0.28)]">
                      <span className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Save current tab
                      </span>
                      <kbd className="rounded-lg bg-white/20 px-2 py-1 text-[10px] font-mono">
                        CMD K
                      </kbd>
                    </button>

                    <div className="rounded-2xl border border-[#eeeeef] bg-[#fafafa] p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0a0a0a] truncate">
                            Building reliable browser workflows
                          </p>
                          <p className="text-[11px] text-[#6b6b6b] truncate mt-1">
                            docs.example.com/research/browser-workflows
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold text-[#8a8a8f] mb-1.5">
                          Vault
                        </p>
                        <div className="h-10 rounded-xl border border-[#e6e6e9] bg-white px-3 flex items-center justify-between text-xs font-bold text-[#0a0a0a]">
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-[#7950F7] shrink-0" />
                            <span className="truncate">Research</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide font-bold text-[#8a8a8f] mb-1.5">
                          Status
                        </p>
                        <div className="h-10 rounded-xl border border-[#e6e6e9] bg-white px-3 flex items-center gap-2 text-xs font-bold text-[#0a0a0a]">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Favorite
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-bold text-[#8a8a8f] mb-2">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["reading", "browser", "workflow"].map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#7950F7]/8 border border-[#7950F7]/15 px-2.5 py-1 text-[11px] font-bold text-[#7950F7]"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#eeeeef] bg-white overflow-hidden">
                      <div className="px-3 py-2 border-b border-[#eeeeef] flex items-center justify-between">
                        <p className="text-xs font-bold text-[#0a0a0a]">
                          From this site
                        </p>
                        <ExternalLink className="w-3.5 h-3.5 text-[#9ca3af]" />
                      </div>
                      <div className="divide-y divide-[#f0f0f2]">
                        {currentSiteLinks.map((link) => (
                          <div key={link.title} className="p-3">
                            <p className="text-xs font-bold text-[#0a0a0a] truncate">
                              {link.title}
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <span className="text-[10px] text-[#8a8a8f] truncate">
                                {link.source}
                              </span>
                              <span className="text-[10px] font-bold text-[#06b6d4] bg-[#06b6d4]/10 rounded-full px-2 py-0.5 shrink-0">
                                {link.tag}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 lg:mt-8 grid grid-cols-3 gap-3 max-w-[520px]">
                  {[
                    { value: "1 click", label: "to capture" },
                    { value: "3 fields", label: "to organize" },
                    { value: "0 tabs", label: "to switch" },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-[#e8e8ec] bg-white p-3"
                    >
                      <p className="text-sm font-extrabold text-[#0a0a0a]">
                        {metric.value}
                      </p>
                      <p className="text-[10px] font-medium text-[#8a8a8f] mt-1">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: "Capture", text: "Click the toolbar button or shortcut." },
                { step: "Context", text: "Add vault, tags, and favorite state." },
                { step: "Recall", text: "Find it later by site, vault, or search." },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-[#ebebeb] bg-white p-4"
                >
                  <p className="text-xs font-extrabold text-[#7950F7]">
                    {item.step}
                  </p>
                  <p className="text-xs text-[#6b6b6b] leading-relaxed mt-1">
                    {item.text}
                  </p>
                </div>
              ))}
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