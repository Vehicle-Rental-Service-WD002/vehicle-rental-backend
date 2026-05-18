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

                        <button class="button" type="submit">Proceed to Payment</button>
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

            // Track all rentals for filtering available drivers (DECLARE FIRST)
            let allRentals = [];

            async function loadAllRentals() {
                try {
                    const response = await api.get("/rentals", { fallbackData: [] });
                    allRentals = Array.isArray(response.data) ? response.data : [];
                } catch (error) {
                    console.error("Error loading rentals:", error);
                    allRentals = [];
                }
            }

            function getAvailableDrivers(selectedStart, selectedEnd) {
                if (!selectedStart || !selectedEnd) {
                    return drivers; // Show all drivers if no dates selected
                }

                const selectedStartDate = new Date(selectedStart);
                const selectedEndDate = new Date(selectedEnd);

                // Filter out drivers with conflicting rentals
                return drivers.filter((driver) => {
                    const hasConflict = allRentals.some((rental) => {
                        // Only check ACTIVE rentals
                        if (rental.status !== "ACTIVE") return false;
                        // Check if this rental is for this driver
                        if (rental.driver?.id !== driver.id) return false;

                        const rentalStart = new Date(rental.startDate);
                        const rentalEnd = new Date(rental.endDate);

                        // Check for overlapping dates
                        return selectedStartDate < rentalEnd && selectedEndDate > rentalStart;
                    });

                    return !hasConflict; // Return driver if no conflict
                });
            }

            function updateEstimate() {
                const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleSelect.value);
                const days = rentalDurationDays(startDate.value, endDate.value);
                const estimate = selectedVehicle ? Number(selectedVehicle.dailyRate || 0) * days : 0;

                stats.innerHTML = `
                    ${renderMetricCard("Selected vehicle", selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Pick one")}
                    ${renderMetricCard("Estimated trip days", String(days))}
                    ${renderMetricCard("Estimated total", formatCurrency(estimate), "Server total may differ")}
                `;

                // Update available drivers based on selected dates
                const availableDrivers = getAvailableDrivers(startDate.value, endDate.value);
                const currentDriverId = driverSelect.value;

                // Check if currently selected driver is still available
                const isCurrentDriverAvailable = currentDriverId === "" || availableDrivers.some(d => String(d.id) === currentDriverId);

                // If current driver is no longer available, reset selection
                if (!isCurrentDriverAvailable) {
                    driverSelect.value = "";
                }

                // Update driver dropdown to show only available drivers
                driverSelect.innerHTML = `
                    <option value="">Self-drive</option>
                    ${availableDrivers.map(renderDriverOption).join("")}
                `;

                // Restore previously selected driver if still available
                if (isCurrentDriverAvailable && currentDriverId) {
                    driverSelect.value = currentDriverId;
                }

                const driver = availableDrivers.find((entry) => String(entry.id) === driverSelect.value);
                const availableCount = availableDrivers.length;
                const unavailableCount = drivers.length - availableCount;

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
                        ${unavailableCount > 0 ? `
                            <div class="inline-alert info">
                                <span class="muted small">${unavailableCount} driver(s) unavailable for these dates</span>
                            </div>
                        ` : ""}
                        <div class="summary-row">
                            <span class="muted">Estimated total</span>
                            <strong>${formatCurrency(estimate)}</strong>
                        </div>
                    </div>
                `;
            }

            // Load vehicles and drivers from API
            await loadAllRentals();

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

            [vehicleSelect, driverSelect, startDate, endDate].forEach((element) => {
                element.addEventListener("change", updateEstimate);
            });

            updateEstimate();

            form.addEventListener("submit", async (event) => {
                event.preventDefault();
                feedback.innerHTML = "";

                const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleSelect.value);
                const days = rentalDurationDays(startDate.value, endDate.value);
                const estimatedCost = selectedVehicle ? Number(selectedVehicle.dailyRate || 0) * days : 0;

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

                // Show payment modal
                const paymentModal = createPaymentModal(estimatedCost, async (paymentMethod) => {
                    await processRentalWithPayment(paymentMethod, estimatedCost);
                });
                document.body.appendChild(paymentModal);
            });

            async function processRentalWithPayment(paymentMethod, estimatedCost) {
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                setElementHtml(summaryPanel, renderSpinner("Processing payment and creating rental..."));

                try {
                    // Simulate payment processing (1-2 seconds)
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    showToast(`Payment received via ${paymentMethod === "card" ? "Credit Card" : "Cash"}!`, "success");

                    const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === vehicleSelect.value);
                    const days = rentalDurationDays(startDate.value, endDate.value);

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

                    // Clear form for next booking
                    form.reset();
                    vehicleSelect.value = "";
                    driverSelect.value = "";
                    updateEstimate();
                } catch (error) {
                    summaryPanel.innerHTML = renderAlert("Payment successful but booking could not be completed. Try again or contact support.", "error");
                    feedback.innerHTML = renderAlert(error.message || "Rental creation failed.", "error");
                } finally {
                    submitButton.disabled = false;
                    // Close payment modal
                    const modal = document.querySelector('[data-payment-modal]');
                    if (modal) modal.remove();
                }
            }

            function createPaymentModal(amount, onPaymentMethod) {
                const modal = document.createElement("div");
                modal.setAttribute("data-payment-modal", "true");
                modal.className = "payment-modal-overlay";
                modal.innerHTML = `
                    <div class="payment-modal-card">
                        <div class="payment-modal-header">
                            <h3>Select Payment Method</h3>
                            <p>Total Amount: <span class="amount-highlight">${formatCurrency(amount)}</span></p>
                        </div>
                        <div class="payment-modal-body">
                            <button class="payment-option" data-method="card">
                                <span class="payment-icon">💳</span>
                                <div>
                                    <strong>Credit/Debit Card</strong>
                                    <small>Visa, Mastercard, Amex</small>
                                </div>
                            </button>
                            <button class="payment-option" data-method="cash">
                                <span class="payment-icon">💵</span>
                                <div>
                                    <strong>Pay at Counter</strong>
                                    <small>Cash payment on pickup</small>
                                </div>
                            </button>
                        </div>
                        <p class="payment-modal-footer">Booking will be confirmed after payment (1-2 seconds)</p>
                        <button class="button button-secondary payment-modal-close">Cancel</button>
                    </div>
                `;

                modal.querySelector(".payment-modal-close").addEventListener("click", (e) => {
                    e.preventDefault();
                    modal.remove();
                    const submitButton = form.querySelector('button[type="submit"]');
                    submitButton.disabled = false;
                });

                modal.querySelectorAll("[data-method]").forEach((btn) => {
                    btn.addEventListener("click", (e) => {
                        e.preventDefault();
                        const method = btn.getAttribute("data-method");
                        modal.querySelectorAll("[data-method]").forEach(b => b.classList.remove("active"));
                        btn.classList.add("active");
                        btn.textContent = "Processing...";
                        btn.disabled = true;
                        onPaymentMethod(method);
                    });
                });

                return modal;
            }
        }
    };
}
