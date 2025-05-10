// Main JavaScript File

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the UI
  initUI();
  
  // Load cart from localStorage
  loadCart();
  
  // Setup search functionality
  setupSearch();
  
  // Load popular medicines on home page
  if (document.getElementById('popular-medicines')) {
    loadPopularMedicines();
  }
});

// Initialize UI elements and event listeners
function initUI() {
  // Mobile Navigation Toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  if (darkModeToggle) {
    // Check if user previously enabled dark mode
    const darkMode = localStorage.getItem('darkMode') === 'enabled';
    
    // Set initial state
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      darkModeToggle.checked = true;
    }
    
    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
      if (darkModeToggle.checked) {
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
      } else {
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
      }
    });
  }
  
  // Logout button functionality
  const logoutBtn = document.querySelector('.logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Call Firebase signOut
      firebaseAuth.signOut(() => {
        // Redirect to home page
        window.location.href = 'index.html';
        
        // Show toast notification
        showToast('Logged out successfully!', 'success');
      });
    });
  }
}

// Cart Management
let cart = [];

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('medicineCart');
  
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

// Add item to cart
function addToCart(medicine) {
  // Check if already in cart
  const existingItem = cart.find(item => item.id === medicine.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: medicine.id,
      name: medicine.name,
      price: medicine.price,
      image: medicine.image,
      quantity: 1
    });
  }
  
  // Save to localStorage
  saveCart();
  
  // Update UI
  updateCartCount();
  
  // Show toast notification
  showToast(`${medicine.name} added to cart!`, 'success');
}

// Remove item from cart
function removeFromCart(medicineId) {
  cart = cart.filter(item => item.id !== medicineId);
  
  // Save to localStorage
  saveCart();
  
  // Update UI
  updateCartCount();
  
  // If on cart page, update cart display
  if (document.getElementById('cart-items')) {
    displayCart();
  }
}

// Update item quantity
function updateQuantity(medicineId, quantity) {
  const item = cart.find(item => item.id === medicineId);
  
  if (item) {
    item.quantity = quantity;
    
    // Remove if quantity is 0
    if (quantity === 0) {
      removeFromCart(medicineId);
      return;
    }
    
    // Save to localStorage
    saveCart();
    
    // If on cart page, update cart display
    if (document.getElementById('cart-items')) {
      displayCart();
    }
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('medicineCart', JSON.stringify(cart));
}

// Update cart count in UI
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide cart count
    if (totalItems > 0) {
      cartCount.style.display = 'flex';
    } else {
      cartCount.style.display = 'none';
    }
  }
}

// Calculate cart total
function calculateCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}

// Display cart items (for cart page)
function displayCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');
  
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      
      if (cartTotalElement) {
        cartTotalElement.textContent = '$0.00';
      }
      
      // Hide checkout button
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.style.display = 'none';
      }
      
      return;
    }
    
    // Show checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.style.display = 'block';
    }
    
    let cartHTML = '';
    
    cart.forEach(item => {
      cartHTML += `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">
          <div class="cart-item-details">
            <h3 class="cart-item-name">${item.name}</h3>
            <p class="cart-item-price">$${item.price}</p>
          </div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart('${item.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    
    // Update total
    if (cartTotalElement) {
      cartTotalElement.textContent = '$' + calculateCartTotal();
    }
  }
}

// Search Functionality
function setupSearch() {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const recentSearches = document.getElementById('recent-searches');
  const recentSearchList = document.getElementById('recent-search-list');
  
  if (searchForm && searchInput) {
    // Show recent searches when search input is focused
    searchInput.addEventListener('focus', () => {
      const searches = getRecentSearches();
      
      if (searches.length > 0 && recentSearches) {
        displayRecentSearches(searches);
        recentSearches.style.display = 'block';
      }
    });
    
    // Hide recent searches when clicked outside
    document.addEventListener('click', (e) => {
      if (recentSearches && !searchInput.contains(e.target) && !recentSearches.contains(e.target)) {
        recentSearches.style.display = 'none';
      }
    });
    
    // Handle search form submission
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const query = searchInput.value.trim();
      
      if (query !== '') {
        // Add to recent searches
        addToRecentSearches(query);
        
        // Redirect to medicines page with search query
        window.location.href = `medicines.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
}

// Get recent searches from localStorage
function getRecentSearches() {
  const searches = localStorage.getItem('recentSearches');
  return searches ? JSON.parse(searches) : [];
}

// Add search to recent searches
function addToRecentSearches(query) {
  let searches = getRecentSearches();
  
  // Remove if already exists
  searches = searches.filter(search => search.toLowerCase() !== query.toLowerCase());
  
  // Add to beginning of array
  searches.unshift(query);
  
  // Limit to 5 recent searches
  searches = searches.slice(0, 5);
  
  // Save to localStorage
  localStorage.setItem('recentSearches', JSON.stringify(searches));
}

// Display recent searches in UI
function displayRecentSearches(searches) {
  const recentSearchList = document.getElementById('recent-search-list');
  
  if (recentSearchList) {
    let html = '';
    
    searches.forEach(search => {
      html += `
        <li>
          <a href="medicines.html?search=${encodeURIComponent(search)}">
            <i class="fas fa-history"></i> ${search}
          </a>
        </li>
      `;
    });
    
    recentSearchList.innerHTML = html;
  }
}

// Load popular medicines on home page
function loadPopularMedicines() {
  const popularMedicinesContainer = document.getElementById('popular-medicines');
  
  if (popularMedicinesContainer) {
    // Try to get medicines from Firestore first
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      firebaseDB.getCollection('medicines', 
        (medicines) => {
          // Sort by popularity or just display first few
          const popularMeds = medicines.slice(0, 4);
          displayMedicines(popularMeds, popularMedicinesContainer);
        },
        (error) => {
          // Fallback to local data
          loadMedicinesFromJSON();
        }
      );
    } else {
      // Fallback to local data
      loadMedicinesFromJSON();
    }
  }
}

