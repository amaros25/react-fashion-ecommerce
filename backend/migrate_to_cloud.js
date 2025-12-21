const mongoose = require("mongoose");
const Product = require("./models/product");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

// MongoDB URI (from seed_products.js)

// Cloudinary Config (Load from env or fallback if missing in process.env context)
// Note: In react-scripts, these are REACT_APP_... but dotenv will load them if in .env
const CLOUD_NAME = process.env.REACT_APP_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Missing Cloudinary Config. Make sure .env has REACT_APP_CLOUD_NAME and REACT_APP_UPLOAD_PRESET");
    // Attempt to read .env manually if dotenv doesn't pick up REACT_APP_ prefixed vars by default (standard dotenv should)
}

// Function to upload file to Cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append("file", fileStream);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
            }
        );
        return res.data.secure_url;
    } catch (err) {
        console.error("Cloudinary upload error:", err.response ? err.response.data : err.message);
        throw err;
    }
};

const migrateImages = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB for Migration");

        // Find products with images that are local paths (start with /assets/)
        // Adjust query if images are array or string. Schema says [String].
        const products = await Product.find({
            image: { $elemMatch: { $regex: /^\/assets\// } }
        });

        console.log(`Found ${products.length} products with local images.`);

        for (const product of products) {
            console.log(`Processing product: ${product.name}`);
            const newImages = [];
            let changed = false;

            for (const imgPath of product.image) {
                if (imgPath.startsWith("/assets/")) {
                    // Start path resolution from project root "public" folder
                    // Assumes script runs from project root or handles path correctly.
                    // If imgPath is "/assets/products/foo.png", local file is "public/assets/products/foo.png"
                    const localPath = path.join(__dirname, "..", "public", imgPath.replace(/^\//, ""));

                    if (fs.existsSync(localPath)) {
                        console.log(`  Uploading ${localPath}...`);
                        try {
                            const cloudUrl = await uploadToCloudinary(localPath);
                            console.log(`    -> Uploaded to: ${cloudUrl}`);
                            newImages.push(cloudUrl);
                            changed = true;
                        } catch (uploadErr) {
                            console.error(`    -> Failed to upload ${localPath}, keeping local path.`);
                            newImages.push(imgPath);
                        }
                    } else {
                        console.warn(`    -> File not found locally: ${localPath}, keeping path.`);
                        newImages.push(imgPath);
                    }
                } else {
                    newImages.push(imgPath);
                }
            }

            if (changed) {
                product.image = newImages;
                await product.save();
                console.log(`  Updated product ${product.name} in DB.`);
            }
        }

        console.log("Migration completed.");
        process.exit(0);

    } catch (err) {
        console.error("Migration Error:", err);
        process.exit(1);
    }
};

migrateImages();
