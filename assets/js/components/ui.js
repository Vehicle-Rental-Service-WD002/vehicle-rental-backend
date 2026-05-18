const DAY_MS = 1000 * 60 * 60 * 24;

export function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function formatCurrency(value = 0) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2
    }).format(Number(value || 0));
}

export function formatDate(value) {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

export function formatDateTime(value) {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(date);
}

export function normalizeRole(role = "") {
    return String(role || "").toLowerCase();
}

export function titleCase(value = "") {
    return String(value || "")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getUserLabel(user = {}) {
    return user?.name || user?.username || user?.email || "Unknown user";
}

export function getStatusTone(status = "") {
    const value = String(status || "").toUpperCase();
    if (value === "ACTIVE" || value === "PAID" || value === "AVAILABLE") return "success";
    if (value === "COMPLETED") return "info";
    if (value === "VOIDED" || value === "CANCELLED") return "danger";
    if (value === "PENDING" || value === "IN_PROGRESS") return "warning";
    return "neutral";
}

export function renderBadge(text, tone = "neutral") {
    return `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
}

export function renderSpinner(label = "Loading data...") {
    return `
        <div class="spinner-wrap" role="status" aria-live="polite">
            <div class="spinner" aria-hidden="true"></div>
            <span class="muted">${escapeHtml(label)}</span>
        </div>
    `;
}

export function renderSkeletonCards(count = 3) {
    return `
        <div class="skeleton-grid" aria-hidden="true">
            ${Array.from({ length: count }, () => `<div class="skeleton-card"></div>`).join("")}
        </div>
    `;
}

export function renderEmptyState({ title, description, actionLabel, actionId, icon = "◎" }) {
    const action = actionLabel && actionId
        ? `<button class="button" type="button" data-action="${escapeHtml(actionId)}">${escapeHtml(actionLabel)}</button>`
        : "";

    return `
        <div class="empty-state">
            <div class="empty-state-icon" aria-hidden="true">${escapeHtml(icon)}</div>
            <div>
                <h3 class="section-title">${escapeHtml(title)}</h3>
                <p>${escapeHtml(description)}</p>
            </div>
            ${action}
        </div>
    `;
}

export function renderAlert(message, tone = "info") {
    return `<div class="inline-alert ${tone}" role="alert">${escapeHtml(message)}</div>`;
}

export function renderMetricCard(label, value, helper = "") {
    return `
        <article class="metric-card">
            <span class="metric-label">${escapeHtml(label)}</span>
            <strong class="metric-value">${escapeHtml(value)}</strong>
            ${helper ? `<span class="muted">${escapeHtml(helper)}</span>` : ""}
        </article>
    `;
}

export function renderTable(columns, rows, emptyMessage = "No records to show right now.") {
    if (!rows.length) {
        return renderEmptyState({
            title: "Nothing to show yet",
            description: emptyMessage,
            icon: "⌁"
        });
    }

    return `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>${columns.map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`).join("")}</tr>
                </thead>
                <tbody>
                    ${rows.map((row) => `
                        <tr>
                            ${columns.map((column) => `<td>${column.render(row)}</td>`).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

export function daysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

    const difference = Math.round((end.getTime() - start.getTime()) / DAY_MS);
    return Math.max(0, difference);
}

export function rentalDurationDays(startDate, endDate) {
    return Math.max(1, daysBetween(startDate, endDate));
}

export function setElementHtml(target, html) {
    if (target) target.innerHTML = html;
}

export function showToast(message, tone = "info", title = "Notice") {
    const root = document.getElementById("toast-root");
    if (!root) return;

    const toast = document.createElement("div");
    toast.className = `toast ${tone}`;
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    root.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 3600);
}

export function printReceiptDocument(receipt) {
    if (!receipt) return false;

    const rentalId = receipt?.rental?.id || "—";
    const vehicleLabel = `${receipt?.rental?.vehicle?.brand || ""} ${receipt?.rental?.vehicle?.model || ""}`.trim() || "Vehicle";
    const receiptLabel = receipt.receiptNumber || `Receipt #${receipt.id || "—"}`;

    const markup = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(receiptLabel)}</title>
            <style>
                :root {
                    color-scheme: light;
                }
                * {
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    font-family: "Segoe UI", Arial, sans-serif;
                    background: #f5f7fb;
                    color: #111827;
                }
                .sheet {
                    width: min(100%, 820px);
                    margin: 0 auto;
                    padding: 48px 32px;
                }
                .receipt-card {
                    background: #ffffff;
                    border: 1px solid #dbe2ea;
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
                }
                .eyebrow {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 999px;
                    background: #fef3c7;
                    color: #92400e;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                h1 {
                    margin: 18px 0 8px;
                    font-size: 36px;
                    line-height: 1;
                }
                p {
                    margin: 0;
                    color: #475569;
                }
                .summary {
                    display: grid;
                    gap: 14px;
                    margin-top: 28px;
                }
                .row {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 20px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #edf2f7;
                }
                .row span {
                    color: #64748b;
                }
                .row strong {
                    text-align: right;
                }
                .total {
                    margin-top: 22px;
                    padding-top: 22px;
                    border-top: 2px solid #111827;
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 20px;
                    font-size: 20px;
                    font-weight: 800;
                }
                .footer {
                    margin-top: 32px;
                    color: #64748b;
                    font-size: 14px;
                }
                @media print {
                    body {
                        background: #ffffff;
                    }
                    .sheet {
                        width: 100%;
                        padding: 0;
                    }
                    .receipt-card {
                        border: 0;
                        border-radius: 0;
                        box-shadow: none;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <main class="sheet">
                <section class="receipt-card">
                    <span class="eyebrow">Vehicle Rental Receipt</span>
                    <h1>${escapeHtml(receiptLabel)}</h1>
                    <p>Prepared for rental #${escapeHtml(String(rentalId))} • ${escapeHtml(vehicleLabel)}</p>
                    <div class="summary">
                        <div class="row">
                            <span>Rental</span>
                            <strong>#${escapeHtml(String(rentalId))} • ${escapeHtml(vehicleLabel)}</strong>
                        </div>
                        <div class="row">
                            <span>Base cost</span>
                            <strong>${escapeHtml(formatCurrency(receipt.baseCost))}</strong>
                        </div>
                        <div class="row">
                            <span>Late fee</span>
                            <strong>${escapeHtml(formatCurrency(receipt.lateFee))}</strong>
                        </div>
                    </div>
                    <div class="total">
                        <span>Final total</span>
                        <strong>${escapeHtml(formatCurrency(receipt.finalTotal))}</strong>
                    </div>
                    <p class="footer">Generated by Velox Rentals.</p>
                </section>
            </main>
        </body>
        </html>
    `;

    const existingFrame = document.getElementById("receipt-print-frame");
    existingFrame?.remove();

    const frame = document.createElement("iframe");
    frame.id = "receipt-print-frame";
    frame.title = "Receipt print frame";
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    frame.style.border = "0";

    frame.onload = () => {
        const frameWindow = frame.contentWindow;
        if (!frameWindow) {
            frame.remove();
            return;
        }

        frameWindow.focus();
        window.setTimeout(() => {
            frameWindow.print();
            window.setTimeout(() => frame.remove(), 1000);
        }, 200);
    };

    document.body.appendChild(frame);
    const frameDocument = frame.contentDocument;
    if (!frameDocument) {
        frame.remove();
        return false;
    }

    frameDocument.open();
    frameDocument.write(markup);
    frameDocument.close();
    return true;
}

export function openModal({
    title,
    description = "",
    content = "",
    submitLabel = "Save",
    cancelLabel = "Cancel",
    wide = false,
    onSubmit
}) {
    const wrapper = document.createElement("div");
    wrapper.className = "modal-backdrop";

    wrapper.innerHTML = `
        <div class="modal-card ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <form novalidate>
                <div class="modal-head">
                    <div>
                        <h3 id="modal-title">${escapeHtml(title)}</h3>
                        ${description ? `<p class="muted">${escapeHtml(description)}</p>` : ""}
                    </div>
                    <button class="close-button" type="button" data-close-modal aria-label="Close dialog">×</button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-actions">
                    <button class="ghost-button" type="button" data-close-modal>${escapeHtml(cancelLabel)}</button>
                    <button class="button" type="submit">${escapeHtml(submitLabel)}</button>
                </div>
            </form>
        </div>
    `;

    const close = () => wrapper.remove();
    const form = wrapper.querySelector("form");

    wrapper.addEventListener("click", (event) => {
        if (event.target === wrapper || event.target.closest("[data-close-modal]")) {
            close();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!onSubmit) {
            close();
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        try {
            await onSubmit(new FormData(form), close, form);
        } finally {
            submitButton.disabled = false;
        }
    });

    document.body.appendChild(wrapper);
    const firstField = wrapper.querySelector("input, select, textarea, button");
    if (firstField) firstField.focus();

    return { close, element: wrapper };
}
