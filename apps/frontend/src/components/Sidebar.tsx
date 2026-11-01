import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useUser } from "../hooks/userContextHook";
import {
  Briefcase,
  LayoutTemplate,
  BarChart3,
  Upload,
  Sparkles,
  LogOut,
} from "lucide-react";
// import { toast } from "react-toastify";
import { useIsMobile } from "../hooks/useIsMobile";
import "../styles/Sidebar.css";
import { signOut } from "../api/auth";

type IconType = ComponentType<{ size?: number; strokeWidth?: number }>;

const NAV = [
  { label: "Applications", icon: Briefcase, path: "/homepage" },
  { label: "Pipeline", icon: LayoutTemplate, path: "/pipeline" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
];

const RESOURCES = [
  { label: "Resume Library", icon: Upload, path: "/resume-library" },
  { label: "AI Resume Review", icon: Sparkles, path: "/resume-review" },
];

const ICON_SZ = 18;

export default function Sidebar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);

  if (isMobile) return null;

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  async function handleLogout() {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <aside
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={`app-sidebar${open ? " open" : ""}`}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="app-sidebar-logo">
        <span className="app-sidebar-logo-icon-wrap">
          <div className="app-sidebar-logo-icon">
            <Briefcase size={15} strokeWidth={2.3} color="white" />
          </div>
        </span>

        <div className="app-sidebar-logo-text">
          <div className="app-sidebar-logo-name">TrackPath</div>
          <div className="app-sidebar-logo-tagline">Job Search Suite</div>
        </div>
      </div>

      {/* ── Workspace nav ─────────────────────────────────── */}
      <SectionLabel>Workspace</SectionLabel>
      <nav className="app-sidebar-nav app-sidebar-nav-workspace">
        {NAV.map(({ label, icon: Icon, path }) => (
          <NavItem
            key={label}
            active={pathname === path}
            open={open}
            label={label}
            icon={Icon}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* ── Resources nav ─────────────────────────────────── */}
      <SectionLabel>Resources</SectionLabel>
      <nav className="app-sidebar-nav">
        {RESOURCES.map(({ label, icon: Icon, path }) => (
          <NavItem
            key={label}
            active={pathname === path}
            open={open}
            label={label}
            icon={Icon}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* ── User block ────────────────────────────────────── */}
      <div className="app-sidebar-user">
        <div className="app-sidebar-user-card">
          {open ? (
            /* ── Expanded: avatar · name/email · logout in a row ── */
            <div className="app-sidebar-user-row">
              <UserAvatar initials={initials} />
              <div className="app-sidebar-user-info">
                <div className="app-sidebar-user-name">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="app-sidebar-user-email">{user?.email}</div>
              </div>
              <LogoutBtn onClick={handleLogout} />
            </div>
          ) : (
            /* ── Collapsed: avatar stacked above logout, both centred ── */
            <div className="app-sidebar-user-stack">
              <UserAvatar initials={initials} />
              <LogoutBtn onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ─── Sub-components ────────────────────────────────────────────── */

// Open/closed styling comes from the parent `.app-sidebar.open` class
function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="app-sidebar-section-label">{children}</div>;
}

function NavItem({
  active,
  open,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  open: boolean;
  label: string;
  icon: IconType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={open ? undefined : label}
      className={`app-sidebar-nav-item${active ? " active" : ""}`}
    >
      {/* Active accent bar */}
      {active && <span className="app-sidebar-nav-accent" />}

      {/* Icon — color comes from CSS (currentColor), incl. hover */}
      <span className="app-sidebar-nav-icon">
        <Icon size={ICON_SZ} strokeWidth={active ? 2 : 1.7} />
      </span>

      {/* Label */}
      <span className="app-sidebar-nav-label">{label}</span>
    </button>
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return <div className="app-sidebar-avatar">{initials}</div>;
}

function LogoutBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} title="Log out" className="app-sidebar-logout">
      <LogOut size={14} />
    </button>
  );
}
