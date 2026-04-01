// js/history.js
// Logic for fetching and displaying calculation history

// Immediately protect the page on script load
redirectIfNotLoggedIn();

async function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const historyTableContainer = document.getElementById('historyTableContainer');

    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    historyTableContainer.style.display = 'none';

    try {
        // Backend exposes history by operation: GET /api/v1/quantities/history/operation/{operation}
        // and by category: GET /api/v1/quantities/history/type/{category}
        // We'll fetch for each known operation type and combine results
        const operations = ['Compare', 'Convert', 'Add', 'Subtract', 'Divide'];
        let allHistory = [];

        for (const op of operations) {
            try {
                const response = await fetch(
                    `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.HISTORY.BY_OPERATION}/${op}`,
                    { headers: authHeader() }
                );
                if (response.ok) {
                    const data = await safeJsonParse(response);
                    if (Array.isArray(data)) {
                        allHistory = allHistory.concat(data);
                    }
                }
            } catch (innerErr) {
                console.warn(`Could not fetch history for operation: ${op}`, innerErr);
            }
        }

        if (allHistory.length === 0) {
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            renderHistoryTable(allHistory, tableBody);
            loadingState.style.display = 'none';
            historyTableContainer.style.display = 'block';
        }
    } catch (e) {
        showMessage('historyMessage', 'Network Error. Could not connect to API.', 'danger');
        loadingState.style.display = 'none';
    }
}

function renderHistoryTable(data, tableBody) {
    tableBody.innerHTML = '';
    
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        // Backend QuantityMeasurementDto has: isSuccess, message, category, operationType, result, isEqual, divisionResult
        const operationType = item.operationType || 'N/A';
        const category = item.category || 'N/A';
        const result = item.result || (item.isEqual ? 'Equal' : 'Not Equal');
        const message = item.message || '';

        tr.innerHTML = `
            <td>${operationType}</td>
            <td>${category}</td>
            <td><strong>${result}</strong></td>
            <td>${message}</td>
        `;
        tableBody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Only fetch data if we are still logged in (redirect might have triggered)
    if (isLoggedIn()) {
        loadHistory();
    }
});
