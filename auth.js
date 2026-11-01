const AUTH_ACCOUNT_KEY = 'new-horizon-account';
const AUTH_CURRENT_ACCOUNT_KEY = 'new-horizon-current-account';
const AUTH_SESSION_KEY = 'new-horizon-authenticated';
const GOALS_STORAGE_KEY = 'newhorizon_goals';

const getStoredAccounts = () => {
    try {
        const stored = JSON.parse(localStorage.getItem(AUTH_ACCOUNT_KEY) || 'null');
        if (Array.isArray(stored)) return stored;
        return stored ? [stored] : [];
    } catch {
        return [];
    }
};

const getStoredAccount = () => {
    const accounts = getStoredAccounts();
    const currentUsername = localStorage.getItem(AUTH_CURRENT_ACCOUNT_KEY);
    return accounts.find((account) => account.username === currentUsername) || accounts[0] || null;
};

const isAuthenticated = () =>
    sessionStorage.getItem(AUTH_SESSION_KEY) === 'true' || Boolean(getStoredAccount());

const getCurrentUserGoalsKey = () => {
    const account = getStoredAccount();
    return account?.username
        ? `${GOALS_STORAGE_KEY}:${encodeURIComponent(account.username.toLowerCase())}`
        : null;
};

const getUserGoals = () => {
    const key = getCurrentUserGoalsKey();
    if (!key) return [];

    try {
        const savedGoals = localStorage.getItem(key);
        if (savedGoals !== null) return JSON.parse(savedGoals) || [];

        const legacyGoals = localStorage.getItem(GOALS_STORAGE_KEY);
        if (!legacyGoals) return [];

        const migratedGoals = JSON.parse(legacyGoals) || [];
        localStorage.setItem(key, JSON.stringify(migratedGoals));
        localStorage.removeItem(GOALS_STORAGE_KEY);
        return migratedGoals;
    } catch {
        return [];
    }
};

const saveUserGoals = (goals) => {
    const key = getCurrentUserGoalsKey();
    if (!key) return;

    try {
        localStorage.setItem(key, JSON.stringify(goals));
    } catch (error) {
        console.error('Could not save goals', error);
    }
};

const requireAuthentication = () => {
    if (!isAuthenticated()) {
        window.location.replace('contact.html?view=login');
    }
};

const redirectDashboardIfAuthenticated = () => {
    if (isAuthenticated()) {
        window.location.replace('Horizon_dashboard.html');
    }
};

const logoutUser = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    window.location.replace('contact.html?view=login&loggedOut=true');
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-action="logout"]').forEach((button) => {
        button.addEventListener('click', logoutUser);
    });

    document.querySelectorAll('.topbar-profile').forEach((profileMenu) => {
        const toggle = profileMenu.querySelector('.topbar-avatar');
        const menu = profileMenu.querySelector('.profile-menu');
        if (!toggle || !menu) return;

        const closeMenu = () => {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        menu.addEventListener('click', () => closeMenu());
        document.addEventListener('click', (event) => {
            if (!profileMenu.contains(event.target)) closeMenu();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
                toggle.focus();
            }
        });
    });
});

const bindDashboardNavigation = () => {
    document.querySelectorAll('a').forEach((link) => {
        const destination = new URL(link.href, window.location.href);
        if (!destination.pathname.endsWith('/Horizon_dashboard.html')) return;

        if (link.hasAttribute('data-dashboard-direct')) return;

        link.addEventListener('click', (event) => {
            event.preventDefault();

            if (!isAuthenticated()) {
                window.location.replace('contact.html?view=login');
                return;
            }

            window.location.assign(destination.href);
        });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindDashboardNavigation, { once: true });
} else {
    bindDashboardNavigation();
}

