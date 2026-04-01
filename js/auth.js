// js/auth.js
// Handles normal email/password authentication (login, register)

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showMessage('loginMessage', 'Please enter email and password', 'danger');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await safeJsonParse(response);

        if (response.ok && data && data.token) {
            setToken(data.token);
            setUser({ name: data.fullName, email: data.email, role: data.role });
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'quantity.html';
            }, 1000);
        } else {
            const errorMsg = handleApiError(data, 'Login failed. Please check your credentials.');
            showMessage('loginMessage', errorMsg, 'danger');
        }
    } catch (e) {
        showMessage('loginMessage', 'Network error. Please try again later.', 'danger');
    }
}

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        showMessage('registerMessage', 'All fields are required.', 'danger');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('registerMessage', 'Passwords do not match.', 'danger');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName: name, email: email, password: password })
        });

        const data = await safeJsonParse(response);

        if (response.ok) {
            showMessage('registerMessage', 'Registration successful! You can now log in.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const errorMsg = handleApiError(data, 'Registration failed. Please try again.');
            showMessage('registerMessage', errorMsg, 'danger');
        }
    } catch (e) {
        showMessage('registerMessage', 'Network error. Please try again later.', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', loginUser);

    const registerForm = document.getElementById('registerForm');
    if (registerForm) registerForm.addEventListener('submit', registerUser);
});
