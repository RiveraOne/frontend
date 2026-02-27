"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: Theme = stored === "dark" || (!stored && systemPrefersDark) ? "dark" : "light";

    applyTheme(nextTheme);
    setTheme(nextTheme);
    setMounted(true);
  }, []);

  const onToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className="mw-btn-ghost"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {mounted && theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
