import { useContext, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Settings, Plus, Sun, Moon, LogOut } from "lucide-react";
import { ThemeContext } from "../App";
// import { UserContext } from "../App";
import { useIsMobile } from "../hooks/useIsMobile";
// import { toast } from "react-toastify";
import "../styles/Topbar.css";

type TopbarProps = {
  title?: string;
  subtitle?: string | null;
  showAdd?: boolean;
  action?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: ((value: string) => void) | null;
  searchValue?: string;
};

export default function Topbar({
  title = "Applications",
  subtitle = null,
  showAdd = true,
  action = null,
  searchPlaceholder = "Search applications…",
  onSearch = null,
  searchValue = "",
}: TopbarProps) {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  // const { setUser } = useContext(UserContext);
  // const apiUrl = import.meta.env.VITE_API_URL;
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  async function handleLogout() {
    // TODO: POST `${apiUrl}/auth/logout` (credentials: "include"),
    // then setUser(null) and toast "Logged out" (toast "Logout failed" on error)
  }

  if (isMobile) {
    return (
      <header className="app-topbar-mobile">
        <div className="app-topbar-mobile-row">
          <div>
            <h1 className="app-topbar-mobile-title">{title}</h1>
            {subtitle && (
              <p className="app-topbar-mobile-subtitle">{subtitle}</p>
            )}
          </div>
          <div className="app-topbar-mobile-actions">
            {onSearch && (
              <button
                onClick={() => setMobileSearchOpen((o) => !o)}
                className="app-topbar-mobile-icon-button"
              >
                <Search size={18} color="var(--c-text2)" />
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="app-topbar-mobile-icon-button"
            >
              {darkMode ? (
                <Sun size={18} color="var(--c-text2)" />
              ) : (
                <Moon size={18} color="var(--c-text2)" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="app-topbar-mobile-icon-button"
              title="Log out"
            >
              <LogOut size={18} color="var(--c-text2)" />
            </button>
          </div>
        </div>

        {mobileSearchOpen && onSearch && (
          <div className="app-topbar-mobile-search">
            <Search size={15} color="var(--c-muted)" />
            <input
              autoFocus
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="app-topbar-search-input"
            />
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="app-topbar">
      <div className="app-topbar-heading">
        <div className="app-topbar-breadcrumb">
          <span>Workspace</span>
          <span>›</span>
          <span className="app-topbar-breadcrumb-current">{title}</span>
        </div>
        <h1 className="app-topbar-title">{title}</h1>
      </div>

      <div className="app-topbar-search">
        <Search size={16} color="var(--c-muted)" />
        <input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          className="app-topbar-search-input"
        />
      </div>

      <IconBtn onClick={() => {}}>
        <Bell size={17} color="var(--c-text2)" />
      </IconBtn>
      <IconBtn onClick={toggleTheme}>
        {darkMode ? (
          <Sun size={17} color="var(--c-text2)" />
        ) : (
          <Moon size={17} color="var(--c-text2)" />
        )}
      </IconBtn>
      <IconBtn onClick={() => {}}>
        <Settings size={17} color="var(--c-text2)" />
      </IconBtn>

      {(action || showAdd) && (
        <>
          <div className="app-topbar-divider" />
          {action ?? (
            <button
              onClick={() => navigate("/add-job")}
              className="app-topbar-add-button"
            >
              <Plus size={15} strokeWidth={2.4} color="white" />
              Add application
            </button>
          )}
        </>
      )}
    </header>
  );
}

export function IconBtn({
  onClick,
  children,
  style,
}: {
  onClick: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <button onClick={onClick} className="app-topbar-icon-button" style={style}>
      {children}
    </button>
  );
}
