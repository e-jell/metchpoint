
export const SPORTS = {
    CRICKET: 'cricket',
    FOOTBALL: 'football',
    CHESS: 'chess'
};

export const INITIAL_MATCHES = [
    {
        id: 'cric_01',
        sport: SPORTS.CRICKET,
        home: 'India',
        away: 'Australia',
        status: 'LIVE',
        score: { home: '142/3', away: 'Yet to bat', overs: '18.2' },
        odds: { home: 1.65, away: 2.25 }, // Implied prob: 60% vs 44% (Total 104% -> House Edge)
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
        score: { eval: '+0.5', move: '24... Nf6' }, // +0.5 advantage white
        odds: { home: 1.85, away: 1.85, draw: 3.50 },
        details: 'Speed Chess Championship'
    }
];

// Helper to calculate house edge odds
// Probability is 0-1. Margin is e.g., 1.05 (5% margin)
export const calculateOdds = (probability, margin = 1.05) => {
    if (probability <= 0) return 100.0; // Infinite odds
    return (1 / (probability * margin)).toFixed(2);
};
