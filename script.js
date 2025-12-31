console.log("FPL Sidekick Loaded");

// Select DOM elements
const accountBtn = document.getElementById('loginToggle');
const menuBtn = document.getElementById('menuBtn');

// State Variables
let isLoggedIn = false;

// 1. Handle Login/Logout Logic
accountBtn.addEventListener('click', () => {
    if (!isLoggedIn) {
        // In the future, this will open a modal or redirect to login page
        isLoggedIn = true;
        alert("Success: You are now logged in to FPL Sidekick.");
        
        // Optional: Visual feedback (change icon fill)
        accountBtn.querySelector('svg').style.fill = "#FF3D00"; 
    } else {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            isLoggedIn = false;
            // Optional: Remove visual feedback
            accountBtn.querySelector('svg').style.fill = "none";
        }
    }
});

// 2. Handle Hamburger Menu (Placeholder Logic)
menuBtn.addEventListener('click', () => {
    console.log("Menu button clicked");
    // We will populate this when we build the sidebar
});
