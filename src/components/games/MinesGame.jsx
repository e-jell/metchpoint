import React, { useState } from 'react';
import { Bomb, Diamond, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MinesGame = ({ onBack }) => {
    const { user } = useAuth();
    const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, GAME_OVER, CASHED_OUT
    const [betAmount, setBetAmount] = useState(10);
    const [mineCount, setMineCount] = useState(3);
    const [grid, setGrid] = useState(Array(25).fill(null)); // null = hidden, 'safe' = gem, 'boom' = bomb
    const [minesLocations, setMinesLocations] = useState([]); // Only valid after Loss
    const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
    const [processing, setProcessing] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const startGame = async () => {
        if (betAmount > user.balance) {
            alert("Insufficient funds");
            return;
        }

        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/mines/bet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount: betAmount, mineCount })
            });
            const data = await res.json();
            if (data.success) {
                setGameState('PLAYING');
                setGrid(Array(25).fill(null));
                setMinesLocations([]);
                setCurrentMultiplier(1.00);
                // Trigger balance update?
            } else {
                alert(data.message);
            }
        } catch (e) { console.error(e); }
        setProcessing(false);
    };

    const handleTileClick = async (index) => {
        if (gameState !== 'PLAYING' || processing || grid[index] !== null) return;

        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/mines/reveal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, tileIndex: index })
            });
            const data = await res.json();

            if (!data.success) {
                // Game probably invalid?
                return;
            }

            const newGrid = [...grid];
            if (data.status === 'boom') {
                newGrid[index] = 'boom';
                setGameState('GAME_OVER');
                setMinesLocations(data.mines); // Show all bombs
                // Reveal all bombs locally
                // data.mines.forEach(idx => newGrid[idx] = 'boom'); // Optional: show all
            } else {
                newGrid[index] = 'safe';
                setCurrentMultiplier(data.multiplier);
            }
            setGrid(newGrid);

        } catch (e) { console.error(e); }
        setProcessing(false);
    };

    const handleCashout = async () => {
        if (gameState !== 'PLAYING' || processing) return;
        setProcessing(true);
        try {
            const res = await fetch(`${API_URL}/api/mines/cashout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (data.success) {
                setGameState('CASHED_OUT');
                window.location.reload(); // Lazy balance update
            }
        } catch (e) { }
        setProcessing(false);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                ← Back to Games
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Game Grid */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 relative">
                    <div className="grid grid-cols-5 gap-3 aspect-square max-w-[500px] mx-auto">
                        {grid.map((status, i) => {
                            const isRevealed = status !== null;
                            const isBomb = status === 'boom' || (gameState === 'GAME_OVER' && minesLocations.includes(i));

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleTileClick(i)}
                                    disabled={gameState !== 'PLAYING' || isRevealed}
                                    className={`rounded-lg relative transition-all duration-200 flex items-center justify-center transform 
                                        ${isRevealed
                                            ? (isBomb ? 'bg-red-500/20 border-red-500' : 'bg-[var(--primary)]/20 border-[var(--primary)]')
                                            : 'bg-[#202020] hover:bg-[#2a2a2a] border-white/5 active:scale-95'
                                        }
                                        ${gameState === 'PLAYING' && !isRevealed ? 'cursor-pointer' : ''}
                                        border-2
                                    `}
                                >
                                    {isRevealed && !isBomb && (
                                        <Diamond className="text-[var(--primary)] animate-in zoom-in spin-in-12" size={28} />
                                    )}
                                    {isBomb && (
                                        <Bomb className="text-red-500 animate-in zoom-in" size={28} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Overlay Messages */}
                    {gameState === 'GAME_OVER' && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-in fade-in">
                            <div className="bg-[#1a1a1a] p-8 rounded-2xl text-center border border-red-500/30 shadow-2xl">
                                <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2">Busted</h2>
                                <button onClick={() => { setGameState('IDLE'); setGrid(Array(25).fill(null)); }} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded font-bold uppercase transition-colors">
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                    {gameState === 'CASHED_OUT' && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl animate-in fade-in">
                            <div className="bg-[#1a1a1a] p-8 rounded-2xl text-center border border-[var(--primary)]/30 shadow-2xl">
                                <h2 className="text-3xl font-black text-[var(--primary)] uppercase tracking-widest mb-2">You Won</h2>
                                <div className="text-2xl text-white font-bold mb-4">${(betAmount * currentMultiplier).toFixed(2)}</div>
                                <button onClick={() => { setGameState('IDLE'); setGrid(Array(25).fill(null)); }} className="mt-4 px-6 py-2 bg-[var(--primary)] text-black rounded font-bold uppercase transition-colors">
                                    Play Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Bomb className="text-[var(--primary)]" />
                        Mines
                    </h3>

                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Bet Amount</label>
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                disabled={gameState === 'PLAYING'}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white font-mono text-lg focus:border-[var(--primary)] focus:outline-none disabled:opacity-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Mines Amount</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 3, 5, 24].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setMineCount(m)}
                                        disabled={gameState === 'PLAYING'}
                                        className={`py-2 rounded border font-mono text-sm ${mineCount === m ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {gameState === 'PLAYING' && (
                            <div className="bg-white/5 p-4 rounded-xl text-center animate-pulse">
                                <div className="text-gray-400 text-xs uppercase">Current Multiplier</div>
                                <div className="text-3xl font-black text-[var(--primary)]">{currentMultiplier.toFixed(2)}x</div>
                                <div className="text-gray-500 text-xs mt-1">Next Tile: Higher</div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        {gameState === 'PLAYING' ? (
                            <button
                                onClick={handleCashout}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                            >
                                Cashout ${(betAmount * currentMultiplier).toFixed(2)}
                            </button>
                        ) : (
                            <button
                                onClick={startGame}
                                className="w-full bg-[var(--primary)] hover:bg-[#00cc6a] text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,136,0.3)]"
                            >
                                Start Game
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
