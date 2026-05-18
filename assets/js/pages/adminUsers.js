import { api } from "../api.js";
import { cloneFallback, fallbackAdmins, fallbackCustomers, fallbackDrivers } from "../demo-data.js";
import { openModal, renderAlert, renderMetricCard, renderSpinner, renderTable, showToast } from "../components/ui.js";

const roleConfig = {
    customers: {
        label: "Customer",
        endpoint: "/customers",
        createTitle: "Create customer",
        fields: (user = {}) => `
            <div id="user-modal-feedback"></div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="name">Name</label>
                    <input class="field" id="name" name="name" value="${user.name || user.username || ""}" required>
                </div>
                <div class="field-group">
                    <label for="email">Email</label>
                    <input class="field" id="email" name="email" type="email" value="${user.email || ""}" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="password">Password</label>
                    <input class="field" id="password" name="password" type="password" minlength="6" placeholder="${user.id ? "Required for updates as well" : "Minimum 6 characters"}" required>
                </div>
                <div class="field-group">
                    <label for="phoneNumber">Phone number</label>
                    <input class="field" id="phoneNumber" name="phoneNumber" value="${user.phoneNumber || ""}" required>
                </div>
            </div>
            <div class="field-group">
                <label for="nationalId">National ID</label>
                <input class="field" id="nationalId" name="nationalId" value="${user.nationalId || ""}" required>
            </div>
        `,
        payload: (formData) => ({
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
            phoneNumber: String(formData.get("phoneNumber") || "").trim(),
            nationalId: String(formData.get("nationalId") || "").trim()
        }),
        columns: [
            { label: "Customer", render: (user) => `<strong>${user.name || user.username}</strong><br><span class="muted">${user.email}</span>` },
            { label: "Phone", render: (user) => user.phoneNumber || "Not set" },
            { label: "National ID", render: (user) => user.nationalId || "Not set" }
        ]
    },
    drivers: {
        label: "Driver",
        endpoint: "/drivers",
        createTitle: "Create driver",
        fields: (user = {}) => `
            <div id="user-modal-feedback"></div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="username">Username</label>
                    <input class="field" id="username" name="username" value="${user.username || ""}" required>
                </div>
                <div class="field-group">
                    <label for="email">Email</label>
                    <input class="field" id="email" name="email" type="email" value="${user.email || ""}" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="password">Password</label>
                    <input class="field" id="password" name="password" type="password" minlength="6" placeholder="${user.id ? "Required for updates as well" : "Minimum 6 characters"}" required>
                </div>
                <div class="field-group">
                    <label for="phoneNumber">Phone number</label>
                    <input class="field" id="phoneNumber" name="phoneNumber" value="${user.phoneNumber || ""}" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="licenseNumber">License number</label>
                    <input class="field" id="licenseNumber" name="licenseNumber" value="${user.licenseNumber || ""}" required>
                </div>
                <div class="field-group">
                    <label for="licenseType">License type</label>
                    <input class="field" id="licenseType" name="licenseType" value="${user.licenseType || ""}" required>
                </div>
            </div>
        `,
        payload: (formData) => ({
            username: String(formData.get("username") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
            phoneNumber: String(formData.get("phoneNumber") || "").trim(),
            licenseNumber: String(formData.get("licenseNumber") || "").trim(),
            licenseType: String(formData.get("licenseType") || "").trim()
        }),
        columns: [
            { label: "Driver", render: (user) => `<strong>${user.username}</strong><br><span class="muted">${user.email}</span>` },
            { label: "Phone", render: (user) => user.phoneNumber || "Not set" },
            { label: "License", render: (user) => `${user.licenseNumber || "—"} · ${user.licenseType || "—"}` }
        ]
    },
    admins: {
        label: "Admin",
        endpoint: "/admins",
        createTitle: "Create admin",
        fields: (user = {}) => `
            <div id="user-modal-feedback"></div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="username">Username</label>
                    <input class="field" id="username" name="username" value="${user.username || ""}" required>
                </div>
                <div class="field-group">
                    <label for="email">Email</label>
                    <input class="field" id="email" name="email" type="email" value="${user.email || ""}" required>
                </div>
            </div>
            <div class="form-grid">
                <div class="field-group">
                    <label for="password">Password</label>
                    <input class="field" id="password" name="password" type="password" minlength="6" placeholder="${user.id ? "Required for updates as well" : "Minimum 6 characters"}" required>
                </div>
                <div class="field-group">
                    <label for="phoneNumber">Phone number</label>
                    <input class="field" id="phoneNumber" name="phoneNumber" value="${user.phoneNumber || ""}" required>
                </div>
            </div>
            <div class="field-group">
                <label for="accessLevel">Access level</label>
                <input class="field" id="accessLevel" name="accessLevel" value="${user.accessLevel || ""}" required>
            </div>
        `,
        payload: (formData) => ({
            username: String(formData.get("username") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            password: String(formData.get("password") || ""),
            phoneNumber: String(formData.get("phoneNumber") || "").trim(),
            accessLevel: String(formData.get("accessLevel") || "").trim()
        }),
        columns: [
            { label: "Admin", render: (user) => `<strong>${user.username}</strong><br><span class="muted">${user.email}</span>` },
            { label: "Phone", render: (user) => user.phoneNumber || "Not set" },
            { label: "Access", render: (user) => user.accessLevel || "Standard" }
        ]
    }
};

export function createAdminUsersPage() {
    return {
        title: "Manage Users",
        subtitle: "View every user group and create, edit, or remove customers, drivers, and admins using reusable role-aware forms.",
        actions: `<div class="button-row"><button class="button" type="button" id="add-user-button">Add user</button></div>`,
        content: `
            <div id="admin-users-feedback"></div>
            <div class="stats-grid" id="admin-user-stats">
                ${renderMetricCard("Customers", "—")}
                ${renderMetricCard("Drivers", "—")}
                ${renderMetricCard("Admins", "—")}
            </div>

            <article class="content-card" style="margin-top: 1rem;">
                <div class="table-toolbar">
                    <div class="segmented" role="tablist" aria-label="User role tabs">
                        <button class="active" type="button" data-user-tab="customers">Customers</button>
                        <button type="button" data-user-tab="drivers">Drivers</button>
                        <button type="button" data-user-tab="admins">Admins</button>
                    </div>
                    <div class="field-group">
                        <label for="user-search">Search selected group</label>
                        <input class="search-input" id="user-search" type="search" placeholder="Search by name, email, or role-specific data">
                    </div>
                </div>
                <div id="admin-users-table">${renderSpinner("Loading user groups...")}</div>
            </article>
        `,
        async afterRender() {
            const feedback = document.getElementById("admin-users-feedback");
            const stats = document.getElementById("admin-user-stats");
            const table = document.getElementById("admin-users-table");
            const addButton = document.getElementById("add-user-button");
            const searchInput = document.getElementById("user-search");
            const tabs = Array.from(document.querySelectorAll("[data-user-tab]"));

            const state = {
                tab: "customers",
                customers: [],
                drivers: [],
                admins: []
            };

            async function loadUsers() {
                const [customersResponse, driversResponse, adminsResponse] = await Promise.all([
                    api.get("/customers", { fallbackData: cloneFallback(fallbackCustomers) }),
                    api.get("/drivers", { fallbackData: cloneFallback(fallbackDrivers) }),
                    api.get("/admins", { fallbackData: cloneFallback(fallbackAdmins) })
                ]);

                state.customers = Array.isArray(customersResponse.data) ? customersResponse.data : [];
                state.drivers = Array.isArray(driversResponse.data) ? driversResponse.data : [];
                state.admins = Array.isArray(adminsResponse.data) ? adminsResponse.data : [];

                if (customersResponse.fallback || driversResponse.fallback || adminsResponse.fallback) {
                    feedback.innerHTML = renderAlert("One or more user endpoints failed, so demo fallback records are being shown.", "warning");
                    showToast("User data is partially running in demo mode.", "warning", "Demo mode");
                }

                renderStats();
                renderUsers();
            }

            function renderStats() {
                stats.innerHTML = `
                    ${renderMetricCard("Customers", String(state.customers.length))}
                    ${renderMetricCard("Drivers", String(state.drivers.length))}
                    ${renderMetricCard("Admins", String(state.admins.length))}
                `;
            }

            function getCurrentRecords() {
                return state[state.tab] || [];
            }

            function renderUsers() {
                const config = roleConfig[state.tab];
                const search = (searchInput.value || "").trim().toLowerCase();
                const records = getCurrentRecords().filter((record) => {
                    const searchable = Object.values(record).filter((value) => typeof value === "string").join(" ").toLowerCase();
                    return !search || searchable.includes(search);
                });

                table.innerHTML = renderTable(
                    [
                        ...config.columns,
                        {
                            label: "Actions",
                            render: (record) => `
                                <div class="button-row">
                                    <button class="ghost-button" type="button" data-edit-user="${record.id}">Edit</button>
                                    <button class="danger-button" type="button" data-delete-user="${record.id}">Delete</button>
                                </div>
                            `
                        }
                    ],
                    records,
                    `No ${config.label.toLowerCase()} records match the current filters.`
                );
            }

            function openUserModal(record) {
                const config = roleConfig[state.tab];
                openModal({
                    title: record ? `Edit ${config.label.toLowerCase()}` : config.createTitle,
                    description: "The backend currently requires password input on updates as well as creates.",
                    content: config.fields(record),
                    submitLabel: record ? "Save changes" : `Create ${config.label.toLowerCase()}`,
                    wide: true,
                    async onSubmit(formData, close, form) {
                        const modalFeedback = form.querySelector("#user-modal-feedback");
                        const payload = config.payload(formData);
                        const hasBlankField = Object.values(payload).some((value) => value === "");

                        if (hasBlankField) {
                            modalFeedback.innerHTML = renderAlert("Every field is required for this role form.", "error");
                            return;
                        }

                        try {
                            const response = record
                                ? await api.put(`${config.endpoint}/${record.id}`, payload)
                                : await api.post(config.endpoint, payload);
                            const saved = response.data;
                            state[state.tab] = record
                                ? state[state.tab].map((entry) => Number(entry.id) === Number(saved.id) ? saved : entry)
                                : [saved, ...state[state.tab]];
                            renderStats();
                            renderUsers();
                            close();
                            showToast(`${config.label} saved successfully.`, "success", "Users updated");
                        } catch (error) {
                            modalFeedback.innerHTML = renderAlert(error.message || "User save failed.", "error");
                        }
                    }
                });
            }

            table.addEventListener("click", async (event) => {
                const editButton = event.target.closest("[data-edit-user]");
                const deleteButton = event.target.closest("[data-delete-user]");
                const records = getCurrentRecords();
                const config = roleConfig[state.tab];

                if (editButton) {
                    const record = records.find((entry) => Number(entry.id) === Number(editButton.dataset.editUser));
                    if (record) openUserModal(record);
                }

                if (deleteButton) {
                    const record = records.find((entry) => Number(entry.id) === Number(deleteButton.dataset.deleteUser));
                    if (!record) return;

                    openModal({
                        title: `Delete ${config.label.toLowerCase()}`,
                        description: "This action removes the selected user record.",
                        content: `<p>Delete <strong>${record.name || record.username || record.email}</strong> from the ${config.label.toLowerCase()} list?</p>`,
                        submitLabel: `Delete ${config.label.toLowerCase()}`,
                        cancelLabel: "Keep user",
                        async onSubmit(_, close, form) {
                            try {
                                await api.delete(`${config.endpoint}/${record.id}`);
                                state[state.tab] = state[state.tab].filter((entry) => Number(entry.id) !== Number(record.id));
                                renderStats();
                                renderUsers();
                                close();
                                showToast(`${config.label} deleted successfully.`, "success", "Users updated");
                            } catch (error) {
                                const modalFeedback = form.querySelector(".modal-body");
                                modalFeedback.insertAdjacentHTML("afterbegin", renderAlert(error.message || "User deletion failed.", "error"));
                            }
                        }
                    });
                }
            });

            tabs.forEach((tab) => {
                tab.addEventListener("click", () => {
                    state.tab = tab.dataset.userTab;
                    tabs.forEach((button) => button.classList.toggle("active", button === tab));
                    renderUsers();
                });
            });

            addButton.addEventListener("click", () => openUserModal());
            searchInput.addEventListener("input", renderUsers);

            await loadUsers();
        }
    };
}
