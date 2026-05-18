const THEME_KEY = "velox.theme";

function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : null;
}

function getPreferredTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function getThemeLabel(theme) {
    return theme === "light" ? "Light" : "Dark";
}

export function getCurrentTheme() {
    return document.documentElement.dataset.theme || "dark";
}

export function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    syncThemeControls();
}

export function initTheme() {
    applyTheme(getStoredTheme() || getPreferredTheme());
}

export function toggleTheme() {
    applyTheme(getCurrentTheme() === "dark" ? "light" : "dark");
}

export function renderThemeToggle() {
    return `
        <button class="ghost-button theme-toggle" type="button" data-theme-toggle>
            Theme: <span data-theme-label>${getThemeLabel(getCurrentTheme())}</span>
        </button>
    `;
}

export function syncThemeControls() {
    const theme = getCurrentTheme();
    const label = getThemeLabel(theme);

    document.querySelectorAll("[data-theme-label]").forEach((element) => {
        element.textContent = label;
    });

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
        button.setAttribute("title", `Current theme: ${label}`);
    });
}

export function bindThemeControls(scope = document) {
    scope.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        if (button.dataset.themeBound === "true") {
            return;
        }

        button.dataset.themeBound = "true";
        button.addEventListener("click", toggleTheme);
    });

    syncThemeControls();
}
