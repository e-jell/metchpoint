import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Trophy, AlertTriangle, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CrashGame = ({ onBack }) => {
    const { user, loading, placeBet } = useAuth(); // We'll manually call APIs, but use user from context
    // Local State
    const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, CRASHED, CASHED_OUT
    const [multiplier, setMultiplier] = useState(1.00);
    const [betAmount, setBetAmount] = useState(10);
    const [crashPoint, setCrashPoint] = useState(null); // The server-determined death point
    const [winnings, setWinnings] = useState(0);
    const [history, setHistory] = useState([]); // Recent crash points

    const canvasRef = useRef(null);
    const requestRef = useRef();
    const startTimeRef = useRef();

    // API URL Helper
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Update canvas loop
    const animate = (time) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        // Growth function: 1.00 + (seconds^2 * 0.1) or exponential?
        // Standard crash is usually exponential: 1.00 * e^(k * t)
        const elapsed = (time - startTimeRef.current) / 1000; // seconds

        // Speed factor: crashes to 2x in about 3 seconds
        const currentMult = 1.00 + (elapsed * 0.5) + (elapsed * elapsed * 0.1);

        setMultiplier(currentMult);

        // Draw Graph
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;

            // Clear
            ctx.clearRect(0, 0, w, h);

            // Draw Curve
            ctx.beginPath();
            ctx.moveTo(0, h);

            // Curve logic: X moves linear, Y moves exponential
            // We map time to X (0 to w)
            // We map multiplier to Y (h to 0)

            // visual "camera" moves so the rocket stays somewhat centered or zooms out
            // Simple approach: Draw a quadratic curve to the current point

            ctx.quadraticCurveTo(w * 0.5, h, w * 0.8, h * 0.2);

            // Fancy Gradient Stroke
            const grad = ctx.createLinearGradient(0, h, w, 0);
            grad.addColorStop(0, '#00ff88');
            grad.addColorStop(1, '#ffffff');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 4;
            ctx.stroke();

            // Rocket Icon Position (Tip of curve)
            // Ideally we calculate exact x,y, but for demo we pin to w*0.8, h*0.2
            // We can rotate it based on slope?

            // Just drawing a circle/dot for now for performance or simple representation
            ctx.beginPath();
            ctx.arc(w * 0.8, h * 0.2, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }

        // Check Crash
        if (currentMult >= crashPoint && crashPoint !== null) {
            handleCrash(crashPoint);
            return;
        }

        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    const startGame = async () => {
        if (betAmount > user.balance) {
            alert("Insufficient Funds");
            return;
        }

        setGameState('PLAYING');
        setWinnings(0);
        setMultiplier(1.00);
        startTimeRef.current = null;

        try {
            // 1. Place Bet on Server
            const res = await fetch(`${API_URL}/api/crash/bet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount: betAmount })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server Error ${res.status}: ${text.substring(0, 50)}...`);
            }

            const data = await res.json();

            if (data.success) {
                setCrashPoint(data.crashPoint);
                // Start Animation
                requestRef.current = requestAnimationFrame(animate);
            } else {
                alert(data.message);
                setGameState('IDLE');
            }
        } catch (e) {
            console.error(e);
            alert("Connection Error: " + e.message + "\nCheck VITE_API_URL in Vercel.");
            setGameState('IDLE');
        }
    };

    const handleCashout = async () => {
        // Stop Game, user wins
        cancelAnimationFrame(requestRef.current);
        const winAmount = betAmount * multiplier;
        setWinnings(winAmount);
        setGameState('CASHED_OUT');

        // Claim Winnings on Server
        try {
            await fetch(`${API_URL}/api/crash/win`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    amount: betAmount,
                    multiplier: multiplier
                })
            });
            // Update local history/balance if needed (ideally context re-fetches)
            // Force reload user?
            window.location.reload(); // Lazy refresh to update balance in navbar
        } catch (e) {
            console.error(e);
        }
    };

    const handleCrash = async (finalValue) => {
        cancelAnimationFrame(requestRef.current);
        setMultiplier(finalValue);
        setGameState('CRASHED');
        setHistory(prev => [finalValue, ...prev].slice(0, 10));

        // Log Loss
        try {
            await fetch(`${API_URL}/api/crash/lose`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    amount: betAmount,
                    crashPoint: finalValue
                })
            });
            window.location.reload(); // Refresh balance
        } catch (e) { }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header / Back */}
            <button onClick={onBack} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                ← Back to Games
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Visual Game Area */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-2xl relative overflow-hidden h-[400px] flex flex-col">
                    {/* Live Stats Overlay */}
                    <div className="absolute top-6 left-6 z-10">
                        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Current Payout</div>
                        <div className={`text-6xl font-black font-mono tracking-tighter drop-shadow-lg ${gameState === 'CRASHED' ? 'text-red-500' : gameState === 'CASHED_OUT' ? 'text-yellow-400' : 'text-white'}`}>
                            {multiplier.toFixed(2)}x
                        </div>
                    </div>

                    {/* Canvas Graph */}
                    <canvas ref={canvasRef} width={600} height={400} className="w-full h-full object-cover opacity-80" />

                    {/* Rocket Asset Absolute */}
                    {/* (Canvas handles simple drawing, but we could overlay a simpler DIV for the rocket if canvas is hard) */}

                    {/* Crash Message */}
                    {gameState === 'CRASHED' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm animate-in fade-in zoom-in">
                            <div className="text-center">
                                <AlertTriangle size={64} className="mx-auto text-red-500 mb-4" />
                                <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">CRASHED</h2>
                                <p className="text-gray-400">@ {multiplier.toFixed(2)}x</p>
                            </div>
                        </div>
                    )}

                    {/* Win Message */}
                    {gameState === 'CASHED_OUT' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm animate-in fade-in zoom-in">
                            <div className="text-center">
                                <Trophy size={64} className="mx-auto text-yellow-400 mb-4" />
                                <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">YOU WON</h2>
                                <p className="text-2xl text-[var(--primary)] font-bold">${winnings.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Rocket className="text-[var(--primary)]" />
                        Crash
                    </h3>

                    <div className="flex-1 space-y-6">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Bet Amount ($)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={e => setBetAmount(Number(e.target.value))}
                                    disabled={gameState === 'PLAYING'}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-lg focus:border-[var(--primary)] focus:outline-none"
                                />
                                <div className="absolute right-2 top-2 flex gap-1">
                                    <button onClick={() => setBetAmount(betAmount * 2)} className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10 text-gray-400">2x</button>
                                    <button onClick={() => setBetAmount(betAmount / 2)} className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10 text-gray-400">1/2</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">History</label>
                            <div className="flex gap-2 flex-wrap">
                                {history.map((h, i) => (
                                    <span key={i} className={`text-xs font-mono px-2 py-1 rounded ${h >= 2.00 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {h.toFixed(2)}x
                                    </span>
                                ))}
                                {history.length === 0 && <span className="text-gray-600 text-xs italic">No recent games</span>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        {gameState === 'PLAYING' ? (
                            <button
                                onClick={handleCashout}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-5 rounded-xl font-black text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                CASHOUT ${(betAmount * multiplier).toFixed(2)}
                            </button>
                        ) : (
                            <button
                                onClick={startGame}
                                disabled={gameState === 'PLAYING'} // Double check
                                className="w-full bg-[var(--primary)] hover:bg-[#00cc6a] text-black py-5 rounded-xl font-black text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Place Bet
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
