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
import "../styles/SignUp.css";

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

function CheckIcon({ size = 11, color = "white" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5 10 17l9-9.5" />
    </svg>
  );
}

function GoogleButton({
  label = "Sign up with Google",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="signup-google-button">
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

export default function Signup() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  // const { setUser } = useContext(UserContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  function validate() {
    const nameRe = /^[A-Za-z]+$/;
    const emailRe = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    // eslint-disable-next-line no-control-regex
    const asciiRe = /^[\x00-\x7F]+$/;
    if (!nameRe.test(firstName))
      return "First name must contain only English letters";
    if (!nameRe.test(lastName))
      return "Last name must contain only English letters";
    if (!emailRe.test(email)) return "Invalid email address";
    if (!asciiRe.test(password))
      return "Password must contain only English letters, numbers, or symbols";
    return null;
  }

  const handleSignup = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      // toast.error(err);
      return;
    }
    const fmt = (s: String) =>
      s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    // TODO: POST to `${apiUrl}/auth/sign-up` with
    // { firstName, lastName (capitalized), email (lowercased), password, isEmployed: false },
    try {
      const res = await fetch(`${apiUrl}/auth/signin`, {
        method: "POST",
        body: JSON.stringify({
          firstName: fmt(firstName),
          lastName: fmt(lastName),
          email: email.toLowerCase(),
          password,
          isEmployed: false,
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || `Error ${res.status}`);
      }
      const data = await res.json();
      // setUser(data.user);
      // navigate("/homepage");
    } catch (error) {
      console.log(error);
    }

    // then setUser(data.user) and navigate("/homepage")
  };

  const handleGoogleLogin = () => {
    // TODO: Google sign-up (useGoogleLogin auth-code flow -> POST `${apiUrl}/auth/google`)
  };

  const formCard = (
    <div className="signup-form-card">
      <h2 className="signup-form-title">Create your account</h2>
      <p className="signup-form-subtitle">
        Already have one?{" "}
        <button
          onClick={() => navigate("/sign-in")}
          className="signup-link-button"
        >
          Sign in
        </button>
      </p>
      <GoogleButton onClick={handleGoogleLogin} />
      {/* Divider */}
      <div className="signup-divider">
        <div className="signup-divider-line" />
        or with email
        <div className="signup-divider-line" />
      </div>
      <form onSubmit={handleSignup} className="signup-form">
        <Field label="First name">
          <InputWrap>
            <UserIcon />
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              className="signup-input"
            />
          </InputWrap>
        </Field>
        <Field label="Last name">
          <InputWrap>
            <UserIcon />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
              className="signup-input"
            />
          </InputWrap>
        </Field>

        <Field label="Work email">
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
              className="signup-input"
            />
          </InputWrap>
        </Field>

        <Field label="Password" hint="At least 10 characters">
          <InputWrap>
            <LockIcon />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="signup-input"
            />
          </InputWrap>
        </Field>

        <label className="signup-terms">
          <span
            onClick={() => setAgreed((a) => !a)}
            className={`signup-checkbox${agreed ? " checked" : ""}`}
          >
            {agreed && <CheckIcon size={10} />}
          </span>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="signup-checkbox-input"
          />
          <span>
            I agree to the <span className="signup-terms-link">Terms</span> and{" "}
            <span className="signup-terms-link">Privacy Policy</span>.
          </span>
        </label>

        <button type="submit" className="signup-submit-button">
          Create account
          <ArrowIcon size={15} />
        </button>
      </form>
      <div className="signup-back-row">
        <button onClick={() => navigate("/")} className="signup-back-button">
          ← Back to home
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="signup-mobile-container">
        <div className="signup-mobile-halo" />
        <button onClick={toggleTheme} className="signup-mobile-theme-toggle">
          {darkMode ? (
            <Sun size={15} color="var(--c-text2)" />
          ) : (
            <Moon size={15} color="var(--c-text2)" />
          )}
        </button>
        <div className="signup-mobile-header">
          <BrandMark size={36} />
          <div className="signup-mobile-hero">
            <div className="signup-mobile-eyebrow">Free · no card</div>
            <h1 className="signup-mobile-title">
              Build a<br />
              quieter
              <br />
              <span className="signup-title-accent">job search.</span>
            </h1>
          </div>
        </div>
        <div className="signup-mobile-form-wrapper">{formCard}</div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-halo" />

      <button onClick={toggleTheme} className="signup-theme-toggle">
        {darkMode ? (
          <Sun size={16} color="var(--c-text2)" />
        ) : (
          <Moon size={16} color="var(--c-text2)" />
        )}
      </button>

      {/* Left column — editorial headline */}
      <div className="signup-left-column">
        <BrandMark size={56} />

        <div>
          <div className="signup-eyebrow">Start free · no card required</div>
          <h1 className="signup-title">
            Build a<br />
            quieter
            <br />
            <span className="signup-title-accent">job search.</span>
          </h1>
          <p className="signup-subtitle">
            Track applications, follow-ups, and offers in one calm workspace.
            Two minutes to set up.
          </p>
        </div>

        <div className="signup-social-proof">
          <div className="signup-social-proof-avatar" />
          <div>
            <div className="signup-social-proof-highlight">
              Free for individual job seekers
            </div>
            Unlimited applications, resumes, and notes
          </div>
        </div>
      </div>

      {/* Right — floating form card */}
      <div className="signup-form-wrapper">{formCard}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="signup-field">
      <label className="signup-field-label">{label}</label>
      {children}
      {hint && <div className="signup-field-hint">{hint}</div>}
    </div>
  );
}

function InputWrap({ children }: { children: ReactNode }) {
  return <div className="signup-input-wrap">{children}</div>;
}

function UserIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
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
