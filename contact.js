const authCard = document.querySelector('.auth-card');
const switchButtons = document.querySelectorAll('.switch-btn');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const authMessage = document.createElement('p');
authMessage.className = 'auth-message';
authMessage.setAttribute('role', 'alert');
authCard?.appendChild(authMessage);
const passwordModal = document.getElementById('passwordModal');
const forgotPasswordLink = document.querySelector('.forgot-link a');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetIdentifier = document.getElementById('resetIdentifier');
const resetPassword = document.getElementById('resetPassword');
const resetMessage = document.getElementById('resetMessage');

const closePasswordModal = () => {
    if (!passwordModal) return;
    passwordModal.hidden = true;
    forgotPasswordForm?.reset();
    if (resetMessage) resetMessage.textContent = '';
};

forgotPasswordLink?.addEventListener('click', (event) => {
    event.preventDefault();
    if (!passwordModal) return;
    passwordModal.hidden = false;
    resetIdentifier.value = document.getElementById('loginUsername')?.value.trim() || '';
    resetIdentifier.focus();
});

passwordModal?.querySelectorAll('[data-close-password-modal]').forEach((button) => {
    button.addEventListener('click', closePasswordModal);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && passwordModal && !passwordModal.hidden) closePasswordModal();
});

forgotPasswordForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const identifier = resetIdentifier.value.trim().toLowerCase();
    const newPassword = resetPassword.value;
    const accounts = getStoredAccounts();
    const accountIndex = accounts.findIndex((account) =>
        String(account.username || '').toLowerCase() === identifier
        || String(account.email || '').toLowerCase() === identifier
    );

    if (accountIndex === -1) {
        resetMessage.textContent = 'No account matches that username or email.';
        return;
    }

    if (newPassword.length < 6) {
        resetMessage.textContent = 'Password must contain at least 6 characters.';
        return;
    }

    accounts[accountIndex].password = newPassword;
    localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(accounts));
    localStorage.setItem(AUTH_CURRENT_ACCOUNT_KEY, accounts[accountIndex].username);
    document.getElementById('loginUsername').value = accounts[accountIndex].username;
    closePasswordModal();
    authMessage.textContent = 'Password updated. You can now log in.';
});

const setUserProfile = (name, email = '') => {
    const cleanName = (name || '').trim();
    if (!cleanName) return;

    localStorage.setItem('new-horizon-user-name', cleanName);
    localStorage.setItem('new-horizon-fullName', cleanName);

    if (email) {
        localStorage.setItem('new-horizon-email', email.trim());
    }
};

if (authCard && loginForm && registerForm) {
    const setView = (target) => {
        const isRegister = target === 'register';
        authCard.classList.toggle('is-register', isRegister);
        loginForm.setAttribute('aria-hidden', String(isRegister));
        registerForm.setAttribute('aria-hidden', String(!isRegister));
    };

    switchButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setView(button.dataset.target || 'login');
        });
    });

    const queryView = new URLSearchParams(window.location.search).get('view');
    setView(queryView === 'register' ? 'register' : 'login');

    const registeredUsername = new URLSearchParams(window.location.search).get('registered');
    if (registeredUsername) {
        const usernameInput = document.getElementById('loginUsername');
        if (usernameInput) usernameInput.value = registeredUsername;
        authMessage.textContent = 'Account created. Please log in to continue.';
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        const username = usernameInput?.value.trim() || '';
        const password = passwordInput?.value || '';
        const account = getStoredAccounts().find((storedAccount) =>
            storedAccount.username === username && storedAccount.password === password
        );

        if (!account) {
            authMessage.textContent = 'Incorrect username or password.';
            return;
        }

        localStorage.setItem(AUTH_CURRENT_ACCOUNT_KEY, account.username);
        setUserProfile(account.username, account.email);
        if (!localStorage.getItem('new-horizon-memberSince')) {
            localStorage.setItem('new-horizon-memberSince', account.createdAt || new Date().toISOString());
        }
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        window.location.href = 'Horizon_dashboard.html';
    });

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('registerUsername');
        const emailInput = document.getElementById('registerEmail');
        const username = usernameInput?.value?.trim() || 'Daniel';
        const email = emailInput?.value?.trim() || 'daniel@email.com';
        const password = document.getElementById('registerPassword')?.value || '';

        if (password.length < 6) {
            authMessage.textContent = 'Password must contain at least 6 characters.';
            setView('register');
            return;
        }

        const accounts = getStoredAccounts();
        const existingAccount = accounts.some((account) => account.username.toLowerCase() === username.toLowerCase());

        if (existingAccount) {
            authMessage.textContent = 'That username is already registered.';
            setView('register');
            return;
        }

        const account = {
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        accounts.push(account);
        localStorage.setItem(AUTH_ACCOUNT_KEY, JSON.stringify(accounts));
        localStorage.setItem(AUTH_CURRENT_ACCOUNT_KEY, username);
        setUserProfile(username, email);
        registerForm.reset();
        window.location.replace(`contact.html?view=login&registered=${encodeURIComponent(username)}`);
    });
}