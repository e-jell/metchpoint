import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');
        const res = await forgotPassword(email);
        if (res.success) {
            setStep(2);
            setMessage('Reset code sent to your email.');
        } else {
            setError(res.message || 'Failed to send code');
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        const res = await resetPassword(email, code, newPassword);
        if (res.success) {
            setMessage('Password reset successfully! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(res.message || 'Reset failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] relative overflow-hidden">
            <div className="glass-panel w-full max-w-md p-8 rounded-2xl relative z-10 border-t border-white/10">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--primary-glow)] mb-4">
                        <KeyRound size={24} className="text-[var(--primary)]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-xs text-center font-bold">
                        {message}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestCode} className="space-y-4">
                        <p className="text-[var(--text-muted)] text-sm text-center mb-4">
                            Enter your registered email address and we'll send you a focused code to reset your access.
                        </p>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[var(--primary)] focus:outline-none"
                                placeholder="Enter email address"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                            Send Code <ArrowRight size={18} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs uppercase text-gray-500 font-bold ml-1">Verification Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white font-mono text-center tracking-widest text-lg focus:border-[var(--primary)] focus:outline-none"
                                placeholder="000000"
                                maxLength="6"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs uppercase text-gray-500 font-bold ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[var(--primary)] focus:outline-none"
                                    placeholder="Set new password"
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                            Update Password <CheckCircle size={18} />
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className="text-gray-500 hover:text-white transition-colors">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};
