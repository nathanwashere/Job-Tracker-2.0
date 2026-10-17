import { useState, createContext, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "./pages/LandingPage.tsx";
import LandingPage from "./pages/LandingPage.tsx";
import SignIn from "./pages/SignIn.tsx";
import Signup from "./pages/SignUp.tsx";
import HomePage from "./pages/HomePage.tsx";

type ThemeContextValue = {
  darkMode: boolean;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleTheme: () => {},
});

function App() {
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

  return (
    <>
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="sign-up" element={<Signup />} />
            <Route path="/homepage" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ThemeContext.Provider>
    </>
  );
}

export default App;
