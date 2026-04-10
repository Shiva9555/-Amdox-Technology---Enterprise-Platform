/**
 * Amdox Technology - Diagnostic & Resilience Engine v3.0
 * Hardened for Chrome Local File Execution
 */

window.AMDOX = {
    session: null,
    
    // 1. Universal Flash Toast System
    showToast: (msg, type = 'info') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'error' ? '❌' : (type === 'success' ? '✅' : '✨')}</span> ${msg}`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    // 1b. Diagnostic Heartbeat
    initDiagnostics: () => {
        const diag = document.createElement('div');
        diag.style = "position: fixed; bottom: 10px; left: 10px; font-size: 10px; color: var(--text-secondary); opacity: 0.5; z-index: 10000; pointer-events: none;";
        const lsOk = (() => { try { localStorage.setItem('test', '1'); return true; } catch(e) { return false; } })();
        diag.innerHTML = `AMDOX v3.2 | Storage: ${lsOk ? 'LOCAL_OK' : 'SESSION_ONLY'} | Page detected: ${AMDOX.getCurrentPage()}`;
        document.body.appendChild(diag);
    },

    // 2. OS-Agnostic Page Detection
    getCurrentPage: () => {
        const path = window.location.pathname;
        const match = path.match(/\/([^\/]+\.html)$/);
        return (match ? match[1] : 'index.html').toLowerCase();
    },

    // 3. Robust Data Storage (LocalStorage + Fallback)
    save: (key, val) => {
        try {
            localStorage.setItem(key, val);
            return true;
        } catch (e) {
            window.name = JSON.stringify({ ...JSON.parse(window.name || '{}'), [key]: val });
            return true;
        }
    },
    
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            const data = JSON.parse(window.name || '{}');
            return data[key];
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AMDOX.initDiagnostics();
    const page = AMDOX.getCurrentPage();
    const user = AMDOX.get('amdox_user');
    
    console.log(`[Amdox] Engine v3.2 | Page: ${page} | User: ${user || 'Guest'}`);

    // --- A. Auth Guard (Non-Blocking) ---
    const protected = ['index', 'dashboard', 'kanban', 'attendance', 'scanner', 'team', 'settings', 'team.html'];
    if (protected.some(p => page.includes(p)) && !user) {
        AMDOX.showToast("Verification Required. Redirecting...", "info");
        setTimeout(() => window.location.href = 'login.html', 1500);
        // Continue script to allow basic UI interaction
    }

    // --- B. Navigation Highlighting ---
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && href !== '#' && page.includes(href.toLowerCase())) {
            item.classList.add('active');
        }
    });

    // --- C. Global Profile Sync ---
    if (user) {
        const nameDisplays = document.querySelectorAll('.user-profile span, .top-header h1 span');
        const avatars = document.querySelectorAll('.avatar.dynamic-user, .user-profile .avatar');
        const initial = user.charAt(0).toUpperCase();
        const display = user.includes('@') ? user.split('@')[0] : user;

        nameDisplays.forEach(el => el.innerText = display);
        avatars.forEach(el => {
            el.innerText = initial;
            el.style.background = 'var(--accent-gradient)';
        });
        
        const settingsInput = document.getElementById('settingsFullName');
        if (settingsInput) settingsInput.value = user;
    }

    // --- D. General Interaction Handlers (Force-Navigation) ---
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // 1. Sidebar Links Force-Nav
        const navItem = target.closest('.nav-item');
        if (navItem && !navItem.id.includes('logoutBtn')) {
            const href = navItem.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault(); // Stop default to avoid conflict
                AMDOX.showToast(`Navigating to ${href.split('.')[0]}...`, "success");
                setTimeout(() => window.location.href = href, 300);
            }
        }

        // 2. Button Force-Nav (Launch Board, etc.)
        const btnLink = target.closest('a.btn');
        if (btnLink) {
            const href = btnLink.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('mailto')) {
                e.preventDefault();
                AMDOX.showToast("Launching...", "success");
                setTimeout(() => window.location.href = href, 300);
            }
        }

        // 2. Global Logout
        if (target.closest('#logoutBtn')) {
            e.preventDefault();
            localStorage.removeItem('amdox_user');
            AMDOX.showToast("Signed out successfully", "info");
            setTimeout(() => window.location.href = 'login.html', 800);
        }
    });

    // --- E. Module Specific Logic ---

    // 1. Login Page Logic
    if (page.includes('login.html')) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const input = document.getElementById('email').value;
                if (input) {
                    AMDOX.save('amdox_user', input);
                    AMDOX.showToast("Access Granted!", "success");
                    setTimeout(() => window.location.href = 'index.html', 800);
                } else {
                    AMDOX.showToast("Please identify yourself", "error");
                }
            };
        }
    }

    // 2. Settings Page Logic
    if (page.includes('settings.html')) {
        const tabs = document.querySelectorAll('#settingsTabs .nav-item');
        const panels = document.querySelectorAll('.settings-panel');
        
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                e.preventDefault();
                const target = tab.getAttribute('data-target');
                if (!target) return;

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                panels.forEach(p => p.classList.remove('active'));
                const panel = document.getElementById('panel-' + target);
                if (panel) {
                    panel.classList.add('active');
                    AMDOX.showToast(`Switched to ${target}`, "info");
                }
            };
        });

        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const name = document.getElementById('settingsFullName').value;
                if (name) {
                    AMDOX.save('amdox_user', name);
                    AMDOX.showToast("Profile Updated!", "success");
                    setTimeout(() => window.location.reload(), 800);
                }
            };
        }
    }

    // 4. Register Page Logic
    if (page.includes('register.html')) {
        const form = document.getElementById('registerForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const fn = document.getElementById('firstName').value;
                const ln = document.getElementById('lastName').value;
                const em = document.getElementById('email').value;
                const ps = document.getElementById('password').value;
                const cp = document.getElementById('confirmPassword').value;

                if (ps !== cp) { AMDOX.showToast("Passwords mismatch!", "error"); return; }
                if (em && ps) {
                    const name = (fn + " " + ln).trim() || em;
                    AMDOX.save('amdox_user', name);
                    AMDOX.showToast("Account Created!", "success");
                    setTimeout(() => window.location.href = 'index.html', 800);
                } else {
                    AMDOX.showToast("Fields required", "error");
                }
            };
        }
    }

    // 5. Attendance Page Logic
    if (page.includes('attendance.html')) {
        const qrEl = document.getElementById("qrcode");
        const refreshBtn = document.getElementById('refreshQrBtn');
        const checkInBtn = document.getElementById('checkInBtn');
        const checkOutBtn = document.getElementById('checkOutBtn');

        const generateQr = () => {
            if (qrEl && typeof QRCode !== 'undefined') {
                qrEl.innerHTML = '';
                new QRCode(qrEl, { text: "AMDOX-" + Date.now(), width: 160, height: 160 });
            }
        };

        if (refreshBtn) refreshBtn.onclick = () => { generateQr(); AMDOX.showToast("QR Refreshed", "info"); };
        generateQr();

        if (checkInBtn) checkInBtn.onclick = () => {
            AMDOX.showToast("Check-In Successful!", "success");
            checkInBtn.style.display = "none";
            if(checkOutBtn) checkOutBtn.style.display = "inline-block";
            const time = new Date().toLocaleTimeString();
            const log = document.getElementById('attendanceLogs');
            if(log) {
                const row = `<tr><td style="padding:16px">Today</td><td style="padding:16px">${time}</td><td style="padding:16px">--:--</td><td style="padding:16px">Active</td><td style="padding:16px;text-align:right;color:#10b981">Present</td></tr>`;
                log.innerHTML = row + log.innerHTML;
            }
        };

        if (checkOutBtn) checkOutBtn.onclick = () => {
            AMDOX.showToast("Check-Out Successful!", "info");
            setTimeout(() => window.location.reload(), 800);
        };
    }

    // 3. Scanner Page Logic
    if (page.includes('scanner.html')) {
        const scanBtn = document.getElementById('simulateScanBtn');
        if (scanBtn) {
            scanBtn.onclick = () => {
                document.body.classList.add('flash-active');
                setTimeout(() => document.body.classList.remove('flash-active'), 200);
                AMDOX.showToast("Scanning Project Code...", "info");
                setTimeout(() => {
                    const selector = document.getElementById('projectSelect');
                    const project = selector ? selector.options[selector.selectedIndex].text : "Project";
                    AMDOX.showToast(`Found: ${project}! Redirecting...`, "success");
                    setTimeout(() => window.location.href = 'kanban.html', 1500);
                }, 2000);
            };
        }
    }

    // 7. Home Page Specifics
    if (page.includes('index.html')) {
        const learnBtn = document.getElementById('learnMoreBtn');
        if (learnBtn) {
            learnBtn.onclick = () => {
                const target = document.getElementById('featuresSection');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    AMDOX.showToast("Exploring Features...", "info");
                }
            };
        }
    }

    console.log("[Amdox] Module Logic Ready.");
});
