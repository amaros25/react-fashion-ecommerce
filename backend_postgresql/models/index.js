const { sequelize } = require('../db');
const User = require('./user');
const Product = require('./product');
const ProductReview = require('./product_review');
const Order = require('./order');
const SellerBill = require('./seller_bill');
const UserReview = require('./user_review');
const Chat = require('./chat');
const ChatMessage = require('./chat_message');
const UserStats = require('./user_stats');
const UserAuth = require('./user_auth');
const UserProfileHistory = require('./user_profile_history');
const OrderStatusHistory = require('./order_status_history');
const ProductVariant = require('./product_variant');
const ProductStatusHistory = require('./product_status_history');
const OrderItem = require('./order_item');
// Define Associations

/// USER 
// User - UserStats
User.hasOne(UserStats, { foreignKey: 'userId', as: 'stats' });
UserStats.belongsTo(User, { foreignKey: 'userId' });

// User - UserAuth
User.hasOne(UserAuth, { foreignKey: 'userId', as: 'auth' });
UserAuth.belongsTo(User, { foreignKey: 'userId' });

// User - UserProfileHistory
User.hasMany(UserProfileHistory, { foreignKey: 'userId', as: 'history' });
UserProfileHistory.belongsTo(User, { foreignKey: 'userId' });

// User - Order
User.hasMany(Order, { foreignKey: 'userId', as: 'buyerOrders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });

// User - Order (Verkäufer)
User.hasMany(Order, { foreignKey: 'sellerId', as: 'sales' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// User - Product Review
User.hasMany(ProductReview, { foreignKey: 'userId', as: 'productReviews' });
ProductReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });

//User - can have Review
User.hasMany(UserReview, { foreignKey: 'receiverId', as: 'receivedReviews' });
UserReview.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// User - can make many Reviews
User.hasMany(UserReview, { foreignKey: 'senderId', as: 'sentReviews' });
UserReview.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// User (Seller) - Product
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });


/// ORDER 
// Order - OrderStatusHistory
Order.hasMany(OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId', as: 'orderItems' });

OrderItem.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
OrderItem.hasMany(ProductReview, { foreignKey: 'productId', sourceKey: 'productId', as: 'reviews' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'variantId' });
// Product - Review
Product.hasMany(ProductVariant, { as: 'variants', foreignKey: 'productId' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductStatusHistory, { as: 'statusHistory', foreignKey: 'productId' });
ProductStatusHistory.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductReview, { foreignKey: 'productId', as: 'reviews' });
ProductReview.belongsTo(Product, { foreignKey: 'productId' });

// User (Seller) - Bills & Reviews
User.hasMany(SellerBill, { foreignKey: 'sellerId', as: 'bills' });
SellerBill.belongsTo(User, { foreignKey: 'sellerId' });
SellerBill.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Order - Chat
Order.hasMany(Chat, { foreignKey: 'orderId' });
Chat.belongsTo(Order, { foreignKey: 'orderId' });

// Product - Chat
Product.hasMany(Chat, { foreignKey: 'productId' });
Chat.belongsTo(Product, { foreignKey: 'productId' });

Order.hasOne(UserReview, { foreignKey: 'orderId', as: 'sellerReview' });
UserReview.belongsTo(Order, { foreignKey: 'orderId' });
// Chat - Messages
Chat.hasMany(ChatMessage, { foreignKey: 'chatId', as: 'messages' });
ChatMessage.belongsTo(Chat, { foreignKey: 'chatId' });

// Chat - User (Participants)
Chat.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Chat.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });


module.exports = {
    User,
    UserStats,
    UserAuth,
    UserProfileHistory,
    UserReview,
    Product,
    ProductReview,
    Order,
    SellerBill,
    Chat,
    ChatMessage,
    OrderStatusHistory,
    ProductVariant,
    ProductStatusHistory,
    OrderItem,
    sequelize,

};
