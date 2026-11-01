import { useState, useEffect, useRef } from "react";
import type { ComponentType, MouseEvent } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
// PDF thumbnail rendering (pdfjs-dist) — disabled for now
// import * as pdfjsLib from "pdfjs-dist";
// import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Pencil,
  Check,
  X,
  FolderOpen,
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
// import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BottomNav from "../components/BottomNav";
import { formatDate } from "../theme";
import "../styles/ResumeLibrary.css";
import {
  deleteResume,
  getAllResumes,
  getResumeFile,
  updateResume,
  uploadResume,
} from "../api/resume";
import type { Resume } from "../types/resumeType";

type IconType = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

const TAGS = ["Default", "Design-only", "Engineering", "Archived"];

const TAG_STYLE: Record<string, { bg: string; fg: string }> = {
  Default: { bg: "#DBEAFE", fg: "#1D4ED8" },
  "Design-only": { bg: "#EDE9FE", fg: "#7C3AED" },
  Engineering: { bg: "#D1FAE5", fg: "#065F46" },
  Archived: { bg: "#F1F5F9", fg: "#475569" },
};

const CUSTOM_TAG_COLORS = [
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#FCE7F3", fg: "#9D174D" },
  { bg: "#E0F2FE", fg: "#0C4A6E" },
  { bg: "#FFF7ED", fg: "#9A3412" },
  { bg: "#FDF4FF", fg: "#701A75" },
  { bg: "#ECFEFF", fg: "#164E63" },
  { bg: "#F0FDF4", fg: "#14532D" },
];

function getTagStyle(tag: string) {
  if (TAG_STYLE[tag]) return TAG_STYLE[tag];
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  return CUSTOM_TAG_COLORS[Math.abs(h) % CUSTOM_TAG_COLORS.length];
}

