/**
 * Rental Real Estate - Core Client-Side Logic
 */

// Default Seed Data
const defaultFlats = [
    {
        id: "flat-101",
        title: "Modern 2 BHK Flat in Singapur Township, Pocharam",
        location: "Singapur Township, Pocharam",
        rent: 12000,
        bhk: "2 BHK",
        area: 900,
        furnishing: "Semi Furnished",
        image: "images/flat_1.png",
        images: ["images/flat_1.png", "images/flat_2.png", "images/flat_3.png"],
        available: true,
        amenities: ["WiFi", "Parking Available", "Water Backup", "CCTV Security"],
        desc: "Comfortable flat located near schools and markets. Features 2 spacious bedrooms, a modern modular kitchen, and a private balcony. Ideal for families looking for a peaceful environment."
    },
    {
        id: "flat-102",
        title: "Cozy 1 BHK Apartment in Singapur Township, Pocharam",
        location: "Singapur Township, Pocharam",
        rent: 8000,
        bhk: "1 BHK",
        area: 550,
        furnishing: "Fully Furnished",
        image: "images/hero_bg.png",
        images: ["images/hero_bg.png", "images/flat_2.png", "images/flat_3.png"],
        available: true,
        amenities: ["WiFi", "Lift Access", "AC", "Power Backup"],
        desc: "Fully furnished 1 BHK close to the metro station. Includes double bed, sofa set, modular wardrobe, split air conditioner, and double-door refrigerator. Ready to move in."
    },
    {
        id: "flat-103",
        title: "Premium 3 BHK Luxury Flat in Singapur Township, Pocharam",
        location: "Singapur Township, Pocharam",
        rent: 35000,
        bhk: "3 BHK",
        area: 1600,
        furnishing: "Fully Furnished",
        image: "images/flat_1.png",
        images: ["images/flat_1.png", "images/flat_3.png", "images/flat_2.png"],
        available: true,
        amenities: ["WiFi", "Parking Available", "Gym Access", "Swimming Pool", "24/7 Security"],
        desc: "Spacious 3 BHK luxury apartment with high-end modern interiors, modular kitchen with chimney, wardrobes in all rooms, and a premium club house access. Close to IT corridors."
    }
];

const defaultPGs = [
    {
        id: "pg-201",
        name: "Royal Nest Boys PG",
        location: "Singapur Township, Pocharam",
        rent: 6500,
        gender: "Male",
        occupancy: "Double Sharing",
        food: true,
        ac: "AC",
        image: "images/pg_1.png",
        images: ["images/pg_1.png", "images/pg_2.png", "images/pg_3.png"],
        facilities: ["WiFi", "Food", "Laundry", "Security", "Power Backup"],
        desc: "Premium co-living PG accommodation for boys. Clean rooms, high speed fiber internet, three times nutritious home-style food, and professional laundry cleaning facility included in rent."
    },
    {
        id: "pg-202",
        name: "Comfort Stays Girls PG",
        location: "Singapur Township, Pocharam",
        rent: 8500,
        gender: "Female",
        occupancy: "Single Sharing",
        food: true,
        ac: "AC",
        image: "images/pg_1.png",
        images: ["images/pg_1.png", "images/pg_3.png", "images/pg_2.png"],
        facilities: ["WiFi", "Food", "Laundry", "CCTV Security", "Geyser"],
        desc: "Safe and secure PG for girls near major tech parks. Well ventilated single rooms with private bathrooms, healthy food menu, biometric lock, and daily housekeeping."
    },
    {
        id: "pg-203",
        name: "Elite Co-living Unisex PG",
        location: "Singapur Township, Pocharam",
        rent: 7000,
        gender: "Unisex",
        occupancy: "Double Sharing",
        food: false,
        ac: "Non-AC",
        image: "images/pg_1.png",
        images: ["images/pg_1.png", "images/pg_2.png", "images/pg_3.png"],
        facilities: ["WiFi", "Laundry", "Security", "Power Backup", "Gym"],
        desc: "Modern co-living space for male and female working professionals. Common kitchen area, high-speed WiFi, gym access, and a relaxing common terrace area."
    }
];

class RealEstateApp {
    constructor() {
        this.flats = [];
        this.pgs = [];
        this.bookings = [];
        this.inbox = [];
        this.activeSection = "home-section";
        this.whatsappNumber = "917730001446";
        this.cardImageIndices = {};

        this.init();
    }

    init() {
        // Initialize Data from LocalStorage or Load Seed
        this.loadLocalStorage();

        // Attach SPA Navigation Events
        this.initNavigation();

        // Attach Filters & Sorting Event Listeners
        this.initFlatsFilters();
        this.initPGsFilters();

        // Attach Forms Event Handlers
        this.initForms();

        // Attach Detail Modal Closers
        this.initModal();

        // Initial Renders
        this.renderFlats(this.flats);
        this.renderPGs(this.pgs);

        // Track and notify if URL contains hash for navigation
        this.handleHashRoute();
        window.addEventListener("hashchange", () => this.handleHashRoute());
    }

