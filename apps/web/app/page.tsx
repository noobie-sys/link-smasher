"use client";

import { useState, useEffect } from "react";
import {
  Link2, Copy, Check, Zap, Shield, Search, Globe,
  Layers, ChevronRight, ExternalLink, Sparkles,
  Command, Eye, HelpCircle, Download, Server,
  Star, Clock, MousePointer, Database, Lock,
  ArrowRight, Keyboard, Folder,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { cn } from "@/lib/utils";


// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_LINKS = [
  { id: 1, original: "https://github.com/google-deepmind/alphafold", title: "AlphaFold Structure Analysis", short: "crust.link/alphafold", site: "github.com", category: "Research" },
  { id: 2, original: "https://nextjs.org/docs/app/building-your-application", title: "Next.js App Router Docs", short: "crust.link/next-docs", site: "nextjs.org", category: "Docs" },
  { id: 3, original: "https://arxiv.org/abs/1706.03762", title: "Attention Is All You Need", short: "crust.link/transformer", site: "arxiv.org", category: "AI Paper" },
  { id: 4, original: "https://tailwindcss.com/docs/installation", title: "Tailwind CSS Configuration Guide", short: "crust.link/tw-config", site: "tailwindcss.com", category: "CSS" },
  { id: 5, original: "https://supabase.com/docs/guides/database", title: "Supabase Database Schema Setup", short: "crust.link/sb-db", site: "supabase.com", category: "Database" },
];

const TESTIMONIALS = [
  { name: "Arjun Mehta", role: "ML Researcher", text: "I save 30+ papers a day. Link Crust's domain isolation means I instantly see only the arXiv links when I'm on arXiv. Genuinely game-changing.", stars: 5 },
  { name: "Sofia Lindqvist", role: "Senior Frontend Engineer", text: "Alt+S → Alt+K. That's literally the whole workflow. I've retired my bookmark folders entirely. The glassmorphic HUD feels incredible.", stars: 5 },
  { name: "Marcus Webb", role: "Technical Writer", text: "The Shadow DOM isolation means it never breaks the pages I'm reading. It's the first extension I've used that just works everywhere.", stars: 5 },
  { name: "Priya Natarajan", role: "Product Manager", text: "I share crust.link short links in Notion pages and Slack threads. Having a vault that syncs across all my devices is everything.", stars: 5 },
  { name: "Daniel Kowalski", role: "PhD Student, CS", text: "Before Link Crust I had 600 tabs open. Now I smash them on save and pull them up filtered by site. My browser RAM usage dropped 80%.", stars: 5 },
  { name: "Hana Yoshida", role: "Design Engineer", text: "The UI is honestly better designed than most SaaS products I pay for. Free, open-source, and works offline too. There's no downside.", stars: 5 },
];

const FEATURES = [
  { icon: Zap,      color: "lk-primary",   label: "Hotkey",     title: "Instant Alt+S Save",      desc: "One keystroke captures the active tab — URL, title, domain, and timestamp — without switching context or opening a new page." },
  { icon: Command,  color: "lk-accent",    label: "Overlay",    title: "Alt+K Spotlight HUD",     desc: "A glassmorphic command-palette modal appears over any webpage in under 100ms. Search, copy, and manage links without leaving your flow." },
  { icon: Globe,    color: "lk-secondary", label: "Filter",     title: "Domain Isolation",        desc: "The HUD automatically filters to only show links saved from the domain you're currently on. Zero scrolling through unrelated results." },
  { icon: Database, color: "lk-accent",    label: "Postgres",   title: "Cross-Device Sync",       desc: "Every save is pushed to your Supabase-backed vault in real time. Access your links from the extension or the web dashboard, anywhere." },
  { icon: Lock,     color: "lk-primary",   label: "Shadow DOM", title: "Zero CSS Contamination",  desc: "The HUD lives inside a strict shadow root so it never inherits or clashes with the host site's styles. It looks perfect on every website." },
  { icon: Layers,   color: "lk-secondary", label: "Offline",    title: "Save Without Login",      desc: "Links saved while offline are queued locally and automatically uploaded when you log in. Nothing is ever lost." },
];

const HOW_IT_WORKS = [
  { step: "01", color: "lk-primary",   icon: Keyboard, title: "Press Alt+S on any tab",  desc: "Link Crust captures the URL, page title, and hostname automatically. No typing required. Works on every website." },
  { step: "02", color: "lk-accent",    icon: Command,  title: "Press Alt+K to search",   desc: "The in-context HUD rises over the page, already filtered to the site you're on. Type to search across your full vault." },
  { step: "03", color: "lk-secondary", icon: Copy,     title: "Copy the short link",     desc: "Every saved URL gets a crust.link alias. Share it in Slack, Notion, or email — it resolves to the original in one click." },
];

