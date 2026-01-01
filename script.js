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
        // FASTER PROXY: Direct Stream via corsproxy.io
        const proxyUrl = 'https://corsproxy.io/?';
        const apiUrl = encodeURIComponent(`https://fantasy.premierleague.com/api/entry/${id}/`);
        
        const response = await fetch(proxyUrl + apiUrl);
        
        if (!response.ok) throw new Error("Network Error");
        
        // Direct JSON parse (No double unwrapping needed)
        const fplData = await response.json();

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

// --- GAMEWEEK COUNTDOWN LOGIC ---
async function initCountdown() {
    const container = document.getElementById('countdownContainer');
    const label = document.getElementById('gwLabel');
    
    try {
        container.style.display = 'inline-block'; // Show container
        const apiUrl = encodeURIComponent('https://fantasy.premierleague.com/api/bootstrap-static/');
        let fplStatic;

        try {
            // 1. Try Fast Proxy
            const r1 = await fetch('https://corsproxy.io/?' + apiUrl);
            if (!r1.ok) throw new Error("Blocked");
            fplStatic = await r1.json();
        } catch (e) {
            // 2. Fallback to Reliable Proxy
            console.log("Fast proxy failed, switching to backup...");
            const r2 = await fetch('https://api.allorigins.win/get?url=' + apiUrl);
            const data = await r2.json();
            fplStatic = JSON.parse(data.contents);
        }

        // Find Next Gameweek
        const nextGw = fplStatic.events.find(event => event.is_next);

        if (!nextGw) {
            label.innerText = "Season Finished";
            return;
        }

        label.innerText = `${nextGw.name} Deadline`;
        const deadlineDate = new Date(nextGw.deadline_time);

        // Start Timer Interval
        setInterval(() => {
            const now = new Date();
            const diff = deadlineDate - now;

            if (diff <= 0) {
                label.innerText = "Deadline Passed";
                document.getElementById('cdDays').innerText = "00";
                document.getElementById('cdHours').innerText = "00";
                document.getElementById('cdMins').innerText = "00";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            document.getElementById('cdDays').innerText = days.toString().padStart(2, '0');
            document.getElementById('cdHours').innerText = hours.toString().padStart(2, '0');
            document.getElementById('cdMins').innerText = minutes.toString().padStart(2, '0');

        }, 1000);

    } catch (error) {
        console.error("Countdown Error:", error);
        label.innerText = "Countdown Unavailable";
    }
}

// Run on Load
initCountdown();
initTemplateTeam();

// --- TEMPLATE TEAM LOGIC ---
async function initTemplateTeam() {
    try {
        const apiUrl = encodeURIComponent('https://fantasy.premierleague.com/api/bootstrap-static/');
        let data;

        try {
            // 1. Try Fast Proxy
            const r1 = await fetch('https://corsproxy.io/?' + apiUrl);
            if (!r1.ok) throw new Error("Blocked");
            data = await r1.json();
        } catch (e) {
            // 2. Fallback to Reliable Proxy
            const r2 = await fetch('https://api.allorigins.win/get?url=' + apiUrl);
            const wrapped = await r2.json();
            data = JSON.parse(wrapped.contents);
        }

        window.fplTeams = data.teams; // Save teams globally for lookup
        const elements = data.elements; // All players

        // Filter and Sort by Ownership % (High to Low)
        const sorted = elements.sort((a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent));

        // Get Top Picks per Position (Standard 3-4-3 Formation)
        const gkps = sorted.filter(p => p.element_type === 1).slice(0, 1);
        const defs = sorted.filter(p => p.element_type === 2).slice(0, 3);
        const mids = sorted.filter(p => p.element_type === 3).slice(0, 4);
        const fwds = sorted.filter(p => p.element_type === 4).slice(0, 3);

        // Get Bench (Next Best: 1 GK, 1 MID, 2 DEF)
        const bench = [
            ...sorted.filter(p => p.element_type === 1).slice(1, 2), // 2nd GK
            ...sorted.filter(p => p.element_type === 3).slice(4, 5), // 5th MID
            ...sorted.filter(p => p.element_type === 2).slice(3, 5)  // 4th & 5th DEF
        ];

        // Render Function
        const renderRow = (players, containerId) => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            players.forEach(p => {
                const card = document.createElement('div');
                card.className = 'player-card';
                
                // Determine Kit Image (GKP has a different file suffix)
                // element_type 1 = Goalkeeper. Standard suffix = -66.png, GKP suffix = _1-66.png
                const suffix = p.element_type === 1 ? '_1-66.png' : '-66.png';
                const kitUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${p.team_code}${suffix}`;

                // Add Click Event
                card.onclick = () => openPlayerProfile(p);
                card.style.cursor = "pointer";

                card.innerHTML = `
                    <div class="jersey-container">
                        <img src="${kitUrl}" alt="${p.web_name} Kit" class="jersey-img" onerror="this.style.display='none'">
                    </div>
                    <div class="player-info-box">
                        <div class="player-name">${p.web_name}</div>
                        <div class="player-meta">
                            <span>£${(p.now_cost / 10).toFixed(1)}</span>
                            <span class="own">${p.selected_by_percent}%</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        };

        // Inject into Pitch
        renderRow(gkps, 'pitch-gkp');
        renderRow(defs, 'pitch-def');
        renderRow(mids, 'pitch-mid');
        renderRow(fwds, 'pitch-fwd');
        renderRow(bench, 'pitch-bench'); // Inject Bench

    } catch (error) {
        console.error("Template Team Error:", error);
    }
}

// --- PLAYER PROFILE LOGIC ---
const playerModal = document.getElementById('playerModal');
const closePlayerModal = document.getElementById('closePlayerModal');

closePlayerModal.addEventListener('click', () => {
    playerModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore Background Scroll
});

async function openPlayerProfile(player) {
    playerModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock Background Scroll
    
    document.getElementById('modalPlayerName').innerText = player.web_name;
    document.getElementById('modalPlayerTeam').innerText = "Loading fixtures...";
    const fixturesList = document.getElementById('modalFixtures');
    fixturesList.innerHTML = '<div style="color:#aaa;">Fetching data...</div>';

    try {
        const apiUrl = encodeURIComponent(`https://fantasy.premierleague.com/api/element-summary/${player.id}/`);
        let summary;

        // Dual Proxy Fetch
        try {
            const r1 = await fetch('https://corsproxy.io/?' + apiUrl);
            if (!r1.ok) throw new Error("Blocked");
            summary = await r1.json();
        } catch (e) {
            const r2 = await fetch('https://api.allorigins.win/get?url=' + apiUrl);
            const data = await r2.json();
            summary = JSON.parse(data.contents);
        }

        // Render Fixtures
        const upcoming = summary.fixtures.slice(0, 5); // Next 5 games
        fixturesList.innerHTML = '';
        
        // Update Team Name (Look up from global variable)
        const team = window.fplTeams.find(t => t.code === player.team_code);
        document.getElementById('modalPlayerTeam').innerText = team ? team.name : "Premier League";

        upcoming.forEach(fix => {
            const isHome = fix.is_home;
            const oppId = isHome ? fix.team_a : fix.team_h;
            const oppTeam = window.fplTeams.find(t => t.id === oppId);
            const oppName = oppTeam ? oppTeam.short_name : "UNK";
            
            const row = document.createElement('div');
            row.className = 'fixture-row';
            row.innerHTML = `
                <span class="fixture-opp">${isHome ? '(H)' : '(A)'} vs ${oppName}</span>
                <span class="fdr-badge fdr-${fix.difficulty}">${fix.difficulty}</span>
            `;
            fixturesList.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        fixturesList.innerHTML = '<div style="color:red;">Data Unavailable</div>';
    }
}