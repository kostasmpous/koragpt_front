// src/context/ThemeContext.js
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// 'light' | 'dark' | 'system'
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("system"); // persisted choice

    // read saved preference
    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
        if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
    }, []);

    // apply to <html> and persist
    useEffect(() => {
        if (typeof window === "undefined") return;
        const root = document.documentElement;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const useDark = theme === "dark" || (theme === "system" && prefersDark);

        root.classList.toggle("dark", useDark);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // watch system changes only when theme === "system"
    useEffect(() => {
        if (theme !== "system" || typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => document.documentElement.classList.toggle("dark", mq.matches);
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, [theme]);

    const value = useMemo(() => {
        const isDark =
            typeof window !== "undefined" && document.documentElement.classList.contains("dark");
        return {
            theme,                // 'light' | 'dark' | 'system'
            setTheme,             // setTheme('light' | 'dark' | 'system')
            isDark,               // boolean, current applied mode
            toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")), // quick toggle
        };
    }, [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
