// js/google-auth.js
// Placeholder for handling Google OAuth flows

/**
 * Handle the response from Google Identity Services 
 * Once you integrate: <script src="https://accounts.google.com/gsi/client" async defer></script>
 */
window.handleGoogleCredentialResponse = async function(response) {
    const idToken = response.credential;
    
    if (!idToken) {
        showMessage('loginMessage', 'Google login failed (No token received)', 'danger');
        return;
    }

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idToken })
        });

        const data = await safeJsonParse(res);

        if (res.ok && data && data.token) {
            setToken(data.token);
            showMessage('loginMessage', 'Google Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'quantity.html';
            }, 1000);
        } else {
            const errorMsg = handleApiError(data, 'Google Authentication failed.');
            showMessage('loginMessage', errorMsg, 'danger');
        }
    } catch (e) {
        showMessage('loginMessage', 'Network error connecting to backend.', 'danger');
    }
}

// Removed mock google login code as real GSI is now integrated
