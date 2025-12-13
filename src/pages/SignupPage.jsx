import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Captcha } from '../components/Captcha';
import { UserPlus, Lock, User } from 'lucide-react';

export const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
    const [error, setError] = useState('');

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isCaptchaVerified) {
            setError('Please verify the CAPTCHA');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        const result = await register(formData.username, formData.email, formData.password);
        if (result.success) {
            navigate('/verify', { state: { userId: result.userId } });
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md p-8 glass-panel rounded-2xl animate-fade-in relative z-10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-400 text-sm">Join the next gen betting platform</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs uppercase text-gray-500 font-bold ml-1">Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter your email"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[var(--primary)] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase text-gray-500 font-bold ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Choose username"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[var(--primary)] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase text-gray-500 font-bold ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Create password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[var(--primary)] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase text-gray-500 font-bold ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-[var(--primary)] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="text-xs uppercase text-gray-500 font-bold ml-1 mb-2 block">Security Check</label>
                        <Captcha onVerify={setIsCaptchaVerified} />
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
                    >
                        <UserPlus size={18} />
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-[var(--primary)] hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    );
};
