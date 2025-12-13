import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Load - Check for stored UserID and Refresh Data
    useEffect(() => {
        const loadUser = async () => {
            const storedId = localStorage.getItem('user_id');
            if (storedId) {
                try {
                    const res = await fetch(`${API_URL}/api/user/${storedId}`);
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        localStorage.removeItem('user_id');
                    }
                } catch (e) {
                    console.error("Failed to fetch user", e);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user_id', data.user.id);
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (data.success) {
                // Return userId for verification step
                return { success: true, userId: data.userId };
            } else {
                return { success: false, message: data.message };
            }
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    };

    const verify = async (userId, code) => {
        try {
            const res = await fetch(`${API_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code })
            });
            const data = await res.json();
            return data;
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const res = await fetch(`${API_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    }

    const resetPassword = async (email, code, newPassword) => {
        try {
            const res = await fetch(`${API_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    }

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_id');
    };

    // Updated updateBalance to actually place a bet via API
    const placeBet = async (matchId, amount, odds, details, outcome) => {
        if (!user) return;

        try {
            const res = await fetch(`${API_URL}/api/bet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    matchId,
                    amount,
                    odds,
                    details,
                    outcome
                })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh user state with new balance and history
                setUser(prev => ({
                    ...prev,
                    balance: data.balance,
                    history: [data.bet, ...(prev.history || [])]
                }));
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verify, forgotPassword, resetPassword, logout, placeBet, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
