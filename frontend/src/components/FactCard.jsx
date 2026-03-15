import { useState } from "react";
import SourceLink from "./SourceLink";

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

export default function FactCard({ fact }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
      style={{
        animation: "cardIn 0.5s ease-out forwards",
      }}
    >
      <div
        className="rounded-2xl border transition-all duration-300"
        style={{
          background: "var(--color-surface)",
          borderColor: hovered
            ? "var(--color-border-hover)"
            : "var(--color-border)",
          boxShadow: hovered
            ? "0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05)"
            : "0 1px 2px rgba(0,0,0,.03), 0 4px 16px rgba(0,0,0,.02)",
          padding: "28px 32px",
        }}
      >
        {/* Meta row */}
        <div className="mb-4 flex items-center gap-3">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 500,
              background: "#f4f4f5",
              color: "var(--color-muted)",
              letterSpacing: "0.04em",
            }}
          >
            {fact.id.slice(0, 8)}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "#a1a1aa",
            }}
          >
            {timeAgo(fact.fetched_at)}
          </span>
        </div>

        {/* Fact text */}
        <p
          className="mb-5"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            color: "var(--color-primary)",
            lineHeight: 1.65,
            letterSpacing: "-0.01em",
          }}
        >
          {fact.text}
        </p>

        {/* Source link */}
        <SourceLink url={fact.source_url} />
      </div>
    </article>
  );
}
