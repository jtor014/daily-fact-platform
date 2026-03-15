import { useState, useEffect, useRef } from "react";

/*
╔══════════════════════════════════════════════════════════════╗
║  DAILY FACT PLATFORM — DESIGN SYSTEM & INTERACTIVE PROTOTYPE ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  DESIGN TOKENS                                               ║
║  ─────────────                                               ║
║  Primary:       #0a0a0a  (near-black ink)                    ║
║  Accent:        #e05127  (warm cinnabar — the "curiosity"    ║
║                           signal, used sparingly)             ║
║  Background:    #fafaf8  (warm off-white)                    ║
║  Surface:       #ffffff  (card white)                        ║
║  Muted Text:    #71717a  (zinc-500)                          ║
║  Border:        #e4e4e7  (zinc-200)                          ║
║  Border Hover:  #d4d4d8  (zinc-300)                          ║
║                                                              ║
║  TYPOGRAPHY                                                  ║
║  ──────────                                                  ║
║  Display:  "Instrument Serif" — editorial warmth             ║
║  Body:     "DM Sans" — geometric clarity, Apple-adjacent     ║
║  Mono:     "JetBrains Mono" — technical metadata             ║
║                                                              ║
║  SPACING: 4px base, scale: 4 8 12 16 24 32 48 64 96         ║
║  RADIUS:  cards 16px · pills 999px · subtle 8px              ║
║  SHADOWS: 0 1px 2px rgba(0,0,0,.04),                        ║
║           0 4px 16px rgba(0,0,0,.03)                         ║
║                                                              ║
║  ANTI-SCOPE COMPLIANCE                                       ║
║  No auth/login · No likes/votes · No comments · No forms     ║
║  No Redux · No user-generated content                        ║
╚══════════════════════════════════════════════════════════════╝
*/

// ── Mock Data (simulates GET /api/facts) ──────────────────────
const FACTS_DB = [
  {
    id: "f-2a91",
    text: "Honey never spoils. Archaeologists have found 3,000-year-old jars of honey in Egyptian tombs that were still perfectly edible.",
    source_url: "https://www.smithsonianmag.com/science/the-science-behind-honeys-eternal-shelf-life",
    fetched_at: "2026-03-12T08:14:00Z",
  },
  {
    id: "f-7c38",
    text: "A group of flamingos is called a 'flamboyance.'",
    source_url: "https://www.nationalgeographic.com/animals/birds/facts/flamingos",
    fetched_at: "2026-03-12T07:30:00Z",
  },
  {
    id: "f-44b2",
    text: "Octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body — and it stops beating when the octopus swims.",
    source_url: "https://www.sciencedaily.com/releases/octopus-hearts",
    fetched_at: "2026-03-11T22:10:00Z",
  },
  {
    id: "f-19ef",
    text: "The shortest war in history lasted between 38 and 45 minutes, fought between the United Kingdom and Zanzibar on 27 August 1896.",
    source_url: "https://www.historic-uk.com/HistoryMagazine/DestinationsUK/The-Shortest-War-in-History",
    fetched_at: "2026-03-11T15:20:00Z",
  },
  {
    id: "f-88d0",
    text: "Venus is the only planet in our solar system that spins clockwise. It also has a day that is longer than its year.",
    source_url: "https://www.nasa.gov/venus",
    fetched_at: "2026-03-10T23:45:00Z",
  },
  {
    id: "f-33a7",
    text: "Scotland's national animal is the unicorn. It was chosen because in Celtic mythology, the unicorn symbolised purity, innocence, and power.",
    source_url: "https://www.visitscotland.com/about/uniquely-scottish/national-animal-unicorn",
    fetched_at: "2026-03-10T18:00:00Z",
  },
  {
    id: "f-55c1",
    text: "Bananas are botanically berries, but strawberries are not. A true berry must develop from a single ovary of a flower.",
    source_url: "https://www.britannica.com/story/is-a-banana-a-berry",
    fetched_at: "2026-03-10T12:30:00Z",
  },
  {
    id: "f-62d9",
    text: "A jiffy is an actual unit of time used in physics and computing — it represents 1/100th of a second.",
    source_url: "https://www.merriam-webster.com/dictionary/jiffy",
    fetched_at: "2026-03-09T20:15:00Z",
  },
];

// ── Helpers ───────────────────────────────────────────────────
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function domain(url) {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return "source"; }
}

// ── Decorative Dot Grid (background texture) ─────────────────
function DotGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage: "radial-gradient(circle, #d4d4d8 0.6px, transparent 0.6px)",
        backgroundSize: "28px 28px",
        opacity: 0.45,
      }}
    />
  );
}

// ── Subtle top-of-page decorative line ───────────────────────
function AccentBar() {
  return <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #e05127 0%, #f59e0b 50%, #e05127 100%)" }} />;
}

