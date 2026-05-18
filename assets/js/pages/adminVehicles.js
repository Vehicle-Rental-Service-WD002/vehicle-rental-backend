import { api } from "../api.js";
import { cloneFallback, fallbackVehicles } from "../demo-data.js";
import { openModal, renderAlert, renderMetricCard, renderSpinner, renderTable, showToast, formatCurrency, renderBadge } from "../components/ui.js";

function vehicleFormMarkup(vehicle = {}) {
    return `
        <div id="vehicle-modal-feedback"></div>
        <div class="form-grid">
            <div class="field-group">
                <label for="brand">Brand</label>
                <input class="field" id="brand" name="brand" value="${vehicle.brand || ""}" required>
            </div>
            <div class="field-group">
                <label for="model">Model</label>
                <input class="field" id="model" name="model" value="${vehicle.model || ""}" required>
            </div>
        </div>
        <div class="form-grid">
            <div class="field-group">
                <label for="dailyRate">Daily rate</label>
                <input class="field" id="dailyRate" name="dailyRate" type="number" min="1" step="0.01" value="${vehicle.dailyRate || ""}" required>
            </div>
            <div class="field-group">
                <label for="year">Year</label>
                <input class="field" id="year" name="year" type="number" min="1900" max="2100" value="${vehicle.year || ""}" required>
            </div>
        </div>
        <div class="form-grid">
            <div class="field-group">
                <label for="type">Type</label>
                <input class="field" id="type" name="type" value="${vehicle.type || ""}" required>
            </div>
            <div class="field-group">
                <label for="vehicleNumber">Vehicle number</label>
                <input class="field" id="vehicleNumber" name="vehicleNumber" value="${vehicle.vehicleNumber || ""}" required>
            </div>
        </div>
    `;
}

