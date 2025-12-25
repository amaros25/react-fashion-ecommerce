const mongoose = require("mongoose");
const Seller = require("./models/seller");
const bcrypt = require("bcryptjs");

// MongoDB URI


const demoSellers = [
    {
        email: "Vendeur@hotmail.de",
        firstName: "Karim",
        lastName: "Ben Mosbah",
        shopName: "Tunisian Crafts",
        address: [{ address: "10 Rue de la Culture", city: 0, subCity: 0 }],
        phone: [{ phone: 50112233 }],
        image: "https://res.cloudinary.com/ddclvkost/image/upload/v1765124951/jmzopvqag7fmspgmpeoo.jpg" // Using one of the migrated images as avatar or placeholder
    },
    {
        email: "Vendeur2@hotmail.de",
        firstName: "Leila",
        lastName: "Trabelsi",
        shopName: "Mode Moderne",
        address: [{ address: "25 Avenue de Paris", city: 0, subCity: 1 }],
        phone: [{ phone: 98776655 }],
        image: "/default-avatar.png"
    },
    {
        email: "Vendeur3@hotmail.de",
        firstName: "Sami",
        lastName: "Gharbi",
        shopName: "Kids World",
        address: [{ address: "5 Boulevard Hedi Chaker", city: 1, subCity: 0 }],
        phone: [{ phone: 22889900 }],
        image: "/default-avatar.png"
    }
];

const seedSellers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Seller Seeding");

        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

        for (const s of demoSellers) {
            // Check if seller exists
            const existingSeller = await Seller.findOne({ email: s.email });
            if (existingSeller) {
                console.log(`Seller ${s.email} already exists. Skipping.`);
                continue;
            }

            const newSeller = new Seller({
                firstName: s.firstName,
                lastName: s.lastName,
                shopName: s.shopName,
                email: s.email,
                password: hashedPassword,
                phone: s.phone,
                address: s.address,
                image: s.image,
                active: true,
                reviews: []
            });

            await newSeller.save();
            console.log(`Created seller: ${s.shopName} (${s.email})`);
        }

        console.log("Seller seeding completed.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedSellers();
