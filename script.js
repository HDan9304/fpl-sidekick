// Wait for the page to load
document.addEventListener('DOMContentLoaded', () => {
    
    // Get references to HTML elements
    const searchBtn = document.getElementById('searchBtn');
    const inputField = document.getElementById('teamID');
    
    // Add Event Listeners
    searchBtn.addEventListener('click', getTeam);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getTeam();
    });
});

async function getTeam() {
    const id = document.getElementById('teamID').value;
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const searchBtn = document.getElementById('searchBtn');

    // Validation
    if (!id) {
        alert("Please enter a valid Team ID");
        return;
    }

    // UI State: Loading
    searchBtn.disabled = true;
    searchBtn.innerText = 'Scouting...';
    resultDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    try {
        // --- API STEP 1: Get Global Data (Players/Teams) ---
        const staticUrl = `https://fantasy.premierleague.com/api/bootstrap-static/`;
        // We use 'allorigins' proxy to bypass CORS restrictions
        const staticProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(staticUrl)}`;
        
        const staticRes = await fetch(staticProxy);
        const staticRaw = await staticRes.json();
        const staticData = JSON.parse(staticRaw.contents);

        // Map data for easy lookup
        const playerMap = {};
        staticData.elements.forEach(p => {
            playerMap[p.id] = {
                web_name: p.web_name,
                team_code: p.team,
                form: parseFloat(p.form),
                now_cost: p.now_cost / 10,
                status: p.status // 'a' = available, 'd' = doubt, 'i' = injured
            };
        });

        // Get Team Short Names (e.g., ARS, LIV)
        const teamMap = {};
        staticData.teams.forEach(t => {
            teamMap[t.id] = t.short_name;
        });

        // Find Current Gameweek
        const currentEvent = staticData.events.find(e => e.is_current) || { id: 1 };
        const gw = currentEvent.id;


        // --- API STEP 2: Get User's Picks ---
        const picksUrl = `https://fantasy.premierleague.com/api/entry/${id}/event/${gw}/picks/`;
        const picksProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(picksUrl)}`;
        
        const picksRes = await fetch(picksProxy);
        const picksRaw = await picksRes.json();
        const picksData = JSON.parse(picksRaw.contents);


        // --- API STEP 3: Get User's Details ---
        const entryUrl = `https://fantasy.premierleague.com/api/entry/${id}/`;
        const entryProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(entryUrl)}`;
        
        const entryRes = await fetch(entryProxy);
        const entryRaw = await entryRes.json();
        const entryData = JSON.parse(entryRaw.contents);


        // --- RENDER STEP: Build the HTML ---
        
        // 1. Header Info
        let html = `
            <div class="result-header">
                <div class="manager-name">${entryData.name}</div>
                <div class="meta-info">
                    ${entryData.player_first_name} ${entryData.player_last_name} | 
                    GW${gw} Points: ${picksData.entry_history.points}
                </div>
            </div>
            <div class="section-title">Starting XI</div>
            <ul class="player-list">
        `;

        // 2. Loop through players
        picksData.picks.forEach((pick, index) => {
            const player = playerMap[pick.element];
            const teamName = teamMap[player.team_code];
            
            // LOGIC: The "Transfer Helper" Chip
            // If form is bad (< 2.0) AND they are in starting XI
            let chipHTML = '';
            if (index < 11 && player.form < 2.0) {
                chipHTML = `<span class="chip chip-cold">COLD: ${player.form}</span>`;
            }

            // Divider for Bench
            if (index === 11) {
                html += `</ul><div class="section-title">Bench</div><ul class="player-list">`;
            }

            html += `
                <li class="player-item">
                    <div class="player-info">
                        <span class="p-name">
                            ${player.web_name} 
                            ${chipHTML}
                        </span>
                        <span class="p-team">${teamName}</span>
                    </div>
                    <span class="p-cost">£${player.now_cost}m</span>
                </li>
            `;
        });

        html += `</ul>`; // Close list

        // Inject into page
        resultDiv.innerHTML = html;
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p style="color:red; text-align:center;">Could not find team. <br>Check ID or try again later.</p>`;
        resultDiv.classList.remove('hidden');
    } finally {
        // UI Cleanup
        loadingDiv.classList.add('hidden');
        searchBtn.disabled = false;
        searchBtn.innerText = 'Find Team';
    }
}
