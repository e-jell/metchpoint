import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export const Captcha = ({ onVerify }) => {
    const [code, setCode] = useState('');
    const [userInput, setUserInput] = useState('');
    const canvasRef = useRef(null);

    const generateCaptcha = () => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let newCode = '';
        for (let i = 0; i < 6; i++) {
            newCode += chars[Math.floor(Math.random() * chars.length)];
        }
        setCode(newCode);
        setUserInput('');
        onVerify(false); // Reset verification on new captcha
        drawCaptcha(newCode);
    };

    const drawCaptcha = (text) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Noise (Lines)
        for (let i = 0; i < 7; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        // Noise (Dots)
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Text
        ctx.font = 'bold 24px monospace';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const xPositions = [20, 50, 80, 110, 140, 170];
        for (let i = 0; i < text.length; i++) {
            ctx.save();
            // Random tilt
            const angle = (Math.random() - 0.5) * 0.5;
            ctx.translate(xPositions[i], canvas.height / 2);
            ctx.rotate(angle);
            ctx.fillStyle = '#00ff88';
            ctx.fillText(text[i], 0, 0);
            ctx.restore();
        }
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setUserInput(val);
        if (val === code) {
            onVerify(true);
        } else {
            onVerify(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <canvas
                    ref={canvasRef}
                    width={200}
                    height={50}
                    className="rounded-md border border-white/10 cursor-pointer"
                    onClick={generateCaptcha}
                    title="Click to refresh"
                />
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <RefreshCw size={20} />
                </button>
            </div>
            <input
                type="text"
                value={userInput}
                onChange={handleChange}
                placeholder="Enter Code"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:border-[var(--primary)] focus:outline-none font-mono text-center tracking-widest uppercase"
            />
        </div>
    );
};
