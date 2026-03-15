import { ShuffleIcon, Spinner } from "./Icons";

export default function NextFactButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group inline-flex items-center gap-2 rounded-full border transition-all duration-200"
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 14,
        fontWeight: 500,
        padding: "9px 20px 9px 16px",
        cursor: loading ? "wait" : "pointer",
        background: loading ? "#f4f4f5" : "var(--color-primary)",
        color: loading ? "#a1a1aa" : "var(--color-background)",
        borderColor: loading ? "var(--color-border)" : "var(--color-primary)",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "var(--color-accent)";
          e.currentTarget.style.borderColor = "var(--color-accent)";
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "var(--color-primary)";
          e.currentTarget.style.borderColor = "var(--color-primary)";
        }
      }}
    >
      {loading ? <Spinner /> : <ShuffleIcon />}
      {loading ? "Loading\u2026" : "Next Fact"}
    </button>
  );
}
