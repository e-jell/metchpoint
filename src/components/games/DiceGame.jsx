import React, { useState } from 'react';
import { Dices, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DiceGame = ({ onBack }) => {
    const { user } = useAuth();
    const [target, setTarget] = useState(50); // Roll Under X
    const [amount, setAmount] = useState(10);
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState(null); // The rolled number
    const [won, setWon] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const multiplier = (99 / target).toFixed(2);
    const winChance = target; // Since we roll 0-100, target 50 means 50% chance (0-49.99)

    const handleRoll = async () => {
        if (amount > user.balance) {
            alert("Insufficient funds");
            return;
        }

        setRolling(true);
        setResult(null);
        setWon(null);

        // Fake animation duration
        await new Promise(r => setTimeout(r, 500));

        try {
            const res = await fetch(`${API_URL}/api/dice/bet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    amount: amount,
                    target: target,
                    condition: 'under'
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Target: ${API_URL}\nStatus: ${res.status}\nResponse: ${text.substring(0, 50)}...`);
            }

            const data = await res.json();

            if (data.success) {
                setResult(data.result);
                setWon(data.won);
                // Force UI update for balance by reloading or context (lazy reload for now)
                if (data.won) setTimeout(() => window.location.reload(), 1500);
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error(e);
            alert("Connection Error: " + e.message + "\nCheck VITE_API_URL in Vercel.");
        } finally {
            setRolling(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <button onClick={onBack} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                ← Back to Games
            </button>

            <div className="bg-[#151515] border border-white/5 rounded-2xl p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-lg text-[var(--primary)]">
                        <Dices size={24} />
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-widest">Dice</h2>
                </div>

                {/* Main Game Display */}
                <div className="bg-[#0a0a0a] rounded-xl p-8 border border-white/5 mb-8">

                    {/* Range Slider Visualization */}
                    <div className="relative h-12 bg-[#2a2a2a] rounded-full mb-12">
                        {/* Win Zone (Green) */}
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-[var(--primary)] rounded-l-full opacity-50 transition-all duration-300"
                            style={{ width: `${target}%` }}
                        />

                        {/* Slider Handle (Interactive) */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] cursor-grab active:cursor-grabbing z-20 flex items-center justify-center transition-all duration-75"
                            style={{ left: `calc(${target}% - 16px)` }}
                        >
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />
                        </div>

                        {/* Result Marker (Only show after roll) */}
                        {result !== null && (
                            <div
                                className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 border-4 rounded-full z-30 transition-all duration-500 ease-out flex items-center justify-center font-bold text-xs bg-[#0a0a0a]
                                    ${won ? 'border-[var(--primary)] text-[var(--primary)] shadow-[0_0_20px_var(--primary)]' : 'border-red-500 text-red-500 shadow-[0_0_20px_red]'}`}
                                style={{ left: `calc(${result}% - 20px)` }}
                            >
                                {result.toFixed(0)}
                            </div>
                        )}

                        <input
                            type="range"
                            min="2"
                            max="98"
                            value={target}
                            onChange={(e) => setTarget(Number(e.target.value))}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer z-40"
                            disabled={rolling}
                        />
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Multiplier</div>
                            <div className="text-2xl font-black text-white">{multiplier}x</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-[var(--primary)]/30">
                            <div className="text-[var(--primary)] text-xs uppercase tracking-widest font-bold mb-1">Roll Under</div>
                            <div className="text-2xl font-black text-[var(--primary)]">{target.toFixed(2)}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4">
                            <div className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Win Chance</div>
                            <div className="text-2xl font-black text-white">{winChance.toFixed(0)}%</div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Bet Amount</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-white font-mono text-lg focus:border-[var(--primary)] focus:outline-none"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleRoll}
                        disabled={rolling}
                        className={`w-full py-4 rounded-xl font-black text-xl uppercase tracking-widest transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
                        ${rolling ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:bg-[#00cc6a]'}`}
                    >
                        {rolling ? 'Rolling...' : 'Roll Dice'}
                    </button>
                </div>

                {/* Result Message */}
                {won !== null && !rolling && (
                    <div className={`mt-6 p-4 rounded-xl text-center font-bold uppercase tracking-widest animate-fade-in ${won ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/50' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {won ? `You Won $${(amount * multiplier).toFixed(2)}!` : 'You Lost'}
                    </div>
                )}
            </div>
        </div>
    );
};
