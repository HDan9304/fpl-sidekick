document.addEventListener('DOMContentLoaded', async () => {
    
    const deadlineElement = document.getElementById('gw-deadline');
    const scoutElement = document.getElementById('scout-pick');
    const avgElement = document.getElementById('avg-score');
    const marketElement = document.getElementById('market-mover');

    // 1. Define the API URLs through a Proxy
    const PROXY_URL = 'https://api.allorigins.win/raw?url=';
    const BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';
    const FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/?future=1'; // Fetch future fixtures
    
    try {
        // Fetch BOTH endpoints in parallel using Promise.all
        const [bootstrapRes, fixturesRes] = await Promise.all([
            fetch(PROXY_URL + encodeURIComponent(BOOTSTRAP_URL)),
            fetch(PROXY_URL + encodeURIComponent(FIXTURES_URL))
        ]);
        
        if (!bootstrapRes.ok || !fixturesRes.ok) throw new Error('Network response was not ok');
        
        const data = await bootstrapRes.json();     // Main Data
        const fixtures = await fixturesRes.json();  // Fixtures Data (Available for future features)
        
        // --- A. REAL DEADLINE LOGIC ---
        // Find the first event (Gameweek) where 'finished' is false
        const nextGw = data.events.find(event => event.finished === false);
        
        if (nextGw) {
            const deadlineDate = new Date(nextGw.deadline_time);
            const now = new Date();
            
            // Format time for user's locale
            const userTime = deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const userDay = deadlineDate.toLocaleDateString([], { weekday: 'short' });

            // Calculate hours left
            const diffMs = deadlineDate - now;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

            // Update DOM
            deadlineElement.innerHTML = `GW${nextGw.id}: ${userDay} ${userTime} <span style="font-size:0.7em; color:#888;">(${diffHrs}h left)</span>`;
            
            // Update Average Score (using previous GW data if available, or current)
            const currentGw = data.events.find(event => event.is_current === true);
            if (currentGw) {
                avgElement.innerText = `${currentGw.average_entry_score} pts`;
            } else {
                avgElement.innerText = "-"; // Season break or pre-season
            }

        } else {
            deadlineElement.innerText = "Season Finished";
        }

        // --- B. REAL MARKET MOVER (Most Transferred In) ---
        // We need to look at the 'elements' (players) array
        // Sort by 'transfers_in_event' (current GW transfers)
        const players = data.elements;
        const topMover = players.sort((a, b) => b.transfers_in_event - a.transfers_in_event)[0];
        
        if (topMover) {
            // Convert large numbers to 'k' format (e.g. 150000 -> 150k)
            const countK = (topMover.transfers_in_event / 1000).toFixed(1) + 'k';
            marketElement.innerHTML = `${topMover.web_name} <span style="font-size:0.7em; color:#00ff85;">+${countK}</span>`;
        }

        // --- C. SCOUT PICK (Still Simulated for now) ---
        // The bootstrap-static API doesn't give "Scout Picks" directly.
        // We will keep your logic or placeholder here until we build a "Scout" scraper.
        scoutElement.innerText = "Haaland (vs LIV)"; 

    } catch (error) {
        console.error('Error fetching FPL data:', error);
        deadlineElement.innerText = "Error Loading";
        marketElement.innerText = "-";
        avgElement.innerText = "-";
    }
});