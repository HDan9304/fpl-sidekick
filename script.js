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

        // --- D. SMART SCOUT & DIFFERENTIAL (Form Based) ---
        // Filter for available players with form data
        const activePlayers = data.elements.filter(p => p.status === 'a' && parseFloat(p.form) > 0);
        
        // 1. Scout Pick: Highest Form (Overall)
        const bestForm = [...activePlayers].sort((a, b) => parseFloat(b.form) - parseFloat(a.form))[0];
        
        // 2. Differential: High Form + Low Ownership (< 10%)
        const differential = activePlayers
            .filter(p => parseFloat(p.selected_by_percent) < 10)
            .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))[0];

        // Toggle display between Scout Pick and Differential every 4 seconds
        let showDiff = false;
        const cycleScout = () => {
            if (showDiff && differential) {
                scoutElement.innerHTML = `<span style="color:#00e5ff">Diff:</span> ${differential.web_name} <span style="font-size:0.7em; color:#aaa;">(${differential.form})</span>`;
            } else if (bestForm) {
                scoutElement.innerHTML = `Form: ${bestForm.web_name} <span style="font-size:0.7em; color:#aaa;">(${bestForm.form})</span>`;
            }
            showDiff = !showDiff;
        };
        
        cycleScout(); // Run immediately
        setInterval(cycleScout, 4000);

        // --- E. TEMPLATE TEAM (Full 15-Man Squad) ---
        // 1. Get Top Owned (Total 15: 2 GK, 5 DEF, 5 MID, 3 FWD)
        const getTop = (type, count) => data.elements
            .filter(p => p.element_type === type)
            .sort((a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent))
            .slice(0, count);

        const allGks = getTop(1, 2); 
        const allDefs = getTop(2, 5); 
        const allMids = getTop(3, 5); 
        const allFwds = getTop(4, 3);
        const templateSquad = [...allGks, ...allDefs, ...allMids, ...allFwds];

        // 2. Split into XI (3-4-3) and Bench
        // XI: GK1, DEF1-3, MID1-4, FWD1-3
        const xi_gks = allGks.slice(0,1);
        const xi_defs = allDefs.slice(0,3);
        const xi_mids = allMids.slice(0,4);
        const xi_fwds = allFwds.slice(0,3); // Play all 3 Fwds
        
        // Bench: GK2, DEF4-5, MID5
        const bench = [allGks[1], allDefs[3], allDefs[4], allMids[4]].filter(Boolean);

        // 3. Render Pitch View (5 Rows including Bench)
        const pitchContainer = document.getElementById('pitch-players');
        const rows = [
            { players: xi_gks, top: '2%' },
            { players: xi_defs, top: '18%' },
            { players: xi_mids, top: '38%' },
            { players: xi_fwds, top: '58%' },
            { players: bench, top: '82%' } // Bench Area (Darker bg)
        ];

        pitchContainer.innerHTML = ''; // Clear previous
        rows.forEach(row => {
            row.players.forEach((p, index) => {
                const count = row.players.length;
                const leftPos = ((index + 1) * (100 / (count + 1))) + '%';
                
                const kitUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${p.team_code}-66.png`;

                const html = `
                    <div class="pitch-player" style="top: ${row.top}; left: ${leftPos}">
                        <img src="${kitUrl}" class="kit-img" alt="Kit" onerror="this.src='https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_0-66.png'">
                        <div class="player-card-small">
                            <div>${p.web_name}</div>
                            <span class="player-meta">${p.selected_by_percent}%</span>
                        </div>
                    </div>`;
                pitchContainer.innerHTML += html;
            });
        });

        // 4. Render List View
        const listBody = document.getElementById('list-players');
        listBody.innerHTML = ''; // Clear previous
        templateSquad.forEach(p => {
            const posName = p.element_type === 1 ? 'GK' : p.element_type === 2 ? 'DEF' : p.element_type === 3 ? 'MID' : 'FWD';
            listBody.innerHTML += `
                <tr>
                    <td><span style="font-size:0.8em; opacity:0.7">${posName}</span></td>
                    <td style="font-weight:bold">${p.web_name}</td>
                    <td>${p.selected_by_percent}%</td>
                    <td>£${(p.now_cost / 10).toFixed(1)}</td>
                </tr>`;
        });

        // 5. Toggle Function (Attached to window for HTML access)
        window.toggleView = (view) => {
            if (view === 'pitch') {
                document.getElementById('view-pitch').style.display = 'block';
                document.getElementById('view-list').style.display = 'none';
                document.getElementById('btn-pitch').classList.add('active');
                document.getElementById('btn-list').classList.remove('active');
            } else {
                document.getElementById('view-pitch').style.display = 'none';
                document.getElementById('view-list').style.display = 'block';
                document.getElementById('btn-pitch').classList.remove('active');
                document.getElementById('btn-list').classList.add('active');
            }
        };

    } catch (error) {
        console.error('Error fetching FPL data:', error);
        deadlineElement.innerText = "Error Loading";
        marketElement.innerText = "-";
        avgElement.innerText = "-";
    }
});