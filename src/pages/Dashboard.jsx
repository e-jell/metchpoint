import React from 'react';
import { Navbar } from '../components/Navbar';
import { MatchCard } from '../components/MatchCard';
import { useMatches } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext';
import { History, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
    const { matches } = useMatches();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f1715] text-white font-sans">
            {/* Navbar handled by App layout */}

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-[var(--primary)] rounded-full"></span>
                        Live Matches
                    </h2>
                    <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-wider">
                        ● Live Updates
                    </span>
                </div>

                {/* Main Content Layout */}
                <div className="flex gap-8 items-start">

                    {/* Left: Match List (Vertical Stack) */}
                    <div className="flex-1 space-y-4">
                        {matches.map(match => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>

                    {/* Right: Betting History (Sidebar) */}
                    <div className="hidden lg:block w-80 shrink-0">
                        <div className="sticky top-24 bg-[#1a2321] border border-white/5 rounded-xl p-6 shadow-xl">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                                <History size={18} />
                                My Bets
                            </h3>

                            {!user.history || user.history.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm border-t border-white/5">
                                    No active bets
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {user.history.map(bet => (
                                        <div key={bet.id} className="p-3 rounded-lg bg-black/20 border-l-2 border-[var(--primary)] text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-white">{bet.details}</span>
                                                <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${bet.outcome === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                    {bet.outcome}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Stake: ${bet.stake}</span>
                                                <span className="text-[var(--primary)]">Win: ${bet.potentialWin.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
