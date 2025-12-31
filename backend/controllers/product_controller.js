const Product = require('../models/product')
const Order = require("../models/order");
const mongoose = require('mongoose');

// Return all top products
exports.getTopProducts = async (req, res) => {
  try {
    const top_products = await Product.find({ type: 'top' });
    res.json(top_products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Controller function to get new products with pagination and optional category filter
exports.getNewProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const category = req.query.category !== undefined ? Number(req.query.category) : null;
    const subcategory = req.query.subcategory !== undefined ? Number(req.query.subcategory) : null;

    const search = req.query.search;
    const not = req.query.not;
    const sortBy = req.query.sort || 'newest';
    const skip = (page - 1) * limit;


    // Filter erstellen
    const match = {};

    // CATEGORY FILTER (als number)
    if (category !== null && !isNaN(category)) {
      match.category = category;
    }

    // SUBCATEGORY FILTER (als number)
    if (subcategory !== null && !isNaN(subcategory)) {
      match.subcategory = subcategory;
    }

    if (not) match._id = { $ne: not };
    if (search) {
      const searchWords = search.trim().split(/\s+/);
      match.$and = searchWords.map(word => ({
        name: { $regex: word, $options: 'i' }
      }));
    }
    match.$expr = {
      $eq: [
        { $last: "$states.state" },
        1
      ]
    };

    // Aggregation Pipeline
    const pipeline = [
      { $match: match },
      {
        $addFields: {
          avgRating: { $avg: "$reviews.rating" } // Durchschnitt berechnen
        }
      }
    ];

    // Sortierung hinzufügen
    const addCreatedAtField = {
      $addFields: {
        createdAt: {
          $let: {
            vars: {
              stateOne: {
                $arrayElemAt: [
                  { $filter: { input: "$states", as: "s", cond: { $eq: ["$$s.state", 1] } } },
                  0
                ]
              }
            },
            in: "$$stateOne.createdAt"
          }
        }
      }
    };

    if (sortBy === 'price_asc') {
      pipeline.push({ $sort: { price: 1 } });
    } else if (sortBy === 'price_desc') {
      pipeline.push({ $sort: { price: -1 } });
    } else if (sortBy === 'rating') {
      pipeline.push(addCreatedAtField);
      // Sortierung: Produkte mit Bewertung zuerst, danach avgRating absteigend, dann Produkte ohne Bewertung ans Ende
      pipeline.push({
        $sort: {
          avgRating: -1,
          createdAt: -1 // optional: gleiche avgRating -> neueste zuerst
        }
      });
      // Produkte ohne Bewertung ans Ende verschieben
      pipeline.unshift({
        $addFields: {
          hasRating: { $cond: [{ $gt: [{ $size: "$reviews" }, 0] }, 1, 0] }
        }
      });
      pipeline.push({ $sort: { hasRating: -1, avgRating: -1, createdAt: -1 } });
    } else { // newest
      pipeline.push(addCreatedAtField);
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const new_products = await Product.aggregate(pipeline);
    // Total count für Pagination
    const total = await Product.countDocuments(match);
    const totalAllProducts = await Product.countDocuments();
    console.log("total", total);
    console.log("totalAllProducts", totalAllProducts);
    res.json({
      products: new_products,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      totalAllProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};




// Return Product by SellerID

exports.getProductBySellerID = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const filter = { sellerId: new mongoose.Types.ObjectId(sellerId) };

    // Suche nach Name oder Produktnummer
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { productNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Produkte des Verkäufers laden
    const totalCount = await Product.countDocuments(filter);
    console.log("totalCount", totalCount);
    // Use aggregation to sort by computed createdAt from states
    const products = await Product.aggregate([
      { $match: filter },
      {
        $addFields: {
          createdAt: {
            $let: {
              vars: {
                stateOne: {
                  $arrayElemAt: [
                    { $filter: { input: "$states", as: "s", cond: { $eq: ["$$s.state", 1] } } },
                    0
                  ]
                }
              },
              in: "$$stateOne.createdAt"
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    if (!products.length) {
      return res.json({
        products: [],
        totalCount: 0,
        page,
        totalPages: 1,
      });
    }


    // IDs der Produkte des Verkäufers
    const productIds = products.map(p => p._id);

    const rawOrders = await Order.find({
      "items.productId": { $in: productIds }
    })
      .select("orderNumber items status")
      .lean();


    rawOrders.forEach(o => {
      console.log("Order:", o.orderNumber);
      console.log("  ➤ Status:", o.status.map(s => s.update));
      console.log("  ➤ Produkte:", o.items.map(i => i.productId.toString()));
    });
    // Order-Aggregation: nur Bestellungen mit diesen Produkten und gültigem Status
    const orderCounts = await Order.aggregate([
      // 1️⃣ Nur Orders mit Items, die zu den Produkten des Verkäufers gehören
      { $match: { "items.productId": { $in: productIds } } },

      // 2️⃣ Items auseinandernehmen
      { $unwind: "$items" },

      // 3️⃣ Nur Items zählen, die zum Verkäufer gehören
      { $match: { "items.productId": { $in: productIds } } },

      // 4️⃣ Gruppieren pro Produkt-ID
      {
        $group: {
          _id: "$items.productId",
          count: { $sum: 1 }, // Menge summieren, oder $sum: 1 für Anzahl der Bestellungen
        },
      },
    ]);

    // Map erstellen
    const orderCountMap = {};
    orderCounts.forEach((oc) => {
      orderCountMap[oc._id.toString()] = oc.count;
    });

    // Produkte mit ihren Bestellmengen zusammenbauen
    const productsWithOrderCount = products.map((p) => ({
      ...p,
      orderCount: orderCountMap[p._id.toString()] || 0,
    }));

    // ✅ Rückgabe
    res.json({
      products: productsWithOrderCount,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });

  } catch (error) {
    console.error("❌ Fehler beim Laden der Produkte:", error);
    res.status(500).json({ message: "Fehler beim Laden der Produkte", error });
  }
};


// Add a new Product
// Add a new Product
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    // Automatisch ersten Status (1) setzen
    productData.states = [{ state: 1, createdAt: Date.now() }];

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error });
  }
};

// Add a new Review
exports.addReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const { userId, rating, comment } = req.body;

    const hasBought = await Order.findOne({
      userId,
      "items.productId": productId,
      "status.update": { $in: [3, 6, 24, 41] }
    });
    const product = await Product.findById(productId);
    const exists = product.reviews.find(r => r.user.toString() === userId);

    if (exists) {
      return res.status(400).json({ message: "review_already_exists_error" });
    }
    product.reviews.push({
      user: userId,
      rating,
      comment,
    });

    await product.save();

    res.json({ message: "success_add_review", reviews: product.reviews });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "failed_to_add_review_error" });
  }
};


// Return Product by ID
exports.getProductByID = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Return Products by IDs

exports.getProductsByIDs = async (req, res) => {
  const { ids } = req.query;
  if (!ids) {
    return res.status(400).json({ message: "No product IDs provided" });
  }

  const productIds = ids.split(',');

  try {
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({ message: "Products not found" });
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};