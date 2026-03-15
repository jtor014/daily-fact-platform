import { useState, useEffect } from "react";

export default function StatusPill() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--color-muted)",
        borderColor: "var(--color-border)",
        background: "rgba(250,250,248,0.8)",
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full transition-opacity duration-1000"
        style={{ background: "#22c55e", opacity: pulse ? 1 : 0.4 }}
      />
      Worker syncing
    </div>
  );
}
