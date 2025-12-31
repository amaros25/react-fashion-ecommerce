const mongoose = require('mongoose')
const Order = require('../models/order')
const User = require('../models/user');
const Product = require('../models/product');

exports.getOrderByID = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

exports.getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order by number:', error);
    res.status(500).json({ message: 'Error fetching order', error });
  }
};

exports.getOrderBySellerID = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const page = parseInt(req.query.page) || 1; 1
    const limit = parseInt(req.query.limit) || 20;
    const { status, orderNumber } = req.query;


    if (!sellerId) {
      return res.status(400).json({ message: 'sellerId wird benötigt' });
    }

    const query = { sellerId };
    if (status) {
      query["status.update"] = status;
    }
    if (orderNumber) {
      query.orderNumber = { $regex: orderNumber, $options: "i" };
    }
    const totalCount = await Order.countDocuments(query);

    if (totalCount === 0) {
      return res.status(404).json({ message: 'Keine Bestellungen für diesen Verkäufer gefunden' });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const userIds = [...new Set(orders.map(o => o.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const usersMap = {};
    users.forEach(u => {
      usersMap[u._id.toString()] = u;
    });
    const productIds = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        productIds.push(item.productId.toString());
      });
    });
    const uniqueProductIds = [...new Set(productIds)];
    const products = await Product.find({ _id: { $in: uniqueProductIds } }).lean();
    const productsMap = {};
    products.forEach(p => {
      productsMap[p._id.toString()] = p;
    });

    const enrichedOrders = orders.map(order => ({
      ...order,
      user: usersMap[order.userId.toString()] || null,
      items: order.items.map(item => ({
        ...item,
        product: productsMap[item.productId.toString()] || null,
      })),
    }));
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

exports.getOrderByUserID = async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments({ userId });
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({
      page,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error adding order', error });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!order.status) {
      order.status = [];
    }

    // Wenn Status auf "Bestätigt" (1) gesetzt wird, Stock abziehen
    if (status === 1) {
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId, "sizes.size": item.size, "sizes.color": item.color },
          { $inc: { "sizes.$.stock": -item.quantity } }
        );
      }
    }

    order.status.push({ date: new Date(), update: status });
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("❌ Fehler beim Update des Bestellstatus:", error);
    res.status(500).json({ message: "Error updating order status", error });
  }
};

exports.getOrderCountByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "productId wird benötigt" });
    }
    const count = await Order.countDocuments({ "items.productId": productId });
    res.status(200).json({
      productId,
      totalOrders: count,
    });
  } catch (error) {
    console.error("Fehler beim Zählen der Bestellungen:", error);
    res.status(500).json({
      message: "Serverfehler beim Zählen der Bestellungen",
      error,
    });
  }
};

exports.getSellerOrderStats = async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) {
      return res.status(400).json({ message: "sellerId wird benötigt" });
    }
    const orders = await Order.find({ sellerId }).select("status").lean();
    const totalOrders = orders.length;
    const openStatuses = [0]; // 0 = Pending
    const openOrders = orders.filter(order => {
      const lastStatus = order.status?.length ? order.status[order.status.length - 1].update : 0;
      return openStatuses.includes(lastStatus);
    });

    res.json({
      totalOrders,
      openOrders: openOrders.length
    });

  } catch (error) {
    console.error("Fehler beim Laden der Order Stats:", error);
    res.status(500).json({ message: "Fehler beim Laden der Order Stats", error });
  }
};
