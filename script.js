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

// --- MODAL & TUTORIAL LOGIC ---
const authModal = document.getElementById('authModal');
const closeModalX = document.getElementById('closeModalX');
const loginConfirmBtn = document.getElementById('loginConfirmBtn');
const startTourBtn = document.getElementById('startTourBtn');
const tourTooltip = document.getElementById('tourTooltip');
const tourText = document.getElementById('tourText');
const tourNextBtn = document.getElementById('tourNextBtn');

let isLoggedIn = false;

// 1. Handle Account Click
accountBtn.addEventListener('click', () => {
    if (isLoggedIn) {
        if(confirm("Log out of FPL Sidekick?")) {
            isLoggedIn = false;
            accountBtn.querySelector('svg').style.fill = "none";
        }
    } else {
        // Open Modal
        authModal.classList.add('active');
    }
});

// Close Modal Logic
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

// 3. Tutorial System
const tourSteps = [
    { el: 'menuBtn', text: "Use this menu to navigate between Dashboard, Fixtures, and Stats." },
    { el: 'loginToggle', text: "Click here to Login or manage your FPL Account settings." },
    { el: 'brand-logo', text: "Welcome to FPL Sidekick. Good luck this season!" }
];

let currentStep = 0;

startTourBtn.addEventListener('click', () => {
    authModal.classList.remove('active'); // Close modal
    currentStep = 0;
    runTourStep();
});

function runTourStep() {
    if(currentStep >= tourSteps.length) {
        tourTooltip.style.display = 'none'; // End tour
        return;
    }

    const step = tourSteps[currentStep];
    const targetEl = document.getElementsByClassName(step.el)[0] || document.getElementById(step.el);
    
    if(targetEl) {
        // Calculate Position
        const rect = targetEl.getBoundingClientRect();
        
        tourTooltip.style.display = 'block';
        tourTooltip.style.top = (rect.bottom + 15) + 'px';
        // Center tooltip horizontally relative to target
        tourTooltip.style.left = (rect.left + (rect.width/2) - 100) + 'px'; 
        
        tourText.innerText = step.text;
    }
}

tourNextBtn.addEventListener('click', () => {
    currentStep++;
    runTourStep();
});
