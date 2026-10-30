import { useState } from "react";
import type { ReactNode } from "react";
// import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Job } from "../types/jobType";
import { CSS } from "@dnd-kit/utilities";
// import { UserContext } from "../App";
import { Briefcase, GripVertical, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BottomNav from "../components/BottomNav";
import { brandColor, formatDate } from "../theme";
import { CompanyMark } from "./HomePage";
import { useIsMobile } from "../hooks/useIsMobile";
import { useJobApplications } from "../hooks/useJobApplications";
import "../styles/Pipeline.css";

type Column = {
  key: string;
  label: string;
  color: string;
  softBg: string;
};

const COLUMNS: Column[] = [
  {
    key: "Pending",
    label: "Pending",
    color: "#D97706",
    softBg: "rgba(254,243,199,.55)",
  },
  {
    key: "Accepted",
    label: "Accepted",
    color: "#059669",
    softBg: "rgba(209,250,229,.55)",
  },
  {
    key: "Interview Rejected",
    label: "Interview Rejected",
    color: "#7C3AED",
    softBg: "rgba(237,233,254,.55)",
  },
  {
    key: "Rejected",
    label: "Rejected",
    color: "#DC2626",
    softBg: "rgba(254,226,226,.55)",
  },
  {
    key: "Ghosted",
    label: "Ghosted",
    color: "#64748B",
    softBg: "rgba(226,232,240,.55)",
  },
];

export default function Pipeline() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { jobs, setJobs, loaded } = useJobApplications();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [activeMobileCol, setActiveMobileCol] = useState(COLUMNS[0].key);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 6 },
    }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveJob(jobs.find((j) => j._id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveJob(null);
    if (!over) return;

    const newStatus = String(over.id);
    const job = jobs.find((j) => j._id === active.id);
    if (!job || job.status === newStatus) return;

    setJobs((prev) =>
      prev.map((j) => (j._id === active.id ? { ...j, status: newStatus } : j)),
    );

    // TODO: PATCH `${apiUrl}/job-application/edit` (credentials: "include") with
    // { idJobApplication: job._id, company, position, status: newStatus, date, location, jobType, notes: job.notes ?? "" },
    // and on error revert: setJobs(prev => prev.map(j => j._id === active.id ? { ...j, status: job.status } : j))
  }

  const subtitle =
    loaded && jobs.length > 0
      ? `${jobs.length} application${jobs.length !== 1 ? "s" : ""}`
      : undefined;

  /* ── Mobile layout ─────────────────────────────────────────────── */
  if (isMobile) {
    const colJobs = COLUMNS.reduce<Record<string, Job[]>>((acc, col) => {
      acc[col.key] = jobs.filter((j) => j.status === col.key);
      return acc;
    }, {});
    const activeCol =
      COLUMNS.find((c) => c.key === activeMobileCol) ?? COLUMNS[0];

    return (
      <div className="pipeline-mobile-container">
        <Topbar title="Pipeline" subtitle={subtitle} />

        {/* Tab strip */}
        <div className="pipeline-mobile-tabs">
          {COLUMNS.map((col) => {
            const isActive = activeMobileCol === col.key;
            return (
              <button
                key={col.key}
                onClick={() => setActiveMobileCol(col.key)}
                className="pipeline-mobile-tab"
                style={
                  isActive
                    ? { borderBottomColor: col.color, color: col.color }
                    : undefined
                }
              >
                {col.label}
                <span
                  className="pipeline-mobile-tab-count"
                  style={
                    isActive
                      ? { background: `${col.color}20`, color: col.color }
                      : undefined
                  }
                >
                  {colJobs[col.key].length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Card list */}
        <div className="pipeline-mobile-list">
          {!loaded ? (
            <div className="pipeline-mobile-loading">
              <span className="pipeline-loading-text">Loading…</span>
            </div>
          ) : colJobs[activeMobileCol].length === 0 ? (
            <div className="pipeline-mobile-empty">
              <div
                className="pipeline-mobile-empty-icon"
                style={{ background: `${activeCol.color}18` }}
              >
                <Briefcase
                  size={20}
                  strokeWidth={1.8}
                  color={activeCol.color}
                />
              </div>
              <p className="pipeline-mobile-empty-title">
                No {activeCol.label} applications
              </p>
              <p className="pipeline-mobile-empty-text">
                Drag cards here from another column on desktop.
              </p>
            </div>
          ) : (
            colJobs[activeMobileCol].map((job) => (
              <MobileCard key={job._id} job={job} />
            ))
          )}
        </div>

        {/* FAB */}
        <button onClick={() => navigate("/add-job")} className="pipeline-fab">
          <Plus size={22} color="white" strokeWidth={2.5} />
        </button>

        <BottomNav />
      </div>
    );
  }

  /* ── Desktop shell ─────────────────────────────────────────────── */
  const shell = (inner: ReactNode) => (
    <div className="pipeline-container">
      <Sidebar />
      <div className="pipeline-main">
        <Topbar title="Pipeline" subtitle={subtitle} />
        {inner}
      </div>
    </div>
  );

  if (!loaded)
    return shell(
      <div className="pipeline-center">
        <span className="pipeline-loading-text">Loading…</span>
      </div>,
    );

  if (jobs.length === 0)
    return shell(
      <div className="pipeline-center">
        <div className="pipeline-empty">
          <div className="pipeline-empty-icon">
            <Briefcase size={24} strokeWidth={1.8} color="white" />
          </div>
          <h2 className="pipeline-empty-title">No applications yet</h2>
          <p className="pipeline-empty-text">
            Add your first application on the Applications page and it will
            appear here.
          </p>
        </div>
      </div>,
    );

  return shell(
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="pipeline-board">
        <div className="pipeline-columns">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.key}
              col={col}
              jobs={jobs.filter((j) => j.status === col.key)}
              activeId={activeJob?._id}
            />
          ))}
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
        className="pipeline-drag-overlay"
      >
        {activeJob ? <FloatingCard job={activeJob} /> : null}
      </DragOverlay>
    </DndContext>,
  );
}

