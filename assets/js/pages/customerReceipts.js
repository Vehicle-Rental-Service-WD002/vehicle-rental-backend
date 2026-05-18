import { api } from "../api.js";
import { cloneFallback, fallbackReceipts, fallbackRentals } from "../demo-data.js";
import { readStorage, upsertStoredRecord } from "../components/storage.js";
import {
    escapeHtml,
    formatCurrency,
    formatDate,
    getStatusTone,
    printReceiptDocument,
    renderAlert,
    renderBadge,
    renderEmptyState,
    renderMetricCard,
    renderSpinner,
    setElementHtml,
    showToast,
    titleCase
} from "../components/ui.js";

const RECEIPTS_KEY = "velox.receipts";

function receiptIsVoided(receipt) {
    return Boolean(receipt?.isVoided || receipt?.voided);
}

function renderReceiptSummary(receipt) {
    return `
        <div class="booking-summary">
            <div class="summary-row">
                <div>
                    <span class="muted">Receipt number</span>
                    <strong>${escapeHtml(receipt.receiptNumber || `Receipt #${receipt.id}`)}</strong>
                </div>
                ${renderBadge(titleCase(receiptIsVoided(receipt) ? "VOIDED" : "ACTIVE"), receiptIsVoided(receipt) ? "danger" : "success")}
            </div>
            <div class="summary-stack">
                <div class="summary-row">
                    <span class="muted">Rental</span>
                    <strong>#${receipt.rental?.id || "—"} • ${escapeHtml(`${receipt.rental?.vehicle?.brand || ""} ${receipt.rental?.vehicle?.model || ""}`.trim() || "Vehicle")}</strong>
                </div>
                <div class="summary-row">
                    <span class="muted">Base cost</span>
                    <strong>${formatCurrency(receipt.baseCost)}</strong>
                </div>
                <div class="summary-row">
                    <span class="muted">Late fee</span>
                    <strong>${formatCurrency(receipt.lateFee)}</strong>
                </div>
                <div class="summary-row">
                    <span class="muted">Final total</span>
                    <strong>${formatCurrency(receipt.finalTotal)}</strong>
                </div>
            </div>
            <div class="button-row receipt-action-row">
                <button class="button" type="button" data-print-receipt="${receipt.id}">Print receipt</button>
            </div>
        </div>
    `;
}

function renderRentalReceiptCards(rentals, receipts) {
    const receiptByRentalId = new Map(receipts.map((receipt) => [Number(receipt?.rental?.id), receipt]));

    if (!rentals.length) {
        return renderEmptyState({
            title: "No completed rentals yet",
            description: "Receipts become relevant once your reservations move into a completed state.",
            icon: "◌"
        });
    }

    return `
        <div class="receipt-list">
            ${rentals.map((rental) => {
                const receipt = receiptByRentalId.get(Number(rental.id));
                return `
                    <article class="list-card">
                        <div class="summary-row">
                            <div>
                                <h3 class="section-title">Rental #${rental.id}</h3>
                                <span class="muted">${escapeHtml(`${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.trim())}</span>
                            </div>
                            ${renderBadge(titleCase(rental.status || "completed"), getStatusTone(rental.status))}
                        </div>
                        <div class="summary-stack">
                            <div class="summary-row">
                                <span class="muted">Trip dates</span>
                                <strong>${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}</strong>
                            </div>
                            <div class="summary-row">
                                <span class="muted">Rental total</span>
                                <strong>${formatCurrency(rental.totalCost)}</strong>
                            </div>
                            <div class="summary-row">
                                <span class="muted">Receipt status</span>
                                <strong>${receipt ? escapeHtml(receipt.receiptNumber || `Generated #${receipt.id}`) : "Not generated yet"}</strong>
                            </div>
                        </div>
                        <div class="button-row">
                            <button class="button" type="button" data-generate-receipt="${rental.id}">Generate receipt</button>
                            ${receipt ? `<button class="ghost-button" type="button" data-view-receipt="${receipt.id}">View receipt</button>` : ""}
                            ${receipt ? `<button class="ghost-button" type="button" data-print-receipt="${receipt.id}">Print receipt</button>` : ""}
                        </div>
                    </article>
                `;
            }).join("")}
        </div>
    `;
}

export function createCustomerReceiptsPage({ user }) {
    return {
        title: "Receipts",
        subtitle: "Generate, inspect, and print billing records tied to your completed rentals.",
        content: `
            <div id="receipts-feedback"></div>
            <div class="stats-grid" id="receipt-stats">
                ${renderMetricCard("Completed rentals", "—")}
                ${renderMetricCard("Cached receipts", "—")}
                ${renderMetricCard("Final billed total", "—")}
            </div>

            <div class="split-grid" style="margin-top: 1rem;">
                <article class="content-card">
                    <div id="receipt-list">${renderSpinner("Loading receipt workspace...")}</div>
                </article>

                <article class="glass-card booking-summary receipt-panel-card">
                    <div>
                        <span class="eyebrow">Receipt details</span>
                        <h2 class="section-title" style="margin-top: 1rem;">Lookup or inspect a receipt</h2>
                    </div>
                    <form id="receipt-lookup-form" class="stack receipt-lookup-form">
                        <div class="field-group">
                            <label for="receiptId">Receipt ID</label>
                            <input class="field" id="receiptId" name="receiptId" type="number" min="1" placeholder="Enter a receipt ID">
                        </div>
                        <button class="ghost-button" type="submit">Lookup receipt</button>
                    </form>
                    <div id="receipt-detail-panel">
                        ${renderAlert("Generate a receipt from a completed rental or look one up by ID.", "info")}
                    </div>
                </article>
            </div>
        `,
        async afterRender() {
            const feedback = document.getElementById("receipts-feedback");
            const stats = document.getElementById("receipt-stats");
            const list = document.getElementById("receipt-list");
            const detailPanel = document.getElementById("receipt-detail-panel");
            const lookupForm = document.getElementById("receipt-lookup-form");

            const rentalsResponse = await api.get("/rentals", {
                fallbackData: cloneFallback(fallbackRentals)
            });

            let rentals = Array.isArray(rentalsResponse.data) ? rentalsResponse.data : [];
            rentals = rentals.filter((rental) => {
                const belongsToCustomer = Number(rental?.customer?.id) === Number(user?.id);
                const isCompleted = String(rental.status || "").toUpperCase() === "COMPLETED";
                return belongsToCustomer && isCompleted;
            });

            if (!rentals.length && rentalsResponse.fallback) {
                rentals = cloneFallback(fallbackRentals).filter((rental) => String(rental.status || "").toUpperCase() === "COMPLETED");
            }

            let receipts = readStorage(RECEIPTS_KEY, []);

            if (rentalsResponse.fallback && !receipts.length) {
                receipts = cloneFallback(fallbackReceipts);
            }

            if (rentalsResponse.fallback) {
                feedback.innerHTML = renderAlert("The receipts page is in demo mode because the rentals API could not be reached.", "warning");
                showToast(rentalsResponse.message, "warning", "Demo mode");
            }

            function syncStats() {
                const receiptTotal = receipts.reduce((sum, receipt) => sum + Number(receipt.finalTotal || 0), 0);
                stats.innerHTML = `
                    ${renderMetricCard("Completed rentals", String(rentals.length))}
                    ${renderMetricCard("Cached receipts", String(receipts.length))}
                    ${renderMetricCard("Final billed total", formatCurrency(receiptTotal))}
                `;
            }

            function renderWorkspace() {
                setElementHtml(list, renderRentalReceiptCards(rentals, receipts));
                syncStats();
            }

            async function fetchReceipt(receiptId) {
                if (!receiptId) return null;

                const cachedReceipt = receipts.find((receipt) => Number(receipt.id) === Number(receiptId));
                if (cachedReceipt) {
                    return cachedReceipt;
                }

                const response = await api.get(`/receipts/${receiptId}`, {
                    fallbackData: cloneFallback(fallbackReceipts[0])
                });

                const receipt = response.data;
                receipts = upsertStoredRecord(RECEIPTS_KEY, receipt);
                renderWorkspace();
                return receipt;
            }

            async function showReceiptById(receiptId) {
                if (!receiptId) return;
                detailPanel.innerHTML = renderSpinner("Fetching receipt details...");

                try {
                    const receipt = await fetchReceipt(receiptId);
                    detailPanel.innerHTML = receipt ? renderReceiptSummary(receipt) : renderAlert("Receipt not found.", "error");
                } catch (error) {
                    detailPanel.innerHTML = renderAlert(error.message || "Receipt lookup failed.", "error");
                }
            }

            async function printReceiptById(receiptId) {
                try {
                    const receipt = await fetchReceipt(receiptId);
                    if (!receipt) {
                        showToast("Receipt not found for printing.", "error", "Print failed");
                        return;
                    }

                    const didOpen = printReceiptDocument(receipt);
                    if (!didOpen) {
                        showToast("Allow pop-ups to print this receipt.", "warning", "Print blocked");
                    }
                } catch (error) {
                    showToast(error.message || "Unable to print this receipt.", "error", "Print failed");
                }
            }

            list.addEventListener("click", async (event) => {
                const generateButton = event.target.closest("[data-generate-receipt]");
                const viewButton = event.target.closest("[data-view-receipt]");
                const printButton = event.target.closest("[data-print-receipt]");

                if (generateButton) {
                    const rentalId = generateButton.dataset.generateReceipt;
                    generateButton.disabled = true;
                    detailPanel.innerHTML = renderSpinner("Generating receipt...");

                    try {
                        const response = await api.post(`/receipts/generate/${rentalId}`);
                        receipts = upsertStoredRecord(RECEIPTS_KEY, response.data);
                        detailPanel.innerHTML = renderReceiptSummary(response.data);
                        renderWorkspace();
                        showToast("Receipt generated successfully.", "success", "Receipt ready");
                    } catch (error) {
                        detailPanel.innerHTML = renderAlert(error.message || "Receipt generation failed.", "error");
                    } finally {
                        generateButton.disabled = false;
                    }
                }

                if (viewButton) {
                    await showReceiptById(viewButton.dataset.viewReceipt);
                }

                if (printButton) {
                    await printReceiptById(printButton.dataset.printReceipt);
                }
            });

            detailPanel.addEventListener("click", async (event) => {
                const printButton = event.target.closest("[data-print-receipt]");
                if (printButton) {
                    await printReceiptById(printButton.dataset.printReceipt);
                }
            });

            lookupForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                const receiptId = new FormData(lookupForm).get("receiptId");
                await showReceiptById(receiptId);
            });

            renderWorkspace();
        }
    };
}
