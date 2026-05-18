import { login } from "../auth.js";
import { renderAlert, showToast } from "../components/ui.js";

const REMEMBERED_EMAIL_KEY = "velox.rememberedEmail";
const REDIRECT_DELAY_MS = 1000;
const ERROR_DISMISS_MS = 5000;

function renderIcon(name) {
    if (name === "mail") {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 6.75h16A1.25 1.25 0 0 1 21.25 8v8A1.25 1.25 0 0 1 20 17.25H4A1.25 1.25 0 0 1 2.75 16V8A1.25 1.25 0 0 1 4 6.75Zm0 1.5-.1.01L12 13.45l8.1-5.2H4Zm15.75 7.34V9.61l-7.35 4.72a.75.75 0 0 1-.8 0L4.25 9.61v5.98c0 .08.02.12.03.14.02.01.06.02.12.02H19.6c.06 0 .1-.01.12-.02.01-.02.03-.06.03-.14Z"/>
            </svg>
        `;
    }

    if (name === "lock") {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 2.75a4.75 4.75 0 0 1 4.75 4.75v2h.75A2.5 2.5 0 0 1 20 12v6.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5V12a2.5 2.5 0 0 1 2.5-2.5h.75v-2A4.75 4.75 0 0 1 12 2.75Zm5.5 8.25h-11A1 1 0 0 0 5.5 12v6.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V12a1 1 0 0 0-1-1ZM12 4.25A3.25 3.25 0 0 0 8.75 7.5v2h6.5v-2A3.25 3.25 0 0 0 12 4.25Z"/>
            </svg>
        `;
    }

    if (name === "eye") {
        return `
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 5c5.42 0 9.3 4.78 10.76 6.85a.75.75 0 0 1 0 .87C21.3 14.8 17.42 19.5 12 19.5S2.7 14.8 1.24 12.72a.75.75 0 0 1 0-.87C2.7 9.78 6.58 5 12 5Zm0 1.5c-4.34 0-7.65 3.67-9.2 5.78C4.35 14.4 7.66 18 12 18s7.65-3.6 9.2-5.72C19.65 10.17 16.34 6.5 12 6.5Zm0 2.25A3.75 3.75 0 1 1 8.25 12 3.75 3.75 0 0 1 12 8.75Zm0 1.5A2.25 2.25 0 1 0 14.25 12 2.25 2.25 0 0 0 12 10.25Z"/>
            </svg>
        `;
    }

    return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m4.53 4.53 14.94 14.94-1.06 1.06-3.17-3.17A11.44 11.44 0 0 1 12 19.5c-5.42 0-9.3-4.7-10.76-6.78a.75.75 0 0 1 0-.87A20.6 20.6 0 0 1 6.1 7.08L3.47 4.47l1.06-1.06Zm8.86 11.98-1.08-1.08A3.75 3.75 0 0 1 8.57 11.7l-1.2-1.2A5.25 5.25 0 0 0 12 17.25c.48 0 .95-.07 1.39-.2Zm7.37-4.23a18.96 18.96 0 0 0-4.21-4.07l-1.08 1.08a16.9 16.9 0 0 1 3.73 3.43c-1.09 1.49-2.77 3.3-4.92 4.47l1.1 1.1c3.31-1.73 5.72-4.98 6.38-5.93a.75.75 0 0 0 0-.87Zm-8.5-5.53c1.84.1 3.06.92 3.86 1.58l1.08-1.08A8.85 8.85 0 0 0 12 5a9.5 9.5 0 0 0-2.08.23l1.34 1.34Zm1.48 4.66a2.25 2.25 0 0 0-3.15-3.15l3.15 3.15Z"/>
        </svg>
    `;
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function normalizeRedirectPath(role) {
    const normalizedRole = String(role || "").toLowerCase();
    if (normalizedRole === "customer") return "/customer/dashboard";
    if (normalizedRole === "driver") return "/driver/dashboard";
    if (normalizedRole === "admin") return "/admin/dashboard";
    return "/login";
}

function redirectByRole(role) {
    window.location.hash = `#${normalizeRedirectPath(role)}`;
}

function storeUserData(authState) {
    localStorage.setItem("user", JSON.stringify(authState.user || null));
    localStorage.setItem("token", authState.token || "");
    localStorage.setItem("velox.auth", JSON.stringify(authState));
}