// ── Animated arrow icon ──────────────────────────────────────
function ArrowIcon({ className = "" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M3.75 9h10.5M10.5 5.25 14.25 9l-3.75 3.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── External link icon ───────────────────────────────────────
function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block ml-1 opacity-40 group-hover:opacity-70 transition-opacity">
      <path d="M4.5 2.5h5v5M9.5 2.5 2.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Shuffle / dice icon ──────────────────────────────────────
function ShuffleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h3.5l5 8H14M14 4h-3.5l-1.7 2.7M2 12h3.5l1.7-2.7M12.5 2.5 14.5 4l-2 1.5M12.5 10.5l2 1.5-2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Single Fact Card ─────────────────────────────────────────
function FactCard({ fact, index, isNew }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative transition-all duration-500 ease-out"
      style={{
        opacity: isNew ? 0 : 1,
        transform: isNew ? "translateY(16px)" : "translateY(0)",
        animation: isNew ? `cardIn 0.5s ${index * 100}ms ease-out forwards` : undefined,
      }}
    >
      <div
        className="rounded-2xl border transition-all duration-300"
        style={{
          background: "#ffffff",
          borderColor: hovered ? "#d4d4d8" : "#e4e4e7",
          boxShadow: hovered
            ? "0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05)"
            : "0 1px 2px rgba(0,0,0,.03), 0 4px 16px rgba(0,0,0,.02)",
          padding: "28px 32px",
        }}
      >
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              background: "#f4f4f5",
              color: "#71717a",
              letterSpacing: "0.04em",
            }}
          >
            {fact.id}
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#a1a1aa" }}>
            {timeAgo(fact.fetched_at)}
          </span>
        </div>

        {/* Fact text */}
        <p
          className="mb-5"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 17,
            color: "#0a0a0a",
            lineHeight: 1.65,
            letterSpacing: "-0.01em",
            margin: 0,
            marginBottom: 20,
          }}
        >
          {fact.text}
        </p>

        {/* Source link */}
        <a
          href={fact.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center transition-colors duration-200"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: "#a1a1aa",
            textDecoration: "none",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#e05127")}
          onMouseLeave={e => (e.currentTarget.style.color = "#a1a1aa")}
        >
          {domain(fact.source_url)}
          <ExternalIcon />
        </a>
      </div>
    </article>
  );
}

// ── API Status Pill ──────────────────────────────────────────
function StatusPill() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        color: "#71717a",
        borderColor: "#e4e4e7",
        background: "rgba(250,250,248,0.8)",
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full transition-opacity duration-1000"
        style={{ background: "#22c55e", opacity: pulse ? 1 : 0.4 }}
      />
      Worker syncing
    </div>
  );
}

