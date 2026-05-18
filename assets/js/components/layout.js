import { clearAuthState, getDefaultRouteForRole } from "../auth.js";
import { renderThemeToggle } from "./theme.js";
import { escapeHtml, normalizeRole, renderBadge, titleCase } from "./ui.js";

const NAVIGATION = {
    customer: [
        { path: "/customer/vehicles", label: "Explore Fleet", icon: "FL" },
        { path: "/customer/book", label: "Reserve Ride", icon: "RS" },
        { path: "/customer/rentals", label: "My Rentals", icon: "MR" },
        { path: "/customer/receipts", label: "Receipts", icon: "RC" },
        { path: "/customer/reviews", label: "Reviews", icon: "RV" }
    ],
    driver: [
        { path: "/driver/rentals", label: "Assigned Trips", icon: "TR" }
    ],
    admin: [
        { path: "/admin/vehicles", label: "Fleet Control", icon: "FC" },
        { path: "/admin/users", label: "User Access", icon: "UA" },
        { path: "/admin/rentals", label: "Rental Ops", icon: "RO" },
        { path: "/admin/finance", label: "Finance Desk", icon: "FD" },
        { path: "/admin/reviews", label: "Reviews", icon: "RV" }
    ]
};

function renderNavItems(role, currentPath) {
    return (NAVIGATION[role] || []).map((item) => `
        <li>
            <a class="nav-link ${currentPath.startsWith(item.path) ? "active" : ""}" href="#${item.path}">
                <span class="nav-icon" aria-hidden="true">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        </li>
    `).join("");
}

export function renderShell({ user, route, page }) {
    const role = normalizeRole(user?.role);
    const navItems = renderNavItems(role, route.path);
    const roleLabel = titleCase(role);
    const pageActions = page.actions || "";

    return `
        <div class="app-shell">
            <aside class="sidebar">
                <div class="brand">
                    <div class="brand-mark">V</div>
                    <div class="brand-copy">
                        <strong>Velox Rentals</strong>
                        <span>Mobility command center</span>
                    </div>
                </div>

                <div class="user-card">
                    <strong>${escapeHtml(user?.name || user?.email || "Velox User")}</strong>
                    <p>${escapeHtml(user?.email || "Signed in")}</p>
                    ${renderBadge(roleLabel, "warning")}
                </div>

                <div class="sidebar-section-label">Workspace</div>
                <ul class="nav-list">${navItems}</ul>
            </aside>

            <main class="shell-main">
                <div class="topbar-mobile">
                        <div class="brand">
                            <div class="brand-mark">V</div>
                            <div class="brand-copy">
                                <strong>Velox Rentals</strong>
                                <span>${escapeHtml(roleLabel)} workspace</span>
                            </div>
                        </div>
                    <div class="topbar-actions">
                        ${renderThemeToggle()}
                        <button class="icon-button" type="button" data-menu-toggle aria-label="Open navigation">Menu</button>
                    </div>
                </div>

                <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
                    <div class="button-row">
                        <button class="close-button" type="button" data-menu-toggle aria-label="Close navigation">X</button>
                    </div>
                    <div class="user-card">
                        <strong>${escapeHtml(user?.name || user?.email || "Velox User")}</strong>
                        <p>${escapeHtml(user?.email || "Signed in")}</p>
                        ${renderBadge(roleLabel, "warning")}
                    </div>
                    <ul class="nav-list">${navItems}</ul>
                </nav>

                <div class="topbar glass-card">
                    <div class="topbar-copy">
                        <span class="eyebrow">Account-aware access</span>
                        <strong class="workspace-title">${escapeHtml(roleLabel)} permissions are active</strong>
                        <div class="page-subtitle">Route: ${escapeHtml(route.path)}</div>
                    </div>
                    <div class="topbar-actions">
                        ${renderThemeToggle()}
                        <a class="ghost-button" href="#${getDefaultRouteForRole(role)}">Workspace Home</a>
                        <button class="danger-button" type="button" data-logout>Logout</button>
                    </div>
                </div>

                <section class="page-header">
                    <div>
                        <h1 class="page-title">${escapeHtml(page.title)}</h1>
                        ${page.subtitle ? `<p class="page-subtitle">${escapeHtml(page.subtitle)}</p>` : ""}
                    </div>
                    ${pageActions}
                </section>

                <section id="page-content">${page.content}</section>
            </main>
        </div>
    `;
}

export function renderAuthShell(content) {
    return `
        <div class="auth-shell">
            ${content}
        </div>
    `;
}

export function initShell() {
    const mobileNav = document.getElementById("mobile-nav");

    document.querySelectorAll("[data-menu-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            mobileNav?.classList.toggle("open");
        });
    });

    document.querySelectorAll("[data-logout]").forEach((button) => {
        button.addEventListener("click", () => {
            clearAuthState();
            window.location.hash = "#/login";
        });
    });
}
