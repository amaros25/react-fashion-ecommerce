const mongoose = require("mongoose");
const Product = require("./models/product");
const Seller = require("./models/seller");

// MongoDB URI
const MONGO_URI = "mongodb+srv://amaros:hQ.cLUQWM4nmcvx@products.uobdbkb.mongodb.net/online_shop?retryWrites=true&w=majority&appName=products";

// Seller Emails
const SELLER_EMAILS = [
    "Vendeur@hotmail.de",
    "Vendeur2@hotmail.de",
    "Vendeur3@hotmail.de"
];

// Defined Unique Products (One image per product)
const UNIQUE_PRODUCTS = [
    // Previous Products
    {
        image: "/assets/products/womens_dress.png",
        category: 0, // Women
        subcategory: 0, // Clothes
        name: "Floral Summer Dress",
        description: "Beautiful floral dress, perfect for summer days. Light and comfortable cotton fabric.",
        price: 45.00,
        delprice: 7.50,
        sizes: [
            { size: "S", stock: 10, color: "#FFC0CB" },
            { size: "M", stock: 15, color: "#FFC0CB" },
            { size: "L", stock: 5, color: "#FFC0CB" }
        ]
    },
    {
        image: "/assets/products/womens_dress_wall.png",
        category: 0, // Women
        subcategory: 0, // Clothes
        name: "Vintage Style Dress",
        description: "Chic vintage style dress. Great condition, very stylish for casual wear.",
        price: 55.00,
        delprice: 7.50,
        sizes: [
            { size: "M", stock: 8, color: "#FFFFFF" },
            { size: "L", stock: 8, color: "#FFFFFF" }
        ]
    },
    {
        image: "/assets/products/womens_blouse_beige.png",
        category: 0, // Women
        subcategory: 0, // Clothes
        name: "Elegant Beige Blouse",
        description: "Simple and elegant beige blouse. Versatile piece for work or casual outings.",
        price: 35.00,
        delprice: 6.00,
        sizes: [
            { size: "S", stock: 12, color: "#F5F5DC" },
            { size: "M", stock: 20, color: "#F5F5DC" },
            { size: "L", stock: 10, color: "#F5F5DC" }
        ]
    },
    {
        image: "/assets/products/mens_shirt.png",
        category: 1, // Men
        subcategory: 0, // Clothes
        name: "Classic Casual Shirt",
        description: "Men's button-down shirt. Classic fit, comfortable material. Good for everyday wear.",
        price: 40.00,
        delprice: 7.00,
        sizes: [
            { size: "M", stock: 10, color: "#87CEEB" },
            { size: "L", stock: 15, color: "#87CEEB" },
            { size: "XL", stock: 8, color: "#87CEEB" }
        ]
    },
    {
        image: "/assets/products/kids_dress.png",
        category: 2, // Kids
        subcategory: 0, // Girls Clothing
        name: "Colorful Girl's Dress",
        description: "Cute and colorful dress for girls. Soft fabric, perfect for playing and parties.",
        price: 25.00,
        delprice: 5.00,
        sizes: [
            { size: "4Y", stock: 5, color: "#FF69B4" },
            { size: "6Y", stock: 8, color: "#FF69B4" },
            { size: "8Y", stock: 6, color: "#FF69B4" }
        ]
    },
    // New Tunisian Shop Products
    {
        image: "/assets/products/tunisian_kaftan.png",
        category: 0, // Women
        subcategory: 0, // Clothes
        name: "Modern Tunisian Kaftan",
        description: "Beautiful modern Kaftan with traditional embroidery. Perfect for special occasions or elegant home wear. Handcrafted details.",
        price: 85.00,
        delprice: 8.00,
        sizes: [
            { size: "One Size", stock: 10, color: "#800020" }, // Burgundy
            { size: "One Size", stock: 5, color: "#000080" }  // Navy
        ]
    },
    {
        image: "/assets/products/mens_tunic.png",
        category: 1, // Men
        subcategory: 0, // Clothes
        name: "Traditional Men's Tunic",
        description: "Authentic Tunisian style men's tunic. Comfortable linen fabric, breathable and stylish. Traditional cut with a modern touch.",
        price: 60.00,
        delprice: 7.00,
        sizes: [
            { size: "L", stock: 12, color: "#F0E68C" }, // Khaki
            { size: "XL", stock: 10, color: "#F0E68C" },
            { size: "XXL", stock: 5, color: "#F0E68C" }
        ]
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Find Sellers
        const sellers = await Seller.find({ email: { $in: SELLER_EMAILS } });
        if (sellers.length === 0) {
            console.error("No sellers found with provided emails.");
            process.exit(1);
        }
        console.log(`Found ${sellers.length} sellers.`);

        // Distribute products among sellers
        let sellerIndex = 0;
        let successCount = 0;

        console.log(`Seeding ${UNIQUE_PRODUCTS.length} unique products...`);

        for (const pData of UNIQUE_PRODUCTS) {
            // Assign to seller in round-robin fashion
            const seller = sellers[sellerIndex];

            const productData = {
                ...pData,
                sellerId: seller._id,
                image: [pData.image], // Ensure array format
                type: "",
                discountedPercent: 0,
                states: [{ state: 1, createdAt: new Date() }] // 1 = Approved/Active
            };

            try {
                const product = new Product(productData);
                await product.save();
                console.log(`Created: ${pData.name} (Seller: ${seller.email})`);
                successCount++;
            } catch (err) {
                console.error(`Error saving product ${pData.name}: ${err.message}`);
            }

            // Move to next seller
            sellerIndex = (sellerIndex + 1) % sellers.length;
        }

        console.log(`\nSuccessfully seeded ${successCount} unique products!`);
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedProducts();
