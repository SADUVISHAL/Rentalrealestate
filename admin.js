/**
 * Rental Real Estate - Admin Dashboard Controller
 */

class AdminPanel {
    constructor() {
        this.activeTab = "admin-dashboard-pane";
        this.isInitialized = false;
    }

    init() {
        if (!window.app) return;

        // Setup Tab Menu Clicks
        this.initTabMenu();

        // Setup Listing Forms Event Listeners (Add/Edit Flat & PG)
        this.initFormSubmissions();

        // Renders
        this.refreshDashboardData();

        this.isInitialized = true;
    }

    initTabMenu() {
        const tabButtons = document.querySelectorAll(".admin-menu-btn");
        tabButtons.forEach(btn => {
            // Remove previous event listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener("click", () => {
                const targetTab = newBtn.getAttribute("data-tab");
                this.changeTab(targetTab);
            });
        });
    }

    changeTab(tabId) {
        // Toggle Active buttons
        const tabButtons = document.querySelectorAll(".admin-menu-btn");
        tabButtons.forEach(btn => {
            btn.classList.remove("active");
            if (btn.getAttribute("data-tab") === tabId) {
                btn.classList.add("active");
            }
        });

        // Toggle Active Content Pane
        const panes = document.querySelectorAll(".admin-content-pane");
        panes.forEach(pane => {
            pane.classList.remove("active");
        });

        const targetPane = document.getElementById(tabId);
        if (targetPane) {
            targetPane.classList.add("active");
            this.activeTab = tabId;

            // Trigger specific renders on tab load
            if (tabId === "admin-flats-pane") {
                this.renderFlatsTable();
                this.hideAddFlatForm();
            } else if (tabId === "admin-pgs-pane") {
                this.renderPGsTable();
                this.hideAddPGForm();
            } else if (tabId === "admin-bookings-pane") {
                this.renderBookingsTable();
            } else if (tabId === "admin-inbox-pane") {
                this.renderInboxTable();
            } else if (tabId === "admin-dashboard-pane") {
                this.renderOverviewDetails();
            }
        }
    }

    refreshDashboardData() {
        // Update stats counters
        const flatsCount = document.getElementById("stat-total-flats");
        const pgsCount = document.getElementById("stat-total-pgs");
        const bookingsCount = document.getElementById("stat-total-bookings");
        const inboxCount = document.getElementById("stat-total-inbox");

        if (flatsCount) flatsCount.textContent = window.app.flats.length;
        if (pgsCount) pgsCount.textContent = window.app.pgs.length;
        if (bookingsCount) bookingsCount.textContent = window.app.bookings.length;
        if (inboxCount) inboxCount.textContent = window.app.inbox.length;

        // Update Notification Badges on Admin Sidebar
        this.updateBadges();

        // Rerender active pane table if needed
        if (this.activeTab === "admin-flats-pane") this.renderFlatsTable();
        if (this.activeTab === "admin-pgs-pane") this.renderPGsTable();
        if (this.activeTab === "admin-bookings-pane") this.renderBookingsTable();
        if (this.activeTab === "admin-inbox-pane") this.renderInboxTable();
        if (this.activeTab === "admin-dashboard-pane") this.renderOverviewDetails();
    }

    updateBadges() {
        const bookingBadge = document.getElementById("booking-badge-count");
        const inboxBadge = document.getElementById("inbox-badge-count");

        // Count pending bookings
        const pendingBookings = window.app.bookings.filter(b => b.status === "Pending").length;
        if (bookingBadge) {
            if (pendingBookings > 0) {
                bookingBadge.textContent = pendingBookings;
                bookingBadge.style.display = "block";
            } else {
                bookingBadge.style.display = "none";
            }
        }

        // Count unread inbox messages
        const unreadInbox = window.app.inbox.filter(i => i.status === "Unread").length;
        if (inboxBadge) {
            if (unreadInbox > 0) {
                inboxBadge.textContent = unreadInbox;
                inboxBadge.style.display = "block";
            } else {
                inboxBadge.style.display = "none";
            }
        }
    }

    renderOverviewDetails() {
        // Load recent bookings limit 5
        const bookingsTable = document.getElementById("dashboard-recent-bookings-table");
        if (bookingsTable) {
            const tbody = bookingsTable.querySelector("tbody");
            tbody.innerHTML = "";
            const recent = window.app.bookings.slice(0, 5);

            if (recent.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--neutral-600)">No recent bookings</td></tr>`;
            } else {
                recent.forEach(bk => {
                    const statusClass = bk.status.toLowerCase().replace(" ", "");
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${bk.name}</strong></td>
                            <td>${bk.service}</td>
                            <td>${bk.date}</td>
                            <td><span class="status-badge status-${statusClass}">${bk.status}</span></td>
                        </tr>
                    `;
                });
            }
        }

        // Load recent inbox limit 5
        const inboxTable = document.getElementById("dashboard-recent-inbox-table");
        if (inboxTable) {
            const tbody = inboxTable.querySelector("tbody");
            tbody.innerHTML = "";
            const recent = window.app.inbox.slice(0, 5);

            if (recent.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--neutral-600)">No messages</td></tr>`;
            } else {
                recent.forEach(msg => {
                    const viewAction = `<button class="btn btn-secondary" onclick="admin.changeTab('admin-inbox-pane')" style="padding:4px 8px; font-size:0.75rem;">View</button>`;
                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${msg.name}</strong></td>
                            <td>${msg.subject}</td>
                            <td>${viewAction}</td>
                        </tr>
                    `;
                });
            }
        }
    }

    // ==========================================================================
    // FLATS CRUD
    // ==========================================================================
    renderFlatsTable() {
        const table = document.getElementById("admin-flats-table");
        if (!table) return;

        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";

        if (window.app.flats.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--neutral-600);">No flat listings in catalog. Add one now!</td></tr>`;
            return;
        }

        window.app.flats.forEach(flat => {
            const row = document.createElement("tr");
            const availText = flat.available ? "Available" : "Rented";
            const availClass = flat.available ? "status-completed" : "status-unread";

            row.innerHTML = `
                <td><img src="${flat.image || 'images/flat_1.png'}" class="admin-thumb" alt="Thumb"></td>
                <td><strong>${flat.title}</strong></td>
                <td>${flat.location}</td>
                <td>₹${flat.rent.toLocaleString('en-IN')}</td>
                <td>${flat.bhk}</td>
                <td><span class="status-badge ${availClass}">${availText}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" title="Edit" onclick="admin.editFlat('${flat.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Delete" onclick="admin.deleteFlat('${flat.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showAddFlatForm() {
        document.getElementById("add-flat-form-container").style.display = "block";
        document.getElementById("flat-form-title").textContent = "Add Flat Listing";
        document.getElementById("admin-add-flat-form").reset();
        document.getElementById("edit-flat-id").value = "";

        document.getElementById("add-flat-form-container").scrollIntoView({ behavior: "smooth" });
    }

    hideAddFlatForm() {
        document.getElementById("add-flat-form-container").style.display = "none";
        document.getElementById("admin-add-flat-form").reset();
        document.getElementById("edit-flat-id").value = "";
    }

    editFlat(id) {
        const flat = window.app.flats.find(f => f.id === id);
        if (!flat) return;

        document.getElementById("add-flat-form-container").style.display = "block";
        document.getElementById("flat-form-title").textContent = "Edit Flat Listing";

        // Populate inputs
        document.getElementById("edit-flat-id").value = flat.id;
        document.getElementById("flat-title-in").value = flat.title;
        document.getElementById("flat-location-in").value = flat.location;
        document.getElementById("flat-rent-in").value = flat.rent;
        document.getElementById("flat-area-in").value = flat.area;
        document.getElementById("flat-bhk-in").value = flat.bhk;
        document.getElementById("flat-furnishing-in").value = flat.furnishing;
        document.getElementById("flat-image-in").value = flat.image || "";
        document.getElementById("flat-amenities-in").value = flat.amenities.join(", ");
        document.getElementById("flat-desc-in").value = flat.desc;
        document.getElementById("flat-avail-in").checked = flat.available;

        document.getElementById("add-flat-form-container").scrollIntoView({ behavior: "smooth" });
    }

    deleteFlat(id) {
        if (confirm("Are you sure you want to delete this flat listing?")) {
            const updated = window.app.flats.filter(f => f.id !== id);
            window.app.saveData("flats", updated);
            window.app.showToast("Flat listing deleted successfully", "success");
            window.app.applyFlatsFilter(); // Update flats view
            this.refreshDashboardData();
        }
    }

    // ==========================================================================
    // PGS CRUD
    // ==========================================================================
    renderPGsTable() {
        const table = document.getElementById("admin-pgs-table");
        if (!table) return;

        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";

        if (window.app.pgs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--neutral-600);">No PG accommodations in catalog. Add one now!</td></tr>`;
            return;
        }

        window.app.pgs.forEach(pg => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${pg.image || 'images/pg_1.png'}" class="admin-thumb" alt="Thumb"></td>
                <td><strong>${pg.name}</strong></td>
                <td>${pg.location}</td>
                <td>₹${pg.rent.toLocaleString('en-IN')}</td>
                <td>${pg.gender}</td>
                <td>${pg.occupancy}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" title="Edit" onclick="admin.editPG('${pg.id}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Delete" onclick="admin.deletePG('${pg.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showAddPGForm() {
        document.getElementById("add-pg-form-container").style.display = "block";
        document.getElementById("pg-form-title").textContent = "Add PG Listing";
        document.getElementById("admin-add-pg-form").reset();
        document.getElementById("edit-pg-id").value = "";

        document.getElementById("add-pg-form-container").scrollIntoView({ behavior: "smooth" });
    }

    hideAddPGForm() {
        document.getElementById("add-pg-form-container").style.display = "none";
        document.getElementById("admin-add-pg-form").reset();
        document.getElementById("edit-pg-id").value = "";
    }

    editPG(id) {
        const pg = window.app.pgs.find(p => p.id === id);
        if (!pg) return;

        document.getElementById("add-pg-form-container").style.display = "block";
        document.getElementById("pg-form-title").textContent = "Edit PG Listing";

        // Populate inputs
        document.getElementById("edit-pg-id").value = pg.id;
        document.getElementById("pg-name-in").value = pg.name;
        document.getElementById("pg-location-in").value = pg.location;
        document.getElementById("pg-rent-in").value = pg.rent;
        document.getElementById("pg-gender-in").value = pg.gender;
        document.getElementById("pg-occupancy-in").value = pg.occupancy;
        document.getElementById("pg-food-in").checked = pg.food;
        document.getElementById("pg-ac-in").value = pg.ac;
        document.getElementById("pg-image-in").value = pg.image || "";
        document.getElementById("pg-facilities-in").value = pg.facilities.join(", ");
        document.getElementById("pg-desc-in").value = pg.desc;

        document.getElementById("add-pg-form-container").scrollIntoView({ behavior: "smooth" });
    }

    deletePG(id) {
        if (confirm("Are you sure you want to delete this PG Listing?")) {
            const updated = window.app.pgs.filter(p => p.id !== id);
            window.app.saveData("pgs", updated);
            window.app.showToast("PG accommodation deleted successfully", "success");
            window.app.applyPGsFilter(); // Update PGs view
            this.refreshDashboardData();
        }
    }

    // ==========================================================================
    // FORMS AND CRUD POST HANDLERS
    // ==========================================================================
    initFormSubmissions() {
        // Flat Form Submit
        const flatForm = document.getElementById("admin-add-flat-form");
        if (flatForm) {
            // Replace to clean listeners
            const newForm = flatForm.cloneNode(true);
            flatForm.parentNode.replaceChild(newForm, flatForm);

            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.saveFlatData();
            });
        }

        // PG Form Submit
        const pgForm = document.getElementById("admin-add-pg-form");
        if (pgForm) {
            // Replace to clean listeners
            const newForm = pgForm.cloneNode(true);
            pgForm.parentNode.replaceChild(newForm, pgForm);

            newForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.savePGData();
            });
        }
    }

    saveFlatData() {
        const flatId = document.getElementById("edit-flat-id").value;
        const title = document.getElementById("flat-title-in").value.trim();
        const location = document.getElementById("flat-location-in").value.trim();
        const rent = parseInt(document.getElementById("flat-rent-in").value);
        const area = parseInt(document.getElementById("flat-area-in").value);
        const bhk = document.getElementById("flat-bhk-in").value;
        const furnishing = document.getElementById("flat-furnishing-in").value;
        const image = document.getElementById("flat-image-in").value.trim() || "images/flat_1.png";

        const amenitiesInput = document.getElementById("flat-amenities-in").value;
        const amenities = amenitiesInput ? amenitiesInput.split(",").map(a => a.trim()).filter(a => a) : ["WiFi"];

        const desc = document.getElementById("flat-desc-in").value.trim();
        const available = document.getElementById("flat-avail-in").checked;

        if (flatId) {
            // EDIT MODE
            const idx = window.app.flats.findIndex(f => f.id === flatId);
            if (idx > -1) {
                window.app.flats[idx] = { id: flatId, title, location, rent, area, bhk, furnishing, image, available, amenities, desc };
                window.app.saveData("flats", window.app.flats);
                window.app.showToast("Flat Listing updated successfully!", "success");
            }
        } else {
            // ADD MODE
            const newFlat = {
                id: `flat-${Date.now()}`,
                title, location, rent, area, bhk, furnishing, image, available, amenities, desc
            };
            const updated = [...window.app.flats, newFlat];
            window.app.saveData("flats", updated);
            window.app.showToast("New Flat Listing added successfully!", "success");
        }

        this.hideAddFlatForm();
        window.app.applyFlatsFilter(); // Update client view
        this.refreshDashboardData();
    }

    savePGData() {
        const pgId = document.getElementById("edit-pg-id").value;
        const name = document.getElementById("pg-name-in").value.trim();
        const location = document.getElementById("pg-location-in").value.trim();
        const rent = parseInt(document.getElementById("pg-rent-in").value);
        const gender = document.getElementById("pg-gender-in").value;
        const occupancy = document.getElementById("pg-occupancy-in").value;
        const food = document.getElementById("pg-food-in").checked;
        const ac = document.getElementById("pg-ac-in").value;
        const image = document.getElementById("pg-image-in").value.trim() || "images/pg_1.png";

        const facilitiesInput = document.getElementById("pg-facilities-in").value;
        const facilities = facilitiesInput ? facilitiesInput.split(",").map(f => f.trim()).filter(f => f) : ["WiFi", "Laundry"];

        const desc = document.getElementById("pg-desc-in").value.trim();

        if (pgId) {
            // EDIT MODE
            const idx = window.app.pgs.findIndex(p => p.id === pgId);
            if (idx > -1) {
                window.app.pgs[idx] = { id: pgId, name, location, rent, gender, occupancy, food, ac, image, facilities, desc };
                window.app.saveData("pgs", window.app.pgs);
                window.app.showToast("PG Listing updated successfully!", "success");
            }
        } else {
            // ADD MODE
            const newPG = {
                id: `pg-${Date.now()}`,
                name, location, rent, gender, occupancy, food, ac, image, facilities, desc
            };
            const updated = [...window.app.pgs, newPG];
            window.app.saveData("pgs", updated);
            window.app.showToast("New PG Listing added successfully!", "success");
        }

        this.hideAddPGForm();
        window.app.applyPGsFilter(); // Update client view
        this.refreshDashboardData();
    }

    // ==========================================================================
    // BOOKINGS OPERATIONS
    // ==========================================================================
    renderBookingsTable() {
        const table = document.getElementById("admin-bookings-table");
        if (!table) return;

        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";

        if (window.app.bookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--neutral-600);">No service booking requests yet.</td></tr>`;
            return;
        }

        window.app.bookings.forEach(bk => {
            const row = document.createElement("tr");
            const statusClass = bk.status.toLowerCase().replace(" ", "");

            row.innerHTML = `
                <td><strong>${bk.name}</strong></td>
                <td>
                    <i class="fa-solid fa-phone" style="font-size:0.8rem;"></i> ${bk.phone}<br>
                    <i class="fa-solid fa-envelope" style="font-size:0.8rem;"></i> ${bk.email}
                </td>
                <td><strong>${bk.service}</strong></td>
                <td>${bk.date}</td>
                <td><span style="font-size:0.85rem; color:var(--neutral-600); font-style:italic;">${bk.message}</span></td>
                <td><span class="status-badge status-${statusClass}">${bk.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" title="Mark In Progress" onclick="admin.updateBookingStatus('${bk.id}', 'In Progress')">
                            <i class="fa-solid fa-spinner"></i>
                        </button>
                        <button class="action-btn btn-success" title="Mark Completed" onclick="admin.updateBookingStatus('${bk.id}', 'Completed')">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Delete" onclick="admin.deleteBooking('${bk.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateBookingStatus(id, newStatus) {
        const idx = window.app.bookings.findIndex(b => b.id === id);
        if (idx > -1) {
            window.app.bookings[idx].status = newStatus;
            window.app.saveData("bookings", window.app.bookings);
            window.app.showToast(`Booking marked as ${newStatus}`, "success");
            this.refreshDashboardData();
        }
    }

    deleteBooking(id) {
        if (confirm("Are you sure you want to delete this booking request?")) {
            const updated = window.app.bookings.filter(b => b.id !== id);
            window.app.saveData("bookings", updated);
            window.app.showToast("Booking request deleted", "success");
            this.refreshDashboardData();
        }
    }

    // ==========================================================================
    // INBOX OPERATIONS
    // ==========================================================================
    renderInboxTable() {
        const table = document.getElementById("admin-inbox-table");
        if (!table) return;

        const tbody = table.querySelector("tbody");
        tbody.innerHTML = "";

        if (window.app.inbox.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--neutral-600);">No contact inquiries inbox yet.</td></tr>`;
            return;
        }

        window.app.inbox.forEach(msg => {
            const row = document.createElement("tr");
            const statusClass = msg.status.toLowerCase();

            row.innerHTML = `
                <td><strong>${msg.name}</strong></td>
                <td>
                    <i class="fa-solid fa-phone" style="font-size:0.8rem;"></i> ${msg.phone}<br>
                    <i class="fa-solid fa-envelope" style="font-size:0.8rem;"></i> ${msg.email}
                </td>
                <td><strong>${msg.subject}</strong></td>
                <td><span style="font-size:0.85rem; color:var(--neutral-600);">${msg.message}</span></td>
                <td><span class="status-badge status-${statusClass}">${msg.status}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-success" title="Mark Read/Responded" onclick="admin.updateInboxStatus('${msg.id}', 'Responded')">
                            <i class="fa-solid fa-envelope-open"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Delete Message" onclick="admin.deleteInboxMessage('${msg.id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateInboxStatus(id, newStatus) {
        const idx = window.app.inbox.findIndex(i => i.id === id);
        if (idx > -1) {
            window.app.inbox[idx].status = newStatus;
            window.app.saveData("inbox", window.app.inbox);
            window.app.showToast(`Inquiry marked as ${newStatus}`, "success");
            this.refreshDashboardData();
        }
    }

    deleteInboxMessage(id) {
        if (confirm("Delete this contact inquiry permanently?")) {
            const updated = window.app.inbox.filter(i => i.id !== id);
            window.app.saveData("inbox", updated);
            window.app.showToast("Inquiry deleted", "success");
            this.refreshDashboardData();
        }
    }
}

// Global Admin Initialization
const admin = new AdminPanel();
window.admin = admin;
