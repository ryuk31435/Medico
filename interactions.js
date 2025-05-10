// Interactions page JavaScript

// Global variables
let medicines = [];
let interactions = [];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the page
  init();
});

// Initialize the page
function init() {
  // Load medicines and interactions data
  loadData();
  
  // Setup event listeners
  setupEventListeners();
}

// Load medicines and interactions data
function loadData() {
  // Load medicines data (hardcoded to avoid file loading issues)
  medicines = [
    { id: "med001", name: "Paracetamol" },
    { id: "med002", name: "Ibuprofen" },
    { id: "med003", name: "Amoxicillin" },
    { id: "med004", name: "Cetirizine" },
    { id: "med005", name: "Omeprazole" },
    { id: "med006", name: "Aspirin" },
    { id: "med007", name: "Loratadine" },
    { id: "med008", name: "Metformin" },
    { id: "med009", name: "Atorvastatin" },
    { id: "med010", name: "Vitamin D3" },
    { id: "med011", name: "Diazepam" },
    { id: "med012", name: "Salbutamol Inhaler" },
    { id: "med014", name: "Antacid Tablets" },
    { id: "med015", name: "Hydrocortisone Cream" },
    { id: "med016", name: "Acetylcysteine" }
  ];
  
  // Load interactions data (hardcoded to avoid file loading issues)
  interactions = [
    {
      "medicine1": "med001",
      "medicine2": "med006",
      "severity": "moderate",
      "description": "Combining Paracetamol with Aspirin may increase the risk of side effects. While occasional use of both is generally considered safe, regular long-term use together should be monitored by a healthcare provider.",
      "recommendation": "If you need pain relief, consider using just one of these medications. If you must use both, discuss with your doctor or pharmacist about proper dosing and timing."
    },
    {
      "medicine1": "med002",
      "medicine2": "med006",
      "severity": "severe",
      "description": "Using Ibuprofen with Aspirin may increase the risk of gastrointestinal bleeding and ulcers. Both are NSAIDs and their combined effect can damage the stomach lining.",
      "recommendation": "Avoid using these medications together. If you've been prescribed both by a doctor, follow their guidance exactly and report any stomach pain immediately."
    },
    {
      "medicine1": "med003",
      "medicine2": "med004",
      "severity": "mild",
      "description": "There are typically no significant interactions between Amoxicillin (antibiotic) and Cetirizine (antihistamine). They can generally be taken together safely.",
      "recommendation": "You can typically take both medications as prescribed. However, always inform your doctor about all medicines you are taking."
    },
    {
      "medicine1": "med005",
      "medicine2": "med014",
      "severity": "moderate",
      "description": "Antacids can decrease the absorption of Omeprazole when taken simultaneously, making it less effective.",
      "recommendation": "Take Omeprazole at least 30 minutes to 1 hour before taking any antacid for best effectiveness."
    },
    {
      "medicine1": "med002",
      "medicine2": "med011",
      "severity": "moderate",
      "description": "Ibuprofen may increase the effects of Diazepam, potentially causing increased drowsiness, reduced coordination, and cognitive impairment.",
      "recommendation": "Use caution when combining these medications. Consider reducing the dosage of either medication and avoid activities requiring mental alertness until you know how this combination affects you."
    }
  ];
  
  // Populate medicine dropdowns
  populateMedicineDropdowns();
  
  // Display common interactions
  displayCommonInteractions();
}

// Populate medicine dropdowns
function populateMedicineDropdowns() {
  const medicine1Select = document.getElementById('medicine1');
  const medicine2Select = document.getElementById('medicine2');
  
  medicines.forEach(medicine => {
    // Add to first dropdown
    const option1 = document.createElement('option');
    option1.value = medicine.id;
    option1.textContent = medicine.name;
    medicine1Select.appendChild(option1);
    
    // Add to second dropdown
    const option2 = document.createElement('option');
    option2.value = medicine.id;
    option2.textContent = medicine.name;
    medicine2Select.appendChild(option2);
  });
}

