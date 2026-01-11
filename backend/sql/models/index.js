const { sequelize } = require('../db');
const User = require('./user');
const UserAddress = require('./user_address');
const UserPhone = require('./user_phone');
const UserImage = require('./user_image');
const Seller = require('./seller');
const SellerAddress = require('./seller_address');
const SellerPhone = require('./seller_phone');
const SellerImage = require('./seller_image');
const Product = require('./product');
const ProductImage = require('./product_image');
const ProductSize = require('./product_size');
const ProductReview = require('./product_review');
const Section = require('./section');
const Banner = require('./banner');
const SectionProduct = require('./section_product');
const Order = require('./order');
const OrderItem = require('./order_item');
const OrderStatus = require('./order_status');
const SellerBill = require('./seller_bill');
const SellerReview = require('./seller_review');
const Chat = require('./chat');
const ChatMessage = require('./chat_message');

// Define Associations

// User History
User.hasMany(UserAddress, { foreignKey: 'userId', as: 'addresses' });
UserAddress.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserPhone, { foreignKey: 'userId', as: 'phones' });
UserPhone.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserImage, { foreignKey: 'userId', as: 'images' });
UserImage.belongsTo(User, { foreignKey: 'userId' });

// Seller History
Seller.hasMany(SellerAddress, { foreignKey: 'sellerId', as: 'addresses' });
SellerAddress.belongsTo(Seller, { foreignKey: 'sellerId' });
Seller.hasMany(SellerPhone, { foreignKey: 'sellerId', as: 'phones' });
SellerPhone.belongsTo(Seller, { foreignKey: 'sellerId' });
Seller.hasMany(SellerImage, { foreignKey: 'sellerId', as: 'images' });
SellerImage.belongsTo(Seller, { foreignKey: 'sellerId' });

// Section - Banner
Section.hasMany(Banner, { foreignKey: 'sectionId', as: 'banners' });
Banner.belongsTo(Section, { foreignKey: 'sectionId' });

// Section - Product (Many-to-Many via SectionProduct)
Section.belongsToMany(Product, { through: SectionProduct, as: 'offers', foreignKey: 'sectionId', otherKey: 'productId', scope: { type: 'offer' } });
Section.belongsToMany(Product, { through: SectionProduct, as: 'bestOrders', foreignKey: 'sectionId', otherKey: 'productId', scope: { type: 'bestOrder' } });
Section.belongsToMany(Product, { through: SectionProduct, as: 'popularCategories', foreignKey: 'sectionId', otherKey: 'productId', scope: { type: 'popularCategory' } });

// User - Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order - Items & Status
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Order.hasMany(OrderStatus, { foreignKey: 'orderId', as: 'statusUpdates' });
OrderStatus.belongsTo(Order, { foreignKey: 'orderId' });

// Seller - Product
Seller.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(Seller, { foreignKey: 'sellerId' });

// Product - Image & Size & Review
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(ProductSize, { foreignKey: 'productId', as: 'sizes' });
ProductSize.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(ProductReview, { foreignKey: 'productId', as: 'reviews' });
ProductReview.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(ProductReview, { foreignKey: 'userId' });
ProductReview.belongsTo(User, { foreignKey: 'userId' });

// Seller - Bills & Reviews
Seller.hasMany(SellerBill, { foreignKey: 'sellerId', as: 'bills' });
SellerBill.belongsTo(Seller, { foreignKey: 'sellerId' });
Seller.hasMany(SellerReview, { foreignKey: 'sellerId', as: 'reviews' });
SellerReview.belongsTo(Seller, { foreignKey: 'sellerId' });
User.hasMany(SellerReview, { foreignKey: 'userId' });
SellerReview.belongsTo(User, { foreignKey: 'userId' });

// Order - Chat
Order.hasMany(Chat, { foreignKey: 'orderId' });
Chat.belongsTo(Order, { foreignKey: 'orderId' });

// Chat - Messages
Chat.hasMany(ChatMessage, { foreignKey: 'chatId', as: 'messages' });
ChatMessage.belongsTo(Chat, { foreignKey: 'chatId' });

module.exports = {
    User, UserAddress, UserPhone, UserImage,
    Seller, SellerAddress, SellerPhone, SellerImage,
    Product, ProductImage, ProductSize, ProductReview,
    Section, Banner, SectionProduct,
    Order, OrderItem, OrderStatus,
    SellerBill, SellerReview,
    Chat, ChatMessage,
    sequelize
};
