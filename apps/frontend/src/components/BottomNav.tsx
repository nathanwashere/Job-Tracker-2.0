import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  LayoutTemplate,
  BarChart3,
  Upload,
  Sparkles,
} from "lucide-react";
import "../styles/BottomNav.css";

const TABS = [
  { label: "Apps", icon: Briefcase, path: "/homepage" },
  { label: "Pipeline", icon: LayoutTemplate, path: "/pipeline" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Resumes", icon: Upload, path: "/resume-library" },
  { label: "AI Review", icon: Sparkles, path: "/resume-review" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav className="app-bottom-nav">
      {TABS.map(({ label, icon: Icon, path }) => {
        const active = pathname === path;
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`app-bottom-nav-tab${active ? " active" : ""}`}
          >
            {/* Icon color comes from the tab's CSS color (currentColor) */}
            <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
            <span className="app-bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
