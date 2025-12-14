import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MatchCard } from '../components/MatchCard';
import { GamesGrid } from '../components/GamesGrid';
import { useMatches } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext';
import { History, LayoutGrid, Radio } from 'lucide-react';

export const Dashboard = () => {
    const { matches } = useMatches();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('matches');

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f1715] text-white font-sans">
            {/* Navbar handled by App layout */}

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Custom Toggle Header */}
                <div className="flex justify-center mb-10">
                    <div className="bg-black/40 p-1.5 rounded-xl border border-white/5 flex gap-1 relative overflow-hidden">
                        {/* Tab Background Pill Animation */}
                        <div className={`absolute top-1.5 bottom-1.5 rounded-lg bg-[var(--primary)] transition-all duration-300 ease-out z-0 
                            ${activeTab === 'matches' ? 'left-1.5 w-[220px]' : 'left-[230px] w-[150px]'}`}
                        />

                        {/* Matches Tab */}
                        <button
                            onClick={() => setActiveTab('matches')}
                            className={`relative z-10 flex items-center gap-3 px-6 py-3 rounded-lg transition-colors duration-300 w-[220px] justify-center
                                ${activeTab === 'matches' ? 'text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Radio size={18} className={activeTab === 'matches' ? 'animate-pulse' : ''} />
                            <span className="uppercase tracking-wider text-sm font-bold">Live Matches</span>
                        </button>

                        {/* Games Tab */}
                        <button
                            onClick={() => setActiveTab('games')}
                            className={`relative z-10 flex items-center gap-3 px-6 py-3 rounded-lg transition-colors duration-300 w-[150px] justify-center
                                ${activeTab === 'games' ? 'text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                            <span className="uppercase tracking-wider text-sm font-bold">Games</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="flex gap-8 items-start">

                    {/* Left: Content Area */}
                    <div className="flex-1 space-y-4">
                        {activeTab === 'matches' ? (
                            matches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))
                        ) : (
                            <GamesGrid />
                        )}

                        {/* Simple instruction text for games */}
                        {activeTab === 'games' && (
                            <div className="text-center py-8 text-gray-500 text-xs uppercase tracking-widest opacity-50">
                                Select a game to play
                            </div>
                        )}
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
