const Order = require('../models/order')
const User = require('../models/user');
const Product = require('../models/product');
 
 
// Return Order by ID
exports.getOrderByID = async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        if (!order){
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }catch(error){
      res.status(500).json({ message: 'Error fetching order', error });  
    }
};
 
// Return Order by SellerID
 


// Return paginated Orders by SellerID with user and product details
exports.getOrderBySellerID = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const page = parseInt(req.query.page) || 1; // Default Seite 1
    const limit = parseInt(req.query.limit) || 20; // Default 20 pro Seite
    const { status, orderNumber } = req.query; 
 

    if (!sellerId) {
      return res.status(400).json({ message: 'sellerId wird benötigt' });
    }

    const query = { sellerId };
    if (status) {
      query["status.update"] = status; // Letzter Status in der Liste prüfen
    }
    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: "i" };
    }

    // Gesamtanzahl der Bestellungen für Pagination
    const totalCount = await Order.countDocuments(query);

    if (totalCount === 0) {
      return res.status(404).json({ message: 'Keine Bestellungen für diesen Verkäufer gefunden' });
    }

    // Bestellungen mit Pagination abrufen
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Alle UserIds aus den Bestellungen sammeln
    const userIds = [...new Set(orders.map(o => o.userId.toString()))];
 
    // Userdaten abrufen
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const usersMap = {};
    users.forEach(u => {
      usersMap[u._id.toString()] = u;
    });
     // Alle Produkt-IDs sammeln
    const productIds = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        productIds.push(item.productId.toString());
      });
    });
    const uniqueProductIds = [...new Set(productIds)];
     // Produktdaten abrufen
    const products = await Product.find({ _id: { $in: uniqueProductIds } }).lean();
    const productsMap = {};
    products.forEach(p => {
      productsMap[p._id.toString()] = p;
    });

    // Bestellungen mit User- und Produktdetails anreichern
    const enrichedOrders = orders.map(order => ({
      ...order,
      user: usersMap[order.userId.toString()] || null,
      items: order.items.map(item => ({
        ...item,
        product: productsMap[item.productId.toString()] || null,
      })),
    }));
     // Antwort mit paginierten und angereicherten Bestellungen
    res.json({
      orders: enrichedOrders,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Fehler beim Laden der Bestellungen:', error);
    res.status(500).json({ message: 'Serverfehler beim Laden der Bestellungen', error });
  }
};

//exports.getOrderBySellerID = async (req, res) => {
 // try {
  //  const orders = await Order.find({ sellerId: req.params.sellerId });
  //  if (orders.length === 0) {
  //    return res.status(404).json({ message: 'No orders found for this seller' });
 //   }
  //  res.json(orders);
 // } catch (error) {
  //  res.status(500).json({ message: 'Error fetching orders', error });
 // }
//};

// Return Orders by UserID
  exports.getOrderByUserID = async (req, res) => {
    try {
      const userId = req.params.id; // Korrekt, weil Route /user/:id
      const orders = await Order.find({ userId });


      if (orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }

      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error });
    }
  };

// Add a new Order
exports.createOrder = async(req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error adding order', error });
    }
};

 // Update order status by order ID
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;  // Die Bestellung ID aus der URL
    const { status } = req.body;    // Der neue Status kommt aus dem Request-Body
    console.log("🟢 updateOrderStatus orderId: ", orderId);
    console.log("🟢 updateOrderStatus  status: ", status);
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Falls die Bestellung noch keinen Status hat, initialisiere das Array
    if (!order.status) {
      order.status = [];
    }

    // Füge den neuen Status als historisches Update hinzu
    order.status.push({ date: new Date(), update: status });

    // Speichere die geänderte Bestellung
    await order.save();

    // Rückgabe der aktualisierten Bestellung als Antwort
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error });
  }
};
