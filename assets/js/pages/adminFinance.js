import { api } from "../api.js";
import { cloneFallback, fallbackPayments, fallbackReceipts, fallbackRentals } from "../demo-data.js";
import { readStorage, upsertStoredRecord } from "../components/storage.js";
import {
    openModal,
    printReceiptDocument,
    renderAlert,
    renderBadge,
    renderMetricCard,
    renderSpinner,
    renderTable,
    setElementHtml,
    showToast,
    formatCurrency,
    formatDateTime,
    getStatusTone,
    titleCase
} from "../components/ui.js";

const PAYMENTS_KEY = "velox.payments";
const RECEIPTS_KEY = "velox.receipts";

function paymentModalMarkup(rental) {
    return `
        <div id="payment-modal-feedback"></div>
        <p class="muted">Process payment for rental <strong>#${rental.id}</strong> with backend-calculated total <strong>${formatCurrency(rental.totalCost)}</strong>.</p>
        <div class="field-group">
            <label for="cardNumber">Card number</label>
            <input class="field" id="cardNumber" name="cardNumber" inputmode="numeric" maxlength="16" minlength="16" placeholder="1234123412341234" required>
        </div>
        <div class="field-group">
            <label for="paymentMethod">Payment method</label>
            <select class="select" id="paymentMethod" name="paymentMethod" required>
                <option value="CARD">Card</option>
                <option value="VISA">Visa</option>
                <option value="MASTERCARD">Mastercard</option>
                <option value="AMEX">Amex</option>
            </select>
        </div>
    `;
}

