import { useState, useEffect } from "react";
import type { ComponentType, ReactNode } from "react";
// import { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { UserContext } from "../App";
// import { toast } from "react-toastify";
import {
  Briefcase,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  MapPin,
  LayoutTemplate,
  List,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BottomNav from "../components/BottomNav";
import StatusPill from "../components/StatusPill";
import { brandColor, formatDate } from "../theme";
import { useIsMobile } from "../hooks/useIsMobile";
// import "react-toastify/dist/ReactToastify.css";
import "../styles/HomePage.css";

type Job = {
  _id: string;
  company: string;
  position: string;
  status: string;
  date: string;
  location?: string;
  jobType?: string;
};

type IconType = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export default function HomePage() {
  // const apiUrl = import.meta.env.VITE_API_URL;
  // const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const q = searchQuery.trim().toLowerCase();
  const searched = q
    ? jobs.filter(
        (j) =>
          j.company?.toLowerCase().includes(q) ||
          j.position?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.jobType?.toLowerCase().includes(q),
      )
    : jobs;

  const counts = {
    total: searched.length,
    pending: searched.filter((a) => a.status === "Pending").length,
    accepted: searched.filter((a) => a.status === "Accepted").length,
    rejected: searched.filter((a) => a.status === "Rejected").length,
    ghosted: searched.filter((a) => a.status === "Ghosted").length,
    interviewRejected: searched.filter((a) => a.status === "Interview Rejected")
      .length,
  };

  useEffect(() => {
    // TODO: replace Promise.resolve(...) with
    // fetch(`${apiUrl}/job-application/find-all`, { credentials: "include" }).then(r => r.json())
    // and also setLoaded(true) on error
    Promise.resolve({ jobApplications: [] as Job[] }).then((data) => {
      setJobs(data.jobApplications || []);
      setLoaded(true);
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function deleteJob(_id: string) {
    // TODO: DELETE `${apiUrl}/job-application/delete/${id}`,
    // then setJobs(prev => prev.filter(a => a._id !== id)) and toast the result
  }

  function editJob(job: Job) {
    navigate("/add-job", {
      state: {
        jobApplications: {
          company: job.company,
          position: job.position,
          status: job.status,
          date: job.date,
          id: job._id,
          jobType: job.jobType,
          location: job.location,
        },
      },
    });
  }

  const displayed =
    filter === "all"
      ? searched
      : searched.filter((a) => a.status.toLowerCase() === filter);

  const activeCount = jobs.filter(
    (j) => !["Rejected", "Ghosted"].includes(j.status),
  ).length;

  const filters = [
    { k: "all", label: "All", n: counts.total },
    { k: "pending", label: "Pending", n: counts.pending },
    { k: "accepted", label: "Accepted", n: counts.accepted },
    { k: "rejected", label: "Rejected", n: counts.rejected },
    {
      k: "interview rejected",
      label: "Interview Rejected",
      n: counts.interviewRejected,
    },
    { k: "ghosted", label: "Ghosted", n: counts.ghosted },
  ];

  if (!loaded)
    return (
      <div className="home-container">
        <Sidebar />
        <div className="home-main">
          <Topbar title="Applications" />
          <div className="home-loading">
            <span className="home-loading-text">Loading…</span>
          </div>
        </div>
        {isMobile && <BottomNav />}
      </div>
    );

  if (isMobile) {
    return (
      <div className="home-mobile-container">
        <Topbar
          title="Applications"
          subtitle={`${counts.total} total · ${activeCount} active`}
          searchPlaceholder="Search companies, roles…"
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
        <div className="home-mobile-content">
          {/* Filter pills */}
          <div className="home-mobile-filters-wrap">
            <div className="home-mobile-filters">
              {filters.map((t) => (
                <button
                  key={t.k}
                  onClick={() => setFilter(t.k)}
                  className={`home-mobile-filter${filter === t.k ? " active" : ""}`}
                >
                  {t.label} · {t.n}
                </button>
              ))}
            </div>
            {/* Right-edge fade to hint at more pills */}
            <div className="home-mobile-filters-fade" />
          </div>

          {displayed.length === 0 ? (
            jobs.length === 0 ? (
              <div className="home-mobile-empty">
                <div className="home-mobile-empty-icon">
                  <Briefcase size={24} strokeWidth={1.8} color="white" />
                </div>
                <p className="home-mobile-empty-title">No applications yet</p>
                <p className="home-mobile-empty-text">
                  Tap + to add your first one.
                </p>
              </div>
            ) : (
              <p className="home-mobile-no-results">
                No results for &ldquo;{searchQuery}&rdquo;
              </p>
            )
          ) : (
            <div className="home-mobile-list">
              {displayed.map((job) => (
                <MobileJobCard
                  key={job._id}
                  job={job}
                  onEdit={() => editJob(job)}
                  onDelete={() => deleteJob(job._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB */}
        <button onClick={() => navigate("/add-job")} className="home-fab">
          <Plus size={22} strokeWidth={2.4} color="white" />
        </button>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="home-container">
      <Sidebar />
      <div className="home-main">
        <Topbar
          title="Applications"
          searchPlaceholder="Search companies, roles, contacts…"
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
        <div className="home-content">
          {/* Stats strip */}
          <div className="home-stats">
            <StatCard
              label="Total applications"
              value={counts.total}
              icon={Briefcase}
              iconColor="#2F6BFF"
              iconBg="#EBF1FF"
            />
            <StatCard
              label="Pending"
              value={counts.pending}
              icon={Clock}
              iconColor="#B45309"
              iconBg="#FEF3C7"
            />
            <StatCard
              label="Accepted"
              value={counts.accepted}
              icon={TrendingUp}
              iconColor="#047857"
              iconBg="#D1FAE5"
            />
            <StatCard
              label="Rejected"
              value={counts.rejected}
              icon={Sparkles}
              iconColor="#991B1B"
              iconBg="#FEE2E2"
            />
            <StatCard
              label="Interview Rejected"
              value={counts.interviewRejected}
              icon={Clock}
              iconColor="#5B21B6"
              iconBg="#EDE9FE"
            />
          </div>

          {jobs.length === 0 ? (
            <EmptyState onAdd={() => navigate("/add-job")} />
          ) : (
            <>
              {/* Filter bar + view toggle */}
              <div className="home-toolbar">
                <div className="home-filter-group">
                  {filters.map((t) => (
                    <button
                      key={t.k}
                      onClick={() => setFilter(t.k)}
                      className={`home-filter-button${filter === t.k ? " active" : ""}`}
                    >
                      {t.label}
                      <span className="home-filter-count">{t.n}</span>
                    </button>
                  ))}
                </div>
                <div className="home-toolbar-spacer" />
                <div className="home-view-toggle">
                  <ViewBtn
                    active={view === "grid"}
                    onClick={() => setView("grid")}
                    title="Grid"
                  >
                    <LayoutTemplate
                      size={15}
                      color={view === "grid" ? "white" : "var(--c-text2)"}
                    />
                  </ViewBtn>
                  <ViewBtn
                    active={view === "list"}
                    onClick={() => setView("list")}
                    title="List"
                  >
                    <List
                      size={15}
                      color={view === "list" ? "white" : "var(--c-text2)"}
                    />
                  </ViewBtn>
                </div>
              </div>

              {displayed.length === 0 ? (
                <div className="home-no-results">
                  <p className="home-no-results-title">No results</p>
                  <p className="home-no-results-text">
                    No applications match &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              ) : view === "grid" ? (
                <div className="home-grid">
                  {displayed.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onEdit={() => editJob(job)}
                      onDelete={() => deleteJob(job._id)}
                    />
                  ))}
                </div>
              ) : (
                <JobTable
                  jobs={displayed}
                  onEdit={editJob}
                  onDelete={deleteJob}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  label: string;
  value: number;
  icon: IconType;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="home-stat-card">
      <div className="home-stat-header">
        <span className="home-stat-label">{label}</span>
        <div className="home-stat-icon" style={{ background: iconBg }}>
          <Icon size={15} color={iconColor} strokeWidth={1.9} />
        </div>
      </div>
      <span className="home-stat-value">{value}</span>
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`home-view-button${active ? " active" : ""}`}
    >
      {children}
    </button>
  );
}

export function CompanyMark({ name, color }: { name: string; color: string }) {
  return (
    <div className="home-company-mark" style={{ background: color }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function MetaTag({ icon: Icon, text }: { icon: IconType; text: string }) {
  return (
    <span className="home-meta-tag">
      <Icon size={12} color="var(--c-muted)" />
      {text}
    </span>
  );
}

export function GhostBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button onClick={onClick} title={title} className="home-ghost-button">
      {children}
    </button>
  );
}

function JobCard({
  job,
  onEdit,
  onDelete,
}: {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="home-job-card">
      <div className="home-job-card-header">
        <CompanyMark name={job.company} color={brandColor(job.company)} />
        <div className="home-job-card-info">
          <div className="home-job-card-position">{job.position}</div>
          <div className="home-job-card-company">{job.company}</div>
        </div>
        <button onClick={onDelete} className="home-job-card-delete">
          <Trash2 size={15} color="var(--c-muted)" />
        </button>
      </div>

      <div className="home-job-card-tags">
        {job.date && <MetaTag icon={Calendar} text={formatDate(job.date)} />}
        {job.location && <MetaTag icon={MapPin} text={job.location} />}
        {job.jobType && <MetaTag icon={Briefcase} text={job.jobType} />}
      </div>

      <div className="home-job-card-footer">
        <StatusPill status={job.status} />
        <GhostBtn title="Edit" onClick={onEdit}>
          <Pencil size={14} color="var(--c-text2)" />
        </GhostBtn>
      </div>
    </div>
  );
}

function JobTable({
  jobs,
  onEdit,
  onDelete,
}: {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="home-table-wrap">
      <table className="home-table">
        <thead>
          <tr className="home-table-head-row">
            {[
              "Company / Role",
              "Status",
              "Location",
              "Type",
              "Applied",
              "",
            ].map((h, i) => (
              <th key={i} className="home-table-th">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job._id} className="home-table-row">
              <td className="home-table-td">
                <div className="home-table-company">
                  <CompanyMark
                    name={job.company}
                    color={brandColor(job.company)}
                  />
                  <div>
                    <div className="home-table-position">{job.position}</div>
                    <div className="home-table-company-name">{job.company}</div>
                  </div>
                </div>
              </td>
              <td className="home-table-td">
                <StatusPill status={job.status} size="sm" />
              </td>
              <td className="home-table-td muted">{job.location}</td>
              <td className="home-table-td muted">{job.jobType}</td>
              <td className="home-table-td muted">{formatDate(job.date)}</td>
              <td className="home-table-td actions">
                <div className="home-table-actions">
                  <GhostBtn title="Edit" onClick={() => onEdit(job)}>
                    <Pencil size={13} color="var(--c-text2)" />
                  </GhostBtn>
                  <GhostBtn title="Delete" onClick={() => onDelete(job._id)}>
                    <Trash2 size={13} color="var(--c-text2)" />
                  </GhostBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="home-empty-state">
      <div className="home-empty-state-card">
        <div className="home-empty-state-icon">
          <Briefcase size={28} strokeWidth={1.8} color="white" />
        </div>
        <h2 className="home-empty-state-title">Start tracking your search</h2>
        <p className="home-empty-state-text">
          Add your first application and stay on top of follow-ups, interviews,
          and offers.
        </p>
        <button onClick={onAdd} className="home-empty-state-button">
          Add first application
        </button>
      </div>
    </div>
  );
}

function MobileJobCard({
  job,
  onEdit,
  onDelete,
}: {
  job: Job;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="home-mobile-job-card">
      <div className="home-mobile-job-card-header">
        <CompanyMark name={job.company} color={brandColor(job.company)} />
        <div className="home-mobile-job-card-info">
          <div className="home-mobile-job-card-position">{job.position}</div>
          <div className="home-mobile-job-card-meta">
            {[job.company, job.location].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="home-mobile-job-card-actions">
          <button onClick={onEdit} className="home-mobile-job-card-action">
            <Pencil size={14} color="var(--c-muted)" />
          </button>
          <button onClick={onDelete} className="home-mobile-job-card-action">
            <Trash2 size={14} color="var(--c-muted)" />
          </button>
        </div>
      </div>
      <div className="home-mobile-job-card-footer">
        <StatusPill status={job.status} />
        <span className="home-mobile-job-card-date">
          {formatDate(job.date)}
        </span>
      </div>
    </div>
  );
}
