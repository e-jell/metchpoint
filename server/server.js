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


// Start Server
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
