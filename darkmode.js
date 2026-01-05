const html = document.documentElement;
const toggleItem = document.getElementById("theme-toggle");
const STORAGE_KEY = "theme"; // 'light' or 'dark'

function applyTheme(theme) {
  if (theme === "dark") {
    html.classList.add("darkmode");
    toggleItem.textContent = "lights out";
  } else {
    html.classList.remove("darkmode");
    toggleItem.textContent = "light";
  }
}

// read saved theme (or default to light)
const savedTheme = localStorage.getItem(STORAGE_KEY) || "light";
applyTheme(savedTheme);

toggleItem.addEventListener("click", () => {
  const newTheme = html.classList.contains("darkmode") ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, newTheme); // persist choice
  applyTheme(newTheme);
});
