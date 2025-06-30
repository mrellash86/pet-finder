// 1. GLOBAL VARIABLES AND CONSTANTS
const API_BASE_URL = 'https://api.petfinder.com/v2';
const CLIENT_ID = 'UbRmykpb65QHfIfKvFLUeM1UWfKK2gagX9oA05NGODNQ0u049M';
const CLIENT_SECRET = 'Gnptuq4hSGhIN5dAbMuYQzEy24z7aGon9DS2SkHw';


// 2. UTILITY FUNCTIONS
const getToken = () => fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    })
})
    .then((res) => res.json())
    .then((data) => data.access_token);

   const decodeHTML = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

// 3. MAIN FORM HANDLER
const onFormSubmit = (event) => {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const zipCode = document.getElementById('zipCode').value;
    const petType = document.getElementById('petType').value;
    
    if (!name || !email || !zipCode || !petType || petType === '') {
        alert('Please fill in all required fields.');
        return;
    }
    
    getAdoptablePets(petType, zipCode, name);
};

// 4. API DATA FETCHING
const getAdoptablePets = (petType, zipCode, name) => {
    getToken().then((token) => {
        fetch(`${API_BASE_URL}/animals?type=${petType}&location=${zipCode}&limit=24`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => res.json())
        .then((data) => {
            displayPets(data.animals, name);
        })
        .catch(error => {
            console.error('Error fetching pets:', error);
            showError('Could not find pets. Please try again.');
        });
    })
    .catch(error => {
        console.error('Error getting token:', error);
        showError('Could not connect to pet service. Please try again.');
    });
};


// 5. DOM MANIPULATION AND DISPLAY
const getImageUrl = (pet) => {
    if (!pet.photos || pet.photos.length === 0) {
        return 'https://via.placeholder.com/300x200?text=No+Photo+Available';
    }
    
    const photo = pet.photos[0];
    return photo.medium || photo.small || photo.large || 'https://via.placeholder.com/300x200?text=No+Photo+Available';
};

const displayPets = (petsData, userName) => {
    // Clear any existing results from previous searches
    const existingResults = document.getElementById('results');
    if (existingResults) {
        existingResults.remove();
    }
    
    // Create a results container section
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results';
    resultsContainer.className = 'results-container';
    
    // Handle case where no pets found
    if (!petsData || petsData.length === 0) {
        resultsContainer.innerHTML = `<h2>Sorry ${userName}, we couldn't find any pets matching your criteria.</h2>`;
        document.body.appendChild(resultsContainer);
        return;
    }
    
    // Add personalized header
    const greeting = document.createElement('h2');
    greeting.textContent = `Hi ${userName}, here are pets near you!`;
    greeting.className = 'greeting';
    resultsContainer.appendChild(greeting);
    
    // Create pets grid container
    const petsGrid = document.createElement('div');
    petsGrid.className = 'pets-grid';
    
    // forEach loop  petsData 
    petsData.forEach(pet => {
        const petName = pet.name || 'Name unknown';
        const petBreed = (pet.breeds && pet.breeds.primary) || 'Breed unknown';
        const petColor = (pet.colors && pet.colors.primary) || 'Color unknown';
        const petPhoto = getImageUrl(pet);
            
        const petDescription = (() => {
            if (!pet.description || typeof pet.description !== 'string' || !pet.description.trim()) {
                return 'No description available.';
            }
            try {
                const decoded = decodeHTML(pet.description.trim());
                return decoded.length > 150 ? decoded.substring(0, 150) + '...' : decoded;
            } catch (error) {
                console.warn('Error decoding description:', error);
                return 'Description unavailable.';
            }
        })();
        
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        
        petCard.innerHTML = `
            <img src="${petPhoto}" alt="${petName}" class="pet-photo" onerror="this.src='https://via.placeholder.com/300x200?text=No+Photo+Available'">
            <div class="pet-info">
                <h3 class="pet-name">${petName}</h3>
                <p class="pet-breed"><strong>Breed:</strong> ${petBreed}</p>
                <p class="pet-color"><strong>Color:</strong> ${petColor}</p>
                <p class="pet-description">${petDescription}</p>
            </div>
        `;
        
        petsGrid.appendChild(petCard);
    });
    
    // Add pets grid to results container
    resultsContainer.appendChild(petsGrid);
    
    // Append results container to main page
    document.body.appendChild(resultsContainer);
};
// 6. EVENT LISTENERS AND INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    // Get reference to the form element
    const form = document.getElementById('petFinderForm');
    
    // Add event listener to form
    if (form) {
        form.addEventListener('submit', onFormSubmit);
    } else {
        console.error('Pet finder form not found. Make sure your HTML has a form with id="petFinderForm"');
    }
});

// 7. ERROR HANDLING
function showError(message) {
    // Clear exixting results
    const existingResults = document.getElementById('results');
    if (existingResults) {
        existingResults.remove();
    }
    
    // error container
    const errorContainer = document.createElement('div');
    errorContainer.id = 'results';
    errorContainer.className = 'results-container error-container';
    
    // error message
    const errorMessage = document.createElement('h2');
    errorMessage.textContent = message;
    errorMessage.className = 'error-message';
    
    errorContainer.appendChild(errorMessage);
    document.body.appendChild(errorContainer);
}