function getRememberedEmail() {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
}

function rememberEmail(email, shouldRemember) {
    if (shouldRemember && email) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        return;
    }

    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
}

function togglePasswordVisibility(passwordInput, toggleButton) {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleButton.innerHTML = isHidden ? renderIcon("eye-off") : renderIcon("eye");
    toggleButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    toggleButton.dataset.visible = isHidden ? "true" : "false";
}

function mapLoginError(error) {
    if (!error) return "Unable to sign in right now.";

    if (error.status === 400 || error.status === 401) {
        return "Invalid email or password";
    }

    if (error.status === 404) {
        return "Account not found";
    }

    if (error.status >= 500) {
        return "Server error. Please try again.";
    }

    if (!error.isHttpError) {
        return "Connection failed. Check internet.";
    }

    return error.message || error.payload?.message || "Unable to sign in right now.";
}

function clearValidation(form) {
    form.querySelectorAll(".field-shell.invalid").forEach((element) => {
        element.classList.remove("invalid");
    });
}

function markInvalidField(input) {
    input.closest(".field-shell")?.classList.add("invalid");
}

function showMessage(container, message, tone) {
    container.innerHTML = renderAlert(message, tone);
}

function clearMessage(container) {
    container.innerHTML = "";
}

async function apiLogin(email, password) {
    return login({ email, password });
}

