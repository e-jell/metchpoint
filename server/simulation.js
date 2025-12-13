// Initial Data
const SPORTS = {
    CRICKET: 'cricket',
    FOOTBALL: 'football',
    CHESS: 'chess'
};

let matches = [
    {
        id: 'cric_01',
        sport: SPORTS.CRICKET,
        home: 'India',
        away: 'Australia',
        status: 'LIVE',
        score: { home: '142/3', away: 'Yet to bat', overs: '18.2' },
        odds: { home: 1.65, away: 2.25 },
        details: 'T20 World Cup Final'
    },
    {
        id: 'foot_01',
        sport: SPORTS.FOOTBALL,
        home: 'Arsenal',
        away: 'Liverpool',
        status: 'LIVE',
        score: { home: 1, away: 1, time: '72\'' },
        odds: { home: 2.80, away: 2.90, draw: 2.40 },
        details: 'Premier League'
    },
    {
        id: 'chess_01',
        sport: SPORTS.CHESS,
        home: 'Magnus Carlsen',
        away: 'Hikaru Nakamura',
        status: 'LIVE',
        score: { eval: '+0.5', move: '24... Nf6' },
        odds: { home: 1.85, away: 1.85, draw: 3.50 },
        details: 'Speed Chess Championship'
    },
    {
        id: 'cric_02',
        sport: SPORTS.CRICKET,
        home: 'England',
        away: 'New Zealand',
        status: 'LIVE',
        score: { home: '210/5', away: 'Yet to bat', overs: '42.0' },
        odds: { home: 1.50, away: 2.60 },
        details: 'ICC Test Championship'
    },
    {
        id: 'foot_02',
        sport: SPORTS.FOOTBALL,
        home: 'Real Madrid',
        away: 'Barcelona',
        status: 'LIVE',
        score: { home: 2, away: 3, time: '88\'' },
        odds: { home: 3.10, away: 1.90, draw: 3.20 },
        details: 'El Clasico'
    }
];

// Update Logic (Same as frontend simulation, but server-side)
const updateMatches = () => {
    matches = matches.map(match => {
        // Deep clone
        const newMatch = JSON.parse(JSON.stringify(match));
        if (Math.random() > 0.7) return match; // 30% chance to update each tick

        if (newMatch.sport === SPORTS.CRICKET) {
            let [runs, wickets] = newMatch.score.home.split('/').map(Number);
            let [overs, balls] = newMatch.score.overs.split('.').map(Number);

            const event = Math.random();
            if (event < 0.05 && wickets < 10) {
                wickets++;
                newMatch.odds.home += 0.5; newMatch.odds.away -= 0.3;
            } else if (event < 0.2) {
                runs += 4; newMatch.odds.home -= 0.05;
            } else if (event < 0.1) {
                runs += 6; newMatch.odds.home -= 0.1;
            } else {
                runs += Math.floor(Math.random() * 3) + 1;
            }
            // Over logic
            balls++; if (balls >= 6) { balls = 0; overs++; }
            newMatch.score.home = `${runs}/${wickets}`;
            newMatch.score.overs = `${overs}.${balls}`;
        }
        else if (newMatch.sport === SPORTS.FOOTBALL) {
            let time = parseInt(newMatch.score.time);
            if (time < 90) time++;
            newMatch.score.time = `${time}'`;

            if (Math.random() < 0.03) {
                if (Math.random() > 0.5) newMatch.score.home++; else newMatch.score.away++;
            }
        }
        else if (newMatch.sport === SPORTS.CHESS) {
            let currentEval = parseFloat(newMatch.score.eval);
            currentEval += (Math.random() - 0.5) * 0.4;
            newMatch.score.eval = currentEval > 0 ? `+${currentEval.toFixed(2)}` : `${currentEval.toFixed(2)}`;
        }

        return newMatch;
    });
};

// Start Loop
setInterval(updateMatches, 3000);

module.exports = {
    getMatches: () => matches,
    getMatchById: (id) => matches.find(m => m.id === id)
};
