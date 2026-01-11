const { User, Seller } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../utils/emailService');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Controller to handle authentication for MySQL
 */
const authController = {
    // Login for Users and Sellers
    login: async (req, res) => {
        const { email, password } = req.body;

        try {
            // Logic from original controller: try email then phone
            let account = await User.findOne({ where: { email } });
            let role = 'user';

            if (!account) {
                account = await Seller.findOne({ where: { email } });
                role = 'seller';
            }

            if (!account) return res.status(401).json({ error: 'user_not_found' });

            const isMatch = await bcrypt.compare(password, account.password);
            if (!isMatch) return res.status(401).json({ error: 'wrong_password' });

            const token = jwt.sign(
                { id: account.id, role: account.role || role },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                token,
                userId: account.id,
                role: account.role || role,
                firstName: account.firstName || account.name,
                lastName: account.lastName || '',
                email: account.email
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'server_error' });
        }
    },

    // Register a new user
    registerUser: async (req, res) => {
        const { firstName, lastName, email, password } = req.body;

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ error: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword
            });

            res.status(201).json({ message: 'User registered successfully', userId: user.id });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    // Logout
    logout: async (req, res) => {
        try {
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ message: 'server_error' });
        }
    },

    // Request password reset
    requestPasswordReset: async (req, res) => {
        const { email } = req.body;
        try {
            let user = await User.findOne({ where: { email } });
            if (!user) {
                user = await Seller.findOne({ where: { email } });
            }

            if (!user) {
                return res.json({ message: "reset_email_sent_if_exists" });
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            user.passwordResetToken = hashedToken;
            user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
            await user.save();

            await sendPasswordResetEmail(email, resetToken);
            res.json({ message: "reset_email_sent" });
        } catch (err) {
            console.error("Password reset request error:", err);
            res.status(500).json({ message: "error_sending_reset_email" });
        }
    },

    // Reset password with token
    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

            let user = await User.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: new Date() }
                }
            });

            if (!user) {
                user = await Seller.findOne({
                    where: {
                        passwordResetToken: hashedToken,
                        passwordResetExpires: { [Op.gt]: new Date() }
                    }
                });
            }

            if (!user) {
                return res.status(400).json({ message: "invalid_or_expired_token" });
            }

            user.password = await bcrypt.hash(password, 10);
            user.passwordResetToken = null;
            user.passwordResetExpires = null;
            await user.save();

            res.json({ message: "password_reset_success" });
        } catch (err) {
            console.error("Password reset error:", err);
            res.status(500).json({ message: "error_resetting_password" });
        }
    },

    // Update last online
    updateLastOnline: async (req, res) => {
        const { userId, role } = req.body;
        try {
            let account;
            if (role === 'seller') {
                account = await Seller.findByPk(userId);
            } else {
                account = await User.findByPk(userId);
            }

            if (account) {
                account.lastOnline = new Date();
                await account.save();
                res.json({ message: "Last online updated" });
            } else {
                res.status(404).json({ message: "user_not_found" });
            }
        } catch (err) {
            console.error("Error updating last online:", err);
            res.status(500).json({ message: "server_error" });
        }
    }
};

module.exports = authController;
