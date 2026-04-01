// js/quantity.js
// Logic for performing calculations and saving to history

let lastCalculation = null;

// The available operations mapping to endpoints
const operationMap = {
    'compare': CONFIG.ENDPOINTS.QUANTITY.COMPARE,
    'convert': CONFIG.ENDPOINTS.QUANTITY.CONVERT,
    'add': CONFIG.ENDPOINTS.QUANTITY.ADD,
    'subtract': CONFIG.ENDPOINTS.QUANTITY.SUBTRACT,
    'divide': CONFIG.ENDPOINTS.QUANTITY.DIVIDE
};

// Define units for different categories — must match backend enum names exactly
const unitCategories = {
    'length': ['Feet', 'Inch', 'Yard', 'Centimeter'],
    'weight': ['Kilogram', 'Gram', 'Pound'],
    'volume': ['LITRE', 'MILLILITRE', 'GALLON'],
    'temperature': ['CELSIUS', 'FAHRENHEIT']
};

function populateUnits() {
    const categorySelect = document.getElementById('category');
    const unit1Select = document.getElementById('unit1');
    const unit2Select = document.getElementById('unit2');
    const targetUnitSelect = document.getElementById('targetUnit');

    const selectedCategory = categorySelect.value.toLowerCase();
    const units = unitCategories[selectedCategory] || [];

    const optionsHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    
    unit1Select.innerHTML = optionsHTML;
    unit2Select.innerHTML = optionsHTML;
    
    if (targetUnitSelect) {
        targetUnitSelect.innerHTML = optionsHTML;
    }
}

function handleOperationChange() {
    const operation = document.getElementById('operation').value;
    const isSingleInput = operation === 'convert';
    
    const value2Group = document.getElementById('value2Group');
    const targetUnitGroup = document.getElementById('targetUnitGroup');
    
    if (isSingleInput) {
        // Convert: need value1+unit1 and a target unit — no second value
        value2Group.style.display = 'none';
        document.getElementById('value2').removeAttribute('required');
    } else {
        value2Group.style.display = 'block';
        document.getElementById('value2').setAttribute('required', 'true');
    }
    
    // Convert/Add/Subtract/Divide need a target unit for the result
    if (['convert', 'add', 'subtract', 'divide'].includes(operation)) {
        targetUnitGroup.style.display = 'block';
    } else {
        targetUnitGroup.style.display = 'none';
    }
}

async function performCalculation(event) {
    event.preventDefault();
    
    const operation = document.getElementById('operation').value;
    const category = document.getElementById('category').value.toLowerCase();
    const value1 = document.getElementById('value1').value;
    const unit1 = document.getElementById('unit1').value;

    // Build the payload matching backend QuantityInputDto
    const payload = {
        category: category,
        value1: parseFloat(value1),
        unit1: unit1
    };

    // Most operations need value2 + unit2
    if (operation !== 'convert') {
        const val2 = document.getElementById('value2').value;
        if (!val2 && val2 !== '0') {
            showMessage('calcMessage', 'Please enter Value 2.', 'warning');
            return;
        }
        payload.value2 = parseFloat(val2);
        payload.unit2 = document.getElementById('unit2').value;
    }

    // Some operations may need targetUnit
    if (['convert', 'add', 'subtract', 'divide'].includes(operation)) {
        payload.targetUnit = document.getElementById('targetUnit').value;
    }

    const resultText = document.getElementById('resultText');
    resultText.textContent = 'Calculating...';
    resultText.style.color = 'var(--text-muted)';

    try {
        const endpoint = operationMap[operation];
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await safeJsonParse(response);

        if (response.ok && data) {
            let displayResult = '';
            
            if (operation === 'compare') {
                // Backend returns isEqual boolean and result string
                displayResult = data.result || (data.isEqual ? 'Values are Equal' : 'Values are Not Equal');
            } else if (operation === 'divide') {
                // Backend returns divisionResult
                displayResult = `Result: ${data.divisionResult !== undefined ? data.divisionResult : data.result}`;
            } else {
                // convert, add, subtract — backend returns result string
                displayResult = `Result: ${data.result}`;
            }

            if (data.message) {
                displayResult += ` — ${data.message}`;
            }

            resultText.textContent = displayResult;
            resultText.style.color = 'var(--success)';
            
            // Keep object in memory for Save to History
            lastCalculation = {
                category: category,
                operation: operation,
                value1: payload.value1,
                unit1: payload.unit1,
                value2: payload.value2,
                unit2: payload.unit2,
                displayResult: displayResult,
                rawData: data
            };
            
            document.getElementById('saveToHistoryBtn').style.display = 'inline-block';

        } else {
            const errorMsg = data && data.message ? data.message : 'Calculation failed.';
            resultText.textContent = `Error: ${errorMsg}`;
            resultText.style.color = 'var(--danger)';
            lastCalculation = null;
            document.getElementById('saveToHistoryBtn').style.display = 'none';
        }
    } catch (e) {
        console.error('Calculation fetch error:', e);
        resultText.textContent = 'Network Error. Could not connect to API.';
        resultText.style.color = 'var(--danger)';
    }
}

async function saveToHistory() {
    if (!lastCalculation) return;

    if (!isLoggedIn()) {
        showMessage('calcMessage', 'You must log in to save history.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // The backend stores history automatically during operations via the repository.
    // If a dedicated save endpoint exists, call it here with the calculation data.
    showMessage('calcMessage', 'History is saved automatically by the backend when calculations are performed.', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', populateUnits);
        populateUnits(); // Initialize
    }

    const operationSelect = document.getElementById('operation');
    if (operationSelect) {
        operationSelect.addEventListener('change', handleOperationChange);
        handleOperationChange(); // Initialize
    }

    const calcForm = document.getElementById('calcForm');
    if (calcForm) {
        calcForm.addEventListener('submit', performCalculation);
    }

    const saveHistoryBtn = document.getElementById('saveToHistoryBtn');
    if (saveHistoryBtn) {
        saveHistoryBtn.addEventListener('click', saveToHistory);
    }
});
