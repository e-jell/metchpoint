import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, TrendingUp, ShieldCheck, Lock, User } from 'lucide-react';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (username.trim()) {
            const result = await login(username, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md p-8 glass-panel rounded-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        Match<span className="text-[var(--primary)]">Point</span>
                    </h1>
                    <p className="text-gray-400">Next Gen Sports Prediction</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your alias..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--primary)] transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--primary)] transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary text-lg mt-2"
                    >
                        Start Playing
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    New here? <Link to="/signup" className="text-[var(--primary)] hover:underline">Create an account</Link>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 text-center border-t border-white/5 pt-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-2 rounded-full bg-white/5 text-[var(--primary)]">
                            <Trophy size={16} />
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Live Sports</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-2 rounded-full bg-white/5 text-blue-400">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Real Odds</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-2 rounded-full bg-white/5 text-purple-400">
                            <ShieldCheck size={16} />
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Secure</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
