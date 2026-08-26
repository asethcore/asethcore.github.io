const THEME_KEY = "vaeseth-theme";

function currentDark() {
  return document.documentElement.classList.contains("dark");
}

function applyTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);

  const link = document.getElementById("syntax-theme");
  if (link) {
    link.href = dark ? link.dataset.dark : link.dataset.light;
  }

  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch (e) {}
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const dark = saved
    ? saved === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".site-name");
  if (!toggle) return;

  toggle.style.cursor = "pointer";
  toggle.title = "toggle dark mode";

  toggle.addEventListener("click", () => {
    applyTheme(!currentDark());
  });
});

initTheme();
