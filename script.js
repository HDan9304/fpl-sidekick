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

// --- ACCOUNT LOGIC (Kept from previous step) ---
let isLoggedIn = false;

accountBtn.addEventListener('click', () => {
    if (!isLoggedIn) {
        isLoggedIn = true;
        alert("Success: You are now logged in to FPL Sidekick.");
        accountBtn.querySelector('svg').style.fill = "#FF3D00"; // New Orange
    } else {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            isLoggedIn = false;
            accountBtn.querySelector('svg').style.fill = "none";
        }
    }
});
