import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerificationPage = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const userId = location.state?.userId;

    const { verify } = useAuth();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError("Session lost. Please Register again.");
            return;
        }

        const result = await verify(userId, code);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.message || 'Invalid Code');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,136,0.05),transparent_70%)]" />
            </div>

            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border-t border-white/10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-glow)] mb-4">
                        <Mail size={32} className="text-[var(--primary)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Verify Email</h1>
                    <p className="text-[var(--text-muted)] text-sm">
                        We've sent a 6-digit code to your terminal/email. <br />Enter it below to activate your account.
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                maxLength="6"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-white focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder:tracking-normal placeholder:text-base placeholder:text-gray-600"
                                placeholder="000000"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            Verify Account <ArrowRight size={18} />
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4 animate-bounce">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Verified!</h2>
                        <p className="text-gray-400">Redirecting to login...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
