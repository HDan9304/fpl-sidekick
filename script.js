document.addEventListener('DOMContentLoaded', async () => {
    
    const deadlineElement = document.getElementById('gw-deadline');
    const scoutElement = document.getElementById('scout-pick');
    const avgElement = document.getElementById('avg-score');
    const marketElement = document.getElementById('market-mover');

    // 1. Define the API URLs through a Proxy
    // Switching to corsproxy.io for faster response times
    const PROXY_URL = 'https://corsproxy.io/?';
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
        
        // --- A. REAL DEADLINE LOGIC (Live Countdown) ---
        // Find the first event where the deadline is in the future (ignoring active-but-closed GWs)
        const now = new Date();
        const nextGw = data.events.find(event => new Date(event.deadline_time) > now);
        
        if (nextGw) {
            const deadlineDate = new Date(nextGw.deadline_time);

            // Update timer every second
            const updateTimer = () => {
                const currentTime = new Date();
                const diffMs = deadlineDate - currentTime;

                if (diffMs > 0) {
                    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
                    
                    // Display: 05d 10h 30m 15s
                    deadlineElement.innerText = `GW${nextGw.id}: ${days}d ${hours}h ${minutes}m ${seconds}s`;
                } else {
                    deadlineElement.innerText = "Deadline Passing...";
                }
            };

            // Run immediately and then interval
            updateTimer();
            setInterval(updateTimer, 1000);

        } else {
            deadlineElement.innerText = "Season Finished";
        }

        // --- B. PREVIOUS GW MVP (Replaces Avg Score) ---
        // Find the last finished gameweek to get the top scorer
        const lastFinishedGw = data.events.filter(event => event.finished === true).pop();
        
        if (lastFinishedGw && lastFinishedGw.top_element_info) {
            // Find player name using the ID from top_element_info
            const mvpId = lastFinishedGw.top_element_info.id;
            const mvpPoints = lastFinishedGw.top_element_info.points;
            const mvpPlayer = data.elements.find(p => p.id === mvpId);
            
            if (mvpPlayer) {
                avgElement.innerText = `${mvpPlayer.web_name} (${mvpPoints} pts)`;
            } else {
                 avgElement.innerText = "-";
            }
        } else {
            avgElement.innerText = "-";
        }

        // --- C. REAL MARKET MOVER (Most Transferred In) ---
        // We need to look at the 'elements' (players) array
        // Sort by 'transfers_in_event' (current GW transfers)
        const players = data.elements;
        const topMover = players.sort((a, b) => b.transfers_in_event - a.transfers_in_event)[0];
        
        if (topMover) {
            // Convert large numbers to 'k' format (e.g. 150000 -> 150k)
            const countK = (topMover.transfers_in_event / 1000).toFixed(1) + 'k';
            marketElement.innerHTML = `${topMover.web_name} <span style="font-size:0.7em; color:#00ff85;">+${countK}</span>`;
        }

        // --- D. SCOUT PICK (Still Simulated for now) ---
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