export function createAdminVehiclesPage() {
    return {
        title: "Manage Vehicles",
        subtitle: "Create, update, and retire fleet inventory with reusable modal forms and wrapped API handling.",
        actions: `<div class="button-row"><button class="button" type="button" id="add-vehicle-button">Add vehicle</button></div>`,
        content: `
            <div id="admin-vehicles-feedback"></div>
            <div class="stats-grid" id="admin-vehicle-stats">
                ${renderMetricCard("Fleet size", "—")}
                ${renderMetricCard("Available units", "—")}
                ${renderMetricCard("Average daily rate", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div class="table-toolbar">
                    <div class="field-group">
                        <label for="admin-vehicle-search">Search fleet</label>
                        <input class="search-input" id="admin-vehicle-search" type="search" placeholder="Search by brand, model, type, or vehicle number">
                    </div>
                    <div class="field-group">
                        <label for="admin-vehicle-filter">Availability</label>
                        <select class="select" id="admin-vehicle-filter">
                            <option value="">All vehicles</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>
                </div>
                <div id="admin-vehicles-table">${renderSpinner("Loading fleet inventory...")}</div>
            </article>
        `,
        async afterRender() {
            const feedback = document.getElementById("admin-vehicles-feedback");
            const stats = document.getElementById("admin-vehicle-stats");
            const table = document.getElementById("admin-vehicles-table");
            const searchInput = document.getElementById("admin-vehicle-search");
            const availabilityFilter = document.getElementById("admin-vehicle-filter");
            const addButton = document.getElementById("add-vehicle-button");

            let vehicles = [];

            async function loadVehicles() {
                const response = await api.get("/vehicles", {
                    fallbackData: cloneFallback(fallbackVehicles)
                });
                vehicles = Array.isArray(response.data) ? response.data : [];

                if (response.fallback) {
                    feedback.innerHTML = renderAlert("Fleet data is currently showing fallback records because the vehicles API could not be reached.", "warning");
                    showToast(response.message, "warning", "Demo mode");
                }

                renderVehicles();
            }

            function renderStats() {
                const availableCount = vehicles.filter((vehicle) => Boolean(vehicle.available)).length;
                const average = vehicles.length
                    ? formatCurrency(vehicles.reduce((sum, vehicle) => sum + Number(vehicle.dailyRate || 0), 0) / vehicles.length)
                    : formatCurrency(0);

                stats.innerHTML = `
                    ${renderMetricCard("Fleet size", String(vehicles.length))}
                    ${renderMetricCard("Available units", String(availableCount))}
                    ${renderMetricCard("Average daily rate", average)}
                `;
            }

            function renderVehicles() {
                const search = (searchInput.value || "").trim().toLowerCase();
                const availability = availabilityFilter.value;

                const filtered = vehicles.filter((vehicle) => {
                    const searchable = `${vehicle.brand || ""} ${vehicle.model || ""} ${vehicle.type || ""} ${vehicle.vehicleNumber || ""}`.toLowerCase();
                    const matchesSearch = !search || searchable.includes(search);
                    const matchesAvailability =
                        !availability ||
                        (availability === "available" && vehicle.available) ||
                        (availability === "unavailable" && !vehicle.available);
                    return matchesSearch && matchesAvailability;
                });

                renderStats();
                table.innerHTML = renderTable(
                    [
                        { label: "Vehicle", render: (vehicle) => `<strong>${vehicle.brand} ${vehicle.model}</strong><br><span class="muted">${vehicle.year} · ${vehicle.type}</span>` },
                        { label: "Vehicle Number", render: (vehicle) => vehicle.vehicleNumber || "Not set" },
                        { label: "Daily Rate", render: (vehicle) => formatCurrency(vehicle.dailyRate) },
                        { label: "Availability", render: (vehicle) => renderBadge(vehicle.available ? "Available" : "Unavailable", vehicle.available ? "success" : "warning") },
                        {
                            label: "Actions",
                            render: (vehicle) => `
                                <div class="button-row">
                                    <button class="ghost-button" type="button" data-edit-vehicle="${vehicle.id}">Edit</button>
                                    <button class="danger-button" type="button" data-delete-vehicle="${vehicle.id}">Delete</button>
                                </div>
                            `
                        }
                    ],
                    filtered,
                    "Add your first vehicle to start managing the fleet from this workspace."
                );
            }

            function openVehicleModal(vehicle) {
                openModal({
                    title: vehicle ? "Edit vehicle" : "Add vehicle",
                    description: vehicle ? "Update the selected fleet record." : "Create a new vehicle entry for the fleet.",
                    content: vehicleFormMarkup(vehicle),
                    submitLabel: vehicle ? "Save changes" : "Create vehicle",
                    wide: true,
                    async onSubmit(formData, close, form) {
                        const modalFeedback = form.querySelector("#vehicle-modal-feedback");
                        const payload = {
                            brand: String(formData.get("brand") || "").trim(),
                            model: String(formData.get("model") || "").trim(),
                            dailyRate: Number(formData.get("dailyRate")),
                            year: Number(formData.get("year")),
                            type: String(formData.get("type") || "").trim(),
                            vehicleNumber: String(formData.get("vehicleNumber") || "").trim()
                        };

                        if (!payload.brand || !payload.model || !payload.type || !payload.vehicleNumber || payload.dailyRate <= 0 || payload.year < 1900) {
                            modalFeedback.innerHTML = renderAlert("All fields are required, daily rate must be positive, and the year must be valid.", "error");
                            return;
                        }

                        try {
                            const response = vehicle
                                ? await api.put(`/vehicles/${vehicle.id}`, payload)
                                : await api.post("/vehicles", payload);

                            const savedVehicle = response.data;
                            vehicles = vehicle
                                ? vehicles.map((entry) => Number(entry.id) === Number(savedVehicle.id) ? savedVehicle : entry)
                                : [savedVehicle, ...vehicles];

                            renderVehicles();
                            close();
                            showToast(vehicle ? "Vehicle updated successfully." : "Vehicle created successfully.", "success", "Fleet updated");
                        } catch (error) {
                            modalFeedback.innerHTML = renderAlert(error.message || "Vehicle save failed.", "error");
                        }
                    }
                });
            }

            table.addEventListener("click", (event) => {
                const editButton = event.target.closest("[data-edit-vehicle]");
                const deleteButton = event.target.closest("[data-delete-vehicle]");

                if (editButton) {
                    const vehicle = vehicles.find((entry) => Number(entry.id) === Number(editButton.dataset.editVehicle));
                    if (vehicle) openVehicleModal(vehicle);
                }

                if (deleteButton) {
                    const vehicle = vehicles.find((entry) => Number(entry.id) === Number(deleteButton.dataset.deleteVehicle));
                    if (!vehicle) return;

                    openModal({
                        title: "Delete vehicle",
                        description: "This will remove the vehicle record from the backend fleet list.",
                        content: `<div id="vehicle-delete-feedback"></div><p>Delete <strong>${vehicle.brand} ${vehicle.model}</strong> with vehicle number <strong>${vehicle.vehicleNumber}</strong>?</p>`,
                        submitLabel: "Delete vehicle",
                        cancelLabel: "Keep vehicle",
                        async onSubmit(_, close, form) {
                            try {
                                await api.delete(`/vehicles/${vehicle.id}`);
                                vehicles = vehicles.filter((entry) => Number(entry.id) !== Number(vehicle.id));
                                renderVehicles();
                                close();
                                showToast("Vehicle deleted successfully.", "success", "Fleet updated");
                            } catch (error) {
                                const feedbackTarget = form.querySelector("#vehicle-delete-feedback");
                                feedbackTarget.innerHTML = renderAlert(error.message || "Vehicle deletion failed.", "error");
                            }
                        }
                    });
                }
            });

            searchInput.addEventListener("input", renderVehicles);
            availabilityFilter.addEventListener("change", renderVehicles);
            addButton.addEventListener("click", () => openVehicleModal());

            await loadVehicles();
        }
    };
}
