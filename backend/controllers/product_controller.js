const Product = require('../models/product')

// Return all top products
exports.getTopProducts = async (req, res) => {
  try {
    const top_products = await Product.find({type: 'top'});
    res.json(top_products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Controller function to get new products with pagination and optional category filter
exports.getNewProducts = async (req, res) => {
  try {
    // Extract page, limit, and category from the request query parameters
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page is provided
    const limit = parseInt(req.query.limit) || 12;  // Default to 12 products per page if not specified
    const category = req.query.category;  // Category filter (if any)
    const search = req.query.search;  // Suchbegriff aus Query
    const skip = (page - 1) * limit;  // Calculate how many items to skip for pagination
    console.log("🟢 search: ", search);
    // Initialize an empty filter object
    const filter = {};

    // If a category is provided in the query, add it to the filter
    if (category) {
      filter.category = category;
    }

    if (search) {
      // Suche Wörter splitten (nach Leerzeichen)
      const searchWords = search.trim().split(/\s+/);

      // Für jedes Wort ein RegExp Match im Feld "name" (case insensitive)
      filter.$and = searchWords.map(word => ({
        name: { $regex: word, $options: 'i' }
      }));
    }
    // Get the total number of products that match the filter (to calculate pagination)
    const total = await Product.countDocuments(filter);

    // Get the total number of products without any filters (i.e., all products in the database)
    const totalAllProducts = await Product.countDocuments();  // Total products without any filters

    // Get the actual products based on the filter, sorting by creation date in descending order
    // Skip products based on the current page, and limit to the specified number per page
    const new_products = await Product.find(filter)
      .sort({ createdAt: -1 })  // Sort products by creation date (newest first)
      .skip(skip)  // Skip the products that are already on previous pages
      .limit(limit);  // Limit to the number of products per page

    // Send the response with the products, pagination info (current page, total pages, and total items)
    res.json({
      products: new_products,
      page,  // Current page
      totalPages: Math.ceil(total / limit),  // Calculate total pages
      totalItems: total,  // Total number of matching products
      totalAllProducts,  // Total number of products in the database (without filter)
    });
  } catch (error) {
    // If there's an error, return a 500 status with the error message
    res.status(500).json({ message: 'Error fetching products', error });
  }
};


// Return Product by ID
exports.getProductByID = async (req, res) => {
    try{
        const product = await Product.findById(req.params.id);
        if (!product){
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    }catch(error){
      res.status(500).json({ message: 'Error fetching product', error });  
    }
};
 
// Return Product by SellerID
exports.getProductBySellerID = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId });
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this seller' });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Add a new Product
exports.createProduct = async(req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
};