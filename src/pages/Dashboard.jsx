import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { MatchCard } from '../components/MatchCard';
import { GamesGrid } from '../components/GamesGrid';
import { CrashGame } from '../components/games/CrashGame';
import { DiceGame } from '../components/games/DiceGame';
import { MinesGame } from '../components/games/MinesGame';
import { HiloGame } from '../components/games/HiloGame';
import { PlinkoGame } from '../components/games/PlinkoGame';
import { useMatches } from '../context/MatchContext';
import { useAuth } from '../context/AuthContext';
import { History, LayoutGrid, Radio } from 'lucide-react';

export const Dashboard = () => {
    const { matches } = useMatches();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('matches');
    const [selectedGame, setSelectedGame] = useState(null);

    // Debug: Check API connection
    const [apiStatus, setApiStatus] = useState('checking');
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/api/matches`)
            .then(() => setApiStatus('connected'))
            .catch(() => setApiStatus('error'));
    }, []);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0f1715] text-white font-sans relative">
            {/* API DEBUG INDICATOR */}
            <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 font-mono z-50 opacity-50 hover:opacity-100 pointer-events-none">
                API: {import.meta.env.VITE_API_URL ? 'CONFIGURED' : 'LOCALHOST'} |
                STATUS: <span className={apiStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>{apiStatus.toUpperCase()}</span>
            </div>

            {/* Navbar handled by App layout */}

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Custom Toggle Header - Only show if not inside a game */}
                {!selectedGame && (
                    <div className="flex justify-center mb-10 animate-fade-in">
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
                )}

                {/* Main Content Layout */}
                <div className="flex gap-8 items-start">

                    {/* Left: Content Area */}
                    <div className="flex-1 space-y-4">
                        {/* Game Routing Switch */}
                        {selectedGame === 'crash' ? (
                            <CrashGame onBack={() => setSelectedGame(null)} />
                        ) : selectedGame === 'dice' ? (
                            <DiceGame onBack={() => setSelectedGame(null)} />
                        ) : selectedGame === 'mines' ? (
                            <MinesGame onBack={() => setSelectedGame(null)} />
                        ) : selectedGame === 'hilo' ? (
                            <HiloGame onBack={() => setSelectedGame(null)} />
                        ) : selectedGame === 'plinko' ? (
                            <PlinkoGame onBack={() => setSelectedGame(null)} />
                        ) : activeTab === 'matches' ? (
                            matches.map(match => (
                                <MatchCard key={match.id} match={match} />
                            ))
                        ) : (
                            // Pass setSelectedGame to GamesGrid
                            <GamesGrid onSelectGame={setSelectedGame} />
                        )}

                        {/* Simple instruction text for games */}
                        {activeTab === 'games' && !selectedGame && (
                            <div className="text-center py-8 text-gray-500 text-xs uppercase tracking-widest opacity-50">
                                Select a game to play
                            </div>
                        )}
                    </div>

                    {/* Right: Betting History (Sidebar) - Hide inside games for more space? Optional. Keep for now */}
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
                                    {user.history.map((bet, idx) => (
                                        <div key={bet.id || idx} className="p-3 rounded-lg bg-black/20 border-l-2 border-[var(--primary)] text-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-white">{bet.details}</span>
                                                <span className={`text-[10px] px-1.5 rounded uppercase font-bold ${bet.outcome === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                                    {bet.outcome}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>Stake: ${bet.stake}</span>
                                                <span className="text-[var(--primary)]">Win: ${bet.potentialWin ? bet.potentialWin.toFixed(2) : '0.00'}</span>
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