// ── Design Token Sheet (modal) ───────────────────────────────
function DesignTokenSheet({ open, onClose }) {
  if (!open) return null;

  const tokens = {
    "Colour": [
      { label: "Primary / Ink", value: "#0a0a0a", swatch: "#0a0a0a" },
      { label: "Accent (Cinnabar)", value: "#e05127", swatch: "#e05127" },
      { label: "Background", value: "#fafaf8", swatch: "#fafaf8" },
      { label: "Surface / Card", value: "#ffffff", swatch: "#ffffff" },
      { label: "Muted Text", value: "#71717a", swatch: "#71717a" },
      { label: "Border", value: "#e4e4e7", swatch: "#e4e4e7" },
    ],
    "Typography": [
      { label: "Display", value: "Instrument Serif", note: "Headlines, hero" },
      { label: "Body", value: "DM Sans", note: "Interface copy, facts" },
      { label: "Mono", value: "JetBrains Mono", note: "IDs, metadata, code" },
    ],
    "Spacing & Radius": [
      { label: "Base Unit", value: "4px" },
      { label: "Card Padding", value: "28 × 32 px" },
      { label: "Card Radius", value: "16px" },
      { label: "Pill Radius", value: "999px" },
      { label: "Feed Gap", value: "16px" },
    ],
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,10,0.25)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="rounded-2xl border overflow-y-auto"
        style={{
          background: "#ffffff",
          borderColor: "#e4e4e7",
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
          width: "min(560px, 90vw)",
          maxHeight: "80vh",
          padding: "36px 40px",
          animation: "sheetIn 0.3s ease-out",
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#0a0a0a", margin: 0 }}>
            Design Tokens
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ background: "#f4f4f5", color: "#71717a", border: "none", cursor: "pointer", fontSize: 16 }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e4e4e7")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f4f4f5")}
          >
            ✕
          </button>
        </div>

        {Object.entries(tokens).map(([section, items]) => (
          <div key={section} className="mb-7">
            <h3
              className="uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "#e05127",
                letterSpacing: "0.14em",
                margin: "0 0 12px",
              }}
            >
              {section}
            </h3>
            <div className="flex flex-col">
              {items.map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "#f4f4f5" }}>
                  <div className="flex items-center gap-3">
                    {item.swatch && (
                      <div
                        className="w-5 h-5 rounded-md border"
                        style={{
                          background: item.swatch,
                          borderColor: item.swatch === "#ffffff" || item.swatch === "#fafaf8" ? "#e4e4e7" : "transparent",
                        }}
                      />
                    )}
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#0a0a0a" }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#71717a" }}>
                      {item.value}
                    </span>
                    {item.note && (
                      <span className="block" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#a1a1aa" }}>
                        {item.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function DailyFactPlatform() {
  const [facts, setFacts] = useState(FACTS_DB.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [showTokens, setShowTokens] = useState(false);
  const feedRef = useRef(null);

  // Simulate GET /api/facts/random — shuffles 4 new facts
  const fetchNext = () => {
    setLoading(true);
    setAnimKey(k => k + 1);
    setTimeout(() => {
      const shuffled = [...FACTS_DB].sort(() => Math.random() - 0.5);
      setFacts(shuffled.slice(0, 4));
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sheetIn {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; margin: 0; }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ background: "#fafaf8", color: "#0a0a0a" }}>
        <AccentBar />
        <DotGrid />

        {/* ── Header ──────────────────────────────── */}
        <header
          className="relative z-10 w-full border-b"
          style={{ borderColor: "#e4e4e7", background: "rgba(250,250,248,0.82)", backdropFilter: "blur(12px)" }}
        >
          <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 720, padding: "18px 24px" }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: "#0a0a0a" }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fafaf8", lineHeight: 1 }}>f</span>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, lineHeight: 1.1 }}>Daily Fact</h1>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a1a1aa", letterSpacing: "0.06em" }}>
                  PLATFORM
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill />
              <button
                onClick={() => setShowTokens(true)}
                className="rounded-full border transition-all duration-200"
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  color: "#71717a", borderColor: "#e4e4e7", background: "transparent",
                  padding: "6px 14px", cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#d4d4d8"; e.currentTarget.style.color = "#0a0a0a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e4e4e7"; e.currentTarget.style.color = "#71717a"; }}
              >
                Tokens
              </button>
            </div>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────── */}
        <div className="relative z-10 mx-auto w-full" style={{ maxWidth: 720, padding: "48px 24px 0" }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e05127",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8,
          }}>
            Fact Feed
          </p>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(32px, 5vw, 44px)",
            lineHeight: 1.15, letterSpacing: "-0.02em",
          }}>
            Curious things,<br />
            <span style={{ fontStyle: "italic", color: "#71717a" }}>served fresh.</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#a1a1aa",
            lineHeight: 1.5, maxWidth: 420, marginTop: 12,
          }}>
            Sourced from the web by our background worker, stored in Postgres, served through our REST API.
          </p>
        </div>

        {/* ── Feed ────────────────────────────────── */}
        <main ref={feedRef} className="relative z-10 mx-auto w-full flex-1" style={{ maxWidth: 720, padding: "32px 24px 24px" }}>
          <div className="flex items-center justify-between mb-5">
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a1a1aa" }}>
              {facts.length} facts · GET /api/facts
            </span>
            <button
              onClick={fetchNext}
              disabled={loading}
              className="group inline-flex items-center gap-2 rounded-full border transition-all duration-200"
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                padding: "9px 20px 9px 16px", cursor: loading ? "wait" : "pointer",
                background: loading ? "#f4f4f5" : "#0a0a0a",
                color: loading ? "#a1a1aa" : "#fafaf8",
                borderColor: loading ? "#e4e4e7" : "#0a0a0a",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#e05127"; e.currentTarget.style.borderColor = "#e05127"; }}}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.borderColor = "#0a0a0a"; }}}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" strokeLinecap="round" />
                </svg>
              ) : (
                <ShuffleIcon />
              )}
              {loading ? "Loading…" : "Next Facts"}
              {!loading && <ArrowIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />}
            </button>
          </div>

          <div key={animKey} className="flex flex-col gap-4">
            {facts.map((fact, i) => (
              <FactCard key={fact.id + animKey} fact={fact} index={i} isNew={true} />
            ))}
          </div>

          <div className="flex items-center gap-3 mt-8 mb-12">
            <div className="flex-1 h-px" style={{ background: "#e4e4e7" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#d4d4d8", letterSpacing: "0.08em" }}>
              END OF BATCH
            </span>
            <div className="flex-1 h-px" style={{ background: "#e4e4e7" }} />
          </div>
        </main>

        {/* ── Footer ──────────────────────────────── */}
        <footer className="relative z-10 border-t" style={{ borderColor: "#e4e4e7" }}>
          <div
            className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ maxWidth: 720, padding: "16px 24px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#a1a1aa" }}
          >
            <span>Daily Fact Platform · Learning Sandbox</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
                Postgres connected
              </span>
              <span>React + Express + PostgreSQL</span>
            </div>
          </div>
        </footer>
      </div>

      <DesignTokenSheet open={showTokens} onClose={() => setShowTokens(false)} />
    </>
  );
}
