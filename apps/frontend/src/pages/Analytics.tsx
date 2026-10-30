import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Pause,
  XCircle,
  Lock,
  Download,
  Briefcase,
  ArrowUpDown,
  ArrowDownAZ,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BottomNav from "../components/BottomNav";
import StatusPill from "../components/StatusPill";
import { brandColor, formatDate } from "../theme";
import { useIsMobile } from "../hooks/useIsMobile";
import { useJobApplications } from "../hooks/useJobApplications";
import "../styles/Analytics.css";
import type { Job } from "../types/jobType";

type IconType = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type TimeFilter = "30d" | "90d" | "all";

type CompanyStats = {
  count: number;
  latestDate: string | null;
  latestStatus: string;
};

const STATUS_CONFIG: {
  key: string;
  label: string;
  color: string;
  bg: string;
  icon: IconType;
}[] = [
  {
    key: "Pending",
    label: "Pending",
    color: "#D97706",
    bg: "#FEF9EE",
    icon: Clock,
  },
  {
    key: "Accepted",
    label: "Accepted",
    color: "#059669",
    bg: "#ECFDF5",
    icon: CheckCircle2,
  },
  {
    key: "Interview Rejected",
    label: "Interview Rejected",
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: Pause,
  },
  {
    key: "Rejected",
    label: "Rejected",
    color: "#DC2626",
    bg: "#FEF2F2",
    icon: XCircle,
  },
  {
    key: "Ghosted",
    label: "Ghosted",
    color: "#64748B",
    bg: "#F1F5F9",
    icon: Lock,
  },
];

const TIME_FILTERS: TimeFilter[] = ["30d", "90d", "all"];

const TIME_LABELS: Record<TimeFilter, string> = {
  "30d": "last 30 days",
  "90d": "last 90 days",
  all: "all time",
};

function filterByTime(jobs: Job[], tf: TimeFilter) {
  if (tf === "all") return jobs;
  const cutoff = Date.now() - (tf === "30d" ? 30 : 90) * 86400000;
  return jobs.filter((j) => new Date(j.date).getTime() >= cutoff);
}

