// Cart page JavaScript

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Display cart
  displayCart();
  
  // Setup event listeners
  setupEventListeners();
  
  // Check if user is logged in
  checkUserAuth();
});

// Display cart items and update totals
function displayCart() {
  const cartItems = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('cart-subtotal');
  const totalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('medicineCart') || '[]');
  
  if (cart.length === 0) {
    // Cart is empty
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--border-color); margin-bottom: 15px;"></i>
        <p>Your cart is empty</p>
        <a href="medicines.html" class="btn btn-primary">Browse Medicines</a>
      </div>
    `;
    
    // Update totals
    subtotalElement.textContent = '$0.00';
    totalElement.textContent = '$5.00'; // Shipping cost
    
    // Disable checkout button
    checkoutBtn.disabled = true;
    checkoutBtn.classList.add('disabled');
    
    return;
  }
  
  // Generate HTML for cart items
  let html = '';
  
  cart.forEach(item => {
    html += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image || 'assets/images/medicines/placeholder.jpg'}" alt="${item.name}" class="cart-item-image">
        
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        </div>
        
        <div class="cart-item-quantity">
          <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
        </div>
        
        <div class="cart-item-total">
          $${(item.price * item.quantity).toFixed(2)}
        </div>
        
        <button class="remove-btn" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });
  
  cartItems.innerHTML = html;
  
  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 5.00; // Fixed shipping cost
  const total = subtotal + shipping;
  
  // Update totals
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
  
  // Enable checkout button
  checkoutBtn.disabled = false;
  checkoutBtn.classList.remove('disabled');
  
  // Add event listeners to cart item buttons
  addCartItemEventListeners();
}

// Add event listeners to cart item buttons
function addCartItemEventListeners() {
  // Decrease quantity buttons
  document.querySelectorAll('.decrease-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      updateQuantity(id, -1);
    });
  });
  
  // Increase quantity buttons
  document.querySelectorAll('.increase-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      updateQuantity(id, 1);
    });
  });
  
  // Remove buttons
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      removeFromCart(id);
    });
  });
}

// Update item quantity
function updateQuantity(id, change) {
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('medicineCart') || '[]');
  
  // Find the item
  const itemIndex = cart.findIndex(item => item.id === id);
  
  if (itemIndex === -1) return;
  
  // Update quantity
  cart[itemIndex].quantity += change;
  
  // Remove if quantity is 0 or less
  if (cart[itemIndex].quantity <= 0) {
    removeFromCart(id);
    return;
  }
  
  // Save updated cart
  localStorage.setItem('medicineCart', JSON.stringify(cart));
  
  // Update UI
  displayCart();
  updateCartCount();
}

// Remove item from cart
function removeFromCart(id) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('medicineCart') || '[]');
  
  // Remove the item
  cart = cart.filter(item => item.id !== id);
  
  // Save updated cart
  localStorage.setItem('medicineCart', JSON.stringify(cart));
  
  // Update UI
  displayCart();
  updateCartCount();
  
  // Show toast notification
  showToast('Item removed from cart', 'info');
}

// Update cart count in navbar
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  const cart = JSON.parse(localStorage.getItem('medicineCart') || '[]');
  
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  if (cartCount) {
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }
}

// Check if user is logged in
function checkUserAuth() {
  const user = localStorage.getItem('user');
  
  if (!user) {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html?redirect=cart.html';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Checkout button
  document.getElementById('checkout-btn').addEventListener('click', function() {
    showCheckoutForm();
  });
  
  // Back to cart button
  document.getElementById('back-to-cart-btn').addEventListener('click', function() {
    hideCheckoutForm();
  });
  
  // Payment method change
  document.getElementById('payment-method').addEventListener('change', function() {
    const creditCardFields = document.getElementById('credit-card-fields');
    
    if (this.value === 'credit-card') {
      creditCardFields.style.display = 'block';
    } else {
      creditCardFields.style.display = 'none';
    }
  });
  
  // Order form submission
  document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show processing state
    const submitBtn = document.getElementById('place-order-btn');
    submitBtn.innerHTML = '<span class="loader"></span> Processing...';
    submitBtn.disabled = true;
    
    // Get form data
    const orderData = {
      customer: {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value
      },
      paymentMethod: document.getElementById('payment-method').value,
      notes: document.getElementById('order-notes').value,
      items: JSON.parse(localStorage.getItem('medicineCart') || '[]'),
      total: parseFloat(document.getElementById('cart-total').textContent.replace('$', '')),
      date: new Date().toISOString(),
      status: 'Pending'
    };
    
    // Try to save order to Firebase
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      // Get user ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      orderData.userId = user.uid;
      
      // Save to Firestore
      firebaseDB.addDocument(
        'orders',
        orderData,
        (orderId) => {
          // Order saved successfully
          showOrderSuccess(orderId);
          
          // Clear cart
          localStorage.removeItem('medicineCart');
          updateCartCount();
        },
        (error) => {
          // Error saving order
          console.error('Error saving order:', error);
          
          // Fallback to localStorage
          saveOrderToLocalStorage(orderData);
        }
      );
    } else {
      // Save to localStorage
      saveOrderToLocalStorage(orderData);
    }
  });
}

// Show checkout form
function showCheckoutForm() {
  // Hide cart container
  document.querySelector('.cart-container').style.display = 'none';
  
  // Show checkout form
  document.getElementById('checkout-form-container').style.display = 'block';
  
  // Prefill email if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email) {
    document.getElementById('customer-email').value = user.email;
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hide checkout form
function hideCheckoutForm() {
  // Show cart container
  document.querySelector('.cart-container').style.display = 'flex';
  
  // Hide checkout form
  document.getElementById('checkout-form-container').style.display = 'none';
}

// Save order to localStorage
function saveOrderToLocalStorage(orderData) {
  // Generate order ID
  const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  orderData.id = orderId;
  
  // Get existing orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Add new order
  orders.push(orderData);
  
  // Save orders
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Show success message
  showOrderSuccess(orderId);
  
  // Clear cart
  localStorage.removeItem('medicineCart');
  updateCartCount();
}

// Show order success message
function showOrderSuccess(orderId) {
  // Hide checkout form
  document.getElementById('checkout-form-container').style.display = 'none';
  
  // Set order ID
  document.getElementById('order-id').textContent = orderId;
  
  // Show success message
  document.getElementById('order-success').style.display = 'block';
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
} 