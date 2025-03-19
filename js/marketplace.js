
// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Fetch Items from Backend
async function fetchItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/items`);
        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        showErrorMessage('Failed to load items. Please try again later.');
    }
}

// Display Items in the Grid
function displayItems(items) {
    const itemsGrid = document.querySelector('.items-grid');
    itemsGrid.innerHTML = '';

    items.forEach(item => {
        const itemCard = createItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
}

// Create Item Card Element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.setAttribute('data-aos', 'fade-up');

    card.innerHTML = `
        <div class="item-badge ${item.type.toLowerCase()}">${getBadgeIcon(item.type)} ${item.type}</div>
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
            <span class="item-category">${item.category}</span>
            <h3>${item.name}</h3>
            <p class="item-description">${item.description}</p>
            <div class="eco-stats">
                ${getEcoStats(item)}
            </div>
            <div class="item-actions">
                <button class="recycle-btn" onclick="handleItemAction('${item.id}', '${item.type}')">${getActionButtonText(item.type)}</button>
                <button class="info-btn" onclick="showItemDetails('${item.id}')"><i class="fas fa-info-circle"></i></button>
            </div>
        </div>
    `;

    return card;
}

// Category Navigation
const categoryItems = document.querySelectorAll('.category-item');

categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        categoryItems.forEach(cat => cat.classList.remove('active'));
        item.classList.add('active');
        filterItemsByCategory(item.getAttribute('href').substring(1));
    });
});

// Filter Items by Category
async function filterItemsByCategory(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/items?category=${category}`);
        if (!response.ok) {
            throw new Error('Failed to fetch filtered items');
        }
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Error filtering items:', error);
        showErrorMessage('Failed to filter items. Please try again later.');
    }
}

// Helper Functions
function getBadgeIcon(type) {
    const icons = {
        'RECYCLE': '♻️',
        'DONATE': '❤️',
        'REFURBISH': '🔧'
    };
    return icons[type.toUpperCase()] || '📦';
}

function getActionButtonText(type) {
    const actions = {
        'RECYCLE': 'Schedule Pickup',
        'DONATE': 'Arrange Donation',
        'REFURBISH': 'Request Refurbishment'
    };
    return actions[type.toUpperCase()] || 'Take Action';
}

function getEcoStats(item) {
    if (!item.ecoStats) return '';

    return Object.entries(item.ecoStats)
        .map(([key, value]) => `<span><i class="fas fa-${getEcoIcon(key)}"></i> ${value}</span>`)
        .join('');
}

function getEcoIcon(statType) {
    const icons = {
        'trees': 'tree',
        'water': 'water',
        'co2': 'cloud',
        'energy': 'bolt'
    };
    return icons[statType.toLowerCase()] || 'chart-line';
}

// Error Handling
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const container = document.querySelector('.items-grid');
    container.prepend(errorDiv);

    setTimeout(() => errorDiv.remove(), 5000);
}

// Handle Item Actions
async function handleItemAction(itemId, type) {
    try {
        const action = type.toLowerCase();
        const response = await fetch(`${API_BASE_URL}/${action}s`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                itemId,
                action,
                scheduledDate: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to ${action} item`);
        }

        const result = await response.json();
        showSuccessMessage(`Successfully scheduled ${action} for item`);
        showSchedulingModal(result);
    } catch (error) {
        console.error(`Error handling ${type} action:`, error);
        showErrorMessage(`Failed to schedule ${type.toLowerCase()}. Please try again later.`);
    }
}

// Show Scheduling Modal
function showSchedulingModal(scheduleData) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Scheduled Successfully</h2>
            <p>Your ${scheduleData.action} has been scheduled.</p>
            <p>Reference Number: ${scheduleData.id}</p>
            <p>Date: ${new Date(scheduleData.scheduledDate).toLocaleDateString()}</p>
            <button onclick="this.closest('.modal').remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Success Message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;

    const container = document.querySelector('.items-grid');
    container.prepend(successDiv);

    setTimeout(() => successDiv.remove(), 5000);
}

// Get Auth Token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Impact Calculator
function calculateImpact(itemType, quantity) {
    const impacts = {
        books: {
            trees: 0.1,
            water: 100 // liters
        },
        clothes: {
            water: 2700, // liters per kg
            co2: 10 // kg
        },
        electronics: {
            co2: 20, // kg
            rawMaterials: 5 // kg
        }
    };

    return impacts[itemType];
}

// Info Button Tooltips
const infoButtons = document.querySelectorAll('.info-btn');

infoButtons.forEach(button => {
    button.addEventListener('click', showItemInfo);
});

function showItemInfo(e) {
    const button = e.currentTarget;
    const item = button.closest('.item-card');
    const itemType = item.querySelector('.item-category').textContent.toLowerCase();
    const impact = calculateImpact(itemType, 1);
    
    // Show impact information (to be implemented)
    showImpactModal(impact);
}

function showImpactModal(impact) {
    // Implementation for impact information modal
    console.log('Environmental Impact:', impact);
}

// Location-based Filtering
const locationSelect = document.querySelector('.location-select');

locationSelect.addEventListener('change', async () => {
    const location = locationSelect.value;
    try {
        const response = await fetch(`${API_BASE_URL}/items?location=${location}`);
        if (!response.ok) {
            throw new Error('Failed to filter by location');
        }
        const items = await response.json();
        displayItems(items);
    } catch (error) {
        console.error('Error filtering by location:', error);
        showErrorMessage('Failed to filter by location. Please try again later.');
    }
});

// Quick Actions
const actionCards = document.querySelectorAll('.action-card');

actionCards.forEach(card => {
    card.addEventListener('click', async () => {
        const action = card.querySelector('h3').textContent;
        try {
            const response = await fetch(`${API_BASE_URL}/actions/${action.toLowerCase()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to perform ${action}`);
            }

            const result = await response.json();
            showSuccessMessage(`Successfully initiated ${action}`);
        } catch (error) {
            console.error('Error handling quick action:', error);
            showErrorMessage(`Failed to perform ${action}. Please try again later.`);
        }
    });
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    fetchItems();
});
