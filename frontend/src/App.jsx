import { useState, useEffect, useCallback } from "react";
import FactCard from "./components/FactCard";
import NextFactButton from "./components/NextFactButton";
import StatusPill from "./components/StatusPill";

async function fetchFact() {
  const res = await fetch("/api/facts/random");
  if (res.status === 404) {
    return { empty: true };
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export default function App() {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFact = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFact();
      if (data.empty) {
        setFact(null);
        setError("empty");
      } else {
        setFact(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFact();
  }, [loadFact]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--color-background)" }}
    >
      {/* Accent bar */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #e05127 0%, #f59e0b 50%, #e05127 100%)",
        }}
      />

      {/* Header */}
      <header
        className="w-full border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "rgba(250,250,248,0.82)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: 720, padding: "18px 24px" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 36,
                height: 36,
                background: "var(--color-primary)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  color: "var(--color-background)",
                  lineHeight: 1,
                }}
              >
                f
              </span>
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  lineHeight: 1.1,
                }}
              >
                Daily Fact
              </h1>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#a1a1aa",
                  letterSpacing: "0.06em",
                }}
              >
                PLATFORM
              </span>
            </div>
          </div>
          <StatusPill />
        </div>
      </header>

      {/* Hero */}
      <div
        className="mx-auto w-full"
        style={{ maxWidth: 720, padding: "48px 24px 0" }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--color-accent)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Fact Feed
        </p>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 44px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Curious things,
          <br />
          <span style={{ fontStyle: "italic", color: "var(--color-muted)" }}>
            served fresh.
          </span>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "#a1a1aa",
            lineHeight: 1.5,
            maxWidth: 420,
            marginTop: 12,
          }}
        >
          Sourced from the web by our background worker, stored in Postgres,
          served through our REST API.
        </p>
      </div>

      {/* Feed */}
      <main
        className="mx-auto w-full flex-1"
        style={{ maxWidth: 720, padding: "32px 24px 24px" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#a1a1aa",
            }}
          >
            GET /api/facts/random
          </span>
          <NextFactButton onClick={loadFact} loading={loading} />
        </div>

        {/* Loading skeleton */}
        {loading && !fact && (
          <div
            className="animate-pulse rounded-2xl border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              padding: "28px 32px",
              height: 160,
            }}
          />
        )}

        {/* Error state */}
        {error && error !== "empty" && (
          <div
            className="rounded-2xl border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              padding: "28px 32px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                color: "var(--color-muted)",
              }}
            >
              Could not reach the API. Make sure the backend is running.
            </p>
          </div>
        )}

        {/* Empty state — worker hasn't fetched yet */}
        {error === "empty" && (
          <div
            className="rounded-2xl border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              padding: "28px 32px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                marginBottom: 8,
              }}
            >
              No facts yet
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                color: "var(--color-muted)",
              }}
            >
              The background worker is fetching facts — check back in a moment.
            </p>
          </div>
        )}

        {/* Fact card */}
        {!loading && fact && <FactCard fact={fact} />}
      </main>

      {/* Footer */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row"
          style={{
            maxWidth: 720,
            padding: "16px 24px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#a1a1aa",
          }}
        >
          <span>Daily Fact Platform</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              Postgres connected
            </span>
            <span>React + FastAPI + PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
