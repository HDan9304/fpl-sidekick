document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Smart Timezone Deadline ---
    const deadlineElement = document.getElementById('gw-deadline');
    // Set next deadline (UTC). Example: Jan 4, 2025 at 11:00 UTC
    const nextDeadlineUTC = new Date('2025-01-04T11:00:00Z');
    
    const options = { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false };
    const userTime = nextDeadlineUTC.toLocaleTimeString([], options);
    
    // Calculate hours remaining
    const now = new Date();
    const diffMs = nextDeadlineUTC - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    deadlineElement.innerHTML = `${userTime} <span style="font-size:0.7em; color:#888;">(${diffHrs}h left)</span>`;


    // --- 2. Scout Pick Formula (Simulated Logic) ---
    // In the future, this will fetch from an API. 
    // Logic: Compare 3 players and pick the one with lowest "Fixture Difficulty Rating" (FDR)
    const candidates = [
        { name: "Haaland", opponent: "LIV (A)", fdr: 5 },
        { name: "Salah", opponent: "IPS (H)", fdr: 2 },
        { name: "Palmer", opponent: "CRY (H)", fdr: 2 }
    ];
    
    // Sort by easiest fixture (lowest FDR)
    const bestPick = candidates.sort((a, b) => a.fdr - b.fdr)[0];
    document.getElementById('scout-pick').innerText = `${bestPick.name} vs ${bestPick.opponent}`;


    // --- 3. Avg Score Prediction (Simulated Logic) ---
    // Logic: Base score (45) + Random variance based on "tough gameweek" factor
    const baseScore = 45;
    const difficultyFactor = Math.floor(Math.random() * 15); // Random number between 0-15
    const predictedAvg = baseScore + difficultyFactor;
    document.getElementById('avg-score').innerText = `${predictedAvg} pts`;


    // --- 4. Market Mover (New Data) ---
    const topTransfer = { name: "Isak", count: "185k" };
    document.getElementById('market-mover').innerHTML = `${topTransfer.name} <span style="font-size:0.7em; color:#00ff85;">+${topTransfer.count}</span>`;

});