import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const TeamLogo = ({ name }) => {
    // Map common names to flag codes
    const flags = {
        'India': 'in',
        'Australia': 'au',
        'England': 'gb-eng',
        'New Zealand': 'nz',
        'Magnus Carlsen': 'no',
        'Hikaru Nakamura': 'us',
        'Real Madrid': 'es', // Use country flag for now as fallback
        'Barcelona': 'es',
        'Arsenal': 'gb-eng',
        'Liverpool': 'gb-eng'
    };

    const code = flags[name];

    if (code) {
        return (
            <img
                src={`https://flagcdn.com/w80/${code}.png`}
                alt={name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/10 shadow-lg"
            />
        );
    }

    return (
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white border-2 border-white/10">
            {name.substring(0, 1)}
        </div>
    );
};

export const MatchCard = ({ match }) => {
    const { placeBet, user } = useAuth();
    const [selectedOutcome, setSelectedOutcome] = useState(null);

    const [stake, setStake] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleBet = async () => {
        if (!selectedOutcome || !stake) return;
        setLoading(true);

        const success = await placeBet(
            match.id,
            parseFloat(stake),
            match.odds[selectedOutcome],
            `${match.homeTeam} vs ${match.awayTeam} (${selectedOutcome})`,
            selectedOutcome
        );

        if (success) {
            setMessage({ type: 'success', text: 'Bet Placed!' });
            setStake('');
            setSelectedOutcome(null);
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: 'Failed: Check Balance' });
        }
        setLoading(false);
    };

    return (
        <div className="bg-[#1a2321] border border-white/5 p-4 rounded-xl hover:border-[var(--primary)]/30 transition-all group">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Match Details (Horizontal) */}
                <div className="flex-1 w-full flex flex-col gap-2">
                    {/* Header/League Name */}
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-center border-b border-white/5 pb-2 mb-2">
                        {match.details || 'Unknown League'}
                    </div>

                    <div className="flex items-center justify-between gap-4">

                        {/* Team A (Home) */}
                        <div className="flex-1 text-right flex items-center justify-end gap-3">
                            <div>
                                <div className="text-white font-bold text-lg leading-none">{match.home}</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">HOME</div>
                            </div>
                            <TeamLogo name={match.home} />
                        </div>

                        {/* Score Center */}
                        <div className="flex flex-col items-center px-4 min-w-[120px]">
                            <div className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1 animate-pulse">
                                {match.status === 'LIVE' ? `LIVE • ${match.time || match.score.overs || ''}` : match.status}
                            </div>
                            <div className="text-3xl font-black text-white font-mono bg-black/30 px-4 py-1 rounded-lg tracking-widest border border-white/5">
                                {typeof match.score === 'object' && match.score.home && typeof match.score.home === 'number'
                                    ? `${match.score.home} - ${match.score.away}`
                                    : typeof match.score === 'string' ? match.score
                                        : `${match.score.home.split('/')[0]} - ${typeof match.score.away === 'string' && match.score.away.includes('/') ? match.score.away.split('/')[0] : 0}`
                                }
                            </div>
                        </div>

                        {/* Team B (Away) */}
                        <div className="flex-1 text-left flex items-center justify-start gap-3">
                            <TeamLogo name={match.away} />
                            <div>
                                <div className="text-white font-bold text-lg leading-none">{match.away}</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">AWAY</div>
                            </div>
                        </div>
                    </div>

                    {/* Betting Buttons */}
                    <div className="flex gap-2 w-full md:w-auto">
                        {['home', 'draw', 'away'].map(outcome => {
                            const odd = match.odds[outcome];
                            if (!odd) return null; // Skip if no odds for this outcome (e.g. no draw in cricket)

                            return (
                                <button
                                    key={outcome}
                                    onClick={() => setSelectedOutcome(selectedOutcome === outcome ? null : outcome)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-20 py-2 rounded-lg border transition-all active:scale-95",
                                        selectedOutcome === outcome
                                            ? "bg-[var(--primary)] border-[var(--primary)] text-black"
                                            : "bg-black/20 border-white/5 hover:bg-white/5 text-gray-400 hover:text-white"
                                    )}
                                >
                                    <span className="text-[10px] uppercase font-bold opacity-60">
                                        {outcome === 'home' ? '1' : outcome === 'draw' ? 'X' : '2'}
                                    </span>
                                    <span className="font-mono font-bold text-sm">
                                        {odd.toFixed(2)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Betting Input Drawer */}
                {selectedOutcome && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in flex items-center justify-end gap-3">
                        <span className="text-xs text-gray-400">
                            Placing bet on <span className="text-[var(--primary)] font-bold uppercase">{selectedOutcome}</span>
                        </span>

                        {message ? (
                            <span className={cn("text-xs font-bold", message.type === 'success' ? "text-green-500" : "text-red-500")}>
                                {message.text}
                            </span>
                        ) : (
                            <>
                                <input
                                    autoFocus
                                    type="number"
                                    placeholder="Stake..."
                                    value={stake}
                                    onChange={e => setStake(e.target.value)}
                                    className="w-24 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:border-[var(--primary)] focus:outline-none"
                                />
                                <button
                                    onClick={handleBet}
                                    disabled={loading}
                                    className="bg-[var(--primary)] text-black text-sm font-bold px-4 py-1.5 rounded hover:bg-green-400 transition-colors"
                                >
                                    {loading ? '...' : 'Confirm'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
