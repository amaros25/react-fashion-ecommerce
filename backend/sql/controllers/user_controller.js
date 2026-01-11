const { User, UserAddress, UserPhone, UserImage, Seller, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

/**
 * Controller to handle user-related operations for MySQL
 */
const userController = {
    // GET: All users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({ attributes: { exclude: ['password'] } });
            res.json(users);
        } catch (error) {
            console.error('Error fetching all users:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // GET: User by ID with history formatting
    getUserById: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id, {
                include: [
                    { model: UserAddress, as: 'addresses', limit: 1, order: [['dateModified', 'DESC']] },
                    { model: UserPhone, as: 'phones', limit: 1, order: [['dateModified', 'DESC']] },
                    { model: UserImage, as: 'images', limit: 1, order: [['dateModified', 'DESC']] }
                ]
            });

            if (!user) return res.status(404).json({ message: "user_not_found" });

            const lastAddress = user.addresses[0] || {};
            const lastPhone = user.phones[0] || {};
            const lastImage = user.images[0] || {};

            res.json({
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: lastPhone.phone || "",
                address: lastAddress.address || "",
                city: lastAddress.city || 0,
                subCity: lastAddress.subCity || 0,
                active: user.active,
                image: lastImage.imageUrl || "",
            });
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // POST: Create a new user (Registration)
    createUser: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { firstName, lastName, email, password, phone, address, active, lastOnline } = req.body;

            if (!firstName || !lastName || !email || !password || !phone || !address) {
                return res.status(400).json({ message: "missing_data" });
            }

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) return res.status(400).json({ message: "user_exists_email" });

            const existingSeller = await Seller.findOne({ where: { email } });
            if (existingSeller) return res.status(400).json({ message: "seller_exists_email" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                active: active !== undefined ? active : true,
                lastOnline: lastOnline || new Date()
            }, { transaction: t });

            // Handle Phone History
            let phoneValue = typeof phone === 'object' ? phone.phone : phone;
            await UserPhone.create({ userId: user.id, phone: phoneValue }, { transaction: t });

            // Handle Address History
            let addrObj = typeof address === 'object' ? address : { address: address, city: 0, subCity: 0 };
            await UserAddress.create({
                userId: user.id,
                address: addrObj.address,
                city: addrObj.city,
                subCity: addrObj.subCity
            }, { transaction: t });

            await t.commit();
            res.status(201).json({ message: "user_created_successfully", userId: user.id });
        } catch (error) {
            await t.rollback();
            console.error('Error creating user:', error);
            res.status(500).json({ message: "register_user_failed" });
        }
    },

    // PATCH: Update user contact (history support)
    updateUser: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { address, phone } = req.body;
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: "user_not_found" });

            if (address) {
                await UserAddress.create({
                    userId: user.id,
                    address: address.address,
                    city: address.city,
                    subCity: address.subCity
                }, { transaction: t });
            }

            if (phone) {
                await UserPhone.create({ userId: user.id, phone }, { transaction: t });
            }

            await t.commit();
            res.json({ message: "user_updated_successfully", user });
        } catch (error) {
            await t.rollback();
            console.error('Error updating user:', error);
            res.status(500).json({ message: "server_error" });
        }
    },

    // PUT: Update user image (history support)
    updateUserImage: async (req, res) => {
        try {
            const { imageUrl } = req.body;
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json({ message: "user_not_found" });

            await UserImage.create({ userId: user.id, imageUrl });
            res.json({ message: "user_image_updated_successfully", user });
        } catch (error) {
            console.error('Error updating user image:', error);
            res.status(500).json({ message: "user_image_update_failed" });
        }
    }
};

module.exports = userController;
