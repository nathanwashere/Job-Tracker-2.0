import { useState, createContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./pages/LandingPage.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import SignIn from "./pages/SignIn.tsx";
import Signup from "./pages/SignUp.tsx";
import HomePage from "./pages/HomePage.tsx";
import AddJob from "./pages/AddJob.tsx";
import Pipeline from "./pages/Pipeline.tsx";
import Analytics from "./pages/Analytics.tsx";
import ResumeLibrary from "./pages/ResumeLibrary.tsx";
import { useUser } from "./hooks/userContextHook.tsx";

type ThemeContextValue = {
  darkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleTheme: () => {},
});

function App() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const { user, setUser } = useUser();
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("jt-theme") === "dark";
    } catch {
      return false;
    }
  });

  const toggleTheme = () => setDarkMode((d) => !d);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("jt-theme", darkMode ? "dark" : "light");
    } catch {}
  }, [darkMode]);

  async function loadUser() {
    try {
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status == 401) {
          setUser(null);
          return;
        } else {
          throw new Error(`Status: ${response.status}`);
        }
      }
      const data = await response.json();
      console.log("User in loadUser function:", data.user);
      setUser(data.user || null);
    } catch (error) {
      console.error(`Error in restoring user from cookie, error: ${error}`);
      setUser(null);
    }
  }
  useEffect(() => {
    console.log("user is now:", user);
  }, [user]);
  useEffect(() => {
    loadUser();
  }, []);

  if (user === undefined) return null;

  return (
    <>
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/homepage" /> : <LandingPage />}
            />
            <Route
              path="/homepage"
              element={user ? <HomePage /> : <Navigate to="/" />}
            />
            <Route
              path="/sign-in"
              element={user ? <Navigate to="/" /> : <SignIn />}
            />
            <Route
              path="/sign-up"
              element={user ? <Navigate to="/" /> : <Signup />}
            />
            <Route
              path="/add-job"
              element={user ? <Navigate to="/" /> : <AddJob />}
            />
            <Route
              path="/pipeline"
              element={user ? <Navigate to="/" /> : <Pipeline />}
            />
            <Route
              path="/analytics"
              element={user ? <Navigate to="/" /> : <Analytics />}
            />
            <Route
              path="/resume-library"
              element={user ? <Navigate to="/" /> : <ResumeLibrary />}
            />
          </Routes>
        </BrowserRouter>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
