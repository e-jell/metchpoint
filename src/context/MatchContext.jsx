import React, { createContext, useContext, useState, useEffect } from 'react';

const MatchContext = createContext();

export const useMatches = () => useContext(MatchContext);

export const MatchProvider = ({ children }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/api/matches`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setMatches(data);
                }
            } catch (e) {
                console.error("Match Fetch Error", e);
            }
        };

        // Initial Fetch
        fetchMatches();

        // Poll
        const interval = setInterval(fetchMatches, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <MatchContext.Provider value={{ matches }}>
            {children}
        </MatchContext.Provider>
    );
};