function renderFinanceSummary(target, payload) {
    if (!target) return;

    if (!payload) {
        target.innerHTML = renderAlert("Select a finance action to inspect a payment or receipt response here.", "info");
        return;
    }

    if (payload.type === "payment") {
        target.innerHTML = `
            <div class="booking-summary">
                <div class="summary-row">
                    <div>
                        <span class="muted">Payment transaction</span>
                        <strong>${payload.data.transactionId || `Payment #${payload.data.id}`}</strong>
                    </div>
                    ${renderBadge("Processed", "success")}
                </div>
                <div class="summary-stack">
                    <div class="summary-row"><span class="muted">Rental</span><strong>#${payload.data.rental?.id || "—"}</strong></div>
                    <div class="summary-row"><span class="muted">Amount paid</span><strong>${formatCurrency(payload.data.amountPaid)}</strong></div>
                    <div class="summary-row"><span class="muted">Method</span><strong>${payload.data.paymentMethod || "CARD"}</strong></div>
                    <div class="summary-row"><span class="muted">Payment date</span><strong>${formatDateTime(payload.data.paymentDate)}</strong></div>
                </div>
            </div>
        `;
        return;
    }

    target.innerHTML = `
        <div class="booking-summary">
            <div class="summary-row">
                <div>
                    <span class="muted">Receipt number</span>
                    <strong>${payload.data.receiptNumber || `Receipt #${payload.data.id}`}</strong>
                </div>
                ${renderBadge(titleCase(payload.data.isVoided ? "VOIDED" : "ACTIVE"), payload.data.isVoided ? "danger" : "success")}
            </div>
            <div class="summary-stack">
                <div class="summary-row"><span class="muted">Rental</span><strong>#${payload.data.rental?.id || "—"}</strong></div>
                <div class="summary-row"><span class="muted">Base cost</span><strong>${formatCurrency(payload.data.baseCost)}</strong></div>
                <div class="summary-row"><span class="muted">Late fee</span><strong>${formatCurrency(payload.data.lateFee)}</strong></div>
                <div class="summary-row"><span class="muted">Final total</span><strong>${formatCurrency(payload.data.finalTotal)}</strong></div>
            </div>
            <div class="button-row receipt-action-row">
                <button class="button" type="button" data-print-admin-receipt="${payload.data.id}">Print receipt</button>
            </div>
        </div>
    `;
}

export function createAdminFinancePage() {
    return {
        title: "Payments & Receipts",
        subtitle: "Work within the backend’s current finance API surface: process payments, generate receipts, print them, and keep a cached overview in the frontend.",
        content: `
            <div id="admin-finance-feedback"></div>
            <div class="stats-grid" id="admin-finance-stats">
                ${renderMetricCard("Rentals tracked", "—")}
                ${renderMetricCard("Cached payments", "—")}
                ${renderMetricCard("Cached receipts", "—")}
            </div>

            <div class="split-grid" style="margin-top: 1rem;">
                <article class="content-card">
                    <div class="table-toolbar">
                        <div class="field-group">
                            <label for="finance-search">Search rentals</label>
                            <input class="search-input" id="finance-search" type="search" placeholder="Search by rental, customer, or vehicle">
                        </div>
                        <div class="field-group">
                            <label for="finance-filter">Status</label>
                            <select class="select" id="finance-filter">
                                <option value="">All rentals</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    </div>
                    <div id="admin-finance-table">${renderSpinner("Loading rental finance overview...")}</div>
                </article>

                <article class="glass-card booking-summary receipt-panel-card">
                    <div>
                        <span class="eyebrow">Finance detail</span>
                        <h2 class="section-title" style="margin-top: 1rem;">Receipt lookup</h2>
                    </div>
                    <form id="receipt-lookup-admin-form" class="stack receipt-lookup-form">
                        <div class="field-group">
                            <label for="adminReceiptId">Receipt ID</label>
                            <input class="field" id="adminReceiptId" name="adminReceiptId" type="number" min="1" placeholder="Look up a receipt by ID">
                        </div>
                        <button class="ghost-button" type="submit">Lookup receipt</button>
                    </form>
                    <div id="admin-finance-detail"></div>
                </article>
            </div>
        `,
        async afterRender() {
            const feedback = document.getElementById("admin-finance-feedback");
            const stats = document.getElementById("admin-finance-stats");
            const table = document.getElementById("admin-finance-table");
            const searchInput = document.getElementById("finance-search");
            const statusFilter = document.getElementById("finance-filter");
            const detail = document.getElementById("admin-finance-detail");
            const lookupForm = document.getElementById("receipt-lookup-admin-form");

            const response = await api.get("/rentals", {
                fallbackData: cloneFallback(fallbackRentals)
            });

            const rentals = Array.isArray(response.data) ? response.data : [];
            let payments = readStorage(PAYMENTS_KEY, []);
            let receipts = readStorage(RECEIPTS_KEY, []);

            if (response.fallback) {
                if (!payments.length) payments = cloneFallback(fallbackPayments);
                if (!receipts.length) receipts = cloneFallback(fallbackReceipts);
                feedback.innerHTML = renderAlert("Finance is in demo overview mode because the rentals API could not be reached.", "warning");
                showToast(response.message, "warning", "Demo mode");
            }

            function paymentForRental(rentalId) {
                return payments.find((payment) => Number(payment?.rental?.id) === Number(rentalId));
            }

            function receiptForRental(rentalId) {
                return receipts.find((receipt) => Number(receipt?.rental?.id) === Number(rentalId));
            }

            function renderStats() {
                stats.innerHTML = `
                    ${renderMetricCard("Rentals tracked", String(rentals.length))}
                    ${renderMetricCard("Cached payments", String(payments.length))}
                    ${renderMetricCard("Cached receipts", String(receipts.length))}
                `;
            }

            function renderTableView() {
                const search = (searchInput.value || "").trim().toLowerCase();
                const filter = statusFilter.value;

                const filtered = rentals.filter((rental) => {
                    const matchesFilter = !filter || String(rental.status || "").toUpperCase() === filter;
                    const searchable = `${rental.id} ${rental.customer?.username || rental.customer?.name || ""} ${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.toLowerCase();
                    const matchesSearch = !search || searchable.includes(search);
                    return matchesFilter && matchesSearch;
                });

                table.innerHTML = renderTable(
                    [
                        { label: "Rental", render: (rental) => `<strong>#${rental.id}</strong><br><span class="muted">${rental.customer?.username || rental.customer?.name || "Customer"}</span>` },
                        { label: "Vehicle", render: (rental) => `${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.trim() || "Unknown vehicle" },
                        { label: "Total Cost", render: (rental) => formatCurrency(rental.totalCost) },
                        { label: "Status", render: (rental) => renderBadge(titleCase(rental.status || "unknown"), getStatusTone(rental.status)) },
                        { label: "Payment", render: (rental) => paymentForRental(rental.id) ? renderBadge("Processed", "success") : renderBadge("Pending", "warning") },
                        { label: "Receipt", render: (rental) => receiptForRental(rental.id) ? renderBadge("Ready", "success") : renderBadge("Missing", "warning") },
                        {
                            label: "Actions",
                            render: (rental) => `
                                <div class="button-row">
                                    <button class="ghost-button" type="button" data-process-payment="${rental.id}">Process payment</button>
                                    <button class="button" type="button" data-generate-admin-receipt="${rental.id}">Generate receipt</button>
                                </div>
                            `
                        }
                    ],
                    filtered,
                    "No rentals match the current finance filters."
                );

                renderStats();
            }

            async function fetchReceipt(receiptId) {
                if (!receiptId) return null;

                const cachedReceipt = receipts.find((receipt) => Number(receipt.id) === Number(receiptId));
                if (cachedReceipt) {
                    return cachedReceipt;
                }

                const lookupResponse = await api.get(`/receipts/${receiptId}`, {
                    fallbackData: cloneFallback(fallbackReceipts[0])
                });

                receipts = upsertStoredRecord(RECEIPTS_KEY, lookupResponse.data);
                renderTableView();
                return lookupResponse.data;
            }

            async function lookupReceipt(receiptId) {
                if (!receiptId) return;
                setElementHtml(detail, renderSpinner("Looking up receipt..."));

                try {
                    const receipt = await fetchReceipt(receiptId);
                    renderFinanceSummary(detail, { type: "receipt", data: receipt });
                } catch (error) {
                    detail.innerHTML = renderAlert(error.message || "Receipt lookup failed.", "error");
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

            lookupForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                const receiptId = new FormData(lookupForm).get("adminReceiptId");
                await lookupReceipt(receiptId);
            });

            detail.addEventListener("click", async (event) => {
                const printButton = event.target.closest("[data-print-admin-receipt]");
                if (printButton) {
                    await printReceiptById(printButton.dataset.printAdminReceipt);
                }
            });

            table.addEventListener("click", async (event) => {
                const paymentButton = event.target.closest("[data-process-payment]");
                const receiptButton = event.target.closest("[data-generate-admin-receipt]");

                if (paymentButton) {
                    const rental = rentals.find((entry) => Number(entry.id) === Number(paymentButton.dataset.processPayment));
                    if (!rental) return;

                    openModal({
                        title: "Process payment",
                        description: "Create a payment record through the backend payment endpoint.",
                        content: paymentModalMarkup(rental),
                        submitLabel: "Process payment",
                        async onSubmit(formData, close, form) {
                            const modalFeedback = form.querySelector("#payment-modal-feedback");
                            const cardNumber = String(formData.get("cardNumber") || "").replace(/\s+/g, "");
                            const paymentMethod = String(formData.get("paymentMethod") || "").trim();

                            if (!/^\d{16}$/.test(cardNumber)) {
                                modalFeedback.innerHTML = renderAlert("Card number must be exactly 16 digits.", "error");
                                return;
                            }

                            try {
                                const paymentResponse = await api.post("/payments", {
                                    rentalId: Number(rental.id),
                                    cardNumber,
                                    paymentMethod
                                });
                                payments = upsertStoredRecord(PAYMENTS_KEY, paymentResponse.data);
                                renderTableView();
                                renderFinanceSummary(detail, { type: "payment", data: paymentResponse.data });
                                close();
                                showToast("Payment processed successfully.", "success", "Finance updated");
                            } catch (error) {
                                modalFeedback.innerHTML = renderAlert(error.message || "Payment processing failed.", "error");
                            }
                        }
                    });
                }

                if (receiptButton) {
                    const rentalId = Number(receiptButton.dataset.generateAdminReceipt);
                    receiptButton.disabled = true;
                    setElementHtml(detail, renderSpinner("Generating receipt..."));

                    try {
                        const receiptResponse = await api.post(`/receipts/generate/${rentalId}`);
                        receipts = upsertStoredRecord(RECEIPTS_KEY, receiptResponse.data);
                        renderTableView();
                        renderFinanceSummary(detail, { type: "receipt", data: receiptResponse.data });
                        showToast("Receipt generated successfully.", "success", "Finance updated");
                    } catch (error) {
                        detail.innerHTML = renderAlert(error.message || "Receipt generation failed.", "error");
                    } finally {
                        receiptButton.disabled = false;
                    }
                }
            });

            searchInput.addEventListener("input", renderTableView);
            statusFilter.addEventListener("change", renderTableView);
            renderFinanceSummary(detail, null);
            renderTableView();
        }
    };
}
