const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    balance: { type: DataTypes.FLOAT, defaultValue: 1000.0 },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    verificationCode: { type: DataTypes.STRING }
});

const Bet = sequelize.define('Bet', {
    match_id: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.STRING, allowNull: false },
    outcome: { type: DataTypes.STRING, allowNull: false }, // 'home', 'away', 'draw'
    odds: { type: DataTypes.FLOAT, allowNull: false },
    stake: { type: DataTypes.FLOAT, allowNull: false },
    potentialWin: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'OPEN' }, // OPEN, WON, LOST
});

// Relations
User.hasMany(Bet);
Bet.belongsTo(User);

module.exports = { sequelize, User, Bet };
