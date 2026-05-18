import { api } from "../api.js";
import { cloneFallback, fallbackDrivers, fallbackVehicles } from "../demo-data.js";
import {
    escapeHtml,
    formatCurrency,
    formatDate,
    getUserLabel,
    rentalDurationDays,
    renderAlert,
    renderBadge,
    renderMetricCard,
    renderSpinner,
    setElementHtml,
    showToast,
    titleCase
} from "../components/ui.js";

function renderDriverOption(driver) {
    return `<option value="${driver.id}">${escapeHtml(`${getUserLabel(driver)} - ${driver.licenseType || "Licensed Driver"}`)}</option>`;
}

function renderBookingSummary(rental) {
    return `
        <div class="booking-summary">
            <div class="summary-row">
                <div>
                    <span class="muted">Rental ID</span>
                    <strong>#${escapeHtml(String(rental.id || "Pending"))}</strong>
                </div>
                ${renderBadge(titleCase(rental.status || "confirmed"), "success")}
            </div>
            <div class="summary-stack">
                <div class="summary-row">
                    <span class="muted">Vehicle</span>
                    <strong>${escapeHtml(`${rental.vehicle?.brand || ""} ${rental.vehicle?.model || ""}`.trim() || "Not confirmed")}</strong>
                </div>
                <div class="summary-row">
                    <span class="muted">Travel window</span>
                    <strong>${escapeHtml(`${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}`)}</strong>
                </div>
                <div class="summary-row">
                    <span class="muted">Driver</span>
                    <strong>${escapeHtml(rental.driver ? getUserLabel(rental.driver) : "Self-drive")}</strong>
                </div>
                <div class="summary-row">
                    <span class="muted">Server-confirmed total</span>
                    <strong>${formatCurrency(rental.totalCost)}</strong>
                </div>
            </div>
        </div>
    `;
}

