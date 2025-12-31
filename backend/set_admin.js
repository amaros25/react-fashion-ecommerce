const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const emailToPromote = process.argv[2];
let mongoUri = process.env.MONGO_URI;

// Allow passing URI as 3rd argument if not in .env
if (!mongoUri && process.argv[3]) {
    mongoUri = process.argv[3];
}

if (!emailToPromote) {
    console.error("Usage: node set_admin.js <email> [mongo_uri]");
    process.exit(1);
}

if (!mongoUri) {
    console.error("Error: MONGO_URI not found in .env and not provided as argument.");
    console.error("Please provide your MongoDB connection string as the second argument.");
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(async () => {
        console.log("Connected to MongoDB");
        const user = await User.findOne({ email: emailToPromote });
        if (user) {
            user.role = "admin";
            await user.save();
            console.log(`User ${emailToPromote} is now an ADMIN.`);
        } else {
            console.log(`User with email ${emailToPromote} not found.`);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