    loadLocalStorage() {
        // Load Flats
        const storedFlats = localStorage.getItem("rre_flats");
        if (storedFlats) {
            this.flats = JSON.parse(storedFlats);
        } else {
            this.flats = [...defaultFlats];
        }
        // Migration: Ensure location is fixed and images array exists
        this.flats = this.flats.map(flat => {
            flat.location = "Singapur Township, Pocharam";
            if (!flat.images || !Array.isArray(flat.images)) {
                flat.images = [flat.image || "images/flat_1.png"];
            }
            return flat;
        });
        localStorage.setItem("rre_flats", JSON.stringify(this.flats));

        // Load PGs
        const storedPGs = localStorage.getItem("rre_pgs");
        if (storedPGs) {
            this.pgs = JSON.parse(storedPGs);
        } else {
            this.pgs = [...defaultPGs];
        }
        // Migration: Ensure location is fixed and images array exists
        this.pgs = this.pgs.map(pg => {
            pg.location = "Singapur Township, Pocharam";
            if (!pg.images || !Array.isArray(pg.images)) {
                pg.images = [pg.image || "images/pg_1.png"];
            }
            return pg;
        });
        localStorage.setItem("rre_pgs", JSON.stringify(this.pgs));

        // Load Bookings
        const storedBookings = localStorage.getItem("rre_bookings");
        if (storedBookings) {
            this.bookings = JSON.parse(storedBookings);
        } else {
            this.bookings = [];
            localStorage.setItem("rre_bookings", JSON.stringify(this.bookings));
        }

        // Load Inbox
        const storedInbox = localStorage.getItem("rre_inbox");
        if (storedInbox) {
            this.inbox = JSON.parse(storedInbox);
        } else {
            this.inbox = [];
            localStorage.setItem("rre_inbox", JSON.stringify(this.inbox));
        }

        // Load Saved Properties (Cart)
        const storedSaved = localStorage.getItem("rre_saved_props");
        this.savedProperties = storedSaved ? JSON.parse(storedSaved) : {};

        // Load Property Bookings
        const storedPropBookings = localStorage.getItem("rre_prop_bookings");
        this.propertyBookings = storedPropBookings ? JSON.parse(storedPropBookings) : {};
    }

    saveData(key, data) {
        localStorage.setItem(`rre_${key}`, JSON.stringify(data));
        this[key] = data;

        // Propagate changes to Admin Dashboard if it's open or loaded
        if (window.admin) {
            window.admin.refreshDashboardData();
        }
    }

