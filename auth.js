/**
 * Rental Real Estate - Authentication Manager
 * Handles: Email/Password login, Mobile OTP login, Session, Role-based access
 */

class AuthManager {
    constructor() {
        // Pre-set user accounts (admin + demo user)
        this.PRESET_USERS = [
            {
                id: "admin-001",
                name: "Admin",
                email: "admin@rentalrealestate.com",
                password: "Admin@1234",
                mobile: "9999999999",
                role: "admin"
            },
            {
                id: "user-001",
                name: "Demo User",
                email: "user@demo.com",
                password: "Demo@1234",
                mobile: "8888888888",
                role: "user"
            }
        ];

        this.SESSION_KEY = "rre_auth_session";
        this.REGISTERED_USERS_KEY = "rre_registered_users";

        this.emailFormMode = "login";
    }

    /**
     * Initialize auth system - called on page load
     */
    init() {
        this.checkExistingSession();

        // Attach event listeners for the login overlay
        this._attachOverlayEvents();
    }

    /**
     * Check if a session already exists (from sessionStorage)
     */
    checkExistingSession() {
        const sessionData = sessionStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
            try {
                const user = JSON.parse(sessionData);
                this.currentUser = user;
                // Directly init without showing overlay — user was already logged in
                this._updateNavForUser(user);
                if (!window.appInitialized) {
                    if (typeof RealEstateApp !== "undefined") {
                        window.app = new RealEstateApp();
                        window.appInitialized = true;
                    }
                }
                return true;
            } catch (e) {
                sessionStorage.removeItem(this.SESSION_KEY);
            }
        }
        // No valid session — show login overlay
        this._showLoginOverlay();
        return false;
    }

    /**
     * Get all users (preset + registered)
     */
    _getAllUsers() {
        const storedUsers = localStorage.getItem(this.REGISTERED_USERS_KEY);
        const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
        return [...this.PRESET_USERS, ...registeredUsers];
    }

    /**
     * Show the login overlay
     */
    _showLoginOverlay() {
        const overlay = document.getElementById("login-overlay");
        if (overlay) {
            overlay.classList.add("active");
            document.body.classList.add("login-active");
        }
    }

    /**
     * Hide the login overlay with animation
     */
    _hideLoginOverlay() {
        const overlay = document.getElementById("login-overlay");
        if (overlay) {
            overlay.classList.add("hiding");
            setTimeout(() => {
                overlay.classList.remove("active", "hiding");
                document.body.classList.remove("login-active");
            }, 600);
        }
    }

    /**
     * Attach all event listeners for the login overlay
     */
    _attachOverlayEvents() {
        // Email/Password Form
        const emailLoginForm = document.getElementById("email-login-form");
        if (emailLoginForm) {
            emailLoginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this._handleEmailLogin();
            });
        }

        // Register Form
        const registerForm = document.getElementById("register-form");
        if (registerForm) {
            registerForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this._handleRegister();
            });
        }

        // Toggle: show register form
        const showRegisterBtn = document.getElementById("show-register-btn");
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this._switchEmailFormMode("register");
            });
        }

        // Toggle: show login form
        const showLoginBtn = document.getElementById("show-login-btn");
        if (showLoginBtn) {
            showLoginBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this._switchEmailFormMode("login");
            });
        }



        // Password toggle visibility
        const pwdToggle = document.getElementById("toggle-password-visibility");
        if (pwdToggle) {
            pwdToggle.addEventListener("click", () => {
                const pwdInput = document.getElementById("login-password");
                if (pwdInput.type === "password") {
                    pwdInput.type = "text";
                    pwdToggle.querySelector("i").className = "fa-solid fa-eye-slash";
                } else {
                    pwdInput.type = "password";
                    pwdToggle.querySelector("i").className = "fa-solid fa-eye";
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => this.logout());
        }
    }



    /**
     * Switch between login and register forms in email tab
     */
    _switchEmailFormMode(mode) {
        this.emailFormMode = mode;

        const loginFormWrapper = document.getElementById("login-form-wrapper");
        const registerFormWrapper = document.getElementById("register-form-wrapper");

        if (mode === "register") {
            loginFormWrapper.classList.remove("active");
            registerFormWrapper.classList.add("active");
        } else {
            registerFormWrapper.classList.remove("active");
            loginFormWrapper.classList.add("active");
        }
        this._clearLoginErrors();
    }

    /**
     * Handle email/password login
     */
    _handleEmailLogin() {
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;

        if (!email || !password) {
            this._showLoginError("email-error", "Please enter both email and password.");
            return;
        }

        const allUsers = this._getAllUsers();
        const user = allUsers.find(u => u.email.toLowerCase() === email && u.password === password);

        if (user) {
            this._onLoginSuccess(user, true);
        } else {
            this._showLoginError("email-error", "Invalid email or password. Please try again.");
            // Shake animation
            document.getElementById("email-login-form").classList.add("shake");
            setTimeout(() => document.getElementById("email-login-form").classList.remove("shake"), 500);
        }
    }

    /**
     * Handle self-registration
     */
    _handleRegister() {
        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim().toLowerCase();
        const mobile = document.getElementById("register-mobile").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm-password").value;

        if (!name || !email || !mobile || !password) {
            this._showLoginError("register-error", "Please fill in all fields.");
            return;
        }

        if (!/^\d{10}$/.test(mobile)) {
            this._showLoginError("register-error", "Please enter a valid 10-digit mobile number.");
            return;
        }

        if (password.length < 6) {
            this._showLoginError("register-error", "Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            this._showLoginError("register-error", "Passwords do not match.");
            return;
        }

        // Check if email already exists
        const allUsers = this._getAllUsers();
        if (allUsers.find(u => u.email.toLowerCase() === email)) {
            this._showLoginError("register-error", "This email is already registered. Please log in.");
            return;
        }

        // Create new user
        const newUser = {
            id: `user-${Date.now()}`,
            name,
            email,
            mobile,
            password,
            role: "user"
        };

        // Save to localStorage
        const storedUsers = localStorage.getItem(this.REGISTERED_USERS_KEY);
        const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
        registeredUsers.push(newUser);
        localStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));

        this._onLoginSuccess(newUser, true);
    }



    /**
     * Called on successful login
     */
    _onLoginSuccess(user, saveSession) {
        this.currentUser = user;

        if (saveSession) {
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        }

        // Hide login overlay
        this._hideLoginOverlay();

        // Update nav UI for this user
        this._updateNavForUser(user);

        // Initialize the main app if not already done
        if (!window.appInitialized) {
            if (typeof RealEstateApp !== "undefined") {
                window.app = new RealEstateApp();
                window.appInitialized = true;
            }
        } else if (window.app) {
            // Re-render in case data changed
            window.app.renderFlats(window.app.flats);
            window.app.renderPGs(window.app.pgs);
        }

        if (window.app && window.app.showToast) {
            window.app.showToast(`Welcome back, <strong>${user.name}</strong>! 👋`, "success");
        }
    }

    /**
     * Update navigation based on logged-in user role
     */
    _updateNavForUser(user) {
        const adminNavLink = document.getElementById("admin-nav-btn");
        const logoutBtn = document.getElementById("logout-btn");
        const userInfoBadge = document.getElementById("nav-user-badge");
        const footerAdminLink = document.getElementById("footer-admin-link");

        // Show/hide admin nav link
        if (adminNavLink) {
            if (user.role === "admin") {
                adminNavLink.style.display = "flex";
            } else {
                adminNavLink.style.display = "none";
            }
        }

        // Show/hide footer admin link
        if (footerAdminLink) {
            if (user.role === "admin") {
                footerAdminLink.style.display = "block";
            } else {
                footerAdminLink.style.display = "none";
            }
        }

        // Show logout button
        if (logoutBtn) {
            logoutBtn.style.display = "flex";
        }

        // Show user badge and make it clickable for profile
        if (userInfoBadge) {
            userInfoBadge.style.display = "flex";
            userInfoBadge.style.cursor = "pointer";
            const nameSpan = userInfoBadge.querySelector(".nav-user-name");
            if (nameSpan) nameSpan.textContent = user.name;

            // Show admin badge if admin
            const roleBadge = userInfoBadge.querySelector(".nav-role-badge");
            if (roleBadge) {
                if (user.role === "admin") {
                    roleBadge.style.display = "inline-block";
                } else {
                    roleBadge.style.display = "none";
                }
            }

            // Bind click to open profile modal
            userInfoBadge.onclick = () => {
                const profileModal = document.getElementById("profile-modal");
                if (profileModal) {
                    document.getElementById("profile-name").textContent = user.name;
                    document.getElementById("profile-role").textContent = user.role === "admin" ? "Admin" : "User";
                    document.getElementById("profile-email").textContent = user.email;
                    document.getElementById("profile-mobile").textContent = user.mobile;
                    
                    if (window.app) {
                        window.app.renderProfileData(user);
                    }
                    
                    profileModal.style.display = "flex";
                    profileModal.classList.add("active");
                }
            };

        }

        // Setup Profile Modal Close & Logout
        const profileCloseBtn = document.getElementById("profile-close-btn");
        if (profileCloseBtn) {
            profileCloseBtn.onclick = () => {
                document.getElementById("profile-modal").style.display = "none";
                document.getElementById("profile-modal").classList.remove("active");
            };
        }
        const profileLogoutBtn = document.getElementById("profile-logout-btn");
        if (profileLogoutBtn) {
            profileLogoutBtn.onclick = () => {
                document.getElementById("profile-modal").style.display = "none";
                document.getElementById("profile-modal").classList.remove("active");
                this.logout();
            };
        }

        const profileEditBtn = document.getElementById("profile-edit-btn");
        if (profileEditBtn) {
            profileEditBtn.onclick = () => {
                const nameSpan = document.getElementById("profile-name");
                const nameInput = document.getElementById("edit-profile-name");
                const mobileSpan = document.getElementById("profile-mobile");
                const mobileInput = document.getElementById("edit-profile-mobile");

                if (nameInput.style.display === "none") {
                    // Enter edit mode
                    nameInput.value = nameSpan.textContent;
                    mobileInput.value = mobileSpan.textContent;

                    nameSpan.style.display = "none";
                    nameInput.style.display = "block";
                    mobileSpan.style.display = "none";
                    mobileInput.style.display = "block";

                    profileEditBtn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
                } else {
                    // Save mode
                    const user = this.getCurrentUser();
                    if (!user) return;

                    user.name = nameInput.value;
                    user.mobile = mobileInput.value;

                    nameSpan.textContent = user.name;
                    mobileSpan.textContent = user.mobile;

                    nameSpan.style.display = "block";
                    nameInput.style.display = "none";
                    mobileSpan.style.display = "block";
                    mobileInput.style.display = "none";

                    profileEditBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Edit Profile';

                    // Update session
                    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));

                    // Update registered users
                    const storedUsers = localStorage.getItem(this.REGISTERED_USERS_KEY);
                    if (storedUsers) {
                        let registeredUsers = JSON.parse(storedUsers);
                        let changed = false;
                        for (let i = 0; i < registeredUsers.length; i++) {
                            if (registeredUsers[i].email === user.email) {
                                registeredUsers[i].name = user.name;
                                registeredUsers[i].mobile = user.mobile;
                                changed = true;
                                break;
                            }
                        }
                        if (changed) {
                            localStorage.setItem(this.REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
                        }
                    }

                    // Update UI (nav badge etc)
                    this._updateNavForUser(user);
                    if (window.app) window.app.showToast("Profile updated successfully!", "success");
                }
            };
        }

    }

    /**
     * Log out the current user
     */
    logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        this.currentUser = null;

        // Reset app state
        window.appInitialized = false;

        // Show toast then reload
        if (window.app && window.app.showToast) {
            window.app.showToast("You have been logged out. See you soon!", "success");
            setTimeout(() => location.reload(), 1200);
        } else {
            location.reload();
        }
    }

    /**
     * Get current logged-in user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if current user is an admin
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === "admin";
    }

    /**
     * Show error inside the login overlay
     */
    _showLoginError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.className = "login-error-msg active error";
        }
    }

    /**
     * Show success message inside the login overlay
     */
    _showLoginSuccess(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.className = "login-error-msg active success";
        }
    }

    /**
     * Clear all error messages in login overlay
     */
    _clearLoginErrors() {
        document.querySelectorAll(".login-error-msg").forEach(el => {
            el.className = "login-error-msg";
            el.textContent = "";
        });
    }


}

// Initialize auth on DOM ready
const auth = new AuthManager();
window.auth = auth;

document.addEventListener("DOMContentLoaded", () => {
    auth.init();
});
