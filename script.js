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

// --- MODAL & ID GUIDE LOGIC ---
const authModal = document.getElementById('authModal');
const closeModalX = document.getElementById('closeModalX');
const loginConfirmBtn = document.getElementById('loginConfirmBtn');

// View Toggling Elements
const showGuideBtn = document.getElementById('showGuideBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const loginView = document.getElementById('loginView');
const guideView = document.getElementById('guideView');

let isLoggedIn = false;

// 1. Handle Account Click
accountBtn.addEventListener('click', () => {
    if (isLoggedIn) {
        if(confirm("Log out of FPL Sidekick?")) {
            isLoggedIn = false;
            accountBtn.querySelector('svg').style.fill = "none";
        }
    } else {
        authModal.classList.add('active');
        // Reset to login view when opening
        loginView.style.display = 'block';
        guideView.style.display = 'none';
    }
});

closeModalX.addEventListener('click', () => { authModal.classList.remove('active'); });

// 2. Login Action
loginConfirmBtn.addEventListener('click', () => {
    const id = document.getElementById('teamIdInput').value;
    if(id) {
        isLoggedIn = true;
        accountBtn.querySelector('svg').style.fill = "#FF3D00";
        authModal.classList.remove('active');
        alert(`Team ${id} Loaded Successfully!`);
    }
});

// 3. Toggle Guide Logic
showGuideBtn.addEventListener('click', () => {
    loginView.style.display = 'none';
    guideView.style.display = 'block';
});

backToLoginBtn.addEventListener('click', () => {
    guideView.style.display = 'none';
    loginView.style.display = 'block';
});
