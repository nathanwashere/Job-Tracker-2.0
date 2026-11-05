import { useEffect, useState } from "react";

export const DEFAULT_COL_WIDTH = 268;
export const MIN_COL_WIDTH = 200;
export const MAX_COL_WIDTH = 520;

const STORAGE_KEY = "jt-pipeline-col-widths";

function clampWidth(width: number) {
  return Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, Math.round(width)));
}

// Read saved widths, ignoring anything that isn't a valid number
function loadWidths(): Record<string, number> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const widths: Record<string, number> = {};
    for (const [key, value] of Object.entries(saved ?? {})) {
      if (typeof value === "number" && Number.isFinite(value)) {
        widths[key] = clampWidth(value);
      }
    }
    return widths;
  } catch {
    return {};
  }
}

// Pipeline column widths, remembered across visits
export function useColumnWidths() {
  const [widths, setWidths] = useState(loadWidths);

  // Save once the user pauses, not on every pixel of a drag
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
      } catch {
        // Storage can be blocked (private mode): widths just won't be remembered
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [widths]);

  function widthOf(key: string) {
    return widths[key] ?? DEFAULT_COL_WIDTH;
  }

  function setWidth(key: string, width: number) {
    setWidths((prev) => ({ ...prev, [key]: clampWidth(width) }));
  }

  return { widthOf, setWidth };
}
