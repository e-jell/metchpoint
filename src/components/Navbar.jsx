import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User } from 'lucide-react';
import { cn } from '../utils/cn';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-3 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                    Match<span className="text-[var(--primary)]">Point</span>
                </span>
            </div>

            {/* Right: User Info */}
            {user ? (
                <div className="flex items-center gap-4">
                    {/* Balance */}
                    <div className="hidden sm:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-md border border-[var(--primary)]/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                        <span className="text-[var(--primary)] font-bold text-sm">
                            ${user.balance.toFixed(2)}
                        </span>
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center">
                                <User size={16} className="text-gray-300" />
                            </div>
                            <div className="hidden md:block text-xs text-right">
                                <div className="text-white font-bold max-w-[100px] truncate">{user.username}</div>
                                <div className="text-[var(--primary)] text-[10px] uppercase tracking-wider">Verified</div>
                            </div>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-white transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-400">
                    Guest
                </div>
            )}
        </nav>
    );
};