// Static Tailwind class maps — JIT scanner requires complete strings, no interpolation.
const COLOR_CLASSES: Record<string, {
  bg10: string; bg: string;
  border25: string; border20: string; border30: string;
  text: string; shadow5: string; shadow10: string;
}> = {
  "lk-primary": {
    bg10: "bg-lk-primary/10", bg: "bg-lk-primary",
    border25: "border-lk-primary/25", border20: "border-lk-primary/20", border30: "border-lk-primary/30",
    text: "text-lk-primary", shadow5: "shadow-lk-primary/5", shadow10: "shadow-lk-primary/10",
  },
  "lk-accent": {
    bg10: "bg-lk-accent/10", bg: "bg-lk-accent",
    border25: "border-lk-accent/25", border20: "border-lk-accent/20", border30: "border-lk-accent/30",
    text: "text-lk-accent", shadow5: "shadow-lk-accent/5", shadow10: "shadow-lk-accent/10",
  },
  "lk-secondary": {
    bg10: "bg-lk-secondary/10", bg: "bg-lk-secondary",
    border25: "border-lk-secondary/25", border20: "border-lk-secondary/20", border30: "border-lk-secondary/30",
    text: "text-lk-secondary", shadow5: "shadow-lk-secondary/5", shadow10: "shadow-lk-secondary/10",
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { data: session } = useSession();
  const isNavbarVisible = useScrollDirection();


  const [savesCount, setSavesCount] = useState(12480);
  useEffect(() => {
    const interval = setInterval(() => {
      setSavesCount((p) => p + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Simulator state
  const [simUrlInput, setSimUrlInput] = useState("");
  const [simTitleInput, setSimTitleInput] = useState("");
  const [isSimSaving, setIsSimSaving] = useState(false);
  const [simSavedLinks, setSimSavedLinks] = useState(MOCK_LINKS);
  const [simFilterSite, setSimFilterSite] = useState(false);
  const [simCopiedId, setSimCopiedId] = useState<number | null>(null);
  const [simSearchQuery, setSimSearchQuery] = useState("");
  const [isSimHudOpen, setIsSimHudOpen] = useState(true);
  const [isCustomAlias, setIsCustomAlias] = useState(false);
  const [customAliasText, setCustomAliasText] = useState("");

  const handleSimShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUrlInput) return;
    setIsSimSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    let domain = "custom.site";
    try {
      domain = new URL(simUrlInput.startsWith("http") ? simUrlInput : `https://${simUrlInput}`).hostname.replace("www.", "");
    } catch { /* ignored */ }
    const alias = customAliasText || Math.random().toString(36).substring(2, 7);
    setSimSavedLinks([
      {
        id: Date.now(),
        original: simUrlInput.startsWith("http") ? simUrlInput : `https://${simUrlInput}`,
        title: simTitleInput || "Saved Link Reference",
        short: `crust.link/${alias}`,
        site: domain,
        category: customAliasText ? "Custom" : "Quick Save",
      },
      ...simSavedLinks,
    ]);
    setSimUrlInput("");
    setSimTitleInput("");
    setCustomAliasText("");
    setIsSimSaving(false);
  };

  const copySimShortUrl = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setSimCopiedId(id);
    setTimeout(() => setSimCopiedId(null), 2000);
  };

  const filteredSimLinks = simSavedLinks.filter((link) => {
    if (simFilterSite && link.site !== "github.com") return false;
    if (simSearchQuery) {
      const q = simSearchQuery.toLowerCase();
      return link.title.toLowerCase().includes(q) || link.original.toLowerCase().includes(q) || link.short.toLowerCase().includes(q);
    }
    return true;
  });

  const FAQS = [
    { q: 'What exactly is a "Link Smasher"?', a: "It smashes a long, messy URL into a short, context-aware crust.link alias. The alias is yours permanently and resolves to the original. Think bit.ly but private, offline-capable, and built into your browser." },
    { q: "How does domain isolation actually work?", a: "When you open the Alt+K HUD, Link Crust reads the current tab's hostname and pre-filters your vault to only links saved from that same domain. You can toggle it off with one click to see everything." },
    { q: "Does it work without an account?", a: "Yes. Links are saved locally to chrome.storage instantly. When you create an account, everything that was saved offline is automatically uploaded. You never lose a save." },
    { q: "Will the HUD break my websites?", a: "Never. The entire UI is rendered inside a browser Shadow DOM with a strict shadow root. No global CSS is injected into host pages — the HUD looks perfect regardless of what the page looks like." },
    { q: "Is my data private?", a: "Your vault lives in your own Supabase PostgreSQL instance. We never sell or read your data. You can self-host the entire stack — source is fully open." },
    { q: "Which browsers are supported?", a: "Chrome and Chromium-based browsers (Edge, Brave, Arc) are fully supported today. Firefox support is in active development. Safari is planned." },
  ];

  return (
    <div className="min-h-screen bg-lk-bg grid-pattern relative selection:bg-lk-primary/20 overflow-x-hidden font-sans">

      {/* ── Ambient glows ── */}
      <div className="fixed inset-0 radial-glow-blue pointer-events-none z-0" />
      <div className="fixed inset-0 radial-glow-yellow pointer-events-none z-0" />
      <div className="fixed inset-0 radial-glow-teal pointer-events-none z-0" />

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <header className={cn(
        "fixed left-4 right-4 z-50 glass-panel border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 max-w-7xl mx-auto transition-all duration-300 ease-in-out",
        isNavbarVisible ? "top-4 opacity-100 translate-y-0" : "-translate-y-[150%] opacity-0 pointer-events-none"
      )}>
        <div className="px-6 h-16 flex items-center justify-between">

          <a href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-lk-primary to-lk-accent flex items-center justify-center shadow-lg shadow-lk-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Link2 className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white">
              Link <span className="bg-linear-to-r from-lk-primary to-lk-accent bg-clip-text text-transparent">Crust</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", href: "#features" },
              { label: "Demo", href: "#simulator" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="px-4 py-2 rounded-lg text-sm font-medium text-lk-text-muted hover:text-white hover:bg-white/5 transition-all duration-200">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-lk-text-muted hover:text-white transition-colors p-2 hidden sm:flex">
              <GithubIcon className="h-5 w-5" />
            </a>

            {session?.user ? (
              <>
                <a href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold text-lk-text-secondary hover:text-white hover:bg-white/5 border border-white/8 transition-all">
                  Dashboard
                </a>
                <button
                  onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.reload() } })}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-lk-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <a href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-lk-text-secondary hover:text-white hover:bg-white/5 border border-white/8 transition-all">
                Sign In
              </a>
            )}

            <a
              href="#download"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-lk-primary hover:bg-lk-primary-hover text-white shadow-lg shadow-lk-primary/20 hover:shadow-lk-primary/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Install Free
            </a>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          HERO — Split layout (Salix-style)
      ══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 z-10 px-6 overflow-visible">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-12 xl:gap-20 items-center">

            {/* ── Left: text ── */}
            <div className="space-y-9 py-4">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-lk-primary/20 text-xs font-semibold text-lk-primary shadow-lg shadow-lk-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-lk-secondary animate-pulse" />
                100% Free &amp; Open Source
              </div>

              <h1 className="font-display font-extrabold text-[3.4rem] sm:text-[4.5rem] xl:text-[5.25rem] tracking-tight leading-[1.0] text-white">
                Save links.<br />
                Find them<br />
                <span className="bg-linear-to-r from-lk-primary via-lk-primary-hover to-lk-accent bg-clip-text text-transparent">
                  instantly.
                </span>
              </h1>

              <p className="text-lk-text-muted text-lg md:text-xl max-w-md leading-relaxed font-light">
                The keyboard-first browser extension that saves, shortens, and retrieves your links — filtered to the exact site you&apos;re on.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#download"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full font-bold text-base bg-lk-primary hover:bg-lk-primary-hover text-white shadow-xl shadow-lk-primary/25 hover:shadow-lk-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
                >
                  Install Extension Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#simulator"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-semibold text-base glass-panel border border-white/10 hover:border-lk-primary/30 text-lk-text-secondary hover:text-white hover:bg-lk-primary/5 transition-all duration-200"
                >
                  <Eye className="h-5 w-5" />
                  See Live Demo
                </a>
              </div>

              {/* Trust */}
              <div className="space-y-4 pt-1">
                <p className="text-sm text-lk-text-muted">
                  Trusted by <span className="text-white font-semibold">{savesCount.toLocaleString()}+</span> researchers &amp; developers worldwide
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Chrome", icon: <ChromeIcon className="h-4 w-4" /> },
                    { label: "Brave",  icon: <BraveIcon  className="h-4 w-4" /> },
                    { label: "Edge",   icon: <EdgeIcon   className="h-4 w-4" /> },
                  ].map(({ label, icon }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs text-lk-text-muted/60 px-3 py-1.5 rounded-full glass-panel border border-white/5">
                      {icon} {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: product mockup ── */}
            <div className="relative hidden lg:block">

              {/* Outer glow */}
              <div className="absolute -inset-6 bg-lk-primary/8 rounded-3xl blur-3xl pointer-events-none" />

              {/* Main card */}
              <div className="relative bg-lk-surface rounded-2xl border border-lk-border shadow-2xl shadow-black/50 overflow-hidden">

                {/* Title bar */}
                <div className="bg-lk-bg px-4 py-3 flex items-center gap-3 border-b border-lk-border">
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex items-center gap-2 mx-auto">
                    <Link2 className="h-3.5 w-3.5 text-lk-primary" />
                    <span className="text-xs font-semibold text-lk-text-secondary">Link Crust — Web Vault</span>
                  </div>
                </div>

                {/* App content */}
                <div className="flex h-[390px]">

                  {/* Sidebar */}
                  <div className="w-44 border-r border-lk-border p-3 flex flex-col gap-1 bg-lk-bg/50 shrink-0">
                    <div className="px-3 py-2 rounded-lg bg-lk-primary/10 border border-lk-primary/20 text-lk-primary text-[11px] font-semibold flex items-center gap-2">
                      <Link2 className="h-3 w-3 shrink-0" />
                      All Links
                      <span className="ml-auto text-[9px] bg-lk-primary text-white px-1.5 py-0.5 rounded-full font-bold">24</span>
                    </div>
                    {[
                      { label: "Research", count: 8 },
                      { label: "Docs",     count: 6 },
                      { label: "Tools",    count: 5 },
                      { label: "Papers",   count: 5 },
                    ].map(({ label, count }) => (
                      <div key={label} className="px-3 py-2 text-[11px] text-lk-text-muted flex items-center gap-2 rounded-lg cursor-default">
                        <Folder className="h-3 w-3 shrink-0 opacity-50" />
                        {label}
                        <span className="ml-auto text-[9px] text-lk-text-muted/50">{count}</span>
                      </div>
                    ))}
                    <div className="mt-auto pt-3 border-t border-lk-border">
                      <div className="px-3 py-2 text-[11px] font-semibold text-lk-primary bg-lk-primary/8 rounded-lg text-center border border-lk-primary/15 cursor-default">
                        + Add Link
                      </div>
                    </div>
                  </div>

                  {/* Main panel */}
                  <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">

                    {/* Search */}
                    <div className="flex items-center gap-2 bg-lk-bg/70 border border-lk-border rounded-xl px-3 py-2.5 shrink-0">
                      <Search className="h-3.5 w-3.5 text-lk-text-muted shrink-0" />
                      <span className="text-[11px] text-lk-text-muted flex-1">Search 24 links...</span>
                      <kbd className="text-[9px] text-lk-text-muted border border-lk-border rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
                    </div>

                    {/* Link rows */}
                    {[
                      { title: "AlphaFold Structure Analysis", site: "github.com",    short: "alphafold",   color: "text-lk-primary"   },
                      { title: "Attention Is All You Need",    site: "arxiv.org",     short: "transformer", color: "text-lk-accent"    },
                      { title: "Next.js App Router Docs",      site: "nextjs.org",    short: "next-docs",   color: "text-lk-secondary" },
                      { title: "Supabase Database Guide",      site: "supabase.com",  short: "sb-db",       color: "text-lk-primary"   },
                    ].map(({ title, site, short, color }) => (
                      <div key={short} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-lk-bg/50 border border-lk-border hover:border-lk-primary/25 hover:bg-lk-primary/[0.04] transition-all cursor-default group">
                        <div className="w-6 h-6 rounded-lg bg-lk-primary/10 flex items-center justify-center shrink-0">
                          <Link2 className={`h-3 w-3 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-white truncate">{title}</div>
                          <div className="text-[10px] text-lk-text-muted">{site}</div>
                        </div>
                        <span className={`text-[10px] font-mono ${color} opacity-60 group-hover:opacity-100 transition-opacity shrink-0`}>{short}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating: "Link smashed" toast */}
              <div className="absolute -top-5 -right-6 glass-panel rounded-2xl px-4 py-3 border border-lk-accent/30 shadow-xl shadow-black/30 flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-full bg-lk-accent/15 border border-lk-accent/30 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-lk-accent" />
                </div>
                <div>
                  <p className="text-[10px] text-lk-text-muted">Link smashed!</p>
                  <p className="text-xs font-mono font-bold text-lk-accent">crust.link/tf-paper</p>
                </div>
              </div>

              {/* Floating: saved-today counter */}
              <div className="absolute -bottom-5 -left-6 glass-panel rounded-2xl px-4 py-3.5 border border-lk-secondary/25 shadow-xl shadow-black/30 z-10 min-w-[148px]">
                <p className="text-[10px] text-lk-text-muted mb-1">Links saved today</p>
                <p className="text-xl font-display font-bold text-white leading-none">
                  {savesCount.toLocaleString().slice(-3)} <span className="text-xs text-lk-secondary font-semibold">↑ 12%</span>
                </p>
              </div>

              {/* Floating: Alt+K badge */}
              <div className="absolute top-1/2 -left-8 -translate-y-1/2 glass-panel rounded-xl px-3 py-2.5 border border-lk-primary/20 shadow-lg flex items-center gap-2 z-10">
                <kbd className="text-[10px] font-mono text-lk-primary border border-lk-primary/30 rounded px-1.5 py-1 bg-lk-primary/10 font-bold">Alt+K</kbd>
                <span className="text-[10px] text-lk-text-muted whitespace-nowrap">Open HUD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LOGO STRIP — Salix-style "trusted by"
      ══════════════════════════════════════════ */}
      <div className="relative z-10 border-y border-lk-border py-10 bg-lk-surface/30">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[11px] text-lk-text-muted uppercase tracking-[0.15em] mb-8">
            Used alongside your favorite tools
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
            {[
              { name: "GitHub",  icon: <GithubIcon  className="h-4 w-4" /> },
              { name: "Notion",  icon: <NotionIcon  className="h-4 w-4" /> },
              { name: "arXiv",   icon: <span className="font-mono font-bold text-xs leading-none">Ax</span> },
              { name: "Slack",   icon: <SlackIcon   className="h-4 w-4" /> },
              { name: "YouTube", icon: <YoutubeIcon className="h-4 w-4" /> },
              { name: "Linear",  icon: <LinearIcon  className="h-4 w-4" /> },
            ].map(({ name, icon }) => (
              <div key={name} className="flex items-center gap-2.5 text-lk-text-muted/40 hover:text-lk-text-muted/80 transition-colors duration-300 cursor-default group">
                <span className="group-hover:opacity-100 opacity-60 transition-opacity">{icon}</span>
                <span className="font-semibold text-sm tracking-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section id="features" className="py-28 relative z-10 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-lk-secondary/25 text-xs font-semibold text-lk-secondary">
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            Built for Power Users
          </div>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
            Everything you need,<br />
            <span className="bg-linear-to-r from-lk-primary to-lk-accent bg-clip-text text-transparent">nothing you don&apos;t</span>
          </h2>
          <p className="text-lk-text-muted text-base leading-relaxed font-light">
            Bookmark bars are noisy. Generic shorteners have no context. Link Crust fixes both with keyboard-first design and smart isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, label, title, desc }) => (
            <div key={title} className="glass-panel rounded-2xl p-6 border border-white/8 glass-card-hover group space-y-5">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${COLOR_CLASSES[color].bg10} border ${COLOR_CLASSES[color].border25} flex items-center justify-center ${COLOR_CLASSES[color].text} shadow-lg ${COLOR_CLASSES[color].shadow5}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full border border-white/5 text-lk-text-muted font-mono">{label}</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-base text-white">{title}</h3>
                <p className="text-lk-text-muted text-sm leading-relaxed font-light">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 relative z-10 px-6 border-t border-lk-border bg-lk-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-lk-accent/20 text-xs font-semibold text-lk-accent">
              <MousePointer className="h-3.5 w-3.5" />
              Zero Learning Curve
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              Three keystrokes.<br />
              <span className="bg-linear-to-r from-lk-primary to-lk-accent bg-clip-text text-transparent">That&apos;s the whole workflow.</span>
            </h2>
            <p className="text-lk-text-muted text-base font-light leading-relaxed">
              No tags, folders, or import wizards. Link Crust was designed to disappear into your muscle memory.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="hidden md:block absolute top-12 left-[calc(33.33%+24px)] w-[calc(33.33%-48px)] h-[2px] bg-linear-to-r from-lk-primary/30 to-lk-accent/30" />
            <div className="hidden md:block absolute top-12 left-[calc(66.66%+24px)] w-[calc(33.33%-48px)] h-[2px] bg-linear-to-r from-lk-accent/30 to-lk-secondary/30" />

            {HOW_IT_WORKS.map(({ step, color, icon: Icon, title, desc }, idx) => (
              <div key={step} className="relative glass-panel rounded-2xl p-8 border border-white/8 text-center group hover:border-lk-primary/20 transition-all duration-500 space-y-5">
                <div className="relative mx-auto">
                  <div className={`w-14 h-14 rounded-full ${COLOR_CLASSES[color].bg10} border-2 ${COLOR_CLASSES[color].border30} flex items-center justify-center mx-auto shadow-xl ${COLOR_CLASSES[color].shadow10} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`h-6 w-6 ${COLOR_CLASSES[color].text}`} />
                  </div>
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${COLOR_CLASSES[color].bg} flex items-center justify-center text-[10px] font-bold text-white shadow-md`}>
                    {idx + 1}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-white">{title}</h3>
                  <p className="text-lk-text-muted text-sm leading-relaxed font-light">{desc}</p>
                </div>
                {idx === 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lk-primary/10 border border-lk-primary/20">
                    <kbd className="text-[10px] font-mono text-lk-primary font-bold">Alt</kbd>
                    <span className="text-lk-text-muted text-[10px]">+</span>
                    <kbd className="text-[10px] font-mono text-lk-primary font-bold">S</kbd>
                  </div>
                )}
                {idx === 1 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lk-accent/10 border border-lk-accent/20">
                    <kbd className="text-[10px] font-mono text-lk-accent font-bold">Alt</kbd>
                    <span className="text-lk-text-muted text-[10px]">+</span>
                    <kbd className="text-[10px] font-mono text-lk-accent font-bold">K</kbd>
                  </div>
                )}
                {idx === 2 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lk-secondary/10 border border-lk-secondary/20">
                    <span className="text-[10px] font-mono text-lk-secondary font-bold">crust.link/alias</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INTERACTIVE DEMO
      ══════════════════════════════════════════ */}
      <section id="simulator" className="py-28 relative z-10 px-6 max-w-7xl mx-auto border-t border-lk-border">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-lk-primary/20 text-xs font-semibold text-lk-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-lk-secondary" />
            Fully Interactive
          </div>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
            Try the HUD right now
          </h2>
          <p className="text-lk-text-muted text-base font-light leading-relaxed">
            This is a pixel-perfect simulation of the browser extension overlay. Paste a URL, smash it, and filter by domain — exactly as it works in Chrome.
          </p>
        </div>

        <div className="max-w-3xl mx-auto group relative">
          <div className="absolute -inset-2 bg-linear-to-r from-lk-primary to-lk-accent rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000 pointer-events-none" />

          <div className="relative rounded-2xl border border-lk-border bg-lk-surface overflow-hidden shadow-2xl flex flex-col min-h-[560px]">

            {/* Browser chrome */}
            <div className="bg-lk-bg px-4 py-3 flex items-center gap-3 border-b border-lk-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 bg-[#111828] rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-lk-text-muted font-light select-none">
                <div className="flex items-center gap-2 truncate">
                  <Globe className="h-3.5 w-3.5 text-lk-text-muted shrink-0" />
                  <span>https://github.com/google-deepmind/alphafold</span>
                </div>
                <ExternalLink className="h-3 w-3 text-lk-text-muted shrink-0" />
              </div>
              <button
                onClick={() => setIsSimHudOpen(!isSimHudOpen)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isSimHudOpen ? "bg-lk-primary text-white" : "bg-white/5 text-lk-text-muted hover:text-white"}`}
                title="Toggle Link Crust HUD"
              >
                <Link2 className="h-4 w-4" />
              </button>
            </div>

            {/* Page content area */}
            <div className="flex-1 p-6 relative bg-[#060A18] overflow-hidden select-none">

              {/* Blurred page mockup */}
              <div className="space-y-4 opacity-20 filter blur-[0.5px]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a2030]" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-36 bg-[#1a2030] rounded" />
                    <div className="h-2 w-20 bg-[#151C2E] rounded" />
                  </div>
                </div>
                <div className="h-8 w-3/4 bg-[#151C2E] rounded-md" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-[#151C2E] rounded" />
                  <div className="h-3 w-full bg-[#151C2E] rounded" />
                  <div className="h-3 w-4/5 bg-[#151C2E] rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-[#151C2E] rounded-full" />
                  <div className="h-6 w-24 bg-[#151C2E] rounded-full" />
                </div>
              </div>

              {/* HUD closed state */}
              {!isSimHudOpen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                  <div className="glass-panel rounded-xl p-5 border border-lk-primary/20 text-center max-w-xs space-y-4">
                    <Command className="h-8 w-8 text-lk-primary mx-auto animate-bounce" />
                    <p className="text-sm text-lk-text-secondary font-light leading-relaxed">HUD is closed. Open it with the trigger button or:</p>
                    <div className="flex justify-center gap-1.5">
                      <kbd className="px-2.5 py-1.5 rounded-lg border border-lk-border bg-lk-surface text-xs text-white font-mono">Alt</kbd>
                      <span className="text-lk-text-muted self-center text-sm">+</span>
                      <kbd className="px-3 py-1.5 rounded-lg border border-lk-border bg-lk-surface text-xs text-white font-mono">K</kbd>
                    </div>
                    <button onClick={() => setIsSimHudOpen(true)} className="w-full py-2 rounded-lg bg-lk-primary hover:bg-lk-primary-hover text-white text-xs font-semibold transition-colors">
                      Open HUD
                    </button>
                  </div>
                </div>
              )}

              {/* HUD overlay */}
              {isSimHudOpen && (
                <div className="absolute inset-x-5 top-5 bottom-5 glass-panel rounded-xl border border-lk-primary/15 shadow-2xl flex flex-col z-20 overflow-hidden bg-lk-surface/95">

                  {/* Header */}
                  <div className="px-4 py-3 bg-white/[0.03] border-b border-lk-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-linear-to-tr from-lk-primary to-lk-accent flex items-center justify-center">
                        <Link2 className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-display font-bold text-xs text-white tracking-wide">LINK CRUST</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-lk-primary/15 text-lk-primary font-mono border border-lk-primary/10">Alt+K</span>
                    </div>
                    <button onClick={() => setIsSimHudOpen(false)} className="text-lk-text-muted hover:text-white text-xs p-1 hover:bg-white/5 rounded transition-colors">✕</button>
                  </div>

                  {/* Save form */}
                  <form onSubmit={handleSimShorten} className="p-3.5 bg-white/[0.02] border-b border-lk-border space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste long URL here..."
                        value={simUrlInput}
                        onChange={(e) => setSimUrlInput(e.target.value)}
                        required
                        className="flex-1 bg-[#111828] border border-lk-border rounded-lg px-3 py-2 text-xs text-white placeholder-lk-text-muted focus:outline-none focus:border-lk-primary transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSimSaving || !simUrlInput}
                        className="px-4 rounded-lg bg-lk-primary hover:bg-lk-primary-hover disabled:opacity-50 text-white text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-md shadow-lk-primary/10 transition-colors"
                      >
                        {isSimSaving ? (
                          <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Smashing...</>
                        ) : (
                          <><Zap className="h-3.5 w-3.5 text-lk-secondary" />Smash</>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <button type="button" onClick={() => setIsCustomAlias(!isCustomAlias)} className="text-lk-primary hover:text-lk-accent transition-colors flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {isCustomAlias ? "Hide settings" : "Custom alias"}
                      </button>
                      <span className="text-lk-text-muted">Auto-save mode</span>
                    </div>
                    {isCustomAlias && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <input type="text" placeholder="Display title" value={simTitleInput} onChange={(e) => setSimTitleInput(e.target.value)} className="bg-[#111828]/60 border border-lk-border rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-lk-primary placeholder-lk-text-muted" />
                        <input type="text" placeholder="Alias (e.g. alpha-guide)" value={customAliasText} onChange={(e) => setCustomAliasText(e.target.value)} className="bg-[#111828]/60 border border-lk-border rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-lk-primary placeholder-lk-text-muted" />
                      </div>
                    )}
                  </form>

                  {/* Search + filter */}
                  <div className="px-3.5 py-2.5 bg-lk-bg/50 flex items-center gap-3 border-b border-lk-border">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-lk-text-muted" />
                      <input type="text" placeholder="Search saved links..." value={simSearchQuery} onChange={(e) => setSimSearchQuery(e.target.value)} className="w-full bg-[#111828] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-lk-text-muted focus:outline-none border border-transparent focus:border-lk-border" />
                    </div>
                    <button onClick={() => setSimFilterSite(!simFilterSite)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${simFilterSite ? "bg-lk-primary/15 border-lk-primary text-lk-primary" : "bg-transparent border-lk-border text-lk-text-muted hover:text-white"}`}>
                      <Globe className="h-3 w-3" />
                      This Site
                    </button>
                  </div>

                  {/* Links list */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredSimLinks.length > 0 ? filteredSimLinks.map((link) => (
                      <div key={link.id} className="p-2.5 rounded-lg bg-white/[0.04] border border-lk-border hover:border-lk-primary/20 hover:bg-lk-primary/5 transition-all flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white truncate">{link.title}</span>
                            <span className="text-[9px] px-1.5 bg-white/8 text-lk-text-muted rounded shrink-0">{link.category}</span>
                          </div>
                          <span className="text-[10px] text-lk-text-muted truncate block">{link.original}</span>
                          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-medium text-lk-primary">
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span>{link.short}</span>
                          </div>
                        </div>
                        <button onClick={() => copySimShortUrl(link.id, link.short)} className={`p-1.5 rounded-md border shrink-0 transition-all ${simCopiedId === link.id ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-lk-surface border-lk-border text-lk-text-muted hover:text-white hover:border-lk-primary/30"}`}>
                          {simCopiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )) : (
                      <div className="text-center py-10 space-y-2">
                        <Eye className="h-7 w-7 text-lk-text-muted mx-auto" />
                        <p className="text-xs text-lk-text-muted">No links match this filter.</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 bg-white/[0.02] border-t border-lk-border text-[10px] text-lk-text-muted flex items-center justify-between">
                    <span className="flex items-center gap-1"><Server className="h-3 w-3 text-lk-primary" /> Connected to Supabase</span>
                    <span>{filteredSimLinks.length} links</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-28 relative z-10 px-6 border-t border-lk-border bg-lk-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-lk-secondary/25 text-xs font-semibold text-lk-secondary">
              <Star className="h-3.5 w-3.5 fill-lk-secondary" />
              Loved by 2,400+ users
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              What power users<br />
              <span className="bg-linear-to-r from-lk-accent to-lk-secondary bg-clip-text text-transparent">are saying</span>
            </h2>
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-lk-secondary text-lk-secondary" />
                ))}
              </div>
              <span className="font-display font-bold text-2xl text-white">4.9</span>
              <span className="text-lk-text-muted text-sm">from 2,400+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} className="glass-panel rounded-2xl p-6 border border-white/8 glass-card-hover space-y-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-lk-secondary text-lk-secondary" />
                  ))}
                </div>
                <p className="text-lk-text-secondary text-sm leading-relaxed font-light">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1 border-t border-lk-border">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-lk-primary to-lk-accent flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-lk-text-muted">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SHADOW DOM TECH SHOWCASE
      ══════════════════════════════════════════ */}
      <section id="architecture" className="py-28 relative z-10 px-6 max-w-7xl mx-auto border-t border-lk-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Code visual */}
          <div className="relative order-last lg:order-first">
            <div className="absolute -inset-2 bg-lk-accent/8 rounded-2xl blur-xl pointer-events-none" />
            <div className="relative glass-panel rounded-2xl p-6 border border-lk-border font-mono text-xs text-lk-text-muted space-y-3">
              <div className="flex items-center justify-between border-b border-lk-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lk-primary" />
                  <span className="text-white font-semibold text-xs">Webpage DOM Structure</span>
                </div>
                <span className="text-[10px] text-lk-accent bg-lk-accent/10 px-2 py-0.5 rounded-full">Fully Isolated</span>
              </div>
              <div className="space-y-1.5 select-none leading-relaxed">
                <div>&lt;<span className="text-lk-secondary">html</span>&gt;</div>
                <div className="pl-4">&lt;<span className="text-lk-primary">body</span>&gt;</div>
                <div className="pl-8 text-lk-text-muted/50">&lt;!-- Host site CSS lives here --&gt;</div>
                <div className="pl-8">&lt;<span className="text-lk-primary">div</span> id=<span className="text-green-400">&quot;app-root&quot;</span>&gt;...&lt;/div&gt;</div>
                <div className="pl-8 bg-lk-primary/8 border border-lk-primary/20 py-3 rounded-xl my-2 px-3">
                  <div className="flex items-center justify-between mb-2 text-lk-primary font-bold text-[10px]">
                    <span>🎯 SHADOW HOST BOUNDARY</span>
                    <span className="bg-lk-primary/15 px-2 py-0.5 rounded text-[9px]">Isolated</span>
                  </div>
                  <div className="pl-2">&lt;<span className="text-lk-accent">div</span> id=<span className="text-green-400">&quot;link-crust-root&quot;</span>&gt;</div>
                  <div className="pl-6 text-lk-accent font-bold">#shadow-root (open)</div>
                  <div className="pl-10 text-lk-text-muted/50">&lt;!-- Link Crust injected styles --&gt;</div>
                  <div className="pl-10 text-lk-secondary font-semibold">&lt;!-- 100% CSS-immune HUD --&gt;</div>
                  <div className="pl-2">&lt;/<span className="text-lk-accent">div</span>&gt;</div>
                </div>
                <div className="pl-4">&lt;/<span className="text-lk-primary">body</span>&gt;</div>
                <div>&lt;/<span className="text-lk-secondary">html</span>&gt;</div>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-lk-accent/20 text-xs font-semibold text-lk-accent">
              <Shield className="h-3.5 w-3.5" />
              Shadow DOM Isolation
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-tight">
              Styles that never<br />
              <span className="bg-linear-to-r from-lk-accent to-lk-primary bg-clip-text text-transparent">break your pages</span>
            </h2>
            <p className="text-lk-text-muted text-base leading-relaxed font-light">
              Most extension overlays inherit fonts, colors, and margins from whatever site they&apos;re on — breaking the UI on every other website. Link Crust solves this permanently with a browser-native Shadow DOM boundary.
            </p>
            <div className="space-y-5">
              {[
                { icon: Layers, color: "lk-accent" as const, title: "Sandboxed Shadow Root", desc: "The entire HUD lives inside a shadow root. Zero CSS leaks in or out — it looks identical on GitHub, Twitter, Notion, and everywhere else." },
                { icon: Shield, color: "lk-primary" as const, title: "No Global CSS Injection", desc: "Not a single Tailwind class touches the host page's DOM. Your sites stay untouched, and your data stays private." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl ${COLOR_CLASSES[color].bg10} border ${COLOR_CLASSES[color].border20} flex items-center justify-center shrink-0 ${COLOR_CLASSES[color].text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-white block">{title}</span>
                    <span className="text-xs text-lk-text-muted leading-relaxed block">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section id="faq" className="py-28 relative z-10 px-6 border-t border-lk-border bg-lk-surface/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/8 text-xs font-semibold text-lk-text-secondary">
              <HelpCircle className="h-3.5 w-3.5" />
              Got Questions?
            </div>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
              Frequently Asked
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="glass-panel rounded-2xl border border-lk-border overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-lk-primary/[0.04] transition-colors"
                >
                  <span className="font-semibold text-sm text-white">{q}</span>
                  <ChevronRight className={`h-4 w-4 text-lk-text-muted shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-lk-text-muted leading-relaxed font-light">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section id="download" className="py-28 relative z-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative glass-panel rounded-3xl border border-lk-primary/15 px-10 py-20 text-center overflow-hidden">

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-lk-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-lk-accent/6 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-lk-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-lk-primary/20 text-xs font-semibold text-lk-primary">
                <Sparkles className="h-3.5 w-3.5 text-lk-secondary" />
                Free forever · No credit card · Open source
              </div>

              <h2 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-tight">
                Ready to upgrade<br />your link workflow?
              </h2>

              <p className="text-lk-text-muted text-base md:text-lg font-light leading-relaxed">
                Install Link Crust in 30 seconds. Save your first link with Alt+S. You&apos;ll never use a bookmark folder again.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a
                  href="https://chromewebstore.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-lk-primary hover:bg-lk-primary-hover text-white shadow-2xl shadow-lk-primary/30 hover:shadow-lk-primary/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  <Download className="h-5 w-5" />
                  Add to Chrome — It&apos;s Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold glass-panel border border-lk-border hover:border-lk-primary/30 text-lk-text-secondary hover:text-white hover:bg-lk-primary/5 transition-all duration-200"
                >
                  Access Web Vault
                </a>
              </div>

              <p className="text-xs text-lk-text-muted/60">
                No account needed for local-only saves. Sync is optional and free.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="border-t border-lk-border py-16 relative z-10 bg-lk-bg/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-lk-primary to-lk-accent flex items-center justify-center shadow shadow-lk-primary/10">
                  <Link2 className="h-4 w-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-white">Link Crust</span>
              </div>
              <p className="text-xs text-lk-text-muted font-light leading-relaxed">
                The keyboard-first link vault for power users. Free, private, and fully open-source.
              </p>
              <div className="flex items-center gap-3">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-lk-text-muted hover:text-white transition-colors">
                  <GithubIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            {[
              {
                heading: "Product",
                links: [
                  { label: "Features", href: "#features" },
                  { label: "Live Demo", href: "#simulator" },
                  { label: "How It Works", href: "#how-it-works" },
                  { label: "Technical Architecture", href: "#architecture" },
                ],
              },
              {
                heading: "Resources",
                links: [
                  { label: "GitHub Repository", href: "https://github.com", external: true },
                  { label: "Chrome Web Store", href: "https://chromewebstore.google.com", external: true },
                  { label: "FAQs", href: "#faq" },
                ],
              },
              {
                heading: "Account",
                links: [
                  { label: "Sign In", href: "/login" },
                  { label: "Web Vault", href: "/dashboard" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ],
              },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <span className="font-semibold text-xs text-white uppercase tracking-widest block mb-5">{heading}</span>
                <ul className="space-y-3">
                  {links.map(({ label, href, external }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="text-xs text-lk-text-muted hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        {label}
                        {external && <ExternalLink className="h-3 w-3 opacity-50" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-lk-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-lk-text-muted/50">
            <span>© 2026 Link Crust. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Built with <span className="text-lk-secondary">♥</span> for researchers, developers, and knowledge workers.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─── SVG icon components ─────────────────────────────────────────────────────
function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function ChromeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
      <line x1="12" y1="8" x2="12" y2="2" /><line x1="12" y1="16" x2="12" y2="22" />
      <line x1="8" y1="12" x2="2" y2="12" /><line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function BraveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2L3 7l1.5 10L12 22l7.5-5L21 7z" />
      <path d="M12 8v8M9 11l3-3 3 3" />
    </svg>
  );
}

function EdgeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.9 8.1c-.7-3-3.3-5.1-6.4-5.1C10 3 7 6.6 7 11c0 .4 0 .8.1 1.2" />
      <path d="M4 12.5c0 4.1 3.3 7.5 7.5 7.5 2.3 0 4.4-1 5.8-2.6" />
      <path d="M3 10h18" />
    </svg>
  );
}

function NotionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}

function SlackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M0 14.121L9.879 24c-5.46-.471-9.41-4.421-9.879-9.879zm0-2.829L11.708 24h1.406L0 9.886v1.406zm0-2.828L14.537 24h1.406L0 7.058v1.406zM1.465 5.636L18.364 22.535A11.93 11.93 0 0 0 22.535 18.364L5.636 1.465A11.93 11.93 0 0 0 1.465 5.636zm5.172-4.171L21.879 16.707C21.408 11.246 17.458 7.296 12 6.825L6.637 1.465zM9.464 0L24 14.536C23.529 9.075 19.579 5.125 14.12 4.654L9.464 0z" />
    </svg>
  );
}
