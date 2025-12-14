const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { sequelize, User, Bet } = require('./models');
const { getMatches } = require('./simulation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Nodemailer Setup
// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shopboys083@gmail.com',
        pass: 'xusa hclu kjer pytn'
    }
});

// Helper to send email
const sendVerificationEmail = async (email, code, type = 'Verification') => {
    const mailOptions = {
        from: 'shopboys083@gmail.com',
        to: email,
        subject: `BetBlitz: ${type} Code`,
        text: `Your ${type} code is: ${code}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] To: ${email} | Type: ${type}`);
        return true;
    } catch (error) {
        console.error("Email send failed:", error);
        return false;
    }
};

// --- ROUTES ---

// Register
// Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        let user;
        try {
            user = await User.create({
                username,
                email,
                password_hash: hashedPassword,
                verificationCode: code,
                isVerified: false
            });
        } catch (dbError) {
            console.error(dbError);
            return res.status(400).json({ success: false, message: 'Username or Email already taken' });
        }

        // Try to send email, but don't fail if it doesn't work
        try {
            await sendVerificationEmail(email, code, 'Activate Account');
        } catch (emailError) {
            console.error("Email failed to send:", emailError);
            // Continue anyway
        }

        // DEV MODE: Return code so user can verify without email
        res.json({ success: true, message: 'Verification code generated', userId: user.id, debugCode: code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Verify Code
app.post('/api/verify', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.json({ success: true, message: 'Already verified' });

        if (user.verificationCode === code) {
            user.isVerified = true;
            user.verificationCode = null;
            await user.save();
            return res.json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid code' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Forgot Password - Request Code
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Security: Don't reveal if user exists. Just say sent.
            // But for this demo, we'll return generic success
            return res.json({ success: true, message: 'If account exists, code sent.' });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = code;
        await user.save();

        await sendVerificationEmail(email, code, 'Reset Password');

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.verificationCode === code) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password_hash = hashedPassword;
            user.verificationCode = null; // Clear code
            // If they reset password, we can assume they verify ownership of email
            if (!user.isVerified) user.isVerified = true;

            await user.save();
            return res.json({ success: true });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid code' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: 'Email not verified', userId: user.id });
        }

        res.json({ success: true, user: { id: user.id, username: user.username, balance: user.balance } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Matches (Live)
app.get('/api/matches', (req, res) => {
    res.json(getMatches());
});

// Place Bet
app.post('/api/bet', async (req, res) => {
    try {
        const { userId, matchId, amount, odds, details, outcome } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });

        // Deduct balance
        user.balance -= amount;
        await user.save();

        // Create Bet
        const bet = await Bet.create({
            match_id: matchId,
            details,
            outcome,
            odds,
            stake: amount,
            potentialWin: amount * odds,
            UserId: user.id
        });

        res.json({ success: true, balance: user.balance, bet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Bet failed' });
    }
});

// Get User Data (Refresh)
app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [Bet]
        });
        if (!user) return res.status(404).json({ success: false });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                history: user.Bets ? user.Bets.reverse() : []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- CRASH GAME ROUTES ---

// Crash Bet (Start Round)
app.post('/api/crash/bet', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });

        // Deduct balance immediately
        user.balance -= amount;
        await user.save();

        // Generate Crash Point via random distribution
        // 1% instant crash at 1.00x
        // Logic: E = 100 / (random[1..100]) often used, or similar
        // Simple fair-ish logic:
        // Multiplier = 0.99 / (1 - Math.random())
        // BUT we clamp it to be realistic

        const r = Math.random();
        let crashPoint = 1.00;

        // 3% chance of instant crash (house edge)
        if (r > 0.03) {
            // Generates 1.00 to huge numbers
            crashPoint = Math.floor(100 / (1 - r)) / 100;
        }

        // Limit to 2 decimals
        crashPoint = Math.max(1.00, crashPoint);

        res.json({ success: true, balance: user.balance, crashPoint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Crash Win (Cashout Success) -- FOR DEMO ONLY (See Note)
// NOTE: In a real app, Client sends "I want to cashout", Server checks if current game time < crash time.
// Since we sent crashPoint to client (for smooth animation in this demo), we just trust the client to say "I won".
// To prevent total cheating, we can just re-verify the math or just accept it for this Portfolio Project.
app.post('/api/crash/win', async (req, res) => {
    try {
        const { userId, amount, multiplier } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false });

        const winnings = amount * multiplier;
        user.balance += winnings;
        await user.save();

        // Log the win in history
        await Bet.create({
            match_id: 'crash_game',
            details: `Crash @ ${multiplier.toFixed(2)}x`,
            outcome: 'won',
            odds: multiplier,
            stake: amount,
            potentialWin: winnings,
            UserId: user.id
        });

        res.json({ success: true, balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Crash Loss (Just for history logging)
app.post('/api/crash/lose', async (req, res) => {
    try {
        const { userId, amount, crashPoint } = req.body;

        // Just log it
        await Bet.create({
            match_id: 'crash_game',
            details: `Crashed @ ${crashPoint.toFixed(2)}x`,
            outcome: 'lost',
            odds: 0,
            stake: amount,
            potentialWin: 0,
            UserId: userId
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false });
    }



});

// --- MINES GAME ROUTES ---
const activeMinesGames = new Map(); // userId -> { mines: [indices], revealed: [indices], bet: amount, active: true }

app.post('/api/mines/bet', async (req, res) => {
    try {
        const { userId, amount, mineCount } = req.body; // mineCount usually 1-24
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false });
        if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });

        user.balance -= amount;
        await user.save();

        // Generate Mines
        const mines = [];
        while (mines.length < mineCount) {
            const r = Math.floor(Math.random() * 25);
            if (!mines.includes(r)) mines.push(r);
        }

        activeMinesGames.set(userId, {
            mines,
            revealed: [],
            bet: amount,
            mineCount,
            active: true
        });

        res.json({ success: true, balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

app.post('/api/mines/reveal', async (req, res) => {
    try {
        const { userId, tileIndex } = req.body;
        const game = activeMinesGames.get(userId);

        if (!game || !game.active) return res.status(400).json({ success: false, message: 'No active game' });
        if (game.revealed.includes(tileIndex)) return res.status(400).json({ success: false, message: 'Already revealed' });

        // Check Bomb
        if (game.mines.includes(tileIndex)) {
            // BOOM
            game.active = false;
            activeMinesGames.delete(userId);

            // Log Loss
            await Bet.create({
                match_id: 'mines_game',
                details: `Mines (Boom)`,
                outcome: 'lost',
                odds: 0,
                stake: game.bet,
                potentialWin: 0,
                UserId: userId
            });

            return res.json({ success: true, status: 'boom', mines: game.mines });
        }

        // Safe
        game.revealed.push(tileIndex);

        // Calculate Multiplier
        // Classic formula: 0.99 * (25C(mines) / (25-revealed)C(mines)) ... simplified:
        // Or roughly: Current Multiplier based on odds of picking safe
        // Simply: Payout goes up as (25 - mines) / (25 - mines - revealed)
        // Let's use a compounding multiplier 

        const totalTiles = 25;
        const safeTiles = totalTiles - game.mineCount;
        const revealedCount = game.revealed.length;

        // Probability of hitting safe was: (Safe - (revealed-1)) / (Total - (revealed-1))
        // We invert for Multiplier
        // This is complex to do perfectly, let's use a standard lookup or approximation?
        // Approx: 
        let multiplier = 1.0;
        for (let i = 0; i < revealedCount; i++) {
            // For each step
            const remainingSafe = safeTiles - i;
            const remainingTotal = totalTiles - i;
            const odd = remainingTotal / remainingSafe;
            multiplier *= odd;
        }
        multiplier = multiplier * 0.99; // House edge

        // Round
        // multiplier = Math.floor(multiplier * 100) / 100; 

        res.json({ success: true, status: 'safe', multiplier, tileIndex });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

app.post('/api/mines/cashout', async (req, res) => {
    try {
        const { userId } = req.body;
        const game = activeMinesGames.get(userId);

        if (!game || !game.active) return res.status(400).json({ success: false });

        // Calculate Final Multiplier same as above logic
        const totalTiles = 25;
        const safeTiles = totalTiles - game.mineCount;
        const revealedCount = game.revealed.length;
        let multiplier = 1.0;
        for (let i = 0; i < revealedCount; i++) {
            const remainingSafe = safeTiles - i;
            const remainingTotal = totalTiles - i;
            const odd = remainingTotal / remainingSafe;
            multiplier *= odd;
        }
        multiplier = multiplier * 0.99;

        const winnings = game.bet * multiplier;
        const user = await User.findByPk(userId);
        user.balance += winnings;
        await user.save();

        activeMinesGames.delete(userId);

        // Log Win
        await Bet.create({
            match_id: 'mines_game',
            details: `Mines Cashout`,
            outcome: 'won',
            odds: multiplier,
            stake: game.bet,
            potentialWin: winnings,
            UserId: userId
        });

        res.json({ success: true, balance: user.balance, winnings });

    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- HILO GAME ROUTES ---
const activeHiloGames = new Map(); // userId -> { currentCard: {rank, suit}, bet: amount, rounds: 0, multiplier: 1.0 }

// Helper for Deck
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J, 12=Q, 13=K, 14=A
const SUITS = ['H', 'D', 'C', 'S'];
const drawCard = () => {
    const r = RANKS[Math.floor(Math.random() * RANKS.length)];
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    return { rank: r, suit: s };
};

app.post('/api/hilo/start', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false });
        if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });

        user.balance -= amount;
        await user.save();

        const card = drawCard();
        activeHiloGames.set(userId, {
            currentCard: card,
            bet: amount,
            rounds: 0,
            multiplier: 1.00,
            active: true
        });

        res.json({ success: true, balance: user.balance, card });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/hilo/next', async (req, res) => {
    try {
        const { userId, prediction } = req.body; // 'higher', 'lower', 'skip'(if we had skip)
        const game = activeHiloGames.get(userId);
        if (!game || !game.active) return res.status(400).json({ success: false });

        const oldCard = game.currentCard;
        // Draw new card (simple independent draw, not deck depletion for infinite play usually)
        let newCard = drawCard();
        // Prevent exact tie for simplicity? Or tie = push? Or tie = lose?
        // Standard Hilo: Tie usually pushes or loses. Let's say Tie = PUSH (Keep playing, same multiplier).
        // To make it fun, let's just redraw if same rank to avoid confusion for now.
        while (newCard.rank === oldCard.rank) {
            newCard = drawCard();
        }

        let won = false;
        if (prediction === 'higher' && newCard.rank > oldCard.rank) won = true;
        if (prediction === 'lower' && newCard.rank < oldCard.rank) won = true;

        if (won) {
            // Calculate Multiplier increase
            // Base probability
            // If oldCard is 2, Higher is likely (low payout), Lower is impossible (or very high payout)
            // Simplified Multiplier Logic: 1.2x per correct guess hardcoded for demo, or:
            // Dynamic: 1 / Probability

            const totalRanks = 13;
            let winningOptions = 0;
            if (prediction === 'higher') winningOptions = 14 - oldCard.rank; // e.g. if 2(rank2), 12 cards higher.
            if (prediction === 'lower') winningOptions = oldCard.rank - 2; // e.g. if 14(A), 12 cards lower.

            // Fix edge case if 2 or A (making impossible bets should be disabled on frontend)
            if (winningOptions <= 0) winningOptions = 1; // Should not trigger

            let probability = winningOptions / 13;
            // Add house edge (5%)
            let roundMult = (0.95 / probability);

            game.multiplier *= roundMult;
            game.currentCard = newCard;
            game.rounds++;

            res.json({ success: true, status: 'won', card: newCard, multiplier: game.multiplier });
        } else {
            // Lost
            game.active = false;
            activeHiloGames.delete(userId);

            await Bet.create({
                match_id: 'hilo_game',
                details: `Hilo Loss (High Score: ${game.rounds})`,
                outcome: 'lost', odd: 0, stake: game.bet, potentialWin: 0, UserId: userId
            });

            res.json({ success: true, status: 'lost', card: newCard });
        }

    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/hilo/cashout', async (req, res) => {
    try {
        const { userId } = req.body;
        const game = activeHiloGames.get(userId);
        if (!game || !game.active) return res.status(400).json({ success: false });

        if (game.rounds === 0) {
            // Instant cashout without playing? Usually allowed but just 1.0x? 
            // Let's allow it if multiplier > 1
        }

        const winnings = game.bet * game.multiplier;
        const user = await User.findByPk(userId);
        user.balance += winnings;
        await user.save();

        activeHiloGames.delete(userId);

        await Bet.create({
            match_id: 'hilo_game',
            details: `Hilo Cashout`,
            outcome: 'won', odds: game.multiplier, stake: game.bet, potentialWin: winnings, UserId: userId
        });

        res.json({ success: true, balance: user.balance, winnings });

    } catch (e) { res.status(500).json({ success: false }); }
});

// --- PLINKO GAME ROUTES ---

app.post('/api/plinko/bet', async (req, res) => {
    try {
        const { userId, amount, rows = 16, risk = 'medium' } = req.body;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false });
        if (user.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });

        user.balance -= amount;
        await user.save();

        // PLINKO LOGIC
        // We simulate the path: "Left" or "Right" at each peg row.
        // Total rows determine spread.
        // Standard Plinko: Result is approximately Normal Distribution (Binomial).
        // Buckets: 0 to rows.
        // We generate a "path" array of 0s (L) and 1s (R).
        // The bucket index = sum(path).

        // Multipliers depend on Risk. 
        // Example for 16 rows, Medium risk:
        // Middle buckets [7,8,9] have < 1x.
        // Edges have > 10x or 100x.

        // Let's use a simplified logical model for multipliers:
        // Just defining a hardcoded multiplier map for demo simplicity or calculating it?
        // Let's generate a random path first.

        const path = [];
        for (let i = 0; i < rows; i++) {
            path.push(Math.random() > 0.5 ? 1 : 0);
        }

        const bucketIndex = path.reduce((a, b) => a + b, 0); // 0 to 16

        // Determine Multiplier based on bucket distance from center
        // Center for 16 rows is 8.
        const distance = Math.abs(bucketIndex - (rows / 2));

        // Exponential payout based on distance
        // e.g. 0.5 * (risk_factor ^ distance)
        // Tune this for 99% RTP theoretically? Hard to do on fly.
        // Let's use a "Fun" distribution.

        let multiplier = 0.5; // Center loss
        if (distance >= 3) multiplier = 1.2;
        if (distance >= 5) multiplier = 3.5;
        if (distance >= 7) multiplier = 15; // Near edge
        if (distance === 8) multiplier = 110; // Edge (0 or 16) matches 16 rows usually ~1000x but let's be conservative

        const winnings = amount * multiplier;
        if (winnings > 0) {
            user.balance += winnings;
            await user.save();
        }

        await Bet.create({
            match_id: 'plinko_game',
            details: `Plinko (Bucket ${bucketIndex})`,
            outcome: winnings > amount ? 'won' : 'lost',
            odds: multiplier,
            stake: amount,
            potentialWin: winnings,
            UserId: userId
        });

        res.json({ success: true, balance: user.balance, path, bucketIndex, multiplier, winnings });

    } catch (e) { res.status(500).json({ success: false }); }
});

// Start Server
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