/* ─── Column ──────────────────────────────────────────────────────── */

function KanbanColumn({
  col,
  jobs,
  activeId,
}: {
  col: Column;
  jobs: Job[];
  activeId?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div className="pipeline-column">
      {/* Header */}
      <div
        className="pipeline-column-header"
        style={{ borderTopColor: col.color }}
      >
        <span className="pipeline-column-title">{col.label}</span>
        <span
          className="pipeline-column-count"
          style={{ background: `${col.color}1A`, color: col.color }}
        >
          {jobs.length}
        </span>
      </div>

      {/* Droppable card list */}
      <div
        ref={setNodeRef}
        className="pipeline-column-list"
        style={
          isOver
            ? { background: col.softBg, borderColor: `${col.color}55` }
            : undefined
        }
      >
        {jobs.map((job) => (
          <DraggableCard
            key={job._id}
            job={job}
            isGhost={job._id === activeId}
          />
        ))}

        {jobs.length === 0 && (
          <div
            className="pipeline-column-empty"
            style={isOver ? { borderColor: `${col.color}70` } : undefined}
          >
            <span
              className="pipeline-column-empty-text"
              style={isOver ? { color: col.color } : undefined}
            >
              {isOver ? "Drop here" : "Empty"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Draggable card ──────────────────────────────────────────────── */

function DraggableCard({ job }: { job: Job; isGhost: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: job._id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`pipeline-card${isDragging ? " dragging" : ""}`}
      // Drag position changes every frame, so it has to stay inline
      style={{ transform: CSS.Translate.toString(transform) }}
    >
      <CardBody job={job} />
    </div>
  );
}

/* ─── Floating overlay card (follows cursor) ─────────────────────── */

function FloatingCard({ job }: { job: Job }) {
  return (
    <div className="pipeline-floating-card">
      <CardBody job={job} />
    </div>
  );
}

/* ─── Shared card content ─────────────────────────────────────────── */

function CardBody({ job }: { job: Job }) {
  return (
    <>
      <div className="pipeline-card-header">
        <CompanyMark name={job.company} color={brandColor(job.company)} />
        <div className="pipeline-card-info">
          <div className="pipeline-card-position">{job.position}</div>
          <div className="pipeline-card-company">{job.company}</div>
        </div>
        <GripVertical
          size={13}
          color="var(--c-muted)"
          className="pipeline-card-grip"
        />
      </div>

      <div className="pipeline-card-tags">
        {job.jobType && (
          <span className="pipeline-card-tag">{job.jobType}</span>
        )}
        {job.location && (
          <span className="pipeline-card-tag">{job.location}</span>
        )}
        {job.date && (
          <span className="pipeline-card-date">{formatDate(job.date)}</span>
        )}
      </div>
    </>
  );
}

/* ─── Mobile-only card (no drag handle) ──────────────────────────── */

function MobileCard({ job }: { job: Job }) {
  return (
    <div className="pipeline-mobile-card">
      <CardBody job={job} />
    </div>
  );
}
