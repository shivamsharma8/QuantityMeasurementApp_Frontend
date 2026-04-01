// js/common.js
// General utilities and helpers for the application

const StorageKeys = {
    TOKEN: 'qma_jwt_token',
    USER: 'qma_user_info'
};

function getToken() {
    return localStorage.getItem(StorageKeys.TOKEN);
}

function setToken(token) {
    localStorage.setItem(StorageKeys.TOKEN, token);
}

function setUser(user) {
    localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
}

function getUser() {
    try {
        const u = localStorage.getItem(StorageKeys.USER);
        return u ? JSON.parse(u) : null;
    } catch { return null; }
}

function removeToken() {
    localStorage.removeItem(StorageKeys.TOKEN);
    localStorage.removeItem(StorageKeys.USER);
}

function isLoggedIn() {
    return !!getToken();
}

function authHeader() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function safeJsonParse(response) {
    try {
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (e) {
        console.error("JSON parse error:", e);
        return null;
    }
}

function showMessage(elementId, message, type = 'info') {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.className = `alert alert-${type}`;
    container.textContent = message;
    container.style.display = 'block';

    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }
}

function handleApiError(error, fallbackMessage) {
    console.error('API Error:', error);
    if (!error) return fallbackMessage;

    if (typeof error === 'object') {
        // ASP.NET Core MVC Validation Errors (400 Bad Request)
        if (error.errors && typeof error.errors === 'object') {
            const errorMessages = Object.values(error.errors).flat();
            return errorMessages.join(' ');
        }
        
        // Exact exception messages returned by our controllers
        if (error.Message) return error.Message;
        if (error.message) return error.message;
    }
    
    if (typeof error === 'string') return error;
    
    return fallbackMessage;
}

function redirectIfNotLoggedIn(redirectUrl = 'login.html') {
    if (!isLoggedIn()) {
        window.location.href = redirectUrl;
    }
}

function updateNavbarAuthState() {
    const loggedInUser = isLoggedIn();
    const guestLinks = document.querySelectorAll('.guest-only');
    const authLinks = document.querySelectorAll('.auth-only');

    guestLinks.forEach(link => {
        link.style.display = loggedInUser ? 'none' : '';
    });

    authLinks.forEach(link => {
        link.style.display = loggedInUser ? '' : 'none';
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            removeToken();
            window.location.href = 'index.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbarAuthState();
    setupLogout();
});