    initNavigation() {
        const navLinks = document.querySelectorAll(".nav-link");
        const logo = document.getElementById("logo-home-trigger");
        const mobileToggle = document.getElementById("mobile-menu-toggle");
        const navMenu = document.getElementById("navigation-links");

        // Click nav link
        navLinks.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const target = link.getAttribute("data-target");
                this.navigateTo(target);
                
                // Active Class style
                navLinks.forEach(l => l.classList.remove("active"));
                link.classList.add("active");

                // Close mobile menu on click
                navMenu.classList.remove("active");
                const icon = mobileToggle.querySelector("i");
                icon.className = "fa-solid fa-bars";
            });
        });

        // Click Logo redirects to Home
        if (logo) {
            logo.addEventListener("click", (e) => {
                e.preventDefault();
                this.navigateTo("home-section");
                navLinks.forEach(l => l.classList.remove("active"));
                document.querySelector('.nav-link[data-target="home-section"]').classList.add("active");
            });
        }

        // Mobile Menu toggle
        if (mobileToggle) {
            mobileToggle.addEventListener("click", () => {
                navMenu.classList.toggle("active");
                const icon = mobileToggle.querySelector("i");
                if (navMenu.classList.contains("active")) {
                    icon.className = "fa-solid fa-xmark";
                } else {
                    icon.className = "fa-solid fa-bars";
                }
            });
        }
    }

    navigateTo(sectionId) {
        // Guard: Admin section requires admin role
        if (sectionId === "admin-section") {
            if (!window.auth || !window.auth.isAdmin()) {
                this.showToast("⛔ Access Denied. Admin Panel is restricted to administrators only.", "error");
                return;
            }
        }

        // Hide all page sections
        const sections = document.querySelectorAll(".page-section");
        sections.forEach(sec => {
            sec.classList.remove("active");
        });

        // Show targets
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add("active");
            this.activeSection = sectionId;
            window.scrollTo({ top: 0, behavior: "smooth" });
            
            // Set URL hash without triggering page reload
            const hash = sectionId.replace("-section", "");
            history.pushState(null, null, `#${hash}`);
            
            // Highlight matching nav link
            const navLinks = document.querySelectorAll(".nav-link");
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("data-target") === sectionId) {
                    link.classList.add("active");
                }
            });

            // If entering admin page, initialize admin panel
            if (sectionId === "admin-section" && window.admin) {
                window.admin.init();
            }
        }
    }

    handleHashRoute() {
        const hash = window.location.hash.substring(1);
        const modal = document.getElementById("property-detail-modal");
        if (hash) {
            if (hash.startsWith("flat/")) {
                const flatId = hash.split("/")[1];
                this.navigateTo("flats-section");
                this.showDetailModal("flat", flatId, false);
            } else if (hash.startsWith("pg/")) {
                const pgId = hash.split("/")[1];
                this.navigateTo("pgs-section");
                this.showDetailModal("pg", pgId, false);
            } else {
                if (modal) modal.classList.remove("active");
                const sectionId = `${hash}-section`;
                this.navigateTo(sectionId);
            }
        } else {
            if (modal) modal.classList.remove("active");
            this.navigateTo("home-section");
        }
    }

    // ==========================================================================
    // PROFILE LOGIC (Cart & Bookings)
    // ==========================================================================
    toggleStar(type, id) {
        if (!window.auth || !window.auth.getCurrentUser()) {
            this.showToast("Please login to save properties.", "error");
            return;
        }
        const user = window.auth.getCurrentUser();
        if (!this.savedProperties[user.email]) {
            this.savedProperties[user.email] = [];
        }
        
        const index = this.savedProperties[user.email].findIndex(item => item.id === id && item.type === type);
        if (index > -1) {
            this.savedProperties[user.email].splice(index, 1);
            this.showToast("Removed from saved properties", "success");
        } else {
            this.savedProperties[user.email].push({ type, id });
            this.showToast("Added to saved properties", "success");
        }
        this.saveData("saved_props", this.savedProperties);
        
        if (type === 'flat') this.renderFlats(this.flats);
        else this.renderPGs(this.pgs);
        
        if (document.getElementById("profile-modal").style.display === "flex") {
            this.renderProfileData(user);
        }
    }

    bookProperty(type, id) {
        if (!window.auth || !window.auth.getCurrentUser()) {
            this.showToast("Please login to book properties.", "error");
            return;
        }
        const user = window.auth.getCurrentUser();
        if (!this.propertyBookings[user.email]) {
            this.propertyBookings[user.email] = [];
        }
        
        const alreadyBooked = this.propertyBookings[user.email].some(item => item.id === id && item.type === type);
        if (alreadyBooked) {
            this.showToast("You have already booked this property!", "error");
            return;
        }
        
        this.propertyBookings[user.email].push({ type, id, date: new Date().toISOString() });
        this.saveData("prop_bookings", this.propertyBookings);
        this.showToast("Property booked successfully!", "success");
        
        if (type === 'flat') this.renderFlats(this.flats);
        else this.renderPGs(this.pgs);

        if (document.getElementById("profile-modal").style.display === "flex") {
            this.renderProfileData(user);
        }
    }

    unbookProperty(type, id) {
        if (!window.auth || !window.auth.getCurrentUser()) return;
        const user = window.auth.getCurrentUser();
        if (!this.propertyBookings[user.email]) return;

        this.propertyBookings[user.email] = this.propertyBookings[user.email].filter(item => !(item.id === id && item.type === type));
        this.saveData("prop_bookings", this.propertyBookings);
        this.showToast("Property unbooked.", "success");

        if (type === 'flat') this.renderFlats(this.flats);
        else this.renderPGs(this.pgs);

        if (document.getElementById("profile-modal").style.display === "flex" || document.getElementById("profile-modal").style.display === "block") {
            this.renderProfileData(user);
        }
    }

    renderProfileData(user) {
        const bookingsContainer = document.getElementById("profile-bookings");
        const savedContainer = document.getElementById("profile-saved");
        if (!bookingsContainer || !savedContainer) return;

        if (user.role === 'admin') {
            bookingsContainer.parentElement.style.display = 'none';
            savedContainer.parentElement.style.display = 'none';
            return;
        } else {
            bookingsContainer.parentElement.style.display = 'block';
            savedContainer.parentElement.style.display = 'block';
        }

        const userBookings = this.propertyBookings[user.email] || [];
        const userSaved = this.savedProperties[user.email] || [];

        const renderItem = (item, isBooking) => {
            let prop = item.type === 'flat' ? this.flats.find(f => f.id === item.id) : this.pgs.find(p => p.id === item.id);
            if (!prop) return '';
            const actionBtn = isBooking 
                ? `<button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 5px; color: var(--danger); border-color: var(--danger);" onclick="app.unbookProperty('${item.type}', '${item.id}')">Unbook</button>`
                : `<button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 5px; color: var(--danger); border-color: var(--danger);" onclick="app.toggleStar('${item.type}', '${item.id}')">Remove</button>`;

            return `<div style="padding: 10px; border-bottom: 1px solid var(--neutral-200); display: flex; justify-content: space-between; align-items: center; border-radius: 8px; margin-bottom: 5px; background: white; flex-wrap: wrap; gap: 5px;">
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; font-weight: 500;">${prop.title || prop.name}</span>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 5px;" onclick="app.showDetailModal('${item.type}', '${item.id}', true, true)">View</button>
                    ${actionBtn}
                </div>
            </div>`;
        };

        if (userBookings.length === 0) {
            bookingsContainer.innerHTML = "<p style='color: var(--neutral-500); text-align: center; margin-top: 10px;'>No bookings yet.</p>";
        } else {
            bookingsContainer.innerHTML = userBookings.map(b => renderItem(b, true)).join('');
        }

        if (userSaved.length === 0) {
            savedContainer.innerHTML = "<p style='color: var(--neutral-500); text-align: center; margin-top: 10px;'>No saved properties.</p>";
        } else {
            savedContainer.innerHTML = userSaved.map(s => renderItem(s, false)).join('');
        }
    }

    // ==========================================================================
    // FLATS LOGIC (Render & Filters)
    // ==========================================================================
    renderFlats(flatsData) {
        const container = document.getElementById("flats-grid-container");
        const countLabel = document.getElementById("flats-count-label");
        
        if (!container) return;
        container.innerHTML = "";
        
        countLabel.textContent = `Showing ${flatsData.length} properties`;
        
        if (flatsData.length === 0) {
            container.innerHTML = `
                <div class="empty-results glass-card">
                    <i class="fa-solid fa-house-circle-exclamation"></i>
                    <h3>No Flats Found</h3>
                    <p>We couldn't find any flats matching your filters. Try adjusting your preferences.</p>
                </div>
            `;
            return;
        }

        flatsData.forEach(flat => {
            const card = document.createElement("div");
            card.className = "property-card glass-card";
            card.id = `flat-card-${flat.id}`;
            
            const badgeClass = flat.available ? "avail" : "rented";
            const badgeText = flat.available ? "Available" : "Rented";
            const amenitiesHTML = flat.amenities.slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join("");
            const remainingAmenities = flat.amenities.length > 3 ? `<span class="amenity-tag">+${flat.amenities.length - 3} more</span>` : "";

            // Dynamic WhatsApp URL
            const whatsappText = encodeURIComponent(`Hello, I'm interested in renting your flat: ${flat.title} located at Singapur Township, Pocharam. Monthly Rent: ₹${flat.rent}. Please provide more details.`);
            const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${whatsappText}`;

            const defaultImage = 'images/flat_1.png';
            const flatImages = flat.images && flat.images.length > 0 ? flat.images : [flat.image || defaultImage];
            const activeImageIdx = this.cardImageIndices[flat.id] || 0;
            const currentImg = flatImages[activeImageIdx] || defaultImage;

            // Generate dots HTML
            let dotsHTML = '';
            if (flatImages.length > 1) {
                dotsHTML = `
                    <div class="card-slider-dots">
                        ${flatImages.map((_, idx) => `
                            <span class="card-slider-dot ${idx === activeImageIdx ? 'active' : ''}" 
                                  onclick="event.stopPropagation(); app.setCardImage('flat', '${flat.id}', ${idx})">
                            </span>
                        `).join("")}
                    </div>
                `;
            }

            const sliderControls = flatImages.length > 1 ? `
                <button class="card-slider-btn prev-btn" onclick="event.stopPropagation(); app.navigateCardImage('flat', '${flat.id}', -1)">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button class="card-slider-btn next-btn" onclick="event.stopPropagation(); app.navigateCardImage('flat', '${flat.id}', 1)">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            ` : '';

            card.innerHTML = `
                <div class="property-card-left" id="card-media-flat-${flat.id}">
                    <div class="card-image-slider-wrapper">
                        <img class="card-slider-image" src="${currentImg}" alt="${flat.title}">
                        ${sliderControls}
                        ${dotsHTML}
                    </div>
                    <span class="tag-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="property-card-right">
                    <div class="property-card-header">
                        <div class="property-price">₹${flat.rent.toLocaleString('en-IN')}/month</div>
                        <h3 class="property-title">${flat.title}</h3>
                        <div class="property-location">
                            <i class="fa-solid fa-location-dot"></i> Singapur Township, Pocharam
                        </div>
                    </div>
                    <div class="property-specs">
                        <span><i class="fa-solid fa-bed"></i> ${flat.bhk}</span>
                        <span><i class="fa-solid fa-maximize"></i> ${flat.area} sqft</span>
                        <span><i class="fa-solid fa-couch"></i> ${flat.furnishing}</span>
                    </div>
                    <p class="property-desc">${flat.desc}</p>
                    <div class="property-amenities">
                        ${amenitiesHTML}
                        ${remainingAmenities}
                    </div>
                    <div class="property-actions">
                        ${(window.auth && window.auth.getCurrentUser()) ? `
                            <button class="btn btn-cart-icon" style="padding: 8px 12px; border: 1px solid var(--neutral-200); border-radius: 8px; background: white; cursor: pointer; color: ${(this.savedProperties[window.auth.getCurrentUser().email] || []).some(i => i.id === flat.id) ? 'var(--primary)' : 'var(--neutral-500)'};" onclick="app.toggleStar('flat', '${flat.id}')" title="Add to Cart">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="app.showDetailModal('flat', '${flat.id}')">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                        ${(window.auth && window.auth.getCurrentUser() && (this.propertyBookings[window.auth.getCurrentUser().email] || []).some(i => i.id === flat.id)) ? `
                            <button class="btn btn-primary" style="background: var(--success); border-color: var(--success);" onclick="app.unbookProperty('flat', '${flat.id}')" title="Click to unbook">
                                <i class="fa-solid fa-check"></i> Booked
                            </button>
                        ` : `
                            <button class="btn btn-primary" onclick="app.bookProperty('flat', '${flat.id}')">
                                Book Now
                            </button>
                        `}
                        <a href="${whatsappUrl}" class="btn btn-contact" target="_blank" title="Contact Owner">
                            <i class="fa-solid fa-comment-dots"></i>
                        </a>
                        <button class="btn btn-copy-link-icon" onclick="app.copyPropertyLink('flat', '${flat.id}')" title="Copy Property Link">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    initFlatsFilters() {
        const applyBtn = document.getElementById("apply-flat-filters-btn");
        const resetBtn = document.getElementById("reset-flat-filters-btn");
        const budgetRange = document.getElementById("flat-budget-range");
        const budgetVal = document.getElementById("flat-budget-val");
        const sortSelect = document.getElementById("flat-sort-select");

        if (budgetRange) {
            budgetRange.addEventListener("input", (e) => {
                budgetVal.textContent = `Up to ₹${parseInt(e.target.value).toLocaleString('en-IN')}`;
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener("click", () => this.applyFlatsFilter());
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                document.getElementById("flat-search-loc").value = "";
                document.getElementById("flat-budget-range").value = 50000;
                document.getElementById("flat-budget-val").textContent = "Up to ₹50,000";
                document.getElementById("flat-avail-check").checked = true;
                
                document.querySelectorAll("input[name='flat-bhk']").forEach(cb => cb.checked = false);
                document.querySelectorAll("input[name='flat-furnish']").forEach(cb => cb.checked = false);
                
                this.applyFlatsFilter();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener("change", () => this.applyFlatsFilter());
        }
    }

    applyFlatsFilter() {
        const searchLoc = document.getElementById("flat-search-loc").value.trim().toLowerCase();
        const maxBudget = parseInt(document.getElementById("flat-budget-range").value);
        const availOnly = document.getElementById("flat-avail-check").checked;
        const sortType = document.getElementById("flat-sort-select").value;

        // Selected BHKs
        const bhkCheckboxes = document.querySelectorAll("input[name='flat-bhk']:checked");
        const selectedBHKs = Array.from(bhkCheckboxes).map(cb => cb.value);

        // Selected Furnishings
        const furnishCheckboxes = document.querySelectorAll("input[name='flat-furnish']:checked");
        const selectedFurnishings = Array.from(furnishCheckboxes).map(cb => cb.value);

        let filtered = this.flats.filter(flat => {
            // Keyword match (title, desc, amenities)
            if (searchLoc && 
                !flat.title.toLowerCase().includes(searchLoc) && 
                !flat.desc.toLowerCase().includes(searchLoc) &&
                !flat.amenities.some(a => a.toLowerCase().includes(searchLoc))) {
                return false;
            }
            // Budget
            if (flat.rent > maxBudget) {
                return false;
            }
            // Availability
            if (availOnly && !flat.available) {
                return false;
            }
            // BHK
            if (selectedBHKs.length > 0 && !selectedBHKs.includes(flat.bhk)) {
                return false;
            }
            // Furnishing
            if (selectedFurnishings.length > 0 && !selectedFurnishings.includes(flat.furnishing)) {
                return false;
            }
            return true;
        });

        // Sorting
        if (sortType === "rent-asc") {
            filtered.sort((a, b) => a.rent - b.rent);
        } else if (sortType === "rent-desc") {
            filtered.sort((a, b) => b.rent - a.rent);
        } else if (sortType === "area-desc") {
            filtered.sort((a, b) => b.area - a.area);
        }

        this.renderFlats(filtered);
    }

    // ==========================================================================
    // PG LOGIC (Render & Filters)
    // ==========================================================================
    renderPGs(pgsData) {
        const container = document.getElementById("pgs-grid-container");
        const countLabel = document.getElementById("pgs-count-label");
        
        if (!container) return;
        container.innerHTML = "";
        
        countLabel.textContent = `Showing ${pgsData.length} listings`;

        if (pgsData.length === 0) {
            container.innerHTML = `
                <div class="empty-results glass-card">
                    <i class="fa-solid fa-bed-pulse"></i>
                    <h3>No PGs Found</h3>
                    <p>We couldn't find any PG accommodations matching your parameters. Check your filters again.</p>
                </div>
            `;
            return;
        }

        pgsData.forEach(pg => {
            const card = document.createElement("div");
            card.className = "property-card glass-card";
            card.id = `pg-card-${pg.id}`;

            const genderBadgeClass = `gender-${pg.gender.toLowerCase()}`;
            const genderText = pg.gender === "Unisex" ? "Co-Ed PG" : `${pg.gender} Only`;
            
            const facilitiesHTML = pg.facilities.slice(0, 3).map(f => `<span class="amenity-tag">${f}</span>`).join("");
            const remainingFacilities = pg.facilities.length > 3 ? `<span class="amenity-tag">+${pg.facilities.length - 3} more</span>` : "";

            const whatsappText = encodeURIComponent(`Hello, I'm interested in booking a PG room: ${pg.name} located at Singapur Township, Pocharam. Rent starts at: ₹${pg.rent}. Preferred sharing: ${pg.occupancy}. Please guide me on booking.`);
            const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${whatsappText}`;

            const defaultImage = 'images/pg_1.png';
            const pgImages = pg.images && pg.images.length > 0 ? pg.images : [pg.image || defaultImage];
            const activeImageIdx = this.cardImageIndices[pg.id] || 0;
            const currentImg = pgImages[activeImageIdx] || defaultImage;

            // Generate dots HTML
            let dotsHTML = '';
            if (pgImages.length > 1) {
                dotsHTML = `
                    <div class="card-slider-dots">
                        ${pgImages.map((_, idx) => `
                            <span class="card-slider-dot ${idx === activeImageIdx ? 'active' : ''}" 
                                  onclick="event.stopPropagation(); app.setCardImage('pg', '${pg.id}', ${idx})">
                            </span>
                        `).join("")}
                    </div>
                `;
            }

            const sliderControls = pgImages.length > 1 ? `
                <button class="card-slider-btn prev-btn" onclick="event.stopPropagation(); app.navigateCardImage('pg', '${pg.id}', -1)">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button class="card-slider-btn next-btn" onclick="event.stopPropagation(); app.navigateCardImage('pg', '${pg.id}', 1)">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            ` : '';

            card.innerHTML = `
                <div class="property-card-left" id="card-media-pg-${pg.id}">
                    <div class="card-image-slider-wrapper">
                        <img class="card-slider-image" src="${currentImg}" alt="${pg.name}">
                        ${sliderControls}
                        ${dotsHTML}
                    </div>
                    <span class="tag-badge ${genderBadgeClass}">${genderText}</span>
                </div>
                <div class="property-card-right">
                    <div class="property-card-header">
                        <div class="property-price">₹${pg.rent.toLocaleString('en-IN')}/month</div>
                        <h3 class="property-title">${pg.name}</h3>
                        <div class="property-location">
                            <i class="fa-solid fa-location-dot"></i> Singapur Township, Pocharam
                        </div>
                    </div>
                    <div class="property-specs">
                        <span><i class="fa-solid fa-users"></i> ${pg.occupancy}</span>
                        <span><i class="fa-solid fa-wind"></i> ${pg.ac}</span>
                        <span><i class="fa-solid fa-utensils"></i> ${pg.food ? 'Meals Included' : 'Self Kitchen'}</span>
                    </div>
                    <p class="property-desc">${pg.desc}</p>
                    <div class="property-amenities">
                        ${facilitiesHTML}
                        ${remainingFacilities}
                    </div>
                    <div class="property-actions">
                        ${(window.auth && window.auth.getCurrentUser()) ? `
                            <button class="btn btn-cart-icon" style="padding: 8px 12px; border: 1px solid var(--neutral-200); border-radius: 8px; background: white; cursor: pointer; color: ${(this.savedProperties[window.auth.getCurrentUser().email] || []).some(i => i.id === pg.id) ? 'var(--primary)' : 'var(--neutral-500)'};" onclick="app.toggleStar('pg', '${pg.id}')" title="Add to Cart">
                                <i class="fa-solid fa-cart-shopping"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="app.showDetailModal('pg', '${pg.id}')">
                            <i class="fa-solid fa-eye"></i> View Details
                        </button>
                        ${(window.auth && window.auth.getCurrentUser() && (this.propertyBookings[window.auth.getCurrentUser().email] || []).some(i => i.id === pg.id)) ? `
                            <button class="btn btn-primary" style="background: var(--success); border-color: var(--success);" onclick="app.unbookProperty('pg', '${pg.id}')" title="Click to unbook">
                                <i class="fa-solid fa-check"></i> Booked
                            </button>
                        ` : `
                            <button class="btn btn-primary" onclick="app.bookProperty('pg', '${pg.id}')">
                                Book Now
                            </button>
                        `}
                        <a href="${whatsappUrl}" class="btn btn-contact" target="_blank" title="Contact Owner">
                            <i class="fa-solid fa-comment-dots"></i>
                        </a>
                        <button class="btn btn-copy-link-icon" onclick="app.copyPropertyLink('pg', '${pg.id}')" title="Copy Property Link">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    initPGsFilters() {
        const applyBtn = document.getElementById("apply-pg-filters-btn");
        const resetBtn = document.getElementById("reset-pg-filters-btn");
        const budgetRange = document.getElementById("pg-budget-range");
        const budgetVal = document.getElementById("pg-budget-val");
        const sortSelect = document.getElementById("pg-sort-select");

        if (budgetRange) {
            budgetRange.addEventListener("input", (e) => {
                budgetVal.textContent = `Up to ₹${parseInt(e.target.value).toLocaleString('en-IN')}`;
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener("click", () => this.applyPGsFilter());
        }

        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                document.getElementById("pg-search-loc").value = "";
                document.getElementById("pg-budget-range").value = 20000;
                document.getElementById("pg-budget-val").textContent = "Up to ₹20,000";
                document.getElementById("pg-food-check").checked = false;
                
                document.querySelectorAll("input[name='pg-gender']").forEach(cb => cb.checked = false);
                document.querySelectorAll("input[name='pg-ac']").forEach(cb => cb.checked = false);
                document.querySelectorAll("input[name='pg-occupancy']").forEach(cb => cb.checked = false);
                
                this.applyPGsFilter();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener("change", () => this.applyPGsFilter());
        }
    }

    applyPGsFilter() {
        const searchLoc = document.getElementById("pg-search-loc").value.trim().toLowerCase();
        const maxBudget = parseInt(document.getElementById("pg-budget-range").value);
        const foodRequired = document.getElementById("pg-food-check").checked;
        const sortType = document.getElementById("pg-sort-select").value;

        // Selected Genders
        const genderCheckboxes = document.querySelectorAll("input[name='pg-gender']:checked");
        const selectedGenders = Array.from(genderCheckboxes).map(cb => cb.value);

        // Selected AC options
        const acCheckboxes = document.querySelectorAll("input[name='pg-ac']:checked");
        const selectedAC = Array.from(acCheckboxes).map(cb => cb.value);

        // Selected Occupancy options
        const occupancyCheckboxes = document.querySelectorAll("input[name='pg-occupancy']:checked");
        const selectedOccupancy = Array.from(occupancyCheckboxes).map(cb => cb.value);

        let filtered = this.pgs.filter(pg => {
            // Keyword match (name, desc, facilities)
            if (searchLoc && 
                !pg.name.toLowerCase().includes(searchLoc) && 
                !pg.desc.toLowerCase().includes(searchLoc) &&
                !pg.facilities.some(f => f.toLowerCase().includes(searchLoc))) {
                return false;
            }
            // Budget
            if (pg.rent > maxBudget) {
                return false;
            }
            // Food
            if (foodRequired && !pg.food) {
                return false;
            }
            // Gender
            if (selectedGenders.length > 0 && !selectedGenders.includes(pg.gender)) {
                return false;
            }
            // AC
            if (selectedAC.length > 0 && !selectedAC.includes(pg.ac)) {
                return false;
            }
            // Occupancy
            if (selectedOccupancy.length > 0 && !selectedOccupancy.includes(pg.occupancy)) {
                return false;
            }
            return true;
        });

        // Sorting
        if (sortType === "rent-asc") {
            filtered.sort((a, b) => a.rent - b.rent);
        } else if (sortType === "rent-desc") {
            filtered.sort((a, b) => b.rent - a.rent);
        }

        this.renderPGs(filtered);
    }

    // ==========================================================================
    // DETAIL MODAL LOGIC
    // ==========================================================================
    initModal() {
        const modal = document.getElementById("property-detail-modal");
        const closeBtn = document.getElementById("modal-close-trigger");

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                modal.classList.remove("active");
                if (this.isDetailModalFromProfile) {
                    const profileModal = document.getElementById("profile-modal");
                    profileModal.style.display = "flex";
                    profileModal.classList.add("active");
                    this.isDetailModalFromProfile = false;
                } else {
                    const section = this.activeSection.replace("-section", "");
                    window.location.hash = section;
                }
            });
        }

        // Close on clicking outside container
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.classList.remove("active");
                    if (this.isDetailModalFromProfile) {
                        const profileModal = document.getElementById("profile-modal");
                        profileModal.style.display = "flex";
                        profileModal.classList.add("active");
                        this.isDetailModalFromProfile = false;
                    } else {
                        const section = this.activeSection.replace("-section", "");
                        window.location.hash = section;
                    }
                }
            });
        }

        const backToProfileBtn = document.getElementById("modal-back-to-profile-btn");
        if (backToProfileBtn) {
            backToProfileBtn.addEventListener("click", () => {
                modal.classList.remove("active");
                const profileModal = document.getElementById("profile-modal");
                profileModal.style.display = "flex";
                profileModal.classList.add("active");
                this.isDetailModalFromProfile = false;
            });
        }

        // Gallery navigation triggers
        const prevBtn = document.getElementById("gallery-prev-btn");
        const nextBtn = document.getElementById("gallery-next-btn");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                this.updateModalImage(this.currentModalImageIndex - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                this.updateModalImage(this.currentModalImageIndex + 1);
            });
        }
    }

    showDetailModal(type, id, updateHash = true, fromProfile = false) {
        const modal = document.getElementById("property-detail-modal");
        
        let item;
        if (type === "flat") {
            item = this.flats.find(f => f.id === id);
        } else if (type === "pg") {
            item = this.pgs.find(p => p.id === id);
        }

        if (!item || !modal) return;

        this.isDetailModalFromProfile = fromProfile;
        const backToProfileBtn = document.getElementById("modal-back-to-profile-btn");
        if (backToProfileBtn) {
            backToProfileBtn.style.display = fromProfile ? "inline-flex" : "none";
        }
        if (fromProfile) {
            document.getElementById("profile-modal").style.display = "none";
            document.getElementById("profile-modal").classList.remove("active");
        }

        // Populate Modal Fields
        document.getElementById("modal-title").textContent = item.title || item.name;
        document.getElementById("modal-location").innerHTML = `<i class="fa-solid fa-location-dot"></i> Singapur Township, Pocharam`;
        document.getElementById("modal-rent").textContent = `₹${item.rent.toLocaleString('en-IN')} / month`;
        document.getElementById("modal-desc").textContent = item.desc;
        
        // Type Badge Setup
        const typeBadge = document.getElementById("modal-type-badge");
        if (type === "flat") {
            typeBadge.textContent = `${item.bhk} Flat (${item.furnishing})`;
            
            const availBadge = document.getElementById("modal-avail-badge");
            availBadge.className = `tag-badge ${item.available ? 'avail' : 'rented'}`;
            availBadge.textContent = item.available ? 'Available' : 'Rented';
            availBadge.style.display = "inline-block";
        } else {
            typeBadge.textContent = `${item.occupancy} Co-Living PG`;
            
            const genderBadge = document.getElementById("modal-avail-badge");
            genderBadge.className = `tag-badge gender-${item.gender.toLowerCase()}`;
            genderBadge.textContent = item.gender === "Unisex" ? "Co-Ed PG" : `${item.gender} Only`;
            genderBadge.style.display = "inline-block";
        }

        // Amenities Setup
        const amenitiesGrid = document.getElementById("modal-amenities-container");
        amenitiesGrid.innerHTML = "";
        const tags = type === "flat" ? item.amenities : item.facilities;
        
        tags.forEach(tag => {
            const icon = this.getAmenityIcon(tag);
            const tagHTML = `<div class="modal-amenity">${icon} ${tag}</div>`;
            amenitiesGrid.innerHTML += tagHTML;
        });

        // WhatsApp Link Configuration
        const whatsappBtn = document.getElementById("modal-whatsapp-btn");
        let queryText = "";
        if (type === "flat") {
            queryText = `Hi, I saw your flat listing: ${item.title} on your Real Estate portal and want to inspect it. Please let me know its availability.`;
        } else {
            queryText = `Hi, I saw your PG listing: ${item.name} in Singapur Township, Pocharam on your Real Estate portal and want to check sharing details for ${item.occupancy}.`;
        }
        whatsappBtn.href = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(queryText)}`;

        // Share Button in Modal
        const modalShareBtn = document.getElementById("modal-share-btn");
        if (modalShareBtn) {
            modalShareBtn.href = this.buildShareUrl(item, type);
        }

        // Copy Link Button in Modal
        const copyLinkBtn = document.getElementById("modal-copy-link-btn");
        if (copyLinkBtn) {
            copyLinkBtn.onclick = (e) => {
                e.preventDefault();
                this.copyPropertyLink(type, id);
            };
        }

        // Setup Carousel & Images
        this.currentModalImages = item.images || [item.image || (type === "flat" ? "images/flat_1.png" : "images/pg_1.png")];
        this.currentModalImageIndex = 0;

        const thumbsContainer = document.getElementById("modal-thumbnails-container");
        if (thumbsContainer) {
            thumbsContainer.innerHTML = "";
            if (this.currentModalImages.length > 1) {
                thumbsContainer.style.display = "flex";
                this.currentModalImages.forEach((imgSrc, idx) => {
                    const thumb = document.createElement("img");
                    thumb.src = imgSrc;
                    thumb.className = `modal-thumbnail ${idx === 0 ? 'active' : ''}`;
                    thumb.alt = `Thumbnail ${idx + 1}`;
                    thumb.addEventListener("click", () => {
                        this.updateModalImage(idx);
                    });
                    thumbsContainer.appendChild(thumb);
                });
            } else {
                thumbsContainer.style.display = "none";
            }
        }

        const prevBtn = document.getElementById("gallery-prev-btn");
        const nextBtn = document.getElementById("gallery-next-btn");
        if (prevBtn && nextBtn) {
            if (this.currentModalImages.length > 1) {
                prevBtn.style.display = "flex";
                nextBtn.style.display = "flex";
            } else {
                prevBtn.style.display = "none";
                nextBtn.style.display = "none";
            }
        }

        this.updateModalImage(0);

        // Open Modal
        modal.classList.add("active");

        if (updateHash) {
            window.location.hash = `${type}/${id}`;
        }
    }

    updateModalImage(index) {
        if (!this.currentModalImages || this.currentModalImages.length === 0) return;

        if (index < 0) index = this.currentModalImages.length - 1;
        if (index >= this.currentModalImages.length) index = 0;

        this.currentModalImageIndex = index;
        const modalImg = document.getElementById("modal-image");
        if (modalImg) {
            modalImg.src = this.currentModalImages[index];
        }

        const thumbs = document.querySelectorAll(".modal-thumbnail");
        thumbs.forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add("active");
                thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            } else {
                thumb.classList.remove("active");
            }
        });
    }

    copyPropertyLink(type, id) {
        const siteUrl = window.location.origin + window.location.pathname;
        const deepLink = `${siteUrl}#${type}/${id}`;
        navigator.clipboard.writeText(deepLink).then(() => {
            this.showToast("Property link copied to clipboard!", "success");
        }).catch(err => {
            this.showToast("Failed to copy link. Please copy it manually.", "error");
        });
    }

    navigateCardImage(type, id, direction) {
        const item = type === "flat" ? this.flats.find(f => f.id === id) : this.pgs.find(p => p.id === id);
        if (!item) return;

        const images = item.images && item.images.length > 0 ? item.images : [item.image || (type === "flat" ? "images/flat_1.png" : "images/pg_1.png")];
        let currentIndex = this.cardImageIndices[id] || 0;
        currentIndex += direction;
        
        if (currentIndex < 0) currentIndex = images.length - 1;
        if (currentIndex >= images.length) currentIndex = 0;

        this.setCardImage(type, id, currentIndex);
    }

    setCardImage(type, id, index) {
        const item = type === "flat" ? this.flats.find(f => f.id === id) : this.pgs.find(p => p.id === id);
        if (!item) return;

        const images = item.images && item.images.length > 0 ? item.images : [item.image || (type === "flat" ? "images/flat_1.png" : "images/pg_1.png")];
        if (index < 0 || index >= images.length) return;

        this.cardImageIndices[id] = index;

        // Update the image src in DOM
        const cardMedia = document.getElementById(`card-media-${type}-${id}`);
        if (cardMedia) {
            const img = cardMedia.querySelector(".card-slider-image");
            if (img) {
                img.src = images[index];
            }

            const dots = cardMedia.querySelectorAll(".card-slider-dot");
            dots.forEach((dot, idx) => {
                if (idx === index) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }
    }

    getAmenityIcon(tag) {
        const lower = tag.toLowerCase();
        if (lower.includes("wifi") || lower.includes("internet")) return '<i class="fa-solid fa-wifi"></i>';
        if (lower.includes("parking")) return '<i class="fa-solid fa-car"></i>';
        if (lower.includes("food") || lower.includes("meal")) return '<i class="fa-solid fa-utensils"></i>';
        if (lower.includes("laundry") || lower.includes("washing")) return '<i class="fa-solid fa-shirt"></i>';
        if (lower.includes("security") || lower.includes("cctv")) return '<i class="fa-solid fa-shield-halved"></i>';
        if (lower.includes("water") || lower.includes("plumbing")) return '<i class="fa-solid fa-droplet"></i>';
        if (lower.includes("power") || lower.includes("backup") || lower.includes("generator")) return '<i class="fa-solid fa-plug"></i>';
        if (lower.includes("gym") || lower.includes("fitness")) return '<i class="fa-solid fa-dumbbell"></i>';
        if (lower.includes("pool")) return '<i class="fa-solid fa-person-swimming"></i>';
        if (lower.includes("ac") || lower.includes("air condition")) return '<i class="fa-solid fa-wind"></i>';
        if (lower.includes("geyser") || lower.includes("heater")) return '<i class="fa-solid fa-temperature-high"></i>';
        if (lower.includes("lift") || lower.includes("elevator")) return '<i class="fa-solid fa-elevator"></i>';
        if (lower.includes("balcony")) return '<i class="fa-solid fa-mountain-sun"></i>';
        return '<i class="fa-solid fa-circle-check"></i>';
    }

    buildShareUrl(item, type) {
        const siteUrl = window.location.origin + window.location.pathname;
        const name = item.title || item.name;
        const deepLink = `${siteUrl}#${type}/${item.id}`;
        let details = "";
        if (type === 'flat') {
            details = `🏠 *${name}*\n📍 Location: Singapur Township, Pocharam\n💰 Rent: ₹${item.rent.toLocaleString('en-IN')}/month\n🛏️ ${item.bhk} | 📐 ${item.area} sqft | 🛋️ ${item.furnishing}\n✅ ${item.amenities.slice(0,4).join(' | ')}`;
        } else {
            details = `🏡 *${name}*\n📍 Location: Singapur Township, Pocharam\n💰 Rent: ₹${item.rent.toLocaleString('en-IN')}/month\n👥 ${item.occupancy} | ❄️ ${item.ac} | 🍽️ ${item.food ? 'Meals Included' : 'Self Kitchen'}\n✅ ${item.facilities.slice(0,4).join(' | ')}`;
        }
        const fullMsg = `${details}\n\n🔗 View details: ${deepLink}`;
        return `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
    }

    // ==========================================================================
    // FORMS PROCESSING
    // ==========================================================================
    initForms() {
        const bookingForm = document.getElementById("service-booking-form");
        const contactForm = document.getElementById("contact-us-form");

        if (bookingForm) {
            bookingForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleServiceBooking();
            });
        }

        if (contactForm) {
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleContactUs();
            });
        }
    }

    handleServiceBooking() {
        const name = document.getElementById("booking-name").value.trim();
        const phone = document.getElementById("booking-phone").value.trim();
        const email = document.getElementById("booking-email").value.trim();
        const service = document.getElementById("booking-service").value;
        const date = document.getElementById("booking-date").value;
        const message = document.getElementById("booking-message").value.trim();

        const newBooking = {
            id: `bk-${Date.now()}`,
            name,
            phone,
            email,
            service,
            date,
            message,
            status: "Pending",
            timestamp: new Date().toLocaleString()
        };

        const updated = [newBooking, ...this.bookings];
        this.saveData("bookings", updated);
        
        // Success Actions
        this.showToast(`Booking request for ${service} sent successfully!`, "success");
        document.getElementById("service-booking-form").reset();
    }

    handleContactUs() {
        const name = document.getElementById("contact-name").value.trim();
        const phone = document.getElementById("contact-phone").value.trim();
        const email = document.getElementById("contact-email").value.trim();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        const newInquiry = {
            id: `inq-${Date.now()}`,
            name,
            phone,
            email,
            subject,
            message,
            status: "Unread",
            timestamp: new Date().toLocaleString()
        };

        const updated = [newInquiry, ...this.inbox];
        this.saveData("inbox", updated);

        // Success Actions
        this.showToast(`Your message has been sent. We'll reply soon!`, "success");
        document.getElementById("contact-us-form").reset();
    }

    // ==========================================================================
    // NOTIFICATIONS SYSTEM
    // ==========================================================================
    showToast(message, type = "success", duration = 4000) {
        const container = document.getElementById("toast-notifications-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        const icon = type === "success" 
            ? '<i class="fa-solid fa-circle-check"></i>' 
            : '<i class="fa-solid fa-circle-exclamation"></i>';

        toast.innerHTML = `
            ${icon}
            <div>${message}</div>
        `;

        container.appendChild(toast);

        // Remove toast after specified duration
        setTimeout(() => {
            toast.style.animation = "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse";
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
}

// ============================================================================
// DEFERRED INITIALIZATION
// app is initialized by auth.js once the user successfully logs in.
// This prevents any content from rendering before authentication.
// ============================================================================
window.appInitialized = false;

// Expose RealEstateApp class globally so auth.js can instantiate it
window.RealEstateApp = RealEstateApp;
