const mongoose = require("mongoose");
const Product = require("./models/product");
const Seller = require("./models/seller");

// MongoDB URI

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
    // Round 1 Tunisian Shop Products
    {
        image: "/assets/products/tunisian_jeans_shop.png",
        category: 1, // Men
        subcategory: 0, // Clothes
        name: "Jean Denim Tunisien",
        description: "Jean denim de haute qualité, photographié dans une boutique locale. Coupe confortable et durable. Style authentique.",
        price: 65.00,
        delprice: 7.00,
        sizes: [
            { size: "30", stock: 5, color: "#00008B" }, // Dark Blue
            { size: "32", stock: 8, color: "#00008B" },
            { size: "34", stock: 6, color: "#00008B" }
        ]
    },
    {
        image: "/assets/products/tunisian_kaftan_rack.png",
        category: 0, // Women
        subcategory: 0, // Clothes
        name: "Kaftan Traditionnel",
        description: "Kaftan traditionnel tunisien avec broderie exquise. Parfait pour les occasions spéciales ou la maison. Élégant et confortable.",
        price: 89.00,
        delprice: 8.00,
        sizes: [
            { size: "One Size", stock: 12, color: "#FFFFFF" }
        ]
    },
    {
        image: "/assets/products/tunisian_leather_bag_wall.png",
        category: 0, // Women
        subcategory: 2, // Bags
        name: "Sac en Cuir Artisanal",
        description: "Sac à main en cuir véritable fait main. Design unique avec motifs traditionnels gravés. Qualité supérieure.",
        price: 120.00,
        delprice: 10.00,
        sizes: [
            { size: "Standard", stock: 4, color: "#8B4513" } // Saddle Brown
        ]
    },
    {
        image: "/assets/products/tunisian_mens_shirt_shop.png",
        category: 1, // Men
        subcategory: 0, // Clothes
        name: "Chemise en Lin",
        description: "Chemise en lin légère et respirante. Style décontracté chic, idéal pour le climat méditerranéen. Fabriqué en Tunisie.",
        price: 55.00,
        delprice: 6.00,
        sizes: [
            { size: "M", stock: 8, color: "#F0E68C" }, // Khaki
            { size: "L", stock: 10, color: "#F0E68C" },
            { size: "XL", stock: 7, color: "#F0E68C" }
        ]
    },
    // Round 2 Tunisian Shop Products (Added Djebba & Fouta)
    {
        image: "/assets/products/tunisian_djebba_wall.png",
        category: 1, // Men
        subcategory: 0, // Clothes (Traditional)
        name: "Djebba Tunisienne",
        description: "Djebba en laine traditionnelle de couleur beige. Un vêtement authentique et confortable, idéal pour les fêtes. Fabriqué artisanalement.",
        price: 140.00,
        delprice: 12.00,
        sizes: [
            { size: "One Size", stock: 10, color: "#F5F5DC" } // Beige
        ]
    },
    {
        image: "/assets/products/tunisian_fouta_stack.png",
        category: 0, // Women (Unisex check? Fouta is often home/beach, putting in Women for now or Accessories if exists)
        subcategory: 3, // Accessories (Assuming 3 is generic or accessories, checking valid subcategories... if not sure, use 0 clothes or 2 bags? Let's use 0 clothes/beachwear equivalent or check constants. Assuming 0 is safe.)
        // Actually, Fouta fits well in Home or Accessories. Let's put in Women -> Clothes for Beachwear implied.
        name: "Fouta Artisanale",
        description: "Fouta tunisienne en coton 100%. Tissage traditionnel, parfait pour la plage ou le bain. Couleurs pastel douces.",
        price: 25.00,
        delprice: 5.00,
        sizes: [
            { size: "100x200cm", stock: 30, color: "#FFB7C5" } // Multi
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
                // Check if product with same name exists to avoid duplicates if re-run (optional, but good practice)
                const existing = await Product.findOne({ name: pData.name });
                if (!existing) {
                    const product = new Product(productData);
                    await product.save();
                    console.log(`Created: ${pData.name} (Seller: ${seller.email})`);
                    successCount++;
                } else {
                    console.log(`Skipped: ${pData.name} (Already exists)`);
                }
            } catch (err) {
                console.error(`Error saving product ${pData.name}: ${err.message}`);
            }

            // Move to next seller
            sellerIndex = (sellerIndex + 1) % sellers.length;
        }

        console.log(`\nSuccessfully seeded ${successCount} new products!`);
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedProducts();
