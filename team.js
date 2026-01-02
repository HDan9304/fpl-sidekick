console.log("Team Page Loaded");

const MY_PROXY = 'https://fpl-proxy.harithdanish0309.workers.dev/?url=';

async function initMyTeam() {
    const loading = document.getElementById('loadingState');
    const content = document.getElementById('teamContent');
    const error = document.getElementById('errorState');
    
    // 1. Get ID from Storage (Saved during login on index.html)
    const savedId = localStorage.getItem('fplTeamId');

    if (!savedId) {
        loading.style.display = 'none';
        error.style.display = 'block';
        return;
    }

    try {
        loading.querySelector('h2').innerText = "Fetching Data..."; // Update status

        // 2. Fetch User Summary
        const apiUrl = `https://fantasy.premierleague.com/api/entry/${savedId}/`;
        const response = await fetch(MY_PROXY + apiUrl);
        
        if (!response.ok) throw new Error("API Error: " + response.status);
        
        const data = await response.json();
        console.log("Team Data:", data); // Debug log

        // 3. Inject Data (With Safety Checks)
        document.getElementById('teamNameDisplay').innerText = data.name || "My Team";
        document.getElementById('managerNameDisplay').innerText = `${data.player_first_name} ${data.player_last_name}`;
        
        // Handle potential NULL values (e.g. for new teams or start of season)
        document.getElementById('gwPoints').innerText = data.summary_event_points ?? 0;
        document.getElementById('totalPoints').innerText = data.summary_overall_points ?? 0;
        
        // Safe Rank Check: If rank is null, show "Unranked"
        const rank = data.summary_overall_rank;
        document.getElementById('overallRank').innerText = rank ? rank.toLocaleString() : "Unranked";

        // 4. Show Content
        loading.style.display = 'none';
        content.style.display = 'block';

    } catch (e) {
        console.error(e);
        loading.innerText = "Error loading data.";
    }
}

// Run immediately
initMyTeam();