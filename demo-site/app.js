// Initialize app
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];
let user = JSON.parse(localStorage.getItem('user')) || null;

// Fetch products
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(productsToDisplay) {
    const grid = document.getElementById('productsGrid');
    const container = document.getElementById('popularProductsContainer');

    if (!grid && !container) return;

    const html = productsToDisplay.map(product => `
        <div class="product-card">
            <div class="product-image">${product.image}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price}</span>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add Cart</button>
                </div>
            </div>
        </div>
    `).join('');

    if (grid) grid.innerHTML = html;
    if (container) container.innerHTML = html.substring(0, html.lastIndexOf('</div>') + 6); // Show first few items
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.name} added to cart!`);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Display cart
function displayCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    const html = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price}</p>
                <p>Qty: ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="btn btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');

    cartItems.innerHTML = html;
    updateCartTotal();
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        cartTotal.textContent = total.toFixed(2);
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 2000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Cart modal
const cartModal = document.getElementById('cartModal');
const cartLink = document.getElementById('cartLink');
const closeBtn = document.querySelector('.close');

if (cartLink) {
    cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayCart();
        cartModal.classList.add('show');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        cartModal.classList.remove('show');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('show');
    }
});

// Login handling
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const loginLink = document.getElementById('loginLink');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email && password) {
            user = { email, loggedIn: true };
            localStorage.setItem('user', JSON.stringify(user));
            showNotification('Login successful!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        if (email && password) {
            user = { email, loggedIn: true };
            localStorage.setItem('user', JSON.stringify(user));
            showNotification('Account created and logged in!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        user = null;
        showNotification('Logged out successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// Update UI based on login status
function updateAuthUI() {
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('loginLink');
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.loggedIn) {
        if (logoutBtn) logoutBtn.style.display = 'block';
        if (loginLink) loginLink.style.display = 'none';
    } else {
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginLink) loginLink.style.display = 'block';
    }
}

// Filter products by category
document.querySelectorAll('.category-filter').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        filterProducts();
    });
});

function filterProducts() {
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);

    if (selectedCategories.length === 0) {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => selectedCategories.includes(p.category));
        displayProducts(filtered);
    }
}

function resetFilters() {
    document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
    displayProducts(products);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    updateAuthUI();
});
