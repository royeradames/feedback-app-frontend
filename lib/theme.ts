export const themeKey = "royer-feedback-theme";
export type Theme = "system" | "light" | "dark";
const listeners = new Set<() => void>();
function parse(value: string | null): Theme {
  return value === "light" || value === "dark" ? value : "system";
}
export function readTheme(): Theme {
  try {
    return parse(localStorage.getItem(themeKey));
  } catch {
    return "system";
  }
}
export function writeTheme(value: string) {
  const theme = parse(value);
  try {
    if (theme === "system") localStorage.removeItem(themeKey);
    else localStorage.setItem(themeKey, theme);
  } catch {
    // Storage can be denied; the choice still applies for this page view.
  }
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}
export function subscribeTheme(listener: () => void) {
  function fromOtherTab(event: StorageEvent) {
    if (event.key !== themeKey && event.key !== null) return;
    document.documentElement.dataset.theme = readTheme();
    listener();
  }
  listeners.add(listener);
  window.addEventListener("storage", fromOtherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", fromOtherTab);
  };
}
// Runs in <head> before the body paints, so a saved theme never flashes.
export const themeScript = `(function(){var t="system";try{var v=localStorage.getItem(${JSON.stringify(
  themeKey,
)});if(v==="light"||v==="dark")t=v}catch(e){}document.documentElement.dataset.theme=t})()`;
