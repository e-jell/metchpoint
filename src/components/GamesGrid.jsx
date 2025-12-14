import React from 'react';
import { Rocket, Diamond, Bomb, Crown, ChevronUp, ChevronDown, Dices } from 'lucide-react';

export const GamesGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">

            {/* 1. CRASH */}
            <div className="group relative bg-black/40 border border-white/5 rounded-xl p-6 hover:border-[var(--primary)] transition-all duration-300 overflow-hidden cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg tracking-wider">CRASH</h3>
                    <div className="bg-white/5 p-1 rounded">
                        <Rocket size={16} className="text-[var(--primary)]" />
                    </div>
                </div>

                {/* Graph Visualization */}
                <div className="h-32 w-full relative bg-white/5 rounded-lg mb-4 overflow-hidden flex items-end p-2">
                    <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none">
                        <path
                            d="M0,128 Q150,120 250,20"
                            fill="none"
                            stroke="#00ff88"
                            strokeWidth="3"
                            className="drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]">
                            2.84x
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Current Multiplier</div>
                    </div>
                    {/* Rocket Icon at end of path */}
                    <div className="absolute top-[20px] right-[50px] text-[var(--primary)] drop-shadow-[0_0_10px_var(--primary)]">
                        <Rocket size={20} className="rotate-45" />
                    </div>
                </div>

                <div className="w-full bg-[var(--primary)] text-black font-bold py-2 rounded text-center uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-all">
                    Play Crash
                </div>
            </div>

            {/* 2. PLINKO */}
            <div
                onClick={() => onSelectGame && onSelectGame('plinko')}
                className="group relative bg-black/40 border border-white/5 rounded-xl p-6 hover:border-[var(--primary)] transition-all duration-300 overflow-hidden cursor-pointer"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg tracking-wider">PLINKO</h3>
                    <div className="bg-white/5 p-1 rounded">
                        <div className="grid grid-cols-2 gap-0.5">
                            <span className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                            <span className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                            <span className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Plinko Pyramid */}
                <div className="h-32 w-full relative bg-white/5 rounded-lg mb-4 flex flex-col items-center justify-center p-2 gap-1.5">
                    {/* Minimalist Pyramid Representation */}
                    <div className="flex gap-2"><span className="w-1.5 h-1.5 bg-gray-600 rounded-full" /></div>
                    <div className="flex gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" />
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                    </div>
                    {/* Ball */}
                    <span className="absolute top-4 w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce shadow-[0_0_10px_var(--primary)]" />

                    {/* Multiplier Row Minimal */}
                    <div className="flex gap-1 mt-2 w-full justify-center opacity-50">
                        <div className="h-4 w-4 bg-red-500/20 rounded-sm"></div>
                        <div className="h-4 w-4 bg-yellow-500/20 rounded-sm"></div>
                        <div className="h-4 w-4 bg-green-500/20 rounded-sm"></div>
                        <div className="h-4 w-4 bg-yellow-500/20 rounded-sm"></div>
                        <div className="h-4 w-4 bg-red-500/20 rounded-sm"></div>
                    </div>
                </div>

                <div className="w-full bg-white/5 text-gray-400 font-bold py-2 rounded text-center uppercase tracking-widest text-xs group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
                    Drop Ball
                </div>
            </div>

            {/* 3. DICE */}
            <div
                onClick={() => onSelectGame && onSelectGame('dice')}
                className="group relative bg-black/40 border border-white/5 rounded-xl p-6 hover:border-[var(--primary)] transition-all duration-300 overflow-hidden cursor-pointer"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg tracking-wider">DICE</h3>
                    <div className="bg-white/5 p-1 rounded">
                        <Dices size={16} className="text-[var(--primary)]" />
                    </div>
                </div>

                <div className="h-32 w-full relative bg-white/5 rounded-lg mb-4 flex flex-col items-center justify-center p-4">
                    <div className="w-full h-2 bg-gray-700 rounded-full relative mb-6">
                        <div className="absolute left-0 top-0 h-full w-1/2 bg-[var(--primary)] rounded-full shadow-[0_0_10px_var(--primary)]"></div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[var(--primary)] shadow-lg cursor-pointer"></div>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-black text-[10px] font-bold px-1.5 rounded">49.5%</div>
                    </div>

                    <div className="text-center">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">Under</div>
                        <div className="text-2xl font-bold text-[var(--primary)]">50.00</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">To Win</div>
                    </div>
                </div>

                <div className="w-full bg-white/5 text-gray-400 font-bold py-2 rounded text-center uppercase tracking-widest text-xs group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
                    Roll
                </div>
            </div>

            {/* 4. MINES */}
            <div className="group relative bg-black/40 border border-white/5 rounded-xl p-6 hover:border-[var(--primary)] transition-all duration-300 overflow-hidden cursor-pointer">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg tracking-wider">MINES</h3>
                    <div className="bg-white/5 p-1 rounded">
                        <Bomb size={16} className="text-[var(--primary)]" />
                    </div>
                </div>

                <div className="h-32 w-full relative bg-white/5 rounded-lg mb-4 flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-1.5 p-2">
                        {[...Array(25)].map((_, i) => {
                            // Mock revealed state style
                            if (i === 6 || i === 8 || i === 12) return (
                                <div key={i} className="w-4 h-4 rounded bg-[var(--primary)]/20 border border-[var(--primary)] flex items-center justify-center shadow-[0_0_5px_rgba(0,255,136,0.3)]">
                                    <Diamond size={8} className="text-[var(--primary)]" />
                                </div>
                            );
                            if (i === 13) return (
                                <div key={i} className="w-4 h-4 rounded bg-red-500/20 border border-red-500 flex items-center justify-center">
                                    <Bomb size={8} className="text-red-500" />
                                </div>
                            );

                            return <div key={i} className="w-4 h-4 rounded bg-[#2a2a2a] border border-white/5 hover:bg-white/10 transition-colors" />
                        })}
                    </div>
                </div>

                <div className="w-full bg-white/5 text-gray-400 font-bold py-2 rounded text-center uppercase tracking-widest text-xs group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
                    Bet
                </div>
            </div>


            {/* 5. HILO */}
            <div
                onClick={() => onSelectGame && onSelectGame('hilo')}
                className="group relative bg-black/40 border border-white/5 rounded-xl p-6 hover:border-[var(--primary)] transition-all duration-300 overflow-hidden cursor-pointer md:col-span-2 lg:col-span-1"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg tracking-wider">HILO</h3>
                    <div className="bg-white/5 p-1 rounded">
                        <Crown size={16} className="text-[var(--primary)]" />
                    </div>
                </div>

                <div className="h-32 w-full relative bg-white/5 rounded-lg mb-4 flex flex-col items-center justify-center gap-2">
                    {/* Card */}
                    <div className="w-16 h-20 bg-black border-2 border-[var(--primary)] rounded-lg flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)] relative">
                        <div className="absolute top-1 left-1 text-[var(--primary)] text-[10px] font-bold">K</div>
                        <Crown size={24} className="text-[var(--primary)]" />
                        <div className="absolute bottom-1 right-1 text-[var(--primary)] text-[10px] font-bold rotate-180">K</div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 w-full px-4">
                        <div className="flex-1 bg-[var(--primary)] h-6 rounded flex items-center justify-center text-black shadow-[0_0_10px_rgba(0,255,136,0.4)]">
                            <ChevronUp size={14} strokeWidth={4} />
                        </div>
                        <div className="flex-1 bg-gray-700 h-6 rounded flex items-center justify-center text-gray-400">
                            <ChevronDown size={14} strokeWidth={4} />
                        </div>
                    </div>
                </div>

                <div className="w-full bg-white/5 text-gray-400 font-bold py-2 rounded text-center uppercase tracking-widest text-xs group-hover:bg-[var(--primary)] group-hover:text-black transition-all">
                    Deal
                </div>
            </div>

        </div>
    );
};
