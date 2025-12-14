import React, { useState, useRef, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PlinkoGame = ({ onBack }) => {
    const { user } = useAuth();
    const [betAmount, setBetAmount] = useState(10);
    const [dropping, setDropping] = useState(false);
    const [lastMultiplier, setLastMultiplier] = useState(null);
    const canvasRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Physics/Animation Constants
    const ROWS = 16;
    const PEG_GAP = 30; // Horizontal gap
    const START_Y = 50;

    // Draw Static Board
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        // Draw Pegs (Pyramid)
        ctx.fillStyle = '#ffffff';
        for (let row = 0; row <= ROWS; row++) {
            const pegsInRow = row + 3; // Start with 3 pegs at top? Or typically Row+1? 
            // Standard Plinko: Row 0 has 3 pegs? Or Row 0 has 1 gap?
            // Actually: Triangle. Row 0 has 1 gap -> 2 pegs? No, Pyramid.
            // Let's say top row (Row 0) has 3 pegs.
            // Canvas Center X
            const centerX = w / 2;
            const rowY = START_Y + (row * 30); // 30px vert gap

            for (let i = 0; i < pegsInRow; i++) {
                // Calculate X offset from center
                // total width of row = (pegsInRow - 1) * GAP
                const rowWidth = (pegsInRow - 1) * PEG_GAP;
                const startX = centerX - (rowWidth / 2);
                const pegX = startX + (i * PEG_GAP);

                ctx.beginPath();
                ctx.arc(pegX, rowY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw Multipliers at bottom
        // Buckets = (ROWS + 3) - 1 slots? 
        // If row 16 has 19 pegs, it has 18 slots (buckets).
        // Wait, standard Plinko usually 8 to 16 rows.
        // Let's stick effectively to visual approximation.

    }, []);

    const dropBall = async () => {
        if (betAmount > user.balance) return alert("Insufficient.Funds");
        setDropping(true);
        setLastMultiplier(null);

        try {
            const res = await fetch(`${API_URL}/api/plinko/bet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount: betAmount, rows: 16 })
            });
            const data = await res.json();

            if (data.success) {
                animateBall(data.path, data.multiplier, data.winnings);
            } else {
                setDropping(false);
            }
        } catch (e) { setDropping(false); }
    };

    const animateBall = (path, finalMult, winnings) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;

        let currentRow = 0;
        let x = w / 2; // Start center (between top pegs)
        let y = START_Y;

        // A simple frame loop
        // We move Y down constants speed.
        // We move X towards the next target peg gap based on Path[currentRow].
        // Path[i] = 0 (Left), 1 (Right).

        // Actually, we are between pegs.
        // Row 0 gap center is X.
        // If Path[0] is L -> we move to Row 1 gap center (X - PEG_GAP/2).
        // If Path[0] is R -> we move to Row 1 gap center (X + PEG_GAP/2).

        let pathIndex = 0;

        const interval = setInterval(() => {
            // Restore static background (inefficient redraw but fine for demo)
            // Ideally use 2 layers.
            // For now just clear rect of ball pos?
            // Just hacking it: draw trace?

            // Move
            if (currentRow < ROWS) {
                y += 5; // Gravity speed

                // Target X for this row's bottom
                // We interpolate X
                const dir = path[pathIndex]; // 0 or 1
                const directionFactor = dir === 0 ? -0.5 : 0.5; // -0.5 gap or +0.5 gap
                // We want to drift x by (PEG_GAP * direction) over the vertical distance of one row (30px)

                x += (directionFactor * PEG_GAP) / (30 / 5); // Drift per step

                // Check if we hit next row Y
                if (y % 30 === 0) { // Approx
                    currentRow++;
                    pathIndex++;
                }

                // Draw Ball
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = '#00ff88';
                ctx.fill();

            } else {
                // Done
                clearInterval(interval);
                setDropping(false);
                setLastMultiplier(finalMult);
                // Trigger reload for balance
                if (winnings > 0) window.location.reload();
            }
        }, 16);
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto flex gap-8">
            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl relative overflow-hidden flex justify-center pt-8">
                <canvas ref={canvasRef} width={600} height={600} />

                {lastMultiplier && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <div className="text-6xl font-black text-[var(--primary)] animate-in zoom-in spin-in-12">
                            {lastMultiplier}x
                        </div>
                    </div>
                )}
            </div>

            <div className="w-80 bg-[#151515] border border-white/5 rounded-2xl p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-6">Plinko</h3>

                <div className="flex-1">
                    <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Bet Amount</label>
                    <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        disabled={dropping}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white font-mono text-lg focus:border-[var(--primary)] focus:outline-none"
                    />
                </div>

                <button
                    onClick={dropBall}
                    disabled={dropping}
                    className="w-full bg-[var(--primary)] hover:bg-[#00cc6a] text-black py-4 rounded-xl font-black text-lg uppercase tracking-widest mt-8"
                >
                    {dropping ? 'Dropping...' : 'Drop Green'}
                </button>
            </div>
        </div>
    );
};