export function createLoginPage() {
    return {
        title: "Login",
        content: `
            <section class="auth-login-layout">
                <aside class="auth-media-panel" aria-hidden="true">
                    <div class="auth-media-video">
                        <div class="auth-media-gradient"></div>
                        <div class="auth-media-grid"></div>
                        <div class="auth-media-road"></div>
                        <div class="auth-media-car-glow"></div>
                        <div class="auth-media-car">
                            <span class="auth-media-wheel wheel-back"></span>
                            <span class="auth-media-wheel wheel-front"></span>
                        </div>
                    </div>

                    <div class="auth-media-copy">
                        <div class="auth-media-brand">Vehicle Rental System</div>
                        <h1>Rent-a-vroom!</h1>
                        <p>The road is yours.</p>
                        <div class="auth-badge-row">
                            <span class="auth-badge">24/7 Support</span>
                            <span class="auth-badge">Verified Fleet</span>
                            <span class="auth-badge">Secure Payment</span>
                        </div>
                    </div>
                </aside>

                <main class="auth-form-stage">
                    <section class="login-glass-card login-enter">
                        <div class="login-brand-mark" aria-hidden="true">V</div>

                        <header class="login-copy">
                            <h2>Welcome Back</h2>
                            <p>Sign in to continue</p>
                        </header>

                        <div id="login-feedback" class="login-feedback" aria-live="polite"></div>

                        <form id="login-form" class="login-form" novalidate>
                            <div class="field-group">
                                <label for="email">Email Address</label>
                                <div class="field-shell login-field-shell">
                                    <span class="field-icon">${renderIcon("mail")}</span>
                                    <input
                                        class="field-ref"
                                        id="email"
                                        name="email"
                                        type="email"
                                        autocomplete="email"
                                        placeholder="Email address"
                                        required
                                        aria-describedby="login-feedback"
                                    >
                                </div>
                            </div>

                            <div class="field-group">
                                <div class="field-label-row">
                                    <label for="password">Password</label>
                                    <a class="subtle-link" href="mailto:support@velox.rentals?subject=Reset%20password">Forgot password?</a>
                                </div>
                                <div class="field-shell login-field-shell">
                                    <span class="field-icon">${renderIcon("lock")}</span>
                                    <input
                                        class="field-ref"
                                        id="password"
                                        name="password"
                                        type="password"
                                        autocomplete="current-password"
                                        placeholder="Password"
                                        required
                                        aria-describedby="login-feedback"
                                    >
                                    <button class="password-toggle" type="button" data-password-toggle aria-label="Show password">
                                        ${renderIcon("eye")}
                                    </button>
                                </div>
                            </div>

                            <div class="login-meta-row">
                                <label class="remember-toggle" for="remember-email">
                                    <input id="remember-email" name="rememberEmail" type="checkbox">
                                    <span>Remember me</span>
                                </label>
                            </div>

                            <button class="button button-login button-block" type="submit" id="login-submit">
                                <span class="button-label">Sign In</span>
                                <span class="button-spinner" aria-hidden="true"></span>
                            </button>
                        </form>

                        <div class="login-links">
                            <a class="subtle-link" href="mailto:support@velox.rentals?subject=Create%20account">New customer? Create an account</a>
                            <a class="subtle-link" href="mailto:support@velox.rentals?subject=Support%20request">Contact support</a>
                        </div>

                        <section class="demo-credentials" aria-label="Demo credentials">
                            <strong>Demo credentials</strong>
                            <div class="demo-credentials-grid">
                                <div><span>Customer</span><code>john@customer.com / password123</code></div>
                                <div><span>Driver</span><code>mike@driver.com / password123</code></div>
                                <div><span>Admin</span><code>admin@admin.com / password123</code></div>
                            </div>
                        </section>
                    </section>
                </main>
            </section>
        `,
        async afterRender() {
            const form = document.getElementById("login-form");
            const feedback = document.getElementById("login-feedback");
            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");
            const rememberInput = document.getElementById("remember-email");
            const submitButton = document.getElementById("login-submit");
            const passwordToggle = form?.querySelector("[data-password-toggle]");

            if (!form || !feedback || !emailInput || !passwordInput || !rememberInput || !submitButton || !passwordToggle) {
                return;
            }

            const rememberedEmail = getRememberedEmail();
            if (rememberedEmail) {
                emailInput.value = rememberedEmail;
                rememberInput.checked = true;
            }

            let dismissTimer = 0;

            const clearFeedback = () => {
                window.clearTimeout(dismissTimer);
                clearMessage(feedback);
                form.classList.remove("login-error-shake");
            };

            const showError = (message) => {
                clearFeedback();
                showMessage(feedback, message, "error");
                form.classList.remove("login-error-shake");
                void form.offsetWidth;
                form.classList.add("login-error-shake");
                dismissTimer = window.setTimeout(clearFeedback, ERROR_DISMISS_MS);
            };

            const showSuccess = (message, name) => {
                clearFeedback();
                showMessage(feedback, message, "success");
                showToast(`Welcome back, ${name}!`, "success", "Signed in");
            };

            const setLoading = (isLoading) => {
                submitButton.disabled = isLoading;
                form.classList.toggle("is-loading", isLoading);
                submitButton.classList.toggle("is-loading", isLoading);
                submitButton.setAttribute("aria-busy", String(isLoading));
                submitButton.querySelector(".button-label").textContent = isLoading ? "Signing in..." : "Sign In";
            };

            const runValidation = () => {
                clearValidation(form);

                const email = emailInput.value.trim();
                const password = passwordInput.value;

                if (!validateEmail(email)) {
                    markInvalidField(emailInput);
                    showError("Please enter a valid email address.");
                    emailInput.focus();
                    return null;
                }

                if (!password) {
                    markInvalidField(passwordInput);
                    showError("Password is required.");
                    passwordInput.focus();
                    return null;
                }

                clearFeedback();
                return { email, password };
            };

            passwordToggle.addEventListener("click", () => {
                togglePasswordVisibility(passwordInput, passwordToggle);
            });

            form.addEventListener("input", (event) => {
                const fieldShell = event.target.closest(".field-shell");
                if (fieldShell) {
                    fieldShell.classList.remove("invalid");
                }
                clearFeedback();
            });

            form.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    clearFeedback();
                }
            });

            form.addEventListener("submit", async (event) => {
                event.preventDefault();

                const values = runValidation();
                if (!values) {
                    return;
                }

                setLoading(true);

                try {
                    const authState = await apiLogin(values.email, values.password);
                    storeUserData(authState);
                    rememberEmail(values.email, rememberInput.checked);
                    showSuccess(`Authentication completed successfully. Redirecting to your workspace...`, authState.user.name || authState.user.email || "User");

                    window.setTimeout(() => {
                        redirectByRole(authState.user.role);
                    }, REDIRECT_DELAY_MS);
                } catch (error) {
                    showError(mapLoginError(error));
                } finally {
                    setLoading(false);
                }
            });
        }
    };
}