function formatShortDate(date: string | number | Date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ResumeLibrary() {
  // const apiUrl = import.meta.env.VITE_API_URL;
  const isMobile = useIsMobile();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [taggingId, setTaggingId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterTag, setFilterTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchResumes() {
    try {
      let resumes = await getAllResumes();
      setResumes(resumes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle() {
      setTaggingId(null);
      setFilterOpen(false);
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  async function handleUpload(file?: File) {
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      // TODO: toast.error("Only PDF and Word documents are allowed")
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // TODO: toast.error("File must be under 10 MB")
      return;
    }

    setUploading(true);
    try {
      const resume = await uploadResume(
        file,
        file.name.replace(/\.[^/.]+$/, ""),
      );
      // Newest first, same order as the backend list
      setResumes((r) => [resume, ...r]);
      // TODO: toast.success("Resume uploaded")
    } catch (error) {
      console.error(error);
      // TODO: toast.error((error as Error).message)
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteResume(id);
      setResumes((r) => r.filter((x) => x._id !== id));
      // TODO: toast.success("Resume deleted")
    } catch (error) {
      console.error(error);
      // TODO: toast.error((error as Error).message)
    }
  }

  async function handleRename(id: string) {
    const name = renameVal.trim();
    if (!name) {
      setRenamingId(null);
      return;
    }
    try {
      const updated = await updateResume(id, { name });
      setResumes((r) => r.map((x) => (x._id === id ? updated : x)));
    } catch (error) {
      console.error(error);
      // TODO: toast.error((error as Error).message)
    } finally {
      setRenamingId(null);
    }
  }

  async function handleUpdateTag(id: string, tag: string) {
    setTaggingId(null);
    try {
      const updated = await updateResume(id, { tag });
      setResumes((r) =>
        r.map((x) => {
          if (x._id === id) return updated;
          // Only one default: the backend cleared it on the others, mirror that here
          if (tag === "Default")
            return {
              ...x,
              isDefault: false,
              tag: x.tag === "Default" ? "" : x.tag,
            };
          return x;
        }),
      );
    } catch (error) {
      console.error(error);
      // TODO: toast.error((error as Error).message)
    }
  }

  async function handleDownload(id: string, originalName: string) {
    try {
      const blob = await getResumeFile(id, "download");
      // Make a temporary link to the file and click it to start the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      // TODO: toast.error((error as Error).message)
    }
  }

  async function handlePreview(id: string) {
    // Open the tab right away (on the click), otherwise popup blockers may stop it
    const tab = window.open("", "_blank");
    try {
      const blob = await getResumeFile(id, "preview");
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      // Free the file from memory once the tab has had time to load it
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      tab?.close();
      console.error(error);
      // TODO: toast.error((error as Error).message)
    }
  }

  const defaultResume = resumes.find((r) => r.isDefault);
  const lastUpload = resumes.length
    ? formatShortDate(resumes[0].uploadedAt)
    : "—";
  const displayed = filterTag
    ? resumes.filter((r) => r.tag === filterTag)
    : resumes;
  const availableTags = [
    ...new Set(resumes.map((r) => r.tag).filter((t): t is string => !!t)),
  ];

  const openFilePicker = (e: MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.doc,.docx"
      className="resume-file-input"
      onChange={(e) => handleUpload(e.target.files?.[0])}
    />
  );

  const uploadBtn = (
    <button
      onClick={openFilePicker}
      disabled={uploading}
      className="resume-upload-button"
    >
      <Upload size={14} strokeWidth={2.4} />
      {uploading ? "Uploading…" : "Upload resume"}
    </button>
  );

  if (isMobile) {
    return (
      <div className="resume-mobile-container">
        <Topbar
          title="Resume Library"
          subtitle={`${resumes.length} resume${resumes.length !== 1 ? "s" : ""}`}
          showAdd={false}
        />
        {fileInput}
        <div className="resume-mobile-content">
          {loading ? (
            <div className="resume-mobile-loading">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="resume-mobile-empty">
              <FolderOpen
                size={32}
                strokeWidth={1.4}
                color="var(--c-muted)"
                className="resume-mobile-empty-icon"
              />
              <div className="resume-empty-title">
                {filterTag
                  ? `No resumes tagged "${filterTag}"`
                  : "No resumes yet"}
              </div>
              <div className="resume-empty-text">
                Tap + to upload your first one.
              </div>
            </div>
          ) : (
            <div className="resume-mobile-list">
              {displayed.map((resume) => (
                <MobileResumeRow
                  key={resume._id}
                  resume={resume}
                  onDownload={() =>
                    handleDownload(resume._id, resume.originalName)
                  }
                  onPreview={() => handlePreview(resume._id)}
                  onDelete={() => handleDelete(resume._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* FAB upload */}
        <button
          onClick={openFilePicker}
          disabled={uploading}
          className="resume-fab"
        >
          <Upload size={22} strokeWidth={2.2} color="white" />
        </button>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="resume-container">
      <Sidebar />
      <div className="resume-main">
        <Topbar
          title="Resume Library"
          showAdd={false}
          action={uploadBtn}
          searchPlaceholder="Search resumes…"
        />
        {fileInput}

        <div className="resume-content">
          {/* Description */}
          <p className="resume-description">
            Tailor a resume to each opportunity. Upload as many PDF variants as
            you need — give each a clear display name and we'll attach it when
            you apply.
          </p>

          {/* Stats row */}
          <div className="resume-stats">
            <StatCard
              icon={Upload}
              label="Total resumes"
              value={resumes.length}
            />
            <StatCard icon={Send} label="Sent in last 30 days" value={0} />
            <StatCard icon={Clock} label="Last upload" value={lastUpload} />
            <StatCard
              icon={CheckCircle2}
              label="Default for new apps"
              value={defaultResume?.name ?? "—"}
            />
          </div>

          {/* Section header */}
          <div className="resume-section-header">
            <div className="resume-section-heading">
              <span className="resume-section-eyebrow">All resumes</span>
              <span className="resume-section-meta">
                {displayed.length} file{displayed.length !== 1 ? "s" : ""} ·
                sorted by upload date
              </span>
            </div>

            {/* Filter */}
            <div className="resume-filter" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={`resume-filter-button${filterTag ? " active" : ""}`}
              >
                <SlidersHorizontal size={13} strokeWidth={2} />
                {filterTag || "Filter"}
              </button>
              {filterOpen && (
                <div className="resume-filter-menu">
                  {["", ...availableTags].map((t) => (
                    <button
                      key={t || "all"}
                      onClick={() => {
                        setFilterTag(t);
                        setFilterOpen(false);
                      }}
                      className={`resume-menu-option${filterTag === t ? " active" : ""}`}
                    >
                      {t || "All resumes"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="resume-loading">Loading…</div>
          ) : displayed.length === 0 ? (
            <div className="resume-empty">
              <div className="resume-empty-icon">
                <FolderOpen
                  size={22}
                  strokeWidth={1.6}
                  color="var(--c-muted)"
                />
              </div>
              <div className="resume-empty-title">
                {filterTag
                  ? `No resumes tagged "${filterTag}"`
                  : "No resumes yet"}
              </div>
              <div className="resume-empty-text">
                {filterTag
                  ? "Try a different filter or clear it."
                  : "Click “Upload resume” to add your first one."}
              </div>
            </div>
          ) : (
            <div className="resume-grid">
              {displayed.map((resume) => (
                <ResumeCard
                  key={resume._id}
                  resume={resume}
                  isRenaming={renamingId === resume._id}
                  renameVal={renameVal}
                  isTagging={taggingId === resume._id}
                  onStartRename={() => {
                    setRenamingId(resume._id);
                    setRenameVal(resume.name);
                  }}
                  onRenameChange={setRenameVal}
                  onRenameSubmit={() => handleRename(resume._id)}
                  onRenameCancel={() => setRenamingId(null)}
                  onToggleTag={(e) => {
                    e.stopPropagation();
                    setTaggingId(taggingId === resume._id ? null : resume._id);
                  }}
                  onSelectTag={(tag) => handleUpdateTag(resume._id, tag)}
                  onDelete={() => handleDelete(resume._id)}
                  onDownload={() =>
                    handleDownload(resume._id, resume.originalName)
                  }
                  onPreview={() => handlePreview(resume._id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="resume-stat-card">
      <div className="resume-stat-icon">
        <Icon size={16} strokeWidth={1.7} color="var(--c-text2)" />
      </div>
      <div className="resume-stat-body">
        <div className="resume-stat-label">{label}</div>
        <div className="resume-stat-value">{value}</div>
      </div>
    </div>
  );
}

function PdfThumbnail() {
  return (
    <div className="resume-thumb">
      <div className="resume-thumb-badge">PDF</div>
      <div className="resume-thumb-page">
        <div className="resume-thumb-title" />
        <div className="resume-thumb-subtitle" />
        <div className="resume-thumb-divider" />
        {/* Line widths vary per line, so they stay inline */}
        {[100, 93, 87, 100, 78, 100, 90, 72].map((w, i) => (
          <div
            key={i}
            className="resume-thumb-line"
            style={{ width: `${w}%` }}
          />
        ))}
        <div className="resume-thumb-gap" />
        {[100, 88, 95].map((w, i) => (
          <div
            key={i}
            className="resume-thumb-line"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function TagPill({
  tag,
  onClick,
}: {
  tag: string;
  onClick: (e: MouseEvent) => void;
}) {
  const s = getTagStyle(tag);
  return (
    <span
      onClick={onClick}
      className="resume-tag-pill"
      style={{ background: s.bg, color: s.fg }}
    >
      {tag}
    </span>
  );
}

function ResumeCard({
  resume,
  isRenaming,
  renameVal,
  isTagging,
  onStartRename,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onToggleTag,
  onSelectTag,
  onDelete,
  onDownload,
  onPreview,
}: {
  resume: Resume;
  isRenaming: boolean;
  renameVal: string;
  isTagging: boolean;
  onStartRename: () => void;
  onRenameChange: (value: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onToggleTag: (e: MouseEvent) => void;
  onSelectTag: (tag: string) => void;
  onDelete: () => void;
  onDownload: () => void;
  onPreview: () => void;
}) {
  const [customTag, setCustomTag] = useState("");

  function submitCustomTag() {
    const val = customTag.trim();
    if (val) {
      onSelectTag(val);
      setCustomTag("");
    }
  }

  return (
    <div className="resume-card">
      <PdfThumbnail />

      <div className="resume-card-body">
        {/* Title + tag */}
        <div className="resume-card-title-row">
          {isRenaming ? (
            <div className="resume-rename">
              <input
                autoFocus
                value={renameVal}
                onChange={(e) => onRenameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRenameSubmit();
                  if (e.key === "Escape") onRenameCancel();
                }}
                className="resume-rename-input"
              />
              <button
                onClick={onRenameSubmit}
                className="resume-icon-action success"
              >
                <Check size={13} />
              </button>
              <button onClick={onRenameCancel} className="resume-icon-action">
                <X size={13} />
              </button>
            </div>
          ) : (
            <div className="resume-card-name">{resume.name}</div>
          )}

          {/* Tag pill / add tag */}
          {!isRenaming && (
            <div className="resume-tag" onClick={(e) => e.stopPropagation()}>
              {resume.tag ? (
                <TagPill tag={resume.tag} onClick={onToggleTag} />
              ) : (
                <span onClick={onToggleTag} className="resume-add-tag">
                  + tag
                </span>
              )}
              {isTagging && (
                <div className="resume-tag-menu">
                  {["", ...TAGS].map((t) => (
                    <button
                      key={t || "none"}
                      onClick={() => onSelectTag(t)}
                      className={`resume-menu-option small${resume.tag === t ? " active" : ""}`}
                    >
                      {t || "No tag"}
                    </button>
                  ))}
                  <div className="resume-tag-custom">
                    <input
                      autoFocus={false}
                      placeholder="New tag…"
                      value={customTag}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") submitCustomTag();
                      }}
                      className="resume-tag-custom-input"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        submitCustomTag();
                      }}
                      className="resume-tag-custom-button"
                    >
                      Add tag
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filename + actions */}
        <div className="resume-card-file-row">
          <span className="resume-card-filename">{resume.originalName}</span>
          <button
            onClick={onStartRename}
            title="Rename"
            className="resume-icon-action"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="resume-icon-action danger"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Date */}
        <div className="resume-card-date-row">
          <Calendar size={12} strokeWidth={1.8} color="var(--c-muted)" />
          <span className="resume-card-date">
            {formatDate(resume.uploadedAt)}
          </span>
        </div>

        {/* Buttons */}
        <div className="resume-card-buttons">
          <button onClick={onPreview} className="resume-outline-button">
            <FileText size={13} strokeWidth={1.8} />
            Preview
          </button>
          <button onClick={onDownload} className="resume-solid-button">
            <Download size={13} strokeWidth={2} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileResumeRow({
  resume,
  onDownload,
  onPreview,
  onDelete,
}: {
  resume: Resume;
  onDownload: () => void;
  onPreview: () => void;
  onDelete: () => void;
}) {
  const s = resume.tag ? getTagStyle(resume.tag) : null;
  return (
    <div className="resume-mobile-row">
      {/* PDF badge */}
      <div className="resume-mobile-badge">
        <span className="resume-mobile-badge-text">PDF</span>
        <FileText size={16} strokeWidth={1.5} color="var(--c-muted)" />
      </div>

      {/* Info */}
      <div className="resume-mobile-info">
        <div className="resume-mobile-name">{resume.name}</div>
        <div className="resume-mobile-filename">{resume.originalName}</div>
        <div className="resume-mobile-meta">
          {s && (
            <span
              className="resume-mobile-tag"
              style={{ background: s.bg, color: s.fg }}
            >
              {resume.tag}
            </span>
          )}
          <span className="resume-mobile-date">
            {formatDate(resume.uploadedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="resume-mobile-actions">
        <button onClick={onPreview} className="resume-mobile-action">
          <FileText size={14} strokeWidth={1.8} />
        </button>
        <button onClick={onDownload} className="resume-mobile-action">
          <Download size={14} strokeWidth={2} />
        </button>
        <button onClick={onDelete} className="resume-mobile-action danger">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
