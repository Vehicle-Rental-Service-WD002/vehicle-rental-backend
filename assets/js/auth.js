import { request } from "./api.js";
import { normalizeRole } from "./components/ui.js";

const AUTH_KEY = "velox.auth";
const USER_KEY = "user";
const TOKEN_KEY = "token";
const SUPPORTED_ROLES = new Set(["customer", "driver", "admin"]);

function readAuth() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

export function getAuthState() {
    return readAuth();
}

export function getCurrentUser() {
    return readAuth()?.user || null;
}

export function getToken() {
    return readAuth()?.token || "";
}

export function isAuthenticated() {
    return Boolean(getCurrentUser());
}

export function isSupportedRole(role) {
    return SUPPORTED_ROLES.has(normalizeRole(role));
}

export function saveAuthState(authState) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    localStorage.setItem(USER_KEY, JSON.stringify(authState.user || null));
    localStorage.setItem(TOKEN_KEY, authState.token || "");
}

export function clearAuthState() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

export function getDefaultRouteForRole(role) {
    const normalized = normalizeRole(role);
    if (normalized === "admin") return "/admin/dashboard";
    if (normalized === "driver") return "/driver/dashboard";
    if (normalized === "customer") return "/customer/dashboard";
    return "/login";
}

export async function login({ email, password }) {
    const response = await request("/auth/login", {
        method: "POST",
        body: { email, password }
    });

    const payload = response.data || {};
    const role = normalizeRole(payload.role);

    if (!isSupportedRole(role)) {
        throw new Error("This account does not have a supported workspace role yet.");
    }

    const authState = {
        token: payload.token || payload.accessToken || payload.jwt || payload.bearerToken || "",
        user: {
            id: payload.userId || payload.id || null,
            name: payload.name || payload.username || email,
            email,
            role
        }
    };

    saveAuthState(authState);
    return authState;
}
