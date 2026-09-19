const html = document.documentElement;
const STORAGE_KEY = "theme";

function applyTheme(theme) {
    const dark = theme === "dark";

    html.classList.toggle("darkmode", dark);

    // Syntax highlighting
    const syntaxLink = document.getElementById("syntax-theme");
    if (syntaxLink) {
        syntaxLink.href = dark
            ? "/giallo-dark.css"
            : "/giallo-light.css";
    }
}

function toggleTheme() {
    const newTheme = html.classList.contains("darkmode")
        ? "light"
        : "dark";

    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
}

// Load saved theme
applyTheme(localStorage.getItem(STORAGE_KEY) || "light");

// Attach to every theme toggle on the page
document.querySelectorAll("#theme-toggle, #mobile-theme-toggle")
    .forEach(toggle => {
        toggle.addEventListener("click", toggleTheme);
    });
