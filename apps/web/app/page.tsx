"use client";

import { useState, useEffect } from "react";
import {
  Link2, Copy, Check, Zap, Shield, Search, Globe,
  Layers, ChevronRight, ExternalLink, Sparkles,
  Command, Eye, HelpCircle, ArrowRight, Download, Server
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

// Mock saved links data for the interactive simulator
const MOCK_LINKS = [
  { id: 1, original: "https://github.com/google-deepmind/alphafold", title: "AlphaFold Structure Analysis", short: "crust.link/alphafold", site: "github.com", category: "Research" },
  { id: 2, original: "https://nextjs.org/docs/app/building-your-application", title: "Next.js App Router Docs", short: "crust.link/next-docs", site: "nextjs.org", category: "Docs" },
  { id: 3, original: "https://arxiv.org/abs/1706.03762", title: "Attention Is All You Need", short: "crust.link/transformer", site: "arxiv.org", category: "AI Paper" },
  { id: 4, original: "https://tailwindcss.com/docs/installation", title: "Tailwind CSS Configuration Guide", short: "crust.link/tw-config", site: "tailwindcss.com", category: "CSS" },
  { id: 5, original: "https://supabase.com/docs/guides/database", title: "Supabase Database Schema Setup", short: "crust.link/sb-db", site: "supabase.com", category: "Database" },
];

export default function Home() {
  const { data: session } = useSession();

  // Navigation active tab tracking for visual cues
  const [activeTab, setActiveTab] = useState("features");

  // Interactive Simulator States
  const [simUrlInput, setSimUrlInput] = useState("");
  const [simTitleInput, setSimTitleInput] = useState("");
  const [isSimSaving, setIsSimSaving] = useState(false);
  const [simSavedLinks, setSimSavedLinks] = useState(MOCK_LINKS);
  const [simFilterSite, setSimFilterSite] = useState(false); // Filter to "github.com"
  const [simCopiedId, setSimCopiedId] = useState<number | null>(null);
  const [simSearchQuery, setSimSearchQuery] = useState("");
  const [isSimHudOpen, setIsSimHudOpen] = useState(true);
  const [isCustomAlias, setIsCustomAlias] = useState(false);
  const [customAliasText, setCustomAliasText] = useState("");

  // Stats Animation on Page Mount
  const [savesCount, setSavesCount] = useState(12480);
  useEffect(() => {
    const interval = setInterval(() => {
      setSavesCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle live link shortening in the simulator
  const handleSimShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUrlInput) return;

    setIsSimSaving(true);
    // Simulate API delay + smashing effect
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Extract domain & create a smart alias
    let domain = "unknown.com";
    try {
      const parsed = new URL(simUrlInput.startsWith("http") ? simUrlInput : `https://${simUrlInput}`);
      domain = parsed.hostname.replace("www.", "");
    } catch (_) {
      domain = "custom.site";
    }

    // Generate dynamic readable short title
    const defaultTitle = simTitleInput || "Saved Link Reference";
    const cleanAlias = customAliasText || Math.random().toString(36).substring(2, 7);
    const shortResult = `crust.link/${cleanAlias}`;

    const newLink = {
      id: Date.now(),
      original: simUrlInput.startsWith("http") ? simUrlInput : `https://${simUrlInput}`,
      title: defaultTitle,
      short: shortResult,
      site: domain,
      category: customAliasText ? "Custom" : "Quick Save"
    };

    setSimSavedLinks([newLink, ...simSavedLinks]);
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

  // Filter simulator links based on selections and search queries
  const filteredSimLinks = simSavedLinks.filter(link => {
    // Domain Isolation Filter: mock browser is on 'github.com'
    if (simFilterSite && link.site !== "github.com") return false;

    // Search Query Filter
    if (simSearchQuery) {
      const q = simSearchQuery.toLowerCase();
      return (
        link.title.toLowerCase().includes(q) ||
        link.original.toLowerCase().includes(q) ||
        link.short.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-brand-dark grid-pattern relative selection:bg-brand-magenta/30 overflow-hidden font-sans">

      {/* Decorative Radial Background Glows */}
      <div className="absolute inset-0 radial-glow-violet pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow-magenta pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow-cyan pointer-events-none z-0" />

      {/* --- PREMIUM NAVBAR --- */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-brand-indigo via-brand-violet to-brand-magenta flex items-center justify-center shadow-lg shadow-brand-indigo/20 group-hover:scale-105 transition-transform duration-300">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight bg-linear-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Link <span className="bg-linear-to-r from-brand-indigo to-brand-magenta bg-clip-text text-transparent">Crust</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              onClick={() => setActiveTab("features")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "features" ? "text-white bg-white/5" : "text-gray-400 hover:text-white"}`}
            >
              Features
            </a>
            <a
              href="#simulator"
              onClick={() => setActiveTab("simulator")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "simulator" ? "text-white bg-white/5" : "text-gray-400 hover:text-white"}`}
            >
              Live Demo
            </a>
            <a
              href="#architecture"
              onClick={() => setActiveTab("architecture")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "architecture" ? "text-white bg-white/5" : "text-gray-400 hover:text-white"}`}
            >
              Technology
            </a>
            <a
              href="#faq"
              onClick={() => setActiveTab("faq")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "faq" ? "text-white bg-white/5" : "text-gray-400 hover:text-white"}`}
            >
              FAQs
            </a>
          </nav>

          {/* CTA Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors p-2 hidden sm:block"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            {session?.user ? (
              <>
                <a
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/5 hover:border-white/10"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.reload();
                      }
                    }
                  })}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/5 hover:border-white/10"
              >
                Sign In
              </a>
            )}
            <a
              href="#download"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-r from-brand-indigo to-brand-violet hover:from-brand-indigo hover:to-brand-magenta text-white shadow-lg shadow-brand-indigo/15 hover:shadow-brand-indigo/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Install Extension
            </a>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 z-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-brand-indigo/20 text-xs font-semibold text-brand-indigo shadow-md shadow-brand-indigo/5">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-brand-magenta" />
              <span>Context-Aware Link Smasher MVP</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl xl:text-6xl tracking-tight leading-[1.1] text-white">
              Smash Long URLs.<br />
              <span className="bg-linear-to-r from-brand-indigo via-brand-violet to-brand-magenta bg-clip-text text-transparent animate-pulse-slow">
                Keep the Context.
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Stop cluttering your tabs. Save any webpage in <span className="text-white font-medium">1-click (Alt+S)</span>. Retrieve references instantly in a modern glassmorphic HUD <span className="text-white font-medium">(Alt+K)</span> filtered automatically by the domain you're reading.
            </p>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto lg:mx-0 border-t border-white/5">
              <div>
                <p className="font-display font-bold text-2xl bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {savesCount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Links Smashed</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  100%
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Safe Isolation</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  &lt; 100ms
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Access Speed</p>
              </div>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#download"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-linear-to-r from-brand-indigo via-brand-violet to-brand-magenta text-white shadow-xl shadow-brand-indigo/20 hover:shadow-brand-indigo/35 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                Get Started Free
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#simulator"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold glass-panel border border-white/10 hover:border-white/20 text-white/90 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Try Interactive Demo
              </a>
            </div>

            {/* Platform Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-gray-500 font-medium">
              <span>Supports:</span>
              <span className="flex items-center gap-1.5"><ChromeIcon className="h-4 w-4 text-gray-400" /> Chrome</span>
              <span className="flex items-center gap-1.5"><FirefoxIcon className="h-4 w-4 text-gray-400" /> Firefox</span>
              <span className="flex items-center gap-1.5"><SafariIcon className="h-4 w-4 text-gray-400" /> Safari</span>
            </div>
          </div>

          {/* Hero Right Visual: High-fidelity Interactive HUD Simulator */}
          <div id="simulator" className="lg:col-span-6 w-full relative group">

            {/* Ambient Glow backing */}
            <div className="absolute -inset-1.5 bg-linear-to-r from-brand-indigo to-brand-magenta rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000 pointer-events-none" />

            {/* The Browser Window Container */}
            <div className="relative rounded-2xl border border-white/10 bg-[#0d091e] overflow-hidden shadow-2xl flex flex-col aspect-4/3 min-h-[460px] md:min-h-[500px]">

              {/* Browser Window Header */}
              <div className="bg-[#090616] px-4 py-3 flex items-center gap-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>

                {/* Simulated URL bar */}
                <div className="flex-1 bg-[#15102a] rounded-lg px-3 py-1 flex items-center justify-between text-xs text-gray-400 font-light select-none">
                  <div className="flex items-center gap-2 truncate">
                    <Globe className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    <span>https://github.com/google-deepmind/alphafold</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-500 shrink-0" />
                </div>

                {/* Simulated Extension Icon Trigger */}
                <button
                  onClick={() => setIsSimHudOpen(!isSimHudOpen)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isSimHudOpen ? "bg-brand-indigo text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}
                  title="Toggle Link Crust Extension Overlay"
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </div>

              {/* Browser Webpage Content (Mocking GitHub page) */}
              <div className="flex-1 p-6 relative bg-[#0b071a] overflow-hidden select-none">

                {/* Background Webpage Layout Mock */}
                <div className="space-y-4 opacity-30 filter blur-[0.5px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-36 bg-gray-700 rounded" />
                      <div className="h-2 w-20 bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="h-8 w-3/4 bg-gray-800 rounded-md" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-800 rounded" />
                    <div className="h-3 w-full bg-gray-800 rounded" />
                    <div className="h-3 w-4/5 bg-gray-800 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-800 rounded-full" />
                    <div className="h-6 w-24 bg-gray-800 rounded-full" />
                  </div>
                </div>

                {/* Keyboard Shortcut Assist overlay */}
                {!isSimHudOpen && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30 transition-all duration-300">
                    <div className="glass-panel rounded-xl p-5 border border-white/10 text-center max-w-xs space-y-4">
                      <Command className="h-8 w-8 text-brand-indigo mx-auto animate-bounce" />
                      <p className="text-sm text-gray-300 font-light leading-relaxed">
                        Extension HUD is closed. Launch it again with the trigger or the hotkey:
                      </p>
                      <div className="flex justify-center gap-1.5">
                        <kbd className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white font-mono shadow-sm">Alt</kbd>
                        <span className="text-gray-400 self-center text-sm font-semibold">+</span>
                        <kbd className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white font-mono shadow-sm">K</kbd>
                      </div>
                      <button
                        onClick={() => setIsSimHudOpen(true)}
                        className="w-full py-2 rounded-lg bg-brand-indigo hover:bg-brand-violet text-white text-xs font-semibold shadow-md transition-colors"
                      >
                        Open In-Context HUD
                      </button>
                    </div>
                  </div>
                )}

                {/* --- MOCK LINK CRUST HUD MODAL (Top Layer Isolated Overlay) --- */}
                {isSimHudOpen && (
                  <div className="absolute inset-x-6 top-6 bottom-6 glass-panel rounded-xl border border-white/15 shadow-2xl flex flex-col z-20 overflow-hidden animate-fade-in transition-all duration-500 bg-[#0d0822]/90">

                    {/* HUD Header */}
                    <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-linear-to-tr from-brand-indigo to-brand-magenta flex items-center justify-center shrink-0">
                          <Link2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="font-display font-bold text-xs text-white tracking-wide">LINK CRUST</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-indigo/15 text-brand-indigo font-mono shrink-0 border border-brand-indigo/10">Alt+K</span>
                      </div>

                      <button
                        onClick={() => setIsSimHudOpen(false)}
                        className="text-gray-500 hover:text-white text-xs font-semibold p-1 hover:bg-white/5 rounded transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* HUD Save Input Form */}
                    <form onSubmit={handleSimShorten} className="p-3.5 bg-white/5 border-b border-white/5 space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Paste long URL here..."
                            value={simUrlInput}
                            onChange={(e) => setSimUrlInput(e.target.value)}
                            required
                            className="w-full bg-[#15102a] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-indigo transition-colors"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSimSaving || !simUrlInput}
                          className="px-4 rounded-lg bg-linear-to-r from-brand-indigo to-brand-magenta hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold shrink-0 transition-opacity flex items-center gap-1.5 shadow-md shadow-brand-indigo/10"
                        >
                          {isSimSaving ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                              Smashing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5 text-yellow-300" />
                              Smash
                            </>
                          )}
                        </button>
                      </div>

                      {/* Custom Alias Toggle and Panel */}
                      <div className="flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => setIsCustomAlias(!isCustomAlias)}
                          className="text-brand-indigo hover:text-brand-magenta transition-colors font-medium flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          {isCustomAlias ? "Hide custom settings" : "Configure custom alias"}
                        </button>
                        <span className="text-gray-500">Fast Auto-Save</span>
                      </div>

                      {isCustomAlias && (
                        <div className="grid grid-cols-2 gap-2 pt-1.5 animate-fade-in">
                          <input
                            type="text"
                            placeholder="Display title (e.g. My Repo)"
                            value={simTitleInput}
                            onChange={(e) => setSimTitleInput(e.target.value)}
                            className="bg-[#15102a]/60 border border-white/10 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-indigo"
                          />
                          <input
                            type="text"
                            placeholder="Alias (e.g. alpha-guide)"
                            value={customAliasText}
                            onChange={(e) => setCustomAliasText(e.target.value)}
                            className="bg-[#15102a]/60 border border-white/10 rounded px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-indigo"
                          />
                        </div>
                      )}
                    </form>

                    {/* HUD Controls (Search & Domain Isolation Toggles) */}
                    <div className="px-3.5 py-2.5 bg-[#0f0b24] flex items-center justify-between border-b border-white/5 gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search saved links..."
                          value={simSearchQuery}
                          onChange={(e) => setSimSearchQuery(e.target.value)}
                          className="w-full bg-[#17122e] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none border border-transparent focus:border-white/5 transition-colors"
                        />
                      </div>

                      <button
                        onClick={() => setSimFilterSite(!simFilterSite)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${simFilterSite ? "bg-brand-indigo/15 border-brand-indigo text-brand-indigo" : "bg-transparent border-white/10 text-gray-400 hover:text-white"}`}
                      >
                        <Globe className="h-3 w-3 shrink-0" />
                        This Site Only
                      </button>
                    </div>

                    {/* HUD Links List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                      {filteredSimLinks.length > 0 ? (
                        filteredSimLinks.map((link) => (
                          <div
                            key={link.id}
                            className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 transition-all flex items-start justify-between gap-3 group/item"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs text-white truncate block">{link.title}</span>
                                <span className="text-[9px] px-1.5 py-0.2 bg-white/10 text-gray-400 rounded shrink-0">{link.category}</span>
                              </div>
                              <span className="text-[10px] text-gray-500 truncate block">{link.original}</span>

                              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-brand-indigo">
                                <Link2 className="h-3 w-3 shrink-0" />
                                <span className="hover:underline cursor-pointer">{link.short}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => copySimShortUrl(link.id, link.short)}
                              className={`p-1.5 rounded-md border shrink-0 transition-all ${simCopiedId === link.id ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-[#15102a] border-white/10 text-gray-400 hover:text-white"}`}
                            >
                              {simCopiedId === link.id ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 space-y-2">
                          <Eye className="h-8 w-8 text-gray-600 mx-auto" />
                          <p className="text-xs text-gray-500">No saved links found for this configuration.</p>
                        </div>
                      )}
                    </div>

                    {/* HUD Footer */}
                    <div className="px-4 py-2 bg-white/5 border-t border-white/5 text-[10px] text-gray-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Server className="h-3 w-3 text-brand-indigo" />
                        Connected to Supabase
                      </span>
                      <span>5 Saved Items</span>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* --- CORE FEATURES SECTION --- */}
      <section id="features" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-brand-magenta/20 text-xs font-semibold text-brand-magenta">
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            <span>Built For Power Users</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Designed for Researchers, Developers, & Knowledge Workers
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-light">
            Bookmark bars leak focus. Standard URL shorteners lack context. Link Crust solves this with keyboard triggers and native isolation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Alt+S Save */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 glass-card-hover space-y-6">
            <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/25 flex items-center justify-center shadow-lg shadow-brand-indigo/5 text-brand-indigo">
              <Zap className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Instant Alt+S Save</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/5 text-gray-400 font-mono">Hotkey</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Add the active browser tab to your context vault instantly without opening a separate tab. It records page hostname, title, and timestamp instantly.
              </p>
            </div>
          </div>

          {/* Card 2: Alt+K Dialog */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 glass-card-hover space-y-6">
            <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/25 flex items-center justify-center shadow-lg shadow-brand-violet/5 text-brand-violet">
              <Command className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Alt+K In-Context HUD</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/5 text-gray-400 font-mono">Overlay</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Bring up a gorgeous spotlight-style HUD search modal over any active webpage. Search, inspect details, copy short URLs, and manage links in under 100ms.
              </p>
            </div>
          </div>

          {/* Card 3: Hostname Filtering */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 glass-card-hover space-y-6">
            <div className="w-12 h-12 rounded-xl bg-brand-magenta/10 border border-brand-magenta/25 flex items-center justify-center shadow-lg shadow-brand-magenta/5 text-brand-magenta">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Site Domain Isolation</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-brand-indigo/15 text-brand-indigo rounded font-mono">Filters</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Link Crust isolates references. By default, it dynamically filters lists to show only links saved from the current active domain, saving you endless scroll search.
              </p>
            </div>
          </div>

          {/* Card 4: Database Sync */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 glass-card-hover space-y-6">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/25 flex items-center justify-center shadow-lg shadow-brand-cyan/5 text-brand-cyan">
              <Server className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Seamless Sync</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/5 text-gray-400 font-mono">Postgres</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-light">
                Never lose a bookmark. Everything syncs instantly with the Postgres datastore powered by Supabase. Accessible via either browser extension HUD or Web Vault.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5 bg-[#070414]/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Column Left: Visual Step Flow */}
          <div className="lg:col-span-5 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-brand-cyan/20 text-xs font-semibold text-brand-cyan">
              <Eye className="h-3.5 w-3.5" />
              <span>Intuitive Workflow</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              A Complete Workflow In Two Keystrokes
            </h2>

            <p className="text-gray-400 text-base leading-relaxed font-light">
              We built Link Crust with zero friction in mind. No complex tags, folders, or nested bookmark categories. Save, search, and reuse inside the page you are reading.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-brand-indigo/10 border border-brand-indigo/30 flex items-center justify-center font-bold text-xs text-brand-indigo shrink-0 mt-1">1</div>
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-white block">Alt + S: Instant Tab Capture</span>
                  <span className="text-xs text-gray-400 leading-normal block">Paves a quick context entry for the page you are currently viewing.</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center font-bold text-xs text-brand-violet shrink-0 mt-1">2</div>
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-white block">Alt + K: Spotlight HUD Open</span>
                  <span className="text-xs text-gray-400 leading-normal block">Summons the glassmorphic modal over any webpage, complete with focus trapping.</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-brand-magenta/10 border border-brand-magenta/30 flex items-center justify-center font-bold text-xs text-brand-magenta shrink-0 mt-1">3</div>
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-white block">Automatic Domain-Site Filtering</span>
                  <span className="text-xs text-gray-400 leading-normal block">Filters automatically to isolate pages saved on the active web host, making lookup faster.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column Right: Elegant Static Diagram Mock */}
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-1.5 bg-brand-indigo/15 rounded-2xl blur-xl pointer-events-none" />
            <div className="relative glass-panel rounded-2xl p-8 border border-white/10 flex flex-col gap-6">

              <h3 className="font-display font-bold text-lg text-white">Visual Workflow Overview</h3>

              <div className="flex flex-col md:flex-row items-center gap-4 justify-between relative">

                {/* Step Box A */}
                <div className="w-full md:w-48 p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 border border-brand-indigo/25 text-brand-indigo flex items-center justify-center mx-auto text-sm font-mono font-bold">Alt+S</div>
                  <span className="font-bold text-xs text-white block">Fast Save Tab</span>
                  <span className="text-[10px] text-gray-500 block">Saves URL, title, and site domain automatically</span>
                </div>

                <div className="h-6 w-[2px] md:h-[2px] md:w-12 bg-linear-to-r from-brand-indigo to-brand-violet shrink-0" />

                {/* Step Box B */}
                <div className="w-full md:w-48 p-4 rounded-xl bg-white/5 border border-white/5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-violet/10 border border-brand-violet/25 text-brand-violet flex items-center justify-center mx-auto text-sm font-mono font-bold">Alt+K</div>
                  <span className="font-bold text-xs text-white block">Summon overlay HUD</span>
                  <span className="text-[10px] text-gray-500 block">Instant search panel rises as a native top-layer dialog</span>
                </div>

                <div className="h-6 w-[2px] md:h-[2px] md:w-12 bg-linear-to-r from-brand-violet to-brand-magenta shrink-0" />

                {/* Step Box C */}
                <div className="w-full md:w-48 p-4 rounded-xl bg-white/5 border border-brand-white/5 text-center space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-magenta/10 border border-brand-magenta/25 text-brand-magenta flex items-center justify-center mx-auto"><Globe className="h-5 w-5" /></div>
                  <span className="font-bold text-xs text-white block">Domain Isolator filter</span>
                  <span className="text-[10px] text-gray-500 block">Lists are automatically pruned to active website domain</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* --- TECHNICAL SHOWCASE: SHADOW DOM ISOLATION --- */}
      <section id="architecture" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Graphic representation */}
          <div className="lg:col-span-6 relative order-last lg:order-first">
            <div className="absolute -inset-2 bg-brand-violet/15 rounded-2xl blur-xl pointer-events-none" />
            <div className="relative glass-panel rounded-2xl p-6 border border-white/10 font-mono text-xs text-gray-400 space-y-4">

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-indigo" />
                  <span className="text-white font-semibold">Webpage DOM Structure</span>
                </div>
                <span className="text-[10px] text-brand-indigo">Fully Isolated Shadow Host</span>
              </div>

              {/* DOM Simulator Code Representation */}
              <div className="space-y-2 select-none">
                <div>&lt;<span className="text-brand-magenta">html</span>&gt;</div>
                <div className="pl-4">&lt;<span className="text-brand-indigo">body</span>&gt;</div>
                <div className="pl-8 text-gray-600">&lt;!-- Host Site CSS Rules Apply Here --&gt;</div>
                <div className="pl-8">&lt;<span className="text-brand-indigo">div</span> id=<span className="text-green-300">"app-root"</span> class=<span className="text-green-300">"h-full overflow-hidden"</span>&gt;...&lt;/<span className="text-brand-indigo">div</span>&gt;</div>

                {/* Shadow DOM Boundary element */}
                <div className="pl-8 bg-brand-indigo/10 border border-brand-indigo/35 py-2.5 rounded-lg my-3 px-3">
                  <div className="flex items-center justify-between mb-1.5 text-brand-indigo font-bold text-[10px]">
                    <span>🎯 SHADOW HOST DOM BOUNDARY</span>
                    <span className="bg-brand-indigo/20 px-1.5 py-0.5 rounded text-[8px]">Isolated context</span>
                  </div>
                  <div className="pl-4">&lt;<span className="text-brand-cyan">div</span> id=<span className="text-green-300">"link-smasher-root"</span>&gt;</div>
                  <div className="pl-8 text-brand-cyan font-bold">#shadow-root (open)</div>
                  <div className="pl-12 text-gray-500">&lt;!-- Link Crust Injected Shadow Styles --&gt;</div>
                  <div className="pl-12">&lt;<span className="text-brand-magenta">style</span>&gt;@import "shadow-index.css";&lt;/<span className="text-brand-magenta">style</span>&gt;</div>
                  <div className="pl-12">&lt;<span className="text-brand-indigo">div</span> class=<span className="text-green-300">"glass-panel text-white font-sans"</span>&gt;</div>
                  <div className="pl-16 text-yellow-300 font-semibold">&lt;!-- 100% immune to Host CSS leaks! --&gt;</div>
                  <div className="pl-12">&lt;/<span className="text-brand-indigo">div</span>&gt;</div>
                  <div className="pl-4">&lt;/<span className="text-brand-cyan">div</span>&gt;</div>
                </div>

                <div className="pl-4">&lt;/<span className="text-brand-indigo">body</span>&gt;</div>
                <div>&lt;/<span className="text-brand-magenta">html</span>&gt;</div>
              </div>

            </div>
          </div>

          {/* Right: Technical Explanation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-brand-violet/20 text-xs font-semibold text-brand-violet">
              <Shield className="h-3.5 w-3.5" />
              <span>Advanced Shadow DOM Injection</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Styles That Never Break The Websites You Read
            </h2>

            <p className="text-gray-400 text-base leading-relaxed font-light">
              Many Chrome extension overlays break because they inherit or clash with the styles of the website they are loaded on. E.g., custom button styles, margins, or fonts leaks on client sites.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center shrink-0 text-brand-cyan">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-white block">Absolute Sandboxed Shadow Host</span>
                  <span className="text-xs text-gray-400 leading-normal block">Link Crust wraps the HUD inside a strict browser shadow-root tree, insulating its UI components entirely.</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center shrink-0 text-brand-indigo">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-sm text-white block">Zero CSS Injection Contamination</span>
                  <span className="text-xs text-gray-400 leading-normal block">No global Tailwind classes are injected into client host DOM, maintaining the absolute integrity of your client pages.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 relative z-10 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-white/10 text-xs font-semibold text-gray-300">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <h4 className="font-bold text-sm text-white">What is a &quot;Link Smasher&quot;?</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              It refers to the process of smashing a massive, complex URL into a small, context-aware, readable reference. It helps keep your references clean and shareable.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <h4 className="font-bold text-sm text-white">How does domain isolation help?</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Normally, looking up saved links requires searching through a huge bookmarks vault. With domain isolation, the extension automatically extracts the domain of the website you are actively viewing and shows you only pages you saved from that site.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <h4 className="font-bold text-sm text-white">Is Link Crust safe and secure?</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Yes, absolutely. By leveraging strict Shadow DOM boundaries, Link Crust doesn't read or impact code execution on the websites you browse. Data syncing with Supabase uses secure authentication protocols.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <h4 className="font-bold text-sm text-white">Is it free and open source?</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Yes, Link Crust is 100% free and open-source. You can inspect all files, modify triggers, and even host your own database adapter in the project settings.
            </p>
          </div>

        </div>
      </section>

      {/* --- DOWNLOAD & CTA SECTION --- */}
      <section id="download" className="py-24 relative z-10 px-6 max-w-5xl mx-auto text-center">
        <div className="glass-panel rounded-3xl border border-white/10 p-12 md:p-16 relative overflow-hidden">

          {/* Subtle color highlight inside */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-indigo/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Ready to Upgrade Your Link Management Workflow?
            </h2>

            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed">
              Install the lightweight Link Crust Chrome extension today and experience instant keyboard saves, isolated domain search overlays, and database synchronization.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="https://chromewebstore.google.com"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-linear-to-r from-brand-indigo to-brand-magenta text-white shadow-xl shadow-brand-indigo/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Download className="h-5 w-5" />
                Add to Chrome (Free)
              </a>
              <a
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold glass-panel border border-white/10 hover:border-white/20 text-white hover:bg-white/5 transition-all duration-200"
              >
                Access Web Vault
              </a>
            </div>

            <div className="text-xs text-gray-500">
              No registration required for local storage use. Sync database optional.
            </div>
          </div>

        </div>
      </section>

      {/* --- PREMIUIM FOOTER --- */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-[#06030e]/80">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-brand-indigo to-brand-magenta flex items-center justify-center shadow shadow-brand-indigo/10">
                <Link2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">Link Crust</span>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              The ultimate in-context URL smasher and catalog companion designed for power users. Free, private, and open-source.
            </p>
          </div>

          <div>
            <span className="font-semibold text-xs text-white uppercase tracking-wider block mb-4">Product</span>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#simulator" className="hover:text-white transition-colors">Live Interactive Simulator</a></li>
              <li><a href="#architecture" className="hover:text-white transition-colors">Technical Architecture</a></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-xs text-white uppercase tracking-wider block mb-4">Resources</span>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">GitHub Repository <ExternalLink className="h-3 w-3 shrink-0" /></a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
              <li><a href="https://chrome.google.com/webstore" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Chrome Web Store</a></li>
            </ul>
          </div>

          <div>
            <span className="font-semibold text-xs text-white uppercase tracking-wider block mb-4">Legal</span>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="text-gray-500">© 2026 Link Crust. All rights reserved.</span></li>
            </ul>
          </div>

        </div>
      </footer>

    </div>
  );
}

// Custom simple Lucide-based or SVG graphics for Chrome, Firefox, Safari, and Github
function ChromeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="8" x2="12" y2="2" />
      <line x1="12" y1="16" x2="12" y2="22" />
      <line x1="8" y1="12" x2="2" y2="12" />
      <line x1="16" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function FirefoxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a8 8 0 0 0-8 8c0 4.42 3.58 8 8 8a7.89 7.89 0 0 0 6.37-3.23l-3.23-.77a4 4 0 0 1-5.14-5.14l.77-3.23A7.89 7.89 0 0 0 12 2z" />
    </svg>
  );
}

function SafariIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
