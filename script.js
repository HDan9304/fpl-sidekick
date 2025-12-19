document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const inputField = document.getElementById('teamID');

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

    if (!id) {
        // Add a temporary red border to input if empty
        document.getElementById('teamID').style.borderColor = 'var(--pl-red)';
        setTimeout(() => document.getElementById('teamID').style.borderColor = '#eee', 1000);
        return;
    }

    // UI Loading State
    searchBtn.disabled = true;
    searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scouting...'; // Icon spins!
    resultDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    try {
        // 1. Get Global Data
        const staticProxy = `https://api.allorigins.win/get?url=${encodeURIComponent('https://fantasy.premierleague.com/api/bootstrap-static/')}`;
        const staticRes = await fetch(staticProxy);
        const staticData = JSON.parse((await staticRes.json()).contents);

        // Map Players and Teams
        const playerMap = {};
        staticData.elements.forEach(p => {
            playerMap[p.id] = {
                web_name: p.web_name,
                team_code: p.team,
                form: parseFloat(p.form),
                now_cost: p.now_cost / 10,
            };
        });

        const teamMap = {};
        staticData.teams.forEach(t => teamMap[t.id] = t.short_name);

        // Get Current Gameweek
        const gw = staticData.events.find(e => e.is_current)?.id || 1;

        // 2. Get User Picks
        const picksProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://fantasy.premierleague.com/api/entry/${id}/event/${gw}/picks/`)}`;
        const picksRes = await fetch(picksProxy);
        const picksData = JSON.parse((await picksRes.json()).contents);

        // 3. Get Manager Details
        const entryProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://fantasy.premierleague.com/api/entry/${id}/`)}`;
        const entryRes = await fetch(entryProxy);
        const entryData = JSON.parse((await entryRes.json()).contents);

        // 4. Render HTML
        let html = `
            <div class="manager-card">
                <div class="manager-name"><i class="fa-solid fa-shirt"></i> ${entryData.name}</div>
                <div class="manager-meta">
                    ${entryData.player_first_name} ${entryData.player_last_name} &bull; 
                    <span style="color:var(--pl-purple); font-weight:bold">${picksData.entry_history.points} pts</span>
                </div>
            </div>
            
            <div class="section-title">Starting XI</div>
            <ul class="player-list">
        `;

        picksData.picks.forEach((pick, index) => {
            const player = playerMap[pick.element];
            const teamName = teamMap[player.team_code];
            
            // LOGIC: Cold Form Badge with Icon
            let chipHTML = '';
            if (index < 11 && player.form < 2.0) {
                // Here is the FontAwesome Snowflake Icon
                chipHTML = `<span class="chip chip-cold"><i class="fa-regular fa-snowflake"></i> ${player.form}</span>`;
            }

            if (index === 11) {
                html += `</ul><div class="section-title">Bench</div><ul class="player-list">`;
            }

            html += `
                <li class="player-item">
                    <div>
                        <span class="p-name">${player.web_name} ${chipHTML}</span>
                        <span class="p-team">${teamName}</span>
                    </div>
                    <span class="p-cost">£${player.now_cost}m</span>
                </li>
            `;
        });

        html += `</ul>`;
        resultDiv.innerHTML = html;
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `
            <div style="text-align:center; padding:20px; color:var(--pl-red);">
                <i class="fa-solid fa-circle-exclamation" style="font-size:2rem; margin-bottom:10px;"></i><br>
                <strong>Team Not Found</strong><br>
                <span style="font-size:0.8rem; color:#666">Check the ID and try again.</span>
            </div>
        `;
        resultDiv.classList.remove('hidden');
    } finally {
        loadingDiv.classList.add('hidden');
        searchBtn.disabled = false;
        searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Find Team';
    }
}
