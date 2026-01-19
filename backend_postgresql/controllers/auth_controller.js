const { User, UserStats, UserAuth } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { Op } = require('sequelize');
require('dotenv').config({ path: './backend_postgresql/.env' });


const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Controller to handle authentication for MySQL
 */
const authController = {
    // Login for Users and Sellers
    login: async (req, res) => {
        const { email, password } = req.body;
        console.log("authController", req.body);
        try {
            // Logic from original controller: try email then phone
            const account = await User.findOne({
                where: { email },
                include: [{ model: UserStats, as: 'stats' }]
            });
            if (!account) {
                return res.status(401).json({ message: 'user_not_found' });
            }
            const isMatch = await bcrypt.compare(password, account.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'wrong_password' });
            }

            const token = jwt.sign(
                { id: account.id, role: account.role },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                token,
                user: {
                    id: account.id,
                    role: account.role,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    email: account.email,
                    shopName: account.shopName,
                    profile: account.profile,
                    stats: account.stats || {}
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'server_error' });
        }
    },


    // Request password reset
    requestPasswordReset: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.json({ message: "reset_email_sent_if_exists" });
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            await UserAuth.upsert({
                userId: user.id,
                passwordResetToken: hashedToken,
                passwordResetExpires: new Date(Date.now() + 3600000)
            });
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

            // 1. Token in der UserAuth Tabelle suchen & Verfallsdatum prüfen
            const authEntry = await UserAuth.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: new Date() }
                },
                include: [{ model: User, as: 'user' }] // Wir brauchen den User, um das PW zu ändern
            });

            if (!authEntry || !authEntry.user) {
                return res.status(400).json({ message: "invalid_or_expired_token" });
            }

            // 2. Neues Passwort im User-Model speichern
            const hashedPassword = await bcrypt.hash(password, 10);
            await authEntry.user.update({ password: hashedPassword });

            // 3. Token nach Erfolg löschen (Sicherheit!)
            await authEntry.update({
                passwordResetToken: null,
                passwordResetExpires: null
            });

            res.json({ message: "password_reset_success" });
        } catch (err) {
            console.error("Password reset error:", err);
            res.status(500).json({ message: "error_resetting_password" });
        }
    },

    // Update last online
    updateLastOnline: async (req, res) => {
        const { userId } = req.body;
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: "user_not_found" });
            }
            user.changed('updatedAt', true);
            await user.save();
            res.json({
                message: "last_online_updated",
                timestamp: user.updatedAt
            });
        } catch (err) {
            console.error("Error updating last online:", err);
            res.status(500).json({ message: "last_online_update_failed" });
        }
    }
};

module.exports = authController;
