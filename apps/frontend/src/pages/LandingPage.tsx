import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../App";
import "../styles/LandingPage.css";
import { useIsMobile } from "../hooks/useIsMobile";

// Three rounded "steps" — abstract pipeline / progress mark (from design)
function BrandMark({ size = 64 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-label="TrackPath">
      <rect x="4" y="34" width="14" height="22" rx="3.5" fill="var(--c-ink)" />
      <rect
        x="22"
        y="20"
        width="14"
        height="36"
        rx="3.5"
        fill="var(--c-accent)"
      />
      <rect x="40" y="6" width="14" height="50" rx="3.5" fill="var(--c-teal)" />
    </svg>
  );
}

const MOCK_JOBS = [
  {
    company: "Stripe",
    role: "Senior Product Designer",
    location: "Remote · US",
    jobType: "Full-time",
    date: "May 12, 2026",
    status: "Accepted",
    brand: "#635BFF",
  },
  {
    company: "Linear",
    role: "Design Engineer",
    location: "San Francisco",
    jobType: "Full-time",
    date: "May 10, 2026",
    status: "Pending",
    brand: "#5E6AD2",
  },
  {
    company: "Figma",
    role: "Staff UX Researcher",
    location: "New York, NY",
    jobType: "Full-time",
    date: "May 08, 2026",
    status: "Accepted",
    brand: "#0D99FF",
  },
  {
    company: "Notion",
    role: "Product Designer, Platform",
    location: "Remote · NA",
    jobType: "Contract",
    date: "May 06, 2026",
    status: "Pending",
    brand: "#0F0F0F",
  },
  {
    company: "Airbnb",
    role: "Senior Brand Designer",
    location: "Seattle, WA",
    jobType: "Full-time",
    date: "May 03, 2026",
    status: "Interview Rejected",
    brand: "#FF385C",
  },
  {
    company: "Vercel",
    role: "Design Systems Lead",
    location: "Remote · Global",
    jobType: "Full-time",
    date: "Apr 29, 2026",
    status: "Rejected",
    brand: "#0B1B2B",
  },
  {
    company: "Anthropic",
    role: "Product Designer, Claude",
    location: "San Francisco",
    jobType: "Full-time",
    date: "Apr 24, 2026",
    status: "Pending",
    brand: "#D4A27F",
  },
  {
    company: "Ramp",
    role: "Senior Designer, Growth",
    location: "New York, NY",
    jobType: "Full-time",
    date: "Apr 21, 2026",
    status: "Ghosted",
    brand: "#FFCC00",
  },
];

const STATUS_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  Pending: { bg: "#FEF3C7", fg: "#92400E", dot: "#D97706" },
  Accepted: { bg: "#D1FAE5", fg: "#065F46", dot: "#059669" },
  Rejected: { bg: "#FEE2E2", fg: "#991B1B", dot: "#DC2626" },
  Interview: { bg: "#DBEAFE", fg: "#1E40AF", dot: "#2563EB" },
  "Interview Rejected": { bg: "#FFEDD5", fg: "#9A3412", dot: "#EA580C" },
  Ghosted: { bg: "#F3F4F6", fg: "#374151", dot: "#9CA3AF" },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span className="status-pill" style={{ background: s.bg, color: s.fg }}>
      <span className="status-pill-dot" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