// Display common interactions
function displayCommonInteractions() {
  const commonInteractionsGrid = document.getElementById('common-interactions-grid');
  
  // Show a subset of interactions
  const commonInteractionsToShow = interactions.slice(0, 3);
  
  let html = '';
  
  commonInteractionsToShow.forEach(interaction => {
    const med1 = getMedicineById(interaction.medicine1);
    const med2 = getMedicineById(interaction.medicine2);
    
    html += `
      <div class="card">
        <div class="card-content">
          <h3 class="card-title">${med1.name} & ${med2.name}</h3>
          <div class="severity-badge ${interaction.severity}">${interaction.severity}</div>
          <p class="card-text">${interaction.description.substring(0, 120)}...</p>
          <button class="btn btn-outline view-interaction-btn" 
            data-med1="${interaction.medicine1}" 
            data-med2="${interaction.medicine2}">
            View Details
          </button>
        </div>
      </div>
    `;
  });
  
  commonInteractionsGrid.innerHTML = html;
  
  // Add event listeners to view interaction buttons
  document.querySelectorAll('.view-interaction-btn').forEach(button => {
    button.addEventListener('click', function() {
      const med1Id = this.getAttribute('data-med1');
      const med2Id = this.getAttribute('data-med2');
      
      // Set dropdown values
      document.getElementById('medicine1').value = med1Id;
      document.getElementById('medicine2').value = med2Id;
      
      // Check interaction
      checkInteraction();
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Check interaction button
  document.getElementById('check-interaction-btn').addEventListener('click', checkInteraction);
  
  // New check buttons
  document.getElementById('new-check-btn').addEventListener('click', resetInteractionChecker);
  document.getElementById('no-interaction-new-check-btn').addEventListener('click', resetInteractionChecker);
  
  // Print button
  document.getElementById('print-btn').addEventListener('click', () => {
    window.print();
  });
}

// Check interaction
function checkInteraction() {
  const medicine1Id = document.getElementById('medicine1').value;
  const medicine2Id = document.getElementById('medicine2').value;
  
  // Validate selection
  if (!medicine1Id || !medicine2Id) {
    showToast('Please select both medicines', 'error');
    return;
  }
  
  if (medicine1Id === medicine2Id) {
    showToast('Please select two different medicines', 'error');
    return;
  }
  
  // Show results area and loader
  document.getElementById('interaction-results').style.display = 'block';
  document.getElementById('interaction-loader').style.display = 'block';
  document.getElementById('interaction-content').style.display = 'none';
  document.getElementById('no-interaction-found').style.display = 'none';
  
  // Scroll to results
  document.getElementById('interaction-results').scrollIntoView({ behavior: 'smooth' });
  
  // Simulate loading delay
  setTimeout(() => {
    // Find interaction
    const interaction = findInteraction(medicine1Id, medicine2Id);
    
    // Hide loader
    document.getElementById('interaction-loader').style.display = 'none';
    
    if (interaction) {
      // Show interaction content
      displayInteraction(interaction, medicine1Id, medicine2Id);
    } else {
      // Show no interaction found message
      document.getElementById('no-interaction-found').style.display = 'block';
    }
  }, 1000);
}

// Find interaction between two medicines
function findInteraction(med1Id, med2Id) {
  return interactions.find(interaction => 
    (interaction.medicine1 === med1Id && interaction.medicine2 === med2Id) ||
    (interaction.medicine1 === med2Id && interaction.medicine2 === med1Id)
  );
}

// Display interaction
function displayInteraction(interaction, medicine1Id, medicine2Id) {
  const medicine1 = getMedicineById(medicine1Id);
  const medicine2 = getMedicineById(medicine2Id);
  
  // Set medicine names
  document.getElementById('medicine1-name').textContent = medicine1.name;
  document.getElementById('medicine2-name').textContent = medicine2.name;
  
  // Set severity
  const severityElement = document.getElementById('interaction-severity');
  severityElement.textContent = interaction.severity;
  severityElement.className = 'severity-badge ' + interaction.severity;
  
  // Set description and recommendation
  document.getElementById('interaction-description').textContent = interaction.description;
  document.getElementById('interaction-recommendation').textContent = interaction.recommendation;
  
  // Show interaction content
  document.getElementById('interaction-content').style.display = 'block';
}

// Reset interaction checker
function resetInteractionChecker() {
  // Reset dropdowns
  document.getElementById('medicine1').selectedIndex = 0;
  document.getElementById('medicine2').selectedIndex = 0;
  
  // Hide results
  document.getElementById('interaction-results').style.display = 'none';
  
  // Scroll to top of interaction container
  document.querySelector('.interactions-container').scrollIntoView({ behavior: 'smooth' });
}

// Get medicine by ID
function getMedicineById(id) {
  return medicines.find(medicine => medicine.id === id) || { name: 'Unknown Medicine' };
}

// Add additional styles for severity badges
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    .severity-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
      margin: 5px 0;
    }
    
    .severity-badge.mild {
      background-color: #4caf50;
      color: white;
    }
    
    .severity-badge.moderate {
      background-color: #ff9800;
      color: white;
    }
    
    .severity-badge.severe {
      background-color: #f44336;
      color: white;
    }
    
    .severity-badge.beneficial {
      background-color: #2196f3;
      color: white;
    }
  `;
  document.head.appendChild(style);
}); 