export default function Analytics() {
  const isMobile = useIsMobile();
  const { jobs, loaded } = useJobApplications();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("90d");

  // Company chart state
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"count" | "alpha">("count");
  // Bars are "animated" once the current view's key has been committed,
  // so changing the key resets them to 0% on the same render
  const animKey = `${timeFilter}|${sortBy}|${loaded}`;
  const [animatedKey, setAnimatedKey] = useState("");
  const barsAnimated = animatedKey === animKey;

  // Re-animate bars whenever the visible data or sort order changes
  useEffect(() => {
    const t = setTimeout(() => setAnimatedKey(animKey), 40);
    return () => clearTimeout(t);
  }, [animKey]);

  if (!loaded)
    return (
      <div className="analytics-container">
        <Sidebar />
        <div className="analytics-main">
          <Topbar title="Analytics" />
          <div className="analytics-center">
            <span className="analytics-loading-text">Loading…</span>
          </div>
        </div>
        {isMobile && <BottomNav />}
      </div>
    );

  const filtered = filterByTime(jobs, timeFilter);
  const total = filtered.length;

  const counts = STATUS_CONFIG.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = filtered.filter((j) => j.status === s.key).length;
    return acc;
  }, {});

  const companiesMap = filtered.reduce<Record<string, CompanyStats>>(
    (acc, j) => {
      if (!acc[j.company])
        acc[j.company] = { count: 0, latestDate: null, latestStatus: j.status };
      acc[j.company].count++;
      const latest = acc[j.company].latestDate;
      if (!latest || new Date(j.date) > new Date(latest)) {
        acc[j.company].latestDate = j.date;
        acc[j.company].latestStatus = j.status;
      }
      return acc;
    },
    {},
  );

  const topCompanies = Object.entries(companiesMap)
    .sort((a, b) =>
      sortBy === "alpha" ? a[0].localeCompare(b[0]) : b[1].count - a[1].count,
    )
    .slice(0, 8);
  const maxCount = topCompanies.reduce(
    (m, [, { count }]) => Math.max(m, count),
    1,
  );

  function exportCSV() {
    const headers = [
      "Company",
      "Position",
      "Status",
      "Date",
      "Location",
      "Job Type",
    ];
    const rows = filtered.map((j) => [
      j.company,
      j.position,
      j.status,
      new Date(j.date).toLocaleDateString(),
      j.location || "",
      j.jobType || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v ?? ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (jobs.length === 0)
    return (
      <div className="analytics-container">
        <Sidebar />
        <div className="analytics-main">
          <Topbar title="Analytics" subtitle={TIME_LABELS[timeFilter]} />
          <EmptyAnalytics />
        </div>
        {isMobile && <BottomNav />}
      </div>
    );

  if (isMobile) {
    const mobileStatuses = STATUS_CONFIG;
    return (
      <div className="analytics-mobile-container">
        <Topbar title="Analytics" subtitle={TIME_LABELS[timeFilter]} />
        <div className="analytics-mobile-content">
          {/* Time filter */}
          <div className="analytics-mobile-time-filters">
            {TIME_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`analytics-mobile-time-filter${timeFilter === t ? " active" : ""}`}
              >
                {t === "all" ? "All time" : t}
              </button>
            ))}
          </div>

          {/* Stat grid — 2 cols, Ghosted spans full width */}
          <div className="analytics-mobile-stats">
            {mobileStatuses.map((s, i) => (
              <div
                key={s.key}
                className={`analytics-mobile-stat${
                  i === mobileStatuses.length - 1 &&
                  mobileStatuses.length % 2 !== 0
                    ? " full"
                    : ""
                }`}
              >
                <div className="analytics-mobile-stat-header">
                  <div
                    className="analytics-mobile-stat-icon"
                    style={{ background: s.bg }}
                  >
                    <s.icon size={14} color={s.color} strokeWidth={1.9} />
                  </div>
                  <span className="analytics-mobile-stat-pct">
                    {total > 0 ? Math.round((counts[s.key] / total) * 100) : 0}%
                  </span>
                </div>
                <div className="analytics-mobile-stat-label">{s.label}</div>
                <div className="analytics-mobile-stat-value">
                  {counts[s.key]}
                </div>
              </div>
            ))}
          </div>

          {/* Status mix */}
          {total > 0 && (
            <div className="analytics-mobile-card">
              <div className="analytics-mobile-card-title">Status mix</div>
              <div className="analytics-mobile-mix">
                <DonutChart counts={counts} total={total} size={120} />
                <div className="analytics-mobile-legend">
                  {STATUS_CONFIG.filter((s) => counts[s.key] > 0).map((s) => (
                    <div key={s.key} className="analytics-mobile-legend-row">
                      <span
                        className="analytics-mobile-legend-swatch"
                        style={{ background: s.color }}
                      />
                      <span className="analytics-mobile-legend-label">
                        {s.label}
                      </span>
                      <span className="analytics-mobile-legend-count">
                        {counts[s.key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Company bars */}
          {topCompanies.length > 0 && (
            <div className="analytics-mobile-card">
              <div className="analytics-mobile-card-title">By company</div>
              <div className="analytics-mobile-bars">
                {topCompanies.map(([company, { count, latestStatus }], idx) => {
                  const sc =
                    STATUS_CONFIG.find((s) => s.key === latestStatus) ??
                    STATUS_CONFIG[0];
                  return (
                    <div
                      key={company}
                      className="analytics-mobile-bar-row"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <span className="analytics-mobile-bar-company">
                        {company}
                      </span>
                      <div className="analytics-mobile-bar-track">
                        <div
                          className="analytics-mobile-bar-fill"
                          style={{
                            background: sc.color,
                            width: barsAnimated
                              ? `${(count / maxCount) * 100}%`
                              : "0%",
                            transitionDelay: `${idx * 0.06}s`,
                          }}
                        />
                      </div>
                      <span className="analytics-mobile-bar-count">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <BottomNav />
        {selectedCompany && (
          <CompanyDrillDown
            company={selectedCompany}
            applications={filtered.filter((j) => j.company === selectedCompany)}
            onClose={() => setSelectedCompany(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <Sidebar />
      <div className="analytics-main">
        <Topbar title="Analytics" />
        <div className="analytics-content">
          {/* BY STATUS header */}
          <div className="analytics-section-header">
            <span className="analytics-section-eyebrow">By status</span>
            <span className="analytics-section-meta">
              Across all {total} application{total !== 1 ? "s" : ""} ·{" "}
              {TIME_LABELS[timeFilter]}
            </span>
          </div>

          {/* Stat cards */}
          <div className="analytics-stats">
            <StatCard
              label="Total Applications"
              count={total}
              icon={Briefcase}
              iconColor="#2F6BFF"
              iconBg="#EBF1FF"
            />
            {STATUS_CONFIG.map((s) => (
              <StatCard
                key={s.key}
                label={s.label}
                count={counts[s.key]}
                pct={total > 0 ? Math.round((counts[s.key] / total) * 100) : 0}
                icon={s.icon}
                iconColor={s.color}
                iconBg={s.bg}
              />
            ))}
          </div>

          {/* Status breakdown */}
          <div className="analytics-card breakdown">
            <div className="analytics-card-header breakdown">
              <div>
                <h3 className="analytics-card-title">Status breakdown</h3>
                <p className="analytics-card-subtitle">
                  Proportional split of every tracked application
                </p>
              </div>
              <div className="analytics-time-toggle">
                {TIME_FILTERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`analytics-time-button${timeFilter === t ? " active" : ""}`}
                  >
                    {t === "all" ? "All time" : t}
                  </button>
                ))}
              </div>
            </div>

            {total === 0 ? (
              <p className="analytics-no-data">
                No applications in this period — try &ldquo;All time&rdquo;.
              </p>
            ) : (
              <div className="analytics-breakdown">
                <DonutChart counts={counts} total={total} />
                <div className="analytics-legend">
                  {STATUS_CONFIG.filter((s) => counts[s.key] > 0).map((s) => {
                    const pct = Math.round((counts[s.key] / total) * 100);
                    return (
                      <div key={s.key} className="analytics-legend-row">
                        <span
                          className="analytics-legend-swatch"
                          style={{ background: s.color }}
                        />
                        <span className="analytics-legend-label">
                          {s.label}
                        </span>
                        <span className="analytics-legend-count">
                          {counts[s.key]}
                        </span>
                        <span className="analytics-legend-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Applications by company */}
          {topCompanies.length > 0 && (
            <div className="analytics-card">
              <div className="analytics-card-header">
                <div>
                  <h3 className="analytics-card-title">
                    Applications by company
                  </h3>
                  <p className="analytics-card-subtitle">
                    Bar color reflects the most recent application status
                  </p>
                </div>
                <div className="analytics-card-actions">
                  <button
                    onClick={() =>
                      setSortBy((s) => (s === "count" ? "alpha" : "count"))
                    }
                    className="analytics-outline-button"
                    title={sortBy === "count" ? "Sort A–Z" : "Sort by most"}
                  >
                    {sortBy === "count" ? (
                      <>
                        <ArrowDownAZ size={13} strokeWidth={2} />
                        A–Z
                      </>
                    ) : (
                      <>
                        <ArrowUpDown size={13} strokeWidth={2} />
                        Most first
                      </>
                    )}
                  </button>
                  <button
                    onClick={exportCSV}
                    className="analytics-outline-button"
                  >
                    <Download size={13} strokeWidth={2} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Chart rows */}
              <div className="analytics-bars">
                {topCompanies.map(([company, { count, latestStatus }], idx) => {
                  const sc =
                    STATUS_CONFIG.find((s) => s.key === latestStatus) ??
                    STATUS_CONFIG[0];
                  const isHovered = hoveredBar === company;
                  return (
                    <div
                      key={company}
                      className={`analytics-bar-row${isHovered ? " hovered" : ""}`}
                      onMouseEnter={() => setHoveredBar(company)}
                      onMouseLeave={() => setHoveredBar(null)}
                      onClick={() => setSelectedCompany(company)}
                    >
                      {/* Hover tooltip */}
                      {isHovered && (
                        <div className="analytics-tooltip">
                          <span
                            className="analytics-tooltip-dot"
                            style={{ background: sc.color }}
                          />
                          {company} · {latestStatus} · {count} app
                          {count !== 1 ? "s" : ""}
                        </div>
                      )}

                      <CompanyAvatar name={company} />

                      <div className="analytics-bar-info">
                        <div className="analytics-bar-company">{company}</div>
                        <div className="analytics-bar-status">
                          <span
                            className="analytics-bar-status-dot"
                            style={{ background: sc.color }}
                          />
                          <span className="analytics-bar-status-text">
                            {latestStatus}
                          </span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{
                            background: sc.color,
                            width: barsAnimated
                              ? `${(count / maxCount) * 100}%`
                              : "0%",
                            transitionDelay: `${idx * 0.06}s`,
                          }}
                        />
                      </div>

                      <span className="analytics-bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* X-axis */}
              <div className="analytics-axis">
                <div className="analytics-axis-spacer-left" />
                <div className="analytics-axis-ticks">
                  {Array.from({ length: maxCount + 1 }, (_, i) => (
                    <span key={i} className="analytics-axis-tick">
                      {i}
                    </span>
                  ))}
                </div>
                <div className="analytics-axis-spacer-right" />
              </div>
              <p className="analytics-axis-label">Number of applications</p>
            </div>
          )}
        </div>
      </div>

      {/* Drill-down modal */}
      {selectedCompany && (
        <CompanyDrillDown
          company={selectedCompany}
          applications={filtered.filter((j) => j.company === selectedCompany)}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}

function CompanyDrillDown({
  company,
  applications,
  onClose,
}: {
  company: string;
  applications: Job[];
  onClose: () => void;
}) {
  const sorted = [...applications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return (
    <>
      <div className="analytics-modal-backdrop" onClick={onClose} />
      <div className="analytics-modal">
        {/* Header */}
        <div className="analytics-modal-header">
          <div className="analytics-modal-title-row">
            <CompanyAvatar name={company} />
            <div>
              <div className="analytics-modal-title">{company}</div>
              <div className="analytics-modal-subtitle">
                {applications.length} application
                {applications.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="analytics-modal-close">
            <X size={15} color="var(--c-text2)" />
          </button>
        </div>

        {/* Application list */}
        <div className="analytics-modal-list">
          {sorted.map((app) => (
            <div key={app._id} className="analytics-modal-item">
              <div className="analytics-modal-item-header">
                <div className="analytics-modal-item-position">
                  {app.position}
                </div>
                <StatusPill status={app.status} size="sm" />
              </div>
              <div className="analytics-modal-item-meta">
                {app.date && (
                  <span className="analytics-modal-item-meta-text">
                    📅 {formatDate(app.date)}
                  </span>
                )}
                {app.location && (
                  <span className="analytics-modal-item-meta-text">
                    📍 {app.location}
                  </span>
                )}
                {app.jobType && (
                  <span className="analytics-modal-item-meta-text">
                    💼 {app.jobType}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  count,
  pct,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  count: number;
  pct?: number;
  icon: IconType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="analytics-stat-card">
      <div className="analytics-stat-header">
        <div className="analytics-stat-icon" style={{ background: iconBg }}>
          <Icon size={15} color={iconColor} strokeWidth={1.9} />
        </div>
        {pct !== undefined && (
          <span className="analytics-stat-pct">{pct}%</span>
        )}
      </div>
      <div className="analytics-stat-label">{label}</div>
      <div className="analytics-stat-value">{count}</div>
    </div>
  );
}

function DonutChart({
  counts,
  total,
  size = 200,
}: {
  counts: Record<string, number>;
  total: number;
  size?: number;
}) {
  const r = size * 0.34;
  const cx = size / 2,
    cy = size / 2;
  const circ = 2 * Math.PI * r;
  const strokeWidth = size * 0.13;

  // Each slice starts where the previous one ended
  const slices = STATUS_CONFIG.filter((s) => counts[s.key] > 0).reduce<
    { color: string; dash: number; gap: number; offset: number }[]
  >((acc, s) => {
    const pct = counts[s.key] / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.dash : 0;
    return [...acc, { color: s.color, dash, gap, offset }];
  }, []);

  return (
    // Size is a prop, so the wrapper dimensions stay inline
    <div className="analytics-donut" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="analytics-donut-svg"
      >
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </svg>
      <div className="analytics-donut-center">
        <span className="analytics-donut-eyebrow">Total</span>
        <span className="analytics-donut-total">{total}</span>
        <span className="analytics-donut-caption">applications</span>
      </div>
    </div>
  );
}

function CompanyAvatar({ name }: { name: string }) {
  return (
    <div
      className="analytics-company-avatar"
      style={{ background: brandColor(name) }}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function EmptyAnalytics() {
  return (
    <div className="analytics-center">
      <div className="analytics-empty">
        <div className="analytics-empty-icon">
          <TrendingUp size={24} strokeWidth={1.8} color="white" />
        </div>
        <h2 className="analytics-empty-title">No data yet</h2>
        <p className="analytics-empty-text">
          Start tracking applications and your analytics will appear here
          automatically.
        </p>
      </div>
    </div>
  );
}
