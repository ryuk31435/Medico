// Authentication Functions

document.addEventListener('DOMContentLoaded', () => {
  // Check if on login or signup page
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  // Setup login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Setup signup form
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Check if user is already logged in
  checkAuthState();
});

// Check authentication state
function checkAuthState() {
  // First check localStorage (for quicker UI update)
  const user = localStorage.getItem('user');
  
  if (user) {
    // User is logged in according to localStorage
    updateAuthUI(true);
  } else {
    // No user in localStorage, let's check with Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          // User is signed in with Firebase
          saveUserToLocalStorage(user);
          updateAuthUI(true);
        } else {
          // No user is signed in
          localStorage.removeItem('user');
          updateAuthUI(false);
        }
      });
    } else {
      // Firebase not available
      updateAuthUI(false);
    }
  }
}

// Save user to localStorage
function saveUserToLocalStorage(user) {
  localStorage.setItem('user', JSON.stringify({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0]
  }));
}

// Handle login form submission
function handleLogin(e) {
  e.preventDefault();
  
  // Show loading state
  const submitBtn = document.querySelector('#login-form .form-btn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="loader"></span> Signing in...';
  submitBtn.disabled = true;
  
  // Clear any existing error messages
  const errorElement = document.getElementById('login-error');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  // Get form values
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  
  // Validate inputs
  if (!email || !password) {
    showAuthError('Please enter both email and password', 'login-error');
    resetButton(submitBtn, originalBtnText);
    return;
  }
  
  // Check if Firebase is available
  if (typeof firebaseAuth === 'undefined' || !firebaseAuth.signIn) {
    // Mock login for development/demo
    mockLogin(email, password);
    return;
  }
  
  // Attempt to sign in with Firebase
  firebaseAuth.signIn(
    email, 
    password,
    (user) => {
      // Success
      saveUserToLocalStorage(user);
      showToast('Signed in successfully!', 'success');
      
      // Redirect to home page
      window.location.href = 'index.html';
    },
    (error) => {
      // Error
      showAuthError(error, 'login-error');
      resetButton(submitBtn, originalBtnText);
    }
  );
}

// Handle signup form submission
function handleSignup(e) {
  e.preventDefault();
  
  // Show loading state
  const submitBtn = document.querySelector('#signup-form .form-btn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="loader"></span> Creating account...';
  submitBtn.disabled = true;
  
  // Clear any existing error messages
  const errorElement = document.getElementById('signup-error');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  // Get form values
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  
  // Validate inputs
  if (!email || !password || !confirmPassword) {
    showAuthError('Please fill in all fields', 'signup-error');
    resetButton(submitBtn, originalBtnText);
    return;
  }
  
  if (password !== confirmPassword) {
    showAuthError('Passwords do not match', 'signup-error');
    resetButton(submitBtn, originalBtnText);
    return;
  }
  
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters', 'signup-error');
    resetButton(submitBtn, originalBtnText);
    return;
  }
  
  // Check if Firebase is available
  if (typeof firebaseAuth === 'undefined' || !firebaseAuth.signUp) {
    // Mock signup for development/demo
    mockSignup(email, password);
    return;
  }
  
  // Attempt to sign up with Firebase
  firebaseAuth.signUp(
    email, 
    password,
    (user) => {
      // Success
      saveUserToLocalStorage(user);
      showToast('Account created successfully!', 'success');
      
      // Redirect to home page
      window.location.href = 'index.html';
    },
    (error) => {
      // Error
      showAuthError(error, 'signup-error');
      resetButton(submitBtn, originalBtnText);
    }
  );
}

// Show authentication error
function showAuthError(message, elementId) {
  const errorElement = document.getElementById(elementId);
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    // Fallback to toast notification
    showToast(message, 'error');
  }
}

// Reset button state
function resetButton(button, originalText) {
  button.innerHTML = originalText;
  button.disabled = false;
}

// Update UI based on auth state
function updateAuthUI(isLoggedIn) {
  const loginButtons = document.querySelectorAll('.login-btn');
  const logoutButtons = document.querySelectorAll('.logout-btn');
  const userGreeting = document.getElementById('user-greeting');
  const authRequiredElements = document.querySelectorAll('.auth-required');
  
  if (isLoggedIn) {
    // User is logged in
    
    // Hide login buttons, show logout
    loginButtons.forEach(btn => {
      btn.style.display = 'none';
    });
    
    logoutButtons.forEach(btn => {
      btn.style.display = 'block';
    });
    
    // Show user greeting
    if (userGreeting) {
      const user = JSON.parse(localStorage.getItem('user'));
      userGreeting.textContent = `Hello, ${user.displayName || 'User'}`;
      userGreeting.style.display = 'block';
    }
    
    // Show auth-required elements
    authRequiredElements.forEach(el => {
      el.style.display = 'block';
    });
    
    // Redirect if on login/signup page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html' || currentPage === 'signup.html') {
      window.location.href = 'index.html';
    }
    
  } else {
    // User is not logged in
    
    // Show login buttons, hide logout
    loginButtons.forEach(btn => {
      btn.style.display = 'block';
    });
    
    logoutButtons.forEach(btn => {
      btn.style.display = 'none';
    });
    
    // Hide user greeting
    if (userGreeting) {
      userGreeting.style.display = 'none';
    }
    
    // Hide auth-required elements
    authRequiredElements.forEach(el => {
      el.style.display = 'none';
    });
    
    // Redirect if on auth-required page
    const authRequiredPages = ['cart.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (authRequiredPages.includes(currentPage)) {
      window.location.href = 'login.html?redirect=' + currentPage;
    }
  }
}

// Mock login for development/demo
function mockLogin(email, password) {
  // Simulate API delay
  setTimeout(() => {
    if (email === 'admin@medico.com' && password === 'admin123') {
      // Admin login
      localStorage.setItem('user', JSON.stringify({
        uid: 'admin-uid',
        email: email,
        displayName: 'Admin',
        isAdmin: true
      }));
      
      showToast('Signed in as Admin', 'success');
      window.location.href = 'index.html';
    } else if (email === 'user@example.com' && password === 'password123') {
      // Test user login
      localStorage.setItem('user', JSON.stringify({
        uid: 'user-uid',
        email: email,
        displayName: 'Test User'
      }));
      
      showToast('Signed in successfully!', 'success');
      window.location.href = 'index.html';
    } else {
      // For demo purposes, allow any login
      localStorage.setItem('user', JSON.stringify({
        uid: 'user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      }));
      
      showToast('Signed in successfully!', 'success');
      window.location.href = 'index.html';
    }
  }, 300);
}

// Mock signup for development/demo
function mockSignup(email, password) {
  // Simulate API delay
  setTimeout(() => {
    // Always succeed in mock mode
    localStorage.setItem('user', JSON.stringify({
      uid: 'new-user-' + Date.now(),
      email: email,
      displayName: email.split('@')[0]
    }));
    
    showToast('Account created successfully!', 'success');
    window.location.href = 'index.html';
  }, 300);
}

// Check if user is admin
function isAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.isAdmin === true;
}

// Expose functions to global scope
window.isAdmin = isAdmin; 