import { api } from "../api.js";
import { cloneFallback, fallbackRentals } from "../demo-data.js";
import { formatCurrency, formatDate, getStatusTone, getUserLabel, renderAlert, renderBadge, renderMetricCard, renderSpinner, renderTable, showToast, titleCase } from "../components/ui.js";

export function createAdminRentalsPage() {
    return {
        title: "All Rentals",
        subtitle: "Monitor reservation activity across customers, vehicles, assigned drivers, and backend-calculated totals.",
        content: `
            <div id="admin-rentals-feedback"></div>
            <div class="stats-grid" id="admin-rentals-stats">
                ${renderMetricCard("Total rentals", "—")}
                ${renderMetricCard("Active rentals", "—")}
                ${renderMetricCard("Completed rentals", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div class="table-toolbar">
                    <div class="segmented" role="tablist" aria-label="Rental status filters">
                        <button class="active" type="button" data-rental-filter="all">All</button>
                        <button type="button" data-rental-filter="ACTIVE">Active</button>
                        <button type="button" data-rental-filter="COMPLETED">Completed</button>
                    </div>
                    <div class="field-group">
                        <label for="admin-rental-search">Search rentals</label>
                        <input class="search-input" id="admin-rental-search" type="search" placeholder="Search by customer, vehicle, driver, or rental ID">
                    </div>
                </div>
                <div id="admin-rentals-table">${renderSpinner("Loading all rentals...")}</div>
            </article>
        `,
        async afterRender() {
            const feedback = document.getElementById("admin-rentals-feedback");
            const stats = document.getElementById("admin-rentals-stats");
            const table = document.getElementById("admin-rentals-table");
            const searchInput = document.getElementById("admin-rental-search");
            const filterButtons = Array.from(document.querySelectorAll("[data-rental-filter]"));

            let filter = "all";
            const response = await api.get("/rentals", {
                fallbackData: cloneFallback(fallbackRentals)
            });

            const rentals = Array.isArray(response.data) ? response.data : [];

            if (response.fallback) {
                feedback.innerHTML = renderAlert("Live rentals are unavailable, so the admin rentals view is showing demo data.", "warning");
                showToast(response.message, "warning", "Demo mode");
            }

            function renderStats() {
                const activeCount = rentals.filter((rental) => String(rental.status || "").toUpperCase() === "ACTIVE").length;
                const completedCount = rentals.filter((rental) => String(rental.status || "").toUpperCase() === "COMPLETED").length;

                stats.innerHTML = `
                    ${renderMetricCard("Total rentals", String(rentals.length))}
                    ${renderMetricCard("Active rentals", String(activeCount))}
                    ${renderMetricCard("Completed rentals", String(completedCount))}
                `;
            }

            function renderRentals() {
                const search = (searchInput.value || "").trim().toLowerCase();
                const filtered = rentals.filter((rental) => {
                    const matchesFilter = filter === "all" || String(rental.status || "").toUpperCase() === filter;
                    const searchable = `${rental.id} ${getUserLabel(rental.customer)} ${getUserLabel(rental.driver || {})} ${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.toLowerCase();
                    const matchesSearch = !search || searchable.includes(search);
                    return matchesFilter && matchesSearch;
                });

                table.innerHTML = renderTable(
                    [
                        { label: "Rental", render: (rental) => `<strong>#${rental.id}</strong><br><span class="muted">${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}</span>` },
                        { label: "Customer", render: (rental) => getUserLabel(rental.customer) },
                        { label: "Vehicle", render: (rental) => `${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.trim() || "Vehicle unavailable" },
                        { label: "Driver", render: (rental) => rental.driver ? getUserLabel(rental.driver) : "Self-drive" },
                        { label: "Total Cost", render: (rental) => formatCurrency(rental.totalCost) },
                        { label: "Status", render: (rental) => renderBadge(titleCase(rental.status || "unknown"), getStatusTone(rental.status)) }
                    ],
                    filtered,
                    "No rentals match the current admin filters."
                );

                renderStats();
            }

            filterButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    filter = button.dataset.rentalFilter;
                    filterButtons.forEach((entry) => entry.classList.toggle("active", entry === button));
                    renderRentals();
                });
            });

            searchInput.addEventListener("input", renderRentals);
            renderRentals();
        }
    };
}
