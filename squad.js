// squad.js
const SquadRenderer = {
    
    // Main Render Function
    render: (user, picks, players, fixMap, stats) => {
        // 1. Update Scoreboard
        document.getElementById('dispName').innerText = user.name;
        document.getElementById('dispGW').innerText = user.summary_event_points || 0;
        document.getElementById('dispTotal').innerText = user.summary_overall_points || 0;
        document.getElementById('dispRank').innerText = (user.summary_overall_rank || 0).toLocaleString();
        document.getElementById('dispBank').innerText = `£${(stats.bank/10).toFixed(1)}m`;
        document.getElementById('dispValue').innerText = `£${(stats.value/10).toFixed(1)}m`;

        // 2. Clear Containers
        const pitchDiv = document.getElementById('pitchRows');
        const benchDiv = document.getElementById('benchRow');
        const listDiv = document.getElementById('squadList');
        
        pitchDiv.innerHTML = ''; 
        benchDiv.innerHTML = ''; 
        listDiv.innerHTML = '';
        
        // 3. Organize Formation
        const formation = { 1: [], 2: [], 3: [], 4: [] };
        const squadList = [];

        picks.forEach((pick, i) => {
            const p = players[pick.element];
            if(!p) return;
            
            // Add meta data for display
            const pFull = { 
                ...p, 
                is_captain: pick.is_captain, 
                is_vice: pick.is_vice_captain, 
                is_bench: i > 10, 
                sub_order: i-10 
            };
            
            squadList.push(pFull);

            if (i < 11) formation[p.pos].push(pFull);
            else benchDiv.innerHTML += SquadRenderer.createPill(pFull, fixMap);
        });

        // 4. Render Pitch Rows (GK, DEF, MID, FWD)
        [1, 2, 3, 4].forEach(posId => {
            if(formation[posId].length > 0) {
                const row = document.createElement('div'); 
                row.className = 'field-row';
                formation[posId].forEach(p => row.innerHTML += SquadRenderer.createPill(p, fixMap));
                pitchDiv.appendChild(row);
            }
        });

        // 5. Render Desktop List
        squadList.sort((a,b) => a.pos - b.pos || a.is_bench - b.is_bench);
        squadList.forEach(p => listDiv.innerHTML += SquadRenderer.createListRow(p, fixMap));

        // Show Dashboard
        document.getElementById('dashboardView').classList.remove('hidden');
        if(window.innerWidth >= 1024) document.getElementById('dashboardView').style.display = 'grid';
        else document.getElementById('dashboardView').style.display = 'flex';
    },

    // Create the Player Card HTML
    createPill: (p, fixMap) => {
        let capBadge = p.is_captain ? `<div class="cap-badge">C</div>` : (p.is_vice ? `<div class="vice-badge cap-badge">V</div>` : '');
        let statusBadge = p.status === 'd' ? `<div class="status-flag status-warn">!</div>` : (['i', 's'].includes(p.status) ? `<div class="status-flag status-bad">×</div>` : '');
        let bNum = p.is_bench ? `<div class="bench-num">${p.sub_order}</div>` : '';

        const kitUrl = `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${p.team_code}-66.png`;
        const fix = fixMap ? (fixMap[p.team_id] || { opp: '-', diff: 3, is_home: true }) : { opp: '-', diff: 3 };
        const loc = fix.is_home ? '(H)' : '(A)';
        
        // Note: We use app.openModal() here because 'app' will be global in index.html
        return `
            <div class="player-pill ${p.is_bench ? 'bench-pill' : ''}" onclick="app.openModal(${p.id})">
                ${bNum} ${capBadge} ${statusBadge}
                <div class="fix-badge fdr-${fix.diff}">${fix.opp} ${loc}</div>
                <img src="${kitUrl}" class="kit-img" onerror="this.style.display='none'">
                <div class="pill-name">${p.name}</div>
                <div class="pill-info"><span>£${p.price}</span><span class="pts-badge">${p.event_points}</span></div>
            </div>
        `;
    },

    // Create the List Row HTML
    createListRow: (p, fixMap) => {
        const fix = fixMap ? (fixMap[p.team_id] || { opp: '-', diff: 3 }) : { opp: '-', diff: 3 };
        const posName = ['?', 'GK', 'DEF', 'MID', 'FWD'][p.pos];
        return `
            <div class="list-row" onclick="app.openModal(${p.id})">
                <div class="list-pos">${posName}</div>
                <div class="list-info">
                    <div style="font-weight:700;">${p.name} ${p.status!=='a'?'<span style="color:red">!</span>':''}</div>
                    <div style="font-size:0.7rem; color:#666;">${p.team} • <span class="fdr-${fix.diff}" style="padding:0 3px; border-radius:3px;">${fix.opp}</span></div>
                </div>
                <div class="list-pts">${p.event_points}</div>
            </div>
        `;
    }
};
