const API_BASE_URL = "http://localhost:8080/api";
const AUTH_KEY = "velox.auth";

function readToken() {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed?.token || "";
    } catch (error) {
        return "";
    }
}

function buildHeaders(headers = {}, body) {
    const nextHeaders = new Headers(headers);
    const token = readToken();

    if (body && !(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
        nextHeaders.set("Content-Type", "application/json");
    }

    if (token && !nextHeaders.has("Authorization")) {
        nextHeaders.set("Authorization", `Bearer ${token}`);
    }

    return nextHeaders;
}

function normalizeEnvelope(response, payload) {
    if (payload && typeof payload === "object" && "success" in payload && "message" in payload) {
        return payload;
    }

    return {
        success: response.ok,
        message: response.ok ? "Request completed successfully" : "Request failed",
        data: payload
    };
}

export async function request(path, options = {}) {
    const {
        method = "GET",
        headers,
        body,
        fallbackData
    } = options;

    try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: buildHeaders(headers, body),
            body: body
                ? body instanceof FormData
                    ? body
                    : JSON.stringify(body)
                : undefined
        });

        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
            ? await response.json()
            : null;
        const envelope = normalizeEnvelope(response, payload);

        if (!response.ok || envelope.success === false) {
            const httpError = new Error(envelope.message || "Request failed");
            httpError.isHttpError = true;
            httpError.status = response.status;
            httpError.payload = envelope;
            throw httpError;
        }

        return envelope;
    } catch (error) {
        if (fallbackData !== undefined && !error?.isHttpError) {
            return {
                success: false,
                fallback: true,
                message: error.message || "API unavailable. Showing fallback data.",
                data: fallbackData
            };
        }

        throw error;
    }
}

export const api = {
    get(path, options = {}) {
        return request(path, { ...options, method: "GET" });
    },
    post(path, body, options = {}) {
        return request(path, { ...options, method: "POST", body });
    },
    put(path, body, options = {}) {
        return request(path, { ...options, method: "PUT", body });
    },
    delete(path, options = {}) {
        return request(path, { ...options, method: "DELETE" });
    }
};

export { API_BASE_URL };
