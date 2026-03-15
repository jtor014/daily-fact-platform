import { ExternalIcon } from "./Icons";

function domain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "source";
  }
}

export default function SourceLink({ url }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center transition-colors duration-200 hover:text-accent"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        color: "#a1a1aa",
        textDecoration: "none",
      }}
    >
      {domain(url)}
      <ExternalIcon />
    </a>
  );
}
