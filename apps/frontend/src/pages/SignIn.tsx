import { useState } from "react";
import type { SubmitEvent, ReactNode } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
import { Sun, Moon } from "lucide-react";
import { ThemeContext } from "../App";
// import { UserContext } from "../App";
import { useIsMobile } from "../hooks/useIsMobile";
// import { useGoogleLogin } from "@react-oauth/google";
import "../styles/SignIn.css";

function BrandMark({ size = 56 }) {
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

function ArrowIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function GoogleButton({
  label = "Continue with Google",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="signin-google-button">
      <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.93v2.32A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.93A9 9 0 0 0 0 9c0 1.45.35 2.83.93 4.04l3.04-2.32Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.88 11.43 0 9 0A9 9 0 0 0 .93 4.96l3.04 2.32C4.68 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      {label}
    </button>
  );
}

export default function SignIn() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  // const { setUser } = useContext(UserContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const isMobile = useIsMobile();

  const handleSignIn = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: POST email + password to `${apiUrl}/auth/login`, then setUser and navigate("/homepage")
    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error("Error while trying to get to rust 3000");
      }

      const data = await res.json();

      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Google sign-in (useGoogleLogin auth-code flow -> POST `${apiUrl}/auth/google`)
  };

  const formCardContent = (
    <div>
      <h2 className="signin-form-title">Sign in</h2>
      <p className="signin-form-subtitle">
        New here?{" "}
        <button
          onClick={() => navigate("/sign-up")}
          className="signin-link-button"
        >
          Create an account
        </button>
      </p>

      <GoogleButton onClick={handleGoogleLogin} />
      {/* Divider */}
      <div className="signin-divider">
        <div className="signin-divider-line" />
        or with email
        <div className="signin-divider-line" />
      </div>

      <form onSubmit={handleSignIn} className="signin-form">
        <Field label="Email">
          <InputWrap>
            <MailIcon />
            <input
              type="text"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="signin-input"
            />
          </InputWrap>
        </Field>

        <Field label="Password">
          <InputWrap>
            <LockIcon />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="signin-input"
            />
          </InputWrap>
        </Field>

        <button type="submit" className="signin-submit-button">
          Sign in
          <ArrowIcon size={15} />
        </button>
      </form>

      <div className="signin-back-row">
        <button onClick={() => navigate("/")} className="signin-back-button">
          ← Back to home
        </button>
      </div>
    </div>
  );

  const formCard = (
    <div className="signin-mobile-form-card">{formCardContent}</div>
  );

  if (isMobile) {
    return (
      <div className="signin-mobile-container">
        <div className="signin-mobile-halo" />
        <button onClick={toggleTheme} className="signin-mobile-theme-toggle">
          {darkMode ? (
            <Sun size={15} color="var(--c-text2)" />
          ) : (
            <Moon size={15} color="var(--c-text2)" />
          )}
        </button>
        <div className="signin-mobile-header">
          <BrandMark size={36} />
          <div className="signin-mobile-hero">
            <div className="signin-mobile-eyebrow">Welcome back</div>
            <h1 className="signin-mobile-title">
              Pick up
              <br />
              where you{" "}
              <span className="signin-title-accent">
                left
                <br />
                off.
              </span>
            </h1>
          </div>
        </div>
        <div className="signin-mobile-form-wrapper">{formCard}</div>
      </div>
    );
  }

  return (
    <div className="signin-container">
      <div className="signin-halo" />

      {/* Left column — editorial headline */}
      <div className="signin-left-column">
        <BrandMark size={56} />

        <div>
          <div className="signin-eyebrow">Welcome back</div>
          <h1 className="signin-title">
            Pick up
            <br />
            where you{" "}
            <span className="signin-title-accent">
              left
              <br />
              off.
            </span>
          </h1>
          <p className="signin-subtitle">
            3 follow-ups are due this week, and Stripe replied yesterday — keep
            momentum.
          </p>
        </div>

        <div className="signin-social-proof">
          <div className="signin-social-proof-avatar" />
          <div>
            <div className="signin-social-proof-highlight">
              32,408 applications tracked this week
            </div>
            by job seekers using TrackPath
          </div>
        </div>
      </div>

      <button onClick={toggleTheme} className="signin-theme-toggle">
        {darkMode ? (
          <Sun size={16} color="var(--c-text2)" />
        ) : (
          <Moon size={16} color="var(--c-text2)" />
        )}
      </button>

      {/* Right — floating form card (stretches top:60 → bottom:60) */}
      <div className="signin-form-card">{formCardContent}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="signin-field">
      <label className="signin-field-label">{label}</label>
      {children}
    </div>
  );
}

function InputWrap({ children }: { children: ReactNode }) {
  return <div className="signin-input-wrap">{children}</div>;
}

function MailIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--c-muted)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--c-muted)"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
