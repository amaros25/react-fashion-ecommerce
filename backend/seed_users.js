const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcryptjs");

// MongoDB URI



const demoUsers = [
    {
        firstName: "Ahmed",
        lastName: "Ben Ali",
        email: "demo1@hotmail.fr",
        phone: [{ phone: 20123456 }],
        address: [{ address: "123 Rue de la Liberté", city: 0, subCity: 0 }] // Tunis
    },
    {
        firstName: "Fatima",
        lastName: "Zohra",
        email: "demo2@hotmail.fr",
        phone: [{ phone: 50987654 }],
        address: [{ address: "45 Avenue Habib Bourguiba", city: 1, subCity: 0 }]
    },
    {
        firstName: "Mohamed",
        lastName: "Amine",
        email: "demo3@hotmail.fr",
        phone: [{ phone: 98765432 }],
        address: [{ address: "12 Rue de Marseille", city: 0, subCity: 1 }]
    },
    {
        firstName: "Khadija",
        lastName: "Yasmine",
        email: "demo4@hotmail.fr",
        phone: [{ phone: 22334455 }],
        address: [{ address: "8 Boulevard Mohamed V", city: 2, subCity: 0 }]
    },
    {
        firstName: "Youssef",
        lastName: "Karim",
        email: "demo5@hotmail.fr",
        phone: [{ phone: 55667788 }],
        address: [{ address: "Immagon Building, Appt 4", city: 0, subCity: 2 }]
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for User Seeding");

        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

        for (const u of demoUsers) {
            // Check if user exists
            const existingUser = await User.findOne({ email: u.email });
            if (existingUser) {
                console.log(`User ${u.email} already exists. Skipping.`);
                continue;
            }

            const newUser = new User({
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                password: hashedPassword,
                phone: u.phone,
                address: u.address,
                active: true,
                isLoggedIn: false
            });

            await newUser.save();
            console.log(`Created user: ${u.firstName} ${u.lastName} (${u.email})`);
        }

        console.log("User seeding completed.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedUsers();
