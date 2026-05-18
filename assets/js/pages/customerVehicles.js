import { cloneFallback, fallbackVehicles } from "../demo-data.js";
import { api } from "../api.js";
import { navigate } from "../router.js";
import {
    escapeHtml,
    formatCurrency,
    renderAlert,
    renderBadge,
    renderEmptyState,
    renderMetricCard,
    renderSkeletonCards,
    setElementHtml,
    showToast
} from "../components/ui.js";

function renderVehicleCards(vehicles) {
    if (!vehicles.length) {
        return renderEmptyState({
            title: "No vehicles available",
            description: "The fleet is currently fully booked. Check back a little later for newly released vehicles.",
            actionLabel: "Book Another Date",
            actionId: "book-from-empty",
            icon: "◇"
        });
    }

    return `
        <div class="card-grid vehicle-card-grid">
            ${vehicles.map((vehicle) => `
                <article class="glass-card vehicle-card">
                    <div class="vehicle-visual front-stage" aria-hidden="true">
                        <div class="vehicle-front-wrap">
                            <div class="vehicle-front-shadow"></div>
                            <div class="vehicle-front-car"></div>
                            <div class="vehicle-front-headlights"><span></span><span></span></div>
                            <div class="vehicle-front-grille"></div>
                            <div class="vehicle-front-bumper"></div>
                        </div>
                    </div>
                    <div class="meta-row">
                        <div>
                            <h3 class="section-title">${escapeHtml(`${vehicle.brand} ${vehicle.model}`)}</h3>
                            <span class="muted">${escapeHtml(`${vehicle.year} • ${vehicle.type}`)}</span>
                        </div>
                        ${renderBadge(vehicle.available ? "Available" : "Booked", vehicle.available ? "success" : "warning")}
                    </div>
                    <div class="list-meta">
                        <span class="muted">Vehicle No</span>
                        <strong>${escapeHtml(vehicle.vehicleNumber || "Not assigned")}</strong>
                    </div>
                    <div class="summary-row">
                        <div>
                            <span class="muted">Daily rate</span>
                            <strong>${formatCurrency(vehicle.dailyRate)}</strong>
                        </div>
                        <button class="button" type="button" data-book-vehicle="${vehicle.id}">Book now</button>
                    </div>
                </article>
            `).join("")}
        </div>
    `;
}

export function createCustomerVehiclesPage() {
    return {
        title: "Available Vehicles",
        subtitle: "Browse the current fleet, compare vehicle types, and jump straight into a reservation flow.",
        content: `
            <div class="stats-grid" id="vehicle-stats">
                ${renderMetricCard("Available today", "—")}
                ${renderMetricCard("Average daily rate", "—")}
                ${renderMetricCard("Vehicle types", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div class="table-toolbar">
                    <div class="field-group">
                        <label for="vehicle-search">Search available fleet</label>
                        <input class="search-input" id="vehicle-search" type="search" placeholder="Search by brand, model, type, or vehicle number">
                    </div>
                    <div class="field-group">
                        <label for="vehicle-type-filter">Filter by type</label>
                        <select class="select" id="vehicle-type-filter">
                            <option value="">All vehicle types</option>
                        </select>
                    </div>
                </div>
                <div id="vehicle-feedback"></div>
                <div id="vehicle-grid">${renderSkeletonCards(6)}</div>
            </article>
        `,
        async afterRender() {
            const stats = document.getElementById("vehicle-stats");
            const grid = document.getElementById("vehicle-grid");
            const feedback = document.getElementById("vehicle-feedback");
            const searchInput = document.getElementById("vehicle-search");
            const typeFilter = document.getElementById("vehicle-type-filter");

            const response = await api.get("/vehicles/available", {
                fallbackData: cloneFallback(fallbackVehicles.filter((vehicle) => vehicle.available))
            });

            const vehicles = Array.isArray(response.data) ? response.data : [];

            if (response.fallback) {
                feedback.innerHTML = renderAlert("API unavailable right now. Showing demo fleet data instead.", "warning");
                showToast(response.message, "warning", "Demo mode");
            }

            const types = [...new Set(vehicles.map((vehicle) => vehicle.type).filter(Boolean))];
            typeFilter.innerHTML = `
                <option value="">All vehicle types</option>
                ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
            `;

            function renderStats(filteredVehicles) {
                const averageRate = filteredVehicles.length
                    ? formatCurrency(filteredVehicles.reduce((sum, vehicle) => sum + Number(vehicle.dailyRate || 0), 0) / filteredVehicles.length)
                    : formatCurrency(0);

                stats.innerHTML = `
                    ${renderMetricCard("Available today", String(filteredVehicles.length))}
                    ${renderMetricCard("Average daily rate", averageRate)}
                    ${renderMetricCard("Vehicle types", String(new Set(filteredVehicles.map((vehicle) => vehicle.type)).size))}
                `;
            }

            function renderList() {
                const search = (searchInput.value || "").trim().toLowerCase();
                const selectedType = typeFilter.value;

                const filtered = vehicles.filter((vehicle) => {
                    const searchable = [vehicle.brand, vehicle.model, vehicle.type, vehicle.vehicleNumber]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();
                    const matchesSearch = !search || searchable.includes(search);
                    const matchesType = !selectedType || vehicle.type === selectedType;
                    return matchesSearch && matchesType;
                });

                renderStats(filtered);
                setElementHtml(grid, renderVehicleCards(filtered));
            }

            grid.addEventListener("click", (event) => {
                const button = event.target.closest("[data-book-vehicle]");
                const emptyAction = event.target.closest('[data-action="book-from-empty"]');

                if (button) {
                    navigate(`/customer/book?vehicleId=${button.dataset.bookVehicle}`);
                }

                if (emptyAction) {
                    navigate("/customer/book");
                }
            });

            searchInput.addEventListener("input", renderList);
            typeFilter.addEventListener("change", renderList);
            renderList();
        }
    };
}