// Arrow icon matching the design's Glyph("arrow")
function ArrowIcon({ size = 20, sw = 2.4 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

// Dashboard preview — scaled-down mockup of the full app
function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="dashboard-preview-inner">
        {/* Mini sidebar */}
        <div className="mini-sidebar">
          <div className="mini-sidebar-brand">
            <BrandMark size={28} />
            <div>
              <div className="mini-sidebar-brand-name">TrackPath</div>
              <div className="mini-sidebar-brand-tagline">Job Search Suite</div>
            </div>
          </div>
          {[
            { label: "Applications", active: true, badge: 47 },
            { label: "Pipeline", active: false },
            { label: "Analytics", active: false },
            { label: "Resume Library", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`mini-sidebar-item${item.active ? " active" : ""}`}
            >
              <div className="mini-sidebar-item-dot" />
              <span className="mini-sidebar-item-label">{item.label}</span>
              {item.badge && (
                <span className="mini-sidebar-item-badge">{item.badge}</span>
              )}
            </div>
          ))}
          <div className="mini-sidebar-user">
            <div className="mini-sidebar-user-row">
              <div className="mini-sidebar-avatar">MR</div>
              <div>
                <div className="mini-sidebar-user-name">Maya Reyes</div>
                <div className="mini-sidebar-user-email">maya@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-title-group">
              <div className="topbar-breadcrumb">Workspace › Applications</div>
              <div className="topbar-title">Applications</div>
            </div>
            <div className="topbar-search">
              <div className="topbar-search-icon" />
              <span className="topbar-search-placeholder">
                Search companies, roles…
              </span>
            </div>
            <div className="topbar-add-button">+ Add application</div>
          </div>

          {/* Stats strip */}
          <div className="stats-strip">
            {[
              { label: "Total applications", val: "47" },
              { label: "Active pipeline", val: "18" },
              { label: "Interviews", val: "6" },
              { label: "Response rate", val: "38%" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.val}</div>
              </div>
            ))}
          </div>

          {/* Job cards */}
          <div className="job-cards">
            {MOCK_JOBS.map((j) => (
              <div key={j.company + j.role} className="job-card">
                <div className="job-card-header">
                  <div
                    className="job-card-logo"
                    style={{ background: j.brand }}
                  >
                    {j.company[0]}
                  </div>
                  <div className="job-card-info">
                    <div className="job-card-role">{j.role}</div>
                    <div className="job-card-company">{j.company}</div>
                  </div>
                </div>
                {/* Meta tags */}
                <div className="job-card-tags">
                  {[j.location, j.jobType, j.date].map((tag) => (
                    <span key={tag} className="job-card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="job-card-footer">
                  <StatusPill status={j.status} />
                  <div className="job-card-actions">
                    <div className="job-card-action">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--c-text2)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      >
                        <path d="M4 20h4l10-10-4-4L4 16v4Z" />
                        <path d="m14 6 4 4" />
                      </svg>
                    </div>
                    <div className="job-card-action">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--c-text2)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      >
                        <path d="M14 4h6v6" />
                        <path d="M20 4 10 14" />
                        <path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mobile-container">
        <div className="mobile-halo" />

        <button onClick={toggleTheme} className="mobile-theme-toggle">
          {darkMode ? (
            <Sun size={15} color="var(--c-text2)" />
          ) : (
            <Moon size={15} color="var(--c-text2)" />
          )}
        </button>

        <div className="mobile-content">
          <BrandMark size={42} />

          <div className="mobile-hero">
            <div className="mobile-hero-eyebrow">Free for individuals</div>
            <h1 className="mobile-hero-title">
              The calm
              <br />
              way to run
              <br />
              your{" "}
              <span className="hero-title-accent">
                job
                <br />
                search.
              </span>
            </h1>
          </div>

          <div className="mobile-spacer" />

          {/* Mini preview card */}
          <div className="mobile-preview-card">
            <div className="mobile-preview-logo">S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink)" }}
              >
                Stripe · Sr. Product Designer
              </div>
              <div style={{ fontSize: 10.5, color: "var(--c-text2)" }}>
                Interview scheduled · Thu
              </div>
            </div>
            <StatusPill status="Interview" />
          </div>

          {/* CTAs */}
          <div className="mobile-cta-row">
            <button
              onClick={() => navigate("/sign-up")}
              className="mobile-signup-button"
            >
              <span className="mobile-signup-button-icon">
                <ArrowIcon size={15} sw={2.4} />
              </span>
              <span className="mobile-signup-button-label">Sign up</span>
            </button>
            <button
              onClick={() => navigate("/sign-in")}
              className="mobile-signin-button"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      {/* Soft halo behind the preview */}
      <div className="soft-halo-behind-the-preview" />

      <button onClick={toggleTheme} className="theme-toggle">
        {darkMode ? (
          <Sun size={16} color="var(--c-text2)" />
        ) : (
          <Moon size={16} color="var(--c-text2)" />
        )}
      </button>

      {/* Left column */}
      <div className="left-column">
        <BrandMark size={68} />

        <div>
          <div className="hero-eyebrow">Free for individual job seekers</div>
          <h1 className="hero-title">
            The calm way
            <br />
            to run your
            <br />
            <span className="hero-title-accent">job search.</span>
          </h1>
          <p className="hero-subtitle">
            Track every application, interview, and offer in one quiet workspace
            — built for thinking, not spreadsheet-wrangling.
          </p>
        </div>

        {/* CTA row */}
        <div className="cta-row">
          <button
            onClick={() => navigate("/sign-up")}
            className="signup-button"
          >
            <span className="signup-button-icon">
              <ArrowIcon size={20} sw={2.4} />
            </span>
            <span className="signup-button-label">Sign up</span>
          </button>
          <button onClick={() => navigate("/sign-in")} className="signin-button">
            Sign in
          </button>
        </div>
      </div>

      {/* Right — dashboard preview, bleeds off right edge */}
      <DashboardPreview />
    </div>
  );
}
