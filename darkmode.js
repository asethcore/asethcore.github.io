const html = document.documentElement;
const STORAGE_KEY = "theme";

function applyTheme(theme) {
    const dark = theme === "dark" || theme === "crt";
    const crt = theme === "crt";

    // Apply theme classes
    html.classList.toggle("darkmode", dark);
    html.classList.toggle("crt-mode", crt);

    // Desktop toggle text
    const desktopToggle = document.getElementById("theme-toggle");

    if (desktopToggle) {
        if (theme === "light") {
            desktopToggle.textContent = "lights out";
        } else if (theme === "dark") {
            desktopToggle.textContent = "crt mode";
        } else {
            desktopToggle.textContent = "lights in";
        }
    }

    // Syntax highlighting
    const syntaxLink = document.getElementById("syntax-theme");

    if (syntaxLink) {
        syntaxLink.href =
            theme === "light"
                ? "/giallo-light.css"
                : "/giallo-dark.css";
    }
}

function toggleTheme() {
    let currentTheme = localStorage.getItem(STORAGE_KEY) || "light";
    let newTheme;

    if (currentTheme === "light") {
        newTheme = "dark";
    } else if (currentTheme === "dark") {
        newTheme = "crt";
    } else {
        newTheme = "light";
    }

    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
}

// Load saved theme
applyTheme(localStorage.getItem(STORAGE_KEY) || "light");

// Attach to every theme toggle
document
    .querySelectorAll("#theme-toggle, #mobile-theme-toggle")
    .forEach(toggle => {
        toggle.addEventListener("click", toggleTheme);
    });
