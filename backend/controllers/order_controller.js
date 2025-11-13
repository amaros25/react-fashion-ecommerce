const Order = require('../models/order')

 
 
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
exports.getOrderBySellerID = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.sellerId });
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Return Orders by UserID
exports.getOrderByUserID = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.params.userId });
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

    const hasOtherStatuses = order.status.length > 1 || (order.status.length === 1 && order.status[0].update !== "pending");

    if (status === "confirmed" && hasOtherStatuses) {
      return res.status(400).json({ message: "Order cannot be confirmed, because it has already been updated to another status." });
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