// Fallback: Load medicines from local JSON file
function loadMedicinesFromJSON() {
  // Using hardcoded data instead of fetch to avoid path issues
  const popularMedicines = [
    {
      "id": "med001",
      "name": "Paracetamol",
      "description": "Paracetamol (acetaminophen) is a pain reliever and fever reducer. It is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
      "price": 5.99,
      "image": "data:image/jpeg;base64,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LpMEHXOVEH1alTRbX95UBYDvv4Tc4AAqrX2W1hoLjRjvrt2zRcYwdU1KQSpTqlaj1WRqxptd1CoEAB6oXMdxv8JrQ2uU3Z1N5uw9E+HoagYDq4VeWu+lV1XPY6DRVUWtpm85tcfehTYhgWquRcg7ttax0AAJ108pk6M8NahQCVCDUZnqORqCzsTofK0l8Rw+ZCdcygkWvv5du0mvlvldr09fPqulOm6DhwuUN1VFgdLexTFyL9t2l1bRLMfa6pO2r9eob9lhMmCp3poo1y9VmBB6o1te5JB0EhdK8yYaq2bTIyjUgl6xyXPZYK2mvymdKcdk7mc4d3NrhTXfDIwt6xW9YqLa30aDmAeK5RSUd2S3l3ZpMKjVDa2QKouR23YnTScx0Zo5sY1RWDJToCmrA5tWqX38gf41PXVVuCL2uLd+/hO/icucx931/wCbRjTn5tfg65cZiMtr1DY3BuCFFyB3CUqdHaVTE0MY2Y1KCOiLpkHM9prWvm+MUcPlqMg6qtlGgFgBsNB267n/APd3PLhldnbPGS8uhERNMkREBERAS3IJdECw05by5liBiyGUymZogRhTAJNgCdzbU+ZmOthwwIuVzWJKnK1xbt8gBJspaBpU4Na9q9bU3F2U5esCQDlvrYi5ubMQDtbLjOE0amUtTRmQHll1zhWIIzZToTrNrlEsaiD3/AkfjLxXqOFxPo+5htUxVRlLF37S7kAHOHzC2mwsNLACbfGYHGJykw7UalFEVGp1Vys1u0FAFBsBZQFA+7pcglOXOt188v8A1zSTZzL8ZcNlbCYlVFwtqaupA2JKud9bA2Atr2SvrLVaY5dGo3MFznvTK3Nmube2CNRpa3ZOk5ctdSNheYuWPZXBccxlamTSWmUooq52C1QX95qVNlQqNxc5hmN9V7bsbw1wA9Th/rRrgGoqOq8vJY01J0Z27zootbz7wKZTKZ0x15jJMcfr/m38s8O93rQ/lfD85U59q2XSgTyrhtsyMBqNPHUaWk4g66k3J0J01Fjv7oHhMnEeGUa6ha1NagBzAML2I7QdwdTtMWF4NQp3yJlzZQbM2oT2b3PZecrw7ct2kfCM6Fr3sfesADbXMdhci502AmkxHTNKiXw9WmzGpZUXK1R0NwpVSTludczC1l8Z0j8JpFHp2NnBVjmYsQRY9YkkXGnxMwUejuHVlbKTlUqoY5gARY2vrtpvNaPlYz8XNM7clvCMcWpkjEUsSx6yZGpEAWAIJSwIz5hfymwSs1luoDe8t75Rrrft2mCtwbDP7VGmfZN8oucpzLc7mx117ZHXhVSm16VU8ssGak4L6AWKU2LAKNARftvrawC8OXTl6932E6gmd1crsCd+25C6W7rzYTDhUNrndtSO7w0JGnnM05SbNbkREqEREBERAREQEREBERAREQEREBERAREQEREBKWlYgWPSB0+4kfaJbToAbFvixb7TczLECzlxy5fECgErEQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERA//9k="
    },
    {
      "id": "med002",
      "name": "Ibuprofen",
      "description": "Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID). It works by reducing hormones that cause inflammation and pain in the body. Used for fever, pain, and inflammation.",
      "price": 6.49,
      "image": "data:image/jpeg;base64,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"
    },
    {
      "id": "med006",
      "name": "Aspirin",
      "description": "Aspirin (acetylsalicylic acid) is a salicylate that reduces substances in the body that cause pain, fever, and inflammation. It can also prevent blood clots, reducing risk of heart attacks and strokes.",
      "price": 4.99,
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxQTEhUSExMWFhUXGB4ZGBgYGCAdGhcaGB0aFx8dGhgeHyggGBolHRoXITEhJSktLi4uHh8zODMtNygtLi0BCgoKDg0OGxAQGy0mICYvMCswLS4yLi0uLS0tKy0tLS0tLS0wLS0tLS0tLS0tLS0tLy0tLS0tLS0tLS0tLS0tLf/AABEIAMQBAQMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAABQQGAQMHAgj/xABLEAACAQIEAwUEBQgHCAEFAQABAhEAAwQSITEFQVEGEyJhcTKBkaEHQrHB0RcjUlNUcpLwFDNigqKy4RUWQ4OzwtLx4jREY8PTJP/EABoBAAMBAQEBAAAAAAAAAAAAAAABAgMEBQb/xAA2EQACAQIDAwoFAwUBAAAAAAAAAQIDEQQhURIxoQUTFBUiMkFhcYFSkbHB0UJygiMzkuHx8P/aAAwDAQACEQMRAD8A7jRRRQAUUUUAFFaMZiBbQsdeg6k6Ae80v71zuxny291JsBvRSK7iLgMAn4MfsrBv3Y3P8LUXAfUUi7+71O3RvdW1L9wmNR7z/wCNFwHFFKu8ufyx/CvSu/Mx75+6i4DOil2ZupozN+kfjRcBjRS7M36RoLN1NFwGNFLc7fpGs52/SNFxXGNFLs7fpGjO36RouMY0UnF+77vX/Ws9/djz6SNvjRcBvRSZsTcjz5+IabefrWRfuSJnlzGh6HXp0ouA4opWt1ubfA/z51nvG/SNFwGdFKu8b9I/GsG636R+NFxDailNvEMCCSSPWmoNMZmiiigAooooAKKKKACiisGgBPirneXY+rb09XI1+APzrL6AmuaP9JN1GZP6OmjNuxkmTqdKB9KN79nt/wATV1rk+u87cTkeNop7zoSSdJInX62m+3j28v8ASti8iS0bfXGg5mudflTu/s1v+Nqz+VW7+y2/42/Cn1diPh4oXTaOp0bPp7L6eb/bHTWsodpVonq58+kkVzn8qt39mt/xn8KPyq3f2a3/ABn8KOrsR8PFD6bR1Oj59ZyaxJ1fnH9jz9RR0hP+pIPPTJtrvpNc6H0qXf2a3/G34Vn8qt39mt/xt+FHV2I+HihdOoanRAgicmvPR/l4Z6cqyZ/V8o+t8PZ8650PpUvfs1v+JqPyp3v2e1/E1HV2I+Hig6dQ1Ojd3J9j4yNK9HDa6Kse+a5v+VO/+z2vi1YP0pX/ANns/Fvxp9XYjTiLp9DU6ctuBG1Zy1zD8qGI/UWf8X416H0oYj9TZ/xfjS6txGnEOn0NTp2WjLXMx9J1/wDU2v8AF+Neh9Jd/wDU2v8AF+NLq+vpxKWMpal8/oTZpyqRmJ3OoJnbbpWTgjM6b7yZHprVE/KTf/U2v8X41g/SXf8A1Fr/ABfjR0CvoPpdLU6G1ifeNaFsnpyGx5jblvXO/wApd/8AUWvi341gfSZf/UWvi340ur6+nEHjKK8ToZw5BJHUHfnW8rXMz9J1/wDUWvi1YP0oXv2e18Wp9XYjTiT06hqdKK14Irmx+k2/+z2vi341qb6S7/6m16S1HV2I04i6fQ1OlukiKY4J5QeWlci/KXe52LfxNW/6Pe1LYw3Va2EKBSYJjxEgb89D8BUVMHWpR2pLI0p4qlUlsxeZdaKKK5zpCiiigAooooAKKKKAPnLtDZy4vEjpfuD/ABH7opcVqy9v8IbfEMQIgMwceYdVJ/xZqQBa+qw8tqlF+R8vX7NSS8zQUqXwrhdzEXO6tLmaC24AAECSTpuQPfXjJV64Rw7+jYB27y3Zv4kQrXXyZFI8IBgnMFLPEe03lUYqu6Uct73GuFpKrJ33IpPFuF3MM/d3gFbLm3BGUyJkacjTXB9icZcUMLOUHUB2Ct713HoYNP8At3hy64O+hV2bKgKeMOxyumT9ME546g1PQpxLw3rN+xftrIYBgg1EwTpMwcrAHeCYJrkljanNxkrefl7HVHCw25Rd/L/pRuH9nr965ctW0Be1o/iUBSSREzB1VtulbuJdl8TYXPcteDmykMBOmsGQPParZ2Twy2cPjmuPA7xrTXAJMIuUsBqScztp1pZe4vh8Pg7uFwne3WuhpZxlALqEhV01gAARuZJO1WsXVlNqKuk9Pnn4EPDUlBbTs2tfkrCC/wAEvJYt4hk/N3cuTxAls4JXwzOoFMz2Gxn6pZ6d4s/bFWztDYHf8OwY9lXDe6yBHyVhUo28Ne4ixJc4iwgyqTFuBrII1MG4JB012MVi8fVsn5N7vOyNVgaV2vO2/wArs5xhOBX7l84dbZF1VLMrECApUEydPrrHWa38O7M4i811baKTafI8uAAwmQDz2+Yq59mMYz38bjLwVTbAtwNk7sM7rPPQWzPOo/BcccLw3+kkS92/nI5sC4Ro9bdtiPWrnjK2aSV8l7veRDCUbJybtm/a+RUOHcDvXrrWUT84k5gSBGUhSJPOT9tQnswSDyMabaaaHpXWL1lLP9Kx1sg97ZRgRsSoeCP3syVy0JXRhMRKs2/DL5+Jx42jGgopb3f/AEaQlbFFe4rMV2NHAqjRJt4ByuaBETJZRAMRMnSZG+9YHD3M+EaNlMso8Q5anet1viVwLl0iIG+ghVgQw08AMbTPWsPxJyGACjMZMZhqZk+1rvsZFePflG7WzHfl6Hoc9hrLNmj/AGfcgGAJmJZRoBJMEzAEmelak4ddb2UnUiMwmRodJmBtO1NLWLuuQZTfNz0k9A3KdNAYHQGvWS7aEi6IUbAf2jcPhmAdSOsQKXO49JrsX9/P/QNUHn2rewlPDrkKchhoy6jXNtzoHDbhMBZ0zCCCCBl1BB1HjXb7jU2/j7kgEqcrZgANAQCsa8oJ+NeTxS4CCuVY0GVYygCAAOm+n4CtdrlGysocfYi+GvvZEfAOq5iBlGkhlIkcpB3nSN9+lR8tTXxbMuSFC75QIAO0+saT0rQUruw/P7P9a17+Gn5MKrhfsX9yOy1036GbEJiX6si/whm/765uVrr30UYTJgi/6y6zfw5bf/YfjXNynK1G2rO3kzOt6IudFFFfPH0QUUUUAFFFFABRRRQByf6YcMBiLFyPbtlSf3Gkf56oQFdS+mLDzZsXP0bhX+JZ/wC2uXivo+T5XoI+b5RVq7AD+f53qZxHid6+Qb1wuVmJAETvsB0FRRRXa4Rbu1mcSnJLZTyJ9jiWIItWUutCMvdKAoytqiw0TsxGpiDB0plc4hxFlyteMSynW0hGTMGlgAwAytrMaVE4PgWZe9R8jBso8MwGyoSDPtfnIAAJmNpBqZcbEALDkC5nYsLWVwVt5jmgyHOdgNZMgzsBwVXT2rRUfdHdTdRxvJy+ZGt4XGLZOHEi0SSbc29SCWMH2m1UnQ7eVRRwy8roMhDFkyajVmJZCDMESp8tNae2sJiFthu+9lSxTJOwzEMJlmDJzG4JmTFRyt8HD/nJZiHAZQBbBtrJJmYVBOwjxEa7kKzzS2fHUU6e5vavloacTdxouDEu57xBlDzbJCtGyjQqe8HiA+tvWEs4tLrYgMVuGc1zNb1VgGYmTlyeySdhptU7F4DEXT4rwIU7RChRcKKxWYIKq7yZ0SNazcXEB8hYZQrbWgQVD9wFAJAKmA0EgAanao5xWy2fPJ7huMr5uXln4ixL2LC3lHeZHdzehAQXIAfMwXQwBMECtWKxF/ImHuMwS3GVGUDLAgcgToTvNPrGDvW3Qd6ScxYjIDrNwSTmBls8SYHiGugpfxfAGTcJjQQq2zkUKtsAEz4PCyxpvO2laUqtNztZey8TKrCpsN3fnfQhDiN3uhYN1u6GgTSIBzATEwDymowWhVrKiu6MIx3Kx506kpZydwy0QK9E0KaZmGbyryTW68y6Za1UkNjzszgi63GH1AWgDxNofCNfIH1q9W7tt7YyZWtsNAAMpHpt7q5twrir2GzIQOoPskdCBqPWpOL4x3mbu7Hds3tNbd9T1yqFBPmQTXh4yjVlW32Wtz6DA16MKOstLEPj9lExFxU9kHTnEgEifIkilrVOGDuNrkPv0+2vVvg9xjsvxn7Jrt6ywdGKjOrG6819jh6DiasnKFKVn5C0CvRFO07MXecj+4ftMUPwa2n9Zftr63ba/LMTWT5bwn6HKXpGT+xsuR8U96S9WvyIgK7f2Fs5MBhx1TN/GS/31yhrWCX2sQh9C7f5Ej512zhuGFu1btjZEVR/dAH3VxYvHLERSUJR/crX9D0sDgZ4eTlKSfo7kmiiiuA9IKKKKACiiigAooooArH0iYHvcEwkDK6tJgAa5eZA51yLE8Iu2zBWfTf+E6/Ca7Z2vw3eYHEp1svHqFJHzAr574fxe/ZAVLhCD6jAMnuRgVX1AB867cL0lJujJejWXzWaOPE0KFT+4nfVf+sTGEGCIPQ6H4ViKmWu1QIAvYdWHW2xX/C4cH3QKkDG4F9xct+qafG25/y12rlDEw/uUG/OLT4OzOCXJUH/AG6i9019LisMQInntWReb9I7zvz6+tOLGFwbajEr7yy/57YqfftWXRUF+xpzF23PzcUuuKK71Oa/i/tcnqmv4Si/f/hXFdv0j13O5++vRcndiffTgcBB2v2/47Z//ZXr/d8c79v+O3//AEquucJpL/CX4MuqsX5f5L8iXMepr2txurabQdvTpTq3wuympxFqZnW9a/8AM1OxNzDOoVr9jTmtxZ/wg0pctUP0wm/4P7oqPI+ItnKK/kitKTp4m02129KBtE+700poTgQYN8H0W6fmEA+dZOOwK7Lcf0tiPi9yflU9at9zDzfqkvqxrkao+9Vjxf2FE1utWGOysfMAx8aa2u09i3ITDN5S6qP4VT76jYvtg7ezZsp55S59+YlT8KTx2On3KSj+6X4X3NY8jUV36jfovyzwnDHPID1I+6amJ2cuxJBA65TH8RgUhv8AaDFNp/SLijpbi1/0wunlSy+DcMuxY9WMn4moceUJ96rGP7Y/dtnVDk7BQ/S36v8AFi2PgrCf1mJtAjl3qE/wpmYVqbHYBP8AiFz/AGLbn/qZBVasWVHtbUcQsoSChbbWY38o5etT0CU3/VqzfvZcLHVGnQh3KcV7X+tyx/7x4Zf6vD3G9WRPkFc/Oo9/tew9jD2h+8zufkyj5VW1EUXLU6VUeSMGndwv63f1NHiJrJO3pl9Bje7YYo+y1tP3LKfayk/Ood/tDi29rE3vc5UfBYFabeHjXpTC5dt92oKQwMyANRtqd5muyNChSyhBL0SMJVJS3tiZ2Lnxksf7RJ+2vYEVtdAK1TrW/oYNkrhqZr1pTrmuIsfvMB99fUFfOHYqxn4hhV//ADK38Hj/AO2vo+vI5QfaS8jpobmFFFFeebhRRRQAUUUUAFFFFAHi9bDKVOxBB9+lfL1+yVZlO6kg+oMH7K+pK+au1qhMZiVGgF5/8xNejyc+00ceLdkmKxpUjC8Ou3RmTLE5dWA1lQBHKS6gTv6CagjEjkJqVh8ayar3i/ukiDtPrFetKLtkcinqe8Pwe8+wAEBvEY8LAnN1KwDr6dRTL/drEWySxQqpIY5xAgZiSTyjnUDDcXuq3hzkwBGpjLBWOYgiRGxr0OKYgE+JlJYsQXyyW1Jykjf51DVTVFqS0ZO/2Rcz5MnikCJG7KzjWY2Vj7q8W+DXhcKsniyF8oI9mQk89ZddInaoy8VxEb3SDzDMRr5iec/OpeH43ilZWHekqZAOYidNxGuw+ApbNTVCc46M0WuzWKeMtudAYDCVBbL4tZHike49Kk/7sYlJmJVcxE6ZZImdjt8xXm5xi/bKvlu2ipJBJYDxFjEEf2jXhu0+IYEZmy9AxjXlPTyotWe5qwKpBannHYc2zlaJG8EEawdxpWs2jOkAeZEnQct+daTjmJkoSY31PTn7hW23jXkFbZkbaH8K02XYOdMjhN0p3gSF2kkDb1I6ivK8NueIxqokjMM2knaZ0AqcOJXiFDWSygHTK2oJkyRruBWgX7gIJVs0aAzmC7bbhY66VHa8jRVdCOiHnXsqdI516uY2R7G3n/ppWs4s/ogepj5mnYaqnq9hGBAO55SPx0rS2HcHUEc9f591MOHcYNsk93buEiNfEYO4EGQPxr3f4y7Its2oyobZMGSCQRM7EFR8+tK7uU6mQp33FblFYuX/AOwZPlqfdXkYgD2lI9R8q0sYuqyydlOHKbi38RC2lIKA6m45nLKiSEGUkzvAFXDjeJwjWu6uGO/Y2pCeJDOfOdNALjBidpPka53ge0b2RlR7mUSAM5AUEyYEwDOsxvU/EdrsQcuTv1hYMO5LeZPx+NcVXDVJz2mzSOIgo2RWsdhrtm49q4IZGKsPTmPI6EeRFasvWpWMxl24xe4HZ+bPJOgjUnYepqBexMQSy6nYGfmNPnXcrJK+857zd7Iu30VYcNxK0SPYV3/w5P8AurvNcV+hW1mxtx/0bBHvZ0/A12qvDx7vW9jvwudO4UUUVxHSFFFFABRRRQAUUUUAFUf6TMNaGFdVS0t6+cved2pcDdmB0OaIEzpIPKruTXLO1eMOKvMRORfCm+3WQDuddfKtKfeJnuOa4ixbtiDfvsRuFeAPU+Iz8azhLrEwpuD964TtvDADlUi7w0LcVGtlNyS5kQBqRoARE7++nXBuC23g3AwU2mdYbq+UFug36V6vOqKOS0mKGTvIW893J0tvpGh1DAyNtTVnwfZPCBMyhisSGLwT8IjXlFNj2fw4tIigo0SQDLMY+sTrtBB2BrzfQIERASAQBty8Z02nSNtAa5512+6zSKtvFHFOzWCtDNcdlAj6ykknYDwkknpVbu2bJYrZW7vEuyAchtkAjUbnnVm7SYW5ca0VBaCxy78hr67+nvgxeHcFa5Za9dBhmREnQnvLmSYGoETHWK1p1WleTFNaCKzh21KMFPk0HUToYiKncH4dg7jZb63jd5Z7gYH08IJ/mKttjszhpzC27uk6M5KH2gAQIB9nnU3iPBbXei7bRVZSSAoIBYiPEswesgDbnSniU8hKLKfi+xuF75lgiFXZtczSdNOgpVi+G4K1mA712Ej21AEb65DPu+NWtcOWxAOUGHjXmUA1Enlrtt8q1jhjLIGEtl3Bi68uozEksVMhWGnh1nSKI1bb2Np+BSrmHXWFIHuP2rWDZt5YKNOsnMOfMDLoflXUuJ9lcPCtcBLIssy+EE6tqghRtG2lA4Dhwe7No5GWS0mWKmCAT5MDA6Gr6UidnzOfYXg9i6PacjLOVnjbeAANqbvwPCW7eZrIjWAzkE9IJaB6mKmv2dGHuKQTEMRO4giJjnGmnn1084jhpvqzsucASAWOurSJ5b6VLqXeTyLRV+IYBCQBhlQbSrl5/vBsvypYvDADIkHyP3EV0ngnZNWud9cWDmASwCxVBMzc5lveY36CveL7MYcMrE3FRjBIYFVJ9kkMCchOkyYJHurpMVkLZKjwnBYF1KXg63Y1zMBJHoAY90edex2MtM5a3ddQQGEEc/MDyr1f4MRicuUaFlIPUaCNPU+XLyc8KiSDsy23G3IiQCRpuempNKVR70xoR4ngOHsRnxF5nOyKRPqZ0A9d+howXZq5dzZLQRRubhknyBgZvkKsGI4fbTEi49pnQx4g2k7ahYMADqTTxBYu5zCogCKoRjJYkg5oOp9kCRUvESSyFs6nLBgrVi8RkW+i8pIExyEmefyqw4G/hL/gGHto2g9hYEjQieW1OeJdnLNrEd2FIc6+3OYSpESNCB06T6RMDwxlVmGbXWJMAqTsNiTprFKdaMkNRZ07sf2fw2HtLcsW8puIpY5iZkA7EwNeg5VYaSdkMSHwy/2SVP8AmHyIp3XmybbzOiKSWQUUUVIwooooAKKKKACiiigBV2lxRt2Gj2m8I9+/ymqBZwk6+HTqNPiTVl7ZYmXW2NlEn1b/AEHzqkcSLFS2YZRrGaZjqoBknp8q1gjOTGF7i+GUlWv2pBggGYI6gbU14VxPDkgLcTUdCNB66QK50nA2CK1u2XLAsYGYzMLETA5iPfTThHZy9ceGBthYBZgQR1gbltR5V1czDZvtGDqyUrWLdiFZmOQAJy5D7dPSj+inMpJ2B5RvHn5fOonAeF3sPnt3bouINUb9HU+Q3B6bg+dMLt0a/wAzFYNWdkbXurm7DuoJBZQVGYjovU67V5bieGBA76yW5Aake4HpPurnl572Ja7d8XdswUZvDbUcgCPaJEdTUnhHCmafCWYSTAmAYC+mlbKgt7Zm6ttyL9grgde8DLv4ZB0HpyneKj4tHLQIj0Ovzqt4fszczNLOgafaMEE6jKBEa+W07057N4a8qtbvEtkMKx1JETE/WA6+ccqiUIxzTuEZuWTVgt6OEVgC0tEHUSROh8qZ2jlSXZFQRJbQdANTFKMZeAu3isk27JIXSDpOhHiHtc+um1IcZwa9dOa7vKKis5k7aKu8CdS0dapQ2t7sDlssuDcWw+wu22HOCSOnKRrMVstXxAYXE1nQk66e+fhVPbs1dVwVDFR9UQRtEyNj61o4p2dYKHjI4O4ifUldvWap0YeEiVWbfdLNxa5mnN3YPiyS2sgfVlQZ9K3YWwykwVAk/VMDU/2qQ8PXM1lbwOdWZSx2PsnbcEyPImOtPMTcKiEgOwcLz8Wb9ID5fbFRKNsi7+IwvKF8TtbURu2m3mTpUa1xawfB3tpswyxJIaZ8PQzrpVW4n2PxF1lZr9k3G1gs7OR1BKgKo/d6e/da4G9hipSI+sCdZ10eNBRzcNm9x7ee4d4e0HUMbaswJysCJ1Ec9tIHOlIw8XFXu2ykMI0naY9rT2ZpLx3CvZQXLcgIwYAezIMa6AE67em1O+EY03yl0aA3fGP3lK6abT6cuurUbK6YNjvA2z+iY8yNPgTUx7aqPEEQTvmgH5DWaU8V4g9ixmto1y4TkAQSZ1BMEgmIpAODYy8VuOtwPBBa4AMwbdSuciNegjTyqIwvm3YrasWrHYy1oTetZk8UFpifDJk7E6T7q2ORcXwumwOgmJ6EnrXP+IYdoa3cUidIYaSNAehjkRXrs3hYt5lGQk5MykDMYzjVeW2nnVSpKMb3JjUuzp3Y+UuXEJJDCdRGqmD8QR8KtdUTsvipuK5+tBOvMjKftFXuuWe82QUUUVIwooooAKKKKACiikfa7G3LeHYWCq3n8KFphZ3bQHUDbzimld2AqHEuM2WvXCb1ucx0LDSNBz00FQs2HIJFyy08mYECfLYn12qrP2PdBmuYi2PXMSSfdJJpXjMGbUCcwJgeAyxgnQasdAeXKvQjQpPJSOdyeh0/h13DjIq3rAyxP5xRsNBvsNq3rxWxLAX7ZbMdAwjlqW2rlnD8OtzLmcqpJEhZPh38JiBP/qrLh+yXeLNrEIR1ymQd9eYPrRLDUY96XAam3uRa2x1omWxFv3OvwGtRf9pYUGDft/xgn3xVbudhHP8Ax1/hNa7vY1bKZrmJCKNoQkk9AJkmkqVD4+ANy0HVqzgwysuKTu1cXO7LiJHTMRvAHpTTheNsKpzYnDl3ZnaLiwC2samYAAHurm15LZfJad331KQPD6Ej51IfgrqJcFVjlEx5mTFayoU2s5MzUrPcdFu9o8KsBsRbzbaHMBHms61CxPbLCjQO1zrkUx8WgfClHBezWCvKIN8GNnIGbrBAg+7WntrsRhBGj+9unurDYw8HZ3NLye4VN2swrEsbVySCrCdSsAczA91asL2rsW3z/wBHdzyzEeGNPDpAPnTbiPB+G4dA1xCCZiCSWyxMQOUjXTlVffD27uuHw0JEhnO4IkEf+q6KboS8HYzmpI33e3RUALY2Gsv5zoAuleV7ajxTYBzcu802gz4fSlvc93KtbQyRr3YPKdzyqydn+MWkhbmGQLzuIm3m34gj0pyhRirqF/cjbd0mxWnbJQF//wA48Gqxdb5gLB06zFbX7XtcUrbwjRr4s7FgTrIKrKmfOr64UCRbG2mg+6ardztO6qD3KgvbzoFJaNUHi8A5ODoKxVSnLuw4mtmlmxLY7S30H9QgMAElXkx768YrtrdUFjbQmf7QiT/r8qkYgYy4rXbt5wu0L4RqQNI6Tzmtb8FZJazdfONDnUGefhJ/CtXKi+9FcSFdbmRsb2tF5CtyzoRBC3COcyDlkUcP7V4e0BmtXAIWSMrarOp2JjTbpU3hHaNR+axNu267Z8oVv7ymAfd86a8Yw/Dj4LlpcxRXBS0zeBiwDZkBAEq1Zt0l2dh+zNEpai/E9q8OQchuZpJU+z8t4/nSlVntYVdn7tnJ0EvEDoNDFXW12awYBIsoRuZ1jSeZ00qr46/YLZMNgrZ1jMy6nzAOw3qqc6DyUWTKL3tmh+3JUKO4BGgjvNtP3ajP2rAGmHXU5va57SSF3862Yjg18wRbsxIJBRR8PCeXU1PwT92GN3D2XVATogV4AkiNpinJ4eP6eIo7T8SNhe2qrBOH1Gxz+8/V9K7HgcSLttLq+y6hx6MAw+Rrn2EbB3NBYVSApIZF2fQbSDtV27PsO5CiAEJUAchuBHKAY91cVdwdtmNjohdb2MqKKK5ywooooAKKKKACqR2kxoe8QCITw78xvp66e6rhjr+S2z9Bp68vnVGCyTPzpomQvyZtlY+6Pjmg/CkHGsN42JUDurec5iIBuFlBzawIRwdJhqudvDnlqNfjVfvcMvPiLge04ttctAXNcndqoDkwZj29CNS3Suii1dkNGzAdm7a2gChzqoDaHxMfE0RrAJI/91N4VYCXLn5tkUALq+ZS2/PYxypthLZAJ5sSxJPUz9kVoWyUnUGSWPqTPKk6rldMSglmYuYhRMMOm8/yarHFcK91nul3CorQAhAUKJ1Z2AMxrlB5VaBanTTXf+fSK18Y4K1yxcW3mLMpgZoknTc6D+fOlCVmU1cpfBOB/nMg+pbQnMRqbpGxUmCO7O4A+Zq2YvhZ2uRuohTqZIB1gxXvhHB7udmuArm7vdlY+DOfqwIzMOQ9KeYjAyFDEyGDCI3GuvUfCqqVXtEqCEGC4T3VwFAxXNIyuBA2Mht9PMR5077w/oN7yPuJrf3ceVaykEwx5TPP+YrNzct41FRyRQu39nvLiAkqVtOyiJPtICViQdlBDRMiAdqs3CeDkpodlTYCQuURvvz+dbOJ8Ia7eDgWmTujbKuSDmLB50BBHhXT1p1gcLkGj7hQY/srl09a1nU7CSYlHMSrggubRdX39qRA0II093xrc+EcgLbui2BsEt//AC090U4XDISdNDv1zDmSBWQFHsj4D+dax23cewhU6OqogYEaL7JOyn+1VdwdoP3DeFlGGOkSQQbJOzQRoPDHIzO1XPnsf59aiYHg1q2QVDmAVAZ2YANEgSTA8I+FaRqJJ3BxNOJtDu3MkHLI8RjToJhT5ivGJwQDj2gGBIOY8t4G0jTlTlrKzJEn+fcffWRhVK5I8wTuPT3VjdlWKTjuFAhiyq5VoYEFWjkZXT3ZahYrBlEyFJ7y1cVFMNmVSCfEwAAm4dCBM7GCKva4K2defy06jpv8aS9peGNeNrIUlGJIckBlZSpAKgwZg+6tqVTNXZMonrh573DggE57SSNIJywYaYOx+FR+GcLRXuBVUPI1KaCRyAbXbrU/gWCa2iqwUQCsKSYAdiup1OhApi2GUnNziCfQyPnSlOzaQtm9ri27h2C5syETEBCDrsYz7a0vxmGYOQchjcZTr/ezH7Kfth/aBMKywY5xOuvu+FaTg80EnxRBjY+frWe0VY59whWS5aA3h7RKkeE29RmzEmT3RjSNTtXTuzWKlmSNCA4OmvLr6f61Vr3AbiuxRkym6twSzyIZHZY1WCVOwG9OODnu7tvxSJKz5Gfs2+FaVWnuCORcaKKKwNAooooAKKKKAEXae/4Vt9TmPoNB9/wqvgBdWPxJrbxjHZ7jMASNl1XYacz6n30tZWaZAg9dfl/rVWIbNuJ41Ztglg5ghSAOZ5a/yKj2O22HOdRbuLlIEmBJPQBpMDUyIFLOJ3ovKm+VDcJA1DMcigjmCO8+FTOB8MD2kW5JOXP4lBYPc1EkbkJlUgaR8tlCKjeRO0/Ae8Mxdm6ua2+frrqPUcq93rKgdDygnelNvCFbyKpByeJvAFIJlQCYJIPi+t8aZvbYlQQd5Oo25c/SolFJ5DTbWZtsWlnSagcV7V4bDsE1uOZ0XkBzJOm5A0nescYu3CO7t+EtoTJJM8lCzJ+G9U3i3CWtvcW435y3aGRYBAmWIYZgZIgQPLfY1TgpPMG2txbuEdse+1TCvlPPffY6DY+U71Jtdq7DXAlxTbbzU7TEnTw1s4bgyEKLmhYQEAaZAFgabVoxvDVuXHLyptZQGAEiQZzaSRt8NIo7F7NCe1YsFwqwBEEEaHQgjy5GtaqADoN+lLuFWbltSnhIBkEEga+UNl+JqRh85WSFEk/WPpvl8qhodxbxntGLBugWswtBSxzRJcEgKAjTA3kiotrtdcuMyWbInNHik7czERpVc4jYbE327xoX+lKmQMJKr3aloiY1GhO8kRsbV2fwloAm2G0YjMT7RDH4iuiUYQjmsyLybyJeH4piTLd2sLIge0zDzJhV313PStXDu1SM/dXLbWnkgztPmdxPWI86l2MJ4PziyMzHUcpOum2kVFxvAkYaIoMSMpIzL6ggn46VjeG5orMdqZO1Vzh/EXBtM9xznLhgyqF0V2GWFBnw9ad2rZAUF2nQfV8ueXX76q1sSbEOcq3bikAicxS8oJhdCDmETzE1VNJpgx3xLjRRFCuodhInaI3iYHx60r4JxfGX5YwBHMALm+EtU7CcNtELcyBmiZaWPTUmvXDrVtjbQ5MzllSeeXM0DTpNLaio2SzFaVyYOJMizdXlqyDTz06esVqx/GLaWTejvFUgELE+JgnMgbkb8q08QNu2clzMG2ChmBOhOkHaBvtt1qu3fDbc2mkEGVIkyniO+uYR7LanqKiNm1cp3LPw/ilu4SMjIysFKtlJlhmHsMwAjqenWp+JxNu0md2Cr1P2DqfKqtwPElrl3QkFLTpqGb2oJAEEAZtzqRM86Z9pcIbiageEhhOoMESYEn7OetaSglKxN3Y0N2vQtltWnc+nLqBrMdNKwvaF8wzYdxvJIYDT1A3/ABqZh8GEEKQJ3yqF/GtWNszEu3nov/jUNx3JFK/iYxHH1BtqLTEvMSVWCoBiSY1BJ9xrXY4glwBlUjU7jYoxQgnrINJOOWD3efMp7tg/iXUCYaSDp4S31a9cCveO6jaZXDDxCCLqhBpMmGttodZJ3matRTjcGzq2Hu5lVuoBrZSns1fzWYgjKY1jbrofWm1c5oFFFFABSzj+M7u3APifwjr5n4fdTOqt247Jf04Wyt42rlrNlMSpzRMgEHkNaqCTl2nZCd7ZCxXaGEwDuOVahbnzOvuAEk/CaTDsJxVPYxaEcvzj/YUNZXsrxkf8W2f7/wD8a3dKHxozz0JeJ4Dfa9iLtq6FW5aW2QUJyjKRIfMMreIkHzp6lhgAzFVDLm2jksAeni8tqri8D4wgMNI3hbi6/GKhYjA8bYwttwOua2PvqpU9pd9An5Fve5BBgTET5bx8zpXqywJJzRAiI6+fwqlYfsnxlhmNwqejXR9xIraeznG1mGB/5if6VPMx+NDu9C8BY8dvLnjKGOuXzHKd9ar2N4Pd7y8LbJ3d11zlkPekHIsd4GGhKbGRqdNaW2+Ccc/SVf76fdNSV7O8ZO+IQe9fuFOMFH9aB5+Bb7WGfRELZVJJ6EtM6+XKvFxspzMZYeExrnUDrtPzmqmezXGoj+lJHqOf93SolzsBxV5zYxfTvH+5YqVSh4zXEd3oXBcSsQogDl/PKjvtAOW/x191U232F4uns4pPTvX+9KE+j7ij/wBZi0X/AJjn7FFPm6fxonPQnns63eO3fQly93pCoAy+IGFfNP1QNvtqz4PCokJagKNAC2w3kz7/AJ1VLX0V3yPHjm92Y/aal2forI/++ve4R99OexLfPgCTXgWywg1BceE8jO+unlWu/ftr9ZQJkZmAy+nlVZb6MnX2Mdc967+sNrWtfopzGbuLY/uoPtJNJQo+M+A+1oPTj7ZP9Yh1/SB+/wAqi4fhNoMGF5yA5cIXUqC2aYEZlHibQEVAb6IsPyxF4H0T7MtRX+im4PYxkf8ALIPyaqSpLdNr2FaWhaUtKIAYBfcYHpOv871HxPDpxAuK6lVtwhLAMrkmSemgFV38l+I2GNMf3h99ebn0a4sDTF5j0LP9tTzdL4+AdrQsHEDdbEWLoTMAvj6SGA321V3H7s14t8OOU5wAJbKvMK2gztzIAHlM9artnsdxW37F8H1b7yTWnE8I44DoS3mGt/fQqUPCaC70N/Z3hd5GVHtQe5Ku4cMjFcuSBIIkjWR76ub28yiRyggdDuJ66nWucWbnGrRlsI78vYB+aGph49xSCDw675eC4Y+Ag1c4Sm73XzEsjoVnDqYtLtuxMyAfM6k6GluPtA2lu3QGuYVyryJLIYE+cqy61Sv9o8XJn+jMByHcsfsoucV4sQQcK56/mX1gzr11E1HMP4l8ylLyHPHsGovG0JZXQ5QJz5XBGoGpG41GhWaW8J4diFg3rYQm2VY973ksCjKwnWfAR5TWu1x7ipH/ANHcJ69ywn1BGhrReu8ZubYVx5m2BtPU1pGlJLevmJvyOhdmMR+cZdswn3j+TVnrjvZXF8VGLsrdwtwJnAdjaKhVO5znTSuwiuapDZe8uLyM0UUVmUFFFFAGKzRRQBis0UUAYrNFFABWKKKACis0UAYrNFFABRRRQAUUUUAFFFFABRRRQAViiigDNFFFABRRRQAUUUUAFFFFABRRRQB//9k="
    },
    {
      "id": "med010",
      "name": "Vitamin D3",
      "description": "Vitamin D3 (cholecalciferol) is vitamin D, which is important for the absorption of calcium from the stomach and for the functioning of calcium in the body. Helps maintain strong bones.",
      "price": 9.99,
      "image": "data:image/jpeg;base64,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"
    }
  ];
  
  const popularMedicinesContainer = document.getElementById('popular-medicines');
  
  if (popularMedicinesContainer) {
    displayMedicines(popularMedicines, popularMedicinesContainer);
  }
}

// Display medicines in a container
function displayMedicines(medicines, container) {
  if (!medicines || medicines.length === 0) {
    container.innerHTML = '<p>No medicines found</p>';
    return;
  }
  
  let html = '';
  
  medicines.forEach(medicine => {
    html += `
      <div class="card">
        <img src="${medicine.image || 'assets/images/medicines/placeholder.jpg'}" alt="${medicine.name}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${medicine.name}</h3>
          <p class="card-text">${medicine.description.substring(0, 100)}...</p>
          <p class="card-price">$${medicine.price}</p>
          <button class="btn btn-primary" onclick="addToCart(${JSON.stringify(medicine).replace(/"/g, '&quot;')})">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.innerHTML = `
    ${message}
    <button class="close-btn">&times;</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
  
  // Close button functionality
  const closeBtn = toast.querySelector('.close-btn');
  closeBtn.addEventListener('click', () => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  });
}

// Expose functions to global scope
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.showToast = showToast; 