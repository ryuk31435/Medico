// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API Key
  authDomain: "medico-app.firebaseapp.com",
  projectId: "medico-app",
  storageBucket: "medico-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  databaseURL: "https://medico-app.firebaseio.com"
};

// Skip Firebase initialization and use mock auth
document.addEventListener('DOMContentLoaded', () => {
  // Since we're using mock auth, just update the UI based on localStorage
  const user = localStorage.getItem('user');
  if (user) {
    updateUI(true);
  } else {
    updateUI(false);
  }
});

// Update UI based on auth state
function updateUI(isLoggedIn) {
  const loginButtons = document.querySelectorAll('.login-btn');
  const logoutButtons = document.querySelectorAll('.logout-btn');
  const userGreeting = document.getElementById('user-greeting');
  
  if (isLoggedIn) {
    // Hide login buttons, show logout
    loginButtons.forEach(btn => btn.style.display = 'none');
    logoutButtons.forEach(btn => btn.style.display = 'block');
    
    // Update user greeting
    const user = JSON.parse(localStorage.getItem('user'));
    if (userGreeting) {
      userGreeting.textContent = `Hello, ${user.displayName || 'User'}`;
      userGreeting.style.display = 'block';
    }
  } else {
    // Show login buttons, hide logout
    loginButtons.forEach(btn => btn.style.display = 'block');
    logoutButtons.forEach(btn => btn.style.display = 'none');
    
    // Hide user greeting
    if (userGreeting) {
      userGreeting.style.display = 'none';
    }
  }
}

// Mock Firebase Authentication Functions
const firebaseAuth = {
  // Sign up with email and password
  signUp: function(email, password, successCallback, errorCallback) {
    // Simulate API delay (reduced from 1000ms to 300ms)
    setTimeout(() => {
      // Create mock user
      const user = {
        uid: 'user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      };
      successCallback(user);
    }, 300);
  },
  
  // Sign in with email and password
  signIn: function(email, password, successCallback, errorCallback) {
    // Simulate API delay (reduced from 1000ms to 300ms)
    setTimeout(() => {
      if (email === 'admin@medico.com' && password === 'admin123') {
        // Admin login
        const user = {
          uid: 'admin-uid',
          email: email,
          displayName: 'Admin',
          isAdmin: true
        };
        successCallback(user);
      } else if (email === 'user@example.com' && password === 'password123') {
        // Test user login
        const user = {
          uid: 'user-uid',
          email: email,
          displayName: 'Test User'
        };
        successCallback(user);
      } else {
        // For demo purposes, allow any credentials
        const user = {
          uid: 'user-' + Date.now(),
          email: email,
          displayName: email.split('@')[0]
        };
        successCallback(user);
      }
    }, 300);
  },
  
  // Sign out
  signOut: function(successCallback) {
    setTimeout(() => {
      localStorage.removeItem('user');
      successCallback();
    }, 300);
  }
};

// Mock Firebase Firestore Functions
const firebaseDB = {
  // Add a new document
  addDocument: function(collection, data, successCallback, errorCallback) {
    setTimeout(() => {
      // Generate a random ID
      const docId = 'doc-' + Math.random().toString(36).substr(2, 9);
      
      // Get existing data from localStorage
      let collectionData = JSON.parse(localStorage.getItem(collection) || '[]');
      
      // Add the new document
      collectionData.push({
        id: docId,
        ...data,
        createdAt: new Date().toISOString()
      });
      
      // Save to localStorage
      localStorage.setItem(collection, JSON.stringify(collectionData));
      
      successCallback(docId);
    }, 300);
  },
  
  // Get all documents from a collection
  getCollection: function(collection, successCallback, errorCallback) {
    setTimeout(() => {
      // Get data from localStorage
      const data = JSON.parse(localStorage.getItem(collection) || '[]');
      successCallback(data);
    }, 300);
  },
  
  // Get a specific document
  getDocument: function(collection, docId, successCallback, errorCallback) {
    setTimeout(() => {
      // Get data from localStorage
      const collectionData = JSON.parse(localStorage.getItem(collection) || '[]');
      const doc = collectionData.find(item => item.id === docId);
      
      if (doc) {
        successCallback(doc);
      } else {
        errorCallback("Document does not exist");
      }
    }, 300);
  },
  
  // Update a document
  updateDocument: function(collection, docId, data, successCallback, errorCallback) {
    setTimeout(() => {
      // Get data from localStorage
      let collectionData = JSON.parse(localStorage.getItem(collection) || '[]');
      const index = collectionData.findIndex(item => item.id === docId);
      
      if (index !== -1) {
        // Update the document
        collectionData[index] = {
          ...collectionData[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem(collection, JSON.stringify(collectionData));
        
        successCallback();
      } else {
        errorCallback("Document does not exist");
      }
    }, 300);
  },
  
  // Delete a document
  deleteDocument: function(collection, docId, successCallback, errorCallback) {
    setTimeout(() => {
      // Get data from localStorage
      let collectionData = JSON.parse(localStorage.getItem(collection) || '[]');
      const index = collectionData.findIndex(item => item.id === docId);
      
      if (index !== -1) {
        // Remove the document
        collectionData.splice(index, 1);
        
        // Save to localStorage
        localStorage.setItem(collection, JSON.stringify(collectionData));
        
        successCallback();
      } else {
        errorCallback("Document does not exist");
      }
    }, 300);
  }
}; 