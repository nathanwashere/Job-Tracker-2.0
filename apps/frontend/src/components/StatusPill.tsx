import { STATUS } from "../theme";
import "../styles/StatusPill.css";

export default function StatusPill({
  status,
  size = "md",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const s = STATUS[status] || STATUS.Pending;
  return (
    <span
      className={`status-badge${size === "sm" ? " sm" : ""}`}
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="status-badge-dot" style={{ background: s.dot }} />
      {status}
    </span>
  );
}
