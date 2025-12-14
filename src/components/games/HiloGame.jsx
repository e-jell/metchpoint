import React, { useState } from 'react';
import { Crown, ArrowUp, ArrowDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HiloGame = ({ onBack }) => {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, GAME_OVER, CASHED_OUT
    const [betAmount, setBetAmount] = useState(10);
    const [currentCard, setCurrentCard] = useState(null); // { rank: 14, suit: 'S' }
    const [historyCards, setHistoryCards] = useState([]);
    const [multiplier, setMultiplier] = useState(1.00);
    const [processing, setProcessing] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Helper to render card
    // Ranks: 2-14 (11=J, 12=Q, 13=K, 14=A)
    const getRankSymbol = (r) => {
        if (r === 11) return 'J';
        if (r === 12) return 'Q';
        if (r === 13) return 'K';
        if (r === 14) return 'A';
        return r;
    };
    const getSuitSymbol = (s) => {
        if (s === 'H') return '♥';
        if (s === 'D') return '♦';
        if (s === 'C') return '♣';
        if (s === 'S') return '♠';
        return s;
    };
    const getCardColor = (s) => (s === 'H' || s === 'D' ? 'text-red-500' : 'text-white');

    const startGame = async () => {
        if (betAmount > user.balance) return alert("Insufficient funds");
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/hilo/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount: betAmount })
            });
            const data = await res.json();
            if (data.success) {
                setGameState('PLAYING');
                setCurrentCard(data.card);
                setHistoryCards([]);
                setMultiplier(1.00);
            }
        } catch (e) { }
        setProcessing(false);
    };

    const handleGuess = async (prediction) => {
        if (processing) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/hilo/next`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, prediction })
            });
            const data = await res.json();

            // Animate transition (simple delay for now)
            setHistoryCards(prev => [currentCard, ...prev].slice(0, 5));
            setCurrentCard(data.card);

            if (data.status === 'won') {
                setMultiplier(data.multiplier);
            } else {
                setGameState('GAME_OVER');
            }
        } catch (e) { }
        setProcessing(false);
    };

    const handleCashout = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/hilo/cashout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (data.success) {
                setGameState('CASHED_OUT');
                window.location.reload();
            }
        } catch (e) { }
        setProcessing(false);
    };

    // Calculate win probability for UI
    const totalRanks = 13;
    const higherProb = currentCard ? ((14 - currentCard.rank) / 13) * 100 : 0;
    const lowerProb = currentCard ? ((currentCard.rank - 2) / 13) * 100 : 0;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                ← Back to Games
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Game Area */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center relative min-h-[500px]">

                    {/* Multiplier Stats */}
                    {gameState === 'PLAYING' && (
                        <div className="absolute top-6 right-6 text-right">
                            <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">Total Multiplier</div>
                            <div className="text-4xl font-black text-[var(--primary)] drop-shadow-[0_0_10px_var(--primary)]">
                                {multiplier.toFixed(2)}x
                            </div>
                            <div className="text-white text-sm font-bold mt-1">
                                Win: ${(betAmount * multiplier).toFixed(2)}
                            </div>
                        </div>
                    )}

                    {/* Card Display */}
                    <div className="relative w-48 h-72 bg-[#1a1a1a] rounded-2xl border-4 border-white/10 shadow-2xl flex items-center justify-center transform transition-all duration-500 hover:scale-105">
                        {currentCard ? (
                            <div className={`w-full h-full p-4 flex flex-col justify-between ${getCardColor(currentCard.suit)}`}>
                                <div className="text-4xl font-black font-serif text-left">{getRankSymbol(currentCard.rank)}</div>
                                <div className="text-6xl text-center self-center">{getSuitSymbol(currentCard.suit)}</div>
                                <div className="text-4xl font-black font-serif text-right rotate-180">{getRankSymbol(currentCard.rank)}</div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/5">
                                <Crown size={64} className="text-white/10" />
                            </div>
                        )}

                        {/* Win/Loss Overlay */}
                        {gameState === 'GAME_OVER' && <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl backdrop-blur-sm"><span className="text-red-500 font-black text-3xl uppercase">Loss</span></div>}
                        {gameState === 'CASHED_OUT' && <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl backdrop-blur-sm"><span className="text-[var(--primary)] font-black text-3xl uppercase">Won</span></div>}
                    </div>

                    {/* History Row */}
                    <div className="mt-8 flex gap-2 h-16 items-center">
                        {historyCards.map((c, i) => (
                            <div key={i} className={`w-10 h-14 bg-[#2a2a2a] rounded border border-white/5 flex items-center justify-center text-xs font-bold ${getCardColor(c.suit)} opacity-50`}>
                                {getRankSymbol(c.rank)}
                                {getSuitSymbol(c.suit)}
                            </div>
                        ))}
                    </div>

                </div>

                {/* Controls */}
                <div className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Crown className="text-[var(--primary)]" />
                        Hilo
                    </h3>

                    <div className="space-y-6 flex-1">
                        {gameState === 'PLAYING' ? (
                            <div className="grid gap-4">
                                <button
                                    onClick={() => handleGuess('higher')}
                                    className="p-6 bg-[#2a2a2a] rounded-xl hover:bg-[#3a3a3a] border border-white/5 hover:border-[var(--primary)] transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold uppercase flex items-center gap-2"><ArrowUp size={16} /> Higher</span>
                                        <span className="text-xs text-gray-500 font-mono">{(higherProb).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                        Payout: {(0.95 / (higherProb / 100) || 0).toFixed(2)}x
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleGuess('lower')}
                                    className="p-6 bg-[#2a2a2a] rounded-xl hover:bg-[#3a3a3a] border border-white/5 hover:border-red-500 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold uppercase flex items-center gap-2"><ArrowDown size={16} /> Lower</span>
                                        <span className="text-xs text-gray-500 font-mono">{(lowerProb).toFixed(1)}%</span>
                                    </div>
                                    <div className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Payout: {(0.95 / (lowerProb / 100) || 0).toFixed(2)}x
                                    </div>
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Bet Amount</label>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white font-mono text-lg focus:border-[var(--primary)] focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        {gameState === 'PLAYING' ? (
                            <button
                                onClick={handleCashout}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.4)] flex items-center justify-center gap-2"
                            >
                                <LogOut size={20} />
                                CASHOUT
                            </button>
                        ) : (
                            <button
                                onClick={startGame}
                                className="w-full bg-[var(--primary)] hover:bg-[#00cc6a] text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                            >
                                Deal Cards
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