export function createCustomerBookRentalPage({ user, query }) {
    return {
        title: "Book Rental",
        subtitle: "Select a vehicle, choose an optional driver, and confirm your reservation with backend-verified pricing.",
        content: `
            <div class="stats-grid" id="booking-stats">
                ${renderMetricCard("Selected vehicle", query.vehicleId ? `#${query.vehicleId}` : "Pick one")}
                ${renderMetricCard("Estimated trip days", "0")}
                ${renderMetricCard("Estimated total", formatCurrency(0), "Server total may differ")}
            </div>

            <div class="split-grid booking-layout" style="margin-top: 1rem;">
                <article class="content-card booking-form-card">
                    <div id="booking-feedback"></div>
                    <form id="booking-form" class="stack" novalidate>
                        <div class="form-grid">
                            <div class="field-group">
                                <label for="vehicleId">Vehicle</label>
                                <select class="select" id="vehicleId" name="vehicleId" required>
                                    <option value="">Loading vehicles...</option>
                                </select>
                            </div>
                            <div class="field-group">
                                <label for="driverId">Driver (optional)</label>
                                <select class="select" id="driverId" name="driverId">
                                    <option value="">Self-drive</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-grid">
                            <div class="field-group">
                                <label for="startDate">Start date</label>
                                <input class="field" id="startDate" name="startDate" type="date" required>
                            </div>
                            <div class="field-group">
                                <label for="endDate">End date</label>
                                <input class="field" id="endDate" name="endDate" type="date" required>
                            </div>
                        </div>

                        <div class="inline-alert info" role="status">
                            The backend calculates the final <strong>totalCost</strong>. The live estimate here is for planning only.
                        </div>

                        <button class="button" type="submit">Confirm rental</button>
                    </form>
                </article>

                <article class="glass-card booking-summary booking-summary-card summary-panel-card">
                    <div>
                        <span class="eyebrow">Booking summary</span>
                        <h2 class="section-title" style="margin-top: 1rem;">Reservation details</h2>
                    </div>
                    <div id="booking-summary-panel">
                        ${renderAlert("Choose a vehicle and dates to see an estimated cost. After confirmation, this panel updates with server-confirmed rental data.", "info")}
                    </div>
                </article>
            </div>
        `,
        async afterRender() {
            const form = document.getElementById("booking-form");
            const feedback = document.getElementById("booking-feedback");
            const summaryPanel = document.getElementById("booking-summary-panel");
            const stats = document.getElementById("booking-stats");
            const vehicleSelect = document.getElementById("vehicleId");
            const driverSelect = document.getElementById("driverId");
            const startDate = document.getElementById("startDate");
            const endDate = document.getElementById("endDate");
            const today = new Date().toISOString().slice(0, 10);

            startDate.min = today;
            endDate.min = today;

            const [vehicleResponse, driverResponse] = await Promise.all([
                api.get("/vehicles/available", { fallbackData: cloneFallback(fallbackVehicles.filter((vehicle) => vehicle.available)) }),
                api.get("/drivers", { fallbackData: cloneFallback(fallbackDrivers) })
            ]);

            const vehicles = Array.isArray(vehicleResponse.data) ? vehicleResponse.data : [];
            const drivers = Array.isArray(driverResponse.data) ? driverResponse.data : [];

            if (vehicleResponse.fallback || driverResponse.fallback) {
                feedback.innerHTML = renderAlert("Some booking inputs are using demo fallback data because the API could not be reached.", "warning");
            }

            vehicleSelect.innerHTML = `
                <option value="">Select a vehicle</option>
                ${vehicles.map((vehicle) => `
                    <option value="${vehicle.id}" ${String(query.vehicleId || "") === String(vehicle.id) ? "selected" : ""}>
                        ${escapeHtml(`${vehicle.brand} ${vehicle.model} - ${formatCurrency(vehicle.dailyRate)}/day`)}
                    </option>
                `).join("")}
            `;

            driverSelect.innerHTML = `
                <option value="">Self-drive</option>
                ${drivers.map(renderDriverOption).join("")}
            `;

            function updateEstimate() {
                const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleSelect.value);
                const days = rentalDurationDays(startDate.value, endDate.value);
                const estimate = selectedVehicle ? Number(selectedVehicle.dailyRate || 0) * days : 0;

                stats.innerHTML = `
                    ${renderMetricCard("Selected vehicle", selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Pick one")}
                    ${renderMetricCard("Estimated trip days", String(days))}
                    ${renderMetricCard("Estimated total", formatCurrency(estimate), "Server total may differ")}
                `;

                const driver = drivers.find((entry) => String(entry.id) === driverSelect.value);
                summaryPanel.innerHTML = `
                    <div class="summary-stack">
                        <div class="summary-row">
                            <span class="muted">Vehicle</span>
                            <strong>${escapeHtml(selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Not selected")}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Trip dates</span>
                            <strong>${escapeHtml(startDate.value && endDate.value ? `${formatDate(startDate.value)} → ${formatDate(endDate.value)}` : "Choose travel dates")}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Driver preference</span>
                            <strong>${escapeHtml(driver ? getUserLabel(driver) : "Self-drive")}</strong>
                        </div>
                        <div class="summary-row">
                            <span class="muted">Estimated total</span>
                            <strong>${formatCurrency(estimate)}</strong>
                        </div>
                    </div>
                `;
            }

            [vehicleSelect, driverSelect, startDate, endDate].forEach((element) => {
                element.addEventListener("change", updateEstimate);
            });

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                feedback.innerHTML = "";

                const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleSelect.value);
                const days = rentalDurationDays(startDate.value, endDate.value);

                if (!user?.id) {
                    feedback.innerHTML = renderAlert("Your account does not include a customer ID, so booking cannot continue.", "error");
                    return;
                }

                if (!vehicleSelect.value || !startDate.value || !endDate.value) {
                    feedback.innerHTML = renderAlert("Vehicle, start date, and end date are all required.", "error");
                    return;
                }

                if (endDate.value <= startDate.value) {
                    feedback.innerHTML = renderAlert("End date must be after the start date.", "error");
                    return;
                }

                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                setElementHtml(summaryPanel, renderSpinner("Creating rental and fetching server confirmation..."));

                try {
                    const createResponse = await api.post("/rentals", {
                        customerId: Number(user.id),
                        vehicleId: Number(vehicleSelect.value),
                        driverId: driverSelect.value ? Number(driverSelect.value) : null,
                        startDate: startDate.value,
                        endDate: endDate.value
                    });

                    const rentalId = createResponse.data?.id;
                    const confirmedResponse = rentalId
                        ? await api.get(`/rentals/${rentalId}`)
                        : createResponse;

                    const confirmedRental = confirmedResponse.data || createResponse.data;
                    summaryPanel.innerHTML = renderBookingSummary(confirmedRental);
                    showToast(`Rental #${confirmedRental.id} confirmed successfully.`, "success", "Booking confirmed");

                    if (selectedVehicle) {
                        stats.innerHTML = `
                            ${renderMetricCard("Selected vehicle", `${selectedVehicle.brand} ${selectedVehicle.model}`)}
                            ${renderMetricCard("Estimated trip days", String(days))}
                            ${renderMetricCard("Estimated total", formatCurrency(confirmedRental.totalCost), "Confirmed by backend")}
                        `;
                    }
                } catch (error) {
                    summaryPanel.innerHTML = renderAlert("Booking could not be completed. Fix any validation issues and try again.", "error");
                    feedback.innerHTML = renderAlert(error.message || "Rental creation failed.", "error");
                } finally {
                    submitButton.disabled = false;
                }
            });

            updateEstimate();
        }
    };
}
