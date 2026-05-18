import { clearAuthState, getCurrentUser, getDefaultRouteForRole, isAuthenticated, isSupportedRole } from "./auth.js";
import { initShell, renderAuthShell, renderShell } from "./components/layout.js";
import { bindThemeControls } from "./components/theme.js";
import { renderAlert, renderSpinner, showToast } from "./components/ui.js";
import { createAdminFinancePage } from "./pages/adminFinance.js";
import { createAdminRentalsPage } from "./pages/adminRentals.js";
import { createAdminReviewsPage } from "./pages/adminReviews.js";
import { createAdminUsersPage } from "./pages/adminUsers.js";
import { createAdminVehiclesPage } from "./pages/adminVehicles.js";
import { createCustomerBookRentalPage } from "./pages/customerBookRental.js";
import { createCustomerReceiptsPage } from "./pages/customerReceipts.js";
import { createCustomerRentalsPage } from "./pages/customerRentals.js";
import { createCustomerReviewsPage } from "./pages/customerReviews.js";
import { createCustomerVehiclesPage } from "./pages/customerVehicles.js";
import { createDriverAssignedRentalsPage } from "./pages/driverAssignedRentals.js";
import { createLoginPage } from "./pages/login.js";

const routes = [
    { path: "/login", roles: [], createPage: createLoginPage },
    { path: "/customer/dashboard", roles: ["customer"], createPage: createCustomerVehiclesPage },
    { path: "/customer/vehicles", roles: ["customer"], createPage: createCustomerVehiclesPage },
    { path: "/customer/book", roles: ["customer"], createPage: createCustomerBookRentalPage },
    { path: "/customer/rentals", roles: ["customer"], createPage: createCustomerRentalsPage },
    { path: "/customer/receipts", roles: ["customer"], createPage: createCustomerReceiptsPage },
    { path: "/customer/reviews", roles: ["customer"], createPage: createCustomerReviewsPage },
    { path: "/driver/dashboard", roles: ["driver"], createPage: createDriverAssignedRentalsPage },
    { path: "/driver/rentals", roles: ["driver"], createPage: createDriverAssignedRentalsPage },
    { path: "/admin/dashboard", roles: ["admin"], createPage: createAdminVehiclesPage },
    { path: "/admin/vehicles", roles: ["admin"], createPage: createAdminVehiclesPage },
    { path: "/admin/users", roles: ["admin"], createPage: createAdminUsersPage },
    { path: "/admin/rentals", roles: ["admin"], createPage: createAdminRentalsPage },
    { path: "/admin/finance", roles: ["admin"], createPage: createAdminFinancePage },
    { path: "/admin/reviews", roles: ["admin"], createPage: createAdminReviewsPage }
];

let appRoot;

function parseLocation() {
    const hash = window.location.hash.replace(/^#/, "") || "/";
    const [path, queryString = ""] = hash.split("?");
    const query = Object.fromEntries(new URLSearchParams(queryString));
    return { path, query };
}

function findRoute(path) {
    return routes.find((route) => route.path === path) || null;
}

function redirect(path) {
    window.location.hash = `#${path}`;
}

async function renderRoute() {
    const user = getCurrentUser();
    const location = parseLocation();

    if (user && !isSupportedRole(user.role)) {
        clearAuthState();
        redirect("/login");
        return;
    }

    if (location.path === "/" || !location.path) {
        redirect(user ? getDefaultRouteForRole(user.role) : "/login");
        return;
    }

    const route = findRoute(location.path);
    if (!route) {
        redirect(user ? getDefaultRouteForRole(user.role) : "/login");
        return;
    }

    if (!route.roles.length) {
        if (isAuthenticated()) {
            redirect(getDefaultRouteForRole(user.role));
            return;
        }

        const page = route.createPage({ route, user: null, query: location.query });
        appRoot.innerHTML = renderAuthShell(page.content);
        bindThemeControls(appRoot);
        await page.afterRender?.({ route, user: null, query: location.query });
        return;
    }

    if (!user) {
        redirect("/login");
        return;
    }

    if (!route.roles.includes(user.role)) {
        redirect(getDefaultRouteForRole(user.role));
        return;
    }

    const page = route.createPage({ route, user, query: location.query });
    appRoot.innerHTML = renderShell({ user, route, page });
    initShell();
    bindThemeControls(appRoot);

    try {
        await page.afterRender?.({ route, user, query: location.query });
    } catch (error) {
        const container = document.getElementById("page-content");
        if (container) {
            container.innerHTML = renderAlert(error.message || "Something went wrong while loading the page.", "error");
        }
        showToast(error.message || "Something went wrong while loading the page.", "error", "Load failed");
    }
}

export function navigate(path) {
    if (window.location.hash === `#${path}`) {
        renderRoute();
        return;
    }
    redirect(path);
}

export function initRouter(root) {
    appRoot = root;
    appRoot.innerHTML = renderSpinner("Preparing workspace...");
    window.addEventListener("hashchange", renderRoute);
    renderRoute();
}
