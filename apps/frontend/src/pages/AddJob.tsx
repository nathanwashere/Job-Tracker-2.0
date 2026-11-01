import { useState } from "react";
import type { SubmitEvent, ReactNode } from "react";
// import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { UserContext } from "../App";
// import { toast } from "react-toastify";
import {
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BottomNav from "../components/BottomNav";
import { brandColor } from "../theme";
import { CompanyMark } from "./HomePage";
import { useIsMobile } from "../hooks/useIsMobile";
import {
  createJobApplication,
  editJobApplication,
} from "../api/jobApplication";
import type { Job, JobInput } from "../types/jobType";
import "../styles/AddJob.css";

const STATUSES = [
  "Pending",
  "Accepted",
  "Rejected",
  "Ghosted",
  "Interview Rejected",
];

function formatDateForInput(date: string | number | Date) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function AddJob() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { state } = useLocation();
  const existing: Job | undefined = state?.jobApplications;
  const isEdit = !!existing;

  const [company, setCompany] = useState(existing?.company ?? "");
  const [position, setPosition] = useState(existing?.position ?? "");
  const [status, setStatus] = useState(existing?.status ?? "Pending");
  const [date, setDate] = useState(() =>
    existing?.date
      ? formatDateForInput(existing.date)
      : formatDateForInput(Date.now()),
  );
  const [location, setLocation] = useState(existing?.location ?? "");
  const [jobType, setJobType] = useState(existing?.jobType ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [statusOpen, setStatusOpen] = useState(false);

  function validate() {
    if (!company.trim()) return "Company is required";
    if (!position.trim()) return "Position is required";
    return null;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = validate();
    if (err) {
      // TODO: toast.error(err)
      console.error(err);
      return;
    }
    try {
      const jobData: JobInput = {
        company: company,
        position: position,
        status: status,
        date: date,
        location: location || undefined,
        jobType: jobType || undefined,
        notes: notes || undefined,
      };
      if (isEdit) {
        await editJobApplication(existing._id, jobData);
      } else {
        await createJobApplication(jobData);
      }
      navigate("/homepage");
    } catch (error) {
      console.error(error);
    }
  }

  const actions = (
    <>
      <button
        type="submit"
        form="addjob-form"
        className="addjob-primary-button"
      >
        {isEdit ? "Save changes" : "Add application"}
      </button>
      <button
        type="button"
        onClick={() => navigate("/homepage")}
        className="addjob-cancel-button"
      >
        Cancel
      </button>
    </>
  );

  return (
    <div className="addjob-container">
      <Sidebar />
      <div className="addjob-main">
        <Topbar
          title={isEdit ? "Edit Application" : "Add Application"}
          showAdd={false}
        />
        <div className={`addjob-content${isMobile ? " mobile" : ""}`}>
          <button
            onClick={() => navigate("/homepage")}
            className="addjob-back-button"
          >
            <ArrowLeft size={15} />
            Back to Applications
          </button>

          <div className={`addjob-layout${isMobile ? " mobile" : ""}`}>
            {/* Main form */}
            <div className="addjob-form-card">
              <div className="addjob-form-header">
                <CompanyMark
                  name={company || "?"}
                  color={company ? brandColor(company) : "#CBD5E1"}
                />
                <div>
                  <div className="addjob-form-company">
                    {company || "New Application"}
                  </div>
                  <div className="addjob-form-position">
                    {position || "Position not set"}
                  </div>
                </div>
              </div>

              <form
                id="addjob-form"
                onSubmit={handleSubmit}
                className="addjob-form"
              >
                <div className={`addjob-row${isMobile ? " mobile" : ""}`}>
                  <FormField
                    label="Company *"
                    icon={<Building2 size={14} color="var(--c-muted)" />}
                  >
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Stripe"
                      required
                      className="addjob-input"
                    />
                  </FormField>
                  <FormField
                    label="Position *"
                    icon={<Briefcase size={14} color="var(--c-muted)" />}
                  >
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. Product Designer"
                      required
                      className="addjob-input"
                    />
                  </FormField>
                </div>

                <div className={`addjob-row${isMobile ? " mobile" : ""}`}>
                  <FormField
                    label="Location"
                    icon={<MapPin size={14} color="var(--c-muted)" />}
                  >
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State or Remote"
                      className="addjob-input"
                    />
                  </FormField>
                  <FormField
                    label="Job Type"
                    icon={<Briefcase size={14} color="var(--c-muted)" />}
                  >
                    <input
                      type="text"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      placeholder="Full-time, Part-time…"
                      className="addjob-input"
                    />
                  </FormField>
                </div>

                <div className={`addjob-row${isMobile ? " mobile" : ""}`}>
                  <FormField
                    label="Date Applied"
                    icon={<Calendar size={14} color="var(--c-muted)" />}
                  >
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="addjob-input"
                    />
                  </FormField>
                  <FormField label="Status">
                    <div className="addjob-status">
                      <button
                        type="button"
                        onClick={() => setStatusOpen((o) => !o)}
                        className="addjob-input addjob-status-button"
                      >
                        <span
                          className={`addjob-status-value${status ? "" : " empty"}`}
                        >
                          {status || "Select status"}
                        </span>
                        <ChevronDown size={14} color="var(--c-muted)" />
                      </button>
                      {statusOpen && (
                        <div className="addjob-status-menu">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setStatus(s);
                                setStatusOpen(false);
                              }}
                              className={`addjob-status-option${s === status ? " active" : ""}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormField>
                </div>

                <FormField
                  label="Notes"
                  icon={<FileText size={14} color="var(--c-muted)" />}
                >
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Recruiter name, interview details, follow-up date…"
                    rows={4}
                    className="addjob-input addjob-textarea"
                  />
                </FormField>

                {!isMobile && <div className="addjob-actions">{actions}</div>}
              </form>
            </div>

            {/* Tips panel — hidden on mobile */}
            {!isMobile && (
              <div className="addjob-tips">
                <div className="addjob-tip-card">
                  <div className="addjob-tip-header">
                    <span className="addjob-tip-icon">
                      <span className="addjob-tip-emoji">💡</span>
                    </span>
                    <span className="addjob-tip-title">Pro tip</span>
                  </div>
                  <p className="addjob-tip-text">
                    Add the job posting URL so you can reference it later. Many
                    listings disappear after the role is filled.
                  </p>
                </div>

                <div className="addjob-tip-card">
                  <div className="addjob-steps-title">Suggested next steps</div>
                  <div className="addjob-steps">
                    {[
                      "Save the job description",
                      "Note your point of contact",
                      "Set a follow-up reminder",
                      "Tailor your resume keywords",
                    ].map((step, i) => (
                      <div key={i} className="addjob-step">
                        <CheckCircle2
                          size={15}
                          color="var(--c-muted)"
                          className="addjob-step-icon"
                        />
                        <span className="addjob-step-text">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="addjob-guide-card">
                  <div className="addjob-guide-title">Status guide</div>
                  <div className="addjob-guide-list">
                    {[
                      { s: "Pending", desc: "Applied, awaiting response" },
                      { s: "Accepted", desc: "Offer received" },
                      { s: "Rejected", desc: "Application declined" },
                      { s: "Ghosted", desc: "No response after follow-up" },
                      {
                        s: "Interview Rejected",
                        desc: "Rejected post-interview",
                      },
                    ].map(({ s, desc }) => (
                      <div key={s} className="addjob-guide-row">
                        <span className="addjob-guide-status">{s}</span>
                        <span className="addjob-guide-desc">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {isMobile && <div className="addjob-mobile-actions">{actions}</div>}
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="addjob-field">
      <label className="addjob-field-label">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
