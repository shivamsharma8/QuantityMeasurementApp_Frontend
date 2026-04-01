// js/config.js
// Configuration constants for the frontend application

const CONFIG = {
    // Backend API base URL - change this to match your running backend port
    API_BASE_URL: 'http://localhost:5050',

    // API Endpoints - matched to actual backend controller routes
    ENDPOINTS: {
        AUTH: {
            REGISTER: '/api/auth/register',
            LOGIN: '/api/auth/login',
            GOOGLE_LOGIN: '/api/auth/google-login'
        },
        QUANTITY: {
            COMPARE: '/api/v1/quantities/compare',
            CONVERT: '/api/v1/quantities/convert',
            ADD: '/api/v1/quantities/add',
            SUBTRACT: '/api/v1/quantities/subtract',
            DIVIDE: '/api/v1/quantities/divide',
            CATEGORIES_UNITS: '/api/v1/quantities/categories/units'
        },
        HISTORY: {
            BASE: '/api/v1/quantities/history',
            BY_OPERATION: '/api/v1/quantities/history/operation',
            BY_CATEGORY: '/api/v1/quantities/history/type'
        }
    }
};
