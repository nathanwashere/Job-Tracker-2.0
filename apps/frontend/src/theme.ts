export const C = {
  navy: "var(--c-navy)",
  navy2: "var(--c-navy2)",
  navy3: "var(--c-navy3)",
  ink: "var(--c-ink)",
  text: "var(--c-text)",
  text2: "var(--c-text2)",
  muted: "var(--c-muted)",
  border: "var(--c-border)",
  border2: "var(--c-border2)",
  bg: "var(--c-bg)",
  white: "var(--c-white)",
  accent: "var(--c-accent)",
  accentDk: "var(--c-accent-dark)",
  accentSoft: "var(--c-accent-soft)",
  paper: "var(--c-paper)",
  teal: "var(--c-teal)",
};

export const STATUS: Record<string, { bg: string; fg: string; dot: string }> = {
  Pending: { bg: "#FEF3C7", fg: "#92400E", dot: "#D97706" },
  Accepted: { bg: "#D1FAE5", fg: "#065F46", dot: "#059669" },
  Rejected: { bg: "#FEE2E2", fg: "#991B1B", dot: "#DC2626" },
  Ghosted: { bg: "#E2E8F0", fg: "#334155", dot: "#64748B" },
  "Interview Rejected": { bg: "#EDE9FE", fg: "#5B21B6", dot: "#7C3AED" },
};

export const BRAND_COLORS = [
  "#635BFF", "#5E6AD2", "#0D99FF", "#FF385C",
  "#D4A27F", "#059669", "#7C3AED", "#0E7490",
  "#B45309", "#DC2626",
];

export function brandColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return BRAND_COLORS[Math.abs(h) % BRAND_COLORS.length];
}

export function formatDate(date: string | number | Date) {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
