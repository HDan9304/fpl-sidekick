console.log("FPL Sidekick Loaded");

// --- SELECT ELEMENTS ---
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const accountBtn = document.getElementById('loginToggle');

// --- SIDEBAR LOGIC ---

// Function to open menu
function openMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
}

// Function to close menu
function closeMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// Event Listeners
menuBtn.addEventListener('click', openMenu);
closeBtn.addEventListener('click', closeMenu);
overlay.addEventListener('click', closeMenu); // Close when clicking the dark background

// --- MODAL & PROFILE LOGIC ---
const authModal = document.getElementById('authModal');
const closeModalX = document.getElementById('closeModalX');
const loginConfirmBtn = document.getElementById('loginConfirmBtn');
const logoutBtn = document.getElementById('logoutBtn');

// View Elements
const showGuideBtn = document.getElementById('showGuideBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const loginView = document.getElementById('loginView');
const guideView = document.getElementById('guideView');
const profileView = document.getElementById('profileView');
const displayTeamId = document.getElementById('displayTeamId');

let isLoggedIn = false;
let currentTeamId = null;

// Helper: Switch Views
function switchView(viewName) {
    loginView.style.display = 'none';
    guideView.style.display = 'none';
    profileView.style.display = 'none';
    
    if(viewName === 'login') loginView.style.display = 'block';
    if(viewName === 'guide') guideView.style.display = 'block';
    if(viewName === 'profile') profileView.style.display = 'block';
}

// 1. Open Modal (Smart Check)
accountBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    if (isLoggedIn) {
        switchView('profile');
    } else {
        switchView('login');
    }
});

closeModalX.addEventListener('click', () => { authModal.classList.remove('active'); });

// 2. Login Action (Async with API Fetch)
loginConfirmBtn.addEventListener('click', async () => {
    const id = document.getElementById('teamIdInput').value;
    if(!id) return;

    // UI Loading State
    const originalText = loginConfirmBtn.innerText;
    loginConfirmBtn.innerText = "Verifying...";
    loginConfirmBtn.style.opacity = "0.7";

    try {
        // Fetch via CORS Proxy (AllOrigins)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = encodeURIComponent(`https://fantasy.premierleague.com/api/entry/${id}/`);
        
        const response = await fetch(proxyUrl + apiUrl);
        const data = await response.json();
        
        // Parse the inner JSON contents
        if (!data.contents) throw new Error("Network Error");
        const fplData = JSON.parse(data.contents);

        if (fplData.detail === "Not found") throw new Error("Invalid Team ID");

        // Success: Update State & UI
        isLoggedIn = true;
        currentTeamId = id;

        document.getElementById('displayTeamName').innerText = fplData.name;
        document.getElementById('displayManagerName').innerText = `${fplData.player_first_name} ${fplData.player_last_name}`;
        document.getElementById('displayTeamId').innerText = `ID: ${fplData.id}`;
        
        accountBtn.querySelector('svg').style.fill = "#FF3D00";
        switchView('profile');

    } catch (error) {
        alert("Error: Could not retrieve team. Please check your ID.");
        console.error(error);
    } finally {
        // Reset Button
        loginConfirmBtn.innerText = originalText;
        loginConfirmBtn.style.opacity = "1";
    }
});

// 3. Logout Action
logoutBtn.addEventListener('click', () => {
    isLoggedIn = false;
    currentTeamId = null;
    
    // Reset UI
    accountBtn.querySelector('svg').style.fill = "none";
    document.getElementById('teamIdInput').value = ''; // Clear input
    
    // Go back to Login View
    switchView('login');
});

// 4. Guide Navigation
showGuideBtn.addEventListener('click', () => switchView('guide'));
backToLoginBtn.addEventListener('click', () => switchView('login'));