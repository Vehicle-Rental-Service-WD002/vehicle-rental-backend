import { api } from "../api.js";
import { cloneFallback, fallbackRentals } from "../demo-data.js";
import {
    formatCurrency,
    formatDate,
    getStatusTone,
    getUserLabel,
    renderAlert,
    renderBadge,
    renderEmptyState,
    renderMetricCard,
    renderSpinner,
    setElementHtml,
    showToast,
    titleCase
} from "../components/ui.js";

function resolveDriverRentals(rentals, user, fallbackMode) {
    const filtered = rentals.filter((rental) => Number(rental?.driver?.id) === Number(user?.id));
    if (filtered.length || !fallbackMode) return filtered;
    return rentals.filter((rental) => rental.driver).slice(0, 4);
}

function renderAssignedRentals(rentals) {
    if (!rentals.length) {
        return renderEmptyState({
            title: "No assigned rentals",
            description: "Assigned trips will appear here as soon as a booking includes your driver profile.",
            icon: "▣"
        });
    }

    return `
        <div class="rental-list">
            ${rentals.map((rental) => `
                <article class="list-card">
                    <div class="summary-row">
                        <div>
                            <h3 class="section-title">Rental #${rental.id}</h3>
                            <span class="muted">${getUserLabel(rental.customer)} · ${rental.customer?.phoneNumber || "No phone available"}</span>
                        </div>
                        ${renderBadge(titleCase(rental.status || "active"), getStatusTone(rental.status))}
                    </div>
                    <div class="summary-stack">
                        <div class="summary-row">
                            <span class="muted">Vehicle</span>
                            <strong>${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Trip dates</span>
                            <strong>${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Total cost</span>
                            <strong>${formatCurrency(rental.totalCost)}</strong>
                        </div>
                    </div>
                    ${String(rental.status || "").toUpperCase() === "ACTIVE"
                        ? `<button class="button" type="button" data-complete-rental="${rental.id}">Mark as completed</button>`
                        : ""}
                </article>
            `).join("")}
        </div>
    `;
}

export function createDriverAssignedRentalsPage({ user }) {
    return {
        title: "Assigned Rentals",
        subtitle: "Keep track of your active trips, customer details, and completion actions from one focused driver workspace.",
        content: `
            <div id="driver-feedback"></div>
            <div class="stats-grid" id="driver-stats">
                ${renderMetricCard("Assigned rentals", "—")}
                ${renderMetricCard("Active trips", "—")}
                ${renderMetricCard("Completed trips", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div id="driver-rentals">${renderSpinner("Loading assigned rentals...")}</div>
            </article>
        `,
        async afterRender() {
            const feedback = document.getElementById("driver-feedback");
            const stats = document.getElementById("driver-stats");
            const container = document.getElementById("driver-rentals");

            const response = await api.get("/rentals", {
                fallbackData: cloneFallback(fallbackRentals)
            });

            let rentals = resolveDriverRentals(Array.isArray(response.data) ? response.data : [], user, response.fallback);

            if (response.fallback) {
                feedback.innerHTML = renderAlert("The rentals API is currently unavailable, so this page is showing a demo assignment list.", "warning");
                showToast(response.message, "warning", "Demo mode");
            }

            function renderStats() {
                const activeTrips = rentals.filter((rental) => String(rental.status || "").toUpperCase() === "ACTIVE").length;
                const completedTrips = rentals.filter((rental) => String(rental.status || "").toUpperCase() === "COMPLETED").length;

                stats.innerHTML = `
                    ${renderMetricCard("Assigned rentals", String(rentals.length))}
                    ${renderMetricCard("Active trips", String(activeTrips))}
                    ${renderMetricCard("Completed trips", String(completedTrips))}
                `;
            }

            function renderList() {
                setElementHtml(container, renderAssignedRentals(rentals));
                renderStats();
            }

            container.addEventListener("click", async (event) => {
                const button = event.target.closest("[data-complete-rental]");
                if (!button) return;

                const rentalId = Number(button.dataset.completeRental);
                button.disabled = true;

                try {
                    const response = await api.put(`/rentals/${rentalId}/complete`);
                    rentals = rentals.map((rental) => Number(rental.id) === rentalId ? response.data : rental);
                    renderList();
                    showToast(`Rental #${rentalId} marked as completed.`, "success", "Trip updated");
                } catch (error) {
                    feedback.innerHTML = renderAlert(error.message || "Rental completion failed.", "error");
                } finally {
                    button.disabled = false;
                }
            });

            renderList();
        }
    };
}
