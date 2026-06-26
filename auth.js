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
        this.currentUser = null;
        this.pendingOTP = null;
        this.pendingOTPMobile = null;
        this.otpExpiry = null;

        // Active tab: 'email' or 'otp'
        this.activeLoginTab = "email";
        // Current form mode in email tab: 'login' or 'register'
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
        // Tab switching: Email vs OTP
        const emailTab = document.getElementById("login-tab-email");
        const otpTab = document.getElementById("login-tab-otp");
        if (emailTab) emailTab.addEventListener("click", () => this._switchLoginTab("email"));
        if (otpTab) otpTab.addEventListener("click", () => this._switchLoginTab("otp"));

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

        // OTP: Send OTP button
        const sendOtpBtn = document.getElementById("send-otp-btn");
        if (sendOtpBtn) {
            sendOtpBtn.addEventListener("click", () => this._handleSendOTP());
        }

        // OTP: Verify OTP form
        const otpVerifyForm = document.getElementById("otp-verify-form");
        if (otpVerifyForm) {
            otpVerifyForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this._handleVerifyOTP();
            });
        }

        // OTP: Resend OTP
        const resendOtpBtn = document.getElementById("resend-otp-btn");
        if (resendOtpBtn) {
            resendOtpBtn.addEventListener("click", (e) => {
                e.preventDefault();
                this._handleSendOTP(true);
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
     * Switch between Email and OTP login tabs
     */
    _switchLoginTab(tab) {
        this.activeLoginTab = tab;

        const emailTabBtn = document.getElementById("login-tab-email");
        const otpTabBtn = document.getElementById("login-tab-otp");
        const emailPanel = document.getElementById("login-panel-email");
        const otpPanel = document.getElementById("login-panel-otp");

        if (tab === "email") {
            emailTabBtn.classList.add("active");
            otpTabBtn.classList.remove("active");
            emailPanel.classList.add("active");
            otpPanel.classList.remove("active");
        } else {
            otpTabBtn.classList.add("active");
            emailTabBtn.classList.remove("active");
            otpPanel.classList.add("active");
            emailPanel.classList.remove("active");
        }
        this._clearLoginErrors();
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
     * Handle Send OTP
     */
    _handleSendOTP(isResend = false) {
        const mobile = document.getElementById("otp-mobile").value.trim();

        if (!/^\d{10}$/.test(mobile)) {
            this._showLoginError("otp-error", "Please enter a valid 10-digit mobile number.");
            return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.pendingOTP = otp;
        this.pendingOTPMobile = mobile;
        this.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // Show OTP to user (simulated - in production this would send via SMS)
        alert(`SMS Sent to ${mobile}.\nYour OTP is: ${otp}`);
        
        // Use app toast if available, otherwise show a prominent alert banner inside the login card
        if (window.app && window.app.showToast) {
            window.app.showToast(
                `📱 OTP for ${mobile}: <strong style="font-size:1.2em; letter-spacing:3px">${otp}</strong> (Valid for 5 min)`,
                "success",
                8000
            );
        } else {
            // Show OTP directly inside the login card via a temporary banner
            this._showOTPBanner(otp, mobile);
        }

        // Show OTP verification section
        const otpMobileSection = document.getElementById("otp-mobile-section");
        const otpVerifySection = document.getElementById("otp-verify-section");
        const sendOtpBtn = document.getElementById("send-otp-btn");

        if (otpMobileSection) otpMobileSection.style.display = "none";
        if (otpVerifySection) otpVerifySection.style.display = "block";
        if (sendOtpBtn) sendOtpBtn.style.display = "none";

        const otpSentInfo = document.getElementById("otp-sent-info");
        if (otpSentInfo) {
            otpSentInfo.textContent = `OTP sent to +91 ${mobile.slice(0, 5)}XXXXX`;
        }

        this._clearLoginErrors();

        if (isResend) {
            this._showLoginSuccess("otp-error", "New OTP sent successfully!");
        }
    }

    /**
     * Handle OTP Verification
     */
    _handleVerifyOTP() {
        const enteredOtp = document.getElementById("otp-input").value.trim();

        if (!enteredOtp) {
            this._showLoginError("otp-error", "Please enter the OTP.");
            return;
        }

        if (Date.now() > this.otpExpiry) {
            this._showLoginError("otp-error", "OTP has expired. Please request a new one.");
            this._resetOTPForm();
            return;
        }

        if (enteredOtp !== this.pendingOTP) {
            this._showLoginError("otp-error", "Incorrect OTP. Please try again.");
            document.getElementById("otp-input").classList.add("shake");
            setTimeout(() => document.getElementById("otp-input").classList.remove("shake"), 500);
            return;
        }

        // OTP verified — find or create user by mobile
        const allUsers = this._getAllUsers();
        let user = allUsers.find(u => u.mobile === this.pendingOTPMobile);

        if (!user) {
            // Create a guest user with this mobile
            user = {
                id: `mobile-${Date.now()}`,
                name: `User ${this.pendingOTPMobile.slice(-4)}`,
                email: `${this.pendingOTPMobile}@mobile.rre`,
                mobile: this.pendingOTPMobile,
                role: "user"
            };
        }

        this.pendingOTP = null;
        this.pendingOTPMobile = null;
        this.otpExpiry = null;

        this._onLoginSuccess(user, true);
    }

    /**
     * Reset OTP form to initial state
     */
    _resetOTPForm() {
        const otpMobileSection = document.getElementById("otp-mobile-section");
        const otpVerifySection = document.getElementById("otp-verify-section");
        const sendOtpBtn = document.getElementById("send-otp-btn");

        if (otpMobileSection) otpMobileSection.style.display = "block";
        if (otpVerifySection) otpVerifySection.style.display = "none";
        if (sendOtpBtn) sendOtpBtn.style.display = "block";

        const otpInput = document.getElementById("otp-input");
        if (otpInput) otpInput.value = "";
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
                    profileModal.style.display = "flex";
                }
            };
        }

        // Setup Profile Modal Close & Logout
        const profileCloseBtn = document.getElementById("profile-close-btn");
        if (profileCloseBtn) {
            profileCloseBtn.onclick = () => {
                document.getElementById("profile-modal").style.display = "none";
            };
        }
        const profileLogoutBtn = document.getElementById("profile-logout-btn");
        if (profileLogoutBtn) {
            profileLogoutBtn.onclick = () => {
                document.getElementById("profile-modal").style.display = "none";
                this.logout();
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

    /**
     * Show OTP in a prominent banner inside the login card (used when app isn't initialized yet)
     */
    _showOTPBanner(otp, mobile) {
        // Remove any existing OTP banner
        const existing = document.getElementById("otp-display-banner");
        if (existing) existing.remove();

        const banner = document.createElement("div");
        banner.id = "otp-display-banner";
        banner.style.cssText = `
            background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08));
            border: 1.5px solid rgba(16,185,129,0.4);
            border-radius: 12px;
            padding: 16px 20px;
            margin: 12px 0;
            text-align: center;
            color: #fff;
            animation: fadeIn 0.3s ease;
        `;
        banner.innerHTML = `
            <div style="font-size:0.82rem; color:#6ee7b7; font-weight:600; margin-bottom:8px;">
                📱 OTP sent to +91 ${mobile.slice(0, 5)}XXXXX (Demo Mode)
            </div>
            <div style="font-size:2rem; font-weight:800; letter-spacing:10px; color:#fff; font-family:monospace;">
                ${otp}
            </div>
            <div style="font-size:0.75rem; color:rgba(255,255,255,0.5); margin-top:6px;">
                Valid for 5 minutes · Copy and enter below
            </div>
        `;

        // Insert before the otp-verify-section
        const verifySection = document.getElementById("otp-verify-section");
        if (verifySection) {
            verifySection.insertBefore(banner, verifySection.firstChild);
        }

        // Auto-remove banner after 30 seconds
        setTimeout(() => {
            if (banner.parentNode) banner.remove();
        }, 30000);
    }
}

// Initialize auth on DOM ready
const auth = new AuthManager();
window.auth = auth;

document.addEventListener("DOMContentLoaded", () => {
    auth.init();
});
