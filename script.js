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

// 2. Login Action
loginConfirmBtn.addEventListener('click', () => {
    const id = document.getElementById('teamIdInput').value;
    if(id) {
        isLoggedIn = true;
        currentTeamId = id;
        
        // Update UI
        accountBtn.querySelector('svg').style.fill = "#FF3D00";
        displayTeamId.innerText = id;
        
        // Switch to Profile Card
        switchView('profile');
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