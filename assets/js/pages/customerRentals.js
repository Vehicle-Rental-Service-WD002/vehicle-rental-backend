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

function resolveCustomerRentals(rentals, user, fallbackMode) {
    const filtered = rentals.filter((rental) => Number(rental?.customer?.id) === Number(user?.id));
    if (filtered.length || !fallbackMode) return filtered;
    return rentals.filter((rental) => rental.customer).slice(0, 3);
}

function renderRentalCards(rentals) {
    if (!rentals.length) {
        return renderEmptyState({
            title: "No rentals found",
            description: "Once you complete a booking, your active and past rentals will appear here.",
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
                            <span class="muted">${rental.vehicle?.brand || "Vehicle"} ${rental.vehicle?.model || ""}</span>
                        </div>
                        ${renderBadge(titleCase(rental.status || "unknown"), getStatusTone(rental.status))}
                    </div>
                    <div class="summary-stack">
                        <div class="summary-row">
                            <span class="muted">Travel dates</span>
                            <strong>${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Driver</span>
                            <strong>${rental.driver ? getUserLabel(rental.driver) : "Self-drive"}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Backend total</span>
                            <strong>${formatCurrency(rental.totalCost)}</strong>
                        </div>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

export function createCustomerRentalsPage({ user }) {
    return {
        title: "My Rentals",
        subtitle: "Track active reservations, review completed trips, and keep an eye on total cost and status changes.",
        content: `
            <div id="rentals-feedback"></div>
            <div class="stats-grid" id="rentals-stats">
                ${renderMetricCard("Active rentals", "—")}
                ${renderMetricCard("Completed rentals", "—")}
                ${renderMetricCard("Total spend", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div class="table-toolbar">
                    <div class="segmented" role="tablist" aria-label="Rental filters">
                        <button class="active" type="button" data-filter="all">All</button>
                        <button type="button" data-filter="active">Active</button>
                        <button type="button" data-filter="past">Past</button>
                    </div>
                    <div class="field-group">
                        <label for="rental-search">Search rentals</label>
                        <input class="search-input" id="rental-search" type="search" placeholder="Search by vehicle or rental ID">
                    </div>
                </div>
                <div id="rentals-list">${renderSpinner("Loading your rentals...")}</div>
            </article>
        `,
        async afterRender() {
            const feedback = document.getElementById("rentals-feedback");
            const stats = document.getElementById("rentals-stats");
            const list = document.getElementById("rentals-list");
            const searchInput = document.getElementById("rental-search");
            const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

            let activeFilter = "all";

            const response = await api.get("/rentals", {
                fallbackData: cloneFallback(fallbackRentals)
            });

            let rentals = resolveCustomerRentals(Array.isArray(response.data) ? response.data : [], user, response.fallback);

            if (response.fallback) {
                feedback.innerHTML = renderAlert("Live rentals could not be fetched, so this page is showing demo trip history.", "warning");
                showToast(response.message, "warning", "Demo mode");
            }

            function isPastRental(rental) {
                const status = String(rental.status || "").toUpperCase();
                return status === "COMPLETED" || new Date(rental.endDate) < new Date();
            }

            function renderStats(filteredRentals) {
                const activeCount = filteredRentals.filter((rental) => !isPastRental(rental) && String(rental.status || "").toUpperCase() === "ACTIVE").length;
                const completedCount = filteredRentals.filter(isPastRental).length;
                const totalSpend = filteredRentals.reduce((sum, rental) => sum + Number(rental.totalCost || 0), 0);

                stats.innerHTML = `
                    ${renderMetricCard("Active rentals", String(activeCount))}
                    ${renderMetricCard("Completed rentals", String(completedCount))}
                    ${renderMetricCard("Total spend", formatCurrency(totalSpend))}
                `;
            }

            function renderList() {
                const search = (searchInput.value || "").trim().toLowerCase();

                const filtered = rentals.filter((rental) => {
                    const statusMatch =
                        activeFilter === "all" ||
                        (activeFilter === "active" && !isPastRental(rental) && String(rental.status || "").toUpperCase() === "ACTIVE") ||
                        (activeFilter === "past" && isPastRental(rental));

                    const searchHaystack = `${rental.id} ${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.toLowerCase();
                    const searchMatch = !search || searchHaystack.includes(search);
                    return statusMatch && searchMatch;
                });

                renderStats(rentals);
                setElementHtml(list, renderRentalCards(filtered));
            }

            filterButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    activeFilter = button.dataset.filter;
                    filterButtons.forEach((entry) => entry.classList.toggle("active", entry === button));
                    renderList();
                });
            });

            searchInput.addEventListener("input", renderList);
            renderList();
        }
    };
}
