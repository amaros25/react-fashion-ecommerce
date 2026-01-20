const { User, UserStats, UserAuth } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/emailService');
const { Op } = require('sequelize');
require('dotenv').config({ path: './backend_postgresql/.env' });
const { handleError } = require('./error_handler.js');

const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const account = await User.findOne({
                where: { email },
                include: [{ model: UserStats, as: 'stats' }]
            });

            if (!account) throw new Error('user_not_found');

            const isMatch = await bcrypt.compare(password, account.password);
            if (!isMatch) throw new Error('wrong_password');

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
            await handleError(res, error, null, "login_error");
        }
    },

    requestPasswordReset: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) throw new Error('user_not_found');

            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

            await UserAuth.upsert({
                userId: user.id,
                passwordResetToken: hashedToken,
                passwordResetExpires: new Date(Date.now() + 3600000)
            });

            await sendPasswordResetEmail(email, resetToken);
            res.json({ message: "reset_email_sent_if_exists" });
        } catch (err) {
            await handleError(res, err, null, "error_sending_reset_email");
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;
        try {
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            const authEntry = await UserAuth.findOne({
                where: {
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { [Op.gt]: new Date() }
                },
                include: [{ model: User, as: 'user' }]
            });

            if (!authEntry || !authEntry.user) throw new Error('invalid_or_expired_token');

            const hashedPassword = await bcrypt.hash(password, 10);
            await authEntry.user.update({ password: hashedPassword });
            await authEntry.update({
                passwordResetToken: null,
                passwordResetExpires: null
            });

            res.json({ message: "password_reset_success" });
        } catch (err) {
            await handleError(res, err, null, "error_resetting_password");
        }
    },

    updateLastOnline: async (req, res) => {
        const { userId } = req.body;
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('user_not_found');
            await user.touch();
            res.json({
                message: "last_online_updated",
                timestamp: user.updatedAt
            });
        } catch (err) {
            await handleError(res, err, null, "last_online_update_failed");
        }
    }
};

module.exports = authController;