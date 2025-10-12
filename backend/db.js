require('dotenv').config({ path: './backend/.env' });
 
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

console.log("=============> MONGO_URI:", uri);

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
